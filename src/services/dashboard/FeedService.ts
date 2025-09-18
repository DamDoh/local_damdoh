/**
 * Feed Service - Microservice for managing community feed data and operations
 * Handles feed fetching, posting, interactions, and AI-powered curation
 */

import { apiCall } from '@/lib/api-utils';

export interface Post {
  id: number;
  author: string;
  avatar: string;
  verified: boolean;
  time: string;
  content: string;
  type: string;
  likes: number;
  comments: Comment[];
  commentCount: number;
  shares: number;
  engagement: string;
  highlight?: boolean;
  location?: string;
  tags?: string[];
  reactions?: {[key: string]: number};
  media?: {type: 'image' | 'video', url: string, thumbnail?: string};
  aiGenerated?: boolean;
  expertVerified?: boolean;
  marketplaceData?: {product: string, price: string, available: boolean};
  aiScore?: number; // AI relevance score
}

export interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  time: string;
  verified: boolean;
}

export interface FeedFilter {
  type: 'all' | 'smart' | 'local' | 'experts' | 'market' | 'trending';
  location?: string;
  userInterests?: string[];
  stakeholderType?: string;
}

export class FeedService {
  private static instance: FeedService;
  private cache: Map<string, { data: Post[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): FeedService {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService();
    }
    return FeedService.instance;
  }

  /**
   * Fetch feed posts with optional filtering and AI curation
   */
  async fetchFeed(filter: FeedFilter = { type: 'all' }): Promise<Post[]> {
    const cacheKey = this.generateCacheKey(filter);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return this.applyClientSideFiltering(cached.data, filter);
    }

    try {
      const response = await apiCall<{ posts?: Post[], data?: Post[] }>('/community/feed');
      const posts: Post[] = Array.isArray(response)
        ? response
        : response.posts || response.data || [];

      // Cache the raw data
      this.cache.set(cacheKey, { data: posts, timestamp: Date.now() });

      return this.applyClientSideFiltering(posts, filter);
    } catch (error) {
      console.error('Error fetching feed:', error);
      // Return cached data if available, even if expired
      if (cached) {
        return this.applyClientSideFiltering(cached.data, filter);
      }
      throw error;
    }
  }

  /**
   * Create a new post
   */
  async createPost(content: string, media?: File, pollData?: { text: string }[]): Promise<Post> {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', 'GENERAL');

      if (media) {
        formData.append('media', media);
      }

      if (pollData) {
        formData.append('pollOptions', JSON.stringify(pollData));
      }

      const response = await apiCall<{ post?: Post }>('/community/posts', {
        method: 'POST',
        body: formData,
        headers: {
          // Let browser set Content-Type for FormData
        }
      });

      // Invalidate cache
      this.invalidateCache();

      return response.post || (response as Post);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: number): Promise<void> {
    try {
      await apiCall(`/community/posts/${postId}/like`, {
        method: 'POST'
      });

      // Update cache optimistically
      this.updatePostInCache(postId, post => ({
        ...post,
        likes: post.likes + 1
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  /**
   * Add comment to a post
   */
  async addComment(postId: number, content: string, authorName: string, authorAvatar: string): Promise<Comment> {
    try {
      const response = await apiCall<{ comment?: { id: number } }>(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });

      const newComment: Comment = {
        id: response.comment?.id || Date.now(),
        author: authorName,
        avatar: authorAvatar,
        content,
        time: 'now',
        verified: true
      };

      // Update cache optimistically
      this.updatePostInCache(postId, post => ({
        ...post,
        comments: [...(post.comments || []), newComment],
        commentCount: (post.commentCount || 0) + 1
      }));

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Search posts
   */
  async searchPosts(query: string, filters?: Partial<FeedFilter>): Promise<Post[]> {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.location && { location: filters.location })
      });

      const response = await apiCall<{ posts?: Post[], results?: Post[] }>(`/community/search?${searchParams}`);
      return response.posts || response.results || [];
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  /**
   * Apply client-side filtering and AI scoring (public method)
   */
  applyClientSideFiltering(posts: Post[], filter: FeedFilter): Post[] {
    let filtered = [...posts];

    switch (filter.type) {
      case 'local':
        filtered = filtered.filter(post =>
          post.location === filter.location ||
          post.location?.toLowerCase().includes(filter.location?.toLowerCase() || '')
        );
        break;

      case 'experts':
        filtered = filtered.filter(post =>
          post.verified || post.expertVerified || post.type === 'expert'
        );
        break;

      case 'market':
        filtered = filtered.filter(post =>
          post.type === 'market_alert' ||
          post.marketplaceData ||
          post.tags?.some(tag => tag.toLowerCase().includes('market'))
        );
        break;

      case 'smart':
        // Apply AI scoring based on user interests
        filtered = filtered
          .map(post => ({
            ...post,
            aiScore: this.calculateAIScore(post, filter)
          }))
          .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
          .slice(0, 20);
        break;

      case 'trending':
        // Sort by engagement
        filtered = filtered
          .sort((a, b) => {
            const aScore = (a.likes || 0) + (a.comments?.length || 0) * 2 + (a.shares || 0) * 3;
            const bScore = (b.likes || 0) + (b.comments?.length || 0) * 2 + (b.shares || 0) * 3;
            return bScore - aScore;
          })
          .slice(0, 15);
        break;
    }

    return filtered;
  }

  /**
   * Calculate AI relevance score for smart filtering
   */
  private calculateAIScore(post: Post, filter: FeedFilter): number {
    let score = 0.5; // Base score

    // Location relevance
    if (post.location === filter.location) score += 0.2;

    // Content category matching
    const postContent = `${post.content} ${post.tags?.join(' ') || ''}`.toLowerCase();
    filter.userInterests?.forEach(interest => {
      if (postContent.includes(interest.toLowerCase())) score += 0.15;
    });

    // Stakeholder type relevance
    if (filter.stakeholderType === 'Farmer' && post.type === 'farming') score += 0.1;
    if (filter.stakeholderType === 'Financial Institution' && post.type === 'finance') score += 0.1;
    if (filter.stakeholderType === 'Crowdfunder' && post.type === 'project') score += 0.1;

    // Engagement bonus
    const engagement = (post.likes || 0) + (post.comments?.length || 0) + (post.shares || 0);
    score += Math.min(engagement * 0.01, 0.2);

    // Verified content bonus
    if (post.verified || post.expertVerified) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Generate cache key for filtering
   */
  private generateCacheKey(filter: FeedFilter): string {
    return `feed_${filter.type}_${filter.location || 'all'}_${filter.stakeholderType || 'all'}`;
  }

  /**
   * Update post in cache
   */
  private updatePostInCache(postId: number, updater: (post: Post) => Post): void {
    for (const [key, cached] of this.cache.entries()) {
      const updatedData = cached.data.map(post =>
        post.id === postId ? updater(post) : post
      );
      this.cache.set(key, { ...cached, data: updatedData });
    }
  }

  /**
   * Invalidate cache
   */
  private invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
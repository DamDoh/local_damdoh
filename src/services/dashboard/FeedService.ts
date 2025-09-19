/**
 * Feed Service - Microservice for managing community feed data and operations
 * Handles feed fetching, posting, interactions, and AI-powered curation
 */

import { apiCall } from '@/lib/api-utils';
import type { FeedItem } from '@/lib/types';

export interface Comment {
  id: string;
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
  private cache: Map<string, { data: FeedItem[], timestamp: number }> = new Map();
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
  async fetchFeed(filter: FeedFilter = { type: 'all' }): Promise<FeedItem[]> {
    const cacheKey = this.generateCacheKey(filter);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return this.applyClientSideFiltering(cached.data, filter);
    }

    try {
      const response = await apiCall<{ data?: any[], pagination?: any, error?: string }>('/community/feed');

      const posts: any[] = response.data || [];

      // Transform backend posts to FeedItem
      const feedItems: FeedItem[] = posts.map(post => this.transformPostToFeedItem(post));

      // If no posts returned or response contains an error, fall back to mock data
      if (!feedItems || feedItems.length === 0 || response.error) {
        console.warn('No posts returned from API or API error, using mock data as fallback');
        const mockData = this.getMockFeedData(filter);
        this.cache.set(cacheKey, { data: mockData, timestamp: Date.now() });
        return mockData;
      }

      // Cache the raw data
      this.cache.set(cacheKey, { data: feedItems, timestamp: Date.now() });

      return this.applyClientSideFiltering(feedItems, filter);
    } catch (error) {
      console.warn('FeedService: API call failed, falling back to mock data:', error instanceof Error ? error.message : String(error));
      // Return cached data if available, even if expired
      if (cached) {
        console.log('FeedService: Using cached data');
        return this.applyClientSideFiltering(cached.data, filter);
      }

      // Return mock data as fallback
      console.warn('FeedService: Using mock feed data as fallback');
      const mockData = this.getMockFeedData(filter);
      console.log('FeedService: Returning mock feed data:', mockData.length, 'posts');
      return mockData;
    }
  }

  /**
   * Create a new post
   */
  async createPost(content: string, media?: File, pollData?: { text: string }[]): Promise<FeedItem> {
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

      const response = await apiCall<{ post?: any }>('/community/posts', {
        method: 'POST',
        body: formData,
        headers: {
          // Let browser set Content-Type for FormData
        }
      });

      // Invalidate cache
      this.invalidateCache();

      return this.transformPostToFeedItem(response.post || response);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<void> {
    try {
      await apiCall(`/community/posts/${postId}/like`, {
        method: 'POST'
      });

      // Update cache optimistically
      this.updatePostInCache(postId, post => ({
        ...post,
        likesCount: post.likesCount + 1
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  /**
   * Add comment to a post
   */
  async addComment(postId: string, content: string, authorName: string, authorAvatar: string): Promise<Comment> {
    try {
      const response = await apiCall<{ comment?: { id: string } }>(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });

      const newComment: Comment = {
        id: response.comment?.id || Date.now().toString(),
        author: authorName,
        avatar: authorAvatar,
        content,
        time: 'now',
        verified: true
      };

      // Update cache optimistically
      this.updatePostInCache(postId, post => ({
        ...post,
        commentsCount: post.commentsCount + 1
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
  async searchPosts(query: string, filters?: Partial<FeedFilter>): Promise<FeedItem[]> {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.location && { location: filters.location })
      });

      const response = await apiCall<{ posts?: any[], results?: any[] }>(`/community/search?${searchParams}`);
      const posts = response.posts || response.results || [];
      return posts.map(post => this.transformPostToFeedItem(post));
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  /**
   * Apply client-side filtering and AI scoring (public method)
   */
  applyClientSideFiltering(posts: FeedItem[], filter: FeedFilter): FeedItem[] {
    let filtered = [...posts];

    switch (filter.type) {
      case 'local':
        // For FeedItem, we don't have location, so skip or use content-based filtering
        break;

      case 'experts':
        // For FeedItem, we don't have verified field, so skip
        break;

      case 'market':
        filtered = filtered.filter(post =>
          post.type === 'marketplace_listing' ||
          post.content.toLowerCase().includes('market')
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
            const aScore = a.likesCount + a.commentsCount * 2;
            const bScore = b.likesCount + b.commentsCount * 2;
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
  private calculateAIScore(post: FeedItem, filter: FeedFilter): number {
    let score = 0.5; // Base score

    // Content category matching
    const postContent = post.content.toLowerCase();
    filter.userInterests?.forEach(interest => {
      if (postContent.includes(interest.toLowerCase())) score += 0.15;
    });

    // Type relevance
    if (filter.stakeholderType === 'Farmer' && post.type === 'forum_post') score += 0.1;

    // Engagement bonus
    const engagement = post.likesCount + post.commentsCount;
    score += Math.min(engagement * 0.01, 0.2);

    return Math.min(score, 1.0);
  }

  /**
   * Transform backend post to FeedItem
   */
  private transformPostToFeedItem(post: any): FeedItem {
    return {
      id: post._id || post.id,
      type: 'forum_post', // Default type
      timestamp: post.createdAt || new Date().toISOString(),
      userId: post.author?._id || post.author || '',
      userName: post.author?.displayName || post.author || 'Unknown',
      userAvatar: post.author?.avatarUrl || '/avatars/default.jpg',
      content: post.content || '',
      link: `/posts/${post._id || post.id}`,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
    };
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
  private updatePostInCache(postId: string, updater: (post: FeedItem) => FeedItem): void {
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

  /**
   * Get mock feed data as fallback
   */
  private getMockFeedData(filter: FeedFilter): FeedItem[] {
    const mockPosts: FeedItem[] = [
      {
        id: '1',
        type: 'forum_post',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userId: 'user1',
        userName: 'Dr. Sarah Johnson',
        userAvatar: '/avatars/farmer.jpg',
        content: 'Great harvest yields this season! The new irrigation system has improved water efficiency by 35%. Farmers in the region are seeing significant improvements in crop quality.',
        link: '/posts/1',
        likesCount: 24,
        commentsCount: 8,
      },
      {
        id: '2',
        type: 'forum_post',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        userId: 'user2',
        userName: 'AgriTech Solutions',
        userAvatar: '/avatars/coop.jpg',
        content: '🚀 Exciting news! Our AI-powered crop disease detection system is now available. Early detection can save up to 40% of potential crop losses.',
        link: '/posts/2',
        likesCount: 18,
        commentsCount: 12,
      },
      {
        id: '3',
        type: 'marketplace_listing',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        userId: 'user3',
        userName: 'Market Analytics Pro',
        userAvatar: '/avatars/fi.jpg',
        content: 'Market Update: Wheat prices showing upward trend. Current spot price: $285/ton. Expected to rise 8-12% in the next quarter due to weather concerns in major producing regions.',
        link: '/posts/3',
        likesCount: 31,
        commentsCount: 15,
      },
      {
        id: '4',
        type: 'forum_post',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        userId: 'user4',
        userName: 'Local Farmer Cooperative',
        userAvatar: '/avatars/coop.jpg',
        content: 'Community meeting tomorrow at 6 PM. We\'ll discuss the upcoming planting season and share best practices for sustainable farming. All farmers welcome!',
        link: '/posts/4',
        likesCount: 12,
        commentsCount: 6,
      },
      {
        id: '5',
        type: 'forum_post',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        userId: 'user5',
        userName: 'ClimateWatch AI',
        userAvatar: '/avatars/farmer.jpg',
        content: 'Weather Alert: Heavy rainfall expected in the next 48 hours. Farmers should prepare drainage systems and monitor soil moisture levels to prevent waterlogging.',
        link: '/posts/5',
        likesCount: 28,
        commentsCount: 9,
      }
    ];

    return this.applyClientSideFiltering(mockPosts, filter);
  }
}
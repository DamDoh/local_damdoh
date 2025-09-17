import { api, PaginationParams } from '../lib/api-client';

interface Post {
  id: string;
  author: string;
  type: 'GENERAL' | 'QUESTION' | 'ARTICLE' | 'EVENT' | 'MARKET_UPDATE';
  title: string;
  content: string;
  images?: string[];
  tags: string[];
  likes: string[];
  comments: Comment[];
  views: number;
  location?: {
    coordinates: [number, number];
  };
  isPublished: boolean;
  publishedAt?: Date;
}

interface Comment {
  id: string;
  author: string;
  post: string;
  parentComment?: string;
  content: string;
  likes: string[];
  isEdited: boolean;
  createdAt: Date;
}

interface Group {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  cover?: string;
  creator: string;
  administrators: string[];
  members: string[];
  posts: string[];
  isPrivate: boolean;
  rules?: string[];
  category: string;
  tags: string[];
}

interface GetFeedParams extends PaginationParams {
  type?: Post['type'];
  following?: string[];
  groupId?: string;
  location?: [number, number];
  radius?: number;
}

interface SearchGroupsParams extends PaginationParams {
  query?: string;
  category?: string;
  tags?: string[];
}

export const communityService = {
  // Posts
  getFeed: (params?: GetFeedParams) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.following) searchParams.append('following', params.following.join(','));
    if (params?.groupId) searchParams.append('groupId', params.groupId);
    if (params?.location) searchParams.append('location', params.location.join(','));
    if (params?.radius) searchParams.append('radius', params.radius.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    return api.get<{ data: Post[]; pagination: any }>(`/community/feed?${searchParams.toString()}`);
  },

  createPost: (data: Pick<Post, 'title' | 'content' | 'type' | 'tags' | 'location'>) =>
    api.post<Post>('/community/posts', data),

  // Comments
  addComment: (postId: string, data: { content: string; parentCommentId?: string }) =>
    api.post<Comment>(`/community/posts/${postId}/comments`, data),

  // Likes
  toggleLike: (postId: string) =>
    api.post<Post>(`/community/posts/${postId}/like`, {}),

  // Groups
  searchGroups: (params?: SearchGroupsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.tags) searchParams.append('tags', params.tags.join(','));
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    return api.get<{ data: Group[]; pagination: any }>(`/community/groups/search?${searchParams.toString()}`);
  },

  createGroup: (data: Pick<Group, 'name' | 'description' | 'category' | 'tags' | 'isPrivate'>) =>
    api.post<Group>('/community/groups', data),

  joinGroup: (groupId: string) =>
    api.post<{ message: string }>(`/community/groups/${groupId}/join`, {}),
};
import { Request, Response } from 'express';
import { ForumTopic, ForumPost, ForumReply, IForumTopic, IForumPost, IForumReply } from '../models/forums.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class ForumsController {
  async getTopics(req: Request, res: Response) {
    try {
      const topics = await ForumTopic.find()
        .sort({ lastActivityAt: -1 })
        .populate('creator', 'name avatarUrl');

      const formattedTopics = topics.map(topic => ({
        id: topic._id,
        name: topic.name,
        description: topic.description,
        creatorId: topic.creator._id,
        postCount: topic.postCount,
        createdAt: topic.createdAt.toISOString(),
        lastActivityAt: topic.lastActivityAt.toISOString(),
        creator: {
          id: (topic as any).creator._id,
          name: (topic as any).creator.name,
          avatarUrl: (topic as any).creator.avatarUrl,
        },
      }));

      res.json({ topics: formattedTopics });
    } catch (error) {
      logger.error('Error fetching forum topics:', error);
      res.status(500).json({ error: 'Failed to fetch forum topics' });
    }
  }

  async createTopic(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { name, description } = req.body;

      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }

      const topic = new ForumTopic({
        name: name.trim(),
        description: description.trim(),
        creator: userId,
      });

      await topic.save();

      res.json({ topicId: topic._id });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Topic name already exists' });
      }
      logger.error('Error creating forum topic:', error);
      res.status(500).json({ error: 'Failed to create forum topic' });
    }
  }

  async getPostsForTopic(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const { lastVisible } = req.query;

      if (!topicId) {
        return res.status(400).json({ error: 'Topic ID is required' });
      }

      // Check if topic exists
      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Forum topic not found' });
      }

      const POSTS_PER_PAGE = 10;
      let query = ForumPost.find({ forumTopic: topicId }).sort({ createdAt: -1 });

      if (lastVisible) {
        const lastPost = await ForumPost.findById(lastVisible);
        if (lastPost) {
          query = query.lt('createdAt', lastPost.createdAt);
        }
      }

      const posts = await query.limit(POSTS_PER_PAGE);

      const formattedPosts = posts.map(post => ({
        id: post._id,
        title: post.title,
        content: post.content,
        author: {
          id: post.author,
          name: post.authorName,
          avatarUrl: post.authorAvatarUrl,
        },
        replyCount: post.replyCount,
        likes: post.likes,
        createdAt: post.createdAt.toISOString(),
      }));

      const newLastVisible = formattedPosts.length > 0 ? formattedPosts[formattedPosts.length - 1].id : null;

      res.json({ posts: formattedPosts, lastVisible: newLastVisible });
    } catch (error) {
      logger.error('Error fetching posts for topic:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  async createForumPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { topicId, title, content } = req.body;

      if (!topicId || !title || !content) {
        return res.status(400).json({ error: 'Topic ID, title, and content are required' });
      }

      // Check if topic exists
      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Forum topic not found' });
      }

      // Get user profile for denormalization
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const post = new ForumPost({
        forumTopic: topicId,
        title: title.trim(),
        content: content.trim(),
        author: userId,
        authorName: user.name,
        authorAvatarUrl: user.avatarUrl,
      });

      await post.save();

      res.json({ postId: post._id });
    } catch (error) {
      logger.error('Error creating forum post:', error);
      res.status(500).json({ error: 'Failed to create forum post' });
    }
  }

  async getRepliesForPost(req: Request, res: Response) {
    try {
      const { topicId, postId } = req.params;
      const { lastVisible } = req.query;

      if (!topicId || !postId) {
        return res.status(400).json({ error: 'Topic ID and Post ID are required' });
      }

      // Check if post exists
      const post = await ForumPost.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Forum post not found' });
      }

      const REPLIES_PER_PAGE = 15;
      let query = ForumReply.find({ forumPost: postId }).sort({ createdAt: 1 });

      if (lastVisible) {
        const lastReply = await ForumReply.findById(lastVisible);
        if (lastReply) {
          query = query.gt('createdAt', lastReply.createdAt);
        }
      }

      const replies = await query.limit(REPLIES_PER_PAGE);

      const formattedReplies = replies.map(reply => ({
        id: reply._id,
        content: reply.content,
        author: {
          id: reply.author,
          name: reply.authorName,
          avatarUrl: reply.authorAvatarUrl,
        },
        createdAt: reply.createdAt.toISOString(),
      }));

      const newLastVisible = formattedReplies.length > 0 ? formattedReplies[formattedReplies.length - 1].id : null;

      res.json({ replies: formattedReplies, lastVisible: newLastVisible });
    } catch (error) {
      logger.error('Error fetching replies for post:', error);
      res.status(500).json({ error: 'Failed to fetch replies' });
    }
  }

  async addReplyToPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { topicId, postId, content } = req.body;

      if (!topicId || !postId || !content) {
        return res.status(400).json({ error: 'Topic ID, post ID, and content are required' });
      }

      // Check if post exists
      const post = await ForumPost.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Forum post not found' });
      }

      // Get user profile for denormalization
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const reply = new ForumReply({
        forumPost: postId,
        content: content.trim(),
        author: userId,
        authorName: user.name,
        authorAvatarUrl: user.avatarUrl,
      });

      await reply.save();

      res.json({ replyId: reply._id });
    } catch (error) {
      logger.error('Error adding reply to post:', error);
      res.status(500).json({ error: 'Failed to add reply' });
    }
  }

  async getForumTopicSuggestions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { existingTopics, language } = req.body;

      if (!existingTopics) {
        return res.status(400).json({ error: 'Existing topics are required' });
      }

      // TODO: Integrate with AI service for topic suggestions
      // For now, return a placeholder response
      const suggestions = {
        suggestions: [
          'Sustainable Farming Practices',
          'Organic Pest Control Methods',
          'Climate-Smart Agriculture',
          'Digital Farming Technologies',
        ],
        language: language || 'en',
      };

      res.json(suggestions);
    } catch (error) {
      logger.error('Error getting forum topic suggestions:', error);
      res.status(500).json({ error: 'Failed to get topic suggestions' });
    }
  }
}
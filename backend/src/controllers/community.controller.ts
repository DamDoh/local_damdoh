import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import {
  Post,
  Comment,
  Group,
  IPost,
  IComment,
  IGroup,
  PostType
} from '../models/community.model';
import { logger } from '../utils/logger';

export class CommunityController {
  private postController: BaseController<IPost>;
  private commentController: BaseController<IComment>;
  private groupController: BaseController<IGroup>;

  constructor() {
    this.postController = new BaseController(Post);
    this.commentController = new BaseController(Comment);
    this.groupController = new BaseController(Group);
  }

  async createPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const post = new Post({
        ...req.body,
        author: (req.user as any).userId || (req.user as any).id,
      });
      await post.save();

      if (req.body.groupId) {
        await Group.findByIdAndUpdate(
          req.body.groupId,
          { $push: { posts: post._id } }
        );
      }

      res.status(201).json(post);
    } catch (error) {
      logger.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  async getFeed(req: Request, res: Response) {
    try {
      const {
        type,
        following,
        groupId,
        location,
        radius,
        ...paginationParams
      } = req.query;

      const filter: any = { isPublished: true };

      if (type) {
        filter.type = type;
      }

      if (following) {
        filter.author = { $in: (following as string).split(',') };
      }

      if (groupId) {
        const group = await Group.findById(groupId);
        if (!group) {
          return res.status(404).json({ error: 'Group not found' });
        }
        filter._id = { $in: group.posts };
      }

      if (location && radius) {
        const [longitude, latitude] = (location as string).split(',').map(Number);
        filter.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: Number(radius) * 1000,
          },
        };
      }

      const result = await this.postController['findWithPagination'](
        filter,
        Number(paginationParams.page),
        Number(paginationParams.limit),
        paginationParams.sort as string,
        ['author', 'comments']
      );

      res.json(result);
    } catch (error) {
      logger.warn('Feed API failed (likely due to MongoDB not running):', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to fetch feed' });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { content, parentCommentId } = req.body;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const comment = new Comment({
        author: (req.user as any).userId || (req.user as any).id,
        post: postId,
        content,
        parentComment: parentCommentId,
      });

      await comment.save();
      
      await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id } }
      );

      res.status(201).json(comment);
    } catch (error) {
      logger.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  async toggleLike(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { postId } = req.params;
      const userId = (req.user as any).userId || (req.user as any).id;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const userLiked = post.likes.includes(userId);
      const updateOperation = userLiked
        ? { $pull: { likes: userId } }
        : { $push: { likes: userId } };

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        updateOperation,
        { new: true }
      );

      res.json(updatedPost);
    } catch (error) {
      logger.error('Error toggling like:', error);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  }

  async createGroup(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const group = new Group({
        ...req.body,
        creator: (req.user as any).userId || (req.user as any).id,
        administrators: [(req.user as any).userId || (req.user as any).id],
        members: [(req.user as any).userId || (req.user as any).id],
      });

      await group.save();
      res.status(201).json(group);
    } catch (error) {
      logger.error('Error creating group:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  }

  async joinGroup(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { groupId } = req.params;
      const userId = (req.user as any).userId || (req.user as any).id;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      if (group.members.includes(userId)) {
        return res.status(400).json({ error: 'Already a member' });
      }

      if (group.isPrivate) {
        // Handle private group joining logic
        return res.status(400).json({ error: 'This is a private group' });
      }

      await Group.findByIdAndUpdate(
        groupId,
        { $push: { members: userId } }
      );

      res.json({ message: 'Successfully joined the group' });
    } catch (error) {
      logger.error('Error joining group:', error);
      res.status(500).json({ error: 'Failed to join group' });
    }
  }

  async searchGroups(req: Request, res: Response) {
    try {
      const { query, category, tags, ...paginationParams } = req.query;

      const filter: any = {};

      if (query) {
        filter.$text = { $search: query as string };
      }

      if (category) {
        filter.category = category;
      }

      if (tags) {
        filter.tags = { $all: (tags as string).split(',') };
      }

      const result = await this.groupController['findWithPagination'](
        filter,
        Number(paginationParams.page),
        Number(paginationParams.limit),
        paginationParams.sort as string
      );

      res.json(result);
    } catch (error) {
      logger.error('Error searching groups:', error);
      res.status(500).json({ error: 'Failed to search groups' });
    }
  }
}
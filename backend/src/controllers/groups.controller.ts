import { Request, Response } from 'express';
import { Group, GroupMember, GroupPost, GroupReply, GroupMemberRole, IGroup, IGroupMember, IGroupPost, IGroupReply } from '../models/groups.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class GroupsController {
  async createGroup(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { name, description, isPublic } = req.body;

      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }

      // Get user profile for denormalization
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const group = new Group({
        name: name.trim(),
        description: description.trim(),
        creator: userId,
        isPrivate: !isPublic,
        category: 'General', // Default category
      });

      await group.save();

      // Create the creator as the first member and administrator
      const member = new GroupMember({
        group: group._id,
        user: userId,
        role: GroupMemberRole.OWNER,
        displayName: user.name,
        avatarUrl: user.avatarUrl,
      });

      await member.save();

      res.json({ groupId: group._id });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Group name already exists' });
      }
      logger.error('Error creating group:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  }

  async getGroups(req: Request, res: Response) {
    try {
      const groups = await Group.find({ isPrivate: false })
        .sort({ createdAt: -1 })
        .populate('creator', 'name avatarUrl')
        .limit(50);

      const formattedGroups = groups.map(group => ({
        id: group._id,
        name: group.name,
        description: group.description,
        isPublic: !group.isPrivate,
        memberCount: group.memberCount,
        postCount: group.postCount,
        createdAt: group.createdAt.toISOString(),
        creator: {
          id: (group as any).creator._id,
          name: (group as any).creator.name,
          avatarUrl: (group as any).creator.avatarUrl,
        },
      }));

      res.json({ groups: formattedGroups });
    } catch (error) {
      logger.error('Error fetching groups:', error);
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  }

  async getGroupDetails(req: Request, res: Response) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }

      const group = await Group.findById(groupId)
        .populate('creator', 'name avatarUrl')
        .populate('administrators', 'name avatarUrl')
        .populate('members', 'name avatarUrl');

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const formattedGroup = {
        id: group._id,
        name: group.name,
        description: group.description,
        isPublic: !group.isPrivate,
        category: group.category,
        tags: group.tags,
        rules: group.rules,
        memberCount: group.memberCount,
        postCount: group.postCount,
        createdAt: group.createdAt.toISOString(),
        lastActivityAt: group.lastActivityAt.toISOString(),
        creator: {
          id: (group as any).creator._id,
          name: (group as any).creator.name,
          avatarUrl: (group as any).creator.avatarUrl,
        },
        administrators: (group as any).administrators.map((admin: any) => ({
          id: admin._id,
          name: admin.name,
          avatarUrl: admin.avatarUrl,
        })),
        members: (group as any).members.map((member: any) => ({
          id: member._id,
          name: member.name,
          avatarUrl: member.avatarUrl,
        })),
      };

      res.json(formattedGroup);
    } catch (error) {
      logger.error('Error fetching group details:', error);
      res.status(500).json({ error: 'Failed to fetch group details' });
    }
  }

  async getGroupMembers(req: Request, res: Response) {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }

      // Check if group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const members = await GroupMember.find({ group: groupId })
        .sort({ joinedAt: -1 })
        .limit(50);

      const formattedMembers = members.map(member => ({
        id: member._id,
        userId: member.user,
        displayName: member.displayName,
        avatarUrl: member.avatarUrl,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      }));

      res.json({ members: formattedMembers });
    } catch (error) {
      logger.error('Error fetching group members:', error);
      res.status(500).json({ error: 'Failed to fetch group members' });
    }
  }

  async joinGroup(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }

      // Check if group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      // Check if user is already a member
      const existingMember = await GroupMember.findOne({ group: groupId, user: userId });
      if (existingMember) {
        return res.status(400).json({ error: 'You are already a member of this group' });
      }

      // Get user profile for denormalization
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const member = new GroupMember({
        group: groupId,
        user: userId,
        role: GroupMemberRole.MEMBER,
        displayName: user.name,
        avatarUrl: user.avatarUrl,
      });

      await member.save();

      res.json({ success: true, message: 'Successfully joined the group' });
    } catch (error) {
      logger.error('Error joining group:', error);
      res.status(500).json({ error: 'Failed to join group' });
    }
  }

  async leaveGroup(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }

      // Check if user is a member
      const member = await GroupMember.findOne({ group: groupId, user: userId });
      if (!member) {
        return res.status(400).json({ error: 'You are not a member of this group' });
      }

      // Check if user is the owner (owners cannot leave)
      if (member.role === GroupMemberRole.OWNER) {
        return res.status(400).json({ error: 'Group owners cannot leave their group' });
      }

      await GroupMember.findByIdAndDelete(member._id);

      // Update group member count
      await Group.findByIdAndUpdate(groupId, { $inc: { memberCount: -1 } });

      res.json({ success: true, message: 'Successfully left the group' });
    } catch (error) {
      logger.error('Error leaving group:', error);
      res.status(500).json({ error: 'Failed to leave group' });
    }
  }

  async createGroupPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { groupId, title, content } = req.body;

      if (!groupId || !title || !content) {
        return res.status(400).json({ error: 'Group ID, title, and content are required' });
      }

      // Check if user is a member of the group
      const member = await GroupMember.findOne({ group: groupId, user: userId });
      if (!member) {
        return res.status(403).json({ error: 'You must be a member of this group to post' });
      }

      // Check if group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      // Get user profile for denormalization
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const post = new GroupPost({
        group: groupId,
        title: title.trim(),
        content: content.trim(),
        author: userId,
        authorName: user.name,
        authorAvatarUrl: user.avatarUrl,
      });

      await post.save();

      res.json({ postId: post._id });
    } catch (error) {
      logger.error('Error creating group post:', error);
      res.status(500).json({ error: 'Failed to create group post' });
    }
  }

  async getGroupPosts(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const { lastVisible } = req.query;

      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }

      // Check if group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const POSTS_PER_PAGE = 10;
      let query = GroupPost.find({ group: groupId }).sort({ createdAt: -1 });

      if (lastVisible) {
        const lastPost = await GroupPost.findById(lastVisible);
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
      logger.error('Error fetching group posts:', error);
      res.status(500).json({ error: 'Failed to fetch group posts' });
    }
  }

  async addGroupPostReply(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { groupId, postId, content } = req.body;

      if (!groupId || !postId || !content) {
        return res.status(400).json({ error: 'Group ID, post ID, and content are required' });
      }

      // Check if user is a member of the group
      const member = await GroupMember.findOne({ group: groupId, user: userId });
      if (!member) {
        return res.status(403).json({ error: 'You must be a member of this group to reply' });
      }

      // Check if post exists
      const post = await GroupPost.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Group post not found' });
      }

      // Get user profile for denormalization
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const reply = new GroupReply({
        groupPost: postId,
        content: content.trim(),
        author: userId,
        authorName: user.name,
        authorAvatarUrl: user.avatarUrl,
      });

      await reply.save();

      res.json({ replyId: reply._id });
    } catch (error) {
      logger.error('Error adding group post reply:', error);
      res.status(500).json({ error: 'Failed to add reply' });
    }
  }

  async getGroupPostReplies(req: Request, res: Response) {
    try {
      const { groupId, postId } = req.params;
      const { lastVisible } = req.query;

      if (!groupId || !postId) {
        return res.status(400).json({ error: 'Group ID and Post ID are required' });
      }

      // Check if post exists
      const post = await GroupPost.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Group post not found' });
      }

      const REPLIES_PER_PAGE = 15;
      let query = GroupReply.find({ groupPost: postId }).sort({ createdAt: 1 });

      if (lastVisible) {
        const lastReply = await GroupReply.findById(lastVisible);
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
      logger.error('Error fetching group post replies:', error);
      res.status(500).json({ error: 'Failed to fetch replies' });
    }
  }
}
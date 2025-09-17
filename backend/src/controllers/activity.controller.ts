import { Request, Response } from 'express';
import { ProfileView, Activity, ActivityType, IProfileView, IActivity } from '../models/activity.model';
import { Post } from '../models/community.model';
import { Order } from '../models/marketplace.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class ActivityController {
  async logProfileView(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const viewerId = (req.user as any).userId || (req.user as any).id;
      const { viewedId } = req.body;

      if (!viewedId) {
        return res.status(400).json({ error: 'Viewed user ID is required' });
      }

      // Don't log self-views
      if (viewerId === viewedId) {
        return res.json({ success: true, message: 'Self-view, not logged.' });
      }

      // Check if viewed user exists
      const viewedUser = await User.findById(viewedId);
      if (!viewedUser) {
        return res.status(404).json({ error: 'Viewed user not found' });
      }

      // Create profile view record
      const profileView = new ProfileView({
        viewer: viewerId,
        viewed: viewedId,
      });

      await profileView.save();

      // Also create an activity record for the viewer
      const activity = new Activity({
        user: viewerId,
        type: ActivityType.PROFILE_VIEW,
        title: `Viewed profile of ${viewedUser.name}`,
        referenceId: viewedUser._id,
        referenceType: 'User',
        metadata: { viewedUserId: viewedId },
      });

      await activity.save();

      res.json({ success: true, logId: profileView._id });
    } catch (error) {
      logger.error('Error logging profile view:', error);
      res.status(500).json({ error: 'Failed to log profile view' });
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get activities from different sources
      const posts = await Post.find({ author: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('author', 'name');

      const orders = await Order.find({ buyer: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('listing', 'title');

      const sales = await Order.find({ seller: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('listing', 'title');

      // Get activities from the Activity collection
      const activities = await Activity.find({ user: userId })
        .sort({ timestamp: -1 })
        .limit(5);

      const allActivities: any[] = [];

      // Process posts
      posts.forEach(post => {
        allActivities.push({
          id: post._id,
          type: 'Shared a Post',
          title: post.title || (post.content ? post.content.substring(0, 70) + (post.content.length > 70 ? '...' : '') : 'New post'),
          timestamp: post.createdAt.toISOString(),
          icon: 'MessageSquare',
          referenceType: 'post',
          referenceId: post._id,
        });
      });

      // Process orders
      orders.forEach(order => {
        allActivities.push({
          id: order._id,
          type: 'Placed an Order',
          title: `For: ${(order as any).listing?.title || 'Unknown item'}`,
          timestamp: order.createdAt.toISOString(),
          icon: 'ShoppingCart',
          referenceType: 'order',
          referenceId: order._id,
        });
      });

      // Process sales
      sales.forEach(sale => {
        allActivities.push({
          id: sale._id,
          type: 'Received an Order',
          title: `For: ${(sale as any).listing?.title || 'Unknown item'}`,
          timestamp: sale.createdAt.toISOString(),
          icon: 'CircleDollarSign',
          referenceType: 'sale',
          referenceId: sale._id,
        });
      });

      // Process activities
      activities.forEach(activity => {
        allActivities.push({
          id: activity._id,
          type: this.getActivityTypeLabel(activity.type),
          title: activity.title,
          timestamp: activity.timestamp.toISOString(),
          icon: this.getActivityIcon(activity.type),
          referenceType: activity.referenceType,
          referenceId: activity.referenceId,
        });
      });

      // Sort all activities by date and take the most recent 10
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json({ activities: allActivities.slice(0, 10) });
    } catch (error) {
      logger.error('Error fetching user activity:', error);
      res.status(500).json({ error: 'Failed to fetch user activity' });
    }
  }

  async getUserEngagementStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get user document for view count
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profileViews = user.viewCount || 0;

      // Get user's posts for likes and comments count
      const posts = await Post.find({ author: userId });

      let postLikes = 0;
      let postComments = 0;

      posts.forEach(post => {
        postLikes += post.likes.length;
        postComments += (post as any).comments?.length || 0;
      });

      res.json({
        profileViews,
        postLikes,
        postComments,
      });
    } catch (error) {
      logger.error('Error fetching user engagement stats:', error);
      res.status(500).json({ error: 'Failed to fetch engagement stats' });
    }
  }

  private getActivityTypeLabel(type: ActivityType): string {
    const labels: Record<ActivityType, string> = {
      [ActivityType.PROFILE_VIEW]: 'Viewed Profile',
      [ActivityType.POST_CREATED]: 'Created Post',
      [ActivityType.ORDER_PLACED]: 'Placed Order',
      [ActivityType.ORDER_RECEIVED]: 'Received Order',
      [ActivityType.TRACEABILITY_EVENT]: 'Traceability Update',
      [ActivityType.COMMENT_ADDED]: 'Added Comment',
      [ActivityType.LIKE_ADDED]: 'Liked Post',
      [ActivityType.CONNECTION_REQUEST]: 'Connection Request',
      [ActivityType.GROUP_JOINED]: 'Joined Group',
      [ActivityType.KNOWLEDGE_ARTICLE_CREATED]: 'Created Article',
    };
    return labels[type] || 'Activity';
  }

  private getActivityIcon(type: ActivityType): string {
    const icons: Record<ActivityType, string> = {
      [ActivityType.PROFILE_VIEW]: 'Eye',
      [ActivityType.POST_CREATED]: 'MessageSquare',
      [ActivityType.ORDER_PLACED]: 'ShoppingCart',
      [ActivityType.ORDER_RECEIVED]: 'CircleDollarSign',
      [ActivityType.TRACEABILITY_EVENT]: 'GitBranch',
      [ActivityType.COMMENT_ADDED]: 'MessageCircle',
      [ActivityType.LIKE_ADDED]: 'Heart',
      [ActivityType.CONNECTION_REQUEST]: 'UserPlus',
      [ActivityType.GROUP_JOINED]: 'Users',
      [ActivityType.KNOWLEDGE_ARTICLE_CREATED]: 'BookOpen',
    };
    return icons[type] || 'Activity';
  }
}
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { Post } from '../models/community.model';
import { logger } from '../utils/logger';

interface AuthenticatedSocket {
  userId?: string;
  user?: any;
  join: (room: string) => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  to: (room: string) => any;
  handshake: {
    auth: { token?: string };
    headers: { authorization?: string };
  };
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startPeriodicUpdates();
  }

  private setupMiddleware() {
    this.io.use(async (socket: any, next: (err?: Error) => void) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        const user = await User.findById(decoded.userId);

        if (!user) {
          return next(new Error('User not found'));
        }

        (socket as AuthenticatedSocket).userId = user._id.toString();
        (socket as AuthenticatedSocket).user = user;
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      const authenticatedSocket = socket as AuthenticatedSocket;
      const userId = authenticatedSocket.userId!;
      this.connectedUsers.set(userId, authenticatedSocket);

      logger.info(`User ${userId} connected via WebSocket`);

      // Join user-specific room
      authenticatedSocket.join(`user:${userId}`);

      // Handle real-time subscriptions
      this.handleSubscriptions(authenticatedSocket);

      // Handle disconnection
      authenticatedSocket.on('disconnect', () => {
        this.connectedUsers.delete(userId);
        logger.info(`User ${userId} disconnected from WebSocket`);
      });

      // Send welcome message
      authenticatedSocket.emit('connected', {
        message: 'Successfully connected to real-time service',
        userId: userId
      });
    });
  }

  private handleSubscriptions(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Subscribe to notifications
    socket.on('subscribe:notifications', () => {
      socket.join(`notifications:${userId}`);
      logger.info(`User ${userId} subscribed to notifications`);
    });

    // Subscribe to posts feed
    socket.on('subscribe:posts', (data: { following?: string[], groupId?: string }) => {
      if (data.following) {
        socket.join(`posts:following:${userId}`);
      }
      if (data.groupId) {
        socket.join(`posts:group:${data.groupId}`);
      }
      socket.join(`posts:public`);
      logger.info(`User ${userId} subscribed to posts feed`);
    });

    // Subscribe to messages
    socket.on('subscribe:messages', () => {
      socket.join(`messages:${userId}`);
      logger.info(`User ${userId} subscribed to messages`);
    });

    // Subscribe to marketplace updates
    socket.on('subscribe:marketplace', (data: { categories?: string[] }) => {
      socket.join(`marketplace:${userId}`);
      if (data.categories) {
        data.categories.forEach(category => {
          socket.join(`marketplace:category:${category}`);
        });
      }
      logger.info(`User ${userId} subscribed to marketplace updates`);
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(`messages:${userId}`).emit('typing:start', {
        userId: userId,
        conversationId: data.conversationId,
        user: {
          id: socket.user._id,
          name: socket.user.name
        }
      });
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(`messages:${userId}`).emit('typing:stop', {
        userId: userId,
        conversationId: data.conversationId
      });
    });
  }

  // Real-time notification methods
  async notifyUser(userId: string, event: string, data: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
    }

    // Also emit to notification room
    this.io.to(`notifications:${userId}`).emit(event, data);
  }

  async notifyNewPost(post: any) {
    // Notify followers
    if (post.author && post.author.followers) {
      post.author.followers.forEach((followerId: string) => {
        this.notifyUser(followerId, 'post:new', {
          post: post,
          type: 'new_post'
        });
      });
    }

    // Notify group members if it's a group post
    if (post.groupId) {
      this.io.to(`posts:group:${post.groupId}`).emit('post:new', {
        post: post,
        type: 'group_post'
      });
    }

    // Notify public feed
    this.io.to('posts:public').emit('post:new', {
      post: post,
      type: 'public_post'
    });
  }

  async notifyPostLike(postId: string, likerId: string, postAuthorId: string) {
    this.notifyUser(postAuthorId, 'post:liked', {
      postId: postId,
      likerId: likerId,
      type: 'post_like'
    });
  }

  async notifyPostComment(postId: string, commenterId: string, postAuthorId: string, comment: any) {
    this.notifyUser(postAuthorId, 'post:commented', {
      postId: postId,
      commenterId: commenterId,
      comment: comment,
      type: 'post_comment'
    });
  }

  async notifyNewMessage(conversationId: string, message: any, recipientIds: string[]) {
    recipientIds.forEach(recipientId => {
      this.notifyUser(recipientId, 'message:new', {
        conversationId: conversationId,
        message: message,
        type: 'new_message'
      });
    });
  }

  async notifyConnectionRequest(requesterId: string, recipientId: string, requestData: any) {
    this.notifyUser(recipientId, 'connection:request', {
      requesterId: requesterId,
      request: requestData,
      type: 'connection_request'
    });
  }

  async notifyMarketplaceUpdate(updateType: string, data: any, targetUsers?: string[]) {
    if (targetUsers) {
      targetUsers.forEach(userId => {
        this.notifyUser(userId, 'marketplace:update', {
          type: updateType,
          data: data
        });
      });
    } else {
      // Broadcast to all marketplace subscribers
      this.io.to('marketplace').emit('marketplace:update', {
        type: updateType,
        data: data
      });
    }
  }

  // Periodic updates for less critical data
  private startPeriodicUpdates() {
    // Update online users every 30 seconds
    setInterval(() => {
      const onlineUsers = Array.from(this.connectedUsers.keys());
      this.io.emit('users:online', { onlineUsers });
    }, 30000);

    // Update notification counts every 60 seconds
    setInterval(async () => {
      for (const [userId, socket] of this.connectedUsers) {
        try {
          const unreadCount = await Notification.countDocuments({
            user: userId,
            status: 'unread'
          });

          (socket as AuthenticatedSocket).emit('notifications:count', { unreadCount });
        } catch (error) {
          logger.error(`Error updating notification count for user ${userId}:`, error);
        }
      }
    }, 60000);
  }

  // Utility methods
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getOnlineUserCount(): number {
    return this.connectedUsers.size;
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Send to specific room
  to(room: string) {
    return this.io.to(room);
  }
}

export default WebSocketService;
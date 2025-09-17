import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { CommunityController } from '../controllers/community.controller';
import { body } from 'express-validator';

const router = express.Router();
const communityController = new CommunityController();

// Posts
router.get('/feed', communityController.getFeed.bind(communityController));

router.post('/posts',
  requireAuth(),
  [
    body('title').trim().notEmpty(),
    body('content').trim().notEmpty(),
    body('type').isIn(['GENERAL', 'QUESTION', 'ARTICLE', 'EVENT', 'MARKET_UPDATE']),
    body('tags').optional().isArray(),
  ],
  communityController.createPost.bind(communityController)
);

// Comments
router.post('/posts/:postId/comments',
  requireAuth(),
  [
    body('content').trim().notEmpty(),
    body('parentCommentId').optional().isMongoId(),
  ],
  communityController.addComment.bind(communityController)
);

// Likes
router.post('/posts/:postId/like',
  requireAuth(),
  communityController.toggleLike.bind(communityController)
);

// Groups
router.get('/groups/search', communityController.searchGroups.bind(communityController));

router.post('/groups',
  requireAuth(),
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').notEmpty(),
    body('tags').optional().isArray(),
    body('isPrivate').isBoolean(),
  ],
  communityController.createGroup.bind(communityController)
);

router.post('/groups/:groupId/join',
  requireAuth(),
  communityController.joinGroup.bind(communityController)
);

export default router;
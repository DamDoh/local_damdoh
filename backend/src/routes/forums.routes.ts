import express from 'express';
import { ForumsController } from '../controllers/forums.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const forumsController = new ForumsController();

/**
 * @swagger
 * /api/forums/topics:
 *   get:
 *     tags: [Forums]
 *     summary: Get all forum topics
 *     description: Retrieve all forum topics sorted by last activity
 *     responses:
 *       200:
 *         description: Topics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       creatorId:
 *                         type: string
 *                       postCount:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                       lastActivityAt:
 *                         type: string
 *                       creator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 */
router.get('/topics', forumsController.getTopics);

/**
 * @swagger
 * /api/forums/topics:
 *   post:
 *     tags: [Forums]
 *     summary: Create a new forum topic
 *     description: Create a new forum topic
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Topic name
 *               description:
 *                 type: string
 *                 description: Topic description
 *     responses:
 *       200:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topicId:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/topics', requireAuth(), forumsController.createTopic);

/**
 * @swagger
 * /api/forums/topics/{topicId}/posts:
 *   get:
 *     tags: [Forums]
 *     summary: Get posts for a topic
 *     description: Get all posts for a specific forum topic with pagination
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the forum topic
 *       - in: query
 *         name: lastVisible
 *         schema:
 *           type: string
 *         description: ID of the last post for pagination
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 *                       replyCount:
 *                         type: number
 *                       likes:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                 lastVisible:
 *                   type: string
 *       404:
 *         description: Topic not found
 */
router.get('/topics/:topicId/posts', forumsController.getPostsForTopic);

/**
 * @swagger
 * /api/forums/posts:
 *   post:
 *     tags: [Forums]
 *     summary: Create a forum post
 *     description: Create a new post in a forum topic
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - title
 *               - content
 *             properties:
 *               topicId:
 *                 type: string
 *                 description: ID of the forum topic
 *               title:
 *                 type: string
 *                 description: Post title
 *               content:
 *                 type: string
 *                 description: Post content
 *     responses:
 *       200:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 postId:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Topic not found
 *       400:
 *         description: Bad request
 */
router.post('/posts', requireAuth(), forumsController.createForumPost);

/**
 * @swagger
 * /api/forums/posts/{postId}/replies:
 *   get:
 *     tags: [Forums]
 *     summary: Get replies for a post
 *     description: Get all replies for a specific forum post with pagination
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the forum post
 *       - in: query
 *         name: lastVisible
 *         schema:
 *           type: string
 *         description: ID of the last reply for pagination
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 replies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                 lastVisible:
 *                   type: string
 *       404:
 *         description: Post not found
 */
router.get('/posts/:postId/replies', forumsController.getRepliesForPost);

/**
 * @swagger
 * /api/forums/replies:
 *   post:
 *     tags: [Forums]
 *     summary: Add reply to a post
 *     description: Add a reply to a forum post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - postId
 *               - content
 *             properties:
 *               topicId:
 *                 type: string
 *                 description: ID of the forum topic
 *               postId:
 *                 type: string
 *                 description: ID of the forum post
 *               content:
 *                 type: string
 *                 description: Reply content
 *     responses:
 *       200:
 *         description: Reply added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 replyId:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       400:
 *         description: Bad request
 */
router.post('/replies', requireAuth(), forumsController.addReplyToPost);

/**
 * @swagger
 * /api/forums/topic-suggestions:
 *   post:
 *     tags: [Forums]
 *     summary: Get forum topic suggestions
 *     description: Get AI-powered suggestions for forum topics
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - existingTopics
 *             properties:
 *               existingTopics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of existing topic names
 *               language:
 *                 type: string
 *                 description: Language for suggestions
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 language:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/topic-suggestions', requireAuth(), forumsController.getForumTopicSuggestions);

export default router;
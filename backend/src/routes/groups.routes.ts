import express from 'express';
import { GroupsController } from '../controllers/groups.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const groupsController = new GroupsController();

/**
 * @swagger
 * /api/groups:
 *   get:
 *     tags: [Groups]
 *     summary: Get all public groups
 *     description: Retrieve all public groups sorted by creation date
 *     responses:
 *       200:
 *         description: Groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
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
 *                       isPublic:
 *                         type: boolean
 *                       memberCount:
 *                         type: number
 *                       postCount:
 *                         type: number
 *                       createdAt:
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
router.get('/', groupsController.getGroups);

/**
 * @swagger
 * /api/groups:
 *   post:
 *     tags: [Groups]
 *     summary: Create a new group
 *     description: Create a new group with the authenticated user as owner
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
 *                 description: Group name
 *               description:
 *                 type: string
 *                 description: Group description
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the group is public
 *                 default: true
 *     responses:
 *       200:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groupId:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', requireAuth(), groupsController.createGroup);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   get:
 *     tags: [Groups]
 *     summary: Get group details
 *     description: Get detailed information about a specific group
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *     responses:
 *       200:
 *         description: Group details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 isPublic:
 *                   type: boolean
 *                 category:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 rules:
 *                   type: array
 *                   items:
 *                     type: string
 *                 memberCount:
 *                   type: number
 *                 postCount:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                 lastActivityAt:
 *                   type: string
 *                 creator:
 *                   type: object
 *                 administrators:
 *                   type: array
 *                 members:
 *                   type: array
 *       404:
 *         description: Group not found
 */
router.get('/:groupId', groupsController.getGroupDetails);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   get:
 *     tags: [Groups]
 *     summary: Get group members
 *     description: Get all members of a specific group
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *     responses:
 *       200:
 *         description: Group members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                       avatarUrl:
 *                         type: string
 *                       role:
 *                         type: string
 *                       joinedAt:
 *                         type: string
 *       404:
 *         description: Group not found
 */
router.get('/:groupId/members', groupsController.getGroupMembers);

/**
 * @swagger
 * /api/groups/{groupId}/join:
 *   post:
 *     tags: [Groups]
 *     summary: Join a group
 *     description: Join a public group as a member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to join
 *     responses:
 *       200:
 *         description: Successfully joined the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request - already a member or group not found
 *       403:
 *         description: Forbidden - not allowed to join
 */
router.post('/:groupId/join', requireAuth(), groupsController.joinGroup);

/**
 * @swagger
 * /api/groups/{groupId}/leave:
 *   post:
 *     tags: [Groups]
 *     summary: Leave a group
 *     description: Leave a group (owners cannot leave)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to leave
 *     responses:
 *       200:
 *         description: Successfully left the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request - not a member or owner cannot leave
 */
router.post('/:groupId/leave', requireAuth(), groupsController.leaveGroup);

/**
 * @swagger
 * /api/groups/posts:
 *   post:
 *     tags: [Groups]
 *     summary: Create a group post
 *     description: Create a new post in a group (members only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - title
 *               - content
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID of the group
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
 *       403:
 *         description: Forbidden - not a group member
 *       404:
 *         description: Group not found
 *       400:
 *         description: Bad request
 */
router.post('/posts', requireAuth(), groupsController.createGroupPost);

/**
 * @swagger
 * /api/groups/{groupId}/posts:
 *   get:
 *     tags: [Groups]
 *     summary: Get group posts
 *     description: Get all posts for a specific group with pagination
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
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
 *         description: Group not found
 */
router.get('/:groupId/posts', groupsController.getGroupPosts);

/**
 * @swagger
 * /api/groups/replies:
 *   post:
 *     tags: [Groups]
 *     summary: Add reply to group post
 *     description: Add a reply to a group post (members only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - postId
 *               - content
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID of the group
 *               postId:
 *                 type: string
 *                 description: ID of the post
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
 *       403:
 *         description: Forbidden - not a group member
 *       404:
 *         description: Post not found
 *       400:
 *         description: Bad request
 */
router.post('/replies', requireAuth(), groupsController.addGroupPostReply);

/**
 * @swagger
 * /api/groups/posts/{postId}/replies:
 *   get:
 *     tags: [Groups]
 *     summary: Get replies for group post
 *     description: Get all replies for a specific group post with pagination
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group post
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
router.get('/posts/:postId/replies', groupsController.getGroupPostReplies);

export default router;
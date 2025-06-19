import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Creates a new social post in Firestore.
 * Ensures the request is authenticated.
 *
 * @param {functions.https.Request} request - The Express request.
 * @param {functions.Response} response - The Express response.
 */
export const createPost = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const userId = request.auth.uid;
  const { content, imageUrl } = request.body;

  // Basic input validation
  if (!content || typeof content !== 'string') {
    response.status(400).send('Content is required and must be a string');
    return;
  }

  // Validate imageUrl if provided
  if (imageUrl && typeof imageUrl !== 'string') {
     response.status(400).send('imageUrl must be a string');
     return;
  }


  try {
    // Add a new document to the 'posts' collection
    const newPostRef = await db.collection('posts').add({
      authorId: userId,
      content: content,
      imageUrl: imageUrl || null, // Store null if no image
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // Initialize interaction counts (optional but good practice)
      likeCount: 0,
      commentCount: 0,
    });

    response.status(201).send({ id: newPostRef.id, message: 'Post created successfully' });

  } catch (error) {
    console.error('Error creating post:', error);
    response.status(500).send('Error creating post');
  }
});

/**
 * Retrieves a list of social posts from Firestore.
 * Ensures the request is authenticated.
 * Supports basic pagination by 'limit' and 'startAfter' (timestamp).
 *
 * @param {functions.https.Request} request - The Express request. Expects optional 'limit' (number) and 'startAfter' (ISO string timestamp) query parameters.
 * @param {functions.Response} response - The Express response.
 */
export const getPosts = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const limit = request.query.limit ? parseInt(request.query.limit as string) : 20; // Default limit
  const startAfter = request.query.startAfter as string | undefined;

  let query: admin.firestore.Query = db.collection('posts').orderBy('createdAt', 'desc').limit(limit);

  // Implement pagination if startAfter is provided
  if (startAfter) {
    // Convert ISO string timestamp to a Firestore Timestamp object
    const startAfterTimestamp = admin.firestore.Timestamp.fromDate(new Date(startAfter));
    query = query.startAfter(startAfterTimestamp);
  }

  try {
    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    response.status(200).send(posts);

  } catch (error) {
    console.error('Error fetching posts:', error);
    response.status(500).send('Error fetching posts');
  }
});

/**
 * Creates a new comment on a social post in Firestore.
 * Ensures the request is authenticated.
 *
 * @param {functions.https.Request} request - The Express request. Expects 'postId' and 'content' in the request body.
 * @param {functions.Response} response - The Express response.
 */
export const createComment = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const userId = request.auth.uid;
  const { postId, content } = request.body;

  // Basic input validation
  if (!postId || typeof postId !== 'string') {
    response.status(400).send('postId is required and must be a string');
    return;
  }
  if (!content || typeof content !== 'string') {
    response.status(400).send('Content is required and must be a string');
    return;
  }

  try {
    // Add a new document to the 'comments' collection
    const newCommentRef = await db.collection('comments').add({
      postId: postId,
      authorId: userId,
      content: content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Consider updating the comment count on the parent post using a batched write or a distributed counter
    // For simplicity here, we are not implementing the counter update, but it's recommended for performance.

    response.status(201).send({ id: newCommentRef.id, message: 'Comment created successfully' });

  } catch (error) {
    console.error('Error creating comment:', error);
    response.status(500).send('Error creating comment');
  }
});

/**
 * Retrieves comments for a specific social post from Firestore.
 * Ensures the request is authenticated (users who can see the post can see comments).
 *
 * @param {functions.https.Request} request - The Express request. Expects 'postId' in the request body or query parameters.
 * @param {functions.Response} response - The Express response.
 */
export const getPostComments = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const postId = request.body.postId || request.query.postId;

  if (!postId || typeof postId !== 'string') {
    response.status(400).send('postId is required');
    return;
  }

  try {
    // Query the 'comments' collection for comments related to the postId
    const snapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'asc') // Show comments in chronological order
      .get();

    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    response.status(200).send(comments);

  } catch (error) {
    console.error('Error fetching comments:', error);
    response.status(500).send('Error fetching comments');
  }
});

/**
 * Handles liking or unliking a social post.
 * Ensures the request is authenticated.
 * Adds a document to the 'likes' collection on like, removes on unlike.
 * Updates the likeCount on the post document atomically.
 *
 * @param {functions.https.Request} request - The Express request. Expects 'postId' in the request body.
 * @param {functions.Response} response - The Express response.
 */
export const likePost = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const userId = request.auth.uid;
  const { postId } = request.body;

  // Basic input validation
  if (!postId || typeof postId !== 'string') {
    response.status(400).send('postId is required and must be a string');
    return;
  }

  const likeRef = db.collection('likes').doc(`${postId}_${userId}`); // Unique ID for each like
  const postRef = db.collection('posts').doc(postId);

  try {
    // Check if the like document already exists
    const likeDoc = await likeRef.get();

    const batch = db.batch();

    if (likeDoc.exists) {
      // User is unliking the post
      batch.delete(likeRef); // Delete the like document
      // Decrement the like count on the post
      batch.update(postRef, { likeCount: admin.firestore.FieldValue.increment(-1) });
      await batch.commit();
      response.status(200).send({ message: 'Post unliked successfully', status: 'unliked' });
    } else {
      // User is liking the post
      batch.set(likeRef, {
        postId: postId,
        userId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }); // Create the like document
      // Increment the like count on the post
      batch.update(postRef, { likeCount: admin.firestore.FieldValue.increment(1) });
      await batch.commit();
      response.status(200).send({ message: 'Post liked successfully', status: 'liked' });
    }

  } catch (error) {
    console.error('Error liking/unliking post:', error);
    response.status(500).send('Error liking/unliking post');
  }
});

/**
 * Retrieves like information for a specific social post.
 * Ensures appropriate access control.
 *
 * @param {functions.https.Request} request - The Express request. Expects 'postId' in the request body or query parameters.
 * @param {functions.Response} response - The Express response.
 */
export const getPostLikes = functions.https.onRequest(async (request, response) => {
  // Authorization check: For now, assume authenticated users can get like count.
  // More granular control could be added based on roles or post visibility.
  if (!request.auth) {
     response.status(401).send('Unauthorized');
     return;
   }

  const postId = request.body.postId || request.query.postId;

  if (!postId || typeof postId !== 'string') {
    response.status(400).send('postId is required');
    return;
  }

  try {
    // Retrieve the post document to get the like count
    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      response.status(404).send('Post not found');
      return;
    }

    const postData = postDoc.data();
    const likeCount = postData?.likeCount || 0;

    // Optionally, retrieve a list of users who liked the post.
    // This can be expensive for popular posts and might require pagination or a different approach.
    // For simplicity, we'll just return the count for now.

    // const likesSnapshot = await db.collection('likes').where('postId', '==', postId).get();
    // const likedByUserIds = likesSnapshot.docs.map(doc => doc.data().userId);

    response.status(200).send({ postId: postId, likeCount: likeCount });

  } catch (error) {
    console.error('Error fetching post likes:', error);
    response.status(500).send('Error fetching post likes');
  }
});

/**
 * Updates an existing social post in Firestore.
 * Ensures the request is authenticated and authorized (user is the author or an admin).
 *
 * @param {functions.https.Request} request - The Express request. Expects 'postId' and updated post data (e.g., 'content', 'imageUrl') in the request body.
 * @param {functions.Response} response - The Express response.
 */
export const updatePost = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const userId = request.auth.uid;
  const { postId, content, imageUrl } = request.body;

  // Basic input validation
  if (!postId || typeof postId !== 'string') {
    response.status(400).send('postId is required and must be a string');
    return;
  }

  // Construct update data, only include fields that are provided
  const updateData: { [key: string]: any } = {};
  if (content !== undefined && typeof content === 'string') {
    updateData.content = content;
  }
  if (imageUrl !== undefined && (typeof imageUrl === 'string' || imageUrl === null)) {
    updateData.imageUrl = imageUrl;
  }

  if (Object.keys(updateData).length === 0) {
      response.status(400).send('No valid fields to update provided');
      return;
  }

  const postRef = db.collection('posts').doc(postId);

  try {
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      response.status(404).send('Post not found');
      return;
    }

    const postData = postDoc.data();

    // Authorization check: Ensure the authenticated user is the author of the post.
    // Add admin check here if needed: || (await getUserRole(userId)).includes('admin')
    if (postData?.authorId !== userId) {
      response.status(403).send('Forbidden: You do not have permission to update this post');
      return;
    }

    await postRef.update(updateData);

    response.status(200).send({ id: postId, message: 'Post updated successfully' });

  } catch (error) {
    console.error('Error updating post:', error);
    response.status(500).send('Error updating post');
  }
});

/**
 * Deletes an existing social post from Firestore.
 * Ensures the request is authenticated and authorized (user is the author or an admin).
 * Requires careful consideration for deleting associated comments and likes.
 *
 * @param {functions.https.Request} request - The Express request. Expects 'postId' in the request body or URL parameters.
 * @param {functions.Response} response - The Express response.
 */
export const deletePost = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const userId = request.auth.uid;
  const postId = request.body.postId || request.query.postId;

  // Basic input validation
  if (!postId || typeof postId !== 'string') {
    response.status(400).send('postId is required');
    return;
  }

  const postRef = db.collection('posts').doc(postId);

  try {
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      response.status(404).send('Post not found');
      return;
    }

    const postData = postDoc.data();

    // Authorization check: Ensure the authenticated user is the author of the post.
    // Add admin check here if needed: || (await getUserRole(userId)).includes('admin')
    if (postData?.authorId !== userId) {
      response.status(403).send('Forbidden: You do not have permission to delete this post');
      return;
    }

    // TODO: Implement logic to also delete associated comments and likes.
    // This can be done using collection group queries and batched deletes, or triggered Cloud Functions.
    await postRef.delete();

    response.status(200).send({ id: postId, message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Error deleting post:', error);
    response.status(500).send('Error deleting post');
  }
});

/**
 * Updates an existing comment in Firestore.
 * Ensures the request is authenticated and authorized (user is the author or an admin).
 *
 * @param {functions.https.Request} request - The Express request. Expects 'commentId' and updated comment data (e.g., 'content') in the request body.
 * @param {functions.Response} response - The Express response.
 */
export const updateComment = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const userId = request.auth.uid;
  const { commentId, content } = request.body;

  // Basic input validation
  if (!commentId || typeof commentId !== 'string') {
    response.status(400).send('commentId is required and must be a string');
    return;
  }
  if (content === undefined || typeof content !== 'string') {
    response.status(400).send('Content is required and must be a string for update');
    return;
  }

  const commentRef = db.collection('comments').doc(commentId);

  try {
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      response.status(404).send('Comment not found');
      return;
    }

    const commentData = commentDoc.data();

    // Authorization check: Ensure the authenticated user is the author of the comment.
    // Add admin check here if needed: || (await getUserRole(userId)).includes('admin')
    if (commentData?.authorId !== userId) {
      response.status(403).send('Forbidden: You do not have permission to update this comment');
      return;
    }

    // Update the comment document
    await commentRef.update({ content: content });

    response.status(200).send({ id: commentId, message: 'Comment updated successfully' });

  } catch (error) {
    console.error('Error updating comment:', error);
    response.status(500).send('Error updating comment');
  }
});

/**
 * Deletes an existing comment from Firestore.
 * Ensures the request is authenticated and authorized (user is the author or an admin).
 * Considers updating the comment count on the parent post.
 *
 * @param {functions.https.Request} request - The Express request. Expects 'commentId' in the request body or URL parameters.
 * @param {functions.Response} response - The Express response.
 */
export const deleteComment = functions.https.onRequest(async (request, response) => {
  // Check if the user is authenticated
  if (!request.auth) {
    response.status(401).send('Unauthorized');
    return;
  }

  const userId = request.auth.uid;
  const commentId = request.body.commentId || request.query.commentId;

  // Basic input validation
  if (!commentId || typeof commentId !== 'string') {
    response.status(400).send('commentId is required');
    return;
  }

  const commentRef = db.collection('comments').doc(commentId);

  try {
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      response.status(404).send('Comment not found');
      return;
    }

    const commentData = commentDoc.data();

    // Authorization check: Ensure the authenticated user is the author of the comment.
    // Add admin check here if needed: || (await getUserRole(userId)).includes('admin')
    if (commentData?.authorId !== userId) {
      response.status(403).send('Forbidden: You do not have permission to delete this comment');
      return;
    }

    // TODO: Consider decrementing the comment count on the parent post using a batched write or a distributed counter.

    await commentRef.delete();

    response.status(200).send({ id: commentId, message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Error deleting comment:', error);
    response.status(500).send('Error deleting comment');
  }
});
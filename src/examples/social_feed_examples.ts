import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';

// Assuming Firebase is already initialized elsewhere in your application

/**
 * Creates a new post with optional image in the social feed.
 * @param userId The ID of the user creating the post.
 * @param content The text content of the post.
 * @param imageFile The image file to upload (optional).
 * @returns A promise that resolves when the post is successfully created.
 */
export const createPostWithImage = async (
  userId: string,
  content: string,
  imageFile?: File
): Promise<void> => {
  try {
    let imageUrl: string | undefined;

    if (imageFile) {
      // Upload image to Google Cloud Storage
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(`post_images/${Date.now()}_${imageFile.name}`);
      const snapshot = await imageRef.put(imageFile);
      imageUrl = await snapshot.ref.getDownloadURL();
    }

    // Create a new post document in Firestore
    const postsCollection = firebase.firestore().collection('posts');
    await postsCollection.add({
      author_id: userId,
      content: content,
      image_url: imageUrl,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Post created successfully!');
  } catch (error) {
    console.error('Error creating post:', error);
    throw error; // Re-throw the error for handling in the calling code
  }
};

interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  created_at: firebase.firestore.Timestamp;
  updated_at: firebase.firestore.Timestamp;
  author?: { // Optional author details for display
    name: string;
    // Add other relevant user fields here
  };
}

/**
 * Retrieves a list of posts for the social feed, ordered by timestamp.
 * @returns A promise that resolves with an array of Post objects.
 */
export const getSocialFeed = async (): Promise<Post[]> => {
  try {
    const postsCollection = firebase.firestore().collection('posts');
    const snapshot = await postsCollection.orderBy('created_at', 'desc').get();

    const posts: Post[] = [];
    for (const doc of snapshot.docs) {
      const postData = doc.data() as Omit<Post, 'id' | 'author'>; // Cast to partial Post type
      const post: Post = {
        id: doc.id,
        ...postData,
      };

      // Optionally fetch author details (can be optimized with joins or denormalization)
      if (post.author_id) {
        const userDoc = await firebase.firestore().collection('users').doc(post.author_id).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData) {
            post.author = {
              name: userData.name || 'Unknown User', // Assuming 'name' field exists in users
              // Add other relevant user fields
            };
          }
        }
      }

      posts.push(post);
    }

    console.log('Social feed retrieved successfully!');
    return posts;
  } catch (error) {
    console.error('Error fetching social feed:', error);
    throw error; // Re-throw the error for handling in the calling code
  }
};
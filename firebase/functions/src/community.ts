
// Note: The functions related to knowledge hub and courses have been removed
// from this file and are now located in `knowledge-hub.ts`.
// This file should only contain functions related to community and social engagement.
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getProfileByIdFromDB } from './profiles';

const db = admin.firestore();

// Helper to check for authentication in a consistent way
const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }
  return context.auth.uid;
};


export const getFeed = functions.https.onCall(async (data, context) => {
    // This is a placeholder implementation.
    // A real implementation would involve complex logic to aggregate posts,
    // marketplace listings, user connections, etc., into a personalized feed.
    const dummyPosts = [
        {
            id: 'feed1',
            type: 'forum_post',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            userId: 'userA',
            userName: 'Dr. Alima Bello',
            userAvatar: 'https://placehold.co/40x40.png',
            userHeadline: "Agricultural Economist & Supply Chain Specialist",
            content: 'Shared insights from the West Africa Post-Harvest Losses Summit. Key strategies discussed for improving storage and transportation for grains. Full report linked in the "Sustainable Agriculture" forum. #PostHarvest #FoodSecurity #AgriLogistics',
            link: '/forums/ft2',
            postImage: "https://placehold.co/600x350.png",
            dataAiHint: "conference agriculture",
            likesCount: 78,
            commentsCount: 12,
        },
        {
            id: 'feed2',
            type: 'marketplace_listing',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            userId: 'userB',
            userName: 'GreenLeaf Organics Co-op',
            userAvatar: 'https://placehold.co/40x40.png',
            userHeadline: "Connecting Organic Farmers to Global Buyers",
            content: "Fresh listing: 500kg of certified organic ginger, ready for export. Seeking partners in the European market. View specs and pricing on our Marketplace profile. #OrganicGinger #Export #DirectSourcing",
            link: '/marketplace/item3',
            postImage: "https://placehold.co/600x400.png",
            dataAiHint: "ginger harvest",
            likesCount: 135,
            commentsCount: 22,
        },
        {
            id: 'feed3',
            type: 'success_story',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            userId: 'userC',
            userName: 'AgriTech Solutions Ltd.',
            userAvatar: 'https://placehold.co/40x40.png',
            userHeadline: "Pioneering Technology for Efficient Agriculture",
            content: "Proud to announce our new partnership with 'FarmFresh Logistics' to implement AI-powered route optimization for their fleet, reducing fuel consumption by 15% and ensuring faster delivery of perishable goods! #AgriTech #Sustainability #LogisticsInnovation",
            link: '/profiles/agriTechSolutions',
            postImage: "https://placehold.co/600x350.png",
            dataAiHint: "technology agriculture",
            likesCount: 210,
            commentsCount: 35,
        }
    ];

    return { posts: dummyPosts };
});


export const createFeedPost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { content, pollOptions } = data; // pollOptions is an array of strings

    const userProfile = await getProfileByIdFromDB(uid);
    if (!userProfile) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    
    const newPostRef = db.collection('posts').doc();
    await newPostRef.set({
        content,
        userId: uid,
        userName: userProfile.displayName, // Denormalized data
        userAvatar: userProfile.avatarUrl || null, // Denormalized data
        userHeadline: userProfile.profileSummary || '', // Denormalized data
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        pollOptions: pollOptions ? pollOptions.map((opt: string) => ({ text: opt, votes: 0 })) : null,
    });
    
    return { success: true, postId: newPostRef.id };
});

export const likePost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { postId } = data;

    const postRef = db.collection('posts').doc(postId);
    const likeRef = postRef.collection('likes').doc(uid);
    
    return db.runTransaction(async (transaction) => {
        const likeDoc = await transaction.get(likeRef);
        
        if (likeDoc.exists) {
            // User is unliking the post
            transaction.delete(likeRef);
            transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(-1) });
            return { success: true, action: 'unliked' };
        } else {
            // User is liking the post
            transaction.set(likeRef, { createdAt: admin.firestore.FieldValue.serverTimestamp() });
            transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(1) });
            return { success: true, action: 'liked' };
        }
    });
});


export const addComment = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { postId, content } = data;

    if (!content || !postId) {
         throw new functions.https.HttpsError('invalid-argument', 'Post ID and content are required.');
    }

    const postRef = db.collection('posts').doc(postId);
    const commentRef = postRef.collection('comments').doc();

    const userProfile = await getProfileByIdFromDB(uid);
     if (!userProfile) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    const batch = db.batch();

    batch.set(commentRef, {
        content,
        userId: uid,
        userName: userProfile.displayName,
        userAvatar: userProfile.avatarUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(postRef, { commentsCount: admin.firestore.FieldValue.increment(1) });

    await batch.commit();
    return { success: true, commentId: commentRef.id };
});

// For fetching comments on feed items, which might be different from forum replies
export const getCommentsForPost = functions.https.onCall(async (data, context) => {
    const { postId } = data;
    if (!postId) {
        throw new functions.https.HttpsError("invalid-argument", "Post ID is required.");
    }
    
    const commentsSnapshot = await db.collection(`posts/${postId}/comments`).orderBy('createdAt', 'asc').get();

    const comments = commentsSnapshot.docs.map(doc => {
        const commentData = doc.data();
        return {
            id: doc.id,
            ...commentData,
            createdAt: (commentData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });

    return { comments };
});


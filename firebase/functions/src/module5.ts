
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// ... (existing functions) ...

/**
 * Cloud Function to fetch the details of a single course, including its modules.
 * This version replaces mock data with actual Firestore queries.
 */
export const getCourseDetails = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  
  const { courseId } = data;
  if (!courseId) {
    throw new functions.https.HttpsError("invalid-argument", "A courseId must be provided.");
  }

  const db = admin.firestore();

  try {
    // 1. Fetch the main course document
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Course not found.");
    }
    const courseData = { id: courseDoc.id, ...courseDoc.data() };

    // 2. Fetch the modules from the subcollection
    const modulesSnapshot = await db.collection('courses').doc(courseId).collection('modules').get();
    const modulesData = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Combine the data
    const finalData = {
      id: courseData.id,
      title: courseData.title_en,
      description: courseData.description_en,
      category: courseData.category,
      level: courseData.level,
      instructor: { name: 'Dr. Alima Bello', title: 'Senior Agronomist' }, // Instructor info would need another fetch
      modules: modulesData.map(m => ({
        id: m.id,
        title: m.moduleTitle_en,
        content: m.contentUrls || []
      })),
    };

    return { success: true, course: finalData };

  } catch (error) {
    console.error("Error fetching course details:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to fetch course details.");
  }
});

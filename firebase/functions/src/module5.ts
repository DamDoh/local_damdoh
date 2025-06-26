
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Role check helper (can be expanded)
async function requireAdmin(context: functions.https.CallableContext) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    // In a real app, you would check for an admin custom claim.
    // const user = await admin.auth().getUser(context.auth.uid);
    // if (user.customClaims?.admin !== true) {
    //     throw new functions.https.HttpsError("permission-denied", "User must be an admin.");
    // }
}


/**
 * Creates a new course in the 'courses' collection.
 * Requires admin privileges.
 */
export const createCourse = functions.https.onCall(async (data, context) => {
    // For this demo, we'll allow any authenticated user to create content.
    // In a production app, the requireAdmin(context) check should be enabled.
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { title_en, description_en, category, level, targetRoles } = data;
    if (!title_en || !description_en || !category || !level) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields for the course.");
    }

    try {
        const newCourseRef = await db.collection('courses').add({
            title_en,
            description_en,
            category,
            level,
            targetRoles: targetRoles || [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, courseId: newCourseRef.id };
    } catch (error: any) {
        console.error("Error creating course:", error);
        throw new functions.https.HttpsError("internal", "Failed to create course.", { originalError: error.message });
    }
});


/**
 * Creates a new module within a specific course's subcollection.
 * Requires admin privileges.
 */
export const createModule = functions.https.onCall(async (data, context) => {
    // For this demo, we'll allow any authenticated user to create content.
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { courseId, moduleTitle_en, contentUrls } = data;
    if (!courseId || !moduleTitle_en) {
        throw new functions.https.HttpsError("invalid-argument", "Course ID and module title are required.");
    }

    try {
        const newModuleRef = await db.collection('courses').doc(courseId).collection('modules').add({
            moduleTitle_en,
            contentUrls: contentUrls || [],
            order: 999, // Simple order, can be improved
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, moduleId: newModuleRef.id };
    } catch (error: any) {
        console.error("Error creating module:", error);
        throw new functions.https.HttpsError("internal", "Failed to create module.", { originalError: error.message });
    }
});


/**
 * Creates a new knowledge article (used for Blog, News, etc.).
 * Requires admin privileges.
 */
export const createKnowledgeArticle = functions.https.onCall(async (data, context) => {
    // For this demo, we'll allow any authenticated user to create content.
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { title_en, content_markdown_en, tags, category, excerpt_en, imageUrl, dataAiHint, author, title_km, content_markdown_km, excerpt_km } = data;
    if (!title_en || !content_markdown_en || !category || !excerpt_en) {
        throw new functions.https.HttpsError("invalid-argument", "Title, content, category, and excerpt are required.");
    }

    try {
        const newArticleRef = await db.collection('knowledge_articles').add({
            title_en,
            content_markdown_en,
            excerpt_en,
            title_km: title_km || null,
            content_markdown_km: content_markdown_km || null,
            excerpt_km: excerpt_km || null,
            category: category || "General",
            imageUrl: imageUrl || null,
            dataAiHint: dataAiHint || null,
            tags: tags || [],
            author: author || "DamDoh Team",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, articleId: newArticleRef.id };
    } catch (error: any) {
        console.error("Error creating knowledge article:", error);
        throw new functions.https.HttpsError("internal", "Failed to create article.", { originalError: error.message });
    }
});


/**
 * Fetches all knowledge articles, ordered by creation date.
 */
export const getKnowledgeArticles = functions.https.onCall(async (data, context) => {
    try {
        const articlesSnapshot = await db.collection('knowledge_articles').orderBy('createdAt', 'desc').get();
        const articles = articlesSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            // Ensure timestamps are ISO strings for the client
            createdAt: doc.data().createdAt.toDate().toISOString(),
            updatedAt: doc.data().updatedAt.toDate().toISOString(),
        }));
        return { success: true, articles };
    } catch (error) {
        console.error("Error fetching articles:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch articles.");
    }
});


/**
 * Fetches a single knowledge article by its ID.
 */
export const getKnowledgeArticleById = functions.https.onCall(async (data, context) => {
    const { articleId } = data;
    if (!articleId) {
        throw new functions.https.HttpsError("invalid-argument", "An articleId must be provided.");
    }

    try {
        const articleDoc = await db.collection('knowledge_articles').doc(articleId).get();
        if (!articleDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Article not found.");
        }
        const articleData = articleDoc.data()!;
        return { 
            success: true, 
            article: {
                id: articleDoc.id,
                ...articleData,
                createdAt: articleData.createdAt.toDate().toISOString(),
                updatedAt: articleData.updatedAt.toDate().toISOString(),
            }
        };
    } catch (error) {
        console.error(`Error fetching article ${articleId}:`, error);
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to fetch article details.");
    }
});


/**
 * Fetches all available courses.
 * This is a public-facing function.
 */
export const getAvailableCourses = functions.https.onCall(async (data, context) => {
    try {
        const coursesSnapshot = await db.collection('courses').orderBy('createdAt', 'desc').get();
        const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, courses: courses };
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch courses.");
    }
});


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

  try {
    // 1. Fetch the main course document
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Course not found.");
    }
    const courseData = { id: courseDoc.id, ...courseDoc.data()! };

    // 2. Fetch the modules from the subcollection
    const modulesSnapshot = await db.collection('courses').doc(courseId).collection('modules').orderBy('order', 'asc').get();
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

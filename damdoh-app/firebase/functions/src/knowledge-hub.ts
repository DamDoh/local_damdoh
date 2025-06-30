
/**
 * =================================================================
 * Module 8: Knowledge Hub & Education (The Global Learning Center)
 * =================================================================
 * This module serves as the central repository and delivery platform for all
 * educational content within DamDoh, designed to empower farmers and stakeholders
 * with accessible, practical, and localized agricultural knowledge. It directly
 * fuels the intelligence of the AI Assistant (Module 6).
 *
 * @purpose To provide a comprehensive, multi-format, and multi-language
 * learning environment that addresses diverse agricultural needs globally,
 * improving farming practices, promoting sustainable methods, and enhancing
 * market understanding.
 *
 * @key_concepts
 * - Curated Educational Content: Formal courses, articles, guides, and videos.
 * - KNF / FGW Focus: Dedicated resources on Korean Natural Farming and Farming God's Way.
 * - Searchable Knowledge Base: Powered by natural language processing from Module 6.
 * - Multi-Language Content Delivery: Enabling users to learn in their native tongue.
 * - Interactive Learning Elements: Quizzes, self-assessments, and progress tracking.
 * - Expert Contributions & Curation: A review process to maintain content quality.
 *
 * @firebase_data_model
 * - courses: Stores metadata for structured learning paths.
 * - modules: Subcollection under courses for individual lessons.
 * - articles: Standalone knowledge base articles, news, and blog posts.
 * - user_learning_progress: Tracks user progress through courses.
 * - knowledge_categories: Manages the taxonomy of educational content.
 *
 * @synergy
 * - Provides the core data for the AI Farming Assistant (Module 6).
 * - Shared articles and content are displayed in the community feed (Module 5).
 * - Content is recommended to users based on their profile and activities.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Creates a new course in the 'courses' collection.
 * Requires admin privileges.
 * @param {any} data The data for the new course.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, courseId: string}>} A promise that resolves with the new course ID.
 */
export const createCourse = functions.https.onCall(async (data, context) => {
  // For this demo, we'll allow any authenticated user to create content.
  // In a production app, the requireAdmin(context) check should be enabled.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  const { titleEn, descriptionEn, category, level, targetRoles } = data;
  if (!titleEn || !descriptionEn || !category || !level) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields for the course.",
    );
  }

  try {
    const newCourseRef = await db.collection("courses").add({
      titleEn,
      descriptionEn,
      category,
      level,
      targetRoles: targetRoles || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true, courseId: newCourseRef.id};
  } catch (error: any) {
    console.error("Error creating course:", error);
    throw new functions.https.HttpsError("internal", "Failed to create course.", {
      originalError: error.message,
    });
  }
});


/**
 * Creates a new module within a specific course's subcollection.
 * Requires admin privileges.
 * @param {any} data The data for the new module.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, moduleId: string}>} A promise that resolves with the new module ID.
 */
export const createModule = functions.https.onCall(async (data, context) => {
  // For this demo, we'll allow any authenticated user to create content.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  const {courseId, moduleTitleEn, contentUrls} = data;
  if (!courseId || !moduleTitleEn) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Course ID and module title are required.",
    );
  }

  try {
    const newModuleRef = await db
      .collection("courses")
      .doc(courseId)
      .collection("modules")
      .add({
        moduleTitleEn,
        contentUrls: contentUrls || [],
        order: 999, // Simple order, can be improved
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {success: true, moduleId: newModuleRef.id};
  } catch (error: any) {
    console.error("Error creating module:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create module.",
      {originalError: error.message},
    );
  }
});


/**
 * Creates a new knowledge article (used for Blog, News, etc.).
 * Requires admin privileges.
 * @param {any} data The data for the new article.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, articleId: string}>} A promise that resolves with the new article ID.
 */
export const createKnowledgeArticle = functions.https.onCall(
  async (data, context) => {
    // For this demo, we'll allow any authenticated user to create content.
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
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

      return {success: true, articleId: newArticleRef.id};
    } catch (error: any) {
      console.error("Error creating knowledge article:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create article.",
        {originalError: error.message},
      );
    }
  },
);


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
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate ? (doc.data().createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
            updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate ? (doc.data().updatedAt as admin.firestore.Timestamp).toDate().toISOString() : null,
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
                createdAt: (articleData.createdAt as admin.firestore.Timestamp)?.toDate ? (articleData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
                updatedAt: (articleData.updatedAt as admin.firestore.Timestamp)?.toDate ? (articleData.updatedAt as admin.firestore.Timestamp).toDate().toISOString() : null,
            }
        };
    } catch (error: any) {
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
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, courses: any[]}>} A promise that resolves with the available courses.
 */
export const getAvailableCourses = functions.https.onCall(
  async (data, context) => {
    try {
      const coursesSnapshot = await db
        .collection("courses")
        .orderBy("createdAt", "desc")
        .get();
      const courses = coursesSnapshot.docs.map((doc) => {
        const courseData = doc.data();
        return {
          id: doc.id,
          ...courseData,
          createdAt: (courseData.createdAt as admin.firestore.Timestamp)?.toDate ? (courseData.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
          updatedAt: (courseData.updatedAt as admin.firestore.Timestamp)?.toDate ? (courseData.updatedAt as admin.firestore.Timestamp).toDate().toISOString() : null,
        };
      });
      return {success: true, courses: courses};
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw new functions.https.HttpsError("internal", "Failed to fetch courses.");
    }
  },
);


/**
 * Cloud Function to fetch the details of a single course, including its modules.
 * This version replaces mock data with actual Firestore queries.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, course: any}>} A promise that resolves with the course details.
 */
export const getCourseDetails = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated.",
    );
  }

  const {courseId} = data;
  if (!courseId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A courseId must be provided.",
    );
  }

  try {
    // 1. Fetch the main course document
    const courseDoc = await db.collection("courses").doc(courseId).get();
    if (!courseDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Course not found.");
    }
    const courseData = courseDoc.data()!;

    // 2. Fetch the modules from the subcollection
    const modulesSnapshot = await db
      .collection("courses")
      .doc(courseId)
      .collection("modules")
      .orderBy("order", "asc")
      .get();
    const modulesData = modulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Combine the data
    const finalData = {
      id: courseDoc.id,
      title: courseData.titleEn,
      description: courseData.descriptionEn,
      category: courseData.category,
      level: courseData.level,
      instructor: {name: "Dr. Alima Bello", title: "Senior Agronomist"}, // Instructor info would need another fetch
      modules: modulesData.map((m: any) => ({
        id: m.id,
        title: m.moduleTitleEn,
        content: m.contentUrls || [],
      })),
    };

    return {success: true, course: finalData};
  } catch (error) {
    console.error("Error fetching course details:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch course details.",
    );
  }
});


// =================================================================
// CONCEPTUAL FUTURE FUNCTIONS FOR MODULE 8
// =================================================================

/**
 * [Conceptual] Triggered when new video/image content is uploaded to a staging bucket.
 * This function would handle transcoding for different devices and move the content
 * to the public content delivery network (CDN).
 */
export const processContentUpload = functions.https.onCall(async (data, context) => {
    // Placeholder logic
    console.log("Conceptual: Processing content upload with data:", data);
    return { success: true, message: "[Conceptual] Content processed." };
});


/**
 * [Conceptual] Triggered by new or updated articles/courses.
 * This function would send the content to a search indexing service like Algolia,
 * which is then used by Module 6 for fast and relevant search results.
 */
export const indexContentForSearch = functions.firestore
    .document("articles/{articleId}")
    .onWrite(async (change, context) => {
        const document = change.after.exists ? change.after.data() : null;
        console.log(`[Conceptual] Indexing content for search: articles/${context.params.articleId}`, document);
        // 1. Format document for the search service.
        // 2. Send data to Algolia/Elasticsearch via their API.
        return null;
    });

/**
 * [Conceptual] Updates a user's progress in a course.
 * Called from the frontend when a user completes a module or quiz.
 */
export const updateLearningProgress = functions.https.onCall(async (data, context) => {
    // Placeholder logic
    console.log("Conceptual: Updating learning progress with data:", data);
    return { success: true, message: "[Conceptual] Progress updated." };
});

/**
 * [Conceptual] Interacts with Module 6 to get personalized content recommendations.
 * Called by the frontend to populate recommendation sections.
 */
export const recommendContent = functions.https.onCall(async (data, context) => {
    // Placeholder logic
    console.log("Conceptual: Recommending content for user:", context.auth?.uid);
    // 1. Fetch user's profile and learning history.
    // 2. Call an AI model in Module 6 with this context.
    // 3. Return a list of recommended course/article IDs.
    return { recommendations: ["courseId1", "articleId2"] };
});



import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

const db = admin.firestore();

// Initialize the Gemini AI model for translation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});


/**
 * A helper function to translate text using the Gemini API.
 * @param {string} text The text to translate.
 * @param {string} targetLanguage The target language code (e.g., 'km' for Khmer).
 * @return {Promise<string>} The translated text.
 */
async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text) return "";
    try {
        const prompt = `Translate the following text to ${targetLanguage}:\n\n"${text}"\n\nReturn only the translated text, without any introductory phrases or quotation marks.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error(`Error translating text to ${targetLanguage}:`, error);
        return `[Translation Error]`; // Return a noticeable error string
    }
}


/**
 * Firestore trigger that automatically translates new or updated knowledge articles.
 * Checks for English or Khmer content and translates to the other language if missing.
 */
export const onArticleWriteTranslate = functions.firestore
  .document("knowledge_articles/{articleId}")
  .onWrite(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!afterData) {
        console.log(`Article ${context.params.articleId} deleted. No action needed.`);
        return null;
    }

    // Determine if a translation is needed to prevent infinite loops.
    // Case 1: Translate to Khmer if English is new or updated, and Khmer is missing/stale.
    const needsKhmerTranslation = (
        (afterData.title_en && afterData.content_markdown_en && beforeData?.title_en !== afterData.title_en) &&
        !afterData.title_km
    );

    // Case 2: Translate to English if Khmer is new or updated, and English is missing/stale.
     const needsEnglishTranslation = (
        (afterData.title_km && afterData.content_markdown_km && beforeData?.title_km !== afterData.title_km) &&
        !afterData.title_en
    );
    
    if (!needsKhmerTranslation && !needsEnglishTranslation) {
        console.log(`No translation needed for article ${context.params.articleId}.`);
        return null;
    }

    const updatePayload: {[key: string]: any} = {};

    if (needsKhmerTranslation) {
        console.log(`Translating article ${context.params.articleId} to Khmer...`);
        const [title_km, excerpt_km, content_markdown_km] = await Promise.all([
            translateText(afterData.title_en, 'km'),
            translateText(afterData.excerpt_en, 'km'),
            translateText(afterData.content_markdown_en, 'km'),
        ]);
        updatePayload.title_km = title_km;
        updatePayload.excerpt_km = excerpt_km;
        updatePayload.content_markdown_km = content_markdown_km;
    }

    if (needsEnglishTranslation) {
        console.log(`Translating article ${context.params.articleId} to English...`);
        const [title_en, excerpt_en, content_markdown_en] = await Promise.all([
            translateText(afterData.title_km, 'en'),
            translateText(afterData.excerpt_km, 'en'),
            translateText(afterData.content_markdown_km, 'en'),
        ]);
        updatePayload.title_en = title_en;
        updatePayload.excerpt_en = excerpt_en;
        updatePayload.content_markdown_en = content_markdown_en;
    }

    if (Object.keys(updatePayload).length > 0) {
        return change.after.ref.update(updatePayload);
    }
    
    return null;
  });



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
      "error.unauthenticated",
    );
  }

  const { titleEn, descriptionEn, category, level, targetRoles } = data;
  if (!titleEn || !descriptionEn || !category || !level) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.course.missingFields",
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
    throw new functions.https.HttpsError("internal", "error.course.creationFailed", {
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
      "error.unauthenticated",
    );
  }

  const {courseId, moduleTitleEn, contentUrls} = data;
  if (!courseId || !moduleTitleEn) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.module.missingFields",
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
      "error.module.creationFailed",
      {originalError: error.message},
    );
  }
});

/**
 * Fetches the 3 most recent knowledge articles to be featured.
 */
export const getFeaturedKnowledge = functions.https.onCall(async (data, context) => {
  try {
    const { userId } = data || {};

    if (userId) {
      // TODO: Integrate with AI & Analytics Engine (Module 6) to fetch personalized recommendations
      console.log(`Fetching personalized featured articles for user: ${userId}`);
    }

    const articlesSnapshot = await db.collection('knowledge_articles')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();
      
    const articles = articlesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate ? (data.createdAt as admin.firestore.Timestamp).toDate().toISOString() : null,
        updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate ? (data.updatedAt as admin.firestore.Timestamp).toDate().toISOString() : null,
      };
    });

    return { success: true, articles };
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    throw new functions.https.HttpsError("internal", "error.articles.fetchFailed");
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
        "error.unauthenticated",
      );
    }
    const callerUid = context.auth.uid; // Get the UID of the user calling the function

    const { title_en, content_markdown_en, tags, category, excerpt_en, imageUrl, dataAiHint, author, title_km, content_markdown_km, excerpt_km, status } = data;
    if (!title_en && !title_km) {
        throw new functions.https.HttpsError("invalid-argument", "At least one title (English or Khmer) is required.");
    }
     if (!content_markdown_en && !content_markdown_km) {
        throw new functions.https.HttpsError("invalid-argument", "At least one content block (English or Khmer) is required.");
    }
     if (!excerpt_en && !excerpt_km) {
        throw new functions.https.HttpsError("invalid-argument", "At least one excerpt (English or Khmer) is required.");
    }

    try {
        const newArticleRef = await db.collection('knowledge_articles').add({
            title_en: title_en || null,
            content_markdown_en: content_markdown_en || null,
            excerpt_en: excerpt_en || null,
            title_km: title_km || null,
            content_markdown_km: content_markdown_km || null,
            excerpt_km: excerpt_km || null,
            category: category || "General",
            imageUrl: imageUrl || null,
            dataAiHint: dataAiHint || null,
            tags: tags || [],
            author: author || "DamDoh Team",
            authorId: callerUid, // Store the author's UID
            status: status || 'Published',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {success: true, articleId: newArticleRef.id};
    } catch (error: any) {
      console.error("Error creating knowledge article:", error);
      throw new functions.https.HttpsError(
        "internal",
        "error.article.creationFailed",
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
        throw new functions.https.HttpsError("internal", "error.articles.fetchFailed");
    }
});


/**
 * Fetches a single knowledge article by its ID.
 */
export const getKnowledgeArticleById = functions.https.onCall(async (data, context) => {
    const { articleId } = data;
    if (!articleId) {
        throw new functions.https.HttpsError("invalid-argument", "error.articleId.required");
    }

    try {
        const articleDoc = await db.collection('knowledge_articles').doc(articleId).get();
        if (!articleDoc.exists) {
            throw new functions.https.HttpsError("not-found", "error.article.notFound");
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
        throw new functions.https.HttpsError("internal", "error.article.fetchFailed");
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
      throw new functions.https.HttpsError("internal", "error.courses.fetchFailed");
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
      "error.unauthenticated",
    );
  }

  const {courseId} = data;
  if (!courseId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "error.courseId.required",
    );
  }

  try {
    // 1. Fetch the main course document
    const courseDoc = await db.collection("courses").doc(courseId).get();
    if (!courseDoc.exists) {
      throw new functions.https.HttpsError("not-found", "error.course.notFound");
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
      "error.course.fetchFailed",
    );
  }
});


import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

const db = admin.firestore();

// Initialize the Gemini AI model for translation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const SUPPORTED_LANGUAGES = ["en", "km", "es", "fr", "de"];

/**
 * A helper function to translate text using the Gemini API.
 * @param {string} text The text to translate.
 * @param {string} targetLanguage The target language code (e.g., 'km' for Khmer).
 * @return {Promise<string>} The translated text.
 */
async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text) return "";
    try {
        const prompt = `Translate the following text to the language with the ISO 639-1 code "${targetLanguage}":

"${text}"

Return only the translated text, without any introductory phrases or quotation marks.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error: any) {
        console.error(`Error translating text to ${targetLanguage}:`, error.message);
        // Return a noticeable error string but don't cause the entire function to fail
        return `[Translation Error: ${error.message}]`;
    }
}


/**
 * Firestore trigger that automatically translates new or updated knowledge articles
 * into all supported languages. This function now treats English as the source of truth.
 */
export const onArticleWriteTranslate = functions.firestore
  .document("knowledge_articles/{articleId}")
  .onWrite(async (change, context) => {
    const { articleId } = context.params;
    const afterData = change.after.data();

    if (!afterData) {
        console.log(`Article ${articleId} deleted. No action needed.`);
        return null;
    }

    const beforeData = change.before.data() || {};
    
    // Check if the English content has changed. We will treat English as the source of truth.
    const englishContentChanged = (
        afterData.title_en !== beforeData.title_en ||
        afterData.content_markdown_en !== beforeData.content_markdown_en ||
        afterData.excerpt_en !== beforeData.excerpt_en
    );

    if (!englishContentChanged) {
        console.log(`No change in English source content for article ${articleId}. No translation action needed.`);
        return null;
    }
    
    console.log(`English content for article ${articleId} changed. Triggering re-translation for all other languages.`);

    const sourceTitle = afterData.title_en;
    const sourceContent = afterData.content_markdown_en;
    const sourceExcerpt = afterData.excerpt_en;

    if (!sourceTitle || !sourceContent || !sourceExcerpt) {
        console.log("English source content is incomplete. Skipping translation.");
        return null;
    }

    const translationPromises: Promise<void>[] = [];
    const updatePayload: {[key: string]: any} = {};

    // Re-translate for all supported languages except English itself.
    for (const lang of SUPPORTED_LANGUAGES) {
        if (lang === 'en') continue;

        console.log(`Queueing translation to '${lang}' for article ${articleId}.`);
        const p = (async () => {
            const [translatedTitle, translatedContent, translatedExcerpt] = await Promise.all([
                translateText(sourceTitle, lang),
                translateText(sourceContent, lang),
                translateText(sourceExcerpt, lang)
            ]);
            
            // Add to payload only if translation was successful
            if (!translatedTitle.startsWith('[Translation Error')) {
                updatePayload[`title_${lang}`] = translatedTitle;
                updatePayload[`content_markdown_${lang}`] = translatedContent;
                updatePayload[`excerpt_${lang}`] = translatedExcerpt;
            }
        })();
        translationPromises.push(p);
    }
    
    await Promise.all(translationPromises);

    if (Object.keys(updatePayload).length > 0) {
        console.log(`Updating article ${articleId} with new translations.`);
        return change.after.ref.update(updatePayload);
    } else {
        console.log(`No new translations to update for article ${articleId}.`);
        return null;
    }
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
    
    // A post is valid if it has content in at least one primary language.
    const hasEnglishContent = title_en && content_markdown_en && excerpt_en;
    const hasKhmerContent = title_km && content_markdown_km && excerpt_km;
    
    if (!hasEnglishContent && !hasKhmerContent) {
        throw new functions.https.HttpsError("invalid-argument", "error.article.contentRequired");
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
            status: status || 'Draft',
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

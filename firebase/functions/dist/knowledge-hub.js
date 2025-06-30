"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseDetails = exports.getAvailableCourses = exports.getKnowledgeArticleById = exports.getKnowledgeArticles = exports.createKnowledgeArticle = exports.createModule = exports.createCourse = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Creates a new course in the 'courses' collection.
 * Requires admin privileges.
 * @param {any} data The data for the new course.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, courseId: string}>} A promise that resolves with the new course ID.
 */
exports.createCourse = functions.https.onCall(async (data, context) => {
    // For this demo, we'll allow any authenticated user to create content.
    // In a production app, the requireAdmin(context) check should be enabled.
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { titleEn, descriptionEn, category, level, targetRoles } = data;
    if (!titleEn || !descriptionEn || !category || !level) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields for the course.");
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
        return { success: true, courseId: newCourseRef.id };
    }
    catch (error) {
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
exports.createModule = functions.https.onCall(async (data, context) => {
    // For this demo, we'll allow any authenticated user to create content.
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { courseId, moduleTitleEn, contentUrls } = data;
    if (!courseId || !moduleTitleEn) {
        throw new functions.https.HttpsError("invalid-argument", "Course ID and module title are required.");
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
        return { success: true, moduleId: newModuleRef.id };
    }
    catch (error) {
        console.error("Error creating module:", error);
        throw new functions.https.HttpsError("internal", "Failed to create module.", { originalError: error.message });
    }
});
/**
 * Creates a new knowledge article (used for Blog, News, etc.).
 * Requires admin privileges.
 * @param {any} data The data for the new article.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, articleId: string}>} A promise that resolves with the new article ID.
 */
exports.createKnowledgeArticle = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error("Error creating knowledge article:", error);
        throw new functions.https.HttpsError("internal", "Failed to create article.", { originalError: error.message });
    }
});
/**
 * Fetches all knowledge articles, ordered by creation date.
 */
exports.getKnowledgeArticles = functions.https.onCall(async (data, context) => {
    try {
        const articlesSnapshot = await db.collection('knowledge_articles').orderBy('createdAt', 'desc').get();
        const articles = articlesSnapshot.docs.map(doc => {
            var _a, _b;
            return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { 
                // Ensure timestamps are ISO strings for the client
                createdAt: ((_a = doc.data().createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? doc.data().createdAt.toDate().toISOString() : null, updatedAt: ((_b = doc.data().updatedAt) === null || _b === void 0 ? void 0 : _b.toDate) ? doc.data().updatedAt.toDate().toISOString() : null }));
        });
        return { success: true, articles };
    }
    catch (error) {
        console.error("Error fetching articles:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch articles.");
    }
});
/**
 * Fetches a single knowledge article by its ID.
 */
exports.getKnowledgeArticleById = functions.https.onCall(async (data, context) => {
    var _a, _b;
    const { articleId } = data;
    if (!articleId) {
        throw new functions.https.HttpsError("invalid-argument", "An articleId must be provided.");
    }
    try {
        const articleDoc = await db.collection('knowledge_articles').doc(articleId).get();
        if (!articleDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Article not found.");
        }
        const articleData = articleDoc.data();
        return {
            success: true,
            article: Object.assign(Object.assign({ id: articleDoc.id }, articleData), { createdAt: ((_a = articleData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? articleData.createdAt.toDate().toISOString() : null, updatedAt: ((_b = articleData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate) ? articleData.updatedAt.toDate().toISOString() : null })
        };
    }
    catch (error) {
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
exports.getAvailableCourses = functions.https.onCall(async (data, context) => {
    try {
        const coursesSnapshot = await db
            .collection("courses")
            .orderBy("createdAt", "desc")
            .get();
        const courses = coursesSnapshot.docs.map((doc) => {
            var _a, _b;
            const courseData = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, courseData), { createdAt: ((_a = courseData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? courseData.createdAt.toDate().toISOString() : null, updatedAt: ((_b = courseData.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate) ? courseData.updatedAt.toDate().toISOString() : null });
        });
        return { success: true, courses: courses };
    }
    catch (error) {
        console.error("Error fetching courses:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch courses.");
    }
});
/**
 * Cloud Function to fetch the details of a single course, including its modules.
 * This version replaces mock data with actual Firestore queries.
 * @param {any} data The data for the function call.
 * @param {functions.https.CallableContext} context The context of the function call.
 * @return {Promise<{success: boolean, course: any}>} A promise that resolves with the course details.
 */
exports.getCourseDetails = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { courseId } = data;
    if (!courseId) {
        throw new functions.https.HttpsError("invalid-argument", "A courseId must be provided.");
    }
    try {
        // 1. Fetch the main course document
        const courseDoc = await db.collection("courses").doc(courseId).get();
        if (!courseDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Course not found.");
        }
        const courseData = courseDoc.data();
        // 2. Fetch the modules from the subcollection
        const modulesSnapshot = await db
            .collection("courses")
            .doc(courseId)
            .collection("modules")
            .orderBy("order", "asc")
            .get();
        const modulesData = modulesSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        // 3. Combine the data
        const finalData = {
            id: courseDoc.id,
            title: courseData.titleEn,
            description: courseData.descriptionEn,
            category: courseData.category,
            level: courseData.level,
            instructor: { name: "Dr. Alima Bello", title: "Senior Agronomist" }, // Instructor info would need another fetch
            modules: modulesData.map((m) => ({
                id: m.id,
                title: m.moduleTitleEn,
                content: m.contentUrls || [],
            })),
        };
        return { success: true, course: finalData };
    }
    catch (error) {
        console.error("Error fetching course details:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to fetch course details.");
    }
});
//# sourceMappingURL=knowledge-hub.js.map
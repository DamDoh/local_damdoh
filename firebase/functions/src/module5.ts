import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Assuming admin and db are initialized in index.ts or a shared file
// import { db, storage } from './index'; // Assuming storage is initialized if needed for certificate generation
// import { db } from './index';

const db = admin.firestore();

// Import getRole and logic to get user/organization document from module2
// import { getRole, getUserDocument, getOrganizationDocument } from './module2';

// Helper function to get user role (Assuming this is implemented elsewhere or as a placeholder)
async function getRole(uid: string): Promise<string | null> {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
 return userDoc.data()?.primaryRole || null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

// Helper function to get user document
async function getUserDocument(uid: string): Promise<FirebaseFirestore.DocumentSnapshot | null> {
 try {
 const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.data()?.primaryRole || null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

// Helper function to get author reference (can be user or organization)
// This is a simplification; real logic might need to determine if the caller is acting
// as an individual author or on behalf of an organization.
async function getAuthorRef(uid: string): Promise<FirebaseFirestore.DocumentReference | null> {
    // For simplicity, assuming the user is the author for now.
    // TODO: Implement logic to determine if the user is linked to an organization
    // and should be acting as the organization author.
 const userDoc = await db.collection('users').doc(uid).get();
 if (userDoc?.exists) {
         // If the user is linked to an organization, return the organization's reference
 const linkedOrgRef = userDoc.data()?.linkedOrganizationRef as FirebaseFirestore.DocumentReference | null;
 if (linkedOrgRef) {
 return linkedOrgRef;
 }
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc?.exists) {
         // If the user is linked to an organization, return the organization's reference
         const linkedOrgRef = userDoc.data()?.linkedOrganizationRef as FirebaseFirestore.DocumentReference | null;
         if (linkedOrgRef) {
             return linkedOrgRef;
         }
         // Otherwise, return the user's reference
        return db.collection('users').doc(uid);
    }
    return null;
}


// --- Content Management Functions ---

// Callable function for content creators/admins to create a new course
export const createCourse = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create content.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Check for content creator or admin roles
    const contentWriterRoles = ['content_creator', 'admin', 'system']; // Define authorized roles
    if (!role || !contentWriterRoles.includes(role)) {
         throw new functions.https.HttpsError('permission-denied', 'User does not have permission to create courses.');
    }

    // Assuming data contains course details
    const { title_en, title_local, description_en, description_local, category, level, duration_minutes, thumbnailUrl, targetRoles, isOfflineAvailable = false, regionsApplicable } = data;

    // Basic validation
    if (!title_en || typeof title_en !== 'string' || !description_en || typeof description_en !== 'string' || !category || typeof category !== 'string' || !level || typeof level !== 'string' || typeof duration_minutes !== 'number' || !Array.isArray(targetRoles) || !Array.isArray(regionsApplicable)) {
         throw new functions.https.HttpsError('invalid-argument', 'Required course details (title_en, description_en, category, level, duration_minutes, targetRoles, regionsApplicable) are missing or invalid.');
    }

     // Validate level
     const validLevels = ['beginner', 'intermediate', 'advanced'];
     if (!validLevels.includes(level)) {
          throw new functions.https.HttpsError('invalid-argument', `Invalid level: ${level}. Valid levels are: ${validLevels.join(', ')}.`);
     }


    try {
        const authorRef = await getAuthorRef(callerUid); // Get the author's reference (optional for courses)

        const newCourseRef = db.collection('courses').doc(); // Auto-generate document ID
        const courseId = newCourseRef.id;

        await newCourseRef.set({
            courseId: courseId,
            title_en: title_en,
            title_local: title_local || {},
            description_en: description_en,
            description_local: description_local || {},
            category: category,
            level: level,
            duration_minutes: duration_minutes,
            thumbnailUrl: thumbnailUrl || null,
            instructorRef: authorRef, // Optional instructor reference
            targetRoles: targetRoles,
            isOfflineAvailable: isOfflineAvailable,
            regionsApplicable: regionsApplicable,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: null,
        });
        console.log(`New course created with ID: ${courseId} by user ${callerUid}`);


        return { courseId, status: 'created' };

    } catch (error) {
        console.error(`Error creating course for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to create course.', error);
    }
});

// Callable function for content creators/admins to update a course
export const updateCourse = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update content.');
    }

    const callerUid = context.auth.uid;
    const callerRole = await getRole(callerUid);

    // Check for content creator or admin roles
    const contentWriterRoles = ['content_creator', 'admin', 'system'];
    const isAuthorizedWriter = callerRole && contentWriterRoles.includes(callerRole);


    const { courseId, ...updates } = data;

    if (!courseId || typeof courseId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "courseId" parameter is required and must be a string.');
    }

    // Prevent updating sensitive or restricted fields
    const disallowedFields = ['courseId', 'createdAt'];
     for (const field of disallowedFields) {
         if (updates.hasOwnProperty(field)) {
             throw new functions.https.HttpsError('invalid-argument', `Updating the '${field}' field is not allowed.`);
         }
     }


    try {
        const courseRef = db.collection('courses').doc(courseId);
        const courseDoc = await courseRef.get();

        if (!courseDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Course document not found for ID: ${courseId}`);
        }

        // Authorization Check: Ensure the caller is authorized to update courses
        if (!isAuthorizedWriter) {
             throw new functions.https.HttpsError('permission-denied', 'User is not authorized to update courses.');
        }

        // Add updatedAt timestamp
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await courseRef.update(updates);
         console.log(`Course updated for ID: ${courseId} by user ${callerUid}`);

        return { courseId, status: 'updated' };

    } catch (error) {
        console.error(`Error updating course ${courseId} for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to update course.', error);
    }
});

// Callable function for content creators/admins to create a new module
export const createModule = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create content.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Check for content creator or admin roles
    const contentWriterRoles = ['content_creator', 'admin', 'system']; // Define authorized roles
    if (!role || !contentWriterRoles.includes(role)) {
         throw new functions.https.HttpsError('permission-denied', 'User does not have permission to create modules.');
    }

    // Assuming data contains module details
    const { courseId, moduleTitle_en, moduleTitle_local, description_en, description_local, order, contentUrls, quizRef } = data;

    // Basic validation
    if (!courseId || typeof courseId !== 'string' || !moduleTitle_en || typeof moduleTitle_en !== 'string' || typeof order !== 'number' || !Array.isArray(contentUrls)) {
         throw new functions.https.HttpsError('invalid-argument', 'Required module details (courseId, moduleTitle_en, order, contentUrls) are missing or invalid.');
    }


    try {
        const courseRef = db.collection('courses').doc(courseId);
        const courseDoc = await courseRef.get();

        if (!courseDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Parent course document not found for ID: ${courseId}`);
        }

        const newModuleRef = courseRef.collection('modules').doc(); // Auto-generate document ID
        const moduleId = newModuleRef.id;

        await newModuleRef.set({
            moduleId: moduleId,
            courseRef: courseRef,
            moduleTitle_en: moduleTitle_en,
            moduleTitle_local: moduleTitle_local || {},
            description_en: description_en || '',
            description_local: description_local || {},
            order: order,
            contentUrls: contentUrls,
            quizRef: quizRef || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: null,
        });
        console.log(`New module created with ID: ${moduleId} under course ${courseId} by user ${callerUid}`);


        return { moduleId, status: 'created' };

    } catch (error) {
        console.error(`Error creating module for course ${courseId} by user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to create module.', error);
    }
});

// Callable function for content creators/admins to update a module
export const updateModule = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update content.');
    }

    const callerUid = context.auth.uid;
    const callerRole = await getRole(callerUid);

    // Check for content creator or admin roles
    const contentWriterRoles = ['content_creator', 'admin', 'system'];
    const isAuthorizedWriter = callerRole && contentWriterRoles.includes(callerRole);


    const { courseId, moduleId, ...updates } = data;

    if (!courseId || typeof courseId !== 'string' || !moduleId || typeof moduleId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "courseId" and "moduleId" parameters are required and must be strings.');
    }

    // Prevent updating sensitive or restricted fields
    const disallowedFields = ['moduleId', 'courseRef', 'createdAt'];
     for (const field of disallowedFields) {
         if (updates.hasOwnProperty(field)) {
             throw new functions.https.HttpsError('invalid-argument', `Updating the '${field}' field is not allowed.`);
         }
     }


    try {
        const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
        const moduleDoc = await moduleRef.get();

        if (!moduleDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Module document not found for ID: ${moduleId} under course ${courseId}`);
        }

        // Authorization Check: Ensure the caller is authorized to update modules
        if (!isAuthorizedWriter) {
             throw new functions.https.HttpsError('permission-denied', 'User is not authorized to update modules.');
        }

        // Add updatedAt timestamp
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await moduleRef.update(updates);
         console.log(`Module updated for ID: ${moduleId} under course ${courseId} by user ${callerUid}`);

        return { moduleId, status: 'updated' };

    } catch (error) {
        console.error(`Error updating module ${moduleId} under course ${courseId} for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to update module.', error);
    }
});

// Callable function for content creators/admins to create a new knowledge article
export const createKnowledgeArticle = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create content.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Check for content creator or admin roles
    const contentWriterRoles = ['content_creator', 'admin', 'system']; // Define authorized roles
    if (!role || !contentWriterRoles.includes(role)) {
         throw new functions.https.HttpsError('permission-denied', 'User does not have permission to create knowledge articles.');
    }

    // Assuming data contains article details
    const { title_en, title_local, content_markdown_en, content_markdown_local, tags, targetRoles } = data;

    // Basic validation
    if (!title_en || typeof title_en !== 'string' || !content_markdown_en || typeof content_markdown_en !== 'string' || !Array.isArray(tags) || !Array.isArray(targetRoles)) {
         throw new functions.https.HttpsError('invalid-argument', 'Required article details (title_en, content_markdown_en, tags, targetRoles) are missing or invalid.');
    }


    try {
        const authorRef = await getAuthorRef(callerUid); // Get the author's reference (optional for articles)

        const newArticleRef = db.collection('knowledge_articles').doc(); // Auto-generate document ID
        const articleId = newArticleRef.id;

        await newArticleRef.set({
            articleId: articleId,
            title_en: title_en,
            title_local: title_local || {},
            content_markdown_en: content_markdown_en,
            content_markdown_local: content_markdown_local || {},
            tags: tags,
            targetRoles: targetRoles,
            authorRef: authorRef, // Optional author reference
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: null,
        });
        console.log(`New knowledge article created with ID: ${articleId} by user ${callerUid}`);


        return { articleId, status: 'created' };

    } catch (error) {
        console.error(`Error creating knowledge article for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to create knowledge article.', error);
    }
});

// Callable function for content creators/admins to update a knowledge article
export const updateKnowledgeArticle = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update content.');
    }

    const callerUid = context.auth.uid;
    const callerRole = await getRole(callerUid);

    // Check for content creator or admin roles
    const contentWriterRoles = ['content_creator', 'admin', 'system'];
    const isAuthorizedWriter = callerRole && contentWriterRoles.includes(callerRole);


    const { articleId, ...updates } = data;

    if (!articleId || typeof articleId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "articleId" parameter is required and must be a string.');
    }

    // Prevent updating sensitive or restricted fields
    const disallowedFields = ['articleId', 'createdAt'];
     for (const field of disallowedFields) {
         if (updates.hasOwnProperty(field)) {
             throw new functions.https.HttpsError('invalid-argument', `Updating the '${field}' field is not allowed.`);
         }
     }


    try {
        const articleRef = db.collection('knowledge_articles').doc(articleId);
        const articleDoc = await articleRef.get();

        if (!articleDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Knowledge article document not found for ID: ${articleId}`);
        }

        // Authorization Check: Ensure the caller is authorized to update articles
        if (!isAuthorizedWriter) {
             throw new functions.https.HttpsError('permission-denied', 'User is not authorized to update knowledge articles.');
        }

        // Add updatedAt timestamp
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await articleRef.update(updates);
         console.log(`Knowledge article updated for ID: ${articleId} by user ${callerUid}`);

        return { articleId, status: 'updated' };

    } catch (error) {
        console.error(`Error updating knowledge article ${articleId} for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to update knowledge article.', error);
    }
});


// --- User Progress Tracking Functions ---

// Callable function for the frontend to report user progress
export const trackUserCourseProgress = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
 throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to track progress.');
    }

    const callerUid = context.auth.uid;
    const { courseId, moduleId, completionStatus, score } = data;

    // Basic validation
    if (!courseId || typeof courseId !== 'string') {
 throw new functions.https.HttpsError('invalid-argument', 'The "courseId" parameter is required and must be a string.');
    }

    // Validate completionStatus if provided
    const validCompletionStatuses = ['not_started', 'in_progress', 'completed'];
 if (completionStatus && !validCompletionStatuses.includes(completionStatus)) {
         throw new functions.https.HttpsError('invalid-argument', `Invalid completionStatus: ${completionStatus}. Valid statuses are: ${validCompletionStatuses.join(', ')}.`);
    }

    try {
        const userRef = db.collection('users').doc(callerUid);
        const courseRef = db.collection('courses').doc(courseId);
        const userCourseProgressRef = db.collection('user_course_progress').doc(`${callerUid}_${courseId}`);

        const progressDoc = await userCourseProgressRef.get();

        if (!progressDoc.exists) {
            // Create a new progress document if it doesn't exist
            const initialProgressData: any = {
                userRef: userRef,
                courseRef: courseRef,
                completedModules: [],
                lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
                completionStatus: completionStatus || 'in_progress', // Default to in_progress
                score: score || null,
                certificateRef: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            if (moduleId) {
                initialProgressData.completedModules.push(moduleId);
            }

            await userCourseProgressRef.set(initialProgressData);
             console.log(`New user course progress created for user ${callerUid} on course ${courseId}`);

        } else {
            // Update existing progress document
            const updates: any = {
                lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            if (completionStatus) {
                updates.completionStatus = completionStatus;
            }

            if (score !== undefined) {
                updates.score = score;
            }

 if (moduleId && !progressDoc.data()?.completedModules.includes(moduleId)) {
 // Use arrayUnion to add the module ID to the completedModules array without duplicates
 updates.completedModules = admin.firestore.FieldValue.arrayUnion(moduleId);
            }

 await userCourseProgressRef.update(updates);
 console.log(`User course progress updated for user ${callerUid} on course ${courseId}`);
        }

        // TODO: Check if course is completed based on completed modules and total modules
        // If course is completed, trigger certificate generation (Placeholder for now)
        // This could be a triggered function or handled within this callable function
        // depending on complexity and error handling needs.
        // if (completionStatus === 'completed' || checkCourseCompletionLogic(...)) {
 // Trigger certificate generation
        //      await generateCertificateInternal(callerUid, courseId); // Internal function or publish message
        // }


        return { status: 'progress_tracked', userId: callerUid, courseId: courseId, moduleId: moduleId || null };

    } catch (error) {
        console.error(`Error tracking user progress for user ${callerUid} on course ${courseId}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to track user course progress.', error);
    }
});


// --- AI Integration Placeholder ---

// Placeholder for a triggered function to recommend learning content
// This function would be triggered by user activity (e.g., completing a module,
// viewing a VTI, performing a farm activity, interacting with the marketplace)
// and would use Module 8 to generate recommendations.
// export const recommendLearningContent = functions.firestore
//     .document('{collection}/{docId}') // Define appropriate triggers based on user activity
//     .onCreate(async (snapshot, context) => {
//         console.log('Triggered to recommend learning content...');
//         // Extract relevant data from the snapshot (e.g., user ID, activity details)
//         const userId = context.auth?.uid || snapshot.data()?.userId; // Example: get user ID from the trigger data
//         if (!userId) {
//             console.log('No user ID found in trigger data. Skipping recommendation.');
//             return null;
//         }
//         const activityData = snapshot.data();
//         const activityType = context.params.collection; // Example: collection name indicates activity type

//         try {
//             // Call Module 8 function to get AI-powered recommendations
//             // const recommendations = await recommendContentWithAI(userId, activityType, activityData); // Example Module 8 function

//             // Store or update user's recommendations (e.g., in a 'user_recommendations' collection)
//             // await db.collection('user_recommendations').doc(userId).set({
//             //     recommendedContent: recommendations,
//             //     lastUpdated: admin.firestore.FieldValue.serverTimestamp()
//             // }, { merge: true });
//             console.log(`Learning content recommendation process outlined for user ${userId} based on ${activityType}.`);

//         } catch (error) {
//             console.error(`Error recommending content for user ${userId}:`, error);
//             // TODO: Handle errors (e.g., log to error reporting)
//         }
//         return null; // Cloud Functions should return null or a promise
//     });


// --- Certificate Generation Placeholder ---

// Placeholder for a triggered function to generate a certificate upon course completion
// This function could be triggered by the 'trackUserCourseProgress' function
// updating the completionStatus to 'completed', or by a separate process.
// export const generateCertificate = functions.firestore
// .document('user_course_progress/{progressId}')
// .onUpdate(async (change, context) => {
// const progressDataAfter = change.after.data();
// const progressDataBefore = change.before.data();

//         // Check if the completion status changed to 'completed'
//         if (progressDataAfter.completionStatus === 'completed' && progressDataBefore.completionStatus !== 'completed') {
//             const userId = progressDataAfter.userRef.id;
//             const courseId = progressDataAfter.courseRef.id;
// console.log(`Course completion detected for user ${userId} on course ${courseId}. Generating certificate...`);

//             try {
// // 1. Fetch user and course details
// const userDoc = await getUserDocument(userId);
// const courseDoc = await db.collection('courses').doc(courseId).get();

// if (!userDoc || !userDoc.exists) {
// console.error(`User document not found for ${userId}. Cannot generate certificate.`);
// throw new Error(`User document not found for ${userId}`);
// }
// if (!courseDoc || !courseDoc.exists) {
// console.error(`Course document not found for ${courseId}. Cannot generate certificate.`);
// throw new Error(`Course document not found for ${courseId}`);
// }

// const userData = userDoc.data();
// const courseData = courseDoc.data();

// // Ensure essential data exists
// if (!userData?.displayName || !courseData?.title_en) {
// console.error(`Missing essential user or course data for certificate: User ${userId}, Course ${courseId}.`);
// throw new Error('Missing essential data for certificate generation.');
// }

// const userName = userData.displayName;
// const courseTitle = courseData.title_en; // Use English title for certificate by default, or support localization
// const completionDate = new Date(); // Use server timestamp of completion

// // 2. Generate the Certificate (Placeholder)
// console.log('Generating digital certificate (placeholder)...');
// // This step requires a library or service to generate a PDF or image.
// // Examples:
// // - PDF generation libraries (e.g., 'pdfmake', 'html-pdf')
// // - Image manipulation libraries (e.g., 'canvas', 'sharp')
// // - Using a dedicated certificate generation API/service.

// // Example Placeholder: Create dummy certificate content
// const certificateContent = `Certificate of Completion\n\nThis certifies that\n${userName}\n\nhas successfully completed the course\n"${courseTitle}"\n\non ${completionDate.toDateString()}`;
// console.log('Certificate Content Placeholder:', certificateContent);

// // TODO: Integrate a library or service here to generate the actual file.
// // Example using a hypothetical PDF generation:
// // const pdfDoc = new PDFDocument();
// // pdfDoc.text(certificateContent);
// // const pdfBuffer = await getBufferFromPdfDoc(pdfDoc); // Convert doc to buffer

// // Assume we have the certificate file content (e.g., as a Buffer)
// const generatedCertificateFileContent = Buffer.from(certificateContent); // Replace with actual generated content

// // 3. Store the generated certificate file in Cloud Storage
// const certificateFileName = `${userId}_${courseId}_certificate.pdf`; // Use a consistent naming convention
// const certificateStoragePath = `certificates/${certificateFileName}`;
// const fileRef = admin.storage().bucket().file(certificateStoragePath);
// await fileRef.save(generatedCertificateFileContent, { contentType: 'application/pdf' }); // Adjust contentType based on file type
// console.log(`Certificate saved to Cloud Storage: ${certificateStoragePath}`);

//                 // Update the user_course_progress document with the certificate reference/URL
//                 // await change.after.ref.update({
// certificateRef: fileRef, // Store reference to the storage file
// certificateGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
//                 // });
//                 console.log(`Certificate generation process outlined for user ${userId} on course ${courseId}.`);

//             } catch (error) {
//                 console.error(`Error generating certificate for user ${userId} on course ${courseId}:`, error);
//                 // TODO: Handle errors (e.g., log to error reporting, notify admin)
//                 await change.after.ref.update({
//                     certificateGenerationError: error.message,
//                     certificateGeneratedAt: admin.firestore.FieldValue.serverTimestamp() // Log attempted generation time
//                 });
//             }
//         }
//         return null; // Cloud Functions should return null or a promise
// });

// Placeholder function to get user document
// async function getUserDocument(uid: string): Promise<FirebaseFirestore.DocumentSnapshot | null> {
// try {
// const userDoc = await db.collection('users').doc(uid).get();
// return userDoc.exists ? userDoc : null;
// } catch (error) {
// console.error('Error getting user document:', error);
// return null;
// }
// }


// Helper function to get organization document (if needed for certificate branding)
// async function getOrganizationDocument(orgId: string): Promise<FirebaseFirestore.DocumentSnapshot | null> {
// try {
// const orgDoc = await db.collection('organizations').doc(orgId).get();
// return orgDoc.exists ? orgDoc : null;
// } catch (error) {
// console.error('Error getting organization document:', error);
// return null;
// }
//     });





import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Assuming admin and db are initialized in index.ts or a shared file
// import { db } from './index';

const db = admin.firestore();

// Import getRole and logic to get user/organization document from module2
// import { getRole, getUserDocument, getOrganizationDocument } from './module2';

// Helper function to get user role (Assuming this is implemented elsewhere or as a placeholder)
async function getRole(uid: string): Promise<string | null> {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.data()?.primaryRole || null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

// Helper function to get author reference (can be user or organization)
// This is a simplification; real logic might need to determine if the caller is acting
// as an individual author or on behalf of an organization.
async function getAuthorRef(uid: string): Promise<FirebaseFirestore.DocumentReference | null> {
    // For simplicity, assuming the user is the author for now.
    // TODO: Implement logic to determine if the user is linked to an organization
    // and should be acting as the organization author.
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc?.exists) {
         // If the user is linked to an organization, return the organization's reference
         const linkedOrgRef = userDoc.data()?.linkedOrganizationRef as FirebaseFirestore.DocumentReference | null;
         if (linkedOrgRef) {
             return linkedOrgRef;
         }
         // Otherwise, return the user's reference
        return db.collection('users').doc(uid);
    }
    return null;
}


// Callable function for content creators/admins to create a new content item
export const createContentItem = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create content.');
    }

    const callerUid = context.auth.uid;
    const role = await getRole(callerUid);

    // Check for content creator or admin roles
    const contentWriterRoles = ['content_creator', 'admin']; // Define authorized roles
    if (!role || !contentWriterRoles.includes(role)) {
         throw new functions.https.HttpsError('permission-denied', 'User does not have permission to create content.');
    }

    // Assuming data contains content metadata (title, type, description, etc.)
    const { title_en, title_local, contentType, description_en, description_local, tags, categories, externalUrl, status = 'draft' } = data;

    // Basic validation
    if (!title_en || typeof title_en !== 'string' || !contentType || typeof contentType !== 'string' || !description_en || typeof description_en !== 'string' || !externalUrl || typeof externalUrl !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'Required content metadata (title_en, contentType, description_en, externalUrl) is missing or invalid.');
    }

     // Validate contentType
     const validContentTypes = ['article', 'video', 'guide', 'course_module', 'skill_assessment'];
     if (!validContentTypes.includes(contentType)) {
          throw new functions.https.HttpsError('invalid-argument', `Invalid contentType: ${contentType}. Valid types are: ${validContentTypes.join(', ')}.`);
     }


    try {
        const authorRef = await getAuthorRef(callerUid); // Get the author's reference

        // Content items can potentially be created by system processes without a specific author
        // if (!authorRef) {
        //      throw new functions.https.HttpsError('internal', 'Could not determine author reference.');
        // }


        const newContentItemRef = db.collection('content_items').doc(); // Auto-generate document ID
        const contentId = newContentItemRef.id;

        await newContentItemRef.set({
            contentId: contentId,
            title_en: title_en,
            title_local: title_local || {},
            contentType: contentType,
            description_en: description_en,
            description_local: description_local || {},
            tags: Array.isArray(tags) ? tags : [],
            categories: Array.isArray(categories) ? categories : [],
            authorRef: authorRef, // Optional author reference
            externalUrl: externalUrl,
            status: status, // Allow setting initial status (draft or published)
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: null,
        });
        console.log(`New content item created with ID: ${contentId} by user ${callerUid}`);


        return { contentId, status: 'created' };

    } catch (error) {
        console.error(`Error creating content item for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to create content item.', error);
    }
});


// Callable function for content creators/admins to update a content item
export const updateContentItem = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update content.');
    }

    const callerUid = context.auth.uid;
    const callerRole = await getRole(callerUid);

    // Check for content creator or admin roles
    const contentWriterRoles = ['content_creator', 'admin'];
    const isAuthorizedWriter = callerRole && contentWriterRoles.includes(callerRole);


    const { contentId, ...updates } = data;

    if (!contentId || typeof contentId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "contentId" parameter is required and must be a string.');
    }

    // Prevent updating sensitive or restricted fields
    const disallowedFields = ['contentId', 'createdAt'];
     for (const field of disallowedFields) {
         if (updates.hasOwnProperty(field)) {
             throw new functions.https.HttpsError('invalid-argument', `Updating the '${field}' field is not allowed.`);
         }
     }


    try {
        const contentItemRef = db.collection('content_items').doc(contentId);
        const contentItemDoc = await contentItemRef.get();

        if (!contentItemDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Content item document not found for ID: ${contentId}`);
        }

        const contentItemData = contentItemDoc.data();

        // Authorization Check:
        // - Allow if the caller is the author of the content item.
        // - Allow if the caller has a content creator or admin role.
         const isAuthor = contentItemData?.authorRef?.id === callerUid;


        if (!isAuthor && !isAuthorizedWriter) {
             throw new functions.https.HttpsError('permission-denied', 'User is not authorized to update this content item.');
        }

        // Add updatedAt timestamp
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await contentItemRef.update(updates);
         console.log(`Content item updated for ID: ${contentId} by user ${callerUid}`);

        return { contentId, status: 'updated' };

    } catch (error) {
        console.error(`Error updating content item ${contentId} for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to update content item.', error);
    }
});


// Callable function for authorized users (admin/system) to delete a content item
export const deleteContentItem = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to delete content.');
    }

    const callerUid = context.auth.uid;
    const callerRole = await getRole(callerUid);

    // Check for admin or system roles (system role check might be internal)
    const authorizedRoles = ['admin']; // Define roles that can delete
    const isAuthorized = callerRole && authorizedRoles.includes(callerRole);
    // TODO: Add check for system role if callable function is used internally by system process


    const { contentId } = data;

    if (!contentId || typeof contentId !== 'string') {
         throw new functions.https.HttpsError('invalid-argument', 'The "contentId" parameter is required and must be a string.');
    }


    try {
        const contentItemRef = db.collection('content_items').doc(contentId);
        const contentItemDoc = await contentItemRef.get();

        if (!contentItemDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Content item document not found for ID: ${contentId}`);
        }

        // Authorization Check: Ensure the caller has permission to delete.
        // This check relies solely on the caller's role, as per the requirement.
        if (!isAuthorized) {
             throw new functions.https.HttpsError('permission-denied', 'User is not authorized to delete content items.');
        }

        await contentItemRef.delete();
         console.log(`Content item deleted for ID: ${contentId} by user ${callerUid}`);


        // TODO: Consider cascading deletes or handling references to this content item
        // in other collections (e.g., user_progress, learning_paths).
        // - If a content item is deleted, what happens to user progress on that item?
        // - If a content item is part of a learning path, should it be removed from the path?


        return { contentId, status: 'deleted' };

    } catch (error) {
        console.error(`Error deleting content item ${contentId} for user ${callerUid}:`, error);
         if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to delete content item.', error);
    }
});
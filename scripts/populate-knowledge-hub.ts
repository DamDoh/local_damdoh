
// This is a script to be run in a Node.js environment with Firebase Admin initialized.
// It uses the backend functions we've defined in module5.ts to populate the database.

import { initializeApp, cert } from 'firebase-admin/app';
import { getFunctions } from 'firebase-admin/functions';

// You would replace this with your actual service account key
const serviceAccount = require('./path/to/your/serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com"
});

const functions = getFunctions();

const createCourse = async (courseData: any) => {
    const callable = functions.httpsCallable('createCourse');
    try {
        const result = await callable(courseData);
        console.log("Successfully created course:", result.data);
        return result.data;
    } catch (error) {
        console.error("Error creating course:", error);
    }
};

const createModule = async (moduleData: any) => {
    const callable = functions.httpsCallable('createModule');
    try {
        const result = await callable(moduleData);
        console.log("Successfully created module:", result.data);
        return result.data;
    } catch (error) {
        console.error("Error creating module:", error);
    }
};

const createKnowledgeArticle = async (articleData: any) => {
    const callable = functions.httpsCallable('createKnowledgeArticle');
    try {
        const result = await callable(articleData);
        console.log("Successfully created knowledge article:", result.data);
        return result.data;
    } catch (error) {
        console.error("Error creating knowledge article:", error);
    }
};


const populateKnowledgeHub = async () => {
    console.log("Starting to populate the Knowledge Hub...");

    // 1. Create a course
    const courseResult = await createCourse({
        title_en: "Introduction to Sustainable Farming",
        description_en: "Learn the fundamentals of sustainable and regenerative agriculture.",
        category: "Sustainability",
        level: "Beginner",
        targetRoles: ["farmer", "field_agent"],
        regionsApplicable: ["Global"]
    });

    if (courseResult && courseResult.courseId) {
        const courseId = courseResult.courseId;

        // 2. Add modules to the course
        await createModule({
            courseId: courseId,
            moduleTitle_en: "Module 1: Principles of Soil Health",
            contentUrls: [{ type: "video", url: "https://www.youtube.com/watch?v=example1" }]
        });
        
        await createModule({
            courseId: courseId,
            moduleTitle_en: "Module 2: Water Conservation Techniques",
            contentUrls: [{ type: "video", url: "https://www.youtube.com/watch?v=example2" }]
        });
    }

    // 3. Create a standalone knowledge article
    await createKnowledgeArticle({
        title_en: "How to Choose the Right Fertilizer",
        content_markdown_en: "Choosing the right fertilizer depends on your crop type, soil health, and local climate...",
        tags: ["fertilizer", "soil health", "crop management"],
        targetRoles: ["farmer"]
    });

    console.log("Knowledge Hub population script finished.");
};

populateKnowledgeHub();

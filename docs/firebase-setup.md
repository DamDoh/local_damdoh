# DamDoh Firebase Project Setup Recommendations (Initial)

This document outlines the initial recommended setup for the DamDoh Firebase project. This is a starting point and may evolve as the application develops.

## 1. Enable Firebase Authentication

Navigate to the Authentication section in the Firebase console.
Enable the following sign-in methods to support diverse user onboarding:
*   Email/Password
*   Phone (Essential for broader farmer access)
*   Google (For convenience)
*   (Consider other providers like Facebook, Twitter later based on target audience demographics)

## 2. Set up Firestore Database

Navigate to the Firestore Database section in the Firebase console.
Start in "Native mode".
Create the following initial collections. These collections represent the core data models for the foundational architecture. Schemas for these collections are conceptually defined in `src/lib/schemas.ts` (or will be).

*   `users`: Stores user profiles, linked to Firebase Authentication UIDs, including stakeholder roles and preferences.
*   `farms`: Stores farm details, linked to farmer users.
*   `batches`: Stores batch information, the origin of Traceability IDs.
*   `traceability_events`: Stores events related to specific batches, building the traceability history.
*   `marketplace_listings`: Stores both product and service listings.
*   `marketplace_orders`: Stores records of transactions/applications initiated via the marketplace.
*   `reviews`: Stores reviews for marketplace listings.
*   `chats`: Stores chat thread information.
*   `messages`: Stores individual messages within chats.
*   `forums`: Stores forum topics and posts.
*   `financial_products`: Stores details of financial products offered by FIs.
*   `insurance_products`: Stores details of insurance products offered by IPs.
*   `applications`: Stores financial and insurance application records.
*   `notifications`: Stores user notifications.
*   `ai_prompts_logs`: Logs interactions with AI models for monitoring and improvement.

## 3. Enable Firebase Cloud Storage

Navigate to the Storage section in the Firebase console.
Enable Cloud Storage. This will be used for storing media files such as user avatars, listing images, and traceability photos.

## 4. Enable Firebase Cloud Functions

Navigate to the Functions section in the Firebase console.
Enable Cloud Functions. These will be used for backend logic, event triggers (like sending notifications or triggering AI), and potentially serving as microservice endpoints.

## 5. Link to Google Cloud Platform

Your Firebase project is automatically linked to a Google Cloud project. This linkage is essential for leveraging other Google Cloud services:

*   **BigQuery:** For large-scale data warehousing and analytics. Data can be exported from Firestore and Cloud Storage to BigQuery.
*   **Vertex AI:** For training, deploying, and managing custom AI/ML models (e.g., image recognition, prediction models).
*   **Other GCP Services:** As needed for more advanced microservices or infrastructure.

This initial setup provides the core Firebase services necessary to begin building the foundational components of the DamDoh super app. Remember to configure Firebase Security Rules for each service to ensure data is secure and accessible only to authorized users/services.
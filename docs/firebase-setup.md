# DamDoh Firebase Project Setup Recommendations (Initial)

This document outlines the initial recommended setup for the DamDoh Firebase project, aligning with the foundational architecture. For detailed schemas and service interactions, refer to the main **[DamDoh Architecture Document](./damdoh_architecture.md)**.

## 1. Enable Firebase Authentication

Navigate to the Authentication section in the Firebase console. Enable the following sign-in methods to support diverse user onboarding:
*   Email/Password
*   Phone (Essential for broader farmer access)
*   Google (For convenience)

## 2. Set up Firestore Database

Navigate to the Firestore Database section in the Firebase console and start in "Native mode". Create the following initial collections, which represent the core data models for the foundational architecture.

*   **`users`**: Stores profiles for all 21 stakeholder types, linked to Firebase Authentication UIDs.
*   **`farms`**: Stores farm details, linked to farmer users.
*   **`crops`**: Stores information about specific crops or livestock batches on a farm.
*   **`knf_batches`**: Tracks farmer-made KNF inputs.
*   **`traceability_events`**: Stores the immutable log of all events in the supply chain, linked to a VTI.
*   **`marketplaceItems`**: Stores all product and service listings for the marketplace.
*   **`posts`**: Stores social media posts for the main feed.
*   **`comments`**: Subcollection under posts for comments.
*   **`likes`**: Subcollection under posts for likes.
*   **`forums`**: Stores forum topic definitions.
*   **`forum_posts`**: Subcollection under forums for individual posts.
*   **`replies`**: Subcollection under forum_posts for replies.
*   **`groups`**: Stores community group information.
*   **`notifications`**: Stores user-specific notifications.
*   **`knowledge_base`**: Stores structured data for KNF/FGW recipes and techniques to power the AI Assistant.

*Note: More specialized collections like `applications`, `financial_products`, `insurance_policies`, etc., will be added as those modules are built out.*

## 3. Enable Firebase Cloud Storage

Navigate to the Storage section in the Firebase console. Enable Cloud Storage. This will be used for storing media files such as user avatars, listing images, and traceability evidence photos.

## 4. Enable Firebase Cloud Functions

Navigate to the Functions section in the Firebase console. Enable Cloud Functions. These will be used for backend logic, event triggers (like sending notifications or triggering AI), and serving as secure microservice endpoints.

## 5. Link to Google Cloud Platform

Your Firebase project is automatically linked to a Google Cloud project. This linkage is essential for leveraging other Google Cloud services:

*   **BigQuery:** For large-scale data warehousing and analytics.
*   **Vertex AI:** For training, deploying, and managing custom AI/ML models.

This initial setup provides the core Firebase services necessary to begin building the foundational components of the DamDoh super app. Remember to configure Firebase Security Rules for each service to ensure data is secure and accessible only to authorized users/services.

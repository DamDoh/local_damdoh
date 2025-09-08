# DamDoh Social Agriculture Platform - Foundational Architecture

This document outlines the foundational architecture for the DamDoh platform, designed to be a robust, AI-powered social platform for the agricultural ecosystem, supporting numerous stakeholders and global scalability.

## 1. Core Microservices

The platform is built on a microservices architecture to ensure scalability, maintainability, and independent deployment of functionalities. These services are implemented as Firebase Cloud Functions, providing a serverless and auto-scaling backend.

### 1. User Management Service
*   **Role:** Manages all user-related functionalities, including registration, authentication (handling diverse methods), user profiles for all stakeholder types, and role-based access control (RBAC).
*   **Interaction:** Interacts with almost all other services to verify user identity and authorization.

### 2. Farm & Agricultural Asset Service
*   **Role:** Stores and manages detailed information about farms, land plots, specific crops being grown, livestock, agricultural equipment, soil data, irrigation systems, and historical farming records.
*   **Interaction:** Provides data to the AI & Analytics Service for personalized advisories and to the Marketplace Service for listing produce or assets.

### 3. Social Feed & Community Service
*   **Role:** Manages the core social features: posts, comments, likes, shares, community groups, and forums.
*   **Interaction:** Leverages the AI & Analytics Service for content moderation and personalized feed recommendations.

### 4. Marketplace Service
*   **Role:** Facilitates the buying and selling of agricultural inputs, produce, and services. Manages listings, inquiries, negotiations, and order processing.
*   **Interaction:** Interacts with User Management, Farm & Asset Service, and the Financial & Transaction Service.

### 5. AI & Analytics Service
*   **Role:** Houses all AI models (powered by Genkit) for use cases like crop advisories, pest identification, market price prediction, and content moderation. Also responsible for data analytics and generating insights.
*   **Interaction:** Consumes data from various services and provides intelligent outputs back to them.

### 6. Communication Service
*   **Role:** Manages all communication channels: direct messaging, push notifications (FCM), email, and SMS.
*   **Interaction:** Triggered by events from other services (e.g., new order in Marketplace).

### 7. Financial & Transaction Service
*   **Role:** Manages all financial aspects: secure payment processing, escrow services, and integration with financial institutions for loans and other products.
*   **Interaction:** Works closely with the Marketplace and User Management services.

### 8. Traceability Service
*   **Role:** Records and manages the end-to-end journey of agricultural products using Verifiable Traceability IDs (VTIs).
*   **Interaction:** Receives events from Farm Management and the Marketplace; provides data for verification and consumer transparency.

### 9. Information & Knowledge Hub Service
*   **Role:** Manages educational content, including articles, courses, and tutorials on best practices (e.g., KNF, FGW).
*   **Interaction:** Provides content for the Social Feed and AI Assistant.

### 10. Regulatory & Compliance Service
*   **Role:** Helps users navigate regulatory requirements, manage compliance documentation, and stay updated on agricultural policies.
*   **Interaction:** Integrates with Traceability and User Management to verify compliance.

### 11. Insurance Service
*   **Role:** Manages insurance products, applications, and claims processing, often integrating with external insurance providers.
*   **Interaction:** Works with the Financial Service and leverages data from Farm & Asset Service for risk assessment.

### 12. Sustainability & Impact Service
*   **Role:** Tracks and quantifies the environmental and social impact of farming practices, including carbon footprint and water usage.
*   **Interaction:** Pulls data from the Farm & Asset Service and Traceability Service to generate reports and certifications.

---

## 2. Scalable Data Storage (Firestore & Cloud Storage)

The data storage strategy leverages Firebase and Google Cloud services for scalability and real-time capabilities.

### Firestore Collections

*   **`users`**: Stores profiles for all stakeholder types, linked to Firebase Auth UID.
*   **`farms`**: Stores information about individual farms.
*   **`crops`**: Stores information about crops being grown on farms.
*   **`knf_batches`**: Tracks farmer-made KNF inputs.
*   **`traceability_events`**: An immutable log of all supply chain events.
*   **`marketplaceItems`**: Stores listings for products and services.
*   **`posts`**, **`comments`**, **`likes`**: Manages social feed content.
*   **`forums`**, **`forum_posts`**, **`replies`**: Manages community forum content.
*   **`groups`**, **`group_posts`**, **`members`**: Manages community group information.
*   **`notifications`**: Stores user-specific notifications.
*   **`knowledge_base`**: Stores structured data for KNF/FGW recipes and techniques to power the AI Assistant.
*   **`search_index`**: A denormalized collection to enable fast, complex search queries across the platform.

### Other Storage
*   **Google Cloud Storage:** For large, unstructured data like images and videos (e.g., post images, profile pictures, traceability evidence).
*   **Google BigQuery:** For large-scale analytics, data warehousing, and training AI models. Data can be exported or streamed from Firestore.

---

## 3. Real-time Communication & Social Features
*   **Firestore Real-time Listeners:** For synchronizing data across connected clients (e.g., social feeds, live notifications).
*   **Firebase Cloud Messaging (FCM):** For sending push notifications to alert users of important events even when the app is inactive.

---

## 4. AI Integration Strategy (Genkit)
*   **Genkit Framework:** All AI logic is built using Genkit for structured, maintainable, and scalable AI flows.
*   **Personalized Advisories:** AI analyzes farm data, weather, and market trends to provide tailored recommendations.
*   **Pest & Disease Identification:** Image recognition models analyze user-uploaded photos to diagnose issues.
*   **Market Intelligence:** AI models predict market prices and demand trends.
*   **Smart Matching:** The AI connects stakeholders (e.g., farmers to buyers, FIs to eligible farmers) based on needs and profiles.
*   **Content Moderation & Summarization:** NLP models help maintain a healthy community environment and summarize long discussions.

---

## 5. Robust Authentication and Authorization
*   **Firebase Authentication:** Handles various login methods (email, phone, social) securely.
*   **Role-Based Access Control (RBAC):** Roles are stored in the `users` collection. Firebase Security Rules and Cloud Function logic enforce permissions based on these roles, ensuring users only access data and features relevant to them.
*   **Firebase App Check:** Protects backend resources from abuse and unauthorized access.

---

## 6. Frontend Architecture
*   **Next.js with React:** Chosen for its performance benefits (Server Components, App Router), strong TypeScript support, and robust ecosystem.
*   **Firebase SDKs:** The frontend interacts directly with Firebase services for authentication, real-time data, and storage.
*   **Internationalization (i18n):** The `next-intl` library is used to support multilingual content and region-specific features from the ground up.
*   **Offline Capabilities:** A robust "Outbox" pattern using IndexedDB ensures data durability. Firestore's built-in offline persistence is used for caching read data.

---

## 7. Observability & Monitoring
*   **Firebase Performance Monitoring:** To track app performance, including startup time and network latency.
*   **Firebase Crashlytics:** For real-time crash reporting to quickly fix stability issues.
*   **Cloud Logging & Trace:** For comprehensive backend monitoring and debugging across microservices.

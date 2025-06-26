# DamDoh Social Agriculture Platform - Foundational Architecture

This document outlines the foundational architecture for the DamDoh platform, designed to be a robust, AI-powered social platform for the agricultural ecosystem, supporting numerous stakeholders and global scalability.

## 1. Core Microservices

The platform will be built on a microservices architecture to ensure scalability, maintainability, and independent deployment of functionalities.

### 1. User Management Service
*   **Role:** Manages all user-related functionalities, including registration, authentication (handling diverse methods), user profiles for all 21 stakeholder types, role-based access control (RBAC), and permission management.
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
*   **Role:** Houses all AI models (powered by Gemini and Vertex AI) for use cases like crop advisories, pest identification, market price prediction, and content moderation. Also responsible for data analytics and generating insights.
*   **Interaction:** Consumes data from various services and provides intelligent outputs back to them.

### 6. Communication Service
*   **Role:** Manages all communication channels: direct messaging, push notifications (FCM), email, and SMS.
*   **Interaction:** Triggered by events from other services (e.g., new order in Marketplace).

### 7. Financial & Transaction Service
*   **Role:** Manages all financial aspects: secure payment processing, escrow services, and integration with financial institutions for loans and other products.
*   **Interaction:** Works closely with the Marketplace and User Management services.

### 8. Traceability Service
*   **Role:** Records and manages the end-to-end journey of agricultural products using Vibrant Traceability IDs (VTIs).
*   **Interaction:** Receives events from Farm Management, Marketplace, and Logistics services; provides data for verification and consumer transparency.

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

## 2. Scalable Data Storage (Firebase & Google Cloud)

The data storage strategy will leverage Firebase and Google Cloud services for scalability and real-time capabilities.

### Firestore Collections

*   **`users`**: Stores profiles for all 21 stakeholder types, linked to Firebase Auth UID.
    *   `uid`: (string) Firebase Auth UID
    *   `email`: (string)
    *   `displayName_en`: (string)
    *   `displayName_local`: (map) e.g., `{ "km": "ឈ្មោះ", "sw": "Jina" }`
    *   `roles`: (array of strings) e.g., ['Farmer', 'Buyer']
    *   `profileData`: (map) Role-specific data. For a **Farmer**, this might include `{farmIds: ['farm1', 'farm2']}`. For a **Financial Institution**, it might include `{fi_name: 'AgriBank', services_offered: ['loan', 'credit']}`.
    *   `createdAt`, `updatedAt`: (timestamps)

*   **`farms`**: Stores information about individual farms.
    *   `ownerId`: (string) Reference to `users` collection.
    *   `name`, `location`, `size`, `farmType`, etc.

*   **`crops`**: Stores information about crops being grown on farms.
    *   `farmId`: (string) Reference to `farms` collection.
    *   `cropType`, `plantingDate`, `harvestDate`, etc.

*   **`knf_batches`**: Tracks farmer-made KNF inputs.
    *   `userId`: (string) Reference to `users` collection.
    *   `type`: (string) 'fpj', 'faa', etc.
    *   `status`: (string) 'Fermenting', 'Ready', 'Used'.
    *   `startDate`, `nextStepDate`, etc.

*   **`traceability_events`**: An immutable log of all supply chain events.
    *   `vtiId`: (string) The Vibrant Traceability ID of the batch.
    *   `eventType`: (string) 'PLANTED', 'HARVESTED', 'PROCESSED', 'TRANSPORTED'.
    *   `actorRef`: (string) Reference to the user/organization performing the action.
    *   `payload`: (map) Event-specific data.

*   **`marketplaceItems`**: Stores listings for products and services.
    *   `sellerId`: (string) Reference to `users` collection.
    *   `listingType`: (string) 'Product' or 'Service'.
    *   `category`: (string) e.g., 'fresh-produce-fruits'.
    *   `name_en`: (string)
    *   `description_en`: (string)
    *   `name_local`, `description_local`: (maps) for i18n
    *   `price`, `currency`, `location`.
    *   `relatedTraceabilityId`: (string, optional) Links product to its VTI.

*   **`posts`**, **`comments`**, **`likes`**: Manages social feed content.
*   **`forums`**, **`forum_posts`**, **`replies`**: Manages community forum content.

### Other Storage
*   **Google Cloud Storage:** For large, unstructured data like images and videos (e.g., post images, profile pictures, traceability evidence).
*   **Google BigQuery:** For large-scale analytics, data warehousing, and training AI models. Data can be exported or streamed from Firestore.

---

## 3. Real-time Communication & Social Features
*   **Firestore Real-time Listeners:** For synchronizing data across connected clients (e.g., social feeds, live notifications).
*   **Firebase Cloud Messaging (FCM):** For sending push notifications to alert users of important events even when the app is inactive.

---

## 4. AI Integration Strategy (Gemini & Vertex AI)
*   **Genkit Framework:** All AI logic will be built using Genkit for structured, maintainable, and scalable AI flows.
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

## 6. Scalable Frontend Architecture
*   **Cross-Platform Framework (e.g., Next.js, Flutter):** Recommended for faster development and deployment across web, Android, and iOS.
*   **Firebase SDKs:** The frontend will interact directly with Firebase services for authentication, real-time data, and storage.
*   **Internationalization (i18n) & Localization (l10n):** The architecture must support multilingual content and region-specific features from the ground up.
*   **Offline Capabilities:** Firestore's built-in offline persistence is crucial for users in areas with limited connectivity.

---

## 7. Observability & Monitoring
*   **Firebase Performance Monitoring:** To track app performance, including startup time and network latency.
*   **Firebase Crashlytics:** For real-time crash reporting to quickly fix stability issues.
*   **Cloud Logging & Trace:** For comprehensive backend monitoring and debugging across microservices.

---

## 8. Development Workflow & CI/CD
*   **Version Control (Git):** For managing source code with clear branching strategies.
*   **Automated Testing:** Unit, integration, and end-to-end tests are essential for maintaining quality.
*   **CI/CD Pipeline (e.g., Cloud Build, GitHub Actions):** To automate builds, testing, and deployments to various environments (staging, production).
*   **Infrastructure as Code (IaC):** Using tools like Terraform to manage cloud infrastructure declaratively.

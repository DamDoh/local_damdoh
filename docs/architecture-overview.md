# DamDoh Platform Architecture: Core Modules

This document provides a high-level overview of the 14 core modules and services that constitute the DamDoh super app architecture. Each module is designed to be a distinct functional unit, interacting with others to create a cohesive platform experience.

## The 14 Core Modules

### 1. User & Profile Management
*   **Description:** The identity layer of DamDoh. It handles user registration, authentication (email, phone, social), and manages the detailed, role-specific profiles for all stakeholder types. This service is fundamental for personalization and security across the platform.
*   **Key Files:** `firebase/functions/src/profiles.ts`, `firebase/functions/src/stakeholder-profile-data.ts`, `src/lib/auth-utils.ts`

### 2. Farm & Asset Management
*   **Description:** The primary operational hub for farmers. This module allows users to create and manage their farms, log specific crops or livestock batches, and track the creation of agricultural inputs like Korean Natural Farming (KNF) concoctions.
*   **Key Files:** `firebase/functions/src/farm-management.ts`, `src/app/farm-management/**`

### 3. Traceability & VTI System
*   **Description:** The foundation of trust and transparency on the platform. This service generates Verifiable Traceability IDs (VTIs) for farm batches and provides the framework for logging every event in a product's lifecycle, from planting and input application to harvest and transport.
*   **Key Files:** `firebase/functions/src/traceability.ts`, `src/app/traceability/**`

### 4. Marketplace & E-commerce
*   **Description:** The commercial engine of DamDoh. This module facilitates the buying and selling of products, equipment, and services. It includes features for creating listings, a dedicated "Talent Exchange" for jobs, order processing, and promotional coupon systems for both items and events.
*   **Key Files:** `firebase/functions/src/marketplace.ts`, `firebase/functions/src/agri-events.ts`, `src/app/marketplace/**`, `src/app/talent-exchange/**`

### 5. Community & Collaboration
*   **Description:** The social heart of the platform. This module is designed to foster engagement and knowledge sharing through community forums, private groups for collaboration, a direct messaging system, and a main social feed for general updates.
*   **Key Files:** `firebase/functions/src/community.ts`, `firebase/functions/src/forums.ts`, `firebase/functions/src/groups.ts`, `src/app/forums/**`, `src/app/groups/**`, `src/app/messages/**`

### 6. AI & Analytics Engine
*   **Description:** The "brain" of the platform, powered by Genkit. This service houses all AI flows for features like the expert Farming Assistant (with FGW/KNF knowledge), intelligent connection suggestions, market price insights, and the Universal Search query interpreter.
*   **Key Files:** `src/ai/flows/**`, `src/ai/tools/**`, `firebase/functions/src/ai-services.ts`

### 7. Financial & Transaction Services
*   **Description:** The module for all financial activities. It handles the conceptual framework for secure payment processing, the digital wallet, a dynamic credit scoring system based on platform activity, and matching users with funding opportunities like loans and grants.
*   **Key Files:** `firebase/functions/src/financial-services.ts`, `src/app/wallet/**`

### 8. Knowledge Hub & Education
*   **Description:** The platform's learning center. This module manages all structured educational content, including formal courses, learning modules, and the articles that form the `knowledge_base` used to power the AI Farming Assistant.
*   **Key Files:** `firebase/functions/src/knowledge-hub.ts`, `src/app/knowledge-hub/**`

### 9. API Gateway & Integrations
*   **Description:** The platform's bridge to the outside world. This service is designed to integrate with external third-party services (like SMS gateways, weather data, or market data APIs) and to expose secure endpoints for trusted partners to interact with DamDoh data.
*   **Key Files:** `firebase/functions/src/api-gateway.ts`, `firebase/functions/src/api-keys.ts`

### 10. Regulatory & Compliance
*   **Description:** A specialized module to help stakeholders navigate complex regulatory landscapes. It provides the framework for generating compliance reports and helps users manage documentation for auditors and government agencies.
*   **Key Files:** `firebase/functions/src/regulatory-and-compliance.ts`

### 11. Insurance Services
*   **Description:** This service provides the backend logic for managing agricultural insurance. It includes conceptual flows for assessing policy risk, processing claims, and triggering parametric payouts based on external data (e.g., weather events).
*   **Key Files:** `firebase/functions/src/insurance.ts`

### 12. Sustainability & Impact Tracking
*   **Description:** This module is focused on the "planet" aspect of the platform's mission. It's designed to provide tools for tracking and quantifying the environmental impact of farming practices, such as calculating a product's carbon footprint based on its traceability log.
*   **Key Files:** `firebase/functions/src/sustainability.ts`, `src/app/sustainability/**`

### 13. Notifications System
*   **Description:** A cross-cutting service that acts as the engagement engine of the platform. It listens for important events (new messages, likes, comments, orders) and sends real-time, personalized notifications to users to keep them informed and draw them back to the app.
*   **Key Files:** `firebase/functions/src/notifications.ts`, `src/app/notifications/**`

### 14. Offline Synchronization
*   **Description:** A critical background service ensuring the app is functional and reliable for users in areas with poor or intermittent internet connectivity. It allows users to log data offline (e.g., farm activities) and syncs the changes with the server once a connection is re-established.
*   **Key Files:** `firebase/functions/src/offline_sync.ts`, `src/hooks/useOfflineSync.ts`

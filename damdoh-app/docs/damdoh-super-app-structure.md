# DamDoh Super App: Unified Application Structure

This document outlines the current, unified application structure of the DamDoh platform, built upon the "Super App" foundation. This structure prioritizes a centralized, role-based user experience over fragmented, siloed modules.

## 1. The Core: The Adaptive Dashboard (`/dashboard`)

The `dashboard` page is the heart of the user experience. It is no longer a generic feed but a dynamic, personalized command center that adapts to the user's role.

-   **Role-Based Hubs:** When a user logs in, the dashboard dynamically renders the appropriate "Hub" component (e.g., `FarmerDashboard`, `BuyerDashboard`, `LogisticsDashboard`) based on their `primaryRole`.
-   **Centralized Data Service:** All data for these hubs is fetched through a single, unified backend service (`dashboard_data.ts`), ensuring consistency and maintainability.
-   **Primary Entry Point:** The dashboard serves as the main entry point for a user's core tasks and provides at-a-glance information relevant to their operations.

## 2. Specialized Functional Verticals

Instead of numerous top-level navigation items, features are now grouped into dedicated sections or "verticals." These are deep-dive areas that users access from their dashboard, the main feed, or contextual links.

-   **/farm-management**: The operational suite for farmers to manage their farms, log crops, create KNF inputs, and log farm activities (planting, harvesting).
-   **/marketplace**: The unified commerce engine for all stakeholders to buy and sell products, equipment, and services.
-   **/talent-exchange**: A specialized view of the marketplace focused on jobs and professional services.
-   **/network**: The central directory for discovering and connecting with other stakeholders on the platform.
-   **/forums**: The community discussion area, with topics and posts.
-   **/agri-events**: A dedicated section for discovering, creating, and managing community events like workshops and conferences.
-   **/traceability**: The hub for viewing the end-to-end journey of products via their VTI (Verifiable Traceability ID).
-   **/messages**: The secure, one-to-one messaging center.
-   **/wallet**: The digital wallet for platform transactions (conceptual).

## 3. Cross-Cutting Services & Features

These are foundational elements that power the entire super app experience.

-   **Universal Search (Header & `/search`):** A single, AI-powered search bar allows users to find anything across all modules—people, products, forums, articles—from anywhere in the app.
-   **AI Engine (`/src/ai/`):** A centralized system of Genkit flows that provides intelligence across the platform, from the Farming Assistant to connection suggestions and search interpretation.
-   **User & Profile System (`/profiles`):** The identity layer that manages user accounts and detailed, role-specific profiles for all 24 stakeholders.
-   **Notifications System (`/notifications`):** The real-time engagement engine that alerts users to relevant activity across the platform.

## 4. App-Level Pages

These pages provide general information and functionality for all users.

-   `/` (Root): Now serves as the main entry point which dynamically loads the user's dashboard.
-   `/auth/*`: Handles all user authentication flows (sign-in, sign-up, password reset).
-   `/settings`: A unified page for managing profile, account, privacy, and appearance settings.
-   `/about`, `/contact`, `/careers`, `/privacy`, `/terms`: Standard informational pages.

This new structure creates a more cohesive, intelligent, and scalable user experience, laying the groundwork for DamDoh's growth as a global agricultural super app.

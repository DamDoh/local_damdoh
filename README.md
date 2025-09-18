# DamDoh: The Super App for Global Agri-Communities

> **Note:** All major development phases for the foundational architecture of the DamDoh super app are now complete. The platform is feature-rich, architecturally sound, and considered ready for its initial launch and user feedback cycles.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/ci/github/DamDoh/super-app.svg)](https://github.com/DamDoh/super-app/actions)
[![Firebase](https://img.shields.io/badge/Powered%20by-Firebase-orange)](https://firebase.google.com/)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)

Welcome to the official repository for DamDoh, the all-in-one super app designed to connect and empower agricultural communities worldwide. From smallholder farmers to large-scale enterprises, DamDoh provides the tools and resources needed to thrive in the digital age.

## [Star] Vision

Our vision is to create a single, unified platform that addresses the diverse needs of the agricultural sector. We aim to foster a global community where knowledge, resources, and opportunities are shared freely, creating a more sustainable and prosperous future for all.

## [Sparkles] Features

DamDoh is a comprehensive platform that includes a wide range of features, including:

*   **Marketplace:** A vibrant digital marketplace for buying and selling agricultural products and services.
*   **Knowledge Hub:** A rich repository of articles, guides, and best practices for modern farming.
*   **Community Forums:** A place for users to connect, ask questions, and share their experiences.
*   **Farm Management:** Tools for managing crops, livestock, and other farm activities.
*   **Financial Services:** Access to loans, insurance, and other financial products.
*   **Traceability:** A blockchain-based system for tracking products from farm to table.
*   **AI-Powered Insights:** Advanced analytics and AI-powered recommendations to help users make better decisions.

## [Rocket] Engineered for Global Scale

DamDoh isn't just a feature-rich application; it's an ecosystem engineered for security, high performance, and massive scalability from day one. We have proactively addressed the key challenges of building a global platform:

*   **Blazing-Fast, Scalable Search:** We've implemented a denormalized search index (`search_index`), allowing for complex, multi-faceted queries across the entire platform with millisecond latency, ensuring a smooth user experience even with billions of items.
*   **Ironclad Security:** The platform is built on a "default-deny" principle with granular, role-based Firestore security rules for every piece of data. User data is protected at every level.
*   **Seamless Offline Experience:** With a robust "Outbox" pattern using IndexedDB, user actions performed offline are securely queued and synced the moment a user reconnects. This is critical for users in areas with intermittent connectivity.
*   **Hybrid Cloud Architecture:** We leverage the best of serverless, using Firebase Functions for event-driven tasks and Google Cloud Run for performance-critical services (like AI analysis), eliminating cold starts and ensuring consistent speed.
*   **Data Privacy & Compliance:** We are committed to user privacy with built-in GDPR/CCPA compliance, including a "Right to be Forgotten" feature (`onUserDeleteCleanup`) that ensures a user's data can be completely and permanently erased upon request.
*   **Geospatial Efficiency:** Location-based queries are optimized using Geohashing, allowing for efficient "near me" searches without the need for a specialized database.

With these foundational pieces in place, the DamDoh platform is now considered architecturally complete and ready for its next phase of growth and user acquisition.

## [Wrench] Technology Stack

DamDoh is built on a modern, scalable, and reliable technology stack:

*   **Frontend:** [Next.js](https://nextjs.org/) with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/).
*   **Backend:** Serverless architecture using [Firebase Cloud Functions](https://firebase.google.com/docs/functions) and [Cloud Run](https://cloud.google.com/run).
*   **Database:** [Firestore](https://firebase.google.com/docs/firestore), a flexible, scalable NoSQL database.
*   **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth) for secure and easy user management.
*   **Storage:** [Cloud Storage for Firebase](https://firebase.google.com/docs/storage) for storing user-generated content.
*   **AI & Machine Learning:** [Genkit](https://firebase.google.com/docs/genkit) with [Google AI](https://ai.google/) for our AI-powered features.
*   **Deployment:** [Firebase Hosting](https://firebase.google.com/docs/hosting) for fast and secure content delivery.

## [Settings] Getting Started

To get started with local development, please follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/DamDoh/super-app.git
    cd super-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Firebase:**
    *   Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    *   Copy your Firebase project configuration into a new `.env` file at the root of the project. Use the `.env.example` file as a template.
    *   Set up a service account key and add it to your environment variables. See the Deployment section for details.

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  Open your browser to [http://localhost:3000](http://localhost:3000) to see the application in action.

## [Rocket] Deployment

To deploy the application to your Firebase project, follow these steps.

### 1. Install Firebase CLI

If you haven't already, install the Firebase Command Line Interface globally.

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

Log in to your Google account that has access to your Firebase project.

```bash
firebase login
```

### 3. Configure Your Project

Copy the environment variables from `.env.example` into a new file named `.env`. Then, fill in the values from your Firebase project's settings.

1.  **Go to Project Settings:** In the [Firebase Console](https://console.firebase.google.com/), select your project, click the gear icon, and go to "Project settings".
2.  **Find Web App Config:** In the "General" tab, scroll down to "Your apps". Find your web app and copy the `firebaseConfig` object values into your `.env` file.
3.  **Create Service Account (for backend functions):**
    *   In Project Settings, go to the "Service accounts" tab.
    *   Click "Generate new private key". A JSON file will be downloaded.
    *   **IMPORTANT:** Copy the entire content of this JSON file and set it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` in your `.env` file.
4.  **Set AI API Key:**
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to create an API key for Gemini.
    *   Copy the key and set it as the value for `GEMINI_API_KEY` in your `.env` file.

### 4. Deploy!

Once configured, run the following command from the root of your project to deploy everything (Hosting, Functions, and Rules):

```bash
firebase deploy
```

The first deployment may take a few minutes as it provisions your Cloud Functions. After deployment, your application will be live at the hosting URL provided by Firebase.

## [FileText] Documentation

For more detailed information about the DamDoh platform, please refer to our official documentation:

*   [Architecture Overview](docs/architecture-overview.md)
*   [Global Scalability Plan](docs/global-scalability-plan.md)
*   [Monitoring and Alerting Plan](docs/monitoring-and-alerting-plan.md)

## [Handshake] Contributing

We welcome contributions from the community! If you'd like to contribute to the DamDoh platform, please fork the repository and submit a pull request.

## [ScrollText] License

DamDoh is open-source software licensed under the [MIT License](https://opensource.org/licenses/MIT).

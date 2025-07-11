
# Cloud Run Migration Plan for Performance-Critical AI Services

## 1. Executive Summary

This document outlines the strategy and steps required to migrate performance-critical AI and data processing services from Firebase Cloud Functions to Google Cloud Run. This migration is a key recommendation from the Global Scalability Audit to mitigate cold start latency and provide a more consistent, low-latency user experience for computationally intensive operations.

**Target Services for Migration:**
*   `assessCreditRiskWithAI`
*   `matchFundingOpportunitiesWithAI`
*   `_internalProcessReportData`
*   The `performSearch` function's AI-powered query interpretation flow (future enhancement)

## 2. Rationale

*   **Eliminate Cold Starts:** Cloud Functions can experience "cold starts," where a new container instance needs to be provisioned, adding significant delay (2-10 seconds) to the first request. Cloud Run, when configured with a minimum instance count, keeps at least one container "warm" and ready to process requests instantly.
*   **Handle Long-Running Processes:** AI analysis and report generation can exceed the maximum timeout of Cloud Functions (up to 9 minutes). Cloud Run supports requests that run for up to 60 minutes, making it more suitable for these tasks.
*   **Greater Control & Flexibility:** Cloud Run allows for custom container images, enabling us to use any programming language, library, or binary. This will be beneficial as our AI capabilities become more sophisticated.

## 3. Migration Strategy: A Phased Approach

We will adopt a phased approach to minimize disruption and risk.

**Phase 1: Containerize the Express App & Deploy a Test Endpoint**
1.  **Create a new Express Server:** We will create a new file, `firebase/functions/src/server.ts`, that will house an Express.js server. This server will define the API endpoints for our Cloud Run service.
2.  **Create a Dockerfile:** A `Dockerfile` will be created in the `firebase/functions` directory to define the container image for our Node.js application.
3.  **Deploy to Cloud Run:** We will manually deploy the first version of the service to Cloud Run to test the setup.

**Phase 2: Migrate the AI Functions**
1.  **Move Logic:** The business logic from the existing Cloud Functions (`assessCreditRiskWithAI`, etc.) will be moved into the new Express server as dedicated API endpoints (e.g., `/api/ai/assess-risk`).
2.  **Update Client-Side Code:** The frontend application will be updated to call the new Cloud Run endpoints instead of the old Cloud Function callables. We will use feature flags to control the rollout of this change.

**Phase 3: Decommission Old Cloud Functions**
1.  **Monitor Usage:** After the migration is complete and the new Cloud Run service is stable, we will monitor the logs of the old Cloud Functions to ensure they are no longer being called.
2.  **Remove Functions:** Once we are confident that the old functions are no longer in use, we will safely remove them from the codebase.

## 4. Action Plan: Step-by-Step Implementation

### Step 1: Create the Express Server (`server.ts`)
*   Create `firebase/functions/src/server.ts`.
*   Install Express and CORS: `npm install express cors` in the `firebase/functions` directory.
*   Define a basic "hello world" endpoint to start.

### Step 2: Create the Dockerfile
*   Create `firebase/functions/Dockerfile`.
*   Use a standard Node.js base image.
*   Copy `package.json` and `package-lock.json` and run `npm install`.
*   Copy the rest of the application code.
*   Expose the server port and define the start command.

### Step 3: Deploy to Cloud Run (Manual)
*   Use the Google Cloud SDK (`gcloud`) to build the container image and deploy it to Cloud Run.
*   `gcloud builds submit --tag gcr.io/[PROJECT_ID]/damdoh-ai-service`
*   `gcloud run deploy damdoh-ai-service --image gcr.io/[PROJECT_ID]/damdoh-ai-service --platform managed --region [REGION] --allow-unauthenticated`
*   Test the deployed endpoint.

### Step 4: Implement the AI Endpoints
*   Refactor the logic from the Cloud Functions into the Express server.
*   Ensure proper error handling and authentication checks are in place.

### Step 5: Update the Frontend
*   Create a utility function to make authenticated requests to the new Cloud Run service.
*   Update the relevant components and services to use this new function.

## 5. Estimated Timeline

*   **Phase 1:** 1-2 days
*   **Phase 2:** 3-5 days
*   **Phase 3:** 1 day

This migration is a significant undertaking, but it is a crucial step in building a scalable and performant platform. By following this plan, we can ensure a smooth and successful transition.

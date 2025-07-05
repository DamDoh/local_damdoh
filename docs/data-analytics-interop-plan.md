# Data Interoperability & Analytics Architecture

This document outlines the architectural plan for ensuring data is standardized, interoperable via APIs, and ready for large-scale analytics, which is crucial for the DamDoh super app's intelligence layer.

## 1. Data Ontology & Standardization

A consistent data model is the foundation of interoperability. The goal is to ensure that a "crop" or a "location" means the same thing across all 14 microservices.

### Recommendation: Centralized Zod Schemas

*   **Strategy:** We will continue to use and expand the `src/lib/schemas.ts` file as the **single source of truth** for all core data structures on the platform. Any service or function that interacts with core entities (Users, MarketplaceItems, TraceabilityEvents) MUST validate data against these schemas.
*   **Standardization Example (Location):**
    *   **Bad:** Storing location as `"Nairobi"`, `"Kenya"`, `"Rift Valley"`. This is difficult to query.
    *   **Good:** Standardize on a structured object.
        ```typescript
        const LocationSchema = z.object({
          city: z.string().optional(),
          region: z.string().optional(),
          country: z.string(), // Required
          geoPoint: z.object({ // Firestore GeoPoint
            latitude: z.number(),
            longitude: z.number(),
          }).optional(),
        });
        ```
*   **Semantic Layer:** The Zod schemas, with their descriptive fields and validation rules, effectively form our semantic layer. For example, the `MarketplaceItemSchema` defines what constitutes a "listing", ensuring consistency whether it's created via the app, an API, or an internal process.

## 2. API Ecosystem Design

As DamDoh grows, external partners (financial institutions, logistics companies, government agencies) will need to interact with the platform programmatically.

### Recommendation: API Gateway with Secure, Versioned Endpoints

*   **Gateway:** We will use **Firebase Cloud Functions (HTTPS Callable)** as our primary API Gateway, as seen in `firebase/functions/src/api-gateway.ts`. This provides a secure, scalable, and integrated entry point.
*   **Authentication:** For external partners, API access must be authenticated using a method more robust than simple API keys.
    *   **Recommendation:** Implement **OAuth 2.0 (Client Credentials Flow)**. A trusted partner (like a financial institution) will be issued a `client_id` and `client_secret`. They exchange these for a short-lived bearer token, which is then passed in the `Authorization` header for all subsequent API calls.
*   **Authorization:** The API Gateway function will be responsible for decoding the token, identifying the partner, and checking their permissions (e.g., "read:vti_public", "write:marketplace_order") before allowing the request to proceed to the relevant microservice.
*   **Versioning:** API endpoints should be versioned in the URL to allow for non-breaking changes (e.g., `/api/v1/getVtiDetails`, `/api/v2/getVtiDetails`).

## 3. Big Data Analytics Pipeline

To provide valuable insights (e.g., market trends, yield forecasting), we need to move beyond simple Firestore queries and leverage a dedicated analytics platform.

### Recommendation: Firestore -> BigQuery Pipeline

*   **Architecture:** We will implement a data pipeline to stream data from our operational Firestore database into Google BigQuery, which is designed for large-scale analytical queries.

    ```mermaid
    graph TD
        subgraph "Operational Layer"
            FirestoreDB[Firestore Database]
        end

        subgraph "Data Pipeline (Google Cloud)"
            StreamTrigger[Cloud Function Trigger on write]
            PubSub[Pub/Sub Topic: 'firestore-events']
            Dataflow[Cloud Dataflow Job]
        end

        subgraph "Analytics & AI Layer"
            BigQuery[Google BigQuery Data Warehouse]
            VertexAI[Vertex AI / Genkit]
            Looker[Looker Studio Dashboards]
        end

        FirestoreDB -- "onWrite()" --> StreamTrigger
        StreamTrigger -- "Publish Event" --> PubSub
        PubSub --> Dataflow
        Dataflow -- "Transform & Load" --> BigQuery
        BigQuery --> VertexAI
        BigQuery --> Looker
    ```

*   **Implementation Steps:**
    1.  **Enable Firestore to BigQuery Stream:** Use the official Firebase Extension ([Stream Firestore to BigQuery](https://firebase.google.com/products/extensions/firebase-firestore-bigquery-export)) to automate this process. It handles creating the necessary Cloud Functions and BigQuery datasets.
    2.  **Run Analytical Queries:** Once data is in BigQuery, we can run complex SQL queries that would be impossible or too slow in Firestore.
        *   **Example Query (Average price of organic coffee in Kenya):**
            ```sql
            SELECT
              AVG(price) as average_price,
              COUNT(*) as number_of_listings
            FROM
              `your_project.marketplace_items_dataset.listings_raw_latest`
            WHERE
              category = 'fresh-produce-coffee'
              AND location.country = 'Kenya'
              AND isSustainable = true;
            ```
    3.  **Power AI and Dashboards:**
        *   **Vertex AI / Genkit:** Our AI flows can be enhanced to query these BigQuery tables to provide much more accurate market insights and predictions.
        *   **Looker Studio:** Business intelligence dashboards for internal use (e.g., platform growth, user activity) can be built directly on top of BigQuery.

This three-pronged approach ensures our data is clean, accessible, and ready to power the intelligent features that will define the DamDoh super app at a global scale.
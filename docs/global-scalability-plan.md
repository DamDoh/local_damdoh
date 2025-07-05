# Global Scalability & High Availability Plan

This document outlines the architectural strategies to ensure the DamDoh platform can scale to serve billions of users globally while maintaining high availability and low latency.

## 1. Geospatial Data Handling

As the platform grows, queries like "find all farms within 50km" or "show marketplace items near me" will become common and performance-critical.

### Recommendation: Geohashing in Firestore

*   **Strategy:** Instead of relying on Firestore's native geo-queries which have limitations, we will use **Geohashing**. A geohash is a string that encodes a geographic location. The longer the string, the more precise the location. Crucially, locations close to each other often have similar geohash prefixes.
*   **Implementation:**
    1.  When a farm or marketplace item is created/updated with a location, a Cloud Function will calculate its geohash (e.g., using a library like `ngeohash`).
    2.  This geohash and its prefixes will be stored in an array on the document.
        ```json
        // In a 'farms' document
        {
          "name": "Green Valley Farm",
          "location": { "latitude": -1.286389, "longitude": 36.817223 },
          "geohash": "kzf8sm",
          "geohash_prefixes": ["k", "kz", "kzf", "kzf8", "kzf8s"]
        }
        ```
    3.  **Querying:** To find farms near a user, we calculate the user's geohash prefix for the desired radius (e.g., a 5-character prefix covers an area of ~4.9km x 4.9km) and use a simple `array-contains` query in Firestore.
        ```typescript
        // Client-side query example
        const nearbyFarmsQuery = query(
          collection(db, "farms"),
          where("geohash_prefixes", "array-contains", "kzf8s")
        );
        ```
*   **Impact:** This approach allows for highly efficient, scalable proximity searches directly within Firestore, avoiding the need for a separate, specialized geospatial database in the initial phases of global expansion.

## 2. Database Architecture (Firestore)

A single Firestore instance will not handle billions of concurrent users efficiently. We must plan for horizontal scaling and multi-region deployment.

### Recommendation: Multi-Region Replication & Sharding

*   **Multi-Region Deployment:**
    *   **Strategy:** As DamDoh expands into new continents (e.g., Phase 3: Latin America & Southeast Asia), we will deploy Firestore in a **multi-region configuration** (e.g., `nam5` for North America, `eur3` for Europe). This places data closer to users in those regions, dramatically reducing latency.
    *   **Implementation:** This is a configuration choice made when creating a new Firebase project/Firestore instance. For existing projects, it requires a carefully planned migration. New projects for new regions should be multi-region from the start.

*   **Application-Level Sharding:**
    *   **Strategy:** For collections that will contain billions of documents (e.g., `traceability_events`, `notifications`), we will implement sharding at the application level. We will split writes across multiple collections based on a shard key.
    *   **Example (Traceability Events):**
        *   Instead of one massive `traceability_events` collection, we create `traceability_events_0`, `traceability_events_1`, ... `traceability_events_N`.
        *   The shard key could be a hash of the `vtiId`. `shard_id = hash(vtiId) % N`.
        *   All events for a specific VTI will go to the same shard, making queries for a single VTI history efficient.
    *   **Impact:** This bypasses Firestore's per-collection write limits and distributes the load, allowing for virtually unlimited horizontal scaling.

    ```mermaid
    graph TD
        A[Client Request: logTraceEvent(vtiId, ...)] --> B{Backend Function};
        B --> C{Calculate Shard ID <br/> `hash(vtiId) % 10`};
        C --> D0[Write to `trace_events_0`];
        C --> D1[Write to `trace_events_1`];
        C --> D2[Write to `trace_events_...`];
        C --> D9[Write to `trace_events_9`];
    ```

## 3. CDN & Edge Computing Strategy

Fast content delivery is crucial for user experience.

### Recommendation: Leverage Firebase Hosting CDN & Edge Functions

*   **CDN for Static Assets:**
    *   **Strategy:** **Firebase Hosting** has a global CDN built-in by default. All static assets (images, videos, JS/CSS bundles) should be served through Firebase Hosting or Cloud Storage for Firebase, which automatically leverages this CDN to cache content close to users.
    *   **Action:** Ensure all user-uploaded content (profile pictures, marketplace images) is stored in a Cloud Storage for Firebase bucket.

*   **Edge Computing for Dynamic Content:**
    *   **Strategy:** For dynamic, personalized content, we can use **Edge Functions** (e.g., Cloudflare Workers if using Cloudflare, or by deploying Cloud Functions to regions closer to the user).
    *   **Example Use Case:** A user in Vietnam requests their dashboard. An Edge Function located in Asia could pre-fetch their user data, recent marketplace listings relevant to Vietnam, and render a personalized page shell *at the edge*, before it's sent to the user's device. This significantly reduces perceived latency compared to a request traveling all the way to a central US server.

## 4. Backend Compute Strategy

Choosing the right compute service is a balance between cost, performance, and scalability.

### Recommendation: Hybrid Serverless & Containerized Approach

*   **Firebase Cloud Functions (Serverless):**
    *   **Best for:** Event-driven, bursty, or unpredictable workloads. This is perfect for our triggers like `onNewUserCreate`, `processOfflineChange`, and simple API endpoints.
    *   **Benefit:** Scales to zero (cost-effective) and automatically scales up under load.

*   **Google Cloud Run (Containerized):**
    *   **Best for:** Long-running, computationally intensive, or consistent-traffic services. This would be ideal for:
        *   A dedicated AI service that needs large models loaded into memory.
        *   A data processing service for our analytics pipeline.
        *   A high-traffic API gateway that requires consistent "warm" start times.
    *   **Benefit:** Consistent performance (no cold starts after initial setup), predictable cost at scale, and portability (can run any Docker container).

*   **Integration:** Cloud Functions can easily invoke Cloud Run services via authenticated HTTP requests, allowing us to build a robust microservices architecture that uses the best tool for each job.

By implementing these strategies, we build a foundation that is not only prepared for immense scale but is also resilient, performant, and cost-effective for a global user base.
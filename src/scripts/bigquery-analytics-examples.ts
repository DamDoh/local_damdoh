
// A standalone script to demonstrate how large-scale analytics will be performed
// once the Firestore to BigQuery pipeline is established as per `data-analytics-interop-plan.md`.
// This is not intended to be run directly but serves as a blueprint for the data team.

import { BigQuery } from '@google-cloud/bigquery';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const datasetId = "damdoh_analytics"; // Assumed dataset name

// Initialize BigQuery client
const bigquery = new BigQuery({ projectId });

async function runAnalyticsQueries() {
  console.log("Running example BigQuery analytics queries...");

  // Example 1: Calculate the average price of a specific marketplace category
  const avgPriceQuery = `
    SELECT
      category,
      AVG(price) as average_price,
      COUNT(*) as number_of_listings
    FROM
      \`${projectId}.${datasetId}.marketplaceItems_raw_latest\`
    WHERE
      category = 'fresh-produce-fruits'
      AND price IS NOT NULL
    GROUP BY
      category;
  `;

  // Example 2: Count the number of traceability events by type
  const eventCountQuery = `
    SELECT
      eventType,
      COUNT(vtiId) as event_count
    FROM
      \`${projectId}.${datasetId}.traceability_events_raw_latest\`
    GROUP BY
      eventType
    ORDER BY
      event_count DESC;
  `;

  // Example 3: Find the most active users based on the number of posts
  const userActivityQuery = `
    SELECT
        authorName,
        authorRef,
        COUNT(postId) as post_count
    FROM
        \`${projectId}.${datasetId}.posts_raw_latest\`
    GROUP BY
        authorName, authorRef
    ORDER BY
        post_count DESC
    LIMIT 10;
  `;

  try {
    console.log("\n--- Average Fruit Price Query ---");
    const [avgPriceJob] = await bigquery.createQueryJob({ query: avgPriceQuery });
    const [avgPriceRows] = await avgPriceJob.getQueryResults();
    console.log("Results:", avgPriceRows);

    console.log("\n--- Traceability Event Count Query ---");
    const [eventCountJob] = await bigquery.createQueryJob({ query: eventCountQuery });
    const [eventCountRows] = await eventCountJob.getQueryResults();
    console.log("Results:", eventCountRows);

    console.log("\n--- Top User Activity Query ---");
    const [userActivityJob] = await bigquery.createQueryJob({ query: userActivityQuery });
    const [userActivityRows] = await userActivityJob.getQueryResults();
    console.log("Results:", userActivityRows);

  } catch (error) {
    console.error("ERROR:", error);
  }
}

// To run this script (once the pipeline is active):
// 1. Ensure you are authenticated with Google Cloud: `gcloud auth application-default login`
// 2. You will need to install the required packages: `npm install @google-cloud/bigquery`
// 3. From your project root, run: `ts-node ./src/scripts/bigquery-analytics-examples.ts`

// runAnalyticsQueries();

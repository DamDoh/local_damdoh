import { NextResponse } from 'next/server';

interface ApiResponseOptions {
  status?: number;
  headers?: HeadersInit;
}

export function successResponse(data: any, options?: ApiResponseOptions): NextResponse {
  return NextResponse.json(data, {
    status: options?.status || 200,
    headers: options?.headers,
  });
}

export function errorResponse(message: string, status: number, details?: any): NextResponse {
  return NextResponse.json(
    {
      error: {
        message,
        status,
        details,
      },
    },
    { status }
  );
}

export function clientErrorResponse(message: string, details?: any): NextResponse {
  return errorResponse(message, 400, details);
}

export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = "Forbidden"): NextResponse {
  return errorResponse(message, 403);
}

export function notFoundResponse(resourceName: string = "Resource"): NextResponse {
  return errorResponse(`${resourceName} not found.`, 404);
}

export function serverErrorResponse(message: string = "Internal Server Error", details?: any): NextResponse {
  console.error("Server Error:", message, details); // Log server errors
  return errorResponse(message, 500, details);
}

// Conceptual Cloud Function: requestVerifiedData
// AI Help Note: "Firebase Security Rules for conditional data access based on consent flags in another document."
// AI Help Note: "Cloud Function to securely aggregate consented user data."
// This conceptual Callable Cloud Function would be triggered by an FI/IP user from their dashboard
// when they are reviewing an application and need access to consented data.
// Inputs: applicationId (string) - The ID of the application the FI/IP is reviewing.
//
// Logic:
// 1. Authenticate the caller and verify their role is 'financial_institution' or 'insurance_provider'.
// 2. Fetch the specified application document from the 'applications' collection using applicationId.
// 3. Verify that the calling user's ID matches the 'providerId' in the application document. If not, deny access.
// 4. Read the 'consentGivenForDataSharing' object from the application document.
// 5. Based on the boolean flags in 'consentGivenForDataSharing', conditionally fetch data from other collections:
//    - If 'farmData' is true: Fetch relevant data from the 'farms' collection for the applicantId.
//    - If 'marketplaceSalesHistory' is true: Fetch relevant data from the 'marketplace_orders' collection for the applicantId, filtering by completed/relevant orders.
//    - If 'traceabilityReports' is true: Fetch relevant data from the 'traceability_events' collection for batches linked to the applicantId's farms or recent orders.
//    - If 'carbonFootprintData' is true: Fetch relevant data from a conceptual 'sustainability_data' or 'carbon_footprint_data' collection linked to the applicantId or their farms/batches.
// 6. Aggregate the fetched, consented data into a structured response.
// 7. Return the aggregated data to the calling FI/IP.
// Strict Firebase Security Rules are paramount to ensure this function is the only way for FIs/IPs
// to access this sensitive user data and that access is strictly governed by the consent flags and providerId match.

// Conceptual Note: Role Assignment for FI/IPs
// A secure administrative UI or manual process is needed to assign 'financial_institution'
// and 'insurance_provider' roles to verified users upon successful onboarding.
}

// Conceptual Cloud Function: onCreateApplication
// This conceptual function would be triggered whenever a new applications document is created (e.g., from the application form).
// Its primary role would be to notify the relevant Financial Institution or Insurance Provider (identified by providerId)
// about the new incoming application, potentially via email, in-app notification, or by updating a counter on their dashboard.

// Conceptual Cloud Function: onUpdateApplicationStatus
// This conceptual function would be triggered whenever the status field of an applications document is updated (e.g., manually by an FI/IP user).
// Its primary role would be to notify the applicant farmer (identified by applicantId) about the change in their application status (e.g., approved, rejected, more info needed).


// Conceptual Cloud Functions for Initial AI Recommendations/Matching
// AI Help Note: "Python code for simple recommendation algorithm for agriculture."
// AI Help Note: "Cloud Function to call an external AI service."
//
// Conceptual Cloud Function: onCreateFarmerProfile
// Trigger: When a new user with role 'farmer' completes their profile (basic farm details, location, main crops).
// Logic: Trigger a simple AI model (initially rule-based).
// - Match the farmer's profile data (location, farm size, main crops, stated needs) against the eligibility criteria and terms of 'financial_products' and 'insurance_products' listings.
// - Store potential matches for display as 'Recommended Products' on the farmer's dashboard.
// - Could also potentially identify farmer profiles that match specific criteria sought by FIs/IPs for targeted outreach (if consent allows).
//
// Conceptual Cloud Function: onCreateMarketplaceListing (for Financial/Insurance Services)
// Trigger: When a new marketplace_listing of type 'Service' with serviceType 'financial_service' or 'insurance_service' is created.
// Logic: Trigger a simple AI model (initially rule-based).
// - Match the product's terms and eligibility criteria against existing farmer profiles (basic, non-sensitive data initially).
// - Store potential matches for display as 'Suggested Farmers' on the FI/IP's dashboard for that product.
// - Could also trigger 'Recommended Product' updates for relevant farmers.


// Conceptual Firebase Security Rules Note: Chat Access
// AI Help Note: "Firestore security rules for chat groups between two users."
// Rules should be implemented to ensure that only users whose IDs are present
// in the 'participants' array of a 'chats' document are allowed to read or
// write messages within that chat's subcollection of 'messages'.

// Conceptual Cloud Function/Backend Logic: onCreateOrder
// This conceptual function would be triggered whenever a new marketplace_orders document is created.
// It would read the document data and perform actions based on the listingType.
// - If listingType is 'Product': Conceptually decrement the stockQuantity of the associated marketplace_listing.
// - If listingType is 'Service': Conceptually trigger the initiation of a service-specific process,
//   such as sending a notification to the service provider or creating an initial record in a related service application collection.

// Conceptual Cloud Function: triggerServiceApplicationCreation
// AI Help Note: "Cloud Function to trigger an application creation based on marketplace order details."
// This conceptual function would be triggered specifically for service 'orders' with relevant itemTypes.
// It would automatically create a new document in a future 'applications' collection (e.g., 'loanApplications', 'consultationBookings').
// This new application document would be linked back to the marketplace_orders record via the 'relatedApplicationId' field.

// Conceptual Note on Monetization:
// Aggregated and anonymized data insights derived from platform activity (Marketplace, Traceability, etc.) could be a valuable offering for certain users (e.g., researchers, large businesses) as a potential monetization strategy, provided user data consent is strictly managed.

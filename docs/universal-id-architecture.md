# Universal ID Architecture (Phase 1)

This document outlines the foundational architecture for the Universal ID system within the DamDoh platform, leveraging Firebase.

## 1. Core Objective

To provide every stakeholder (farmer, agent, buyer, etc.) with a single, secure, and easy-to-use digital and physical identity. This ID simplifies access, enhances security, and improves data integrity across the supply chain, especially for users with limited access to email or stable phone numbers.

## 2. System Components

### 2.1. Firestore User Data Model (`/users/{uid}`)

The core `users` collection is updated to support the Universal ID.

```json
{
  "uid": "firebaseAuthUserId",
  "universalId": "a-unique-non-sensitive-uuid-v4",
  "phoneNumber": "+254712345678",
  "displayName": "Jane Doe",
  "primaryRole": "Farmer",
  "isActive": true,
  "qrCardPrinted": false,
  "physicalCardId": null,
  "linkedAccounts": {
    "mobileMoney": "tokenized_or_reference_id"
  },
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

-   **`universalId`**: The public-facing, non-sensitive identifier embedded in the QR code. Generated securely on the backend.
-   **`phoneNumber`**: Used as a primary, user-friendly identifier for lookups by authorized agents.
-   **`isActive`**: Allows for deactivation of a user account and its associated Universal ID.
-   **`physicalCardId`**: A unique ID for the physical card itself, allowing it to be deactivated if lost, without deactivating the user's account.

### 2.2. Backend Logic (Cloud Functions)

All critical operations are handled by secure, server-side Cloud Functions.

#### `generateUniversalIdOnUserCreate` (Firestore Trigger)

-   **Trigger**: `onCreate` of a new document in the `/users` collection.
-   **Action**:
    1.  Generates a cryptographically strong UUID (v4).
    2.  Updates the newly created user document, setting the `universalId` field.
-   **Purpose**: Ensures every user automatically and securely receives a Universal ID.

#### `getUniversalIdData` (HTTPS Callable)

-   **Purpose**: Acts as the secure gateway for retrieving user data when a QR code is scanned.
-   **Inputs**: `{ scannedUniversalId: string }`
-   **Authentication**: The function requires the *scanner* to be an authenticated Firebase user.
-   **Logic**:
    1.  Authenticates the scanner's request.
    2.  Fetches the scanner's user profile to determine their role (e.g., 'Field Agent', 'Farmer').
    3.  Queries the `users` collection for the document where `universalId` matches `scannedUniversalId`.
    4.  Based on the scanner's role, it returns a specific, limited subset of the scanned user's data.
        -   *Example*: A fellow 'Farmer' might only see `displayName`, `primaryRole`, and `location`.
        -   *Example*: A 'Field Agent' might see the above plus farm-related data.
        -   *Example*: A 'Financial Institution' partner might see anonymized financial history (with user consent).
-   **Security**: This is the most critical security component. It prevents the QR code from being a universal key and enforces context-aware data sharing.

### 2.3. Client-Side Implementation

-   **QR Code Generation**: The app uses a client-side library (`qrcode.react`) to generate the QR code.
-   **QR Code Content**: The QR code **only** contains the `universalId`. It is structured as a deep link for potential future use, e.g., `damdoh://user?id=a-unique-non-sensitive-uuid-v4`.
-   **QR Code Display**: The user's QR code is accessible within their profile, displayed in a modal/dialog to be scanned by others.

## 3. Security Model

-   **Data Minimization in QR**: The QR code contains no Personally Identifiable Information (PII). It is a pointer, not a data store.
-   **Firestore Rules**: Direct client-side writes to the `users` collection are heavily restricted. Sensitive fields can only be modified via trusted Cloud Functions. Read access is limited to a user reading their own profile, with all other access brokered by `getUniversalIdData`.
-   **Authenticated Endpoints**: All Cloud Functions are protected, requiring authenticated users to invoke them.
-   **Role-Based Access Control (RBAC)**: The authorization logic is centralized within the `getUniversalIdData` Cloud Function, making the security model easier to manage and audit.

This foundational phase establishes a secure and scalable system ready for the subsequent implementation of account recovery, agent workflows, and payment integrations.
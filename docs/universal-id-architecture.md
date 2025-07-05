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
    1.  Authenticates the scanner's request and gets their `scannerUid`.
    2.  Fetches the scanner's user profile from Firestore to determine their role (e.g., 'Field Agent', 'Farmer', 'Admin').
    3.  Queries the `users` collection for the document where `universalId` matches the `scannedUniversalId`.
    4.  If the scanned user is not found, it returns a "not-found" error.
    5.  Based on the scanner's role, it returns a specific, limited subset of the scanned user's data. This enforces context-aware data sharing.
        -   **If the user scans their own ID**: Return most of their own non-sensitive profile data, including email and phone number.
        -   **If an Admin or Field Agent scans the ID**: Return a more detailed data set, including contact information, but not highly sensitive data like linked financial accounts.
        -   **If any other authenticated user scans the ID**: Return only basic public profile information (`displayName`, `primaryRole`, `location`, `avatarUrl`).
-   **Security**: This is the most critical security component. It prevents the QR code from being a universal key and enforces context-aware data sharing.

#### `lookupUserByPhone` (HTTPS Callable)

-   **Purpose**: Allows authorized agents to find a user if the QR code is unavailable (e.g., lost card).
-   **Inputs**: `{ phoneNumber: string }`
-   **Authentication**: The function requires the caller (agent) to be authenticated and have an authorized role (e.g., 'Field Agent/Agronomist (DamDoh Internal)', 'Admin').
-   **Logic**:
    1.  Verifies the caller's role. Throws a permission-denied error if unauthorized.
    2.  Queries the `users` collection for a document where `phoneNumber` matches the input.
    3.  If a user is found, it returns a subset of their data appropriate for the agent's role (similar to the data returned by `getUniversalIdData`).
    4.  If no user is found, it returns a "not-found" error.
-   **Security**: This provides a necessary fallback while maintaining security through strict role-based access control.

### 2.3. Client-Side Implementation

-   **QR Code Generation**: The app uses a client-side library (`qrcode.react`) to generate the QR code.
-   **QR Code Content**: The QR code **only** contains the `universalId`. It is structured as a deep link for potential future use, e.g., `damdoh:user?id=a-unique-non-sensitive-uuid-v4`.
-   **QR Code Display**: The user's QR code is accessible within their profile, displayed in a modal/dialog to be scanned by others.

### 2.4. Social Account Recovery (Phase 2)

A critical feature for users without stable email or phone access is the ability to recover their account through their network.

#### Recovery Flow Overview

1.  **Initiation**: The user, on a new device, navigates to `/auth/recover`. They click "Start Recovery."
2.  **Phone Number Entry**: The user enters their registered phone number.
3.  **Session Creation**: The app calls the secure `createRecoverySession` Cloud Function, passing the phone number.
    *   The backend function finds the user by phone number, generates a temporary session ID and a unique secret.
    *   It stores this session in a new `recovery_sessions` collection in Firestore.
    *   It returns the session details (including the temporary QR value) to the user's app.
4.  **Display Recovery QR**: The app displays a temporary QR code containing the session details. This QR code is *different* from the user's permanent Universal ID.
5.  **Friend Confirmation**: The user shows this QR code to a trusted friend who is also a DamDoh user. The friend uses a "Help Friend Recover" feature in their app to scan the code.
6.  **Verification**: The friend's app calls a `scanRecoveryQr` Cloud Function, sending the scanned data. The backend verifies the session and records the friend's confirmation.
7.  **Human Factor**: As an added layer, the system might require the friend to verbally ask the recovering user a pre-set security question. The recovering user types the answer into their app, which is then verified by the backend.
8.  **Access Granted**: Once enough confirmations are received, the backend links the recovering user's account to their new device.

#### Relevant Components

*   **`src/app/[locale]/auth/recover/page.tsx`**: The UI for initiating and managing the recovery process.
*   **`createRecoverySession` (Cloud Function)**: Creates and manages the secure, temporary recovery session in Firestore.
*   **`scanRecoveryQr` (Cloud Function)**: Verifies and records a recovery attempt from a trusted friend.


## 3. Security Model

-   **Data Minimization in QR**: The QR code contains no Personally Identifiable Information (PII). It is a pointer, not a data store.
-   **Firestore Rules**: Direct client-side writes to the `users` collection are heavily restricted. Sensitive fields can only be modified via trusted Cloud Functions. Read access is limited to a user reading their own profile, with all other access brokered by `getUniversalIdData` or other secure functions.
-   **Authenticated Endpoints**: All Cloud Functions are protected, requiring authenticated users to invoke them.
-   **Role-Based Access Control (RBAC)**: The authorization logic is centralized within the Cloud Functions (`getUniversalIdData`, `lookupUserByPhone`), making the security model easier to manage and audit.

This foundational phase establishes a secure and scalable system ready for the subsequent implementation of agent workflows and payment integrations.

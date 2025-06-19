# DamDoh Firebase Project Setup Recommendations

This document outlines the initial recommendations for setting up the Firebase project for the DamDoh social agriculture platform.

## Firebase Authentication Setup

To support diverse user types and ensure secure access, configure Firebase Authentication with the following providers:

*   **Email/Password:** For standard user accounts.
*   **Phone Number:** Crucial for reaching users in areas with limited email access.
*   **Google Sign-In:** For users with existing Google accounts.
*   **Other Social Logins (Optional but Recommended):** Consider adding providers like Facebook or Twitter based on target audience prevalence.

Enable these providers in the Firebase Authentication console.

## Initial Firestore Collections

The following initial Firestore collections are recommended to store core data for the platform:

*   **`users`:** Stores information about all registered users (farmers, buyers, etc.).
    *   `userId` (Document ID): Unique identifier for the user.
    *   `name` (string): User's full name or chosen display name.
    *   `email` (string, optional): User's email address.
    *   `phoneNumber` (string, optional): User's phone number.
    *   `role` (string): The stakeholder role of the user (e.g., "farmer", "buyer", "agronomist").
    *   `farmId` (string, optional): Reference to the user's farm document if applicable.
    *   `createdAt` (timestamp): The time the user account was created.
    *   `profilePictureUrl` (string, optional): URL to the user's profile picture in Cloud Storage.
    *   `location` (geo point, optional): User's geographical location.

*   **`farms`:** Stores information about registered farms.
    *   `farmId` (Document ID): Unique identifier for the farm.
    *   `ownerId` (string): Reference to the user who owns/manages the farm.
    *   `name` (string): Name of the farm.
    *   `location` (geo point): Geographical location of the farm.
    *   `size` (number, optional): Size of the farm (e.g., in hectares or acres).
    *   `soilType` (string, optional): Type of soil on the farm.
    *   `createdAt` (timestamp): The time the farm record was created.

*   **`posts`:** Stores social feed posts from users.
    *   `postId` (Document ID): Unique identifier for the post.
    *   `authorId` (string): Reference to the user who created the post.
    *   `content` (string): The text content of the post.
    *   `imageUrl` (string, optional): URL to an image associated with the post in Cloud Storage.
    *   `videoUrl` (string, optional): URL to a video associated with the post in Cloud Storage.
    *   `createdAt` (timestamp): The time the post was created.
    *   `likesCount` (number): Number of likes the post has received (can be managed with counters).
    *   `commentsCount` (number): Number of comments on the post (can be managed with counters).

## Firebase Cloud Messaging (FCM)

Enable Firebase Cloud Messaging to send push notifications for real-time communication, alerts (e.g., market price changes, weather warnings), and social interactions (e.g., new comment on a post).

## Firebase Performance Monitoring and Crashlytics

Enable Firebase Performance Monitoring to track application performance metrics and identify bottlenecks. Integrate Firebase Crashlytics to monitor and report application crashes, allowing for faster debugging and improved stability.

## Example Code Snippets (TypeScript for Frontend)

These snippets demonstrate basic user registration and profile creation using the Firebase SDKs.

### User Registration with Email and Password
```
typescript
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseApp } from "./firebaseConfig"; // Your Firebase app initialization

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

async function registerUser(email, password, name, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user profile document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      userId: user.uid,
      name: name,
      email: email,
      role: role,
      createdAt: new Date(),
    });

    console.log("User registered and profile created successfully:", user.uid);
    return user;
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw error;
  }
}

// Example usage:
// registerUser("testuser@example.com", "securepassword", "Test User", "farmer");
```
### Creating a Farm Profile (after user is registered)
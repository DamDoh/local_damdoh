import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const signUpAndCreateProfile = functions.https.onRequest(async (req, res) => {
  const { email, password, stakeholderType, profileData } = req.body;

  if (!email || !password || !stakeholderType) {
    return res.status(400).send('Missing email, password, or stakeholderType.');
  }

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    const uid = userRecord.uid;

    // Basic validation for profileData structure based on stakeholderType
    // More detailed validation based on the specific schema for each stakeholderType
    // should be implemented here or in a separate validation service.
    const initialProfileData = profileData || {}; // Use provided profileData or an empty object

    // Example basic validation: check if profileData is an object
    if (typeof initialProfileData !== 'object' || initialProfileData === null) {
        return res.status(400).send('Invalid profileData format.');
    }

    // TODO: Implement more robust validation based on stakeholderType schema from architecture doc
    // For example: if stakeholderType is 'farmer', check for presence and type of 'farm_name', 'location', etc.

    // 2. Create user profile in Firestore
    await admin.firestore().collection('users').doc(uid).set({
      uid: uid,
      email: email,
      stakeholder_type: stakeholderType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // Include profileData provided in the request body
      profile_data: initialProfileData
    });

    // 3. Return success response
    res.status(201).send({ uid: uid, email: email, message: 'User created successfully.' });

  } catch (error) {
    console.error('Error signing up and creating profile:', error);

    // Implement more specific error handling based on error codes
    if (error instanceof Error) {
      if ('code' in error) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            return res.status(409).send('Email already in use.');
          case 'auth/invalid-email':
            return res.status(400).send('Invalid email format.');
          case 'auth/weak-password':
            return res.status(400).send('Password is too weak.');
          default:
            return res.status(500).send('An error occurred during user creation.');
        }
      }
    }
    return res.status(500).send('An unexpected error occurred.');
  }
});

export const signIn = functions.https.onRequest(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Missing email or password.');
  }

  try {
    // 1. Sign in user with Firebase Authentication (using Admin SDK - note the caution)
    // IMPORTANT CAUTION: Using Admin SDK for client-side sign-in in an HTTPS function
    // can expose your Admin SDK private key if not secured properly (e.g., within a
    // trusted environment like Cloud Functions). It is generally more secure
    // to use the client-side Firebase SDK for sign-in directly from your frontend.
    // This example is for demonstration purposes of backend logic only.
    const userRecord = await admin.auth().getUserByEmail(email);
    // In a real-world scenario with Admin SDK for sign-in, you'd verify the password
    // securely, which isn't directly exposed in the Admin SDK for security reasons.
    // A safer backend approach might involve a different authentication flow
    // or using a service account with limited permissions if not using client SDK.

    // 2. Return success response (providing UID and email as example)
    res.status(200).send({ uid: userRecord.uid, email: userRecord.email, message: 'User signed in successfully.' });

  } catch (error) {
    console.error('Error signing in:', error);

    // Implement more specific error handling based on error codes (e.g., 'auth/user-not-found', 'auth/wrong-password')
    if (error instanceof Error) {
      if ('code' in error) {
        switch (error.code) {
          case 'auth/user-not-found':
            return res.status(404).send('User not found.');
          case 'auth/wrong-password':
            return res.status(401).send('Invalid credentials.');
          default:
            return res.status(500).send('An error occurred during sign in.');
        }
      }
    }
    return res.status(500).send('An unexpected error occurred.');
  }
});
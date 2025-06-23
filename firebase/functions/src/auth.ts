
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const signUpAndCreateProfile = functions.https.onRequest(async (req, res) => {
  // Correctly expect 'role' and 'name' from the request body to align with main app logic
  const { email, password, name, role, profileData } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).send('Missing email, password, name, or role.');
  }

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name, // Set displayName in Auth
    });

    const uid = userRecord.uid;

    const initialProfileData = profileData || {};

    // 2. Create user profile in Firestore using the correct 'roles' array schema
    await admin.firestore().collection('users').doc(uid).set({
      uid: uid,
      email: email,
      name: name,
      roles: [role], // Use the 'roles' array as per the app's schema
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      profile_data: initialProfileData, // For any extra data
      // Add other default fields from your main user schema for consistency
      location: 'Not specified',
      avatarUrl: `https://placehold.co/150x150.png?text=${name.substring(0,1)}`,
      profileSummary: `A new ${role} in the DamDoh community.`,
      bio: '',
      areasOfInterest: [],
      needs: [],
      connections: [],
      contactInfo: { email },
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

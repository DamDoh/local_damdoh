
import * as dotenv from 'dotenv';
import * as path from 'path';
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { stakeholderProfileSchemas } from '../../firebase/functions/src/stakeholder-profile-data';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const functions = getFunctions(app);

const upsertStakeholderProfile = httpsCallable(functions, 'upsertStakeholderProfile');

const populateProfiles = async () => {
    for (const role in stakeholderProfileSchemas) {
        const email = `${role.toLowerCase().replace(/ /g, '_').replace(/\//g, '')}@damdoh.com`;
        const password = "password123";
        const displayName = `${role} User`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(`Created user ${displayName} with email ${email}`);

            await signInWithEmailAndPassword(auth, email, password);

            const profileData = {
                location: "Global",
                profileSummary: `A sample profile for a ${role}.`,
                needs: ["Networking", "Information"],
            };

            await upsertStakeholderProfile({ displayName, primaryRole: role, profileData });
            console.log(`Created profile for ${displayName}`);

        } catch (error) {
            console.error(`Failed to create user or profile for ${role}:`, error);
        }
    }
};

populateProfiles();

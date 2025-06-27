
import * as admin from "firebase-admin";
import {UserRole} from "../types";

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  primaryRole: UserRole;
  secondaryRoles?: UserRole[];
  organization?: {
    id: string;
    name: string;
  } | null;
  location?: {
    country: string;
    city?: string;
  } | null;
  lastLogin: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}

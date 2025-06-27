
import {UserRole} from "./types";

export async function getRole(uid: string): Promise<UserRole> {
  return "Farmer";
}

export async function getUserDocument(uid: string): Promise<any> {
  return {
    id: uid,
    email: "test@test.com",
  };
}

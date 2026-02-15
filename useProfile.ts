import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  sector: string;
  username?: string;
  rut?: string;
  estado?: string;
  plates: string[];
};

export async function getMyProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateMyProfile(uid: string, patch: Partial<UserProfile>) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...patch, updatedAt: new Date() }, { merge: true });
}

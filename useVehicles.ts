import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { normPlate } from "./utils";

export type VehicleRecord = {
  plate: string;
  ownerUid?: string;
  ownerEmail?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerSector?: string;
  estado?: string;
};

export async function getVehicleByPlate(plateRaw: string): Promise<VehicleRecord | null> {
  const plate = normPlate(plateRaw);
  if (!plate) return null;
  const ref = doc(db, "vehicles", plate);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as VehicleRecord;
}

export async function upsertVehicle(rec: VehicleRecord) {
  const plate = normPlate(rec.plate);
  if (!plate) throw new Error("Patente vacía");
  const ref = doc(db, "vehicles", plate);
  await setDoc(ref, { ...rec, plate, updatedAt: new Date() }, { merge: true });
}

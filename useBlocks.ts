import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { yyyyMmDd, normPlate } from "./utils";

export type BlockDoc = {
  id: string;
  date: string;
  blockerUid: string;
  blockerPlate?: string;
  blockerName?: string;
  blockerPhone?: string;
  blockerSector?: string;

  blockedPlate: string;

  ownerUid?: string;
  ownerEmail?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerSector?: string;

  status: "open" | "closed";
  ts: Date;
};

export async function upsertTodayBlock(
  params: Omit<BlockDoc, "id" | "date" | "ts" | "status"> & { status?: BlockDoc["status"] }
) {
  const date = yyyyMmDd(new Date());
  const blockedPlate = normPlate(params.blockedPlate);
  if (!blockedPlate) throw new Error("Patente bloqueada vacía");

  const id = `${params.blockerUid}_${blockedPlate}_${date}`;
  const ref = doc(db, "bloqueos", id);

  const payload: BlockDoc = {
    id,
    date,
    blockerUid: params.blockerUid,
    blockerPlate: params.blockerPlate ? normPlate(params.blockerPlate) : undefined,
    blockerName: params.blockerName,
    blockerPhone: params.blockerPhone,
    blockerSector: params.blockerSector,
    blockedPlate,
    ownerUid: params.ownerUid,
    ownerEmail: params.ownerEmail,
    ownerName: params.ownerName,
    ownerPhone: params.ownerPhone,
    ownerSector: params.ownerSector,
    status: params.status ?? "open",
    ts: new Date(),
  };

  await setDoc(ref, payload, { merge: true });
  return payload;
}

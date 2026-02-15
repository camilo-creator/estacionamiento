import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { yyyyMmDd, normPlate } from "./utils";

export type CheckinDoc = {
  uid: string;
  date: string;
  unitToday: string;
  plate?: string;
  name?: string;
  sector?: string;
  ts: Date;
};

export async function setTodayCheckin(params: {
  uid: string;
  unitToday: string;
  plate?: string;
  name?: string;
  sector?: string;
}) {
  const date = yyyyMmDd(new Date());
  const id = `${params.uid}_${date}`;
  const ref = doc(db, "checkins", id);

  const payload: CheckinDoc = {
    uid: params.uid,
    date,
    unitToday: params.unitToday.trim(),
    plate: params.plate ? normPlate(params.plate) : undefined,
    name: params.name,
    sector: params.sector,
    ts: new Date(),
  };

  await setDoc(ref, payload, { merge: true });
}

import { useState, useCallback } from 'react';
import { db, todayStr } from '@/lib/firebase';
import type { CheckIn } from '@/types';

export function useCheckins() {
  const [loading, setLoading] = useState(false);

  const doCheckin = useCallback(async (uid: string, plate: string, unitToday: string): Promise<boolean> => {
    if (!db) return false;
    
    setLoading(true);
    try {
      const docId = `${uid}_${todayStr()}`;
      await db.collection("checkins").doc(docId).set({
        uid,
        plate: plate.toUpperCase().replace(/\s+/g, ""),
        unitToday,
        date: todayStr(),
        ts: window.firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error('Error en check-in:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTodayCheckin = useCallback(async (uid: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      const docId = `${uid}_${todayStr()}`;
      await db.collection("checkins").doc(docId).delete();
      return true;
    } catch (err) {
      console.error('Error clearing check-in:', err);
      return false;
    }
  }, []);

  const getTodayCheckin = useCallback(async (uid: string): Promise<CheckIn | null> => {
    if (!db) return null;
    
    try {
      const docId = `${uid}_${todayStr()}`;
      const doc = await db.collection("checkins").doc(docId).get();
      if (!doc.exists) return null;
      return { ...doc.data(), uid } as CheckIn;
    } catch (err) {
      console.error('Error getting check-in:', err);
      return null;
    }
  }, []);

  return {
    loading,
    doCheckin,
    clearTodayCheckin,
    getTodayCheckin
  };
}

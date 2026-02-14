import { useState, useCallback } from 'react';
import { db, todayStr } from '@/lib/firebase';
import type { Visitor } from '@/types';

export function useVisitors() {
  const [loading, setLoading] = useState(false);

  const registerVisitor = useCallback(async (
    name: string, 
    plate: string, 
    destination: string
  ): Promise<boolean> => {
    if (!db) return false;
    
    setLoading(true);
    try {
      await db.collection("visitors").add({
        name: name.trim(),
        plate: plate.toUpperCase().replace(/\s+/g, ""),
        destination: destination.trim(),
        date: todayStr(),
        ts: window.firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Error registering visitor:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTodayVisitors = useCallback(async (): Promise<Visitor[]> => {
    if (!db) return [];
    
    try {
      const snap = await db.collection("visitors")
        .where("date", "==", todayStr())
        .orderBy("ts", "desc")
        .get();
      
      return snap.docs.map((doc: any) => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Visitor));
    } catch (err) {
      console.error('Error getting visitors:', err);
      return [];
    }
  }, []);

  return {
    loading,
    registerVisitor,
    getTodayVisitors
  };
}

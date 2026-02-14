import { useState, useCallback } from 'react';
import { db, todayStr } from '@/lib/firebase';
import type { Block } from '@/types';

export function useBlocks() {
  const [loading, setLoading] = useState(false);

  const addBlock = useCallback(async (
    blockerUid: string, 
    blockerPlate: string, 
    blockedPlate: string
  ): Promise<boolean> => {
    if (!db) return false;
    
    setLoading(true);
    try {
      await db.collection("blocks").add({
        blockerUid,
        blockerPlate: blockerPlate.toUpperCase().replace(/\s+/g, ""),
        blockedPlate: blockedPlate.toUpperCase().replace(/\s+/g, ""),
        date: todayStr(),
        ts: window.firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Error adding block:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyBlocks = useCallback(async (uid: string): Promise<Block[]> => {
    if (!db) return [];
    
    try {
      const snap = await db.collection("blocks")
        .where("blockerUid", "==", uid)
        .where("date", "==", todayStr())
        .orderBy("ts", "desc")
        .get();
      
      return snap.docs.map((doc: any) => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Block));
    } catch (err) {
      console.error('Error getting blocks:', err);
      return [];
    }
  }, []);

  const deleteBlock = useCallback(async (blockId: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      await db.collection("blocks").doc(blockId).delete();
      return true;
    } catch (err) {
      console.error('Error deleting block:', err);
      return false;
    }
  }, []);

  const clearTodayBlocks = useCallback(async (uid: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      const snap = await db.collection("blocks")
        .where("blockerUid", "==", uid)
        .where("date", "==", todayStr())
        .get();
      
      const batch = db.batch();
      snap.docs.forEach((d: any) => batch.delete(d.ref));
      await batch.commit();
      return true;
    } catch (err) {
      console.error('Error clearing blocks:', err);
      return false;
    }
  }, []);

  return {
    loading,
    addBlock,
    getMyBlocks,
    deleteBlock,
    clearTodayBlocks
  };
}

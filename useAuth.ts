import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import type { AppUser, UserType } from '@/types';

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          userType: 'employee'
        };
        setUser(appUser);
        setUserType('employee');
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    await auth.signInWithEmailAndPassword(email, password);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    const result = await auth.createUserWithEmailAndPassword(email, password);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    if (!auth) throw new Error('Firebase not initialized');
    await auth.signOut();
    setUserType(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    await auth.sendPasswordResetEmail(email);
  }, []);

  const setVisitorMode = useCallback(() => {
    setUserType('visitor');
  }, []);

  const setEmployeeMode = useCallback(() => {
    if (user) {
      setUserType('employee');
    }
  }, [user]);

  return {
    user,
    loading,
    userType,
    login,
    register,
    logout,
    resetPassword,
    setVisitorMode,
    setEmployeeMode
  };
}

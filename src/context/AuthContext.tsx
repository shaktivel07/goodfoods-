'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, initAnalytics } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  idToken: string | null;
  isAdmin: boolean;
  isDelivery: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);

  const syncUserWithBackend = useCallback(async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      setIdToken(token);

      const res = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || null);
        setIsAdmin(data.isAdmin || false);
        setIsDelivery(data.isDelivery || false);
      }
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await syncUserWithBackend(user);
  }, [user, syncUserWithBackend]);

  // Initialize Firebase Analytics once on client mount
  useEffect(() => { initAnalytics(); }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      setUser(firebaseUser);
      if (firebaseUser) {
        await syncUserWithBackend(firebaseUser);
      } else {
        setProfile(null);
        setIdToken(null);
        setIsAdmin(false);
        setIsDelivery(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [syncUserWithBackend]);

  // Refresh token every 50 minutes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const token = await user.getIdToken(true);
      setIdToken(token);
    }, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setIdToken(null);
    setIsAdmin(false);
    setIsDelivery(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, idToken, isAdmin, isDelivery, signInWithGoogle, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

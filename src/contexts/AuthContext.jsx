import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

async function findShopByEmail(userEmail) {
  try {
    let snap = await getDocs(query(collection(db, 'shops'), where('ownerEmail', '==', userEmail)));
    if (!snap.empty) return snap.docs[0];
    snap = await getDocs(query(collection(db, 'shops'), where('email', '==', userEmail)));
    if (!snap.empty) return snap.docs[0];
  } catch (err) {
    console.error('findShopByEmail error:', err);
  }
  return null;
}

async function getShopSlug(shopId) {
  if (!shopId) return null;
  try {
    const snap = await getDoc(doc(db, 'shops', shopId));
    if (snap.exists()) return snap.data().slug;
  } catch (err) {
    console.error('getShopSlug error:', err);
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userShopSlug, setUserShopSlug] = useState(null);

  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = { uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() };
        setUser(userData);
        if (userData.shopId) {
          const slug = await getShopSlug(userData.shopId);
          setUserShopSlug(slug);
        }
      }
    } catch (err) {
      console.error('refreshUser error:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          } catch (e) {
            console.error('Failed to read user doc:', e);
            setUser(null);
            setLoading(false);
            return;
          }

          let userData = userDoc.exists() ? userDoc.data() : null;

          if (!userData) {
            const newUserData = {
              email: firebaseUser.email,
              role: 'customer',
              createdAt: new Date(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
            userData = newUserData;
          }

          if (!userData.shopId) {
            const shopDoc = await findShopByEmail(firebaseUser.email);
            if (shopDoc) {
              await setDoc(doc(db, 'users', firebaseUser.uid), { role: 'shopkeeper', shopId: shopDoc.id }, { merge: true });
              userData = { ...userData, role: 'shopkeeper', shopId: shopDoc.id };
            }
          }

          const finalUser = { uid: firebaseUser.uid, email: firebaseUser.email, ...userData };
          setUser(finalUser);

          if (finalUser.shopId) {
            const slug = await getShopSlug(finalUser.shopId);
            setUserShopSlug(slug);
          } else {
            setUserShopSlug(null);
          }
        } else {
          setUser(null);
          setUserShopSlug(null);
        }
      } catch (err) {
        console.error('Auth state error:', err);
        setUser(null);
        setUserShopSlug(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email, password, role = 'customer', shopId = null) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), { email, role, shopId, createdAt: new Date() });
    return cred;
  }

  async function logout() {
    await firebaseSignOut(auth);
    setUser(null);
    setUserShopSlug(null);
  }

  const value = { user, loading, login, register, logout, refreshUser, userShopSlug };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

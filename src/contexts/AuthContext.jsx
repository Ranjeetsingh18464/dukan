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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() });
      }
    } catch (err) {
      console.error('refreshUser error:', err);
    }
  }, []);

  useEffect(() => {
    console.log('AuthProvider: starting onAuthStateChanged');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('onAuthStateChanged fired, user:', firebaseUser?.email || 'null');
      try {
        if (firebaseUser) {
          console.log('Auth: reading user doc for', firebaseUser.uid);
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          } catch (e) {
            console.error('Auth: failed to read user doc:', e);
            setUser(null);
            setLoading(false);
            return;
          }
          console.log('Auth: user doc exists:', userDoc.exists());
          let userData = userDoc.exists() ? userDoc.data() : null;

          if (!userData) {
            console.log('Auth: creating new user doc');
            const newUserData = {
              email: firebaseUser.email,
              role: 'customer',
              createdAt: new Date(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
            userData = newUserData;
          }

          if (!userData.shopId) {
            console.log('Auth: no shopId, looking for shop...');
            const shopDoc = await findShopByEmail(firebaseUser.email);
            console.log('Auth: shop found:', !!shopDoc);
            if (shopDoc) {
              await setDoc(doc(db, 'users', firebaseUser.uid), { role: 'shopkeeper', shopId: shopDoc.id }, { merge: true });
              userData = { ...userData, role: 'shopkeeper', shopId: shopDoc.id };
              console.log('Auto-linked to shop:', shopDoc.id);
            }
          }

          const finalUser = { uid: firebaseUser.uid, email: firebaseUser.email, ...userData };
          console.log('Auth: setting user with role:', finalUser.role);
          setUser(finalUser);
        } else {
          console.log('Auth: no firebase user, setting null');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state error:', err);
        setUser(null);
      }
      console.log('Auth: setting loading to false');
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
  }

  const value = { user, loading, login, register, logout, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

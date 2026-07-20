import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAjArkX1g51RNEEypTl3acvMi5olWjy1KQ',
  authDomain: 'indiamart-3f534.firebaseapp.com',
  projectId: 'indiamart-3f534',
  storageBucket: 'indiamart-3f534.firebasestorage.app',
  messagingSenderId: '560364967658',
  appId: '1:560364967658:web:fd35fde871bceb5882a993',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

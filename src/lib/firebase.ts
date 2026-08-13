import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyCqjnx3-u2Ta5hz822qky2ZW2L8R9shUmE",
  authDomain: "faturasimples.firebaseapp.com",
  projectId: "faturasimples",
  storageBucket: "faturasimples.firebasestorage.app",
  messagingSenderId: "661215797187",
  appId: "1:661215797187:web:c9bdd62d5465666e11a776"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

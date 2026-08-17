import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

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

// Chave oficial do reCAPTCHA Enterprise gerada para o Kivora Web
export const RECAPTCHA_SITE_KEY = "6LdFVYotAAAAAH8uqBVUK0spteWlS0D-rGFO1JDR";

// Inicialização automática do App Check no navegador (Zero-Trust Security)
if (typeof window !== 'undefined') {
  try {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // Silencia se já foi inicializado
  }
}

export default app;

import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { KIVORA_INFO, CURRENT_RELEASE } from '../data/kivoraData';

export interface SystemCompanySettings {
  name: string;
  fullName: string;
  company: string;
  nif: string;
  phone: string;
  phoneRaw: string;
  phoneDisplay: string;
  email: string;
  supportEmail: string;
  address: string;
  agtCertificate: string;
  githubUrl: string;
  downloadUrl: string;
  releaseVersion: string;
  releaseDate: string;
  whatsappUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  ibanBai: string;
  ibanBfa: string;
  ibanTitular: string;
  updatedAt?: number;
}

export const DEFAULT_SETTINGS: SystemCompanySettings = {
  name: KIVORA_INFO.name,
  fullName: KIVORA_INFO.fullName,
  company: KIVORA_INFO.company,
  nif: '5417089123',
  phone: KIVORA_INFO.phone,
  phoneRaw: KIVORA_INFO.phoneRaw,
  phoneDisplay: KIVORA_INFO.phoneDisplay,
  email: KIVORA_INFO.email,
  supportEmail: KIVORA_INFO.supportEmail,
  address: KIVORA_INFO.address,
  agtCertificate: KIVORA_INFO.agtCertificate,
  githubUrl: 'https://github.com/marcosdc20/kivora.ao',
  downloadUrl: CURRENT_RELEASE.downloadUrl,
  releaseVersion: CURRENT_RELEASE.version,
  releaseDate: CURRENT_RELEASE.date,
  whatsappUrl: KIVORA_INFO.whatsapp,
  facebookUrl: KIVORA_INFO.facebook,
  instagramUrl: KIVORA_INFO.instagram,
  ibanBai: 'AO06 0040 0000 1234 5678 9012 3',
  ibanBfa: 'AO06 0006 0000 9876 5432 1098 7',
  ibanTitular: 'VISUAL SOFTWARE LIMITADA',
};

const LOCAL_STORAGE_KEY = 'kivora_system_settings';

export function getCachedSystemSettings(): SystemCompanySettings {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
    }
  } catch (err) {
    console.warn('Erro ao ler settings locais:', err);
  }
  return DEFAULT_SETTINGS;
}

export function subscribeSystemSettings(callback: (settings: SystemCompanySettings) => void) {
  try {
    const docRef = doc(db, 'system_settings', 'company_info');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SystemCompanySettings;
        const merged = { ...DEFAULT_SETTINGS, ...data };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        callback(merged);
      } else {
        callback(getCachedSystemSettings());
      }
    }, (err) => {
      console.warn('Erro ao escutar system_settings do Firestore:', err);
      callback(getCachedSystemSettings());
    });
    return unsub;
  } catch (err) {
    console.warn('Erro subscribeSystemSettings:', err);
    callback(getCachedSystemSettings());
    return () => {};
  }
}

export async function saveSystemSettings(settings: Partial<SystemCompanySettings>): Promise<void> {
  const current = getCachedSystemSettings();
  const merged: SystemCompanySettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  // Se o telefone foi atualizado, sincroniza phoneRaw e whatsappUrl automaticamente
  if (settings.phoneDisplay || settings.phone) {
    const raw = (settings.phoneDisplay || settings.phone || '').replace(/\D/g, '');
    merged.phoneRaw = raw || merged.phoneRaw;
    merged.phoneDisplay = settings.phoneDisplay || settings.phone || merged.phoneDisplay;
    merged.whatsappUrl = `https://wa.me/${merged.phoneRaw}`;
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));

  try {
    const docRef = doc(db, 'system_settings', 'company_info');
    await setDoc(docRef, merged, { merge: true });
  } catch (err) {
    console.error('Erro ao guardar configurações no Firebase:', err);
    throw err;
  }
}

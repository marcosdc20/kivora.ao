import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { getCachedSystemSettings } from './systemSettingsService';

export interface VideoSupportSession {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'cliente' | 'parceiro' | 'admin';
  date: number;
  durationSeconds: number;
  minutesDeducted: number;
  roomName: string;
  ticketNumber?: string;
  technicianName?: string;
  topic?: string;
}

export interface VideoMinutesPurchase {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'cliente' | 'parceiro';
  date: number;
  minutes: number;
  amountAoa: number;
  pricePerMinute: number;
  paymentMethod: 'wallet_partner' | 'multicaixa_express' | 'transferencia' | 'cortesia_admin';
  status: 'concluido' | 'pendente';
  reference?: string;
  notes?: string;
}

export interface VideoSupportAccount {
  id: string; // NIF ou ID do parceiro ou e-mail
  entityName: string;
  entityType: 'cliente' | 'parceiro';
  nif?: string;
  email?: string;
  phone?: string;
  totalMinutesPurchased: number;
  totalMinutesSpent: number;
  remainingSeconds: number; // Saldo real em segundos
  lastUpdated: number;
  history: VideoSupportSession[];
  purchases: VideoMinutesPurchase[];
}

const STORAGE_PREFIX = 'kivora_video_account_';
const SESSIONS_STORAGE_KEY = 'kivora_video_all_sessions';
const ACCOUNTS_STORAGE_KEY = 'kivora_video_all_accounts';

/**
 * Cria ou obtém a conta de minutos de videochamada de um cliente ou parceiro.
 * Se a conta for nova, atribui os minutos de cortesia/onboarding definidos pelo Admin.
 */
export async function getOrCreateVideoSupportAccount(
  entityId: string,
  entityName: string = 'Cliente Kivora',
  entityType: 'cliente' | 'parceiro' = 'cliente',
  email?: string,
  nif?: string
): Promise<VideoSupportAccount> {
  const sanitizedId = (entityId || nif || email || 'demo-account').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const settings = getCachedSystemSettings();
  const freeMinutes = settings.videoCallFreeMinutesOnboarding ?? 15;
  const initialSeconds = freeMinutes * 60;

  // 1. Tentar ler do Cache Local primeiro
  const localData = localStorage.getItem(`${STORAGE_PREFIX}${sanitizedId}`);
  let currentAccount: VideoSupportAccount;

  if (localData) {
    try {
      currentAccount = JSON.parse(localData);
    } catch {
      currentAccount = createDefaultAccount(sanitizedId, entityName, entityType, initialSeconds, freeMinutes, email, nif);
    }
  } else {
    currentAccount = createDefaultAccount(sanitizedId, entityName, entityType, initialSeconds, freeMinutes, email, nif);
  }

  // 2. Tentar sincronizar com Firebase Firestore
  try {
    const docRef = doc(db, 'video_support_accounts', sanitizedId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const remoteData = snap.data() as VideoSupportAccount;
      currentAccount = {
        ...currentAccount,
        ...remoteData,
        history: remoteData.history || currentAccount.history || [],
        purchases: remoteData.purchases || currentAccount.purchases || [],
      };
    } else {
      // Gravar conta inicial no Firestore
      await setDoc(docRef, currentAccount);
    }
  } catch (err) {
    console.warn('Firebase offline ou erro ao carregar conta de vídeo:', err);
  }

  // Salvar no storage local
  saveLocalAccount(currentAccount);
  return currentAccount;
}

function createDefaultAccount(
  id: string,
  entityName: string,
  entityType: 'cliente' | 'parceiro',
  initialSeconds: number,
  freeMinutes: number,
  email?: string,
  nif?: string
): VideoSupportAccount {
  const account: VideoSupportAccount = {
    id,
    entityName,
    entityType,
    email: email || '',
    nif: nif || '',
    totalMinutesPurchased: freeMinutes,
    totalMinutesSpent: 0,
    remainingSeconds: initialSeconds,
    lastUpdated: Date.now(),
    history: [],
    purchases: freeMinutes > 0 ? [
      {
        id: `free-bonus-${Date.now()}`,
        entityId: id,
        entityName,
        entityType,
        date: Date.now(),
        minutes: freeMinutes,
        amountAoa: 0,
        pricePerMinute: 0,
        paymentMethod: 'cortesia_admin',
        status: 'concluido',
        reference: 'BONUS-BOAS-VINDAS',
        notes: 'Créditos de cortesia inicial de boas-vindas Kivora',
      }
    ] : [],
  };
  return account;
}

function saveLocalAccount(account: VideoSupportAccount) {
  localStorage.setItem(`${STORAGE_PREFIX}${account.id}`, JSON.stringify(account));
  
  // Atualizar índice geral de contas locais
  try {
    const rawAll = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    const all: Record<string, VideoSupportAccount> = rawAll ? JSON.parse(rawAll) : {};
    all[account.id] = account;
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Erro ao atualizar cache de todas as contas:', e);
  }
}

/**
 * Escuta atualizações em tempo real da conta de suporte por vídeo
 */
export function subscribeVideoSupportAccount(
  entityId: string,
  callback: (account: VideoSupportAccount) => void
): () => void {
  const sanitizedId = (entityId || 'demo-account').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  // Emite o valor em cache imediatamente
  const localData = localStorage.getItem(`${STORAGE_PREFIX}${sanitizedId}`);
  if (localData) {
    try {
      callback(JSON.parse(localData));
    } catch {}
  }

  try {
    const docRef = doc(db, 'video_support_accounts', sanitizedId);
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as VideoSupportAccount;
          saveLocalAccount(data);
          callback(data);
        }
      },
      (err) => {
        console.warn('Erro onSnapshot video account:', err);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('Erro subscribeVideoSupportAccount:', err);
    return () => {};
  }
}

/**
 * Compra / Recarrega minutos de videochamada
 */
export async function purchaseVideoMinutes(params: {
  entityId: string;
  entityName: string;
  entityType: 'cliente' | 'parceiro';
  minutes: number;
  amountAoa: number;
  paymentMethod: 'wallet_partner' | 'multicaixa_express' | 'transferencia' | 'cortesia_admin';
  reference?: string;
  notes?: string;
  email?: string;
  nif?: string;
}): Promise<{ success: boolean; account: VideoSupportAccount; message: string }> {
  const sanitizedId = (params.entityId || params.nif || params.email || 'demo-account').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const current = await getOrCreateVideoSupportAccount(sanitizedId, params.entityName, params.entityType, params.email, params.nif);
  
  const additionalSeconds = params.minutes * 60;
  const settings = getCachedSystemSettings();
  const pricePerMin = settings.videoCallPricePerMinute ?? 300;

  const newPurchase: VideoMinutesPurchase = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    entityId: sanitizedId,
    entityName: params.entityName,
    entityType: params.entityType,
    date: Date.now(),
    minutes: params.minutes,
    amountAoa: params.amountAoa,
    pricePerMinute: pricePerMin,
    paymentMethod: params.paymentMethod,
    status: 'concluido',
    reference: params.reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: params.notes || `Recarga de ${params.minutes} minutos de videochamada de suporte.`,
  };

  const updatedAccount: VideoSupportAccount = {
    ...current,
    totalMinutesPurchased: (current.totalMinutesPurchased || 0) + params.minutes,
    remainingSeconds: (current.remainingSeconds || 0) + additionalSeconds,
    lastUpdated: Date.now(),
    purchases: [newPurchase, ...(current.purchases || [])],
  };

  saveLocalAccount(updatedAccount);

  try {
    const docRef = doc(db, 'video_support_accounts', sanitizedId);
    await setDoc(docRef, updatedAccount, { merge: true });
  } catch (err) {
    console.warn('Erro ao salvar compra no Firestore:', err);
  }

  return {
    success: true,
    account: updatedAccount,
    message: `${params.minutes} minutos adicionados com sucesso à sua conta de assistência por videochamada!`,
  };
}

/**
 * Deduz o tempo gasto durante uma videochamada e registra a sessão no histórico.
 */
export async function recordVideoSessionUsage(params: {
  entityId: string;
  durationSeconds: number;
  roomName: string;
  ticketNumber?: string;
  technicianName?: string;
  topic?: string;
}): Promise<VideoSupportAccount> {
  const sanitizedId = (params.entityId || 'demo-account').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const current = await getOrCreateVideoSupportAccount(sanitizedId);

  // Calcula minutos debitados arredondando com precisão de 1 casa decimal
  const minutesSpent = Math.max(1, Math.ceil(params.durationSeconds / 60));
  const newRemainingSeconds = Math.max(0, current.remainingSeconds - params.durationSeconds);
  const totalMinutesSpent = (current.totalMinutesSpent || 0) + minutesSpent;

  const newSession: VideoSupportSession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    entityId: sanitizedId,
    entityName: current.entityName,
    entityType: current.entityType,
    date: Date.now(),
    durationSeconds: params.durationSeconds,
    minutesDeducted: minutesSpent,
    roomName: params.roomName,
    ticketNumber: params.ticketNumber,
    technicianName: params.technicianName || 'Técnico Especialista Kivora',
    topic: params.topic || 'Assistência Técnica & Suporte Remoto',
  };

  const updatedAccount: VideoSupportAccount = {
    ...current,
    remainingSeconds: newRemainingSeconds,
    totalMinutesSpent,
    lastUpdated: Date.now(),
    history: [newSession, ...(current.history || [])],
  };

  saveLocalAccount(updatedAccount);

  // Salvar no histórico global local
  try {
    const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
    const sessionsList: VideoSupportSession[] = rawSessions ? JSON.parse(rawSessions) : [];
    sessionsList.unshift(newSession);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsList.slice(0, 500)));
  } catch (e) {
    console.warn('Erro ao salvar sessão no cache global:', e);
  }

  // Sincronizar com Firestore
  try {
    const docRef = doc(db, 'video_support_accounts', sanitizedId);
    await setDoc(docRef, updatedAccount, { merge: true });

    // Gravar também na coleção global de sessões para o admin auditar
    const sessionDocRef = doc(db, 'video_support_sessions', newSession.id);
    await setDoc(sessionDocRef, newSession);
  } catch (err) {
    console.warn('Erro ao persistir sessão no Firestore:', err);
  }

  return updatedAccount;
}

/**
 * Permite ao Administrador conceder bónus / cortesia de minutos a qualquer cliente ou parceiro.
 */
export async function grantBonusMinutes(params: {
  entityId: string;
  entityName?: string;
  entityType?: 'cliente' | 'parceiro';
  minutes: number;
  reason: string;
  adminEmail?: string;
}): Promise<VideoSupportAccount> {
  const result = await purchaseVideoMinutes({
    entityId: params.entityId,
    entityName: params.entityName || 'Empresa Kivora',
    entityType: params.entityType || 'cliente',
    minutes: params.minutes,
    amountAoa: 0,
    paymentMethod: 'cortesia_admin',
    reference: `BONUS-ADM-${Date.now().toString().slice(-6)}`,
    notes: `Bónus de ${params.minutes} min atribuído pelo Admin (${params.adminEmail || 'admin@kivora.ao'}): ${params.reason}`,
  });
  return result.account;
}

/**
 * Obtém todas as contas de suporte por vídeo para o painel Admin
 */
export async function getAllVideoSupportAccounts(): Promise<VideoSupportAccount[]> {
  const list: VideoSupportAccount[] = [];

  try {
    const colRef = collection(db, 'video_support_accounts');
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
      list.push(d.data() as VideoSupportAccount);
    });
  } catch (err) {
    console.warn('Erro ao buscar contas no Firestore, recorrendo ao cache:', err);
  }

  if (list.length === 0) {
    try {
      const rawAll = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (rawAll) {
        const parsed = JSON.parse(rawAll);
        return Object.values(parsed);
      }
    } catch {}
  }

  return list;
}

/**
 * Obtém todas as sessões de vídeo já realizadas para auditoria do Admin
 */
export async function getAllVideoSupportSessions(): Promise<VideoSupportSession[]> {
  const list: VideoSupportSession[] = [];

  try {
    const colRef = collection(db, 'video_support_sessions');
    const q = query(colRef, orderBy('date', 'desc'), limit(100));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      list.push(d.data() as VideoSupportSession);
    });
  } catch (err) {
    console.warn('Erro ao buscar sessões no Firestore, recorrendo ao cache:', err);
  }

  if (list.length === 0) {
    try {
      const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (rawSessions) {
        return JSON.parse(rawSessions);
      }
    } catch {}
  }

  return list;
}

/**
 * authService.ts — Kivora Unified Authentication & Access Control
 * Autenticação inteligente e controlo de perfis via Firebase Auth & Firestore
 */

import {
  collection, doc, getDocs, getDoc, setDoc,
  query, where
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { db, auth } from '../../lib/firebase';

export type UserRole = 'admin' | 'parceiro' | 'cliente';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface KivoraUserSession {
  id: string;
  email: string;
  role: UserRole;
  nome: string;
  nif?: string;
  partnerCode?: string;
  companyName?: string;
  licenseKey?: string;
  status: UserStatus;
  token?: string;
}

const SESSION_KEY = 'kivora_user_session';

// ─── Controlo de Sessão Local ──────────────────────────────────────────────────

export function getStoredSession(): KivoraUserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as KivoraUserSession;
  } catch {
    return null;
  }
}

export function setStoredSession(session: KivoraUserSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function logoutUser(): Promise<void> {
  clearStoredSession();
  try {
    await firebaseSignOut(auth);
  } catch {
    // ignore
  }
}

// ─── Login Inteligente ────────────────────────────────────────────────────────

/**
 * Autentica o utilizador por Email, NIF ou Código de Parceiro
 * Identifica automaticamente se é Admin, Parceiro ou Cliente
 */
export async function loginUser(
  identifier: string,
  pass: string
): Promise<{ success: boolean; session?: KivoraUserSession; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();

  // 1. Tentar Autenticação Direta no Firebase Auth (se for e-mail)
  if (cleanId.includes('@')) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanId, cleanPass);
      const user = userCredential.user;

      // Verificar se é administrador na coleção /admins/{uid}
      let isAdminUser = false;
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          isAdminUser = true;
        }
      } catch {
        // se a consulta falhar mas for o email do admin ou master
        if (cleanId === 'admin@kivora.ao' || cleanId.includes('narcisomarcos') || cleanId.includes('marcos')) {
          isAdminUser = true;
        }
      }

      if (isAdminUser || cleanId === 'admin@kivora.ao' || cleanId.includes('narcisomarcos')) {
        const session: KivoraUserSession = {
          id: user.uid,
          email: user.email || cleanId,
          role: 'admin',
          nome: user.displayName || 'Administrador Executivo Kivora',
          status: 'active',
        };
        setStoredSession(session);
        return { success: true, session };
      }
    } catch (authError: any) {
      console.log('Firebase Auth direto não logou ou é perfil de cliente/parceiro:', authError.code);
    }
  }

  // 2. Verificação de Acessos Predefinidos de Demonstração / Master
  if (
    (cleanId === 'admin@kivora.ao' || cleanId === 'admin' || cleanId.includes('narcisomarcos')) &&
    (cleanPass === 'admin123' || cleanPass === 'kivora2026' || cleanPass === 'admin')
  ) {
    const session: KivoraUserSession = {
      id: auth.currentUser?.uid || 'admin_master',
      email: cleanId.includes('@') ? cleanId : 'admin@kivora.ao',
      role: 'admin',
      nome: 'Administrador Executivo Kivora',
      status: 'active',
    };
    setStoredSession(session);
    return { success: true, session };
  }

  if (
    (cleanId === 'parceiro@kivora.ao' || cleanId === 'parceiro-ao-042' || cleanId === 'parceiro') &&
    (cleanPass === 'parceiro123' || cleanPass === 'admin123')
  ) {
    const session: KivoraUserSession = {
      id: 'partner_042',
      email: 'parceiro@kivora.ao',
      role: 'parceiro',
      nome: 'Soluções de TI Luanda, Lda',
      partnerCode: 'PARCEIRO-AO-042',
      status: 'active',
    };
    setStoredSession(session);
    return { success: true, session };
  }

  if (
    (cleanId === 'cliente@empresa.ao' || cleanId === '5412398765' || cleanId === '5002863944' || cleanId === 'cliente') &&
    (cleanPass === 'cliente123' || cleanPass === 'admin123')
  ) {
    const session: KivoraUserSession = {
      id: 'client_demo',
      email: cleanId.includes('@') ? cleanId : 'narcisomarcos826@gmail.com',
      role: 'cliente',
      nome: 'VISUAL SOFTWARE - COMÉRCIO E PRESTAÇÃO DE SERVIÇOS, LDA',
      nif: '5002863944',
      companyName: 'VISUAL SOFTWARE - COMÉRCIO E PRESTAÇÃO DE SERVIÇOS, LDA',
      licenseKey: 'KVRA-LI0D-8OPE-DV3A',
      status: 'active',
    };
    setStoredSession(session);
    return { success: true, session };
  }

  // 3. Consulta em Tempo Real no Firestore (Coleções: users, partners, licenses)
  try {
    // A) Verificar na coleção `users`
    const usersRef = collection(db, 'users');
    const qUsers = query(usersRef, where('email', '==', cleanId));
    const snapUsers = await getDocs(qUsers);

    if (!snapUsers.empty) {
      const u = snapUsers.docs[0].data();
      if (u.password && u.password !== cleanPass) {
        return { success: false, error: 'Palavra-passe incorreta.' };
      }
      if (u.status === 'suspended') {
        return { success: false, error: 'Esta conta encontra-se suspensa pela administração.' };
      }
      if (u.status === 'pending') {
        return { success: false, error: 'A sua conta ainda aguarda aprovação pelo Administrador Kivora.' };
      }

      const session: KivoraUserSession = {
        id: snapUsers.docs[0].id,
        email: u.email,
        role: u.role || 'cliente',
        nome: u.nome || u.name || 'Utilizador Kivora',
        nif: u.nif,
        partnerCode: u.partnerCode,
        companyName: u.companyName,
        status: u.status || 'active',
      };
      setStoredSession(session);
      return { success: true, session };
    }

    // B) Verificar na coleção `partners` por código ou email
    const partnersRef = collection(db, 'partners');
    const snapPartners = await getDocs(partnersRef);
    const matchedPartner = snapPartners.docs.find(d => {
      const data = d.data();
      return (
        data.email?.toLowerCase() === cleanId ||
        data.code?.toLowerCase() === cleanId ||
        d.id.toLowerCase() === cleanId
      );
    });

    if (matchedPartner) {
      const p = matchedPartner.data();
      if (p.status === 'pending') {
        return { success: false, error: 'A sua candidatura de parceiro ainda está em análise pela equipa Kivora.' };
      }
      if (p.status === 'suspended') {
        return { success: false, error: 'O seu acesso de parceiro foi suspenso. Contacte o suporte.' };
      }

      const session: KivoraUserSession = {
        id: matchedPartner.id,
        email: p.email || cleanId,
        role: 'parceiro',
        nome: p.name || p.nome || 'Parceiro Revendedor',
        partnerCode: p.code || matchedPartner.id,
        status: 'active',
      };
      setStoredSession(session);
      return { success: true, session };
    }

    // C) Verificar na coleção `licenses` por NIF, Email ou Chave
    const licensesRef = collection(db, 'licenses');
    const snapLicenses = await getDocs(licensesRef);
    const matchedLicense = snapLicenses.docs.find(d => {
      const data = d.data();
      return (
        data.client_email?.toLowerCase() === cleanId ||
        data.nif === cleanId ||
        d.id.toLowerCase() === cleanId
      );
    });

    if (matchedLicense) {
      const lic = matchedLicense.data();
      const session: KivoraUserSession = {
        id: matchedLicense.id,
        email: lic.client_email || cleanId,
        role: 'cliente',
        nome: lic.company_name || 'Empresa Cliente',
        nif: lic.nif,
        companyName: lic.company_name,
        licenseKey: matchedLicense.id,
        status: 'active',
      };
      setStoredSession(session);
      return { success: true, session };
    }

    return { success: false, error: 'Nenhuma conta encontrada com estes dados de acesso.' };
  } catch (err: any) {
    console.error('Erro na consulta do Firebase auth:', err);
    return { success: false, error: 'Erro ao conectar à base de dados do Firebase.' };
  }
}

// ─── Criação Automática de Credenciais ─────────────────────────────────────────

/**
 * Cria ou atualiza conta de acesso do cliente no Firebase
 */
export async function createClientAccount(params: {
  email: string;
  name: string;
  nif: string;
  licenseKey?: string;
}): Promise<void> {
  const userId = (params.email || params.nif).toLowerCase().replace(/[^a-z0-9]/g, '_');
  await setDoc(doc(db, 'users', userId), {
    email: params.email.toLowerCase(),
    nome: params.name,
    nif: params.nif,
    role: 'cliente',
    status: 'active',
    licenseKey: params.licenseKey || null,
    createdAt: Date.now(),
  }, { merge: true });
}

/**
 * Cria ou ativa conta de acesso de parceiro com credenciais no Firebase
 */
export async function createOrApprovePartnerAccount(params: {
  email: string;
  nome: string;
  partnerCode: string;
  phone?: string;
  region?: string;
}): Promise<void> {
  const userId = params.partnerCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  await setDoc(doc(db, 'users', userId), {
    email: params.email.toLowerCase(),
    nome: params.nome,
    partnerCode: params.partnerCode,
    role: 'parceiro',
    status: 'active',
    phone: params.phone || '',
    region: params.region || 'Luanda',
    createdAt: Date.now(),
  }, { merge: true });

  await setDoc(doc(db, 'partners', params.partnerCode), {
    code: params.partnerCode,
    name: params.nome,
    email: params.email.toLowerCase(),
    phone: params.phone || '',
    region: params.region || 'Luanda',
    status: 'active',
    commission_rate: 20,
    total_sales: 0,
    balance_aoa: 0,
    createdAt: Date.now(),
  }, { merge: true });
}

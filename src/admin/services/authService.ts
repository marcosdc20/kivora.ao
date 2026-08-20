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

  // 1. Autenticação via Firebase Auth (se for e-mail)
  if (cleanId.includes('@')) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanId, cleanPass);
      const user = userCredential.user;

      // Verificar se é administrador na coleção /admins/{uid} ou /users
      let isAdminUser = false;
      let userName = user.displayName || 'Administrador Kivora';
      const masterAdmins = ['admin@kivora.ao', 'kivora.angola@gmail.com', 'narcisomarcos826@gmail.com', 'comercial@kivora.ao', 'suporte@kivora.ao'];

      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data()?.active !== false) {
          isAdminUser = true;
          userName = adminDoc.data()?.nome || userName;
        } else {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data()?.role === 'admin') {
            isAdminUser = true;
            userName = userDoc.data()?.nome || userName;
          }
        }
      } catch {
        // Fallback para administradores mestres
      }

      if (masterAdmins.includes(cleanId) || cleanId.endsWith('@kivora.ao')) {
        isAdminUser = true;
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            email: cleanId,
            nome: userName,
            role: 'admin',
            active: true,
            updatedAt: Date.now(),
          }, { merge: true });
        } catch {
          // ignore
        }
      }

      if (isAdminUser) {
        const session: KivoraUserSession = {
          id: user.uid,
          email: user.email || cleanId,
          role: 'admin',
          nome: userName,
          status: 'active',
        };
        setStoredSession(session);
        return { success: true, session };
      }
    } catch (authError: any) {
      console.log('Firebase Auth direto não logou ou é perfil de cliente/parceiro:', authError.code);
    }
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

      // Se o utilizador for parceiro, verificar estado rigoroso na coleção `partners`
      if (u.role === 'parceiro' || u.partnerCode) {
        const pCode = u.partnerCode || snapUsers.docs[0].id;
        try {
          const pDoc = await getDoc(doc(db, 'partners', pCode));
          if (pDoc.exists() && pDoc.data()?.status === 'suspended') {
            return {
              success: false,
              error: 'A sua conta de parceiro foi suspensa pela administração da Visual Software. Entre em contacto com o suporte para regularização.',
            };
          }
        } catch (e) {
          console.error('Erro ao verificar status do parceiro:', e);
        }
      }

      if (u.status === 'suspended') {
        return {
          success: false,
          error: 'Esta conta encontra-se suspensa pela administração da Visual Software. Entre em contacto com o suporte.',
        };
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
      if (p.password && p.password !== cleanPass) {
        return { success: false, error: 'Palavra-passe incorreta.' };
      }
      if (p.status === 'pending') {
        return { success: false, error: 'A sua candidatura de parceiro ainda está em análise pela equipa Kivora.' };
      }
      if (p.status === 'suspended') {
        return {
          success: false,
          error: 'O seu acesso de parceiro foi suspenso pela administração da Visual Software. Entre em contacto com o suporte para regularização.',
        };
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
  tier?: string;
}): Promise<void> {
  const userId = params.partnerCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  await setDoc(doc(db, 'users', userId), {
    email: params.email.toLowerCase(),
    nome: params.nome,
    partnerCode: params.partnerCode,
    tier: params.tier || 'bronze',
    role: 'parceiro',
    status: 'active',
    phone: params.phone || '',
    region: params.region || 'Luanda',
    updatedAt: Date.now(),
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

/**
 * Atualiza a palavra-passe do utilizador autenticado no Firestore
 */
export async function changeUserPassword(userId: string, newPass: string, _userEmail?: string, partnerCode?: string): Promise<void> {
  const cleanPass = newPass.trim();
  if (!cleanPass) throw new Error('A palavra-passe não pode estar vazia.');

  // Atualizar na coleção `users`
  const targetId = userId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  await setDoc(doc(db, 'users', targetId), {
    password: cleanPass,
    updatedAt: Date.now(),
  }, { merge: true });

  // Se for parceiro, atualizar também na coleção `partners` se existir
  if (partnerCode) {
    await setDoc(doc(db, 'partners', partnerCode), {
      password: cleanPass,
      updatedAt: Date.now(),
    }, { merge: true });
  }
}

/**
 * Atualiza os dados de perfil do parceiro
 */
export async function updatePartnerProfile(partnerCode: string, data: { name?: string; email?: string; phone?: string; region?: string }): Promise<void> {
  const userId = partnerCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (data.email) {
    await setDoc(doc(db, 'users', userId), {
      email: data.email.toLowerCase(),
      nome: data.name,
      phone: data.phone,
      region: data.region,
      updatedAt: Date.now(),
    }, { merge: true });
  }

  await setDoc(doc(db, 'partners', partnerCode), {
    name: data.name,
    email: data.email?.toLowerCase(),
    phone: data.phone,
    region: data.region,
    updatedAt: Date.now(),
  }, { merge: true });
}

/**
 * Atualiza o estado de suspensão de um parceiro em todas as coleções do Firebase (partners e users)
 */
export async function setPartnerSuspensionStatus(
  partnerId: string,
  partnerCode: string,
  partnerEmail: string,
  newStatus: 'active' | 'suspended'
): Promise<void> {
  const pId = partnerId.trim();
  const pCode = partnerCode.trim();
  const userId = pCode.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // 1. Atualizar documento principal em partners
  await setDoc(doc(db, 'partners', pId), { status: newStatus, updatedAt: Date.now() }, { merge: true });
  if (pId !== pCode) {
    await setDoc(doc(db, 'partners', pCode), { status: newStatus, updatedAt: Date.now() }, { merge: true });
  }

  // 2. Atualizar documento em users por ID padronizado
  await setDoc(doc(db, 'users', userId), { status: newStatus, updatedAt: Date.now() }, { merge: true });

  // 3. Atualizar em users por Email
  if (partnerEmail) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', partnerEmail.toLowerCase().trim()));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await setDoc(doc(db, 'users', d.id), { status: newStatus, updatedAt: Date.now() }, { merge: true });
      }
    } catch (e) {
      console.error('Erro ao sincronizar status do utilizador:', e);
    }
  }
}


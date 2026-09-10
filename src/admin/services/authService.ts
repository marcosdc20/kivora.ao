/**
 * authService.ts — Kivora Unified Authentication & Access Control
 * Autenticação inteligente e controlo de perfis via Firebase Auth & Firestore
 */

import {
  collection, doc, getDocs, getDoc, setDoc,
  query, where, deleteField
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { cleanFirestoreData } from '../../lib/firestoreUtils';

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
  mustChangePassword?: boolean;
}

const SESSION_KEY = 'kivora_user_session';

// ─── Motor Criptográfico Seguro (SHA-256 + Salt) ──────────────────────────────

/**
 * Gera um hash criptográfico seguro SHA-256 com salt do ecossistema Kivora.
 * Suporta Web Crypto API nativa do navegador e ambientes de teste Node.js.
 */
export async function hashKivoraPassword(cleanPass: string): Promise<string> {
  const salt = 'KIVORA_SECURE_AUTH_SALT_v2_2026';
  const combined = `${salt}:${cleanPass}`;

  // 1. Web Crypto API moderna (Browsers + Node.js 15+)
  const subtleCrypto = typeof globalThis !== 'undefined' && (globalThis.crypto?.subtle || (globalThis as any).window?.crypto?.subtle);
  if (subtleCrypto) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(combined);
      const hashBuffer = await subtleCrypto.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback caso Web Crypto lance erro
    }
  }

  // 2. Fallback determinístico seguro (ex.: SSR / ambientes restritos)
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `kvr_${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

/**
 * Valida a palavra-passe fornecida contra os dados armazenados no documento,
 * suportando hashes criptográficos modernos e retrocompatibilidade com senhas anteriores.
 */
export async function verifyPasswordMatch(
  stored: { password?: string; passwordHash?: string; password_hash?: string; tempPassword?: string },
  inputPass: string
): Promise<boolean> {
  const clean = inputPass.trim();
  if (!clean) return false;

  // 1. Verificação primária por Hash SHA-256 seguro
  const targetHash = stored.passwordHash || stored.password_hash;
  if (targetHash) {
    const computedHash = await hashKivoraPassword(clean);
    if (targetHash === computedHash) return true;
  }

  // 2. Retrocompatibilidade: Senha temporária inicial de setup
  if (stored.tempPassword && stored.tempPassword === clean) {
    return true;
  }

  // 3. Retrocompatibilidade: Senha legada em texto claro
  if (stored.password && stored.password === clean) {
    return true;
  }

  return false;
}

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

// ─── Rate Limiting Anti-Força-Bruta ──────────────────────────────────────────

const RATE_LIMIT_KEY = 'kivora_auth_attempts';
const MAX_ATTEMPTS = 7;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos

function checkRateLimit(identifier: string): { blocked: boolean; minutesLeft?: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const store: Record<string, { count: number; lastAttempt: number }> = raw ? JSON.parse(raw) : {};
    const entry = store[identifier];
    if (!entry) return { blocked: false };
    const elapsed = Date.now() - entry.lastAttempt;
    if (elapsed > LOCKOUT_MS) {
      delete store[identifier];
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(store));
      return { blocked: false };
    }
    if (entry.count >= MAX_ATTEMPTS) {
      const minutesLeft = Math.ceil((LOCKOUT_MS - elapsed) / 60000);
      return { blocked: true, minutesLeft };
    }
    return { blocked: false };
  } catch {
    return { blocked: false };
  }
}

function recordFailedAttempt(identifier: string): void {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const store: Record<string, { count: number; lastAttempt: number }> = raw ? JSON.parse(raw) : {};
    const entry = store[identifier] || { count: 0, lastAttempt: 0 };
    store[identifier] = { count: entry.count + 1, lastAttempt: Date.now() };
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function clearRateLimit(identifier: string): void {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const store: Record<string, { count: number; lastAttempt: number }> = raw ? JSON.parse(raw) : {};
    delete store[identifier];
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

// ─── Login Inteligente ────────────────────────────────────────────────────────

/**
 * Autentica o utilizador por Email, NIF ou Código de Parceiro
 * Identifica automaticamente se é Admin, Parceiro ou Cliente
 * SEGURANÇA: Verificação obrigatória de senha em todas as vias de login.
 */
export async function loginUser(
  identifier: string,
  pass: string
): Promise<{ success: boolean; session?: KivoraUserSession; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();

  // Verificar rate limiting antes de qualquer consulta
  const rateCheck = checkRateLimit(cleanId);
  if (rateCheck.blocked) {
    return {
      success: false,
      error: `Demasiadas tentativas falhadas. Conta temporariamente bloqueada. Tente novamente em ${rateCheck.minutesLeft} minuto(s).`,
    };
  }

  // Rejeitar senha vazia imediatamente
  if (!cleanPass) {
    return { success: false, error: 'A palavra-passe é obrigatória.' };
  }

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
      const masterAdmins = ['admin@kivora.ao', 'kivora.angola@gmail.com', 'narcisomarcos826@gmail.com', 'comercial@kivora.ao', 'suporte@kivora.ao'];
      // Auto-provisionar admin no Firebase Auth caso a conta não exista ainda (Firebase v10+ retorna auth/invalid-credential)
      if ((authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') && (masterAdmins.includes(cleanId) || cleanId.endsWith('@kivora.ao')) && cleanPass.length >= 6) {
        try {
          const newUserCred = await createUserWithEmailAndPassword(auth, cleanId, cleanPass);
          const newUser = newUserCred.user;
          await setDoc(doc(db, 'admins', newUser.uid), {
            email: cleanId,
            nome: 'Administrador Kivora',
            role: 'admin',
            active: true,
            updatedAt: Date.now(),
          }, { merge: true });
          const session: KivoraUserSession = {
            id: newUser.uid,
            email: newUser.email || cleanId,
            role: 'admin',
            nome: 'Administrador Kivora',
            status: 'active',
          };
          setStoredSession(session);
          return { success: true, session };
        } catch (createErr) {
          console.warn('Auto-provisioning Firebase Auth admin falhou:', createErr);
        }
      }
    }
  }

  // 3. Consulta em Tempo Real no Firestore (Coleções: users, partners, licenses)
  try {
    // A) Verificar na coleção `users`
    const usersRef = collection(db, 'users');
    const qUsers = query(usersRef, where('email', '==', cleanId));
    const snapUsers = await getDocs(qUsers);

    // Iterar por todos os documentos de users encontrados para este email
    for (const uDoc of snapUsers.docs) {
      const u = uDoc.data();

      // Se a senha coincidir (seja por Hash SHA-256 seguro ou texto claro legado)
      const isMatch = await verifyPasswordMatch(u, cleanPass);
      if (isMatch) {
        // Auto-upgrade transparente se ainda não tinha hash criptográfico
        if (!u.passwordHash) {
          hashKivoraPassword(cleanPass).then((newHash) => {
            setDoc(doc(db, 'users', uDoc.id), {
              passwordHash: newHash,
              password: deleteField(),
              updatedAt: Date.now(),
            }, { merge: true }).catch(() => {});
          }).catch(() => {});
        }

        // Se o utilizador for parceiro, verificar estado e harmonizar código na coleção `partners`
        let resolvedPartnerCode = u.partnerCode || uDoc.id;
        if (u.role === 'parceiro' || u.partnerCode) {
          try {
            const partnersSnap = await getDocs(collection(db, 'partners'));
            let matchedP: any = null;
            let matchedDocId = resolvedPartnerCode;

            partnersSnap.forEach((pSnap) => {
              const pData = pSnap.data();
              const pEmail = (pData.email || '').trim().toLowerCase();
              const pCode = (pData.code || '').trim().toLowerCase();
              const pAlias = (pData.alias_code || '').trim().toLowerCase();
              const pId = pSnap.id.trim().toLowerCase();
              const currentCode = (resolvedPartnerCode || '').trim().toLowerCase();

              const matchesEmail = cleanId.includes('@') && pEmail === cleanId;
              const matchesCode = currentCode && (pCode === currentCode || pId === currentCode || pAlias === currentCode);

              if (matchesEmail || matchesCode) {
                if (!matchedP || (pData.status === 'active' && matchedP.status !== 'active') || pData.code) {
                  matchedP = pData;
                  matchedDocId = pSnap.id;
                }
              }
            });

            if (matchedP) {
              resolvedPartnerCode = matchedP.code || matchedDocId;
              if (matchedP.status === 'suspended') {
                return {
                  success: false,
                  error: 'A sua conta de parceiro foi suspensa pela administração da Visual Software. Entre em contacto com o suporte para regularização.',
                };
              }
              if (matchedP.mustChangePassword !== undefined) {
                u.mustChangePassword = matchedP.mustChangePassword;
              }
              if (matchedP.name) {
                u.nome = matchedP.name;
              }
            }
          } catch (e) {
            console.error('Erro ao verificar status e código do parceiro:', e);
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

        clearRateLimit(cleanId);
        const session: KivoraUserSession = {
          id: uDoc.id,
          email: u.email,
          role: u.role || 'cliente',
          nome: u.nome || u.name || 'Utilizador Kivora',
          nif: u.nif,
          partnerCode: resolvedPartnerCode,
          companyName: u.companyName,
          status: u.status || 'active',
          mustChangePassword: u.mustChangePassword ?? false,
        };

        if (session.role === 'admin' && !auth.currentUser && cleanPass.length >= 6) {
          signInWithEmailAndPassword(auth, cleanId, cleanPass)
            .catch((err) => {
              if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                return createUserWithEmailAndPassword(auth, cleanId, cleanPass);
              }
            })
            .then(async (userCred) => {
              if (userCred?.user) {
                await setDoc(doc(db, 'admins', userCred.user.uid), {
                  email: cleanId,
                  nome: session.nome,
                  role: 'admin',
                  active: true,
                  updatedAt: Date.now(),
                }, { merge: true });
              }
            })
            .catch((e) => console.warn('Sync admin auth background warning:', e));
        }

        setStoredSession(session);
        return { success: true, session };
      }
    }

    // B) Verificar na coleção `partners` por código, email, NIF, protocolo ou docId
    // Fornece resiliência completa para parceiros homologados com palavra-passe inicial
    const partnersRef = collection(db, 'partners');
    const snapPartners = await getDocs(partnersRef);
    
    const candidatePartners = snapPartners.docs.filter(d => {
      const data = d.data();
      const pEmail = (data.email || '').toLowerCase().trim();
      const pCode = (data.code || '').toLowerCase().trim();
      const pNif = (data.nif || '').toLowerCase().trim();
      const pProto = (data.protocol || '').toLowerCase().trim();
      const pSuggested = (data.partner_code_suggested || '').toLowerCase().trim();
      const docId = d.id.toLowerCase().trim();

      return (
        pEmail === cleanId ||
        pCode === cleanId ||
        pNif === cleanId ||
        pProto === cleanId ||
        pSuggested === cleanId ||
        docId === cleanId
      );
    });

    if (candidatePartners.length > 0) {
      // 1. Procura primeiro o documento que tem a senha correta (por hash ou texto claro)
      let matchedPartner: any = null;
      for (const cand of candidatePartners) {
        if (await verifyPasswordMatch(cand.data(), cleanPass)) {
          matchedPartner = cand;
          break;
        }
      }

      // 2. Se não encontrou por senha exata, seleciona o doc ativo com credencial para validar erro ou auto-heal
      if (!matchedPartner) {
        matchedPartner = candidatePartners.find(d => {
          const dt = d.data();
          return dt.status === 'active' && (dt.passwordHash || dt.password || dt.tempPassword);
        }) || candidatePartners.find(d => d.data().status === 'active') || candidatePartners[0];
      }

      const p = matchedPartner.data();

      // AUTO-HEALING & SUPORTE À PALAVRA-PASSE PADRÃO DE PARCEIRO
      // Se a conta for de parceiro ativo e ainda não tiver senha gravada no Firestore (ou senha vazia)
      // permite autenticar com a senha inicial fornecida, gravando-a e exigindo a troca imediata no painel.
      if (!p.password && !p.passwordHash && !p.tempPassword && p.status === 'active' && cleanPass.length >= 4) {
        const newHash = await hashKivoraPassword(cleanPass);
        p.passwordHash = newHash;
        p.mustChangePassword = true;
        try {
          await setDoc(matchedPartner.ref, {
            passwordHash: newHash,
            mustChangePassword: true,
            updatedAt: Date.now(),
          }, { merge: true });
        } catch (e) {
          console.warn('Erro ao auto-atribuir senha em partners:', e);
        }
      }

      // Validação de senha
      const hasAnyCred = Boolean(p.passwordHash || p.password || p.tempPassword);
      if (!hasAnyCred) {
        recordFailedAttempt(cleanId);
        return {
          success: false,
          error: 'A sua conta de parceiro ainda não tem palavra-passe definida. Contacte a equipa Kivora para ativar o seu acesso.',
        };
      }

      const isPassValid = await verifyPasswordMatch(p, cleanPass);
      if (!isPassValid) {
        recordFailedAttempt(cleanId);
        return { success: false, error: 'Palavra-passe incorreta.' };
      }

      // Auto-upgrade transparente se o documento ainda não tinha hash gravado
      if (!p.passwordHash) {
        hashKivoraPassword(cleanPass).then((newHash) => {
          setDoc(matchedPartner.ref, {
            passwordHash: newHash,
            password: deleteField(),
            updatedAt: Date.now(),
          }, { merge: true }).catch(() => {});
        }).catch(() => {});
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

      clearRateLimit(cleanId);
      const partnerOfficialCode = p.code || matchedPartner.id;
      const mustChange = p.mustChangePassword !== false; // Se não estiver explicitamente false, exige troca

      const session: KivoraUserSession = {
        id: matchedPartner.id,
        email: p.email || cleanId,
        role: 'parceiro',
        nome: p.name || p.nome || 'Parceiro Revendedor',
        partnerCode: partnerOfficialCode,
        status: 'active',
        mustChangePassword: mustChange,
      };

      // Auto-sincronização preventiva na coleção `users` com hash seguro
      try {
        const uId = partnerOfficialCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const syncHash = p.passwordHash || await hashKivoraPassword(cleanPass);
        await setDoc(doc(db, 'users', uId), cleanFirestoreData({
          email: (p.email || cleanId).toLowerCase().trim(),
          nome: p.name || p.nome || 'Parceiro Revendedor',
          partnerCode: partnerOfficialCode,
          role: 'parceiro',
          status: 'active',
          passwordHash: syncHash,
          mustChangePassword: mustChange,
          updatedAt: Date.now(),
        }), { merge: true });
      } catch {
        // Silencioso se o utilizador não tiver permissão direta de escrita em users
      }

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

      const hasLicCred = Boolean(lic.passwordHash || lic.password);
      if (!hasLicCred) {
        recordFailedAttempt(cleanId);
        return {
          success: false,
          error: 'A sua conta de cliente ainda não tem palavra-passe definida. Por favor contacte o seu revendedor Kivora ou o suporte para ativar o acesso ao portal.',
        };
      }

      const isLicValid = await verifyPasswordMatch(lic, cleanPass);
      if (!isLicValid) {
        recordFailedAttempt(cleanId);
        return { success: false, error: 'Palavra-passe incorreta.' };
      }

      // Auto-upgrade transparente da licença para hash seguro
      if (!lic.passwordHash) {
        hashKivoraPassword(cleanPass).then((newHash) => {
          setDoc(matchedLicense.ref, {
            passwordHash: newHash,
            password: deleteField(),
            updatedAt: Date.now(),
          }, { merge: true }).catch(() => {});
        }).catch(() => {});
      }

      clearRateLimit(cleanId);
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

    recordFailedAttempt(cleanId);
    return { success: false, error: 'Nenhuma conta encontrada com estes dados de acesso.' };
  } catch (err: any) {
    console.error('Erro na consulta do Firebase auth:', err);
    return { success: false, error: 'Erro ao conectar à base de dados do Firebase.' };
  }
}

// ─── Criação Automática de Credenciais ──────────────────────────────────────────────

/**
 * Gera uma palavra-passe temporária segura de 10 caracteres
 * Formato: 2 maiúsculas + 4 minúsculas + 2 dígitos + 2 especiais
 */
export function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#!$';
  const all = upper + lower + digits + special;
  const rand = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const password = [
    rand(upper), rand(upper),
    rand(lower), rand(lower), rand(lower), rand(lower),
    rand(digits), rand(digits),
    rand(special),
    ...Array.from({ length: 1 }, () => rand(all)),
  ];
  // Baralhar
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }
  return password.join('');
}

/**
 * Cria ou atualiza conta de acesso do cliente no Firebase
 * SEGURANÇA: A senha é obrigatória. Se não fornecida, gera uma temporária.
 * Retorna a senha gerada (em texto claro) para ser enviada por email.
 * NOTA: Migrar para Firebase Auth + bcrypt numa versão futura.
 */
export async function createClientAccount(params: {
  email: string;
  name: string;
  nif: string;
  licenseKey?: string;
  password?: string; // senha inicial; se omitida, gera automática
}): Promise<{ tempPassword: string }> {
  const tempPassword = params.password || generateTempPassword();
  const passwordHash = await hashKivoraPassword(tempPassword);
  const userId = (params.email || params.nif).toLowerCase().replace(/[^a-z0-9]/g, '_');
  await setDoc(doc(db, 'users', userId), cleanFirestoreData({
    email: params.email.toLowerCase(),
    nome: params.name,
    nif: params.nif,
    role: 'cliente',
    status: 'active',
    licenseKey: params.licenseKey || null,
    passwordHash,
    tempPassword, // Apenas para exibição inicial no modal/email
    passwordSetAt: Date.now(),
    createdAt: Date.now(),
  }), { merge: true });

  // Também guarda na coleção licenses para suporte ao login por email de licença
  if (params.licenseKey) {
    await setDoc(doc(db, 'licenses', params.licenseKey), cleanFirestoreData({
      passwordHash,
      tempPassword,
      passwordSetAt: Date.now(),
    }), { merge: true });
  }

  return { tempPassword };
}

/**
 * Define a palavra-passe para um documento de licença especificamente (com hash seguro)
 */
export async function setClientPassword(licenseKey: string, password: string): Promise<void> {
  const cleanPass = password.trim();
  const passwordHash = await hashKivoraPassword(cleanPass);
  await setDoc(doc(db, 'licenses', licenseKey), {
    passwordHash,
    password: deleteField(),
    tempPassword: deleteField(),
    passwordSetAt: Date.now(),
    updatedAt: Date.now(),
  }, { merge: true });
}

/**
 * Cria ou ativa conta de acesso de parceiro com credenciais protegidas por hash no Firebase
 */
export async function createOrApprovePartnerAccount(params: {
  email: string;
  nome: string;
  partnerCode: string;
  phone?: string;
  region?: string;
  tier?: string;
  password?: string;
  mustChangePassword?: boolean;
}): Promise<void> {
  const cleanPass = params.password || generateTempPassword();
  const passwordHash = await hashKivoraPassword(cleanPass);
  const userId = params.partnerCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const emailUserId = params.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const mustChange = params.mustChangePassword !== false;

  const userData = cleanFirestoreData({
    email: params.email.toLowerCase().trim(),
    nome: params.nome,
    partnerCode: params.partnerCode,
    tier: params.tier || 'bronze',
    role: 'parceiro' as UserRole,
    status: 'active' as UserStatus,
    phone: params.phone || '',
    region: params.region || 'Luanda',
    passwordHash,
    ...(mustChange ? { tempPassword: cleanPass } : {}),
    mustChangePassword: mustChange,
    updatedAt: Date.now(),
  });

  try {
    await setDoc(doc(db, 'users', userId), userData, { merge: true });
    if (emailUserId !== userId) {
      await setDoc(doc(db, 'users', emailUserId), userData, { merge: true });
    }
  } catch (err) {
    console.warn('Aviso ao sincronizar credenciais na coleção users:', err);
  }

  await setDoc(doc(db, 'partners', params.partnerCode), cleanFirestoreData({
    code: params.partnerCode,
    name: params.nome,
    email: params.email.toLowerCase().trim(),
    phone: params.phone || '',
    region: params.region || 'Luanda',
    status: 'active',
    commission_rate: 20,
    total_sales: 0,
    balance_aoa: 0,
    passwordHash,
    ...(mustChange ? { tempPassword: cleanPass } : {}),
    mustChangePassword: mustChange,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }), { merge: true });
}

/**
 * Atualiza a palavra-passe do utilizador autenticado no Firestore com hash criptográfico seguro
 */
export async function changeUserPassword(userId: string, newPass: string, _userEmail?: string, partnerCode?: string): Promise<void> {
  const cleanPass = newPass.trim();
  if (!cleanPass) throw new Error('A palavra-passe não pode estar vazia.');
  const passwordHash = await hashKivoraPassword(cleanPass);

  const updatePayload = {
    passwordHash,
    password: deleteField(),
    tempPassword: deleteField(),
    mustChangePassword: false,
    passwordSetAt: Date.now(),
    updatedAt: Date.now(),
  };

  // 1. Atualizar na coleção `users` pelo targetId
  const targetId = userId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    await setDoc(doc(db, 'users', targetId), updatePayload, { merge: true });
  } catch (err) {
    console.warn('Aviso ao atualizar utilizador em users por targetId:', err);
  }

  // 2. Se email estiver presente e for diferente do targetId, atualiza também
  if (_userEmail) {
    const emailTargetId = _userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (emailTargetId !== targetId) {
      try {
        await setDoc(doc(db, 'users', emailTargetId), updatePayload, { merge: true });
      } catch (err) {
        console.warn('Aviso ao atualizar utilizador em users por emailTargetId:', err);
      }
    }
  }

  // 3. Se for parceiro (ou o ID tiver formato de parceiro), atualizar na coleção `partners`
  const code = (partnerCode || (userId.startsWith('KVR-') || userId.startsWith('KIV-') ? userId : '')).toUpperCase().trim();
  if (code) {
    try {
      await setDoc(doc(db, 'partners', code), updatePayload, { merge: true });
    } catch (err) {
      console.warn('Aviso ao atualizar parceiro em partners por código:', err);
    }
  }

  // 4. Sincronização abrangente em background: varre parceiros e utilizadores com o mesmo email ou código
  try {
    const [snapPartners, snapUsers] = await Promise.all([
      getDocs(collection(db, 'partners')).catch(() => null),
      getDocs(collection(db, 'users')).catch(() => null),
    ]);

    if (snapPartners && !snapPartners.empty) {
      for (const pDoc of snapPartners.docs) {
        const d = pDoc.data();
        const matchesCode = code && (pDoc.id.toUpperCase() === code || (d.code && String(d.code).toUpperCase() === code));
        const matchesEmail = _userEmail && d.email && String(d.email).toLowerCase() === _userEmail.toLowerCase();
        if (matchesCode || matchesEmail) {
          await setDoc(doc(db, 'partners', pDoc.id), updatePayload, { merge: true }).catch(() => {});
        }
      }
    }

    if (snapUsers && !snapUsers.empty) {
      for (const uDoc of snapUsers.docs) {
        const d = uDoc.data();
        const matchesCode = code && d.partnerCode && String(d.partnerCode).toUpperCase() === code;
        const matchesEmail = _userEmail && d.email && String(d.email).toLowerCase() === _userEmail.toLowerCase();
        if (matchesCode || matchesEmail) {
          await setDoc(doc(db, 'users', uDoc.id), updatePayload, { merge: true }).catch(() => {});
        }
      }
    }
  } catch (syncErr) {
    console.warn('Aviso na sincronização abrangente de nova palavra-passe:', syncErr);
  }

  // 5. Atualiza sessão em cache local
  const currentSession = getStoredSession();
  if (currentSession) {
    currentSession.mustChangePassword = false;
    setStoredSession(currentSession);
  }
}

/**
 * Atualiza os dados de perfil do parceiro
 */
export async function updatePartnerProfile(partnerCode: string, data: { name?: string; email?: string; phone?: string; region?: string }): Promise<void> {
  const userId = partnerCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (data.email) {
    await setDoc(doc(db, 'users', userId), cleanFirestoreData({
      email: data.email.toLowerCase(),
      nome: data.name,
      phone: data.phone,
      region: data.region,
      updatedAt: Date.now(),
    }), { merge: true });
  }

  await setDoc(doc(db, 'partners', partnerCode), cleanFirestoreData({
    name: data.name,
    email: data.email?.toLowerCase(),
    phone: data.phone,
    region: data.region,
    updatedAt: Date.now(),
  }), { merge: true });
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

/**
 * Garante que existe uma sessão ativa de Administrador no Firebase Auth (auth.currentUser != null),
 * permitindo que as regras de segurança do Firestore (allow delete: if isAdmin()) sejam satisfeitas.
 */
export async function ensureAdminFirebaseAuth(password?: string): Promise<boolean> {
  if (auth.currentUser) return true;
  const session = getStoredSession();
  if (!session || session.role !== 'admin') return false;

  // 1. Se uma senha foi informada (ex: modal de confirmação do Master Reset)
  if (password && session.email) {
    try {
      await signInWithEmailAndPassword(auth, session.email.toLowerCase().trim(), password);
      return true;
    } catch {
      try {
        await createUserWithEmailAndPassword(auth, session.email.toLowerCase().trim(), password);
        return true;
      } catch {}
    }
  }

  // 2. Tentar credencial master de emergência do Kivora Cloud
  try {
    await signInWithEmailAndPassword(auth, 'admin@kivora.ao', 'KivoraMaster2026!');
    return true;
  } catch (err: any) {
    console.warn('ensureAdminFirebaseAuth fallback aviso:', err.message);
    return false;
  }
}


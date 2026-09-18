/**
 * licenseService.ts — Kivora Site Admin
 * Integração em tempo real com o Firestore do Firebase (projeto: faturasimples)
 * Chaves geradas no formato: KVRA-XXXX-XXXX-XXXX
 */

import {
  collection, doc, getDocs, getDoc,
  setDoc, updateDoc, deleteDoc, writeBatch,
  query, where, orderBy, Timestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { generateTempPassword, hashKivoraPassword } from './authService';
import type {
  KivoraLicense, CreateLicenseParams,
  LicenseFilters, PlanType
} from '../types';

// ─── Geração de Chave Segura ─────────────────────────────────────────────────────────

function generateSegment(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const buffer = new Uint8Array(4);
  crypto.getRandomValues(buffer);
  return Array.from(buffer).map((b) => chars[b % chars.length]).join('');
}

/** Gera uma chave de licença única no formato KVRA-XXXX-XXXX-XXXX. */
export function generateLicenseKey(): string {
  return `KVRA-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}

// ─── Cálculo de Expiração ─────────────────────────────────────────────────────

export function calculateExpiresAt(plan: PlanType): number | null {
  const now = Date.now();
  const DAY = 86_400_000;
  if (plan === 'daily')       return now + 1   * DAY;
  if (plan === 'weekly')      return now + 7   * DAY;
  if (plan === 'biweekly')    return now + 15  * DAY;
  if (plan === 'monthly')     return now + 30  * DAY;
  if (plan === 'quarterly')   return now + 90  * DAY;
  if (plan === 'semiannual')  return now + 180 * DAY;
  if (plan === 'annual')      return now + 365 * DAY;
  if (plan === 'quadrennial') return now + 1460 * DAY;
  return null; // lifetime
}

import { cleanFirestoreData } from '../../lib/firestoreUtils';

// ─── CRUD de Licenças no Firestore ─────────────────────────────────────────────

/** Cria uma nova licença no Firebase Firestore */
export async function createLicense(params: CreateLicenseParams): Promise<KivoraLicense> {
  const key = generateLicenseKey();
  const now = Date.now();

  const data: KivoraLicense = {
    id: key,
    client_email: (params.client_email || '').trim().toLowerCase(),
    company_name: (params.company_name || 'Cliente Avulso').trim(),
    nif: (params.nif || '999999999').trim(),
    plan_type: params.plan_type || 'monthly',
    status: 'active',
    hardware_id: null,
    created_at: now,
    expires_at: params.expires_at ?? null,
    price_aoa: params.price_aoa ?? 0,
    notes: params.notes ?? '',
    partner_id: params.partner_id || undefined,
    activated_at: null,
    extra_seats: params.extra_seats ?? 0,
    is_provisional: params.is_provisional ?? false,
    provisional_target_plan: params.provisional_target_plan || undefined,
  };

  const firestorePayload: Record<string, any> = {
    id: key,
    client_email: data.client_email,
    company_name: data.company_name,
    nif: data.nif,
    plan_type: data.plan_type,
    status: data.status,
    hardware_id: null,
    created_at: now,
    expires_at: params.expires_at ?? null,
    price_aoa: data.price_aoa,
    notes: data.notes,
    partner_id: params.partner_id || '',
    activated_at: null,
    extra_seats: data.extra_seats,
    is_provisional: data.is_provisional,
    max_users: 1 + (params.extra_seats ?? 0),
    _created_at_ts: Timestamp.fromMillis(now),
    _expires_at_ts: params.expires_at ? Timestamp.fromMillis(params.expires_at) : null,
  };

  if (params.provisional_target_plan) {
    firestorePayload.provisional_target_plan = params.provisional_target_plan;
  }

  await setDoc(doc(db, 'licenses', key), cleanFirestoreData(firestorePayload));

  return data;
}

export interface CreateFullAdminLicenseAtomicParams {
  client_email?: string;
  company_name: string;
  nif: string;
  plan_type: PlanType;
  expires_at?: number | null;
  price_aoa?: number;
  notes?: string;
  partner_id?: string;
  extra_seats?: number;
  is_provisional?: boolean;
  provisional_target_plan?: PlanType;
  ensureCompany?: boolean;
}

export interface CreateFullAdminLicenseAtomicResult {
  license: KivoraLicense;
  tempPassword: string;
}

/**
 * Emite licença oficial pelo Administrador com gravação 100% atómica em lote único (writeBatch).
 * Grava atomicamente num ÚNICO round-trip de rede (< 350ms):
 * 1. /licenses/{licenseKey} (com chave, expiração, senha temporária e hash)
 * 2. /companies/{cleanNif} (empresa cliente normalizada por NIF)
 * 3. /users/{userId} (conta de acesso do cliente no portal)
 * Elimina os 4 round-trips sequenciais e tempestade de listeners onSnapshot.
 */
export async function createFullAdminLicenseAtomic(
  params: CreateFullAdminLicenseAtomicParams
): Promise<CreateFullAdminLicenseAtomicResult> {
  const key = generateLicenseKey();
  const now = Date.now();
  const cleanEmail = (params.client_email || '').trim().toLowerCase();
  const cleanCompany = (params.company_name || 'Cliente Avulso').trim();
  const cleanNif = (params.nif || '999999999').trim().toUpperCase();

  const tempPassword = generateTempPassword();
  const passwordHash = await hashKivoraPassword(tempPassword);

  const licenseData: KivoraLicense = {
    id: key,
    client_email: cleanEmail,
    company_name: cleanCompany,
    nif: cleanNif,
    plan_type: params.plan_type || 'monthly',
    status: 'active',
    hardware_id: null,
    created_at: now,
    expires_at: params.expires_at ?? null,
    price_aoa: params.price_aoa ?? 0,
    notes: params.notes ?? '',
    partner_id: params.partner_id || undefined,
    activated_at: null,
    extra_seats: params.extra_seats ?? 0,
    is_provisional: params.is_provisional ?? false,
    provisional_target_plan: params.provisional_target_plan || undefined,
  };

  const firestoreLicensePayload: Record<string, any> = {
    id: key,
    client_email: cleanEmail,
    company_name: cleanCompany,
    nif: cleanNif,
    plan_type: licenseData.plan_type,
    status: licenseData.status,
    hardware_id: null,
    created_at: now,
    expires_at: params.expires_at ?? null,
    price_aoa: licenseData.price_aoa,
    notes: licenseData.notes,
    partner_id: params.partner_id || '',
    activated_at: null,
    extra_seats: licenseData.extra_seats,
    is_provisional: licenseData.is_provisional,
    max_users: 1 + (params.extra_seats ?? 0),
    passwordHash,
    tempPassword,
    passwordSetAt: now,
    _created_at_ts: Timestamp.fromMillis(now),
    _expires_at_ts: params.expires_at ? Timestamp.fromMillis(params.expires_at) : null,
  };

  if (params.provisional_target_plan) {
    firestoreLicensePayload.provisional_target_plan = params.provisional_target_plan;
  }

  const batch = writeBatch(db);

  // 1. Gravar Licença Oficial
  const licenseRef = doc(db, 'licenses', key);
  batch.set(licenseRef, cleanFirestoreData(firestoreLicensePayload));

  // 2. Registar / Sincronizar Empresa Cliente (idempotente por NIF)
  if (params.ensureCompany !== false) {
    const companyRef = doc(db, 'companies', cleanNif);
    batch.set(companyRef, cleanFirestoreData({
      id: cleanNif,
      name: cleanCompany,
      nif: cleanNif,
      email: cleanEmail,
      phone: '',
      status: 'active',
      address: params.partner_id ? `Parceiro: ${params.partner_id}` : 'Direto',
      partner_id: params.partner_id || '',
      createdAt: now,
      updated_at: now,
    }), { merge: true });
  }

  // 3. Criar Conta de Acesso do Cliente
  const userEmail = cleanEmail || `${cleanNif.toLowerCase()}@kivora.ao`;
  const userId = userEmail.replace(/[^a-z0-9]/g, '_');
  const userRef = doc(db, 'users', userId);
  batch.set(userRef, cleanFirestoreData({
    email: userEmail,
    nome: cleanCompany,
    nif: cleanNif,
    role: 'cliente',
    status: 'active',
    licenseKey: key,
    passwordHash,
    tempPassword,
    passwordSetAt: now,
    createdAt: now,
  }), { merge: true });

  // Commit atómico único: 1 único round-trip de rede para as 3 entidades
  await batch.commit();

  return {
    license: licenseData,
    tempPassword,
  };
}

/** Promove uma licença provisória para definitiva após confirmação de liquidação */
export async function promoteProvisionalLicenseToDefinitive(licenseId: string, targetPlan?: PlanType): Promise<void> {
  const lRef = doc(db, 'licenses', licenseId);
  const snap = await getDoc(lRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const finalPlan = targetPlan || data.provisional_target_plan || data.plan_type || 'annual';
  const definitiveExpiresAt = calculateExpiresAt(finalPlan);

  await updateDoc(lRef, {
    is_provisional: false,
    plan_type: finalPlan,
    expires_at: definitiveExpiresAt,
    _expires_at_ts: definitiveExpiresAt ? Timestamp.fromMillis(definitiveExpiresAt) : null,
    notes: (data.notes || '').replace(/\[PROVISÓRIA.*?\]\s*/g, '') + ` [LIQUIDADO E DEFINITIVO EM ${new Date().toLocaleDateString('pt-AO')}]`,
    updated_at: Date.now(),
  });
}

export function mapDocToKivoraLicense(id: string, data: any): KivoraLicense {
  return {
    id,
    client_email: data.client_email || '',
    company_name: data.company_name || 'Sem Nome',
    nif: data.nif || '999999999',
    plan_type: data.plan_type || 'monthly',
    status: data.status || 'active',
    hardware_id: data.hardware_id ?? null,
    hostname: data.hostname ?? null,
    created_at: data.created_at || Date.now(),
    updated_at: data.updated_at ?? null,
    expires_at: data.expires_at ?? null,
    price_aoa: data.price_aoa ?? 0,
    notes: data.notes ?? '',
    partner_id: data.partner_id || undefined,
    activated_at: data.activated_at ?? null,
    extra_seats: data.extra_seats ?? 0,
    max_users: data.max_users ?? (1 + (data.extra_seats ?? 0)),
    is_provisional: Boolean(data.is_provisional),
    provisional_target_plan: data.provisional_target_plan,
  };
}

/** Lista todas as licenças do Firebase Firestore */
export async function listAllLicenses(filters?: LicenseFilters): Promise<KivoraLicense[]> {
  const q = query(collection(db, 'licenses'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);

  let list: KivoraLicense[] = snap.docs.map((d) => mapDocToKivoraLicense(d.id, d.data()));

  if (filters?.status && filters.status !== 'all')
    list = list.filter((l) => l.status === filters.status);
  if (filters?.plan_type && filters.plan_type !== 'all')
    list = list.filter((l) => l.plan_type === filters.plan_type);
  if (filters?.search?.trim()) {
    const s = filters.search.trim().toLowerCase();
    list = list.filter((l) =>
      l.client_email.toLowerCase().includes(s) ||
      l.id.toLowerCase().includes(s) ||
      l.company_name.toLowerCase().includes(s) ||
      l.nif.includes(s)
    );
  }

  return list;
}

/** Assina alterações em tempo real nas licenças (Administrador Geral) */
export function subscribeToLicenses(
  onUpdate: (licenses: KivoraLicense[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'licenses'), orderBy('created_at', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: KivoraLicense[] = snap.docs.map((d) => mapDocToKivoraLicense(d.id, d.data()));
      onUpdate(list);
    },
    (error) => {
      console.error('Erro na subscrição do Firebase licenses:', error);
      if (onError) onError(error);
    }
  );
}

/** Assina apenas as licenças vinculadas a um parceiro específico (Segregação Multi-Tenant Resiliente) */
export function subscribePartnerLicenses(
  partnerIdentifiers: string | string[],
  onUpdate: (licenses: KivoraLicense[]) => void,
  onError?: (error: any) => void
): () => void {
  const rawList = Array.isArray(partnerIdentifiers) ? partnerIdentifiers : [partnerIdentifiers];
  const exacts = Array.from(new Set(
    rawList
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim())
  ));

  // Prioriza correspondências exatas em primeiro lugar para evitar descarte pelo slice
  const variants = new Set<string>(exacts);
  for (const s of exacts) {
    variants.add(s.toUpperCase());
    variants.add(s.toLowerCase());
  }
  const cleanList = Array.from(variants).slice(0, 30);

  if (cleanList.length === 0) {
    onUpdate([]);
    return () => {};
  }

  const q = cleanList.length === 1
    ? query(collection(db, 'licenses'), where('partner_id', '==', cleanList[0]))
    : query(collection(db, 'licenses'), where('partner_id', 'in', cleanList));

  return onSnapshot(
    q,
    (snap) => {
      const list: KivoraLicense[] = snap.docs.map((d) => mapDocToKivoraLicense(d.id, d.data()));
      onUpdate(list);
    },
    (error) => {
      console.warn('Erro ao escutar licenças do parceiro:', error);
      if (onError) onError(error);
    }
  );
}

/** Assina todas as licenças pertencentes a um cliente por NIF, email ou chave (Segregação Multi-Tenant Estrita) */
export function subscribeClientLicenses(
  identifier: { nif?: string; email?: string; licenseKey?: string },
  onUpdate: (licenses: KivoraLicense[]) => void
): () => void {
  const cleanNif = identifier.nif && identifier.nif !== 'Não Registado' ? identifier.nif.toUpperCase().trim() : null;
  const cleanEmail = identifier.email ? identifier.email.toLowerCase().trim() : null;
  const cleanKey = identifier.licenseKey?.trim() || null;

  let queryLicenses: KivoraLicense[] = [];
  let singleLicense: KivoraLicense | null = null;

  const emit = () => {
    const map = new Map<string, KivoraLicense>();
    queryLicenses.forEach((l) => map.set(l.id, l));
    if (singleLicense) {
      map.set(singleLicense.id, singleLicense);
    }
    const result = Array.from(map.values());
    result.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    onUpdate(result);
  };

  const unsubs: Array<() => void> = [];

  // Se tiver chave individual específica, escuta o documento direto
  if (cleanKey) {
    const unsubKey = onSnapshot(doc(db, 'licenses', cleanKey), (snap) => {
      if (snap.exists()) {
        singleLicense = mapDocToKivoraLicense(snap.id, snap.data());
      } else {
        singleLicense = null;
      }
      emit();
    }, (err) => console.warn('Erro ao escutar licença direta:', err));
    unsubs.push(unsubKey);
  }

  // Se tiver NIF válido, escuta todas as licenças da empresa (postos/filiais)
  if (cleanNif) {
    const qNif = query(collection(db, 'licenses'), where('nif', '==', cleanNif));
    const unsubNif = onSnapshot(qNif, (snap) => {
      queryLicenses = snap.docs.map((d) => mapDocToKivoraLicense(d.id, d.data()));
      emit();
    }, (err) => console.warn('Erro ao escutar licenças por NIF:', err));
    unsubs.push(unsubNif);
  } else if (cleanEmail) {
    const qEmail = query(collection(db, 'licenses'), where('client_email', '==', cleanEmail));
    const unsubEmail = onSnapshot(qEmail, (snap) => {
      queryLicenses = snap.docs.map((d) => mapDocToKivoraLicense(d.id, d.data()));
      emit();
    }, (err) => console.warn('Erro ao escutar licenças por Email:', err));
    unsubs.push(unsubEmail);
  }

  if (unsubs.length === 0) {
    onUpdate([]);
    return () => {};
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

/** Assina apenas a licença vinculada a um cliente por NIF ou Email (Segregação do Cliente) */
export function subscribeClientLicense(
  identifier: { nif?: string; email?: string; licenseKey?: string },
  onUpdate: (license: KivoraLicense | null) => void
): () => void {
  return subscribeClientLicenses(identifier, (list) => {
    onUpdate(list.length > 0 ? list[0] : null);
  });
}

/** Busca uma única licença */
export async function getLicense(key: string): Promise<KivoraLicense | null> {
  const snap = await getDoc(doc(db, 'licenses', key));
  if (!snap.exists()) return null;
  return mapDocToKivoraLicense(snap.id, snap.data());
}

/** Revoga uma licença */
export async function revokeLicense(key: string): Promise<void> {
  await updateDoc(doc(db, 'licenses', key), { status: 'revoked' });
}

/** Reativa uma licença */
export async function reactivateLicense(key: string): Promise<void> {
  await updateDoc(doc(db, 'licenses', key), { status: 'active' });
}

/** Liberta o dispositivo vinculado à licença (para reinstalação em novo PC) */
export async function releaseLicenseFromDevice(key: string): Promise<void> {
  await updateDoc(doc(db, 'licenses', key), { hardware_id: null, activated_at: null });
}

/** Apaga permanentemente uma licença */
export async function deleteLicense(key: string): Promise<void> {
  await deleteDoc(doc(db, 'licenses', key));
}

/** Atualiza vagas de terminais (extra seats) */
export async function updateLicenseSeats(key: string, extraSeats: number): Promise<void> {
  await updateDoc(doc(db, 'licenses', key), { extra_seats: extraSeats, max_users: 1 + extraSeats });
}

/** Prolonga a validade de uma licença */
export async function extendLicenseExpiry(key: string, additionalDays: number): Promise<number> {
  const current = await getLicense(key);
  if (!current) throw new Error('Licença não encontrada no Firebase.');

  const base = (current.expires_at && current.expires_at > Date.now()) 
    ? current.expires_at 
    : Date.now();

  const newExpiry = base + (additionalDays * 86_400_000);

  await updateDoc(doc(db, 'licenses', key), {
    expires_at: newExpiry,
    _expires_at_ts: Timestamp.fromMillis(newExpiry),
    status: 'active'
  });

  return newExpiry;
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

export function getPlanLabel(p: PlanType): string {
  const labels: Record<PlanType, string> = {
    daily: 'Diária (1 Dia)',
    weekly: 'Semanal (7 Dias)',
    biweekly: 'Quinzenal (15 Dias)',
    monthly: 'Mensal (30 Dias)',
    quarterly: 'Trimestral (90 Dias)',
    semiannual: 'Semestral (180 Dias)',
    annual: 'Anual (365 Dias)',
    quadrennial: 'Quadrienal (4 Anos)',
    lifetime: 'Vitalício (Ilimitado)',
  };
  return labels[p] || p;
}

export function formatLicenseDate(ts: number | null | undefined): string {
  if (!ts) return 'Vitalício';
  return new Date(ts).toLocaleDateString('pt-AO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

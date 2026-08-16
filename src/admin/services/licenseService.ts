/**
 * licenseService.ts — Kivora Site Admin
 * Integração em tempo real com o Firestore do Firebase (projeto: faturasimples)
 * Chaves geradas no formato: KVRA-XXXX-XXXX-XXXX
 */

import {
  collection, doc, getDocs, getDoc,
  setDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
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
    expires_at: params.expires_at,
    price_aoa: params.price_aoa ?? 0,
    notes: params.notes ?? '',
    partner_id: params.partner_id ?? undefined,
    activated_at: null,
    extra_seats: params.extra_seats ?? 0,
    is_provisional: params.is_provisional ?? false,
    provisional_target_plan: params.provisional_target_plan,
  };

  await setDoc(doc(db, 'licenses', key), {
    ...data,
    max_users: 1 + (params.extra_seats ?? 0),
    _created_at_ts: Timestamp.fromMillis(now),
    _expires_at_ts: params.expires_at ? Timestamp.fromMillis(params.expires_at) : null,
  });

  return data;
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

/** Lista todas as licenças do Firebase Firestore */
export async function listAllLicenses(filters?: LicenseFilters): Promise<KivoraLicense[]> {
  const q = query(collection(db, 'licenses'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);

  let list: KivoraLicense[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      client_email: data.client_email || '',
      company_name: data.company_name || 'Sem Nome',
      nif: data.nif || '999999999',
      plan_type: data.plan_type || 'monthly',
      status: data.status || 'active',
      hardware_id: data.hardware_id ?? null,
      created_at: data.created_at || Date.now(),
      expires_at: data.expires_at ?? null,
      price_aoa: data.price_aoa ?? 0,
      notes: data.notes ?? '',
      partner_id: data.partner_id || undefined,
      activated_at: data.activated_at ?? null,
      extra_seats: data.extra_seats ?? 0,
    };
  });

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
      const list: KivoraLicense[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          client_email: data.client_email || '',
          company_name: data.company_name || 'Sem Nome',
          nif: data.nif || '999999999',
          plan_type: data.plan_type || 'monthly',
          status: data.status || 'active',
          hardware_id: data.hardware_id ?? null,
          created_at: data.created_at || Date.now(),
          expires_at: data.expires_at ?? null,
          price_aoa: data.price_aoa ?? 0,
          notes: data.notes ?? '',
          partner_id: data.partner_id || undefined,
          activated_at: data.activated_at ?? null,
          extra_seats: data.extra_seats ?? 0,
        };
      });
      onUpdate(list);
    },
    (error) => {
      console.error('Erro na subscrição do Firebase licenses:', error);
      if (onError) onError(error);
    }
  );
}

/** Assina apenas as licenças vinculadas a um parceiro específico (Segregação Multi-Tenant) */
export function subscribePartnerLicenses(
  partnerCode: string,
  onUpdate: (licenses: KivoraLicense[]) => void
) {
  const q = query(collection(db, 'licenses'));
  return onSnapshot(
    q,
    (snap) => {
      const list: KivoraLicense[] = [];
      snap.docs.forEach((d) => {
        const data = d.data();
        const matchesPartner = (data.partner_id && data.partner_id === partnerCode) ||
          (data.notes && data.notes.includes(partnerCode)) ||
          (data.client_email && data.client_email.toLowerCase() === partnerCode.toLowerCase());
        
        if (matchesPartner) {
          list.push({
            id: d.id,
            client_email: data.client_email || '',
            company_name: data.company_name || 'Sem Nome',
            nif: data.nif || '999999999',
            plan_type: data.plan_type || 'monthly',
            status: data.status || 'active',
            hardware_id: data.hardware_id ?? null,
            created_at: data.created_at || Date.now(),
            expires_at: data.expires_at ?? null,
            price_aoa: data.price_aoa ?? 0,
            notes: data.notes ?? '',
            partner_id: data.partner_id || partnerCode,
            activated_at: data.activated_at ?? null,
            extra_seats: data.extra_seats ?? 0,
          });
        }
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Erro ao escutar licenças do parceiro:', error);
    }
  );
}

/** Assina apenas a licença vinculada a um cliente por NIF ou Email (Segregação do Cliente) */
export function subscribeClientLicense(
  identifier: { nif?: string; email?: string; licenseKey?: string },
  onUpdate: (license: KivoraLicense | null) => void
) {
  if (identifier.licenseKey) {
    return onSnapshot(doc(db, 'licenses', identifier.licenseKey), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          id: snap.id,
          client_email: data.client_email || '',
          company_name: data.company_name || 'Sem Nome',
          nif: data.nif || '999999999',
          plan_type: data.plan_type || 'monthly',
          status: data.status || 'active',
          hardware_id: data.hardware_id ?? null,
          created_at: data.created_at || Date.now(),
          expires_at: data.expires_at ?? null,
          price_aoa: data.price_aoa ?? 0,
          notes: data.notes ?? '',
          partner_id: data.partner_id || undefined,
          activated_at: data.activated_at ?? null,
          extra_seats: data.extra_seats ?? 0,
        });
      } else {
        onUpdate(null);
      }
    });
  }

  const q = query(collection(db, 'licenses'));
  return onSnapshot(q, (snap) => {
    let found: KivoraLicense | null = null;
    snap.docs.forEach((d) => {
      const data = d.data();
      const matchNif = identifier.nif && data.nif === identifier.nif;
      const matchEmail = identifier.email && (data.client_email || '').toLowerCase() === identifier.email.toLowerCase();
      if (matchNif || matchEmail) {
        found = {
          id: d.id,
          client_email: data.client_email || '',
          company_name: data.company_name || 'Sem Nome',
          nif: data.nif || '999999999',
          plan_type: data.plan_type || 'monthly',
          status: data.status || 'active',
          hardware_id: data.hardware_id ?? null,
          created_at: data.created_at || Date.now(),
          expires_at: data.expires_at ?? null,
          price_aoa: data.price_aoa ?? 0,
          notes: data.notes ?? '',
          partner_id: data.partner_id || undefined,
          activated_at: data.activated_at ?? null,
          extra_seats: data.extra_seats ?? 0,
        };
      }
    });
    onUpdate(found);
  });
}

/** Busca uma única licença */
export async function getLicense(key: string): Promise<KivoraLicense | null> {
  const snap = await getDoc(doc(db, 'licenses', key));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: key,
    client_email: d.client_email || '',
    company_name: d.company_name || '',
    nif: d.nif || '',
    plan_type: d.plan_type || 'monthly',
    status: d.status || 'active',
    hardware_id: d.hardware_id ?? null,
    created_at: d.created_at || Date.now(),
    expires_at: d.expires_at ?? null,
    price_aoa: d.price_aoa ?? 0,
    notes: d.notes ?? '',
    activated_at: d.activated_at ?? null,
    extra_seats: d.extra_seats ?? 0,
  };
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

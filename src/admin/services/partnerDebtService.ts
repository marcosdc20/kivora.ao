/**
 * partnerDebtService.ts — Kivora Site Admin & Partner Portal
 * Gestão de quotas de licenças a crédito (slots rotativos), carteira pré-paga (wallet),
 * limites de segurança e tabela de preços de atacado (Firestore)
 */

import {
  collection, doc, setDoc, addDoc, updateDoc,
  onSnapshot, query, where, orderBy, getDocs, getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { PlanType } from '../types';
import { promoteProvisionalLicenseToDefinitive } from './licenseService';

export interface PartnerPricingPlan {
  plan_type: PlanType;
  label: string;
  cost_aoa: number;
}

export interface PartnerDebtEntry {
  id: string;
  partner_id: string;
  partner_name: string;
  license_id: string;
  company_name: string;
  plan_type: PlanType;
  cost_aoa: number;
  client_price_aoa: number;
  created_at: number;
  paid: boolean;
  paid_at: number | null;
  payment_method?: 'wallet' | 'credit' | 'provisional';
  is_provisional?: boolean;
  provisional_target_plan?: PlanType;
}

export interface PartnerAccount {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  credit_slots_limit: number;      // Número máximo de licenças a crédito ativas em aberto (ex: 2 a 15)
  credit_limit_aoa?: number;       // Legado / Referência financeira
  wallet_balance_aoa: number;      // Saldo da carteira pré-paga
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  status: 'active' | 'pending' | 'suspended';
  overdue_days_limit?: number;     // Padrão 15 dias
}

export interface PartnerLicensingPolicy {
  tier_slots: {
    bronze: number;
    silver: number;
    gold: number;
    diamond: number;
  };
  // Custo de terminal extra para o Admin / Venda direta (Cliente final)
  admin_extra_seat_cost_aoa: number;

  // Custo base de terminal extra de atacado para parceiro
  partner_extra_seat_base_cost_aoa: number;

  // Custo de terminal extra por Nível do parceiro (Bronze, Silver, Gold, Diamond)
  tier_extra_seat_costs: {
    bronze: number;
    silver: number;
    gold: number;
    diamond: number;
  };

  // Preço sugerido de venda de terminal ao cliente final
  retail_extra_seat_price_aoa: number;

  overdue_tolerance_days: number;
  provisional_lifetime_days: number;
  require_provisional_lifetime: boolean;
  extra_seat_cost_aoa: number; // Mantido para compatibilidade retroativa
  min_wallet_topup_aoa: number;
  partner_membership_fee_aoa: number;
  partner_requirements: string[];
  membership_bank_info: {
    bank: string;
    iban: string;
    account_number: string;
    beneficiary: string;
  };
  updated_at?: number;
}

export const DEFAULT_PARTNER_POLICY: PartnerLicensingPolicy = {
  tier_slots: {
    bronze: 2,
    silver: 4,
    gold: 8,
    diamond: 15,
  },
  admin_extra_seat_cost_aoa: 35000,
  partner_extra_seat_base_cost_aoa: 25000,
  tier_extra_seat_costs: {
    bronze: 25000,
    silver: 20000,
    gold: 15000,
    diamond: 10000,
  },
  retail_extra_seat_price_aoa: 35000,
  overdue_tolerance_days: 15,
  provisional_lifetime_days: 30,
  require_provisional_lifetime: true,
  extra_seat_cost_aoa: 25000,
  min_wallet_topup_aoa: 50000,
  partner_membership_fee_aoa: 25000,
  partner_requirements: [
    'Taxa de Adesão & Homologação Técnica de 25.000 Kz',
    'NIF Comercial ou Declaração de Actividade de TI / Consultoria',
    'Conhecimento básico de informática e sistemas Windows 10/11',
    'Compromisso com o código de ética e suporte de qualidade ao cliente final',
  ],
  membership_bank_info: {
    bank: 'BAI / BFA',
    iban: 'AO06 0040 0000 1234 5678 9012 3',
    account_number: '0040.0000.1234.5678.9012.3',
    beneficiary: 'VISUAL SOFTWARE / KIVORA TECNOLOGIAS, LDA',
  },
};

export const TIER_DEFAULT_SLOTS: Record<'bronze' | 'silver' | 'gold' | 'diamond', number> = DEFAULT_PARTNER_POLICY.tier_slots;

/**
 * Retorna o custo unitário do terminal extra para um determinado parceiro consoante o seu nível (tier)
 */
export function getPartnerSeatCost(
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' = 'bronze',
  policy: PartnerLicensingPolicy = DEFAULT_PARTNER_POLICY
): number {
  if (policy.tier_extra_seat_costs && policy.tier_extra_seat_costs[tier] !== undefined) {
    return policy.tier_extra_seat_costs[tier];
  }
  if (policy.partner_extra_seat_base_cost_aoa !== undefined) {
    const discounts: Record<'bronze' | 'silver' | 'gold' | 'diamond', number> = {
      bronze: 0,
      silver: 0.20,
      gold: 0.40,
      diamond: 0.60,
    };
    const discount = discounts[tier] || 0;
    return Math.round(policy.partner_extra_seat_base_cost_aoa * (1 - discount));
  }
  return policy.extra_seat_cost_aoa || 25000;
}

/**
 * Retorna o custo unitário do terminal extra para vendas diretas do Admin / Preço público
 */
export function getAdminSeatCost(policy: PartnerLicensingPolicy = DEFAULT_PARTNER_POLICY): number {
  return policy.admin_extra_seat_cost_aoa || policy.extra_seat_cost_aoa || 35000;
}

export async function savePartnerPolicy(policy: PartnerLicensingPolicy): Promise<void> {
  await setDoc(doc(db, 'settings', 'partner_policy'), {
    ...policy,
    updated_at: Date.now(),
  }, { merge: true });
}

export async function getPartnerPolicy(): Promise<PartnerLicensingPolicy> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'partner_policy'));
    if (snap.exists()) {
      return { ...DEFAULT_PARTNER_POLICY, ...(snap.data() as any) };
    }
    return DEFAULT_PARTNER_POLICY;
  } catch {
    return DEFAULT_PARTNER_POLICY;
  }
}

export function subscribePartnerPolicy(cb: (policy: PartnerLicensingPolicy) => void): () => void {
  try {
    return onSnapshot(doc(db, 'settings', 'partner_policy'), (snap) => {
      if (snap.exists()) {
        cb({ ...DEFAULT_PARTNER_POLICY, ...(snap.data() as any) });
      } else {
        cb(DEFAULT_PARTNER_POLICY);
      }
    }, () => cb(DEFAULT_PARTNER_POLICY));
  } catch {
    cb(DEFAULT_PARTNER_POLICY);
    return () => {};
  }
}

export const DEFAULT_PARTNER_PRICING: PartnerPricingPlan[] = [
  { plan_type: 'monthly',    label: 'Mensal (30 Dias)',     cost_aoa: 15000  },
  { plan_type: 'quarterly',  label: 'Trimestral (90 Dias)', cost_aoa: 40000  },
  { plan_type: 'semiannual', label: 'Semestral (180 Dias)', cost_aoa: 70000  },
  { plan_type: 'annual',     label: 'Anual (365 Dias)',     cost_aoa: 120000 },
  { plan_type: 'lifetime',   label: 'Vitalício',            cost_aoa: 800000 },
];

export async function savePartnerPricing(plans: PartnerPricingPlan[]): Promise<void> {
  const promises = plans.map((p) =>
    setDoc(doc(db, 'partner_pricing', p.plan_type), {
      plan_type: p.plan_type,
      label: p.label,
      cost_aoa: p.cost_aoa,
      updated_at: Date.now(),
    }, { merge: true })
  );
  await Promise.all(promises);
}

export async function getPartnerPricing(): Promise<PartnerPricingPlan[]> {
  try {
    const snap = await getDocs(collection(db, 'partner_pricing'));
    if (snap.empty) return DEFAULT_PARTNER_PRICING;
    const plans: PartnerPricingPlan[] = [];
    snap.forEach((d) => {
      const data = d.data();
      plans.push({ plan_type: data.plan_type as PlanType, label: data.label || d.id, cost_aoa: Number(data.cost_aoa) || 0 });
    });
    return plans;
  } catch {
    return DEFAULT_PARTNER_PRICING;
  }
}

export function subscribePartnerPricing(cb: (plans: PartnerPricingPlan[]) => void): () => void {
  try {
    return onSnapshot(collection(db, 'partner_pricing'), (snap) => {
      if (snap.empty) { cb(DEFAULT_PARTNER_PRICING); return; }
      const plans: PartnerPricingPlan[] = [];
      snap.forEach((d) => {
        const data = d.data();
        plans.push({ plan_type: data.plan_type as PlanType, label: data.label || d.id, cost_aoa: Number(data.cost_aoa) || 0 });
      });
      const order: PlanType[] = ['daily','weekly','biweekly','monthly','quarterly','semiannual','annual','quadrennial','lifetime'];
      plans.sort((a, b) => order.indexOf(a.plan_type) - order.indexOf(b.plan_type));
      cb(plans);
    }, () => cb(DEFAULT_PARTNER_PRICING));
  } catch {
    cb(DEFAULT_PARTNER_PRICING);
    return () => {};
  }
}

export async function recordPartnerDebt(entry: Omit<PartnerDebtEntry, 'id'>): Promise<void> {
  await addDoc(collection(db, 'partner_debts'), {
    ...entry,
    paid: entry.paid ?? false,
    paid_at: entry.paid_at ?? null,
    created_at: entry.created_at || Date.now(),
    _ts: Timestamp.fromMillis(entry.created_at || Date.now()),
  });
}

/**
 * Liquida dívidas e promove automaticamente quaisquer licenças provisórias a definitivas
 */
export async function markDebtsPaid(debtIds: string[]): Promise<void> {
  const promises = debtIds.map(async (id) => {
    const debtRef = doc(db, 'partner_debts', id);
    const snap = await getDoc(debtRef);
    if (snap.exists()) {
      const data = snap.data();
      await updateDoc(debtRef, { paid: true, paid_at: Date.now() });

      // Se a licença associada for provisória ou vitalícia pendente, promove a definitiva
      if (data.license_id) {
        await promoteProvisionalLicenseToDefinitive(
          data.license_id,
          data.provisional_target_plan || data.plan_type
        );
      }
    }
  });
  await Promise.all(promises);
}

/**
 * Retorna a quantidade de slots de crédito atualmente em uso (não pagos e não pagos por wallet)
 */
export function getActiveCreditSlots(debts: PartnerDebtEntry[]): number {
  return debts.filter((d) => !d.paid && d.payment_method !== 'wallet').length;
}

/**
 * Verifica se existem dívidas com mais de `maxDays` dias sem liquidação
 */
export function hasOverdueDebts(debts: PartnerDebtEntry[], maxDays = 15): boolean {
  const now = Date.now();
  const maxMs = maxDays * 86_400_000;
  return debts.some((d) => !d.paid && d.payment_method !== 'wallet' && (now - d.created_at) > maxMs);
}

/**
 * Retorna os dias da dívida mais antiga pendente
 */
export function getOldestUnpaidDebtDays(debts: PartnerDebtEntry[]): number {
  const unpaid = debts.filter((d) => !d.paid && d.payment_method !== 'wallet');
  if (unpaid.length === 0) return 0;
  const oldest = Math.min(...unpaid.map((d) => d.created_at));
  return Math.floor((Date.now() - oldest) / 86_400_000);
}

export function subscribePartnerDebts(partnerId: string, cb: (debts: PartnerDebtEntry[]) => void): () => void {
  try {
    const q = query(collection(db, 'partner_debts'), where('partner_id', '==', partnerId), orderBy('created_at', 'desc'));
    return onSnapshot(q, (snap) => {
      const debts: PartnerDebtEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        debts.push({
          id: d.id,
          partner_id: data.partner_id,
          partner_name: data.partner_name || '',
          license_id: data.license_id,
          company_name: data.company_name || '',
          plan_type: data.plan_type as PlanType,
          cost_aoa: Number(data.cost_aoa) || 0,
          client_price_aoa: Number(data.client_price_aoa) || 0,
          created_at: Number(data.created_at) || Date.now(),
          paid: Boolean(data.paid),
          paid_at: data.paid_at ? Number(data.paid_at) : null,
          payment_method: data.payment_method || (data.paid ? 'wallet' : 'credit'),
          is_provisional: Boolean(data.is_provisional),
          provisional_target_plan: data.provisional_target_plan as PlanType | undefined,
        });
      });
      cb(debts);
    }, () => cb([]));
  } catch { cb([]); return () => {}; }
}

export function subscribeAllDebts(cb: (debts: PartnerDebtEntry[]) => void): () => void {
  try {
    const q = query(collection(db, 'partner_debts'), orderBy('created_at', 'desc'));
    return onSnapshot(q, (snap) => {
      const debts: PartnerDebtEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        debts.push({
          id: d.id,
          partner_id: data.partner_id,
          partner_name: data.partner_name || '',
          license_id: data.license_id,
          company_name: data.company_name || '',
          plan_type: data.plan_type as PlanType,
          cost_aoa: Number(data.cost_aoa) || 0,
          client_price_aoa: Number(data.client_price_aoa) || 0,
          created_at: Number(data.created_at) || Date.now(),
          paid: Boolean(data.paid),
          paid_at: data.paid_at ? Number(data.paid_at) : null,
          payment_method: data.payment_method || (data.paid ? 'wallet' : 'credit'),
          is_provisional: Boolean(data.is_provisional),
          provisional_target_plan: data.provisional_target_plan as PlanType | undefined,
        });
      });
      cb(debts);
    }, () => cb([]));
  } catch { cb([]); return () => {}; }
}

/**
 * Escuta a conta do parceiro com Quota de Slots de Crédito, Saldo de Carteira e Categoria
 */
export function subscribePartnerAccount(
  partnerCode: string,
  cb: (account: PartnerAccount | null) => void
): () => void {
  try {
    const pRef = doc(db, 'partners', partnerCode);
    return onSnapshot(pRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const tier = (d.tier as any) || 'bronze';
        const defaultSlots = TIER_DEFAULT_SLOTS[tier as keyof typeof TIER_DEFAULT_SLOTS] || 2;
        
        cb({
          id: snap.id,
          code: d.code || partnerCode,
          name: d.name || d.responsible || 'Parceiro Kivora',
          email: d.email || '',
          phone: d.phone || '',
          region: d.region || 'Luanda',
          credit_slots_limit: Number(d.credit_slots_limit) || defaultSlots,
          credit_limit_aoa: Number(d.credit_limit_aoa) || 250000,
          wallet_balance_aoa: Number(d.wallet_balance_aoa) || 0,
          tier,
          status: d.status || 'active',
          overdue_days_limit: Number(d.overdue_days_limit) || 15,
        });
      } else {
        cb(null);
      }
    }, () => cb(null));
  } catch {
    cb(null);
    return () => {};
  }
}

/**
 * Deduz saldo da carteira do parceiro
 */
export async function deductPartnerWallet(partnerCode: string, amountAoa: number): Promise<boolean> {
  const pRef = doc(db, 'partners', partnerCode);
  const snap = await getDoc(pRef);
  if (!snap.exists()) return false;
  const currentWallet = Number(snap.data().wallet_balance_aoa) || 0;
  if (currentWallet < amountAoa) return false;

  await updateDoc(pRef, {
    wallet_balance_aoa: Math.max(0, currentWallet - amountAoa),
    updatedAt: Date.now(),
  });
  return true;
}

/**
 * Adiciona saldo (recarga de wallet) ao parceiro
 */
export async function topUpPartnerWallet(partnerCode: string, amountAoa: number): Promise<void> {
  const pRef = doc(db, 'partners', partnerCode);
  const snap = await getDoc(pRef);
  const currentWallet = snap.exists() ? (Number(snap.data().wallet_balance_aoa) || 0) : 0;

  await setDoc(pRef, {
    wallet_balance_aoa: currentWallet + amountAoa,
    updatedAt: Date.now(),
  }, { merge: true });
}

/**
 * Atualiza quotas de slots de crédito, carteira e categorias de parceiro
 */
export async function updatePartnerWalletAndCredit(
  partnerCode: string,
  updates: {
    wallet_balance_aoa?: number;
    credit_slots_limit?: number;
    credit_limit_aoa?: number;
    tier?: 'bronze' | 'silver' | 'gold' | 'diamond';
  }
): Promise<void> {
  const pRef = doc(db, 'partners', partnerCode);
  await setDoc(pRef, {
    ...updates,
    updatedAt: Date.now(),
  }, { merge: true });
}

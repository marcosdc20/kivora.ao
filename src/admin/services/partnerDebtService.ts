/**
 * partnerDebtService.ts — Kivora Site Admin
 * Gestão de dívidas de parceiros e tabela de preços de atacado (Firestore)
 */

import {
  collection, doc, setDoc, addDoc, updateDoc,
  onSnapshot, query, where, orderBy, getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { PlanType } from '../types';

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
    paid: false,
    paid_at: null,
    created_at: entry.created_at || Date.now(),
    _ts: Timestamp.fromMillis(entry.created_at || Date.now()),
  });
}

export async function markDebtsPaid(debtIds: string[]): Promise<void> {
  const promises = debtIds.map((id) =>
    updateDoc(doc(db, 'partner_debts', id), { paid: true, paid_at: Date.now() })
  );
  await Promise.all(promises);
}

export function subscribePartnerDebts(partnerId: string, cb: (debts: PartnerDebtEntry[]) => void): () => void {
  try {
    const q = query(collection(db, 'partner_debts'), where('partner_id', '==', partnerId), orderBy('created_at', 'desc'));
    return onSnapshot(q, (snap) => {
      const debts: PartnerDebtEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        debts.push({ id: d.id, partner_id: data.partner_id, partner_name: data.partner_name || '', license_id: data.license_id, company_name: data.company_name || '', plan_type: data.plan_type as PlanType, cost_aoa: Number(data.cost_aoa) || 0, client_price_aoa: Number(data.client_price_aoa) || 0, created_at: Number(data.created_at) || Date.now(), paid: Boolean(data.paid), paid_at: data.paid_at ? Number(data.paid_at) : null });
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
        debts.push({ id: d.id, partner_id: data.partner_id, partner_name: data.partner_name || '', license_id: data.license_id, company_name: data.company_name || '', plan_type: data.plan_type as PlanType, cost_aoa: Number(data.cost_aoa) || 0, client_price_aoa: Number(data.client_price_aoa) || 0, created_at: Number(data.created_at) || Date.now(), paid: Boolean(data.paid), paid_at: data.paid_at ? Number(data.paid_at) : null });
      });
      cb(debts);
    }, () => cb([]));
  } catch { cb([]); return () => {}; }
}

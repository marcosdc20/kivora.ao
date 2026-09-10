/**
 * licenseRequestService.ts — Kivora License Requests Management
 * Gestão segura de solicitações de licença emitidas por parceiros credenciados.
 * Garante que nenhuma chave seja gerada sem validação e que NUNCA haja
 * disparo automático de chaves para clientes finais por WhatsApp ou e-mail.
 */

import {
  collection, doc, setDoc, updateDoc,
  query, where, orderBy, onSnapshot, getDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PlanType } from '../types';
import { createLicense, calculateExpiresAt } from './licenseService';
import { recordPartnerDebt, deductPartnerWallet } from './partnerDebtService';
import { cleanFirestoreData } from '../../lib/firestoreUtils';

export type LicenseRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LicenseRequest {
  id: string;
  partner_id: string;
  partner_name: string;
  company_name: string;
  nif: string;
  client_email: string;
  plan_type: PlanType;
  extra_seats: number;
  price_aoa: number;
  cost_aoa: number;
  payment_method: 'wallet' | 'credit' | 'provisional';
  is_provisional?: boolean;
  provisional_target_plan?: PlanType;
  notes?: string;
  status: LicenseRequestStatus;
  license_id?: string;
  rejection_reason?: string;
  created_at: number;
  approved_at?: number;
  reviewed_by?: string;
}

/**
 * Cria uma nova solicitação de licença submetida por um parceiro
 */
export async function createLicenseRequest(params: {
  partner_id: string;
  partner_name: string;
  company_name: string;
  nif: string;
  client_email: string;
  plan_type: PlanType;
  extra_seats?: number;
  price_aoa: number;
  cost_aoa: number;
  payment_method: 'wallet' | 'credit' | 'provisional';
  is_provisional?: boolean;
  provisional_target_plan?: PlanType;
  notes?: string;
}): Promise<LicenseRequest> {
  const reqId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const now = Date.now();

  const requestData: Record<string, any> = {
    id: reqId,
    partner_id: params.partner_id.trim(),
    partner_name: params.partner_name.trim(),
    company_name: params.company_name.trim(),
    nif: params.nif.trim(),
    client_email: (params.client_email || '').trim().toLowerCase(),
    plan_type: params.plan_type,
    extra_seats: params.extra_seats || 0,
    price_aoa: params.price_aoa,
    cost_aoa: params.cost_aoa,
    payment_method: params.payment_method,
    is_provisional: params.is_provisional ?? false,
    notes: params.notes || '',
    status: 'pending',
    created_at: now,
  };

  if (params.provisional_target_plan) {
    requestData.provisional_target_plan = params.provisional_target_plan;
  }

  await setDoc(doc(db, 'license_requests', reqId), cleanFirestoreData(requestData));
  return requestData as LicenseRequest;
}

/**
 * Assina em tempo real as solicitações de um parceiro específico (Suporte a múltiplos identificadores)
 */
export function subscribePartnerLicenseRequests(
  partnerIdentifiers: string | string[],
  onUpdate: (requests: LicenseRequest[]) => void
): () => void {
  const rawList = Array.isArray(partnerIdentifiers) ? partnerIdentifiers : [partnerIdentifiers];
  const cleanList = Array.from(new Set(
    rawList
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .flatMap((s) => [s.trim(), s.trim().toUpperCase(), s.trim().toLowerCase()])
  )).slice(0, 30);

  if (cleanList.length === 0) {
    onUpdate([]);
    return () => {};
  }

  const q = cleanList.length === 1
    ? query(collection(db, 'license_requests'), where('partner_id', '==', cleanList[0]))
    : query(collection(db, 'license_requests'), where('partner_id', 'in', cleanList.slice(0, 10)));

  return onSnapshot(
    q,
    (snap) => {
      const list: LicenseRequest[] = snap.docs.map((d) => {
        const data = d.data() as LicenseRequest;
        return { ...data, id: d.id };
      });
      // Ordena pelas mais recentes
      list.sort((a, b) => b.created_at - a.created_at);
      onUpdate(list);
    },
    (err) => {
      console.warn('Erro ao escutar solicitações de licença do parceiro:', err);
    }
  );
}

/**
 * Assina em tempo real todas as solicitações de licença (Painel Admin)
 */
export function subscribeAllLicenseRequests(
  onUpdate: (requests: LicenseRequest[]) => void
): () => void {
  const q = query(collection(db, 'license_requests'), orderBy('created_at', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const list: LicenseRequest[] = snap.docs.map((d) => {
        const data = d.data() as LicenseRequest;
        return { ...data, id: d.id };
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Erro ao escutar todas as solicitações de licença:', err);
    }
  );
}

/**
 * Aprova uma solicitação de licença (Operação Exclusiva do Administrador)
 * Emite a licença oficial em /licenses e regista o débito em /partner_debts.
 * NUNCA envia email ou WhatsApp ao cliente final.
 */
export async function approveLicenseRequest(
  requestId: string,
  reviewerEmail: string
): Promise<{ success: boolean; licenseId?: string; error?: string }> {
  try {
    const reqRef = doc(db, 'license_requests', requestId);
    const snap = await getDoc(reqRef);
    if (!snap.exists()) {
      return { success: false, error: 'Solicitação de licença não encontrada.' };
    }

    const reqData = snap.data() as LicenseRequest;
    if (reqData.status === 'approved' && reqData.license_id) {
      return { success: true, licenseId: reqData.license_id };
    }

    // Calcula a data de expiração da licença oficial
    const normalExpiresAt = calculateExpiresAt(reqData.plan_type);
    const provisionalDays = 30;
    const expiresAt = reqData.is_provisional
      ? Date.now() + provisionalDays * 86_400_000
      : normalExpiresAt;

    // Emite a licença oficial em /licenses (executada com credenciais de admin)
    const lic = await createLicense({
      client_email: reqData.client_email,
      company_name: reqData.company_name,
      nif: reqData.nif,
      plan_type: reqData.plan_type,
      expires_at: expiresAt,
      price_aoa: reqData.price_aoa,
      notes: reqData.notes || `Aprovada via solicitação ${requestId} pelo administrador (${reviewerEmail}).`,
      partner_id: reqData.partner_id,
      extra_seats: reqData.extra_seats,
      is_provisional: reqData.is_provisional,
      provisional_target_plan: reqData.provisional_target_plan,
    });

    const isPaid = reqData.payment_method === 'wallet';
    if (isPaid) {
      await deductPartnerWallet(reqData.partner_id, reqData.cost_aoa);
    }

    // Regista o débito do parceiro
    await recordPartnerDebt({
      partner_id: reqData.partner_id,
      partner_name: reqData.partner_name,
      license_id: lic.id,
      company_name: reqData.company_name,
      plan_type: reqData.plan_type,
      cost_aoa: reqData.cost_aoa,
      client_price_aoa: reqData.price_aoa,
      created_at: Date.now(),
      paid: isPaid,
      paid_at: isPaid ? Date.now() : null,
      payment_method: reqData.payment_method,
      is_provisional: reqData.is_provisional,
      provisional_target_plan: reqData.provisional_target_plan,
    });

    // Atualiza a solicitação com status aprovado
    await updateDoc(reqRef, {
      status: 'approved',
      license_id: lic.id,
      approved_at: Date.now(),
      reviewed_by: reviewerEmail,
    });

    return { success: true, licenseId: lic.id };
  } catch (err: any) {
    console.error('Erro ao aprovar solicitação de licença:', err);
    return { success: false, error: err.message || 'Erro ao processar aprovação.' };
  }
}

/**
 * Rejeita uma solicitação de licença com justificativa (Operação Exclusiva do Administrador)
 */
export async function rejectLicenseRequest(
  requestId: string,
  reason: string,
  reviewerEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const reqRef = doc(db, 'license_requests', requestId);
    await updateDoc(reqRef, {
      status: 'rejected',
      rejection_reason: reason.trim(),
      approved_at: Date.now(),
      reviewed_by: reviewerEmail,
    });
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao rejeitar solicitação de licença:', err);
    return { success: false, error: err.message || 'Erro ao processar rejeição.' };
  }
}

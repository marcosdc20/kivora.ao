/**
 * partnerCreditService.ts — Kivora Partner Autonomous License Service
 * Emissão direta, instantânea e atómica de licenças por parceiros homologados.
 * Suporta Carteira Pré-paga (Wallet) e Linha de Crédito (Slots).
 * Política estrita: NUNCA envia e-mails ou WhatsApp aos clientes finais.
 */

import { PlanType } from '../../admin/types';
import { db } from '../../lib/firebase';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { generateLicenseKey, calculateExpiresAt } from '../../admin/services/licenseService';
import { cleanFirestoreData } from '../../lib/firestoreUtils';

export interface IssueInstantLicenseParams {
  partnerCode: string;
  partnerName: string;
  partnerDocId?: string;
  companyName: string;
  nif: string;
  clientEmail?: string;
  planType: PlanType;
  extraSeats?: number;
  priceAoa: number;
  costAoa: number;
  paymentMethod: 'wallet' | 'credit';
  isProvisional?: boolean;
}

export interface IssueInstantLicenseResponse {
  success: boolean;
  licenseId?: string;
  expiresAt?: number;
  isProvisional?: boolean;
  error?: string;
  requiresManualApproval?: boolean;
}

// Alias para compatibilidade regressiva
export type IssueInstantCreditParams = IssueInstantLicenseParams;
export type IssueInstantCreditResponse = IssueInstantLicenseResponse;

/**
 * Emite a licença de forma direta, atómica e instantânea no Firestore
 */
export async function issueInstantPartnerLicense(
  params: IssueInstantLicenseParams
): Promise<IssueInstantLicenseResponse> {
  const {
    partnerCode,
    partnerName,
    partnerDocId: providedDocId,
    companyName,
    nif,
    clientEmail,
    planType,
    extraSeats = 0,
    priceAoa,
    costAoa,
    paymentMethod,
    isProvisional = false,
  } = params;

  // 1. Pagamento via Carteira: Como o Firestore Rules proíbe mutação de wallet_balance_aoa
  // pelo cliente sem privilégios admin (Invariante 3), invoca imediatamente a API serverless segura
  // sem desperdiçar 3 segundos em tentativas no navegador fadadas a falhar por PERMISSION_DENIED.
  if (paymentMethod === 'wallet') {
    return await issueInstantCreditLicense(params);
  }

  try {
    const cleanPartnerCode = partnerCode.trim().toUpperCase();
    let partnerDocId = (providedDocId || cleanPartnerCode).trim();
    let partnerRef = doc(db, 'partners', partnerDocId);
    let partnerSnap = await getDoc(partnerRef);

    // Se não encontrou por docId direto, busca indexada por code com limit(1) (SEM varredura total)
    if (!partnerSnap.exists()) {
      const qCode = query(collection(db, 'partners'), where('code', '==', cleanPartnerCode), limit(1));
      const qSnap = await getDocs(qCode);
      if (!qSnap.empty) {
        partnerSnap = qSnap.docs[0];
        partnerDocId = partnerSnap.id;
        partnerRef = doc(db, 'partners', partnerDocId);
      }
    }

    if (!partnerSnap.exists()) {
      return {
        success: false,
        error: `Registo do parceiro ${cleanPartnerCode} não encontrado no sistema.`,
      };
    }

    const partnerData = partnerSnap.data();
    if (partnerData.status !== 'active') {
      return {
        success: false,
        error: 'Conta de parceiro suspensa ou pendente. A emissão de licenças está bloqueada.',
      };
    }

    const now = Date.now();
    const key = generateLicenseKey();

    // Expiração da licença
    const provisionalDays = 30;
    let expiresAt: number;
    if (isProvisional) {
      expiresAt = now + provisionalDays * 86_400_000;
    } else {
      const normalExpires = calculateExpiresAt(planType);
      expiresAt = normalExpires ?? (now + 36500 * 86_400_000);
    }

    const batch = writeBatch(db);

    // 1. Gravar Licença em /licenses (usando o partnerDocId validado no Firestore)
    const licenseRef = doc(db, 'licenses', key);
    const licensePayload = cleanFirestoreData({
      id: key,
      company_name: companyName.trim(),
      nif: nif.trim(),
      client_email: (clientEmail || '').trim().toLowerCase(),
      plan_type: planType,
      status: 'active',
      hardware_id: null,
      created_at: now,
      expires_at: expiresAt,
      price_aoa: priceAoa,
      notes: `Emitida a Crédito pelo Parceiro ${cleanPartnerCode}.`,
      partner_id: partnerDocId,
      activated_at: null,
      extra_seats: extraSeats,
      is_provisional: Boolean(isProvisional),
      max_users: 1 + extraSeats,
      _created_at_ts: Timestamp.fromMillis(now),
      _expires_at_ts: expiresAt ? Timestamp.fromMillis(expiresAt) : null,
    });
    batch.set(licenseRef, licensePayload);

    // 2. Extrato / Débito em /partner_debts
    const debtId = `DEBT-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const debtRef = doc(db, 'partner_debts', debtId);
    const debtPayload = cleanFirestoreData({
      id: debtId,
      partner_id: partnerDocId,
      partner_name: partnerName || partnerData.name || cleanPartnerCode,
      license_id: key,
      company_name: companyName.trim(),
      plan_type: planType,
      cost_aoa: costAoa,
      client_price_aoa: priceAoa,
      created_at: now,
      paid: false,
      paid_at: null,
      payment_method: 'credit',
      is_provisional: Boolean(isProvisional),
    });
    batch.set(debtRef, debtPayload);

    // 3. Registar / Atualizar Empresa Cliente em /companies no MESMO batch atómico único
    const cleanNif = nif.trim().toUpperCase();
    const companyRef = doc(db, 'companies', cleanNif);
    batch.set(companyRef, cleanFirestoreData({
      id: cleanNif,
      name: companyName.trim(),
      nif: cleanNif,
      email: (clientEmail || '').trim().toLowerCase(),
      phone: '',
      address: `Parceiro: ${partnerDocId}`,
      partner_id: partnerDocId,
      status: 'active',
      createdAt: now,
      updated_at: now,
    }), { merge: true });

    // Commit 100% atómico: 1 único round-trip (< 350ms)
    await batch.commit();

    return {
      success: true,
      licenseId: key,
      expiresAt,
      isProvisional: Boolean(isProvisional),
    };
  } catch (err: any) {
    console.error('Erro na emissão direta no Firestore, a tentar fallback pela API:', err);

    // Se falhar o batch direto, tenta o endpoint serverless como fallback resiliente
    try {
      return await issueInstantCreditLicense({
        ...params,
        partnerDocId: params.partnerDocId || params.partnerCode,
      });
    } catch (fallbackErr: any) {
      return {
        success: false,
        error: 'Erro ao emitir licença: ' + (err.message || fallbackErr.message || 'Erro desconhecido'),
      };
    }
  }
}

/**
 * Invoca o endpoint seguro da API Serverless para emissão autónoma de licença
 */
export async function issueInstantCreditLicense(
  params: IssueInstantLicenseParams
): Promise<IssueInstantLicenseResponse> {
  try {
    const res = await fetch('/api/partner/issue-credit-license', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 403 && data.requiresManualApproval) {
        return {
          success: false,
          requiresManualApproval: true,
          error: data.error || 'Este parceiro requer aprovação manual do Administrador.',
        };
      }
      return {
        success: false,
        error: data.error || `Erro do servidor (${res.status}).`,
      };
    }

    if (!data.success || !data.licenseId) {
      return {
        success: false,
        error: data.error || 'A API não retornou uma chave de licença válida.',
      };
    }

    return {
      success: true,
      licenseId: data.licenseId,
      expiresAt: data.expiresAt,
      isProvisional: data.isProvisional,
    };
  } catch (err: any) {
    console.error('Erro ao conectar com API de emissão instantânea:', err);
    return {
      success: false,
      error: 'Não foi possível conectar ao servidor de emissão instantânea: ' + (err.message || 'Erro de rede'),
    };
  }
}

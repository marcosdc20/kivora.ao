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
  writeBatch,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { generateLicenseKey, calculateExpiresAt } from '../../admin/services/licenseService';
import { cleanFirestoreData } from '../../lib/firestoreUtils';

export interface IssueInstantLicenseParams {
  partnerCode: string;
  partnerName: string;
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

  try {
    const cleanPartnerCode = partnerCode.trim().toUpperCase();
    const partnerRef = doc(db, 'partners', cleanPartnerCode);
    const partnerSnap = await getDoc(partnerRef);

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

    // Validação de saldo se for Carteira
    if (paymentMethod === 'wallet') {
      const currentWallet = Number(partnerData.wallet_balance_aoa) || 0;
      if (currentWallet < costAoa) {
        return {
          success: false,
          error: `Saldo insuficiente na Carteira (${currentWallet.toLocaleString('pt-AO')} Kz). O custo é de ${costAoa.toLocaleString('pt-AO')} Kz.`,
        };
      }
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

    // 1. Gravar Licença em /licenses
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
      notes: paymentMethod === 'wallet'
        ? `Emitida via Carteira Virtual pelo Parceiro ${cleanPartnerCode}.`
        : `Emitida a Crédito pelo Parceiro ${cleanPartnerCode}.`,
      partner_id: cleanPartnerCode,
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
    const isPaid = paymentMethod === 'wallet';
    const debtPayload = cleanFirestoreData({
      id: debtId,
      partner_id: cleanPartnerCode,
      partner_name: partnerName || partnerData.name || cleanPartnerCode,
      license_id: key,
      company_name: companyName.trim(),
      plan_type: planType,
      cost_aoa: costAoa,
      client_price_aoa: priceAoa,
      created_at: now,
      paid: isPaid,
      paid_at: isPaid ? now : null,
      payment_method: paymentMethod,
      is_provisional: Boolean(isProvisional),
    });
    batch.set(debtRef, debtPayload);

    // 3. Debitar Carteira se for pagamento por Wallet
    if (paymentMethod === 'wallet') {
      batch.update(partnerRef, {
        wallet_balance_aoa: increment(-costAoa),
        updatedAt: now,
      });
    }

    // 4. Registar / Atualizar Empresa Cliente em /companies
    const cleanNif = nif.trim().toUpperCase();
    const companyRef = doc(db, 'companies', cleanNif);
    const companyPayload = cleanFirestoreData({
      id: cleanNif,
      name: companyName.trim(),
      nif: cleanNif,
      email: (clientEmail || '').trim().toLowerCase(),
      phone: '',
      address: `Parceiro: ${cleanPartnerCode}`,
      partner_id: cleanPartnerCode,
      status: 'active',
      createdAt: now,
      _created_at_ts: Timestamp.fromMillis(now),
    });
    batch.set(companyRef, companyPayload, { merge: true });

    // Commit atómico
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
      return await issueInstantCreditLicense(params);
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

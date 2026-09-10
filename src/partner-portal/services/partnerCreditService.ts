/**
 * partnerCreditService.ts — Kivora Partner Credit License Client Service
 * Comunica com a API Serverless para emissão instantânea e segura de licenças a crédito.
 * Política estrita: NUNCA envia e-mails ou WhatsApp aos clientes finais.
 */

import { PlanType } from '../../admin/types';

export interface IssueInstantCreditParams {
  partnerCode: string;
  partnerName: string;
  companyName: string;
  nif: string;
  clientEmail?: string;
  planType: PlanType;
  extraSeats?: number;
  priceAoa: number;
  costAoa: number;
  isProvisional?: boolean;
}

export interface IssueInstantCreditResponse {
  success: boolean;
  licenseId?: string;
  expiresAt?: number;
  isProvisional?: boolean;
  error?: string;
  requiresManualApproval?: boolean;
}

/**
 * Invoca o endpoint seguro da API Serverless para emissão autónoma de licença a crédito
 */
export async function issueInstantCreditLicense(
  params: IssueInstantCreditParams
): Promise<IssueInstantCreditResponse> {
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

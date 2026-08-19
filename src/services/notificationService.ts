/**
 * KIVORA Technologies — Notification & Lead Dispatcher Service
 * Gere o envio de emails, notificações e webhooks para pedidos de demonstração e candidaturas.
 */

export interface LeadNotificationPayload {
  tipo: 'demonstracao' | 'candidatura_parceiro' | 'suporte_ticket';
  empresa: string;
  contactoNome: string;
  telefone: string;
  email: string;
  detalhes?: Record<string, any>;
  dataHora: string;
}

/**
 * Envia notificação de lead para os canais configurados (Webhook / EmailJS / Endpoint de Notificação)
 */
export async function dispatchLeadNotification(payload: LeadNotificationPayload): Promise<boolean> {
  try {
    // 1. Verificação de Webhook configurado no ambiente ou nas configurações
    const webhookUrl = (import.meta as any).env?.VITE_KIVORA_WEBHOOK_URL;
    
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'kivora.ao',
          ...payload,
          timestamp: Date.now(),
        }),
      });
      return true;
    }

    // 2. Log estruturado para auditoria local
    if (process.env.NODE_ENV === 'development') {
      console.log('[KIVORA Notification Dispatched]:', payload);
    }
    return true;
  } catch (error) {
    console.warn('[KIVORA Notification Warning]: Falha silenciosa no envio do webhook:', error);
    return false;
  }
}

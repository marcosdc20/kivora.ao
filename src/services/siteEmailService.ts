import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  generateClientCredentialsTemplate,
  generateLicenseDeliveryTemplate,
  generatePartnerNotificationTemplate,
  generatePartnerCredentialsTemplate,
  generateWebPasswordResetTemplate,
  generateBroadcastTemplate,
  generateSiteTestEmailTemplate,
  generateDemoLeadCustomerTemplate,
  generateDemoLeadAdminAlertTemplate,
  generatePartnerApplicationCandidateTemplate,
  generateSupportTicketCustomerTemplate
} from './emailTemplatesSite';

export interface SiteEmailConfig {
  provider: 'gmail' | 'resend' | 'sendgrid' | 'smtp';
  apiKey?: string;
  senderEmail: string;
  senderName: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  isActive: boolean;
  lastUpdated?: string;
}

export const ADMIN_ALERT_EMAIL = 'kivora.angola@gmail.com';

export const DEFAULT_SITE_EMAIL_CONFIG: SiteEmailConfig = {
  provider: 'gmail',
  apiKey: 'bvsn njzk cjog ovhf',
  senderEmail: 'kivora.angola@gmail.com',
  senderName: 'KIVORA Cloud ERP',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpUser: 'kivora.angola@gmail.com',
  smtpPass: 'bvsn njzk cjog ovhf',
  isActive: true,
};

const CONFIG_DOC_PATH = ['settings', 'email_config'] as const;

/**
 * Obtém a configuração atual de e-mail do Firestore (com fallback para localStorage)
 */
export const getSiteEmailConfig = async (): Promise<SiteEmailConfig> => {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SiteEmailConfig;
    }
  } catch (e) {
    console.warn('Erro ao carregar email_config do Firestore, buscando fallback local:', e);
  }

  const local = localStorage.getItem('kivora_site_email_config');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }

  return DEFAULT_SITE_EMAIL_CONFIG;
};

/**
 * Escuta em tempo real alterações na configuração de e-mail no Firestore
 */
export const subscribeSiteEmailConfig = (callback: (cfg: SiteEmailConfig) => void) => {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const cfg = snap.data() as SiteEmailConfig;
        localStorage.setItem('kivora_site_email_config', JSON.stringify(cfg));
        callback(cfg);
      } else {
        callback(DEFAULT_SITE_EMAIL_CONFIG);
      }
    }, (err) => {
      console.warn('Erro snapshot email_config:', err);
      callback(DEFAULT_SITE_EMAIL_CONFIG);
    });
  } catch {
    callback(DEFAULT_SITE_EMAIL_CONFIG);
    return () => {};
  }
};

/**
 * Grava a configuração de e-mail no Firestore e localmente
 */
export const saveSiteEmailConfig = async (config: SiteEmailConfig): Promise<boolean> => {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
    const payload = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    localStorage.setItem('kivora_site_email_config', JSON.stringify(payload));
    return true;
  } catch (e: any) {
    console.error('Erro ao salvar email_config:', e);
    // Fallback local se Firestore falhar
    localStorage.setItem('kivora_site_email_config', JSON.stringify(config));
    return true;
  }
};

/**
 * Envia um e-mail através do provedor configurado (Gmail Oficial, Resend, SendGrid ou SMTP)
 */
export const sendSiteEmail = async (options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  configOverride?: SiteEmailConfig;
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const cfg = options.configOverride || await getSiteEmailConfig();

  const appPassword = cfg.apiKey || cfg.smtpPass;
  if (!appPassword && cfg.provider !== 'resend' && cfg.provider !== 'sendgrid') {
    return { success: false, error: 'Palavra-passe de aplicação ou credencial de e-mail não configurada no Painel Admin.' };
  }

  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const senderEmail = cfg.senderEmail || 'kivora.angola@gmail.com';
  const fromAddress = `"${cfg.senderName || 'KIVORA ERP'}" <${senderEmail}>`;

  // 1. Tentar o endpoint de envio seguro (/api/send-email)
  try {
    const serverlessRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: cfg.provider,
        apiKey: cfg.apiKey || cfg.smtpPass,
        senderEmail,
        from: fromAddress,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        smtpHost: cfg.smtpHost || (cfg.provider === 'gmail' ? 'smtp.gmail.com' : undefined),
        smtpPort: cfg.smtpPort || (cfg.provider === 'gmail' ? 465 : 587),
        smtpUser: cfg.smtpUser || senderEmail,
        smtpPass: cfg.smtpPass || cfg.apiKey,
      }),
    });

    const data = await serverlessRes.json().catch(() => ({}));
    if (serverlessRes.ok && (data.success || data.messageId)) {
      return { success: true, messageId: data.messageId || 'sent' };
    }
    if (serverlessRes.status !== 404 && data.error) {
      return { success: false, error: data.error };
    }
  } catch (err: any) {
    console.warn('Endpoint /api/send-email indisponível, tentando fallback:', err);
  }

  // 2. Fallback direto via fetch (para ambientes sem /api/send-email)
  if (cfg.provider === 'resend') {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.apiKey?.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: recipients,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          success: false,
          error: data.message || `Erro no envio via Resend API (HTTP ${res.status})`
        };
      }
      return { success: true, messageId: data.id };
    } catch (err: any) {
      return { 
        success: false, 
        error: err?.message === 'Failed to fetch' 
          ? 'Erro de CORS no navegador: O envio de e-mail precisa passar pelo servidor proxy /api/send-email.' 
          : (err?.message || 'Falha de comunicação com o servidor de e-mail Resend.') 
      };
    }
  }

  if (cfg.provider === 'sendgrid') {
    try {
      const payload = {
        personalizations: [{ to: recipients.map(e => ({ email: e })) }],
        from: { email: cfg.senderEmail, name: cfg.senderName || 'KIVORA ERP' },
        subject: options.subject,
        content: [{ type: 'text/html', value: options.html }],
      };

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.apiKey?.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data?.errors?.[0]?.message || `Erro no envio via SendGrid (HTTP ${res.status})`
        };
      }
      return { success: true, messageId: `sg-${Date.now()}` };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha de comunicação com a SendGrid.' };
    }
  }

  return { success: false, error: 'Provedor de e-mail não suportado no modo web.' };
};

/**
 * 1. Enviar Credenciais de Acesso & Licença para Novo Cliente / Empresa
 */
export const sendClientWelcomeEmail = async (params: {
  companyName: string;
  nif: string;
  adminName: string;
  email: string;
  tempPassword?: string;
  licenseKey: string;
  planName: string;
}): Promise<{ success: boolean; error?: string }> => {
  const html = generateClientCredentialsTemplate(params);
  return sendSiteEmail({
    to: params.email,
    subject: `Credenciais de Acesso ao KIVORA ERP — ${params.companyName}`,
    html,
  });
};

/**
 * 2. Enviar Licença Emitida ou Renovada ao Cliente
 */
export const sendLicenseToClientEmail = async (params: {
  clientEmail: string;
  companyName: string;
  nif: string;
  licenseKey: string;
  planName: string;
  validUntil: string;
  seatsCount: number;
  partnerName?: string;
}): Promise<{ success: boolean; error?: string }> => {
  const html = generateLicenseDeliveryTemplate(params);
  return sendSiteEmail({
    to: params.clientEmail,
    subject: `Emissão de Licença Oficial KIVORA ERP — ${params.companyName}`,
    html,
  });
};

/**
 * 3. Enviar Notificação a um Parceiro Certificado
 */
export const sendPartnerNotificationEmail = async (params: {
  partnerEmail: string;
  partnerName: string;
  notificationType: 'new_client' | 'commission_credited' | 'license_expiring' | 'payout_processed';
  title: string;
  description: string;
  clientName?: string;
  amount?: string;
}): Promise<{ success: boolean; error?: string }> => {
  const html = generatePartnerNotificationTemplate(params);
  return sendSiteEmail({
    to: params.partnerEmail,
    subject: `[Parceiro KIVORA] ${params.title}`,
    html,
  });
};

/**
 * 3.1 Enviar Credenciais de Acesso ao Portal do Parceiro
 */
export const sendPartnerCredentialsEmail = async (params: {
  partnerEmail: string;
  partnerName: string;
  partnerCode: string;
  password?: string;
}): Promise<{ success: boolean; error?: string }> => {
  const html = generatePartnerCredentialsTemplate({
    partnerName: params.partnerName,
    partnerCode: params.partnerCode,
    email: params.partnerEmail,
    password: params.password,
  });
  return sendSiteEmail({
    to: params.partnerEmail,
    subject: `Credenciais de Acesso ao Portal do Parceiro — ${params.partnerName}`,
    html,
  });
};

/**
 * 4. Enviar E-mail de Recuperação de Senha do Portal Web
 */
export const sendPasswordResetEmail = async (params: {
  email: string;
  userName: string;
  resetLink: string;
  expirationMinutes?: number;
}): Promise<{ success: boolean; error?: string }> => {
  const html = generateWebPasswordResetTemplate({
    userName: params.userName,
    resetLink: params.resetLink,
    expirationMinutes: params.expirationMinutes || 30,
  });
  return sendSiteEmail({
    to: params.email,
    subject: 'Recuperação de Palavra-passe — Portal KIVORA',
    html,
  });
};

/**
 * 5. Enviar Comunicado Oficial em Massa
 */
export const sendBroadcastEmail = async (params: {
  recipients: string[];
  title: string;
  body: string;
  senderTitle?: string;
}): Promise<{ success: boolean; error?: string }> => {
  const html = generateBroadcastTemplate({
    title: params.title,
    body: params.body,
    senderTitle: params.senderTitle,
  });
  return sendSiteEmail({
    to: params.recipients,
    subject: `[KIVORA] ${params.title}`,
    html,
  });
};

/**
 * 6. Enviar E-mail de Teste Imediato a partir do Painel de Admin
 */
export const testSiteEmailConnection = async (
  targetEmail: string,
  configOverride?: SiteEmailConfig
): Promise<{ success: boolean; error?: string }> => {
  const cfg = configOverride || await getSiteEmailConfig();
  const providerLabel = cfg.provider === 'gmail' 
    ? 'Google Gmail Oficial (kivora.angola@gmail.com)' 
    : cfg.provider === 'resend' 
      ? 'Resend API' 
      : cfg.provider === 'sendgrid' 
        ? 'SendGrid API' 
        : 'Servidor SMTP';
  const html = generateSiteTestEmailTemplate(providerLabel);

  return sendSiteEmail({
    to: targetEmail,
    subject: 'Teste de Comunicação do Servidor de E-mails — KIVORA Cloud ERP',
    html,
    configOverride,
  });
};

/**
 * 7. Enviar E-mails de Lead de Demonstração (Confirmação ao Cliente + Alerta à Equipa KIVORA)
 */
export const sendDemoLeadEmails = async (data: {
  contactName: string;
  companyName: string;
  nif?: string;
  phone: string;
  email: string;
  businessSector: string;
  storesCount: string;
  interestedModule: string;
  installationMode: string;
  notes?: string;
}): Promise<void> => {
  try {
    // 1. Enviar confirmação ao cliente (se forneceu e-mail válido)
    if (data.email && data.email.includes('@')) {
      const customerHtml = generateDemoLeadCustomerTemplate(data);
      sendSiteEmail({
        to: data.email.trim(),
        subject: `Confirmação de Solicitação de Demonstração — ${data.companyName}`,
        html: customerHtml,
      }).catch((e) => console.warn('Aviso no envio de e-mail ao cliente lead:', e));
    }

    // 2. Enviar alerta à equipa comercial KIVORA
    const adminHtml = generateDemoLeadAdminAlertTemplate(data);
    sendSiteEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `[Demonstração] ${data.companyName} (${data.contactName})`,
      html: adminHtml,
    }).catch((e) => console.warn('Aviso no envio de alerta de lead:', e));
  } catch (err) {
    console.warn('Erro ao disparar e-mails de demonstração:', err);
  }
};

/**
 * 8. Enviar E-mails de Candidatura de Parceiro (Confirmação ao Candidato + Alerta à Direção de Canais)
 */
export const sendPartnerApplicationEmails = async (data: {
  nome: string;
  empresa: string;
  nif: string;
  email: string;
  telefone: string;
  protocol: string;
  provincia: string;
  tipoParceria: string;
}): Promise<void> => {
  try {
    // 1. Enviar confirmação ao candidato
    if (data.email && data.email.includes('@')) {
      const candHtml = generatePartnerApplicationCandidateTemplate({
        nome: data.nome,
        empresa: data.empresa,
        protocol: data.protocol,
        provincia: data.provincia,
      });
      sendSiteEmail({
        to: data.email.trim(),
        subject: `Candidatura a Parceiro KIVORA — Protocolo ${data.protocol}`,
        html: candHtml,
      }).catch((e) => console.warn('Aviso no envio de e-mail de candidatura:', e));
    }

    // 2. Enviar alerta à equipa de parceiros KIVORA
    sendSiteEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `[Candidatura Parceiro] ${data.protocol} — ${data.empresa} (${data.provincia})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; padding: 20px;">
          <h2 style="color: #0f172a; margin-top: 0;">Nova Candidatura a Parceiro KIVORA</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 160px;">Protocolo:</td><td><strong>${data.protocol}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Responsável:</td><td>${data.nome}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Empresa:</td><td><strong>${data.empresa}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">NIF:</td><td>${data.nif}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Província:</td><td>${data.provincia}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Telefone:</td><td><a href="https://wa.me/${data.telefone.replace(/[^0-9]/g, '')}">${data.telefone}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">E-mail:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Tipo de Parceria:</td><td>${data.tipoParceria}</td></tr>
          </table>
        </div>
      `,
    }).catch((e) => console.warn('Aviso no alerta de parceiro:', e));
  } catch (err) {
    console.warn('Erro ao disparar e-mails de parceiro:', err);
  }
};

/**
 * 9. Enviar E-mails de Ticket de Suporte (Confirmação ao Cliente + Alerta ao Suporte)
 */
export const sendSupportTicketEmails = async (data: {
  nome: string;
  email?: string;
  telefone: string;
  ticketNumber: string;
  assunto: string;
  departamento: string;
  mensagem: string;
}): Promise<void> => {
  try {
    if (data.email && data.email.includes('@')) {
      const custHtml = generateSupportTicketCustomerTemplate(data);
      sendSiteEmail({
        to: data.email.trim(),
        subject: `Suporte KIVORA — Chamado #${data.ticketNumber}`,
        html: custHtml,
      }).catch((e) => console.warn('Aviso no envio de confirmação de ticket:', e));
    }

    sendSiteEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `[Suporte #${data.ticketNumber}] ${data.assunto} — ${data.nome}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; padding: 20px;">
          <h2 style="color: #0f172a; margin-top: 0;">Novo Chamado de Suporte Registado</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 160px;">Protocolo:</td><td><strong>${data.ticketNumber}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Cliente / Empresa:</td><td>${data.nome}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Contacto:</td><td>${data.telefone} | ${data.email || 'N/D'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Departamento:</td><td>${data.departamento.toUpperCase()}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Assunto:</td><td>${data.assunto}</td></tr>
          </table>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-top: 14px; color: #334155;">
            <strong style="color: #0f172a;">Descrição do Chamado:</strong><br>${data.mensagem.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    }).catch((e) => console.warn('Aviso no alerta de ticket:', e));
  } catch (err) {
    console.warn('Erro ao disparar e-mails de suporte:', err);
  }
};



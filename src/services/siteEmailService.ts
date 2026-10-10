import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getCachedSystemSettings } from './systemSettingsService';
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
  generatePartnerApplicationAdminAlertTemplate,
  generateSupportTicketCustomerTemplate,
  generateSupportTicketAdminAlertTemplate
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
  apiKey: (import.meta.env.VITE_SMTP_PASS as string) || '',
  senderEmail: 'kivora.angola@gmail.com',
  senderName: 'KIVORA SOFT',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpUser: 'kivora.angola@gmail.com',
  smtpPass: (import.meta.env.VITE_SMTP_PASS as string) || '',
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
  replyTo?: string;
  configOverride?: SiteEmailConfig;
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const cfg = options.configOverride || await getSiteEmailConfig();

  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const senderEmail = cfg.senderEmail || 'kivora.angola@gmail.com';
  const fromAddress = `"${cfg.senderName || 'KIVORA SOFT'}" <${senderEmail}>`;

  // 1. Tentar o endpoint de envio seguro (/api/send-email)
  // O endpoint /api/send-email resolve as credenciais no servidor caso o cliente não tenha acesso direto
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
        senderName: cfg.senderName || 'KIVORA SOFT',
        from: fromAddress,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
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

  // 2. Fallback direto via fetch (para provedores REST em ambientes sem /api/send-email)
  const appPassword = cfg.apiKey || cfg.smtpPass;
  if (!appPassword && cfg.provider !== 'resend' && cfg.provider !== 'sendgrid') {
    return { success: false, error: 'Falha no endpoint /api/send-email e credenciais locais não disponíveis.' };
  }

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
        from: { email: cfg.senderEmail, name: cfg.senderName || 'KIVORA SOFT' },
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
  const text = `Prezado(a) ${params.adminName},\n\nA sua conta no ecossistema KIVORA SOFT para a empresa ${params.companyName} (NIF: ${params.nif}) foi ativada com sucesso.\n\nPlano: ${params.planName}\nChave de Licença: ${params.licenseKey}\nE-mail de Acesso: ${params.email}${params.tempPassword ? `\nPalavra-passe Provisória: ${params.tempPassword}` : ''}\n\nPara aceder ao portal e descarregar o software, visite: https://kivora.visualsoftware.dev/login\n\nRecomendamos alterar a sua palavra-passe no primeiro acesso.\n\nKIVORA SOFT • Visual Software, Lda.`;

  return sendSiteEmail({
    to: params.email,
    subject: `Credenciais de Acesso ao KIVORA SOFT — ${params.companyName}`,
    html,
    text,
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
  const text = `Prezada equipa da ${params.companyName},\n\nA sua licença oficial do KIVORA SOFT está pronta para ativação.\n\nEmpresa: ${params.companyName}\nNIF: ${params.nif}\nPlano: ${params.planName}\nChave de Ativação: ${params.licenseKey}\nValidade: ${params.validUntil}\nPostos / Terminais: ${params.seatsCount}${params.partnerName ? `\nParceiro Certificado: ${params.partnerName}` : ''}\n\nPara ativar no software, abra o KIVORA SOFT Desktop, aceda a Menu > Configurações > Ativação de Licença e insira a chave acima.\n\nKIVORA SOFT • Suporte e Licenciamento`;

  return sendSiteEmail({
    to: params.clientEmail,
    subject: `Emissão de Licença Oficial KIVORA SOFT — ${params.companyName}`,
    html,
    text,
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
  const text = `Olá, Parceiro(a) ${params.partnerName}!\n\n${params.title}\n\n${params.description}${params.clientName ? `\nCliente Associado: ${params.clientName}` : ''}${params.amount ? `\nValor: ${params.amount}` : ''}\n\nAceda ao Portal do Parceiro para conferir os detalhes: https://kivora.visualsoftware.dev/area-parceiro\n\nKIVORA SOFT • Direção de Canais`;

  return sendSiteEmail({
    to: params.partnerEmail,
    subject: `[Parceiro KIVORA] ${params.title}`,
    html,
    text,
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
  const text = `Prezado(a) ${params.partnerName},\n\nA sua conta no Portal Oficial de Parceiros KIVORA SOFT foi ativada com sucesso.\n\nCódigo de Parceiro: ${params.partnerCode}\nE-mail de Acesso: ${params.partnerEmail}${params.password ? `\nPalavra-passe Provisória: ${params.password}` : ''}\nLink do Portal: https://kivora.visualsoftware.dev/area-parceiro\n\nPor favor, altere a sua palavra-passe no primeiro acesso no menu de perfil.\n\nKIVORA SOFT • Programa Oficial de Parcerias`;

  return sendSiteEmail({
    to: params.partnerEmail,
    subject: `Credenciais de Acesso ao Portal do Parceiro — ${params.partnerName}`,
    html,
    text,
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
  const text = `Prezado(a) ${params.userName},\n\nRecebemos um pedido de redefinição de palavra-passe para a sua conta no Portal KIVORA.\n\nPara redefinir a sua palavra-passe com segurança, utilize o seguinte link:\n${params.resetLink}\n\nEste link é válido por ${params.expirationMinutes || 30} minutos.\nSe não solicitou esta alteração, ignore este e-mail.\n\nKIVORA SOFT • Segurança de Contas`;

  return sendSiteEmail({
    to: params.email,
    subject: 'Recuperação de Palavra-passe — Portal KIVORA',
    html,
    text,
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
  const text = `Comunicado Oficial KIVORA SOFT\n\n${params.title}\n\n${params.body}\n\n${params.senderTitle || 'Direção Executiva • KIVORA SOFT'}`;

  return sendSiteEmail({
    to: params.recipients,
    subject: `[KIVORA] ${params.title}`,
    html,
    text,
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
  const text = `Teste de Comunicação do Servidor de E-mails — KIVORA SOFT\n\nEste é um e-mail de teste disparado com sucesso através do canal: ${providerLabel}.\nSe recebeu esta mensagem, o seu serviço de e-mails está operacional e pronto para emissão.\n\nKIVORA SOFT • Visual Software, Lda.`;

  return sendSiteEmail({
    to: targetEmail,
    subject: 'Teste de Comunicação do Servidor de E-mails — KIVORA SOFT',
    html,
    text,
    configOverride,
  });
};

function isSettledSuccess(res?: PromiseSettledResult<{ success: boolean }>): boolean {
  return !!res && res.status === 'fulfilled' && !!res.value?.success;
}

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
}): Promise<{ customerSent: boolean; adminSent: boolean }> => {
  const promises: Promise<{ success: boolean }>[] = [];

  // 1. Enviar confirmação ao cliente (se forneceu e-mail válido)
  if (data.email && data.email.includes('@')) {
    const customerHtml = generateDemoLeadCustomerTemplate(data);
    const customerText = `Prezado(a) ${data.contactName},\n\nConfirmamos a receção do seu pedido de demonstração para a entidade ${data.companyName}.\nUm consultor especialista da nossa equipa comercial entrará em contacto através do número ${data.phone} para apresentar o software KIVORA SOFT.\n\nMódulo Solicitado: ${data.interestedModule}\nModalidade: ${data.installationMode}\n\nKIVORA SOFT • Visual Software, Lda.`;

    promises.push(
      sendSiteEmail({
        to: data.email.trim(),
        subject: `Confirmação de Solicitação de Demonstração — ${data.companyName}`,
        html: customerHtml,
        text: customerText,
      })
    );
  }

  // 2. Enviar alerta à equipa comercial KIVORA (Admin principal + e-mails configurados)
  const adminHtml = generateDemoLeadAdminAlertTemplate(data);
  const adminText = `Nova Solicitação de Demonstração Recebida via Website:\n\nEmpresa: ${data.companyName}\nResponsável: ${data.contactName}\nTelefone/WhatsApp: ${data.phone}\nE-mail: ${data.email}\n${data.nif ? `NIF: ${data.nif}\n` : ''}Setor: ${data.businessSector}\nTerminais: ${data.storesCount}\nMódulo: ${data.interestedModule}\nInstalação: ${data.installationMode}${data.notes ? `\nObservações: ${data.notes}` : ''}`;

  const settings = getCachedSystemSettings();
  const configuredLeadEmails = (settings.notifyEmailLeads || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.includes('@'));

  const leadAdminRecipients = Array.from(new Set([
    'narcisomarcos826@gmail.com',
    ADMIN_ALERT_EMAIL,
    ...configuredLeadEmails,
  ]));

  for (const adminTo of leadAdminRecipients) {
    promises.push(
      sendSiteEmail({
        to: adminTo,
        subject: `[Demonstração] ${data.companyName} (${data.contactName})`,
        html: adminHtml,
        text: adminText,
        replyTo: data.email,
      })
    );
  }

  const results = await Promise.allSettled(promises);
  const customerSent = isSettledSuccess(results[0]);
  const adminSent = results.slice(1).some(isSettledSuccess);

  return { customerSent, adminSent };
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
}): Promise<{ candidateSent: boolean; adminSent: boolean }> => {
  const promises: Promise<{ success: boolean }>[] = [];

  // 1. Enviar confirmação ao candidato
  if (data.email && data.email.includes('@')) {
    const candHtml = generatePartnerApplicationCandidateTemplate({
      nome: data.nome,
      empresa: data.empresa,
      protocol: data.protocol,
      provincia: data.provincia,
    });
    const candText = `Prezado(a) ${data.nome},\n\nAgradecemos a submissão da proposta de parceria para a sua entidade ${data.empresa} perante o programa de canais do KIVORA SOFT.\n\nProtocolo de Candidatura Registado: ${data.protocol}\nEntidade: ${data.empresa} (${data.nome})\nProvíncia: ${data.provincia}\nEstado Atual: Em Análise Técnica\n\nA nossa Direção de Canais analisará a documentação e comunicará o parecer no prazo de 24 a 48 horas úteis.\n\nKIVORA SOFT • Visual Software, Lda.`;

    promises.push(
      sendSiteEmail({
        to: data.email.trim(),
        subject: `Candidatura a Parceiro KIVORA — Protocolo ${data.protocol}`,
        html: candHtml,
        text: candText,
        replyTo: 'parceiros@kivora.ao',
      })
    );
  }

  // 2. Enviar alerta à direção / equipa de parceiros KIVORA (Admin principal + configurados)
  const adminHtml = generatePartnerApplicationAdminAlertTemplate(data);
  const adminText = `Nova Candidatura a Parceiro KIVORA Registada:\n\nProtocolo: ${data.protocol}\nResponsável: ${data.nome}\nEmpresa: ${data.empresa}\nNIF: ${data.nif}\nProvíncia: ${data.provincia}\nTelefone: ${data.telefone}\nE-mail: ${data.email}\nTipo de Parceria: ${data.tipoParceria}`;

  const settings = getCachedSystemSettings();
  const configuredPartnerEmails = (settings.notifyEmailPartners || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.includes('@'));

  const partnerAdminRecipients = Array.from(new Set([
    'narcisomarcos826@gmail.com',
    ADMIN_ALERT_EMAIL,
    ...configuredPartnerEmails,
  ]));

  for (const adminTo of partnerAdminRecipients) {
    promises.push(
      sendSiteEmail({
        to: adminTo,
        subject: `[Candidatura Parceiro] ${data.protocol} — ${data.empresa} (${data.provincia})`,
        html: adminHtml,
        text: adminText,
        replyTo: data.email,
      })
    );
  }

  const results = await Promise.allSettled(promises);
  const candidateSent = isSettledSuccess(results[0]);
  const adminSent = results.slice(1).some(isSettledSuccess);

  return { candidateSent, adminSent };
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
}): Promise<{ customerSent: boolean; adminSent: boolean }> => {
  const promises: Promise<{ success: boolean }>[] = [];

  if (data.email && data.email.includes('@')) {
    const custHtml = generateSupportTicketCustomerTemplate(data);
    const custText = `Prezado(a) ${data.nome},\n\nConfirmamos a receção e o registo do seu chamado de assistência técnica no Centro de Suporte KIVORA.\nProtocolo do Ticket: ${data.ticketNumber}\nAssunto: ${data.assunto}\nDepartamento: ${data.departamento.toUpperCase()}\nEstado: Em Fila de Atendimento\n\nA nossa equipa técnica responderá através desta mesma conversa com brevidade.\n\nKIVORA SOFT • Suporte Técnico`;

    promises.push(
      sendSiteEmail({
        to: data.email.trim(),
        subject: `Suporte KIVORA — Chamado #${data.ticketNumber}`,
        html: custHtml,
        text: custText,
      })
    );
  }

  const adminHtml = generateSupportTicketAdminAlertTemplate(data);
  const adminText = `Novo Chamado de Suporte #${data.ticketNumber} Registado:\nCliente/Empresa: ${data.nome}\nContacto: ${data.telefone} | ${data.email || 'N/D'}\nDepartamento: ${data.departamento.toUpperCase()}\nAssunto: ${data.assunto}\n\nDescrição do Chamado:\n${data.mensagem}`;

  const settings = getCachedSystemSettings();
  const configuredSupportEmails = (settings.supportEmail || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.includes('@'));

  const supportAdminRecipients = Array.from(new Set([
    'narcisomarcos826@gmail.com',
    ADMIN_ALERT_EMAIL,
    ...configuredSupportEmails,
  ]));

  for (const adminTo of supportAdminRecipients) {
    promises.push(
      sendSiteEmail({
        to: adminTo,
        subject: `[Suporte #${data.ticketNumber}] ${data.assunto} — ${data.nome}`,
        html: adminHtml,
        text: adminText,
        replyTo: data.email,
      })
    );
  }

  const results = await Promise.allSettled(promises);
  const customerSent = isSettledSuccess(results[0]);
  const adminSent = results.slice(1).some(isSettledSuccess);

  return { customerSent, adminSent };
};



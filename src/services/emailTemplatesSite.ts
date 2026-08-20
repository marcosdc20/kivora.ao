/**
 * Motor de Templates HTML para E-mails Corporativos do Site & Portal KIVORA
 * Desenvolvido pela Visual Software
 */

const PRIMARY_COLOR = '#2563eb';

const getEmailBaseLayout = (title: string, contentHtml: string, footerNote?: string): string => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid ${PRIMARY_COLOR}; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; background: rgba(37, 99, 235, 0.15); border: 1px solid rgba(37, 99, 235, 0.4); padding: 8px 20px; border-radius: 9999px; font-weight: 800; font-size: 18px; letter-spacing: 2px; color: #60a5fa; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #f8fafc; }
    .content { padding: 36px 32px; background: #ffffff; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-primary { background: #dbeafe; color: #1e40af; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .card-highlight { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .key-box { background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 10px; font-family: monospace; font-size: 16px; font-weight: 700; text-align: center; letter-spacing: 2px; border: 1px dashed #38bdf8; word-break: break-all; margin: 16px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; text-align: center; margin: 20px 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
    .table-data { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .table-data td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .table-data td.label { font-weight: 600; color: #64748b; width: 40%; }
    .table-data td.val { font-weight: 700; color: #0f172a; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 6px 0; }
    .footer a { color: #2563eb; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">⚡ KIVORA ERP</div>
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p><strong>KIVORA ERP — Sistema de Gestão Empresarial Certificado AGT</strong></p>
      <p>Desenvolvido por <strong>VISUAL SOFTWARE, LDA</strong> • Angola</p>
      <p>Suporte: <a href="mailto:suporte@kivora.ao">suporte@kivora.ao</a> | Comercial: (+244) 939 123 456</p>
      ${footerNote ? `<p style="margin-top: 12px; color: #94a3b8; font-size: 11px;">${footerNote}</p>` : ''}
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Template: Envio de Credenciais de Acesso e Download do KIVORA
 */
export const generateClientCredentialsTemplate = (data: {
  companyName: string;
  nif: string;
  adminName: string;
  email: string;
  tempPassword?: string;
  licenseKey: string;
  planName: string;
  downloadUrl?: string;
  portalUrl?: string;
}): string => {
  const downloadLink = data.downloadUrl || 'https://kivora.ao/download';
  const portalLink = data.portalUrl || 'https://kivora.ao/portal';

  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Bem-vindo ao KIVORA ERP! 🚀</h2>
    <p>Olá <strong>${data.adminName}</strong>,</p>
    <p>A conta da sua empresa <strong>${data.companyName}</strong> (NIF: ${data.nif}) foi ativada com sucesso no KIVORA Cloud ERP.</p>
    
    <div class="card-highlight">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">🔑 Credenciais de Acesso & Licença</h3>
      <table class="table-data">
        <tr>
          <td class="label">Empresa / Titular:</td>
          <td class="val">${data.companyName}</td>
        </tr>
        <tr>
          <td class="label">NIF Registado:</td>
          <td class="val">${data.nif}</td>
        </tr>
        <tr>
          <td class="label">Plano Ativo:</td>
          <td class="val"><span class="badge badge-primary">${data.planName}</span></td>
        </tr>
        <tr>
          <td class="label">E-mail de Login:</td>
          <td class="val">${data.email}</td>
        </tr>
        ${data.tempPassword ? `
        <tr>
          <td class="label">Palavra-passe Inicial:</td>
          <td class="val"><code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a;">${data.tempPassword}</code></td>
        </tr>` : ''}
      </table>

      <p style="margin-bottom: 4px; font-weight: 600; font-size: 13px; color: #1e3a8a;">Chave de Ativação do Software (License Key):</p>
      <div class="key-box">${data.licenseKey}</div>
    </div>

    <h3 style="color: #0f172a; font-size: 16px;">📥 Como Começar em 3 Passos:</h3>
    <ol style="padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
      <li>Descarregue e instale o KIVORA no seu computador (Windows ou Mac).</li>
      <li>Ao abrir a aplicação, cole a sua <strong>Chave de Ativação</strong> e o NIF da empresa.</li>
      <li>Inicie sessão com o seu e-mail e comece a emitir faturas e gerir o seu negócio.</li>
    </ol>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${downloadLink}" class="btn" style="color: #ffffff;">⬇️ Descarregar KIVORA ERP</a>
      <div style="margin-top: 10px;">
        <a href="${portalLink}" style="color: #2563eb; font-weight: 600; font-size: 14px; text-decoration: underline;">Aceder ao Portal do Cliente Web →</a>
      </div>
    </div>
  `;

  return getEmailBaseLayout('Credenciais de Acesso & Licença KIVORA', content, 'Por motivos de segurança, altere a sua palavra-passe no primeiro acesso.');
};

/**
 * 2. Template: Envio de Chave de Licença KIVORA
 */
export const generateLicenseDeliveryTemplate = (data: {
  companyName: string;
  nif: string;
  licenseKey: string;
  planName: string;
  validUntil: string;
  seatsCount: number;
  partnerName?: string;
}): string => {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">A sua Licença KIVORA ERP 🛡️</h2>
    <p>Prezada equipa da <strong>${data.companyName}</strong>,</p>
    <p>Apresentamos os dados oficiais da sua licença de utilização do sistema KIVORA ERP:</p>

    <div class="card">
      <table class="table-data">
        <tr>
          <td class="label">Empresa / NIF:</td>
          <td class="val">${data.companyName} (NIF: ${data.nif})</td>
        </tr>
        <tr>
          <td class="label">Plano de Subscrição:</td>
          <td class="val"><span class="badge badge-success">${data.planName}</span></td>
        </tr>
        <tr>
          <td class="label">Postos / Terminais:</td>
          <td class="val">${data.seatsCount} Posto(s) Autorizado(s)</td>
        </tr>
        <tr>
          <td class="label">Validade da Licença:</td>
          <td class="val" style="color: #166534;">${data.validUntil}</td>
        </tr>
        ${data.partnerName ? `
        <tr>
          <td class="label">Parceiro Certificado:</td>
          <td class="val">${data.partnerName}</td>
        </tr>` : ''}
      </table>

      <p style="margin-top: 16px; margin-bottom: 6px; font-weight: 700; font-size: 13px; color: #475569;">CHAVE OFICIAL DE ATIVAÇÃO:</p>
      <div class="key-box">${data.licenseKey}</div>
    </div>

    <p style="font-size: 13px; color: #64748b;">Para ativar ou renovar, abra o KIVORA no seu computador, vá a <strong>Configurações ➔ Licença & Ativação</strong> e insira a chave acima.</p>
  `;

  return getEmailBaseLayout('Emissão de Licença KIVORA ERP', content);
};

/**
 * 3. Template: Notificação para Parceiro Oficial KIVORA
 */
export const generatePartnerNotificationTemplate = (data: {
  partnerName: string;
  notificationType: 'new_client' | 'commission_credited' | 'license_expiring' | 'payout_processed';
  title: string;
  description: string;
  clientName?: string;
  amount?: string;
  actionUrl?: string;
}): string => {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Olá, ${data.partnerName}! 👋</h2>
    <div class="card-highlight">
      <span class="badge badge-primary" style="margin-bottom: 8px;">Portal do Parceiro KIVORA</span>
      <h3 style="margin: 8px 0; color: #1e3a8a; font-size: 18px;">${data.title}</h3>
      <p style="margin: 8px 0; color: #334155; font-size: 14px;">${data.description}</p>
      
      ${data.clientName ? `
      <div style="margin-top: 12px; padding: 10px; background: rgba(255, 255, 255, 0.7); border-radius: 8px; font-size: 13px;">
        <strong>Empresa Cliente:</strong> ${data.clientName}
      </div>` : ''}

      ${data.amount ? `
      <div style="margin-top: 12px; padding: 12px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; font-size: 15px; color: #166534; font-weight: 700;">
        💰 Valor da Comissão / Pagamento: ${data.amount}
      </div>` : ''}
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${data.actionUrl || 'https://kivora.ao/parceiros'}" class="btn">Aceder ao Painel do Parceiro</a>
    </div>
  `;

  return getEmailBaseLayout(data.title, content);
};

/**
 * 4. Template: Recuperação de Senha do Portal Web
 */
export const generateWebPasswordResetTemplate = (data: {
  userName: string;
  resetLink: string;
  expirationMinutes: number;
}): string => {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Recuperação de Palavra-passe</h2>
    <p>Olá <strong>${data.userName}</strong>,</p>
    <p>Recebemos um pedido para redefinir a palavra-passe da sua conta no Portal KIVORA.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.resetLink}" class="btn">Redefinir Palavra-passe</a>
      <p style="margin-top: 12px; font-size: 12px; color: #64748b;">
        Este link expira em <strong>${data.expirationMinutes} minutos</strong>.
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b;">Se não solicitou a redefinição de senha, ignore este e-mail. A sua conta permanece segura.</p>
  `;

  return getEmailBaseLayout('Recuperação de Palavra-passe KIVORA', content);
};

/**
 * 5. Template: Comunicado Oficial para Empresas e Parceiros
 */
export const generateBroadcastTemplate = (data: {
  title: string;
  body: string;
  senderTitle?: string;
}): string => {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">${data.title}</h2>
    <div class="card" style="font-size: 15px; color: #334155; line-height: 1.8;">
      ${data.body.replace(/\n/g, '<br>')}
    </div>
    <p style="margin-top: 20px; font-size: 14px; font-weight: 600; color: #475569;">
      Atenciosamente,<br>
      <span style="color: #2563eb;">${data.senderTitle || 'Equipa de Gestão & Suporte KIVORA'}</span>
    </p>
  `;

  return getEmailBaseLayout(data.title, content);
};

/**
 * 6. Template: E-mail de Teste de Conexão do Site
 */
export const generateSiteTestEmailTemplate = (providerName: string): string => {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
      <h2 style="color: #166534; margin: 0 0 8px 0;">Conexão de E-mail Bem-Sucedida!</h2>
      <p style="color: #334155; font-size: 15px;">O motor de e-mails do site e portais do <strong>KIVORA Cloud ERP</strong> está configurado e pronto a disparar notificações.</p>
      
      <div class="card-highlight" style="display: inline-block; text-align: left; margin: 16px auto;">
        <p style="margin: 4px 0; font-size: 13px;"><strong>Provedor Ativo:</strong> ${providerName}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Data e Hora:</strong> ${new Date().toLocaleString('pt-AO')}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Estado:</strong> <span class="badge badge-success">Online & Operacional</span></p>
      </div>
    </div>
  `;

  return getEmailBaseLayout('Teste de Conexão KIVORA E-mails', content);
};

/**
 * 7. Template: Confirmação de Pedido de Demonstração (Enviado ao Cliente)
 */
export const generateDemoLeadCustomerTemplate = (data: {
  contactName: string;
  companyName: string;
  phone: string;
  email: string;
  interestedModule: string;
  installationMode: string;
}): string => {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Olá, ${data.contactName}! 👋</h2>
    <p>Recebemos o seu pedido de demonstração para a sua empresa <strong>${data.companyName}</strong>.</p>
    <p>A nossa equipa de consultores comerciais entrará em contacto muito em breve pelo telefone/WhatsApp <strong>${data.phone}</strong> para agendar a sua demonstração guiada e tirar dúvidas.</p>
    
    <div class="card-highlight">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 15px;">📋 Resumo da Solicitação</h3>
      <table class="table-data">
        <tr>
          <td class="label">Empresa:</td>
          <td class="val">${data.companyName}</td>
        </tr>
        <tr>
          <td class="label">Responsável:</td>
          <td class="val">${data.contactName}</td>
        </tr>
        <tr>
          <td class="label">Módulo Solicitado:</td>
          <td class="val"><span class="badge badge-primary">${data.interestedModule}</span></td>
        </tr>
        <tr>
          <td class="label">Modalidade:</td>
          <td class="val">${data.installationMode}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569;">Se preferir atendimento imediato, fale diretamente connosco pelo WhatsApp: <a href="https://wa.me/244939123456" style="color: #2563eb; font-weight: 700;">(+244) 939 123 456</a>.</p>
  `;

  return getEmailBaseLayout(`Demonstração KIVORA ERP — ${data.companyName}`, content);
};

/**
 * 8. Template: Alerta de Novo Pedido de Demonstração (Enviado à Equipa KIVORA)
 */
export const generateDemoLeadAdminAlertTemplate = (data: {
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
}): string => {
  const content = `
    <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-weight: 700; color: #92400e;">
      🚨 Novo Lead / Pedido de Demonstração Recebido no Site
    </div>
    
    <table class="table-data">
      <tr><td class="label">Empresa:</td><td class="val"><strong>${data.companyName}</strong></td></tr>
      <tr><td class="label">Contacto:</td><td class="val">${data.contactName}</td></tr>
      <tr><td class="label">Telefone / WhatsApp:</td><td class="val"><a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}"><strong>${data.phone}</strong></a></td></tr>
      <tr><td class="label">E-mail:</td><td class="val"><a href="mailto:${data.email}">${data.email}</a></td></tr>
      ${data.nif ? `<tr><td class="label">NIF:</td><td class="val">${data.nif}</td></tr>` : ''}
      <tr><td class="label">Sector de Actividade:</td><td class="val">${data.businessSector}</td></tr>
      <tr><td class="label">N.º de Lojas / Caixas:</td><td class="val">${data.storesCount}</td></tr>
      <tr><td class="label">Módulo de Interesse:</td><td class="val"><strong>${data.interestedModule}</strong></td></tr>
      <tr><td class="label">Instalação Pretendida:</td><td class="val">${data.installationMode}</td></tr>
      ${data.notes ? `<tr><td class="label">Observações / Notas:</td><td class="val">${data.notes}</td></tr>` : ''}
    </table>

    <div style="text-align: center; margin-top: 20px;">
      <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" class="btn">Chamar no WhatsApp Imediatamente</a>
    </div>
  `;

  return getEmailBaseLayout(`[NOVO LEAD] ${data.companyName} (${data.contactName})`, content);
};

/**
 * 9. Template: Confirmação de Candidatura a Parceiro (Enviado ao Candidato)
 */
export const generatePartnerApplicationCandidateTemplate = (data: {
  nome: string;
  empresa: string;
  protocol: string;
  provincia: string;
}): string => {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Olá, ${data.nome}! 🤝</h2>
    <p>Agradecemos o seu interesse em integrar a Rede Nacional de Parceiros Oficiais do <strong>KIVORA ERP</strong>.</p>
    
    <div class="card-highlight">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 15px;">📜 Protocolo de Candidatura</h3>
      <div class="key-box">${data.protocol}</div>
      <p style="font-size: 13px; color: #64748b; margin: 4px 0;"><strong>Empresa / Nome:</strong> ${data.empresa}</p>
      <p style="font-size: 13px; color: #64748b; margin: 4px 0;"><strong>Província de Actuação:</strong> ${data.provincia}</p>
      <p style="font-size: 13px; color: #64748b; margin: 4px 0;"><strong>Estado:</strong> <span class="badge badge-warning">Em Análise Comercial</span></p>
    </div>

    <p style="font-size: 14px; color: #475569;">A nossa direção de canais analisará o seu perfil técnico/comercial e responderá no prazo de 24 a 48 horas úteis.</p>
  `;

  return getEmailBaseLayout(`Candidatura a Parceiro KIVORA — ${data.protocol}`, content);
};

/**
 * 10. Template: Confirmação de Ticket de Suporte (Enviado ao Cliente)
 */
export const generateSupportTicketCustomerTemplate = (data: {
  nome: string;
  ticketNumber: string;
  assunto: string;
  departamento: string;
}): string => {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Ticket de Suporte Registado</h2>
    <p>Olá <strong>${data.nome}</strong>,</p>
    <p>O seu pedido de assistência técnica foi registado no nosso sistema com o seguinte número de acompanhamento:</p>
    
    <div class="card-highlight">
      <div class="key-box">${data.ticketNumber}</div>
      <p style="font-size: 13px; color: #64748b; margin: 4px 0;"><strong>Assunto:</strong> ${data.assunto}</p>
      <p style="font-size: 13px; color: #64748b; margin: 4px 0;"><strong>Departamento:</strong> ${data.departamento.toUpperCase()}</p>
    </div>

    <p style="font-size: 14px; color: #475569;">Um técnico de suporte entrará em contacto consigo em breve.</p>
  `;

  return getEmailBaseLayout(`Suporte KIVORA — Ticket #${data.ticketNumber}`, content);
};

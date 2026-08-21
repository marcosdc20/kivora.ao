/**
 * Motor de Templates HTML para E-mails Corporativos — KIVORA Cloud ERP
 * Padrão Executivo, Moderno e Profissional (Sem emojis informais / Sem estética genérica de IA)
 * Desenvolvido pela Visual Software, Lda
 */

const LOGO_URL = 'https://raw.githubusercontent.com/marcosdc20/kivora.ao/main/public/logo.png';
const PORTAL_URL = 'https://kivora.ao/#login';
const DOWNLOAD_URL = 'https://kivora.ao/#download';
const SUPPORT_EMAIL = 'suporte@kivora.ao';
const COMMERCIAL_EMAIL = 'kivora.angola@gmail.com';

/**
 * Layout Base Executivo Corporativo
 */
const getEmailBaseLayout = (title: string, contentHtml: string, footerNote?: string): string => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 30px 0;
    }
    .main-table {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }
    .header {
      background-color: #090e1a;
      background: linear-gradient(135deg, #090e1a 0%, #111c30 100%);
      padding: 32px 24px 28px 24px;
      text-align: center;
      border-bottom: 3px solid #2563eb;
    }
    .header img {
      max-width: 140px;
      height: auto;
      display: inline-block;
      margin-bottom: 12px;
    }
    .header-tagline {
      margin: 0;
      color: #94a3b8;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 32px;
      background-color: #ffffff;
    }
    .content h1 {
      margin: 0 0 16px 0;
      color: #0f172a;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #334155;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-primary { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-success { background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-amber { background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge-dark { background-color: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; font-family: monospace; }
    .card-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
    }
    .card-highlight {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #2563eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .key-display {
      background-color: #0f172a;
      color: #38bdf8;
      padding: 14px 16px;
      border-radius: 8px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 14px;
      font-weight: 700;
      text-align: center;
      letter-spacing: 1.5px;
      border: 1px solid #1e293b;
      word-break: break-all;
      margin: 12px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      text-align: center;
      margin: 16px 0;
      letter-spacing: 0.2px;
      border: 1px solid #0f172a;
    }
    .btn-blue {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      text-align: center;
      margin: 16px 0;
      letter-spacing: 0.2px;
    }
    .table-data {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }
    .table-data td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
      vertical-align: middle;
    }
    .table-data tr:last-child td {
      border-bottom: none;
    }
    .table-data td.label {
      font-weight: 600;
      color: #64748b;
      width: 38%;
    }
    .table-data td.val {
      font-weight: 700;
      color: #0f172a;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 28px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      line-height: 1.6;
    }
    .footer p {
      margin: 4px 0;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <!-- HEADER -->
      <tr>
        <td class="header">
          <a href="https://kivora.ao" target="_blank" style="text-decoration: none;">
            <img src="${LOGO_URL}" alt="KIVORA ERP" width="140" border="0" style="display: block; margin: 0 auto 12px auto; max-width: 140px; height: auto;" />
          </a>
          <p class="header-tagline">Sistema de Gestão Empresarial Certificado pela AGT</p>
        </td>
      </tr>

      <!-- CONTENT -->
      <tr>
        <td class="content">
          ${contentHtml}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td class="footer">
          <p><strong>KIVORA Cloud ERP • VISUAL SOFTWARE, LDA</strong></p>
          <p>Software de Faturação e Gestão Comercial Certificado pela AGT • Angola</p>
          <p>Suporte Técnico: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> | Geral: <a href="mailto:${COMMERCIAL_EMAIL}">${COMMERCIAL_EMAIL}</a></p>
          ${footerNote ? `<p style="margin-top: 12px; color: #94a3b8; font-size: 10.5px; border-top: 1px solid #e2e8f0; padding-top: 10px;">${footerNote}</p>` : ''}
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

/**
 * 1. Template: Envio de Credenciais de Acesso e Licença do Cliente
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
  const downloadLink = data.downloadUrl || DOWNLOAD_URL;
  const portalLink = data.portalUrl || PORTAL_URL;

  const content = `
    <h1>Ativação de Conta e Credenciais de Acesso</h1>
    <p>Prezado(a) <strong>${data.adminName}</strong>,</p>
    <p>Confirmamos a ativação da conta da sua empresa <strong>${data.companyName}</strong> (NIF: ${data.nif}) na infraestrutura KIVORA Cloud ERP.</p>
    
    <div class="card-highlight">
      <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 8px;">Dados da Conta e Licença</div>
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
          <td class="label">Plano Subscrito:</td>
          <td class="val"><span class="badge badge-primary">${data.planName}</span></td>
        </tr>
        <tr>
          <td class="label">E-mail de Acesso:</td>
          <td class="val">${data.email}</td>
        </tr>
        ${data.tempPassword ? `
        <tr>
          <td class="label">Palavra-passe Inicial:</td>
          <td class="val"><code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a; font-family: monospace;">${data.tempPassword}</code></td>
        </tr>` : ''}
      </table>

      <div style="margin-top: 14px; font-weight: 600; font-size: 12px; color: #475569; text-transform: uppercase;">Chave de Ativação do Software (License Key):</div>
      <div class="key-display">${data.licenseKey}</div>
    </div>

    <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-top: 24px; margin-bottom: 8px;">Procedimento de Inicialização:</div>
    <ol style="padding-left: 20px; color: #334155; font-size: 13.5px; line-height: 1.7; margin: 0 0 20px 0;">
      <li>Efetue o download do instalador oficial do KIVORA ERP.</li>
      <li>Abra o aplicativo no seu computador e introduza a <strong>Chave de Ativação</strong> e o NIF da empresa.</li>
      <li>Inicie sessão com o seu e-mail e configure as tabelas iniciais de produtos e operadores.</li>
    </ol>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${downloadLink}" class="btn-blue">Descarregar KIVORA ERP (Instalador Oficial)</a>
      <div style="margin-top: 12px;">
        <a href="${portalLink}" style="color: #2563eb; font-weight: 600; font-size: 13px; text-decoration: underline;">Aceder ao Portal do Cliente Web</a>
      </div>
    </div>
  `;

  return getEmailBaseLayout('Credenciais de Acesso & Licença KIVORA', content, 'Por normas de segurança, recomendamos a alteração da palavra-passe no primeiro início de sessão.');
};

/**
 * 2. Template: Emissão Oficial de Licença KIVORA
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
    <h1>Emissão de Licença de Utilização</h1>
    <p>Prezada equipa da <strong>${data.companyName}</strong>,</p>
    <p>Apresentamos os parâmetros oficiais da licença emitida para a sua entidade no sistema KIVORA ERP:</p>

    <div class="card-box">
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
          <td class="label">Plano de Subscrição:</td>
          <td class="val"><span class="badge badge-success">${data.planName}</span></td>
        </tr>
        <tr>
          <td class="label">Terminais Autorizados:</td>
          <td class="val">${data.seatsCount} Posto(s)</td>
        </tr>
        <tr>
          <td class="label">Data de Validade:</td>
          <td class="val" style="color: #15803d;">${data.validUntil}</td>
        </tr>
        ${data.partnerName ? `
        <tr>
          <td class="label">Canal / Parceiro:</td>
          <td class="val">${data.partnerName}</td>
        </tr>` : ''}
      </table>

      <div style="margin-top: 14px; font-weight: 600; font-size: 12px; color: #475569; text-transform: uppercase;">Chave Oficial de Licenciamento:</div>
      <div class="key-display">${data.licenseKey}</div>
    </div>

    <p style="font-size: 13px; color: #64748b;">Para registar ou renovar a licença, abra a aplicação no terminal, aceda ao menu <strong>Configurações &rarr; Licenciamento</strong> e insira o código fornecido.</p>
  `;

  return getEmailBaseLayout('Emissão de Licença KIVORA ERP', content);
};

/**
 * 3. Template: Credenciais de Parceiro Homologado
 */
export const generatePartnerCredentialsTemplate = (data: {
  partnerName: string;
  partnerCode: string;
  email: string;
  password?: string;
  portalUrl?: string;
}): string => {
  const portalLink = data.portalUrl || PORTAL_URL;
  const content = `
    <h1>Homologação de Parceria e Credenciais de Acesso</h1>
    <p>Prezado(a) <strong>${data.partnerName}</strong>,</p>
    <p>Temos a satisfação de confirmar que a sua entidade foi formalmente homologada como <strong>Canal Credenciado de Distribuição e Suporte Técnico</strong> do KIVORA ERP.</p>
    
    <div class="card-highlight">
      <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 8px;">Credenciais do Portal do Parceiro</div>
      <table class="table-data">
        <tr>
          <td class="label">Entidade Parceira:</td>
          <td class="val">${data.partnerName}</td>
        </tr>
        <tr>
          <td class="label">Código de Parceiro:</td>
          <td class="val"><span class="badge badge-dark">${data.partnerCode}</span></td>
        </tr>
        <tr>
          <td class="label">E-mail de Acesso:</td>
          <td class="val">${data.email}</td>
        </tr>
        ${data.password ? `
        <tr>
          <td class="label">Palavra-passe Inicial:</td>
          <td class="val"><code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a; font-family: monospace;">${data.password}</code></td>
        </tr>` : ''}
      </table>
    </div>

    <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-top: 20px; margin-bottom: 8px;">Recursos Disponíveis no Portal:</div>
    <ul style="padding-left: 20px; color: #334155; font-size: 13.5px; line-height: 1.7; margin: 0 0 20px 0;">
      <li>Emissão e ativação autónoma de licenças oficiais em tempo real para os seus clientes.</li>
      <li>Consulta da tabela escalonada de preços de atacado e margens de revenda.</li>
      <li>Emissão de Certificados Oficiais de Homologação Técnica perante a Visual Software.</li>
      <li>Acompanhamento de quotas de crédito operacional e extrato de liquidações.</li>
    </ul>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${portalLink}" class="btn-primary">Aceder ao Portal do Parceiro</a>
    </div>
  `;

  return getEmailBaseLayout('Credenciais de Parceiro Homologado KIVORA', content, 'Recomendamos a alteração da palavra-passe provisória no primeiro acesso.');
};

/**
 * 4. Template: Notificação Operacional para Parceiro
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
    <h1>Notificação Operacional de Parceiro</h1>
    <p>Prezado(a) <strong>${data.partnerName}</strong>,</p>
    
    <div class="card-highlight">
      <div style="font-weight: 700; color: #0f172a; font-size: 15px; margin-bottom: 8px;">${data.title}</div>
      <p style="margin: 0 0 12px 0; color: #334155; font-size: 13.5px;">${data.description}</p>
      
      ${data.clientName ? `
      <div style="margin-top: 10px; padding: 8px 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;">
        <strong style="color: #475569;">Empresa Cliente:</strong> <span style="color: #0f172a; font-weight: 700;">${data.clientName}</span>
      </div>` : ''}

      ${data.amount ? `
      <div style="margin-top: 10px; padding: 10px 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 14px; color: #15803d; font-weight: 700;">
        Montante Liquidado / Creditado: ${data.amount}
      </div>` : ''}
    </div>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${data.actionUrl || PORTAL_URL}" class="btn-primary">Consultar no Portal do Parceiro</a>
    </div>
  `;

  return getEmailBaseLayout(data.title, content);
};

/**
 * 5. Template: Confirmação de Receção de Candidatura de Parceiro
 */
export const generatePartnerApplicationCandidateTemplate = (data: {
  nome: string;
  empresa: string;
  protocol: string;
  provincia: string;
}): string => {
  const content = `
    <h1>Confirmação de Receção de Candidatura</h1>
    <p>Prezado(a) <strong>${data.nome}</strong>,</p>
    <p>Agradecemos a submissão da proposta de parceria para a sua entidade <strong>${data.empresa}</strong> perante o programa de canais da KIVORA ERP.</p>
    
    <div class="card-highlight">
      <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 8px;">Protocolo de Candidatura Registado</div>
      <div class="key-display">${data.protocol}</div>
      <table class="table-data" style="margin-top: 10px;">
        <tr>
          <td class="label">Entidade / Responsável:</td>
          <td class="val">${data.empresa} (${data.nome})</td>
        </tr>
        <tr>
          <td class="label">Província de Atuação:</td>
          <td class="val">${data.provincia}</td>
        </tr>
        <tr>
          <td class="label">Estado Atual:</td>
          <td class="val"><span class="badge badge-amber">Em Análise Técnica</span></td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13.5px; color: #475569;">A nossa Direção de Canais analisará a conformidade técnica e documental do processo. O parecer formal e as credenciais de homologação serão comunicados no prazo de 24 a 48 horas úteis.</p>
  `;

  return getEmailBaseLayout(`Candidatura a Parceiro KIVORA — ${data.protocol}`, content);
};

/**
 * 6. Template: Confirmação de Pedido de Demonstração (Cliente)
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
    <h1>Receção de Solicitação de Demonstração</h1>
    <p>Prezado(a) <strong>${data.contactName}</strong>,</p>
    <p>Confirmamos a receção do pedido de demonstração para a entidade <strong>${data.companyName}</strong>.</p>
    <p>Um consultor especialista da nossa equipa comercial entrará em contacto através do número <strong>${data.phone}</strong> para o agendamento da sessão e apresentação das funcionalidades fiscais e de gestão.</p>
    
    <div class="card-box">
      <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 8px;">Resumo da Solicitação</div>
      <table class="table-data">
        <tr>
          <td class="label">Empresa / Razão Social:</td>
          <td class="val">${data.companyName}</td>
        </tr>
        <tr>
          <td class="label">Responsável de Contacto:</td>
          <td class="val">${data.contactName}</td>
        </tr>
        <tr>
          <td class="label">Módulo Solicitado:</td>
          <td class="val"><span class="badge badge-primary">${data.interestedModule}</span></td>
        </tr>
        <tr>
          <td class="label">Modalidade de Instalação:</td>
          <td class="val">${data.installationMode}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b;">Caso necessite de esclarecimentos adicionais, poderá contactar a nossa linha direta comercial através do endereço <a href="mailto:${COMMERCIAL_EMAIL}">${COMMERCIAL_EMAIL}</a>.</p>
  `;

  return getEmailBaseLayout(`Demonstração KIVORA ERP — ${data.companyName}`, content);
};

/**
 * 7. Template: Alerta de Nova Solicitação de Demonstração (Equipa Admin)
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
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-weight: 700; color: #1e40af; font-size: 13.5px;">
      Notificação: Nova Solicitação de Demonstração Recebida via Website
    </div>
    
    <table class="table-data">
      <tr><td class="label">Empresa / Razão Social:</td><td class="val"><strong>${data.companyName}</strong></td></tr>
      <tr><td class="label">Responsável:</td><td class="val">${data.contactName}</td></tr>
      <tr><td class="label">Telefone / WhatsApp:</td><td class="val"><strong>${data.phone}</strong></td></tr>
      <tr><td class="label">E-mail:</td><td class="val">${data.email}</td></tr>
      ${data.nif ? `<tr><td class="label">NIF:</td><td class="val">${data.nif}</td></tr>` : ''}
      <tr><td class="label">Setor de Atividade:</td><td class="val">${data.businessSector}</td></tr>
      <tr><td class="label">N.º de Terminais / Lojas:</td><td class="val">${data.storesCount}</td></tr>
      <tr><td class="label">Módulo de Interesse:</td><td class="val"><strong>${data.interestedModule}</strong></td></tr>
      <tr><td class="label">Modalidade de Instalação:</td><td class="val">${data.installationMode}</td></tr>
      ${data.notes ? `<tr><td class="label">Observações / Requisitos:</td><td class="val">${data.notes}</td></tr>` : ''}
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" class="btn-primary">Contactar Contacto via WhatsApp</a>
    </div>
  `;

  return getEmailBaseLayout(`[Demonstração] ${data.companyName} (${data.contactName})`, content);
};

/**
 * 8. Template: Confirmação de Ticket de Suporte Técnico
 */
export const generateSupportTicketCustomerTemplate = (data: {
  nome: string;
  ticketNumber: string;
  assunto: string;
  departamento: string;
}): string => {
  const content = `
    <h1>Registo de Chamado de Assistência Técnica</h1>
    <p>Prezado(a) <strong>${data.nome}</strong>,</p>
    <p>Confirmamos a receção e o registo do seu chamado de assistência técnica no Centro de Suporte KIVORA:</p>
    
    <div class="card-highlight">
      <div style="font-weight: 600; font-size: 12px; color: #475569; text-transform: uppercase;">Número de Protocolo do Ticket:</div>
      <div class="key-display">${data.ticketNumber}</div>
      <table class="table-data" style="margin-top: 8px;">
        <tr>
          <td class="label">Assunto:</td>
          <td class="val">${data.assunto}</td>
        </tr>
        <tr>
          <td class="label">Departamento:</td>
          <td class="val">${data.departamento.toUpperCase()}</td>
        </tr>
        <tr>
          <td class="label">Estado:</td>
          <td class="val"><span class="badge badge-primary">Em Fila de Atendimento</span></td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13.5px; color: #475569;">Um técnico da equipa de engenharia analisará o incidente e responderá através desta mesma conversa com brevidade.</p>
  `;

  return getEmailBaseLayout(`Suporte KIVORA — Protocolo #${data.ticketNumber}`, content);
};

/**
 * 9. Template: Recuperação de Palavra-passe
 */
export const generateWebPasswordResetTemplate = (data: {
  userName: string;
  resetLink: string;
  expirationMinutes: number;
}): string => {
  const content = `
    <h1>Recuperação de Palavra-passe</h1>
    <p>Prezado(a) <strong>${data.userName}</strong>,</p>
    <p>Recebemos uma solicitação para redefinir a palavra-passe associada à sua conta no Portal KIVORA.</p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.resetLink}" class="btn-blue">Redefinir Palavra-passe</a>
      <p style="margin-top: 12px; font-size: 11.5px; color: #64748b;">
        Por razões de segurança, esta ligação expira em <strong>${data.expirationMinutes} minutos</strong>.
      </p>
    </div>

    <p style="font-size: 12.5px; color: #64748b;">Caso não tenha solicitado a redefinição de palavra-passe, desconsidere esta mensagem. A segurança da sua conta permanece inalterada.</p>
  `;

  return getEmailBaseLayout('Recuperação de Palavra-passe — KIVORA', content);
};

/**
 * 10. Template: Comunicado Oficial / Broadcast
 */
export const generateBroadcastTemplate = (data: {
  title: string;
  body: string;
  senderTitle?: string;
}): string => {
  const content = `
    <h1>${data.title}</h1>
    <div class="card-box" style="font-size: 14px; color: #334155; line-height: 1.8;">
      ${data.body.replace(/\n/g, '<br>')}
    </div>
    <div style="margin-top: 24px; font-size: 13.5px; color: #475569;">
      Atenciosamente,<br>
      <strong style="color: #0f172a;">${data.senderTitle || 'Direção de Operações & Suporte KIVORA ERP'}</strong><br>
      <span style="font-size: 12px; color: #64748b;">VISUAL SOFTWARE, LDA</span>
    </div>
  `;

  return getEmailBaseLayout(data.title, content);
};

/**
 * 11. Template: Teste de Conexão do Servidor de E-mails
 */
export const generateSiteTestEmailTemplate = (providerName: string): string => {
  const content = `
    <div style="text-align: center; padding: 10px 0;">
      <div style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">
        Conexão Estabelecida com Sucesso
      </div>
      <h1>Verificação do Servidor de Envio de E-mails</h1>
      <p style="color: #334155; font-size: 14px; max-width: 480px; margin: 0 auto 20px auto;">
        O motor de mensageria e notificações do <strong>KIVORA Cloud ERP</strong> está operacional e apto a expedir credenciais, licenças e comunicações corporativas.
      </p>
      
      <div class="card-box" style="display: inline-block; text-align: left; max-width: 420px; width: 100%; margin: 10px auto;">
        <table class="table-data">
          <tr>
            <td class="label">Provedor Ativo:</td>
            <td class="val">${providerName}</td>
          </tr>
          <tr>
            <td class="label">Data / Hora:</td>
            <td class="val">${new Date().toLocaleString('pt-AO')}</td>
          </tr>
          <tr>
            <td class="label">Estado Operacional:</td>
            <td class="val"><span class="badge badge-success">Online & Ativo</span></td>
          </tr>
        </table>
      </div>
    </div>
  `;

  return getEmailBaseLayout('Teste de Conexão do Servidor de E-mails — KIVORA', content);
};

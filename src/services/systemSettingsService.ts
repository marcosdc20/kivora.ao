import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { KIVORA_INFO } from '../data/kivoraData';

export interface SystemCompanySettings {
  name: string;
  fullName: string;
  company: string;
  nif: string;
  phone: string;
  phoneRaw: string;
  phoneDisplay: string;
  phoneCommercial?: string;
  email: string;
  supportEmail: string;
  partnerEmail?: string;
  salesEmail?: string;
  supportHours?: string;
  supportHoursSunday?: string;
  address: string;
  agtCertificate: string;
  githubUrl: string;
  downloadUrl: string;
  releaseVersion: string;
  releaseDate: string;
  fileSize?: string;
  sha256Checksum?: string;
  demoKey?: string;
  minOs?: string;
  minRam?: string;
  minStorage?: string;
  minCpu?: string;
  releaseNotes?: string;
  // Configurações da Tabela de Preços & Planos
  pricingTag?: string;
  pricingTitle?: string;
  pricingSubtitle?: string;

  // Plano Mensal
  planMensalName?: string;
  planMensalPrice?: string;
  planMensalPeriod?: string;
  planMensalDesc?: string;
  planMensalFeatures?: string;
  planMensalCta?: string;
  planMensalExtraTerminal?: number;

  // Plano Anual
  planAnualName?: string;
  planAnualPrice?: string;
  planAnualPeriod?: string;
  planAnualDesc?: string;
  planAnualBadge?: string;
  planAnualFeatures?: string;
  planAnualCta?: string;
  planAnualExtraTerminal?: number;

  // Plano Vitalício
  planVitalicioName?: string;
  planVitalicioPrice?: string;
  planVitalicioPeriod?: string;
  planVitalicioDesc?: string;
  planVitalicioFeatures?: string;
  planVitalicioCta?: string;
  planVitalicioExtraTerminal?: number;

  whatsappUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl?: string;
  telegramUrl?: string;
  ibanBai: string;
  ibanBfa: string;
  ibanTitular: string;
  updatedAt?: number;
}

/**
 * Normaliza qualquer URL de download (GitHub blob, GitHub releases, Google Drive, Dropbox, VPS, etc.)
 * para que o clique do utilizador no site descarregue diretamente o ficheiro binário (.exe/.msi)
 * sem abrir a página HTML de pré-visualização do GitHub.
 */
export function getDirectDownloadUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. GitHub Blob URL -> Converter para GitHub Raw
  // Exemplo: https://github.com/marcosdc20/kivora-setup-vers-o/blob/main/KIVORA_1.1.0_x64-setup.exe
  // Converte para: https://github.com/marcosdc20/kivora-setup-vers-o/raw/main/KIVORA_1.1.0_x64-setup.exe
  const githubBlobRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i;
  const matchBlob = trimmed.match(githubBlobRegex);
  if (matchBlob) {
    const [, owner, repo, rest] = matchBlob;
    return `https://github.com/${owner}/${repo}/raw/${rest}`;
  }

  // 2. Google Drive /file/d/{id}/view -> uc?export=download&id={id}
  const gdriveRegex = /^https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/i;
  const matchGdrive = trimmed.match(gdriveRegex);
  if (matchGdrive) {
    return `https://drive.google.com/uc?export=download&id=${matchGdrive[1]}`;
  }

  // 3. Dropbox dl=0 -> dl=1
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'dl=1');
  }

  return trimmed;
}

export const DEFAULT_SETTINGS: SystemCompanySettings = {
  name: KIVORA_INFO.name,
  fullName: KIVORA_INFO.fullName,
  company: KIVORA_INFO.company,
  nif: '5417089123',
  phone: KIVORA_INFO.phone,
  phoneRaw: KIVORA_INFO.phoneRaw,
  phoneDisplay: KIVORA_INFO.phoneDisplay,
  phoneCommercial: '+244 923 456 789',
  email: KIVORA_INFO.email,
  supportEmail: KIVORA_INFO.supportEmail,
  partnerEmail: 'parceiros@kivora.ao',
  salesEmail: 'comercial@kivora.ao',
  supportHours: 'Segunda a Sábado: 08h00 – 19h00',
  supportHoursSunday: 'Domingos e Feriados: Plantão para Urgências',
  address: KIVORA_INFO.address,
  agtCertificate: 'Certificação AGT n.º 384/AGT/2024',
  githubUrl: 'https://github.com/marcosdc20/kivora-setup-vers-o',
  downloadUrl: 'https://github.com/marcosdc20/kivora-setup-vers-o/raw/main/KIVORA_1.1.0_x64-setup.exe',
  releaseVersion: '1.1.0',
  releaseDate: '19 de Agosto de 2026',
  fileSize: '78.4 MB',
  sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  demoKey: 'KVRA-DEMO-2026-TRIAL',
  minOs: 'Windows 10 / 11 (64-bit)',
  minRam: '4 GB RAM (Recomendado 8 GB)',
  minStorage: '2 GB livres em SSD (+ base de dados)',
  minCpu: 'Intel Core i3 / AMD Ryzen 3 ou superior',
  releaseNotes: '• Motor de faturação certificado em estrita conformidade com a AGT\n• Base de dados 100% local com funcionamento sem internet\n• Módulo de POS de balcão e gestão de stock integrada\n• Exportação e validação oficial de SAF-T (AO)',

  // Configurações de Preços Padrão
  pricingTag: 'Tabela de Preços Oficiais',
  pricingTitle: 'Escolha a Modalidade de Licenciamento',
  pricingSubtitle: 'Preços claros em Kwanzas (AOA) com IVA incluído no regime de isenção de software e sem cobrança por fatura emitida.',

  // Plano Mensal
  planMensalName: 'Mensal Standalone',
  planMensalPrice: '25.000',
  planMensalPeriod: '/ mês',
  planMensalDesc: 'Flexibilidade total sem contratos de fidelização. Ideal para 1 computador isolado ou início de atividade.',
  planMensalFeatures: '1 Posto de Trabalho Standalone\nFaturação Eletrónica AGT DS.120 com QR Code\nPOS de Balcão e Fecho de Caixa com Relatório Z\nGestão de Stock Básica e Preços de Venda\nExportação SAF-T AO mensal sem erros\nAtualizações fiscais legais incluídas\nSuporte por email e WhatsApp em horário comercial',
  planMensalCta: 'Aderir ao Plano Mensal',
  planMensalExtraTerminal: 10000,

  // Plano Anual
  planAnualName: 'Anual Multi-Postos (Recomendado)',
  planAnualPrice: '250.000',
  planAnualPeriod: '/ ano',
  planAnualDesc: 'A opção mais rentável para empresas ativas. Inclui 3 postos em rede local e poupança imediata.',
  planAnualBadge: 'MAIS POPULAR EM ANGOLA',
  planAnualFeatures: 'Até 3 Postos de Trabalho em Rede LAN (Caixas + Servidor)\nTudo do Plano Mensal incluído\nMódulo de Recursos Humanos & IRT 2026\nContabilidade PGC-AO & SAF-T Completo\nMultidepósito e Controlo de Validades e Lotes\nSuporte Técnico Prioritário (SLA 4h)\nFormação operacional da equipa incluída',
  planAnualCta: 'Adquirir Licença Anual',
  planAnualExtraTerminal: 35000,

  // Plano Vitalício
  planVitalicioName: 'Licença Vitalícia Perpétua',
  planVitalicioPrice: '650.000',
  planVitalicioPeriod: 'pagamento único',
  planVitalicioDesc: 'Sem renovações anuais ou mensalidades. A licença definitiva para a sua empresa com 5 postos LAN.',
  planVitalicioFeatures: '5 Postos de Trabalho em Rede Local / Servidor Dedicado\nLicença perpétua sem expiração\nInstalação e parametrização presencial ou remota assistida\nTodos os módulos do Kivora ERP desbloqueados\nFormação presencial certificada para operadores e gerentes\nGestor de conta executivo e canal VIP de atendimento\nCópia de segurança automática local e em Pen USB',
  planVitalicioCta: 'Adquirir Licença Perpétua',
  planVitalicioExtraTerminal: 60000,
  whatsappUrl: KIVORA_INFO.whatsapp,
  facebookUrl: KIVORA_INFO.facebook,
  instagramUrl: KIVORA_INFO.instagram,
  linkedinUrl: 'https://linkedin.com/company/kivora',
  telegramUrl: 'https://t.me/kivora_ao',
  ibanBai: 'AO06 0040 0000 1234 5678 9012 3',
  ibanBfa: 'AO06 0006 0000 9876 5432 1098 7',
  ibanTitular: 'VISUAL SOFTWARE LIMITADA',
};

const LOCAL_STORAGE_KEY = 'kivora_system_settings';

export function getCachedSystemSettings(): SystemCompanySettings {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
    }
  } catch (err) {
    console.warn('Erro ao ler settings locais:', err);
  }
  return DEFAULT_SETTINGS;
}

export function subscribeSystemSettings(callback: (settings: SystemCompanySettings) => void) {
  try {
    const docRef = doc(db, 'system_settings', 'company_info');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SystemCompanySettings;
        const merged = { ...DEFAULT_SETTINGS, ...data };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        callback(merged);
      } else {
        callback(getCachedSystemSettings());
      }
    }, (err) => {
      console.warn('Erro ao escutar system_settings do Firestore:', err);
      callback(getCachedSystemSettings());
    });
    return unsub;
  } catch (err) {
    console.warn('Erro subscribeSystemSettings:', err);
    callback(getCachedSystemSettings());
    return () => {};
  }
}

export async function saveSystemSettings(settings: Partial<SystemCompanySettings>): Promise<void> {
  const current = getCachedSystemSettings();
  const merged: SystemCompanySettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  // Normalizar URLs de download e GitHub
  if (merged.downloadUrl) {
    merged.downloadUrl = getDirectDownloadUrl(merged.downloadUrl);
  }
  if (merged.githubUrl) {
    merged.githubUrl = merged.githubUrl.trim();
  }

  // Se o telefone foi atualizado, sincroniza phoneRaw e whatsappUrl automaticamente
  if (settings.phoneDisplay || settings.phone) {
    const raw = (settings.phoneDisplay || settings.phone || '').replace(/\D/g, '');
    merged.phoneRaw = raw || merged.phoneRaw;
    merged.phoneDisplay = settings.phoneDisplay || settings.phone || merged.phoneDisplay;
    merged.whatsappUrl = `https://wa.me/${merged.phoneRaw}`;
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));

  try {
    const docRef = doc(db, 'system_settings', 'company_info');
    await setDoc(docRef, merged, { merge: true });
  } catch (err) {
    console.error('Erro ao guardar configurações no Firebase:', err);
    throw err;
  }
}

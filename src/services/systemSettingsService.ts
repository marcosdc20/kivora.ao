import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { KIVORA_INFO } from '../data/kivoraData';

export interface PartnerBrandLogo {
  id: string;
  name: string;
  logoUrl?: string;
  type: 'parceiro' | 'cliente';
  sector?: string;
  province?: string;
  active: boolean;
}

export interface ProvinceStat {
  id: string;
  name: string;
  capital: string;
  activeClients: number;
  certifiedPartners: number;
  status: 'Ativo' | 'Em Expansão';
}

export interface InvestorSettings {
  title?: string;
  subtitle?: string;
  summary?: string;
  annualGrowth?: string;
  legalEntity?: string;
  shareCapital?: string;
  auditedBy?: string;
  contactEmail?: string;
}

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

  // Métricas do Sistema
  statCompaniesCount?: number;
  statTerminalsCount?: number;
  statInvoicesCount?: string;
  statUptimePercent?: string;
  statProvincesCount?: number;

  // Carrossel de Logos & Marcas
  partnerLogos?: PartnerBrandLogo[];

  // Informações de Investidores
  investorInfo?: InvestorSettings;

  // Cobertura por Províncias
  provincesCoverage?: ProvinceStat[];

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

  // Comunicados de Topo & Cookies
  announcementBarEnabled?: boolean;
  announcementText?: string;
  announcementLink?: string;
  announcementBadge?: string;
  cookieBannerEnabled?: boolean;

  // Notificações & Webhook
  webhookUrl?: string;
  notifyEmailLeads?: string;
  notifyEmailPartners?: string;
  whatsappDefaultMessage?: string;

  // Vídeos do YouTube (Configuráveis no Admin & Firebase)
  videoHomeUrl?: string;
  videoHomeTitle?: string;
  videoHomeDesc?: string;

  videoManuaisUrl?: string;
  videoManuaisTitle?: string;
  videoManuaisDesc?: string;

  videoParceirosUrl?: string;
  videoParceirosTitle?: string;
  videoParceirosDesc?: string;

  videoAgtUrl?: string;
  videoAgtTitle?: string;
  videoAgtDesc?: string;

  videoHardwareUrl?: string;
  videoHardwareTitle?: string;
  videoHardwareDesc?: string;

  // Parâmetros Fiscais AGT
  agtDecretoRef?: string;
  saftSubmissionDeadlineDay?: number;

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

/**
 * Converte qualquer formato de URL do YouTube (watch, youtu.be, embed, shorts) para uma URL de embed segura e otimizada.
 */
export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Formatos:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1&autoplay=0`;
  }

  if (trimmed.includes('/embed/')) {
    return trimmed;
  }

  return null;
}

export const DEFAULT_PROVINCES: ProvinceStat[] = [
  { id: 'luanda', name: 'Luanda', capital: 'Luanda', activeClients: 420, certifiedPartners: 18, status: 'Ativo' },
  { id: 'benguela', name: 'Benguela', capital: 'Benguela', activeClients: 110, certifiedPartners: 6, status: 'Ativo' },
  { id: 'huambo', name: 'Huambo', capital: 'Huambo', activeClients: 75, certifiedPartners: 4, status: 'Ativo' },
  { id: 'huila', name: 'Huíla', capital: 'Lubango', activeClients: 68, certifiedPartners: 4, status: 'Ativo' },
  { id: 'cabinda', name: 'Cabinda', capital: 'Cabinda', activeClients: 45, certifiedPartners: 3, status: 'Ativo' },
  { id: 'cuanza-sul', name: 'Cuanza Sul', capital: 'Sumbe', activeClients: 32, certifiedPartners: 2, status: 'Ativo' },
  { id: 'uige', name: 'Uíge', capital: 'Uíge', activeClients: 28, certifiedPartners: 2, status: 'Ativo' },
  { id: 'namibe', name: 'Namibe', capital: 'Moçâmedes', activeClients: 24, certifiedPartners: 2, status: 'Ativo' },
  { id: 'malanje', name: 'Malanje', capital: 'Malanje', activeClients: 20, certifiedPartners: 2, status: 'Ativo' },
  { id: 'zaire', name: 'Zaire', capital: 'Mbanza Kongo', activeClients: 16, certifiedPartners: 1, status: 'Ativo' },
  { id: 'bie', name: 'Bié', capital: 'Cuito', activeClients: 15, certifiedPartners: 1, status: 'Ativo' },
  { id: 'moxico', name: 'Moxico', capital: 'Luena', activeClients: 12, certifiedPartners: 1, status: 'Ativo' },
  { id: 'lunda-norte', name: 'Lunda Norte', capital: 'Dundo', activeClients: 10, certifiedPartners: 1, status: 'Ativo' },
  { id: 'lunda-sul', name: 'Lunda Sul', capital: 'Saurimo', activeClients: 11, certifiedPartners: 1, status: 'Ativo' },
  { id: 'cunene', name: 'Cunene', capital: 'Ondjiva', activeClients: 9, certifiedPartners: 1, status: 'Ativo' },
  { id: 'cuanza-norte', name: 'Cuanza Norte', capital: 'Ndalatando', activeClients: 8, certifiedPartners: 1, status: 'Ativo' },
  { id: 'cuando-cubango', name: 'Cuando Cubango', capital: 'Menongue', activeClients: 7, certifiedPartners: 1, status: 'Em Expansão' },
  { id: 'bengo', name: 'Bengo', capital: 'Caxito', activeClients: 14, certifiedPartners: 1, status: 'Ativo' },
];

export const DEFAULT_PARTNER_LOGOS: PartnerBrandLogo[] = [];

export const DEFAULT_INVESTOR_SETTINGS: InvestorSettings = {
  title: 'Relações com Investidores & Governança',
  subtitle: 'Visual Software, Lda — Pioneirismo e Sustentabilidade Financeira em Software de Gestão em Angola',
  summary: 'A Visual Software é uma empresa 100% angolana de tecnologia focada em soluções críticas de faturação, automação fiscal AGT e ERP offline-first para empresas em todo o território nacional.',
  annualGrowth: '+128% ao ano',
  legalEntity: 'VISUAL SOFTWARE LIMITADA (NIF: 5417089123)',
  shareCapital: '150.000.000 Kz (Capital Integralmente Realizado)',
  auditedBy: 'Auditoria Fiscal Independente & Homologação AGT n.º 384/2024',
  contactEmail: 'investidores@kivora.ao',
};

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

  // Métricas do Sistema
  statCompaniesCount: 850,
  statTerminalsCount: 2400,
  statInvoicesCount: '+14.5M',
  statUptimePercent: '99.98%',
  statProvincesCount: 18,

  // Carrossel de Logos & Marcas
  partnerLogos: DEFAULT_PARTNER_LOGOS,

  // Informações de Investidores
  investorInfo: DEFAULT_INVESTOR_SETTINGS,

  // Cobertura por Províncias
  provincesCoverage: DEFAULT_PROVINCES,

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
  // Comunicados de Topo & Cookies
  announcementBarEnabled: false,
  announcementText: 'Conformidade integral com o Decreto Presidencial n.º 71/25 e novas regras fiscais da AGT 2026.',
  announcementLink: '/guia-agt',
  announcementBadge: 'DECRETO 71/25',
  cookieBannerEnabled: true,

  // Notificações & Webhook
  webhookUrl: '',
  notifyEmailLeads: 'comercial@kivora.ao',
  notifyEmailPartners: 'parceiros@kivora.ao',
  whatsappDefaultMessage: 'Olá! Gostaria de saber mais sobre o KIVORA ERP.',

  // Vídeos do YouTube (Configuráveis no Admin & Firebase)
  videoHomeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Link configurável no Admin
  videoHomeTitle: 'Conheça o KIVORA ERP em Ação',
  videoHomeDesc: 'Demonstração rápida da interface do POS, emissão com QR Code AGT e funcionamento 100% offline.',

  videoManuaisUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  videoManuaisTitle: 'Guia Rápido: Operação de Caixa & Fecho Z',
  videoManuaisDesc: 'Aprenda passo a passo como realizar a abertura de turno, registo de vendas por código de barras e emissão do relatório diário Z.',

  videoParceirosUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  videoParceirosTitle: 'Programa Oficial de Parceiros & Revendedores',
  videoParceirosDesc: 'Descubra como lucrar até 50% de margem com a distribuição e implantação do KIVORA ERP na sua província.',

  videoAgtUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  videoAgtTitle: 'Exigências do Decreto 71/25 & Faturação AGT',
  videoAgtDesc: 'Entenda os regimes de IVA (14% e 7%), a regra de anulação com Nota de Crédito e os prazos do SAF-T AO.',

  videoHardwareUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  videoHardwareTitle: 'Instalação Rápida de Impressoras Térmicas 80mm',
  videoHardwareDesc: 'Configuração plug-and-play de impressoras ESC/POS USB, gavetas elétricas RJ11 e leitores 2D.',

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

/**
 * Escuta em tempo real exclusivamente todas as empresas e parceiros
 * registados no Firebase Firestore (coleções 'companies', 'partners' e 'system_settings').
 */
export function subscribeAllRegisteredBrands(callback: (brands: PartnerBrandLogo[]) => void): () => void {
  let companiesList: PartnerBrandLogo[] = [];
  let partnersList: PartnerBrandLogo[] = [];
  let customList: PartnerBrandLogo[] = [];

  const emit = () => {
    const map = new Map<string, PartnerBrandLogo>();

    // 1. Marcas cadastradas explicitamente no painel admin
    customList.forEach((b) => {
      if (b.name && b.active !== false) {
        map.set(b.name.toLowerCase().trim(), b);
      }
    });

    // 2. Parceiros homologados no Firebase ('partners')
    partnersList.forEach((p) => {
      if (p.name && p.active !== false) {
        const key = p.name.toLowerCase().trim();
        if (!map.has(key) || !map.get(key)?.logoUrl) {
          map.set(key, p);
        }
      }
    });

    // 3. Empresas clientes no Firebase ('companies')
    companiesList.forEach((c) => {
      if (c.name && c.active !== false) {
        const key = c.name.toLowerCase().trim();
        if (!map.has(key) || !map.get(key)?.logoUrl) {
          map.set(key, c);
        }
      }
    });

    callback(Array.from(map.values()));
  };

  try {
    const unsubCompanies = onSnapshot(collection(db, 'companies'), (snap) => {
      companiesList = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          name: (d.name || d.razaoSocial || d.company_name || '').trim(),
          logoUrl: d.logoUrl || d.logo_url || d.logo || undefined,
          type: 'cliente' as const,
          sector: d.sector || d.ramoAtividade || undefined,
          province: d.province || d.city || d.provincia || d.address || undefined,
          active: d.status !== 'inactive',
        };
      }).filter((c) => c.name.length > 0);
      emit();
    }, (err) => {
      console.warn('Erro ao escutar companies no Firebase:', err);
    });

    const unsubPartners = onSnapshot(collection(db, 'partners'), (snap) => {
      partnersList = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        const partnerName = (d.empresa || d.company_name || d.name || d.nome || '').trim();
        return {
          id: docSnap.id,
          name: partnerName,
          logoUrl: d.logoUrl || d.logo_url || d.logo || undefined,
          type: 'parceiro' as const,
          sector: d.sector || d.tier || undefined,
          province: d.region || d.provincia || d.city || undefined,
          active: d.status === 'active' || d.status === 'approved' || d.status === 'homologado' || !d.status,
        };
      }).filter((p) => p.name.length > 0);
      emit();
    }, (err) => {
      console.warn('Erro ao escutar partners no Firebase:', err);
    });

    const unsubSettings = onSnapshot(doc(db, 'system_settings', 'company_info'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SystemCompanySettings;
        customList = (data.partnerLogos || []).filter((b) => b.active !== false);
      } else {
        customList = [];
      }
      emit();
    }, (err) => {
      console.warn('Erro ao escutar system_settings partnerLogos:', err);
    });

    return () => {
      unsubCompanies();
      unsubPartners();
      unsubSettings();
    };
  } catch (err) {
    console.warn('Erro subscribeAllRegisteredBrands:', err);
    return () => {};
  }
}

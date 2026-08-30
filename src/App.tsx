import { lazy, Suspense, useEffect, useState } from 'react';
import { subscribeSystemSettings, getCachedSystemSettings, SystemCompanySettings } from './services/systemSettingsService';
import WhatsAppButton from './components/WhatsAppButton';
import { CookieBanner } from './components/CookieBanner';
import { Header, PageId } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DemoModal } from './components/DemoModal';
import { KIVORA_MODULES } from './data/kivoraData';
import { KivoraModule, NewsPost } from './types/kivora';
import { getStoredSession } from './admin/services/authService';
import { useScrollReveal } from './hooks/useScrollReveal';

// Lazy loading for subpages & portals to minimize initial bundle size
const ModulosPage = lazy(() => import('./pages/ModulosPage').then(m => ({ default: m.ModulosPage })));
const ModuloDetailPage = lazy(() => import('./pages/ModuloDetailPage').then(m => ({ default: m.ModuloDetailPage })));
const SolucoesPage = lazy(() => import('./pages/SolucoesPage').then(m => ({ default: m.SolucoesPage })));
const SetoresPage = lazy(() => import('./pages/SetoresPage').then(m => ({ default: m.SetoresPage })));
const DownloadPage = lazy(() => import('./pages/DownloadPage').then(m => ({ default: m.DownloadPage })));
const ParceirosPage = lazy(() => import('./pages/ParceirosPage').then(m => ({ default: m.ParceirosPage })));
const RecursosPage = lazy(() => import('./pages/RecursosPage').then(m => ({ default: m.RecursosPage })));
const FinanceiroPage = lazy(() => import('./pages/FinanceiroPage').then(m => ({ default: m.FinanceiroPage })));
const SuportePage = lazy(() => import('./pages/SuportePage').then(m => ({ default: m.SuportePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const NoticiasPage = lazy(() => import('./pages/NoticiasPage').then(m => ({ default: m.NoticiasPage })));
const NoticiaDetailPage = lazy(() => import('./pages/NoticiaDetailPage').then(m => ({ default: m.NoticiaDetailPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const HardwarePage = lazy(() => import('./pages/HardwarePage').then(m => ({ default: m.HardwarePage })));
const DiretorioParceirosPage = lazy(() => import('./pages/DiretorioParceirosPage').then(m => ({ default: m.DiretorioParceirosPage })));
const CandidaturaParceiroPage = lazy(() => import('./pages/CandidaturaParceiroPage').then(m => ({ default: m.CandidaturaParceiroPage })));
const ValidarLicencaPage = lazy(() => import('./pages/ValidarLicencaPage').then(m => ({ default: m.ValidarLicencaPage })));
const CasosSucessoPage = lazy(() => import('./pages/CasosSucessoPage').then(m => ({ default: m.CasosSucessoPage })));
const SegurancaPage = lazy(() => import('./pages/SegurancaPage').then(m => ({ default: m.SegurancaPage })));
const ComparativoPage = lazy(() => import('./pages/ComparativoPage').then(m => ({ default: m.ComparativoPage })));
const CalculadoraFiscalPage = lazy(() => import('./pages/CalculadoraFiscalPage').then(m => ({ default: m.CalculadoraFiscalPage })));
const LojaPage = lazy(() => import('./pages/LojaPage').then(m => ({ default: m.LojaPage })));
const InvestidoresPage = lazy(() => import('./pages/InvestidoresPage').then(m => ({ default: m.InvestidoresPage })));
const ProvinciasPage = lazy(() => import('./pages/ProvinciasPage').then(m => ({ default: m.ProvinciasPage })));
const GuiaAgtPage = lazy(() => import('./pages/GuiaAgtPage').then(m => ({ default: m.GuiaAgtPage })));
const ManuaisPage = lazy(() => import('./pages/ManuaisPage').then(m => ({ default: m.ManuaisPage })));
const SimuladorRoiPage = lazy(() => import('./pages/SimuladorRoiPage').then(m => ({ default: m.SimuladorRoiPage })));

// Portais
const AdminApp = lazy(() => import('./admin/AdminApp').then(m => ({ default: m.AdminApp })));
const ClientPortalApp = lazy(() => import('./client-portal/ClientPortalApp').then(m => ({ default: m.ClientPortalApp })));
const PartnerPortalApp = lazy(() => import('./partner-portal/PartnerPortalApp').then(m => ({ default: m.PartnerPortalApp })));

// Loading Component
const PageLoadingFallback = () => (
  <div role="status" aria-live="polite" className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FF6500] rounded-full animate-spin mb-3" />
    <p className="text-slate-600 font-medium text-xs">A carregar o KIVORA ERP...</p>
    <span className="sr-only">A carregar conteúdo</span>
  </div>
);

const PAGE_SEO_METADATA: Record<PageId, { title: string; desc: string; path: string }> = {
  home: {
    title: 'KIVORA | Software de Faturação Eletrónica AGT & Gestão Empresarial Angola',
    desc: 'Software desktop de faturação eletrónica certificado pela AGT em Angola (Decreto Presidencial n.º 71/25). Base de dados local, rede LAN e modo offline.',
    path: '/',
  },
  funcionalidades: {
    title: 'Funcionalidades KIVORA ERP | Faturação, POS, Stock & Finanças Angola',
    desc: 'Recursos avançados de gestão empresarial para Windows: emissão com QR Code AGT, controlo de caixas e multi-armazém.',
    path: '/modulos',
  },
  modulos: {
    title: 'Módulos KIVORA ERP | POS, Stock, Faturação, Salários & SAF-T AO',
    desc: 'Conheça os módulos integrados do KIVORA: POS Caixa Rápido, Faturação Certificada AGT, Gestão de Stock Multi-Armazém, Recursos Humanos & IRT 2026.',
    path: '/modulos',
  },
  'modulo-detalhe': {
    title: 'Módulo Kivora ERP | Software de Gestão Angola',
    desc: 'Detalhes operacionais e fiscais do módulo KIVORA ERP para empresas em Angola.',
    path: '/modulos',
  },
  faturacao: {
    title: 'Faturação Eletrónica AGT DS.120 | KIVORA ERP Angola',
    desc: 'Emissão certificada de faturas, faturas-recibo, notas de crédito e débito com assinatura digital RS256 e SAF-T AO.',
    path: '/modulos',
  },
  pos: {
    title: 'Software POS para Caixa e Balcão | KIVORA ERP Luanda',
    desc: 'Ponto de venda ágil com abertura e fecho de turno, relatório Z, integração com gavetas RJ11 e impressoras térmicas.',
    path: '/modulos',
  },
  stock: {
    title: 'Gestão de Stocks & Inventário Multi-Armazém | KIVORA ERP',
    desc: 'Controlo rigoroso de entradas, saídas, transferências, lotes, validade e alertas de rutura de stock.',
    path: '/modulos',
  },
  rh: {
    title: 'Processamento Salarial & IRT | KIVORA Recursos Humanos',
    desc: 'Cálculo automatizado de remunerações, horas extras, subsídios, INSS 3%/8% e tabelas de IRT Angola.',
    path: '/modulos',
  },
  contabilidade: {
    title: 'Contabilidade & Relatórios Financeiros | KIVORA ERP',
    desc: 'Balanços, demonstrações de resultados, fluxo de caixa e mapa de impostos em conformidade com a lei.',
    path: '/modulos',
  },
  solucoes: {
    title: 'Soluções de Gestão Empresarial por Setor | KIVORA',
    desc: 'Soluções sob medida para Retalho, Restauração, Supermercados, Farmácias, Clínicas, Oficinas e Prestadores de Serviços em Angola.',
    path: '/solucoes',
  },
  setores: {
    title: 'Setores de Atividade | KIVORA ERP Angola',
    desc: 'Descubra como o KIVORA ERP atende as necessidades operacionais e fiscais específicas do seu setor de negócio.',
    path: '/setores',
  },
  retalho: {
    title: 'Software de Faturação para Retalho e Lojas | KIVORA Angola',
    desc: 'Gestão comercial e ponto de venda para lojas de vestuário, eletrónica, materiais de construção e comércio geral.',
    path: '/setores',
  },
  restauracao: {
    title: 'Software POS para Restaurantes, Bares e Pastelarias | KIVORA',
    desc: 'Gestão de mesas, pedidos de cozinha, divisão de contas e controlo de consumo em restauração.',
    path: '/setores',
  },
  farmacia: {
    title: 'Software para Farmácias e Drogarias | KIVORA ERP Angola',
    desc: 'Controlo de medicamentos por lote, validade, substância ativa e conformidade com a regulamentação do MinSaúde.',
    path: '/setores',
  },
  servicos: {
    title: 'Software de Gestão para Prestadores de Serviços e Consultoria | KIVORA',
    desc: 'Emissão de faturas de avença, orçamentos, retenção na fonte 6.5% e controlo de honorários.',
    path: '/setores',
  },
  hardware: {
    title: 'Hardware & Periféricos para Ponto de Venda | Impressoras, Scanners e Terminais POS - KIVORA',
    desc: 'Catálogo de impressoras térmicas de 58mm/80mm, leitores de código de barras 1D/2D, terminais touch POS e balanças comerciais.',
    path: '/hardware',
  },
  'diretorio-parceiros': {
    title: 'Diretório Nacional de Parceiros & Técnicos em Angola | KIVORA ERP',
    desc: 'Encontre consultores e técnicos de software de faturação certificados em Luanda, Benguela, Huambo, Huíla, Cabinda e em todo o território nacional.',
    path: '/diretorio-parceiros',
  },
  planos: {
    title: 'Preços & Planos KIVORA ERP | Mensal, Anual e Vitalício em Kwanzas (AOA)',
    desc: 'Consulte a tabela oficial de preços e utilize o simulador de ROI multi-postos. Sem surpresas com câmbio em dólares.',
    path: '/precos',
  },
  download: {
    title: 'Baixar KIVORA ERP para Windows | Instalador Oficial & Chave de Teste 15 Dias',
    desc: 'Download do instalador oficial do KIVORA Desktop ERP para Windows 10/11 com chave de avaliação gratuita de 15 dias e verificação SHA-256.',
    path: '/download',
  },
  recursos: {
    title: 'Base de Conhecimento & Manuais Fiscais AGT | SAF-T AO, Faturação Eletrónica & Rede LAN - KIVORA',
    desc: 'Guias práticos com passo a passo: exportação do SAF-T AO, faturação eletrónica DS.120, fecho de caixa Z, isenções de IVA e IRT 2026.',
    path: '/recursos',
  },
  noticias: {
    title: 'Notícias, Legislação Fiscal AGT & Faturação Eletrónica Angola | KIVORA',
    desc: 'Fique a par das atualizações fiscais da AGT, Decreto Presidencial 71/25, prazos de conformidade e novidades do KIVORA ERP.',
    path: '/noticias',
  },
  'noticia-post': {
    title: 'Artigo & Notícia Fiscal AGT | KIVORA ERP',
    desc: 'Artigo informativo sobre conformidade fiscal, faturação eletrónica e gestão de empresas em Angola.',
    path: '/noticias',
  },
  suporte: {
    title: 'Central de Suporte & Atendimento Técnico KIVORA | Protocolos e Assistência',
    desc: 'Abra um chamado com número de protocolo oficial e receba suporte técnico qualificado em Luanda e em todo o país.',
    path: '/suporte',
  },
  sobre: {
    title: 'Sobre a KIVORA & Visual Software | Inovação em Software de Gestão em Angola',
    desc: 'Conheça a história da Visual Software e o compromisso do KIVORA ERP em impulsionar o comércio e a indústria em Angola.',
    path: '/sobre',
  },
  'validar-licenca': {
    title: 'Validador Oficial de Licenças de Software | KIVORA ERP',
    desc: 'Verifique a autenticidade e validade da sua licença KIVORA ERP emitida pela Visual Software.',
    path: '/validar',
  },
  parceiros: {
    title: 'Programa de Parceiros & Revendedores Autorizados | KIVORA ERP Angola',
    desc: 'Torne-se um parceiro credenciado KIVORA. Margens de até 60%, suporte nível 2 direto e carteira de crédito flexível.',
    path: '/parceiros',
  },
  'candidatura-parceiro': {
    title: 'Candidatura ao Programa de Parceiros e Revenda | KIVORA',
    desc: 'Submeta a sua candidatura online e comece a distribuir o software de faturação líder em Angola.',
    path: '/candidatura-parceiro',
  },
  termos: {
    title: 'Termos de Uso e Condições de Licenciamento | KIVORA ERP',
    desc: 'Termos legais de licenciamento de software, garantias e condições de suporte técnico da Visual Software.',
    path: '/termos',
  },
  privacidade: {
    title: 'Política de Privacidade e Proteção de Dados | KIVORA',
    desc: 'Como protegemos os seus dados empresariais e respeitamos a legislação angolana de privacidade.',
    path: '/privacidade',
  },
  login: {
    title: 'Acesso aos Portais KIVORA | Área de Cliente, Parceiro & Admin',
    desc: 'Portal de autenticação unificada para clientes, parceiros credenciados e administradores.',
    path: '/login',
  },
  admin: {
    title: 'Painel de Administração Central | KIVORA ERP',
    desc: 'Gestão executiva de licenças, empresas, parceiros e políticas.',
    path: '/admin',
  },
  'casos-sucesso': {
    title: 'Casos de Sucesso em Angola | Clientes e Empresas KIVORA ERP',
    desc: 'Conheça empresas reais em Luanda, Benguela, Huambo e em todo o país que transformaram as suas operações com o KIVORA ERP.',
    path: '/casos-sucesso',
  },
  seguranca: {
    title: 'Centro de Cibersegurança & Proteção de Dados Militar | KIVORA ERP',
    desc: 'Arquitetura criptográfica RSA-2048, base local cifrada SQLCipher AES-256 e conformidade integral com a legislação fiscal da AGT.',
    path: '/seguranca',
  },
  comparativo: {
    title: 'Comparativo de Mercado: KIVORA vs Softwares em Nuvem vs Dólar',
    desc: 'Veja a comparação transparente entre o KIVORA ERP, softwares SaaS internacionais e soluções locais.',
    path: '/comparativo',
  },
  'calculadora-fiscal': {
    title: 'Calculadora Fiscal de IRT & IVA Angola | Simulador Gratuito - KIVORA',
    desc: 'Simule salários líquidos, retenção na fonte de IRT 2026, INSS 3%/8% e IVA comercial segundo as tabelas da AGT.',
    path: '/calculadora-fiscal',
  },
  investidores: {
    title: 'Relações com Investidores & Governança Corporativa | KIVORA ERP & Visual Software',
    desc: 'Conheça a solidez financeira, modelo de negócio local, indicadores de crescimento e conformidade regulatória da Visual Software em Angola.',
    path: '/investidores',
  },
  provincias: {
    title: 'Presença nas 18 Províncias de Angola | Cobertura Nacional - KIVORA ERP',
    desc: 'Consulte os parceiros credenciados, postos instalados e capacidade de suporte presencial nas 18 províncias de Angola.',
    path: '/provincias',
  },
  'guia-agt': {
    title: 'Guia Oficial de Conformidade AGT & Decreto 71/25 | KIVORA ERP',
    desc: 'Guia de regras de faturação eletrónica, regimes de IVA, prazos de envio do SAF-T AO e checklist de auditoria tributária da AGT em Angola.',
    path: '/guia-agt',
  },
  manuais: {
    title: 'Central de Manuais & Tutoriais Rápidos | KIVORA ERP',
    desc: 'Base de conhecimento e manuais passo a passo para operadores de caixa, gerentes de stock, contabilistas e equipas de TI.',
    path: '/manuais',
  },
  'simulador-roi': {
    title: 'Simulador de Poupança & Retorno de Investimento (ROI) | KIVORA ERP',
    desc: 'Calcule em Kwanzas quanto a sua empresa pode poupar por ano ao eliminar quebras de stock e automatizar a conformidade fiscal da AGT.',
    path: '/simulador-roi',
  },
  loja: {
    title: 'Loja Oficial de Hardware POS & Impressoras Térmicas Angola | KIVORA',
    desc: 'Compre impressoras térmicas de 80mm, leitores de código de barras 2D, gavetas e terminais touch com 12 meses de garantia e entrega em Angola.',
    path: '/loja',
  },
  ferramentas: {
    title: 'Ferramentas Fiscais & Validador de Licenças Angola | KIVORA',
    desc: 'Calculadoras fiscais, simulador de salários, simulador de IVA e validador oficial de licenças AGT.',
    path: '/calculadora-fiscal',
  },
  'area-cliente': {
    title: 'Portal do Cliente | KIVORA ERP',
    desc: 'Acompanhamento de licenças, filiais, faturação e suporte.',
    path: '/area-cliente',
  },
  'area-parceiro': {
    title: 'Portal do Parceiro Credenciado | KIVORA ERP',
    desc: 'Emissão de licenças, gestão de clientes, carteira pré-paga e comissões.',
    path: '/area-parceiro',
  },
};

export function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [selectedModule, setSelectedModule] = useState<KivoraModule | null>(null);
  const [selectedNewsPost, setSelectedNewsPost] = useState<NewsPost | null>(null);
  const [selectedForSupport] = useState<string>('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoInitialModule, setDemoInitialModule] = useState<string>('');
  const [appSettings, setAppSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());

  // Subscrição em tempo real das settings (WhatsApp, telefone, etc.)
  useEffect(() => {
    const unsub = subscribeSystemSettings(setAppSettings);
    return unsub;
  }, []);

  // Ativação global de Scroll Reveal em todas as páginas
  useScrollReveal(undefined, [activePage, selectedModule, selectedNewsPost]);

  // ─── Sincronização Dinâmica de SEO & Metadados ──────────────────────────────
  useEffect(() => {
    const meta = PAGE_SEO_METADATA[activePage] || PAGE_SEO_METADATA.home;
    let pageTitle = meta.title;
    let pageDesc = meta.desc;

    if (activePage === 'modulo-detalhe' && selectedModule) {
      pageTitle = `${selectedModule.title} | KIVORA ERP Angola`;
      pageDesc = selectedModule.description || meta.desc;
    } else if (activePage === 'noticia-post' && selectedNewsPost) {
      pageTitle = `${selectedNewsPost.title} | KIVORA Notícias`;
      pageDesc = selectedNewsPost.excerpt || meta.desc;
    }

    document.title = pageTitle;

    // Atualizar meta description
    const metaDescTag = document.querySelector('meta[name="description"]');
    if (metaDescTag) metaDescTag.setAttribute('content', pageDesc);

    // Atualizar Open Graph
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) ogTitleTag.setAttribute('content', pageTitle);

    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) ogDescTag.setAttribute('content', pageDesc);

    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) ogUrlTag.setAttribute('content', `https://kivora.ao${meta.path}`);

    // Atualizar Canonical
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) canonicalTag.setAttribute('href', `https://kivora.ao${meta.path}`);
  }, [activePage, selectedModule, selectedNewsPost]);

  // Inicialização do Lenis Smooth Scrolling respeitando acessibilidade
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lenisInstance: any = null;
    import('lenis').then(({ default: Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
      });

      function raf(time: number) {
        lenisInstance?.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }).catch(() => {});

    return () => {
      if (lenisInstance) {
        lenisInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.remove();
        }, 500);
      }, 300);
    }
  }, []);

  const handleNavigatePage = (page: PageId, _sectionId?: string) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectModule = (moduleItem: KivoraModule) => {
    setSelectedModule(moduleItem);
    setActivePage('modulo-detalhe');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNewsPost = (post: NewsPost) => {
    setSelectedNewsPost(post);
    setActivePage('noticia-post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDemoModal = (moduleTitle?: string) => {
    setDemoInitialModule(moduleTitle || '');
    setIsDemoModalOpen(true);
  };

  // ─── Portais Executivos de Ecrã Completo com Guarda de Autenticação ─────────
  const currentSession = getStoredSession();

  if (activePage === 'admin') {
    if (!currentSession || currentSession.role !== 'admin') {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <LoginPage
            onBackToHome={() => handleNavigatePage('home')}
            onNavigatePage={handleNavigatePage}
          />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AdminApp onExitAdmin={() => handleNavigatePage('home')} />
      </Suspense>
    );
  }

  if (activePage === 'area-cliente') {
    if (!currentSession || currentSession.role !== 'cliente') {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <LoginPage
            onBackToHome={() => handleNavigatePage('home')}
            onNavigatePage={handleNavigatePage}
          />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <ClientPortalApp onLogout={() => handleNavigatePage('home')} />
      </Suspense>
    );
  }

  if (activePage === 'area-parceiro') {
    if (!currentSession || currentSession.role !== 'parceiro') {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <LoginPage
            onBackToHome={() => handleNavigatePage('home')}
            onNavigatePage={handleNavigatePage}
          />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <PartnerPortalApp onLogout={() => handleNavigatePage('home')} />
      </Suspense>
    );
  }

  if (activePage === 'login') {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LoginPage
          onBackToHome={() => handleNavigatePage('home')}
          onNavigatePage={handleNavigatePage}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#2563EB] selection:text-white relative font-sans">
      
      {/* Link Acessível de Salto para Conteúdo Principal (WCAG 2.1 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2.5 focus:bg-[#0B192C] focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
      >
        Saltar para o conteúdo principal
      </a>

      {/* Header Fixo com Suporte Multi-Página e Mega Menu */}
      <Header
        activePage={activePage}
        onNavigatePage={handleNavigatePage}
        onOpenLogin={() => handleNavigatePage('login')}
      />

      {/* Roteamento de Conteúdo de Páginas Kivora Desktop ERP */}
      <main id="main-content" className="flex-grow">
        <Suspense fallback={<PageLoadingFallback />}>
        {activePage === 'home' && (
          <HomePage
            onSelectModule={handleSelectModule}
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'funcionalidades' && (
          <ModulosPage
            onSelectModule={handleSelectModule}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'solucoes' && (
          <SolucoesPage
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'setores' && (
          <SetoresPage
            initialSector="retalho"
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'retalho' && (
          <SetoresPage
            initialSector="retalho"
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'restauracao' && (
          <SetoresPage
            initialSector="restauracao"
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'farmacia' && (
          <SetoresPage
            initialSector="farmacia"
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'servicos' && (
          <SetoresPage
            initialSector="servicos"
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'download' && (
          <DownloadPage
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'planos' && (
          <FinanceiroPage
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'parceiros' && (
          <ParceirosPage onNavigatePage={handleNavigatePage} />
        )}

        {activePage === 'diretorio-parceiros' && (
          <DiretorioParceirosPage
            onNavigatePage={handleNavigatePage}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'candidatura-parceiro' && (
          <CandidaturaParceiroPage
            onBack={() => handleNavigatePage('parceiros')}
            onNavigateHome={() => handleNavigatePage('home')}
          />
        )}

        {activePage === 'hardware' && (
          <HardwarePage
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'recursos' && (
          <RecursosPage onNavigatePage={handleNavigatePage} />
        )}

        {activePage === 'suporte' && (
          <SuportePage initialSubject={selectedForSupport} />
        )}

        {activePage === 'sobre' && (
          <AboutPage onOpenDemoModal={() => handleOpenDemoModal('Apresentação Institucional')} />
        )}

        {activePage === 'modulos' && (
          <ModulosPage
            onSelectModule={handleSelectModule}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'modulo-detalhe' && selectedModule && (
          <ModuloDetailPage
            module={selectedModule}
            onBack={() => handleNavigatePage('funcionalidades')}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'faturacao' && (
          <ModuloDetailPage
            module={KIVORA_MODULES.find((m) => m.id === 'faturacao-agt') || KIVORA_MODULES[0]}
            onBack={() => handleNavigatePage('funcionalidades')}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'pos' && (
          <ModuloDetailPage
            module={KIVORA_MODULES.find((m) => m.id === 'pos-multicaixa') || KIVORA_MODULES[1]}
            onBack={() => handleNavigatePage('funcionalidades')}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'stock' && (
          <ModuloDetailPage
            module={KIVORA_MODULES.find((m) => m.id === 'gestao-stock') || KIVORA_MODULES[3]}
            onBack={() => handleNavigatePage('funcionalidades')}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'rh' && (
          <ModuloDetailPage
            module={KIVORA_MODULES.find((m) => m.id === 'recursos-humanos') || KIVORA_MODULES[4]}
            onBack={() => handleNavigatePage('funcionalidades')}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'contabilidade' && (
          <ModuloDetailPage
            module={KIVORA_MODULES.find((m) => m.id === 'contabilidade-saft') || KIVORA_MODULES[5]}
            onBack={() => handleNavigatePage('funcionalidades')}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'noticias' && (
          <NoticiasPage onSelectPost={handleSelectNewsPost} />
        )}

        {activePage === 'noticia-post' && selectedNewsPost && (
          <NoticiaDetailPage
            post={selectedNewsPost}
            onBack={() => handleNavigatePage('noticias')}
          />
        )}

        {activePage === 'privacidade' && (
          <PrivacyPolicyPage onBack={() => handleNavigatePage('home')} />
        )}

        {activePage === 'termos' && (
          <TermsPage onBack={() => handleNavigatePage('home')} />
        )}

        {activePage === 'validar-licenca' && (
          <ValidarLicencaPage onBackToHome={() => handleNavigatePage('home')} />
        )}

        {activePage === 'casos-sucesso' && (
          <CasosSucessoPage
            onNavigatePage={handleNavigatePage}
            onOpenDemo={(sector) => handleOpenDemoModal(sector)}
          />
        )}

        {activePage === 'seguranca' && (
          <SegurancaPage onNavigatePage={handleNavigatePage} />
        )}

        {activePage === 'comparativo' && (
          <ComparativoPage onNavigatePage={handleNavigatePage} />
        )}

        {activePage === 'calculadora-fiscal' && (
          <CalculadoraFiscalPage onNavigatePage={handleNavigatePage} />
        )}

        {activePage === 'ferramentas' && (
          <CalculadoraFiscalPage onNavigatePage={handleNavigatePage} />
        )}

        {activePage === 'loja' && (
          <LojaPage
            onNavigatePage={handleNavigatePage}
            onOpenDemo={(item) => handleOpenDemoModal(item)}
          />
        )}

        {activePage === 'investidores' && (
          <InvestidoresPage
            onNavigatePage={handleNavigatePage}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'provincias' && (
          <ProvinciasPage
            onNavigatePage={handleNavigatePage}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'guia-agt' && (
          <GuiaAgtPage
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'manuais' && (
          <ManuaisPage
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'simulador-roi' && (
          <SimuladorRoiPage
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}
        </Suspense>
      </main>

      {/* Footer Global */}
      <Footer onNavigatePage={(page) => handleNavigatePage(page as PageId)} />

      {/* Modal de Pedido de Demonstração (z-[120]) */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        initialModule={demoInitialModule}
      />

      {/* Botão flutuante WhatsApp (configurável pelo Admin no Firebase) */}
      <WhatsAppButton
        phoneNumber={appSettings.phoneRaw || '244923456789'}
        message={appSettings.whatsappDefaultMessage || 'Olá! Gostaria de saber mais sobre o KIVORA ERP.'}
      />

      {/* Banner de Consentimento de Cookies & Privacidade (controlado pelo Admin) */}
      {appSettings.cookieBannerEnabled !== false && (
        <CookieBanner
          onNavigatePrivacy={() => handleNavigatePage('privacidade')}
        />
      )}

    </div>
  );
}

export default App;

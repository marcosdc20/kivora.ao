import { useEffect, useState } from 'react';
import { Header, PageId } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ModulosPage } from './pages/ModulosPage';
import { ModuloDetailPage } from './pages/ModuloDetailPage';
import { SolucoesPage } from './pages/SolucoesPage';
import { DownloadPage } from './pages/DownloadPage';
import { ParceirosPage } from './pages/ParceirosPage';
import { RecursosPage } from './pages/RecursosPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { SuportePage } from './pages/SuportePage';
import { NoticiasPage } from './pages/NoticiasPage';
import { NoticiaDetailPage } from './pages/NoticiaDetailPage';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { CandidaturaParceiroPage } from './pages/CandidaturaParceiroPage';
import { DemoModal } from './components/DemoModal';
import { AdminApp } from './admin/AdminApp';
import { ClientPortalApp } from './client-portal/ClientPortalApp';
import { PartnerPortalApp } from './partner-portal/PartnerPortalApp';
import { KIVORA_MODULES } from './data/kivoraData';
import { KivoraModule, NewsPost } from './types/kivora';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [selectedModule, setSelectedModule] = useState<KivoraModule | null>(null);
  const [selectedNewsPost, setSelectedNewsPost] = useState<NewsPost | null>(null);
  const [selectedForSupport] = useState<string>('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoInitialModule, setDemoInitialModule] = useState<string>('');

  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.remove();
        }, 400);
      }, 300);
    }
  }, []);

  const handleNavigatePage = (page: PageId, sectionId?: string) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (sectionId && page === 'home') {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const headerOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    }
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

  // ─── Portais Executivos de Ecrã Completo ─────────────────────────────────────

  if (activePage === 'admin') {
    return (
      <AdminApp onExitAdmin={() => handleNavigatePage('home')} />
    );
  }

  if (activePage === 'area-cliente') {
    return (
      <ClientPortalApp onLogout={() => handleNavigatePage('home')} />
    );
  }

  if (activePage === 'area-parceiro') {
    return (
      <PartnerPortalApp onLogout={() => handleNavigatePage('home')} />
    );
  }

  if (activePage === 'login') {
    return (
      <LoginPage
        onBackToHome={() => handleNavigatePage('home')}
        onNavigatePage={handleNavigatePage}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#2563EB] selection:text-white relative font-sans">
      
      {/* Header Fixo com Suporte Multi-Página */}
      <Header
        activePage={activePage}
        onNavigatePage={handleNavigatePage}
        onOpenLogin={() => handleNavigatePage('login')}
      />

      {/* Roteamento de Conteúdo de Páginas Kivora Desktop ERP */}
      <main className="flex-grow">
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

        {activePage === 'download' && (
          <DownloadPage
            onOpenDemoModal={handleOpenDemoModal}
            onNavigatePage={handleNavigatePage}
          />
        )}

        {activePage === 'planos' && (
          <FinanceiroPage onOpenDemoModal={handleOpenDemoModal} />
        )}

        {activePage === 'parceiros' && (
          <ParceirosPage onNavigatePage={handleNavigatePage} />
        )}

        {activePage === 'candidatura-parceiro' && (
          <CandidaturaParceiroPage
            onBack={() => handleNavigatePage('parceiros')}
            onNavigateHome={() => handleNavigatePage('home')}
          />
        )}

        {activePage === 'recursos' && (
          <RecursosPage onNavigatePage={handleNavigatePage} />
        )}

        {activePage === 'suporte' && (
          <SuportePage initialSubject={selectedForSupport} />
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
            onBack={() => handleNavigatePage('home')}
            onOpenDemoModal={handleOpenDemoModal}
          />
        )}

        {activePage === 'pos' && (
          <ModuloDetailPage
            module={KIVORA_MODULES.find((m) => m.id === 'pos-multicaixa') || KIVORA_MODULES[1]}
            onBack={() => handleNavigatePage('home')}
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
      </main>

      {/* Footer Global */}
      <Footer onNavigatePage={(page) => handleNavigatePage(page as PageId)} />

      {/* Modal de Pedido de Demonstração (z-[120]) */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        initialModule={demoInitialModule}
      />

    </div>
  );
}

export default App;

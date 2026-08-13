import { useEffect, useState } from 'react';
import { Header, PageId } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { TeamPage } from './pages/TeamPage';
import { AlunosPage } from './pages/AlunosPage';
import { ModulosPage } from './pages/ModulosPage';
import { ModuloDetailPage } from './pages/ModuloDetailPage';
import { TurmasPage } from './pages/TurmasPage';
import { NoticiasPage } from './pages/NoticiasPage';
import { NoticiaDetailPage } from './pages/NoticiaDetailPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { SuportePage } from './pages/SuportePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { AlunoModal } from './components/AlunoModal';
import { MatriculaModal } from './components/MatriculaModal';
import { MODULES_DATA } from './data/school';
import { Student, SchoolModule, NewsPost } from './types/school';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedModule, setSelectedModule] = useState<SchoolModule | null>(null);
  const [selectedNewsPost, setSelectedNewsPost] = useState<NewsPost | null>(null);
  const [selectedForSupport, setSelectedForSupport] = useState<string>('');
  const [isMatriculaOpen, setIsMatriculaOpen] = useState<boolean>(false);

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

  const handleSelectModuleById = (moduleId: string) => {
    const found = MODULES_DATA.find((m) => m.id === moduleId);
    if (found) {
      setSelectedModule(found);
      setActivePage('modulo-detalhe');
    } else {
      handleNavigatePage('modulos');
    }
  };

  const handleSelectModule = (moduleItem: SchoolModule) => {
    setSelectedModule(moduleItem);
    setActivePage('modulo-detalhe');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNewsPost = (post: NewsPost) => {
    setSelectedNewsPost(post);
    setActivePage('noticia-post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSupportModal = (subject?: string) => {
    if (subject) {
      setSelectedForSupport(subject);
    }
    handleNavigatePage('suporte');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-brand-green selection:text-white relative">
      
      {/* Header / Navbar Fixo com Suporte Multi-Página */}
      <Header
        activePage={activePage}
        onNavigatePage={handleNavigatePage}
        onOpenSupportModal={() => handleOpenSupportModal('Acesso ao Sistema')}
      />

      {/* Roteamento de Conteúdo de Páginas Institucionais */}
      <main className="flex-grow">
        {activePage === 'home' && (
          <HomePage
            onSelectModule={handleSelectModuleById}
            onOpenMatricula={() => setIsMatriculaOpen(true)}
            onNavigateSection={(secId) => {
              if (secId === 'alunos') handleNavigatePage('alunos');
              else if (secId === 'modulos') handleNavigatePage('modulos');
              else if (secId === 'turmas') handleNavigatePage('turmas');
              else if (secId === 'suporte') handleNavigatePage('suporte');
              else if (secId === 'sobre-nos' || secId === 'sobre') handleNavigatePage('sobre');
            }}
          />
        )}

        {activePage === 'sobre' && (
          <AboutPage
            onOpenContact={() => handleOpenSupportModal('Informações sobre a Kivora')}
            onNavigateTeam={() => handleNavigatePage('equipe')}
          />
        )}

        {activePage === 'equipe' && (
          <TeamPage
            onBack={() => handleNavigatePage('sobre')}
            onOpenContact={() => handleOpenSupportModal('Candidatura Equipa Pedagógica')}
          />
        )}

        {activePage === 'alunos' && (
          <AlunosPage onSelectStudent={(student) => setSelectedStudent(student)} />
        )}

        {activePage === 'modulos' && (
          <ModulosPage
            onSelectModule={handleSelectModule}
            onOpenContact={() => handleOpenSupportModal('Demonstração Módulos')}
          />
        )}

        {activePage === 'modulo-detalhe' && selectedModule && (
          <ModuloDetailPage
            module={selectedModule}
            onBack={() => handleNavigatePage('modulos')}
            onOpenContact={() => handleOpenSupportModal(`Interesse no módulo: ${selectedModule.title}`)}
          />
        )}

        {activePage === 'turmas' && (
          <TurmasPage onOpenContact={() => handleOpenSupportModal('Criação de Turmas')} />
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

        {activePage === 'financeiro' && (
          <FinanceiroPage onOpenContact={() => handleOpenSupportModal('Contratação de Plano')} />
        )}

        {activePage === 'suporte' && (
          <SuportePage initialSubject={selectedForSupport} />
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

      {/* Modal de Detalhes do Aluno (z-[100]) */}
      <AlunoModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onOpenContactForm={(studentName) => handleOpenSupportModal(`Ficha do Aluno: ${studentName}`)}
      />

      {/* Modal de Simulação de Matrícula (z-[110]) */}
      <MatriculaModal
        isOpen={isMatriculaOpen}
        onClose={() => setIsMatriculaOpen(false)}
      />

    </div>
  );
}

export default App;

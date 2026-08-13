import React, { useState, useEffect } from 'react';
import { Menu, X, Download, User, ChevronRight } from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';

export type PageId =
  | 'home'
  | 'funcionalidades'
  | 'solucoes'
  | 'planos'
  | 'parceiros'
  | 'recursos'
  | 'suporte'
  | 'download'
  | 'login'
  | 'area-cliente'
  | 'area-parceiro'
  | 'modulos'
  | 'modulo-detalhe'
  | 'faturacao'
  | 'pos'
  | 'sobre'
  | 'noticias'
  | 'noticia-post'
  | 'privacidade'
  | 'termos';

interface HeaderProps {
  activePage?: PageId;
  onNavigatePage?: (page: PageId, sectionId?: string) => void;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage = 'home',
  onNavigatePage,
  onOpenLogin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { name: string; page: PageId; sectionId?: string }[] = [
    { name: 'Início', page: 'home' },
    { name: 'Funcionalidades', page: 'funcionalidades' },
    { name: 'Soluções', page: 'solucoes' },
    { name: 'Licenças', page: 'planos' },
    { name: 'Parceiros', page: 'parceiros' },
    { name: 'Recursos', page: 'recursos' },
    { name: 'Suporte', page: 'suporte' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, page: PageId, sectionId?: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (onNavigatePage) {
      onNavigatePage(page, sectionId);
    } else if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
        isScrolled ? 'border-slate-200 shadow-sm py-2.5' : 'border-slate-100 py-3.5'
      }`}
    >
      {/* Scroll Progress Bar at top of navbar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent">
        <div
          className="h-full bg-blue-600 transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">

          {/* Brand Logo Kivora */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="flex items-center group cursor-pointer focus:outline-none"
            aria-label="Kivora Início"
          >
            <KivoraLogo size="md" useOfficialImage={true} />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = activePage === link.page;
              return (
                <a
                  key={link.name}
                  href={`#${link.page}`}
                  onClick={(e) => handleNavClick(e, link.page, link.sectionId)}
                  className={`text-[13px] font-medium transition-all duration-150 relative py-1 px-1 ${
                    isActive
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full animate-fadeIn" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else if (onNavigatePage) onNavigatePage('login');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200/80 active:scale-98"
            >
              <User className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
              <span>Iniciar sessão</span>
            </button>

            <button
              onClick={() => {
                if (onNavigatePage) onNavigatePage('download');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 hover:shadow active:scale-98"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Baixar KIVORA</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => {
                if (onNavigatePage) onNavigatePage('download');
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Baixar</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-800 hover:text-blue-600 focus:outline-none rounded-lg"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.75} /> : <Menu className="w-6 h-6" strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-5 space-y-4 text-slate-800 animate-fadeIn">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = activePage === link.page;
              return (
                <a
                  key={link.name}
                  href={`#${link.page}`}
                  onClick={(e) => handleNavClick(e, link.page, link.sectionId)}
                  className={`text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  )}
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenLogin) onOpenLogin();
                  else if (onNavigatePage) onNavigatePage('login');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-center py-2.5 rounded-xl text-xs border border-slate-200"
              >
                <span>Iniciar sessão</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigatePage) onNavigatePage('download');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Baixar KIVORA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, ArrowRight, GraduationCap } from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';
import { SCHOOL_INFO } from '../data/school';

export type PageId =
  | 'home'
  | 'sobre'
  | 'equipe'
  | 'alunos'
  | 'modulos'
  | 'modulo-detalhe'
  | 'turmas'
  | 'noticias'
  | 'noticia-post'
  | 'financeiro'
  | 'suporte'
  | 'login'
  | 'privacidade'
  | 'termos';

interface HeaderProps {
  activePage?: PageId;
  onNavigatePage?: (page: PageId, sectionId?: string) => void;
  onOpenLogin?: () => void;
  onOpenSupportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage = 'home',
  onNavigatePage,
  onOpenLogin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { name: string; page: PageId; sectionId?: string }[] = [
    { name: 'Início', page: 'home', sectionId: 'inicio' },
    { name: 'Sobre', page: 'sobre', sectionId: 'sobre-nos' },
    { name: 'Alunos', page: 'alunos', sectionId: 'alunos' },
    { name: 'Módulos', page: 'modulos', sectionId: 'modulos' },
    { name: 'Turmas', page: 'turmas', sectionId: 'turmas' },
    { name: 'Equipa', page: 'equipe' },
    { name: 'Notícias', page: 'noticias' },
    { name: 'Financeiro', page: 'financeiro' },
    { name: 'Suporte', page: 'suporte', sectionId: 'suporte' },
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
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 transition-all duration-300 ${
        isScrolled ? 'shadow-md py-2.5' : 'shadow-header py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo Kivora */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="flex items-center group cursor-pointer"
          >
            <KivoraLogo size="md" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = activePage === link.page;
              return (
                <a
                  key={link.name}
                  href={`#${link.page}`}
                  onClick={(e) => handleNavClick(e, link.page, link.sectionId)}
                  className={`text-sm font-bold transition-all duration-200 relative py-1 ${
                    isActive
                      ? 'text-brand-blue font-extrabold'
                      : 'text-gray-700 hover:text-brand-blue'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-full animate-fadeIn" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Area: Phone & CTA Button */}
          <div className="hidden lg:flex items-center space-x-5">
            <a
              href={`tel:${SCHOOL_INFO.phoneRaw}`}
              className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-brand-blue transition-colors"
            >
              <Phone className="w-4 h-4 text-brand-blue" />
              <span>{SCHOOL_INFO.phoneDisplay}</span>
            </a>

            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else if (onNavigatePage) onNavigatePage('login');
              }}
              className="bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-extrabold px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-brand-amber" />
              <span>Acessar Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <a
              href={`tel:${SCHOOL_INFO.phoneRaw}`}
              className="p-2 text-brand-green hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Ligar"
            >
              <Phone className="w-5 h-5" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-brand-green focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-xl px-6 pt-4 pb-8 space-y-4 animate-fadeIn z-50 text-brand-dark">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = activePage === link.page;
              return (
                <a
                  key={link.name}
                  href={`#${link.page}`}
                  onClick={(e) => handleNavClick(e, link.page, link.sectionId)}
                  className={`text-base font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-brand-green-light text-brand-green font-extrabold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-brand-green'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-brand-green" />}
                </a>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <a
              href={`tel:${SCHOOL_INFO.phoneRaw}`}
              className="flex items-center gap-3 text-base font-bold text-gray-800 py-2 px-4 rounded-lg bg-gray-50"
            >
              <Phone className="w-5 h-5 text-brand-green" />
              <span>{SCHOOL_INFO.phoneDisplay}</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenLogin) onOpenLogin();
                else if (onNavigatePage) onNavigatePage('login');
              }}
              className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-extrabold text-center py-3.5 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Acessar Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

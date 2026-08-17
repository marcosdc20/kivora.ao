import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Download, User, ChevronDown,
  FileCheck, ShoppingCart, Boxes, Users,
  ShieldCheck, Server, Utensils, Pill,
  Briefcase, Calculator, Key, CreditCard,
  Award, BookOpen, Newspaper,
  Building2, ChevronRight, HelpCircle,
  ShoppingBag, Printer, ScanLine, Monitor
} from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';

export type PageId =
  | 'home'
  | 'funcionalidades'
  | 'solucoes'
  | 'planos'
  | 'ferramentas'
  | 'loja'
  | 'parceiros'
  | 'diretorio-parceiros'
  | 'recursos'
  | 'hardware'
  | 'suporte'
  | 'download'
  | 'login'
  | 'area-cliente'
  | 'area-parceiro'
  | 'modulos'
  | 'modulo-detalhe'
  | 'faturacao'
  | 'pos'
  | 'stock'
  | 'rh'
  | 'contabilidade'
  | 'setores'
  | 'retalho'
  | 'restauracao'
  | 'farmacia'
  | 'servicos'
  | 'sobre'
  | 'noticias'
  | 'noticia-post'
  | 'privacidade'
  | 'termos'
  | 'candidatura-parceiro'
  | 'validar-licenca'
  | 'casos-sucesso'
  | 'seguranca'
  | 'comparativo'
  | 'calculadora-fiscal'
  | 'admin';

interface HeaderProps {
  activePage?: PageId;
  onNavigatePage?: (page: PageId, sectionId?: string) => void;
  onOpenLogin?: () => void;
}

interface DropdownItem {
  name: string;
  page: PageId;
  icon?: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  id: string;
  name: string;
  mainPage: PageId;
  items?: DropdownItem[];
  footerLink?: { label: string; page: PageId };
}

export const Header: React.FC<HeaderProps> = ({
  activePage = 'home',
  onNavigatePage,
  onOpenLogin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (groupId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(groupId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const navGroups: NavGroup[] = [
    {
      id: 'modulos',
      name: 'Módulos',
      mainPage: 'funcionalidades',
      items: [
        { name: 'Faturação Eletrónica AGT', page: 'faturacao', icon: <FileCheck className="w-4 h-4" /> },
        { name: 'Ponto de Venda (POS)', page: 'pos', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Stock & Armazéns', page: 'stock', icon: <Boxes className="w-4 h-4" /> },
        { name: 'Recursos Humanos & IRT', page: 'rh', icon: <Users className="w-4 h-4" /> },
        { name: 'Contabilidade & SAF-T AO', page: 'contabilidade', icon: <ShieldCheck className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Ver todos os módulos', page: 'funcionalidades' }
    },
    {
      id: 'solucoes',
      name: 'Soluções',
      mainPage: 'solucoes',
      items: [
        { name: 'Arquitetura Local (LAN)', page: 'solucoes', icon: <Server className="w-4 h-4" /> },
        { name: 'Casos de Sucesso em Angola', page: 'casos-sucesso', icon: <Award className="w-4 h-4 text-emerald-600" />, badge: 'Clientes' },
        { name: 'Retalho & Supermercados', page: 'retalho', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Restauração & Bares', page: 'restauracao', icon: <Utensils className="w-4 h-4" /> },
        { name: 'Farmácias & Saúde', page: 'farmacia', icon: <Pill className="w-4 h-4" /> },
        { name: 'Prestação de Serviços', page: 'servicos', icon: <Briefcase className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Ver todos os setores', page: 'setores' }
    },
    {
      id: 'planos',
      name: 'Preços',
      mainPage: 'planos',
      items: [
        { name: 'Planos & Tabela de Preços', page: 'planos', icon: <CreditCard className="w-4 h-4" /> },
        { name: 'Simulador de Postos LAN', page: 'planos', icon: <Calculator className="w-4 h-4" /> },
        { name: 'Comparativo vs Nuvem / Dólar', page: 'comparativo', icon: <Boxes className="w-4 h-4 text-blue-600" />, badge: 'Novo' },
      ]
    },
    {
      id: 'ferramentas',
      name: 'Ferramentas',
      mainPage: 'calculadora-fiscal',
      items: [
        { name: 'Calculadora Fiscal IRT & IVA', page: 'calculadora-fiscal', icon: <Calculator className="w-4 h-4 text-emerald-600" />, badge: 'Grátis' },
        { name: 'Validar Licença Oficial AGT', page: 'validar-licenca', icon: <Key className="w-4 h-4 text-blue-600" /> },
        { name: 'Hardware & Impressoras', page: 'hardware', icon: <Server className="w-4 h-4" /> },
      ]
    },
    {
      id: 'loja',
      name: 'Loja',
      mainPage: 'loja',
      items: [
        { name: 'Loja Oficial de Equipamentos', page: 'loja', icon: <ShoppingBag className="w-4 h-4 text-amber-500" />, badge: 'Oficial' },
        { name: 'Kits Completos de Caixa POS', page: 'loja', icon: <Boxes className="w-4 h-4" /> },
        { name: 'Impressoras Térmicas 80mm', page: 'loja', icon: <Printer className="w-4 h-4" /> },
        { name: 'Leitores de Código & QR', page: 'loja', icon: <ScanLine className="w-4 h-4" /> },
        { name: 'Terminais Touch POS', page: 'loja', icon: <Monitor className="w-4 h-4" /> },
      ]
    },
    {
      id: 'parceiros',
      name: 'Parceiros',
      mainPage: 'parceiros',
      items: [
        { name: 'Programa de Distribuidores', page: 'parceiros', icon: <Award className="w-4 h-4" /> },
        { name: 'Diretório Nacional de Técnicos', page: 'diretorio-parceiros', icon: <Building2 className="w-4 h-4" /> },
        { name: 'Candidatura de Parceiro', page: 'candidatura-parceiro', icon: <FileCheck className="w-4 h-4" /> },
      ]
    },
    {
      id: 'recursos',
      name: 'Recursos',
      mainPage: 'recursos',
      items: [
        { name: 'Centro de Cibersegurança', page: 'seguranca', icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />, badge: 'Militar' },
        { name: 'Manuais & Legislação AGT', page: 'recursos', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'Notícias do Setor Fiscal', page: 'noticias', icon: <Newspaper className="w-4 h-4" /> },
        { name: 'Centro de Downloads', page: 'download', icon: <Download className="w-4 h-4" /> },
      ]
    },
    {
      id: 'suporte',
      name: 'Suporte',
      mainPage: 'suporte',
      items: [
        { name: 'Central de Chamados & FAQ', page: 'suporte', icon: <HelpCircle className="w-4 h-4" /> },
        { name: 'Sobre a Visual Software', page: 'sobre', icon: <Building2 className="w-4 h-4" /> },
      ]
    }
  ];

  const handleNavClick = (page: PageId, sectionId?: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);

    if (onNavigatePage) {
      onNavigatePage(page, sectionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-200 border-b print:hidden ${
        isScrolled ? 'border-slate-200 shadow-sm py-2' : 'border-slate-100 py-2.5 sm:py-3'
      }`}
    >
      {/* Scroll Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent">
        <div
          className="h-full bg-blue-600 transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[50px] sm:min-h-[56px]">

          {/* Brand Logo Kivora */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
            className="flex items-center group cursor-pointer focus:outline-none shrink-0"
            aria-label="Kivora Início"
          >
            <KivoraLogo size="md" useOfficialImage={true} />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
            
            {/* Início */}
            <a
              href="#home"
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
              className={`whitespace-nowrap text-xs xl:text-[13px] font-semibold transition-all px-3 py-2 rounded-lg relative ${
                activePage === 'home'
                  ? 'text-blue-600 font-bold bg-blue-50/80'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Início
            </a>

            {/* Dropdown Groups */}
            {navGroups.map((group) => {
              const isOpen = activeDropdown === group.id;
              const isGroupActive = activePage === group.mainPage || (group.items && group.items.some(i => i.page === activePage));

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(group.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => handleNavClick(group.mainPage)}
                    className={`whitespace-nowrap text-xs xl:text-[13px] font-semibold transition-all px-2.5 xl:px-3 py-2 rounded-lg inline-flex items-center gap-1 cursor-pointer ${
                      isGroupActive || isOpen
                        ? 'text-blue-600 font-bold bg-blue-50/80'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{group.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                  </button>

                  {/* Standard Clean Website Dropdown Menu */}
                  {isOpen && group.items && (
                    <div 
                      className="absolute top-full left-0 mt-1 min-w-[240px] bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200/90 py-1.5 px-1.5 z-50 animate-fadeIn"
                    >
                      <div className="space-y-0.5">
                        {group.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleNavClick(item.page)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 transition-colors text-left group/item cursor-pointer whitespace-nowrap"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-slate-400 group-hover/item:text-blue-600 transition-colors shrink-0">
                                {item.icon}
                              </span>
                              <span>{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {group.footerLink && (
                        <div className="mt-1 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => handleNavClick(group.footerLink!.page)}
                            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50/60 transition-colors text-left cursor-pointer whitespace-nowrap"
                          >
                            <span>{group.footerLink.label}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else if (onNavigatePage) onNavigatePage('login');
              }}
              className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow shadow-amber-500/20 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              <span>Iniciar sessão</span>
            </button>

            <button
              onClick={() => handleNavClick('download')}
              className="whitespace-nowrap bg-[#1d4ed8] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow shadow-blue-500/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else if (onNavigatePage) onNavigatePage('login');
              }}
              className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span className="text-[11px]">Entrar</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Accordion */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-2xl px-4 py-4 space-y-2 text-slate-800 animate-fadeIn max-h-[85vh] overflow-y-auto">
          
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-sm font-bold py-2.5 px-3 rounded-xl transition-colors text-left ${
              activePage === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Início
          </button>

          {navGroups.map((group) => {
            const isExpanded = mobileExpandedGroup === group.id;

            return (
              <div key={group.id} className="border-b border-slate-100 pb-1.5">
                <button
                  onClick={() => setMobileExpandedGroup(isExpanded ? null : group.id)}
                  className="w-full flex items-center justify-between text-sm font-semibold py-2 px-3 rounded-xl text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{group.name}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {isExpanded && group.items && (
                  <div className="pl-2 pr-1 py-1 space-y-0.5 bg-slate-50 rounded-xl mt-1">
                    {group.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavClick(item.page)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white text-left transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-400 shrink-0">
                            {item.icon}
                          </span>
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                    {group.footerLink && (
                      <button
                        onClick={() => handleNavClick(group.footerLink!.page)}
                        className="w-full text-[11px] font-bold text-blue-600 p-2 text-left hover:underline flex items-center justify-between"
                      >
                        <span>{group.footerLink.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenLogin) onOpenLogin();
                  else if (onNavigatePage) onNavigatePage('login');
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-white" strokeWidth={2} />
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

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Download, User, ChevronDown, ChevronRight, ArrowRight,
  FileCheck, ShoppingCart, Boxes, Users, ShieldCheck,
  Calculator, Key, CreditCard, Award, BookOpen,
  Building2, HelpCircle, ShoppingBag, Printer, MapPin, Phone
} from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';
import { subscribeSystemSettings, DEFAULT_SETTINGS, SystemCompanySettings } from '../services/systemSettingsService';

export type PageId =
  | 'home'
  | 'funcionalidades'
  | 'certificacao-documentos'
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
  | 'investidores'
  | 'provincias'
  | 'guia-agt'
  | 'manuais'
  | 'simulador-roi'
  | 'admin';

interface HeaderProps {
  activePage?: PageId;
  onNavigatePage?: (page: PageId, sectionId?: string) => void;
  onOpenLogin?: () => void;
}

interface DropdownItem {
  name: string;
  desc?: string;
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
  const navRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [settings, setSettings] = useState<SystemCompanySettings>(DEFAULT_SETTINGS);
  const [dismissAnnouncement, setDismissAnnouncement] = useState(false);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          
          if (progressBarRef.current) {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
            progressBarRef.current.style.width = `${progress}%`;
          }
          ticking = false;
        });
        ticking = true;
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
      id: 'produtos',
      name: 'Módulos',
      mainPage: 'funcionalidades',
      items: [
        { name: 'Faturação Eletrónica AGT', desc: 'Assinatura digital RSA-SHA256 e QR Code fiscal', page: 'faturacao', icon: <FileCheck className="w-4 h-4" /> },
        { name: 'Ponto de Venda (POS)', desc: 'Faturação rápida de balcão, talões térmicos e fecho Z', page: 'pos', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Stock & Armazéns', desc: 'Inventário em tempo real, lotes, validades e multidepósito', page: 'stock', icon: <Boxes className="w-4 h-4" /> },
        { name: 'Recursos Humanos & IRT', desc: 'Processamento de salários, mapas INSS e tabelas de IRT', page: 'rh', icon: <Users className="w-4 h-4" /> },
        { name: 'Hardware & Periféricos', desc: 'Impressoras térmicas 80mm, leitores 2D e gavetas', page: 'hardware', icon: <Printer className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Ver todos os módulos e funcionalidades', page: 'funcionalidades' }
    },
    {
      id: 'planos',
      name: 'Preços & Planos',
      mainPage: 'planos',
      items: [
        { name: 'Tabela Oficial de Preços', desc: 'Planos mensais, anuais e vitalício em Kwanzas (AOA)', page: 'planos', icon: <CreditCard className="w-4 h-4" /> },
        { name: 'Loja de Equipamentos POS', desc: 'Impressoras térmicas, gavetas e terminais com garantia', page: 'loja', icon: <ShoppingBag className="w-4 h-4" /> },
        { name: 'Simulador de Postos LAN', desc: 'Calcule custos de caixas e postos adicionais de rede', page: 'simulador-roi', icon: <Calculator className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Consultar tabela completa de licenciamento', page: 'planos' }
    },
    {
      id: 'certificacao',
      name: 'Certificação e Documentos',
      mainPage: 'certificacao-documentos',
      items: [
        { name: 'Certificação Oficial AGT', desc: 'Software certificado pela AGT sob o n.º FE/387/AGT/2026', page: 'certificacao-documentos', icon: <Award className="w-4 h-4" /> },
        { name: 'Decreto Presidencial 71/25', desc: 'Regras fiscais, prazos e requisitos legais de faturação', page: 'guia-agt', icon: <FileCheck className="w-4 h-4" /> },
        { name: 'Validador de Licenças', desc: 'Verificação instantânea de autenticidade de licenças', page: 'validar-licenca', icon: <Key className="w-4 h-4" /> },
        { name: 'Regulamentos & Ficha Técnica', desc: 'Regulamento de revenda e declaração de segurança', page: 'certificacao-documentos', icon: <BookOpen className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Consultar todos os documentos e certificados', page: 'certificacao-documentos' }
    },
    {
      id: 'parceiros',
      name: 'Parceiros',
      mainPage: 'parceiros',
      items: [
        { name: 'Programa de Parceiros', desc: 'Margens de revenda até 60% e certificação técnica', page: 'parceiros', icon: <Award className="w-4 h-4" /> },
        { name: 'Candidatura de Parceiro', desc: 'Submeta o formulário oficial de credenciamento', page: 'candidatura-parceiro', icon: <Building2 className="w-4 h-4" /> },
        { name: 'Diretório de Consultores', desc: 'Encontre técnicos credenciados na sua região', page: 'diretorio-parceiros', icon: <MapPin className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Candidatar-se ao Programa de Parceiros', page: 'candidatura-parceiro' }
    },
    {
      id: 'suporte',
      name: 'Suporte',
      mainPage: 'suporte',
      items: [
        { name: 'Central de Suporte', desc: 'Abertura de chamados e assistência técnica em Luanda', page: 'suporte', icon: <HelpCircle className="w-4 h-4" /> },
        { name: 'Manuais & Tutoriais', desc: 'Guias práticos para operadores e administradores', page: 'manuais', icon: <BookOpen className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Falar com a equipa de apoio técnico', page: 'suporte' }
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
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl transition-all duration-200 border-b print:hidden ${
        isScrolled ? 'border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]' : 'border-slate-100 shadow-xs'
      }`}
    >
      {/* Top Utility Sub-Bar — Limpo, Elegante & Corporativo */}
      <div className="hidden md:block bg-[#0B1528] text-slate-300 border-b border-slate-800/80 py-2 px-4 sm:px-6 lg:px-8 text-[11px] font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#FF6500]" />
              <span>Sede em Luanda, Angola</span>
            </span>
            <span className="w-px h-3 bg-slate-700/80" />
            <span className="text-slate-400">
              Segunda a Sexta: <strong className="text-slate-200">08h00 – 18h00</strong>
            </span>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Certificação AGT: <strong className="text-white font-mono-num font-bold">FE/387/AGT/2026</strong></span>
            </span>

            <span className="w-px h-3 bg-slate-700/80" />

            <a
              href={settings.whatsappUrl || 'https://wa.me/244974855494'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF6500]" />
              <span>Linha Direta:</span>
              <span className="text-orange-400 hover:text-orange-300 font-bold font-mono-num">{settings.phoneDisplay || '+244 974 855 494'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Dynamic Announcement Bar from Firebase */}
      {settings.announcementBarEnabled && !dismissAnnouncement && (
        <div className="bg-gradient-to-r from-slate-900 via-[#0B1528] to-slate-900 text-white text-[11px] font-medium py-1.5 px-4 -mt-1 mb-1.5 transition-all flex items-center justify-between border-b border-orange-500/30">
          <div className="max-w-7xl mx-auto flex-1 flex items-center justify-center gap-2 text-center truncate">
            {settings.announcementBadge && (
              <span className="bg-[#FF6500] text-white font-black text-[9px] uppercase px-2 py-0.5 rounded tracking-wider shrink-0">
                {settings.announcementBadge}
              </span>
            )}
            <span className="truncate">{settings.announcementText}</span>
            {settings.announcementLink && (
              <button
                onClick={() => {
                  const link = settings.announcementLink?.trim();
                  if (link?.startsWith('http')) {
                    window.open(link, '_blank');
                  } else {
                    const clean = (link?.replace('/', '') || 'guia-agt') as PageId;
                    handleNavClick(clean);
                  }
                }}
                className="underline hover:text-orange-300 font-bold ml-1 inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Saber mais</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setDismissAnnouncement(true)}
            className="text-white/70 hover:text-white ml-2 shrink-0 p-0.5 cursor-pointer"
            aria-label="Fechar anúncio"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Scroll Progress Bar - Native Direct DOM Update */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent pointer-events-none">
        <div
          ref={progressBarRef}
          className="h-full bg-[#FF6500] will-change-transform"
          style={{ width: '0%' }}
        />
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all ${isScrolled ? 'py-1.5' : 'py-2 sm:py-2.5'}`}>
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
              className={`whitespace-nowrap text-xs xl:text-[13px] font-semibold transition-all px-3 py-2 rounded-xl relative ${
                activePage === 'home'
                  ? 'text-[#FF6500] font-bold bg-orange-50/90'
                  : 'text-slate-700 hover:text-[#FF6500] hover:bg-slate-50/90'
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
                    className={`whitespace-nowrap text-xs xl:text-[13px] font-semibold transition-all px-2.5 xl:px-3 py-2 rounded-xl inline-flex items-center gap-1 cursor-pointer group ${
                      isGroupActive || isOpen
                        ? 'text-[#FF6500] font-bold bg-orange-50/90'
                        : 'text-slate-700 hover:text-[#FF6500] hover:bg-slate-50/90'
                    }`}
                  >
                    <span>{group.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#FF6500]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  </button>

                  {/* Sleek Modern Dropdown */}
                  {isOpen && group.items && (
                    <div
                      className={`absolute top-full mt-2 bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(15,23,42,0.15)] border border-slate-200/90 p-3 z-[100] dropdown-premium ring-1 ring-black/[0.04] transition-all ${
                        group.items.length > 4
                          ? 'w-[520px] -left-12 sm:left-0'
                          : ['certificacao', 'parceiros', 'suporte', 'planos'].includes(group.id)
                          ? 'right-0 w-[340px]'
                          : 'left-0 w-[340px]'
                      }`}
                    >
                      {/* Group header */}
                      <div className="px-2 pt-0.5 pb-2 mb-1.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-display">
                          {group.name}
                        </span>
                        <span className="text-[10px] text-[#FF6500] font-bold bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-full">
                          Kivora Soft
                        </span>
                      </div>

                      <div className="space-y-1">
                        {group.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleNavClick(item.page)}
                            className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 active:bg-orange-50/50 transition-all text-left group/item cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6500] border border-orange-200/50 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-[#FF6500] group-hover/item:text-white transition-colors">
                              {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-slate-900 group-hover/item:text-[#FF6500] transition-colors leading-tight block font-display">
                                {item.name}
                              </span>
                              {item.desc && (
                                <span className="text-[11px] text-slate-500 leading-snug mt-0.5 block font-normal line-clamp-1">
                                  {item.desc}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Dropdown Footer CTA */}
                      {group.footerLink && (
                        <div className="mt-2 pt-2 border-t border-slate-100 px-1">
                          <button
                            onClick={() => handleNavClick(group.footerLink!.page)}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#FF6500] hover:text-[#EB5B00] hover:bg-orange-50/60 transition-colors text-left cursor-pointer group/ft font-display"
                          >
                            <span>{group.footerLink.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#FF6500] group-hover/ft:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Buttons — Rounded pill buttons matching reference layout */}
          <div className="hidden lg:flex items-center space-x-2.5 shrink-0">
            <a
              href="https://kivora.visualsoftware.dev/login"
              onClick={(e) => {
                if (onOpenLogin) {
                  e.preventDefault();
                  onOpenLogin();
                } else if (onNavigatePage) {
                  e.preventDefault();
                  onNavigatePage('login');
                }
              }}
              className="whitespace-nowrap bg-slate-100/80 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200/90 text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:-translate-y-0.5"
            >
              <User className="w-3.5 h-3.5 text-slate-700" strokeWidth={2.2} />
              <span>Portal / Entrar</span>
            </a>

            <button
              onClick={() => handleNavClick('download')}
              className="whitespace-nowrap bg-[#FF6500] hover:bg-[#EB5B00] active:scale-[0.98] text-white text-xs font-bold px-5 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar KIVORA</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else if (onNavigatePage) onNavigatePage('login');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-[11px]">Entrar</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? "Fechar menu principal de navegação" : "Abrir menu principal de navegação"}
              aria-expanded={mobileMenuOpen}
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
              activePage === 'home' ? 'bg-orange-50 text-[#FF6500]' : 'text-slate-800 hover:bg-slate-50'
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
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-[#FF6500]' : ''}`} />
                </button>

                {isExpanded && group.items && (
                  <div className="pl-2 pr-1 py-1 space-y-0.5 bg-slate-50 rounded-xl mt-1">
                    {group.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavClick(item.page)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#FF6500] hover:bg-white text-left transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-400 shrink-0">
                            {item.icon}
                          </span>
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </button>
                    ))}
                    {group.footerLink && (
                      <button
                        onClick={() => handleNavClick(group.footerLink!.page)}
                        className="w-full text-[11px] font-bold text-[#FF6500] p-2 text-left hover:underline flex items-center justify-between"
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

          <div className="pt-3 space-y-2 border-t border-slate-100 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://kivora.visualsoftware.dev/login"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (onOpenLogin) {
                    e.preventDefault();
                    onOpenLogin();
                  } else if (onNavigatePage) {
                    e.preventDefault();
                    onNavigatePage('login');
                  }
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-slate-700" strokeWidth={2} />
                <span>Portal / Entrar</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigatePage) onNavigatePage('download');
                }}
                className="w-full bg-[#FF6500] hover:bg-[#EB5B00] active:bg-[#C94A00] text-white font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm shadow-orange-500/20"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Baixar KIVORA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

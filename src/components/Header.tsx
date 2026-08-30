import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Download, User, ChevronDown, ChevronRight, ArrowRight,
  FileCheck, ShoppingCart, Boxes, Users, ShieldCheck, Utensils, Pill,
  Briefcase, Calculator, Key, CreditCard, Award, BookOpen, Newspaper,
  Building2, HelpCircle, ShoppingBag, Printer, MapPin, Shield
} from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';
import { subscribeSystemSettings, DEFAULT_SETTINGS, SystemCompanySettings } from '../services/systemSettingsService';

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [settings, setSettings] = useState<SystemCompanySettings>(DEFAULT_SETTINGS);
  const [dismissAnnouncement, setDismissAnnouncement] = useState(false);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

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
      id: 'produtos',
      name: 'Módulos',
      mainPage: 'funcionalidades',
      items: [
        { name: 'Faturação Eletrónica', desc: 'Assinatura digital RSA-SHA256 e QR Code fiscal', page: 'faturacao', icon: <FileCheck className="w-4 h-4" /> },
        { name: 'Ponto de Venda (POS)', desc: 'Faturação rápida de balcão, talões térmicos e fecho Z', page: 'pos', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Stock & Armazéns', desc: 'Inventário em tempo real, lotes, validades e multidepósito', page: 'stock', icon: <Boxes className="w-4 h-4" /> },
        { name: 'Recursos Humanos & IRT', desc: 'Processamento de salários, mapas INSS e tabelas de IRT', page: 'rh', icon: <Users className="w-4 h-4" /> },
        { name: 'Contabilidade & SAF-T AO', desc: 'Plano Geral de Contas PGC e ficheiro SAF-T mensal', page: 'contabilidade', icon: <ShieldCheck className="w-4 h-4" /> },
        { name: 'Hardware & Periféricos', desc: 'Impressoras térmicas 80mm, leitores 2D e terminais touch', page: 'hardware', icon: <Printer className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Ver todos os módulos e funcionalidades', page: 'funcionalidades' }
    },
    {
      id: 'setores',
      name: 'Setores',
      mainPage: 'setores',
      items: [
        { name: 'Retalho & Supermercados', desc: 'Caixas rápidos, pesagem direta e leitura de códigos de barras', page: 'retalho', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Restauração & Bares', desc: 'Gestão de mesas, pedidos de sala e impressão na cozinha', page: 'restauracao', icon: <Utensils className="w-4 h-4" /> },
        { name: 'Farmácias & Clínicas', desc: 'Controlo rigoroso de validades, lotes e dosagens', page: 'farmacia', icon: <Pill className="w-4 h-4" /> },
        { name: 'Prestação de Serviços', desc: 'Faturas-proforma, retenção na fonte 6.5% e avenças', page: 'servicos', icon: <Briefcase className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Ver soluções por setor de atividade', page: 'setores' }
    },
    {
      id: 'planos',
      name: 'Preços & Planos',
      mainPage: 'planos',
      items: [
        { name: 'Tabela Oficial de Preços', desc: 'Planos mensais, anuais e licença vitalícia', page: 'planos', icon: <CreditCard className="w-4 h-4" /> },
        { name: 'Simulador de Postos LAN', desc: 'Calcule custos de computadores e caixas adicionais', page: 'simulador-roi', icon: <Calculator className="w-4 h-4" /> },
        { name: 'Comparativo de Soluções', desc: 'Análise de custos e funcionamento offline', page: 'comparativo', icon: <Boxes className="w-4 h-4" /> },
        { name: 'Loja de Equipamentos POS', desc: 'Impressoras, gavetas e terminais com garantia', page: 'loja', icon: <ShoppingBag className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Consultar tabela completa de licenciamento', page: 'planos' }
    },
    {
      id: 'conformidade',
      name: 'Conformidade Fiscal',
      mainPage: 'guia-agt',
      items: [
        { name: 'Guia Decreto 71/25', desc: 'Regras fiscais, prazos de SAF-T e requisitos legais', page: 'guia-agt', icon: <FileCheck className="w-4 h-4" /> },
        { name: 'Calculadora Fiscal IRT & IVA', desc: 'Simulador gratuito de salários e retenções', page: 'calculadora-fiscal', icon: <Calculator className="w-4 h-4" /> },
        { name: 'Validador de Licença', desc: 'Verificação instantânea de autenticidade de licenças', page: 'validar-licenca', icon: <Key className="w-4 h-4" /> },
        { name: 'Manuais & Tutoriais', desc: 'Guias práticos para operadores e administradores', page: 'manuais', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'Notícias & Legislação', desc: 'Atualizações tributárias e decretos em Angola', page: 'noticias', icon: <Newspaper className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Aceder ao Guia Completo de Regras AGT', page: 'guia-agt' }
    },
    {
      id: 'empresa',
      name: 'Empresa & Parceiros',
      mainPage: 'sobre',
      items: [
        { name: 'Sobre a Kivora', desc: 'História, missão e equipa da Visual Software', page: 'sobre', icon: <Building2 className="w-4 h-4" /> },
        { name: 'Casos de Sucesso', desc: 'Empresas em Angola que utilizam o KIVORA', page: 'casos-sucesso', icon: <Award className="w-4 h-4" /> },
        { name: 'Segurança & Criptografia', desc: 'Base de dados local encriptada e proteção de dados', page: 'seguranca', icon: <Shield className="w-4 h-4" /> },
        { name: 'Presença Nacional', desc: 'Cobertura e assistência técnica nas 18 províncias', page: 'provincias', icon: <MapPin className="w-4 h-4" /> },
        { name: 'Programa de Parceiros', desc: 'Margens de revenda e certificação técnica', page: 'parceiros', icon: <Award className="w-4 h-4" /> },
        { name: 'Diretório de Consultores', desc: 'Encontre técnicos credenciados na sua região', page: 'diretorio-parceiros', icon: <Building2 className="w-4 h-4" /> },
        { name: 'Central de Suporte', desc: 'Atendimento presencial e remoto em Luanda', page: 'suporte', icon: <HelpCircle className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Conhecer mais sobre a Visual Software', page: 'sobre' }
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
      {/* Top Utility Sub-Bar — Azul Oficial Kivora & Executivo */}
      <div className="hidden md:block bg-[#1E40AF] text-blue-50 border-b border-blue-600/60 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-white font-semibold tracking-tight text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Certificação AGT • N.º FE/440/AGT/2026</span>
            </span>
            <span className="hidden xl:inline-block w-px h-3 bg-blue-400/40" />
            <button
              onClick={() => handleNavClick('validar-licenca')}
              className="text-blue-100 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer group"
            >
              <Key className="w-3 h-3 text-blue-200 group-hover:text-white transition-colors" />
              <span>Validador de Licença</span>
            </button>
            <button
              onClick={() => handleNavClick('guia-agt')}
              className="text-blue-100 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer group"
            >
              <FileCheck className="w-3 h-3 text-blue-200 group-hover:text-white transition-colors" />
              <span>Regras Fiscais 2026</span>
            </button>
            <button
              onClick={() => handleNavClick('candidatura-parceiro')}
              className="text-blue-100 hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer group"
            >
              <Award className="w-3 h-3 text-amber-300 group-hover:text-amber-200 transition-colors" />
              <span>Seja Parceiro</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden lg:flex items-center gap-1.5 text-blue-100">
              <MapPin className="w-3 h-3 text-blue-200" />
              <span>Sede em Luanda, Angola</span>
            </span>
            <span className="hidden lg:inline-block w-px h-3 bg-blue-400/40" />
            <a
              href={settings.whatsappUrl || 'https://wa.me/244974855494'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-medium px-3 py-0.5 rounded-full border border-white/25 hover:border-white/40 transition-all font-mono-num"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-blue-100">Suporte:</span>
              <span className="text-white font-semibold font-mono">{settings.phoneDisplay || '+244 974 855 494'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Dynamic Announcement Bar from Firebase */}
      {settings.announcementBarEnabled && !dismissAnnouncement && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-[11px] font-medium py-1.5 px-4 -mt-1 mb-1.5 transition-all flex items-center justify-between border-b border-blue-500/30">
          <div className="max-w-7xl mx-auto flex-1 flex items-center justify-center gap-2 text-center truncate">
            {settings.announcementBadge && (
              <span className="bg-white/20 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded tracking-wider shrink-0">
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
                className="underline hover:text-blue-100 font-bold ml-1 inline-flex items-center gap-1 shrink-0 cursor-pointer"
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

      {/* Scroll Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent">
        <div
          className="h-full bg-blue-600 transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
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
                  ? 'text-blue-600 font-bold bg-blue-50/90'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/90'
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
                        ? 'text-blue-600 font-bold bg-blue-50/90'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/90'
                    }`}
                  >
                    <span>{group.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  </button>

                  {/* Premium Mega Dropdown */}
                  {isOpen && group.items && (
                    <div
                      className={`absolute top-full mt-2.5 bg-white backdrop-blur-2xl rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/80 p-2 z-[100] dropdown-premium ring-1 ring-black/[0.04] ${
                        ['conformidade', 'empresa', 'planos'].includes(group.id)
                          ? 'right-0 w-[300px]'
                          : 'left-0 w-[300px]'
                      }`}
                    >
                      {/* Group header */}
                      <div className="px-3 pt-1 pb-2 mb-1 border-b border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {group.name}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        {group.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleNavClick(item.page)}
                            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-blue-50/60 transition-all text-left group/item cursor-pointer"
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            {/* Colored icon box */}
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                              {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-semibold text-slate-800 group-hover/item:text-blue-600 transition-colors leading-tight">
                                  {item.name}
                                </span>
                                <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-blue-500 group-hover/item:translate-x-0.5 transition-all shrink-0 ml-1" />
                              </div>
                              {item.desc && (
                                <span className="text-[11px] text-slate-400 leading-snug mt-0.5 block font-normal line-clamp-2">
                                  {item.desc}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Dropdown Footer CTA */}
                      {group.footerLink && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleNavClick(group.footerLink!.page)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-all text-left cursor-pointer group/ft border border-blue-100/80"
                          >
                            <span>{group.footerLink.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover/ft:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}


            {/* Direct Quick Link */}
            <button
              onClick={() => handleNavClick('loja')}
              className={`whitespace-nowrap text-xs xl:text-[13px] font-semibold transition-all px-2.5 xl:px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 ${
                activePage === 'loja'
                  ? 'text-blue-600 font-bold bg-blue-50/90'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/90'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
              <span>Loja POS</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else if (onNavigatePage) onNavigatePage('login');
              }}
              className="whitespace-nowrap bg-blue-50 hover:bg-blue-100/90 active:bg-blue-200/80 text-[#1E40AF] border border-blue-200/80 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm hover:-translate-y-0.5"
            >
              <User className="w-3.5 h-3.5 text-[#1E40AF]" strokeWidth={2.2} />
              <span>Portal / Entrar</span>
            </button>

            <button
              onClick={() => handleNavClick('download')}
              className="whitespace-nowrap bg-gradient-to-r from-[#FF6500] to-[#FF8C38] hover:from-[#EB5B00] hover:to-[#FF6500] active:scale-[0.98] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 hover:-translate-y-0.5 cursor-pointer"
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
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
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

          <button
            onClick={() => handleNavClick('loja')}
            className={`w-full text-sm font-semibold py-2 px-3 rounded-xl transition-colors text-left flex items-center justify-between ${
              activePage === 'loja' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Loja Hardware POS</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </button>

          <div className="pt-3 space-y-2 border-t border-slate-100 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenLogin) onOpenLogin();
                  else if (onNavigatePage) onNavigatePage('login');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-slate-700" strokeWidth={2} />
                <span>Portal / Entrar</span>
              </button>

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

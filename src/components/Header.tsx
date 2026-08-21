import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Download, User, ChevronDown,
  FileCheck, ShoppingCart, Boxes, Users,
  ShieldCheck, Utensils, Pill,
  Briefcase, Calculator, Key, CreditCard,
  Award, BookOpen, Newspaper,
  Building2, ChevronRight, HelpCircle,
  ShoppingBag, Printer,
  MapPin, ArrowRight
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
      name: 'Produtos & Módulos',
      mainPage: 'funcionalidades',
      items: [
        { name: 'Faturação Eletrónica AGT', desc: 'Motor fiscal DS.120 com assinatura RSA e QR Code', page: 'faturacao', icon: <FileCheck className="w-4 h-4" />, badge: 'Oficial' },
        { name: 'Ponto de Venda (POS)', desc: 'Faturação ágil de balcão, talões térmicos e fecho Z', page: 'pos', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Stock & Armazéns', desc: 'Inventário, controlo de lotes, validades e multidepósito', page: 'stock', icon: <Boxes className="w-4 h-4" /> },
        { name: 'Recursos Humanos & IRT', desc: 'Processamento salarial, INSS 3%/8% e tabelas IRT 2026', page: 'rh', icon: <Users className="w-4 h-4" /> },
        { name: 'Contabilidade & SAF-T AO', desc: 'Plano Geral PGC e ficheiro mensal auditado pela AGT', page: 'contabilidade', icon: <ShieldCheck className="w-4 h-4" /> },
        { name: 'Hardware & Periféricos', desc: 'Impressoras térmicas 80mm, leitores 2D e terminais touch', page: 'hardware', icon: <Printer className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Explorar todas as funcionalidades do sistema', page: 'funcionalidades' }
    },
    {
      id: 'setores',
      name: 'Setores',
      mainPage: 'setores',
      items: [
        { name: 'Retalho & Supermercados', desc: 'Caixas rápidos, pesagem direta e código de barras', page: 'retalho', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Restauração & Bares', desc: 'Gestão de mesas, pedidos e impressão em cozinha', page: 'restauracao', icon: <Utensils className="w-4 h-4" /> },
        { name: 'Farmácias & Saúde', desc: 'Controlo de validades, lotes e substâncias ativas', page: 'farmacia', icon: <Pill className="w-4 h-4" /> },
        { name: 'Prestação de Serviços', desc: 'Faturas-proforma, retenção 6.5% e orçamentos', page: 'servicos', icon: <Briefcase className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Ver visão geral de todos os setores de negócio', page: 'setores' }
    },
    {
      id: 'planos',
      name: 'Preços & Planos',
      mainPage: 'planos',
      items: [
        { name: 'Planos & Tabela de Preços', desc: 'Licenciamento transparente e fixado em Kwanzas', page: 'planos', icon: <CreditCard className="w-4 h-4" />, badge: 'Em Kwanzas' },
        { name: 'Simulador de Postos LAN & ROI', desc: 'Calcule terminais adicionais e poupança anual', page: 'simulador-roi', icon: <Calculator className="w-4 h-4" /> },
        { name: 'Comparativo vs Nuvem / Dólar', desc: 'Análise de custos reais sem risco cambial', page: 'comparativo', icon: <Boxes className="w-4 h-4" /> },
        { name: 'Loja Oficial de Equipamentos', desc: 'Hardware homologado com 12 meses de garantia', page: 'loja', icon: <ShoppingBag className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Consultar tabela completa de licenciamento', page: 'planos' }
    },
    {
      id: 'conformidade',
      name: 'Conformidade & AGT',
      mainPage: 'guia-agt',
      items: [
        { name: 'Guia Oficial de Conformidade AGT', desc: 'Decreto 71/25, prazos de SAF-T e auditoria', page: 'guia-agt', icon: <FileCheck className="w-4 h-4" />, badge: 'Decreto 71/25' },
        { name: 'Calculadora Fiscal IRT & IVA', desc: 'Simulador gratuito de salários e retenções fiscais', page: 'calculadora-fiscal', icon: <Calculator className="w-4 h-4" />, badge: 'Grátis' },
        { name: 'Validador Oficial de Licença', desc: 'Verificação instantânea de autenticidade AGT', page: 'validar-licenca', icon: <Key className="w-4 h-4" /> },
        { name: 'Central de Manuais & Tutoriais', desc: 'Guias práticos para caixas, gerentes e equipas de TI', page: 'manuais', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'Notícias & Legislação Tributária', desc: 'Atualizações fiscais e decretos em Angola', page: 'noticias', icon: <Newspaper className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Aceder ao Guia Completo de Regras AGT', page: 'guia-agt' }
    },
    {
      id: 'empresa',
      name: 'Empresa & Parceiros',
      mainPage: 'sobre',
      items: [
        { name: 'Sobre a Kivora & Visual Software', desc: 'Empresa angolana de tecnologia e inovação', page: 'sobre', icon: <Building2 className="w-4 h-4" /> },
        { name: 'Casos de Sucesso em Angola', desc: 'Empresas reais que confiam na nossa tecnologia', page: 'casos-sucesso', icon: <Award className="w-4 h-4" />, badge: 'Clientes' },
        { name: 'Centro de Cibersegurança', desc: 'Criptografia RSA-2048 e base local cifrada', page: 'seguranca', icon: <ShieldCheck className="w-4 h-4" /> },
        { name: 'Presença nas 18 Províncias', desc: 'Cobertura nacional e assistência presencial', page: 'provincias', icon: <MapPin className="w-4 h-4" /> },
        { name: 'Programa de Revendedores', desc: 'Margens de atacado e portal exclusivo 24/7', page: 'parceiros', icon: <Award className="w-4 h-4" /> },
        { name: 'Diretório Nacional de Técnicos', desc: 'Consulte consultores certificados em Angola', page: 'diretorio-parceiros', icon: <Building2 className="w-4 h-4" /> },
        { name: 'Central de Suporte & Contactos', desc: 'Apoio técnico presencial e remoto em Luanda', page: 'suporte', icon: <HelpCircle className="w-4 h-4" /> },
      ],
      footerLink: { label: 'Conhecer a história da Visual Software', page: 'sobre' }
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
        isScrolled ? 'border-slate-200 shadow-sm py-1.5' : 'border-slate-100 py-2 sm:py-2.5'
      }`}
    >
      {/* Top Utility Sub-Bar (Inspirada no estilo Registar.ao) */}
      <div className="hidden md:block bg-slate-50/90 border-b border-slate-200/60 -mt-2 sm:-mt-2.5 mb-1.5 py-1 px-4 text-[11px] text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Software Certificado pela AGT • Decreto n.º 71/25</span>
            </span>
            <button
              onClick={() => handleNavClick('noticias')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Newspaper className="w-3 h-3 text-slate-400" />
              <span>Notícias Fiscais</span>
            </button>
            <button
              onClick={() => handleNavClick('manuais')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span>Base de Conhecimento</span>
            </button>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => handleNavClick('suporte')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3 text-slate-400" />
              <span>Suporte & Chamados</span>
            </button>
            <a
              href={settings.whatsappUrl || 'https://wa.me/244923456789'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              <span>WhatsApp: {settings.phoneDisplay || '(+244) 923 456 789'}</span>
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

                  {/* Modern Enterprise Dropdown Menu (100% Solid White Card, Rich Info) */}
                  {isOpen && group.items && (
                    <div 
                      className={`absolute top-full mt-2 w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl shadow-slate-950/25 border border-slate-200 p-2 z-[100] animate-fadeIn ${
                        ['conformidade', 'empresa', 'planos'].includes(group.id)
                          ? 'right-0'
                          : 'left-0'
                      }`}
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <div className="space-y-1">
                        {group.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleNavClick(item.page)}
                            className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 active:bg-blue-50/80 transition-all text-left group/item cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 group-hover/item:bg-blue-50 group-hover/item:text-blue-600 flex items-center justify-center shrink-0 transition-all mt-0.5 [&_svg]:stroke-current">
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-slate-900 group-hover/item:text-blue-600 transition-colors truncate">
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.desc && (
                                <p className="text-[11px] text-slate-500 group-hover/item:text-slate-600 leading-snug line-clamp-1 mt-0.5 font-normal">
                                  {item.desc}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {group.footerLink && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                          <button
                            onClick={() => handleNavClick(group.footerLink!.page)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors text-left cursor-pointer"
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
              className="whitespace-nowrap bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-slate-700" strokeWidth={2} />
              <span>Portal / Entrar</span>
            </button>

            <button
              onClick={() => handleNavClick('download')}
              className="whitespace-nowrap bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow shadow-blue-500/20 cursor-pointer"
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
                className="w-full bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm shadow-blue-500/20"
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

import React, { useState, useEffect, useRef } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import {
  CheckCircle2, ArrowRight, Download, Shield, Wifi,
  Zap, Monitor, Laptop, Check, ShieldCheck,
  Award, Headphones, Building2, MapPin, TrendingUp,
  Search, ShoppingCart, ShoppingBag, Utensils, Pill,
  Briefcase, Boxes
} from 'lucide-react';
import { PageId } from '../components/Header';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings, subscribeAllRegisteredBrands,
  PartnerBrandLogo
} from '../services/systemSettingsService';

import { CardSpotlight } from '../components/effects/CardSpotlight';
import { SystemArchitectureFlow } from '../components/effects/SystemArchitectureFlow';
import { YouTubePlayer } from '../components/YouTubePlayer';

import posImg from '../assets/kivora/pc-pos-kivora.png';
import desktopImg from '../assets/kivora/pc-descktop-kivora.png';
import laptopImg from '../assets/kivora/pc-laptop-kivora.png';
import empresariaTabletImg from '../assets/kivora/jovem-empresaria-com-tablet.png';
import empresarioBoasVindasImg from '../assets/kivora/jovem-empresario-dado-boas-vindas.png';
import parceirosImg from '../assets/kivora/parceiros-kivora.png';
import executivosImg from '../assets/kivora/executivos-kivora.jpg';
import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';

interface HomePageProps {
  onSelectModule: (module: any) => void;
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

// Setores sugeridos para o Quick Finder com Ícones Oficiais Lucide (Sem Emojis)
const QUICK_SECTORS = [
  { id: 'retalho', label: 'Retalho & Lojas', icon: ShoppingBag, module: 'pos-multicaixa', price: '25.000 Kz / mês', planId: 'mensal' },
  { id: 'supermercado', label: 'Supermercados & Mercearias', icon: ShoppingCart, module: 'gestao-stock', price: '250.000 Kz / ano', planId: 'anual', popular: true },
  { id: 'restauracao', label: 'Restauração & Bares', icon: Utensils, module: 'pos-multicaixa', price: '250.000 Kz / ano', planId: 'anual' },
  { id: 'farmacia', label: 'Farmácias & Saúde', icon: Pill, module: 'faturacao-agt', price: '250.000 Kz / ano', planId: 'anual' },
  { id: 'servicos', label: 'Prestação de Serviços', icon: Briefcase, module: 'faturacao-agt', price: '25.000 Kz / mês', planId: 'mensal' },
  { id: 'materiais', label: 'Materiais de Construção', icon: Boxes, module: 'gestao-stock', price: '650.000 Kz / perpétuo', planId: 'vitalicio' },
];

// Contador animado progressivo baseado em IntersectionObserver
const AnimatedCounter: React.FC<{
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}> = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('pt-AO')}{suffix}
    </span>
  );
};

// Função para configurar as animações de scroll (IntersectionObserver nativo)
function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// Card de feature da homepage
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, delay = 0 }) => (
  <CardSpotlight
    data-reveal
    className="sr-init p-8 flex flex-col gap-4 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 group"
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-bold text-slate-950 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  </CardSpotlight>
);

// Etapa do fluxo de instalação
interface StepProps {
  num: string;
  title: string;
  desc: string;
  delay?: number;
}

const Step: React.FC<StepProps> = ({ num, title, desc, delay = 0 }) => (
  <div
    data-reveal
    className="sr-init flex flex-col items-center text-center group"
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-950 text-white font-mono-num font-black text-lg mb-4 shadow-sm group-hover:scale-105 group-hover:bg-[#1d4ed8] transition-all duration-300">
      {num}
    </div>
    <h4 className="text-sm font-extrabold text-slate-950 mb-1">{title}</h4>
    <p className="text-xs text-slate-600 leading-relaxed max-w-[160px]">{desc}</p>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  onOpenDemoModal,
  onNavigatePage,
}) => {
  useScrollReveal();
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [partnerLogos, setPartnerLogos] = useState<PartnerBrandLogo[]>([]);
  const [searchSector, setSearchSector] = useState<string>('');
  const [activeSector, setActiveSector] = useState(QUICK_SECTORS[0]);

  useEffect(() => {
    const unsubSettings = subscribeSystemSettings(setSettings);
    const unsubBrands = subscribeAllRegisteredBrands(setPartnerLogos);
    return () => {
      unsubSettings();
      unsubBrands();
    };
  }, []);

  // Filtragem dinâmica do setor pelo texto digitado
  const filteredSector = searchSector.trim()
    ? QUICK_SECTORS.find(s => s.label.toLowerCase().includes(searchSector.toLowerCase())) || activeSector
    : activeSector;

  return (
    <div className="bg-white text-slate-900">
      
      {/* ========== HERO — 3 slides full screen ========== */}
      <HeroCarousel
        onNavigatePage={onNavigatePage}
        onOpenDemoModal={onOpenDemoModal}
      />

      {/* ========== BARRA DE CONFIANÇA ========== */}
      <div data-reveal className="sr-init bg-slate-950 text-white py-5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <span className="text-white font-bold">Usado por empresas em Angola</span>
            <div className="flex flex-wrap items-center gap-8">
              <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} /> Certificado AGT</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} /> DS.120 Compliant</span>
              <span className="flex items-center gap-2"><Wifi className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} /> Funciona Offline</span>
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} /> IRT 2026 Incluído</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== LOCALIZADOR INTELIGENTE DE SOLUÇÕES FISCAIS POR SETOR ========== */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 mb-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-950/5">
          
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Homologação AGT por Ramo de Atividade</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Encontre a Solução KIVORA Ideal para a Sua Empresa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Descubra os módulos específicos, periféricos recomendados e conformidade legal para o seu setor em Angola.
            </p>
          </div>

          {/* Barra de Pesquisa com Input & Botão */}
          <div className="relative flex flex-col sm:flex-row items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <div className="flex items-center gap-3 flex-1 px-3 w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchSector}
                onChange={(e) => setSearchSector(e.target.value)}
                placeholder="ex: Supermercado, Restaurante, Farmácia, Loja de Roupas, Consultoria..."
                className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none py-2"
              />
            </div>
            <button
              onClick={() => onOpenDemoModal(filteredSector.label)}
              className="w-full sm:w-auto bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>Simular Implementação</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Chips de Seleção Rápida */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Setores Populares:</span>
            {QUICK_SECTORS.map((sector) => {
              const isSelected = filteredSector.id === sector.id;
              const SectorIcon = sector.icon;
              return (
                <button
                  key={sector.id}
                  onClick={() => {
                    setActiveSector(sector);
                    setSearchSector('');
                  }}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <SectorIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{sector.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cartão de Resultado Imediato */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3.5 text-center md:text-left">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-base sm:text-lg font-extrabold text-slate-950">
                      KIVORA ERP para {filteredSector.label}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      100% Homologado AGT
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Certificação DS.120 com QR Code, assinatura digital RS256, rede local e SAF-T AO mensal auditado.
                  </p>
                </div>
              </div>

              {/* Preço e Botão de Ação Direta */}
              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 shadow-xs flex items-center gap-1">
                  <span>{filteredSector.price}</span>
                </div>
                <button
                  onClick={() => onOpenDemoModal(`Adesão: ${filteredSector.label}`)}
                  className="bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Solicitar Proposta</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========== SEÇÃO DE PLANOS & MODALIDADES EM DESTAQUE ========== */}
      <section className="py-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Planos e Licenciamento em Kwanzas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Escolha a modalidade ideal para o número de postos de trabalho e caixas da sua empresa.
            </p>
          </div>
          <button
            onClick={() => onNavigatePage('planos')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Tabela Completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Mensal Standalone */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all text-center group">
            <div>
              <h4 className="text-lg font-black text-slate-950 mb-1">
                Mensal Standalone
              </h4>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-4">
                1 Posto de Trabalho
              </span>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 mb-4 text-xs font-bold text-slate-900">
                25.000,00 Kz / mês
              </div>
              <ul className="text-left text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Faturação com QR Code AGT</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> POS e Fecho de Caixa com Relatório Z</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Exportação SAF-T AO mensal</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigatePage('planos')}
              className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              Consultar Plano
            </button>
          </div>

          {/* Card 2: Anual Multi-Postos (Destaque Mais Popular) */}
          <div className="bg-white rounded-2xl border-2 border-blue-600 p-6 flex flex-col justify-between shadow-md relative text-center group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black text-[10px] uppercase px-3 py-0.5 rounded-full tracking-wider shadow-xs">
              Recomendado
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-950 mb-1">
                Anual Multi-Postos
              </h4>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-4">
                3 Postos em Rede LAN
              </span>
              <div className="bg-blue-50 border border-blue-200 rounded-xl py-2 px-3 mb-4 text-xs font-bold text-blue-900">
                250.000,00 Kz / ano
              </div>
              <ul className="text-left text-xs text-slate-700 space-y-2 mb-6 font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 3 Caixas / Servidor Local LAN</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Recursos Humanos & IRT 2026</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Suporte VIP & Formação Inicial</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenDemoModal('Licença Anual Multi-Postos')}
              className="w-full bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Aderir ao Plano Anual
            </button>
          </div>

          {/* Card 3: Vitalício Perpétuo */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all text-center group">
            <div>
              <h4 className="text-lg font-black text-slate-950 mb-1">
                Vitalício Perpétuo
              </h4>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-4">
                5 Postos Perpétuos
              </span>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 mb-4 text-xs font-bold text-slate-900">
                650.000,00 Kz / único
              </div>
              <ul className="text-left text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Sem anuidade ou mensalidades</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Todos os módulos desbloqueados</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Instalação e parametrização assistida</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenDemoModal('Licença Vitalícia Perpétua')}
              className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              Consultar Vitalício
            </button>
          </div>

          {/* Card 4: Kit POS Hardware */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all text-center group">
            <div>
              <h4 className="text-lg font-black text-slate-950 mb-1">
                Kits de Hardware POS
              </h4>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-4">
                Periféricos Homologados
              </span>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 mb-4 text-xs font-bold text-slate-900">
                Desde 185.000,00 Kz
              </div>
              <ul className="text-left text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Impressoras térmicas 80mm com corte</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Leitores 2D e gavetas metálicas RJ11</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 12 meses de garantia oficial em Luanda</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigatePage('loja')}
              className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              Ver Equipamentos
            </button>
          </div>

        </div>
      </section>

      {/* ========== CARROSSEL MARQUEE DE PARCEIROS & CLIENTES (APENAS REGISTADOS NO FIREBASE) ========== */}
      {partnerLogos.length > 0 && (
        <section className="py-12 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest block">
                Ecossistema Empresarial em Angola
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                Empresas & Parceiros Cadastrados no KIVORA
              </h3>
            </div>
            <button
              onClick={() => onNavigatePage('diretorio-parceiros')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Ver Diretório Nacional</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Marquee Container */}
          <div className="relative w-full overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee flex items-center gap-8 py-3">
              {[...partnerLogos, ...partnerLogos].map((partner, idx) => (
                <div
                  key={`${partner.id}-${idx}`}
                  className="flex flex-col items-center text-center gap-2 shrink-0 select-none group cursor-pointer"
                >
                  {/* Círculo do Logótipo */}
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center p-3.5 group-hover:border-blue-500 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                    {partner.logoUrl ? (
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-black text-sm sm:text-base transition-colors">
                        {partner.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Nome do Parceiro Por Baixo */}
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors max-w-[120px] sm:max-w-[140px] truncate block">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== NÚMEROS & IMPACTO COM ANIMAÇÃO DE CONTAGEM ========== */}
      <section className="py-20 bg-slate-950 text-white border-y border-slate-800 relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
          <div data-reveal className="sr-init text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              Impacto Real na Economia Angolana
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Os Números Que Comprovam a Nossa Liderança
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm lg:text-base leading-relaxed">
              Mais de 850 empresas, supermercados, farmácias e restaurantes operam diariamente com a garantia de conformidade fiscal e estabilidade offline do KIVORA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Empresas Ativas */}
            <div data-reveal className="sr-init bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center space-y-2 hover:border-blue-500/40 hover:scale-[1.02] transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white font-mono-num tracking-tight">
                <AnimatedCounter end={settings.statCompaniesCount || 850} prefix="+" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Empresas & Lojas Ativas</h4>
              <p className="text-[11px] text-slate-500">A faturar em estrita conformidade com a AGT</p>
            </div>

            {/* 2. Terminais LAN */}
            <div data-reveal className="sr-init bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center space-y-2 hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-300" style={{ transitionDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Monitor className="w-6 h-6" />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono-num tracking-tight">
                <AnimatedCounter end={settings.statTerminalsCount || 2400} prefix="+" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Terminais POS Instalados</h4>
              <p className="text-[11px] text-slate-500">Caixas touch, balcões e servidores LAN</p>
            </div>

            {/* 3. Faturas Emitidas */}
            <div data-reveal className="sr-init bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center space-y-2 hover:border-amber-500/40 hover:scale-[1.02] transition-all duration-300" style={{ transitionDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono-num tracking-tight">
                {settings.statInvoicesCount || '+14.5M'}
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Faturas com QR Code AGT</h4>
              <p className="text-[11px] text-slate-500">Assinatura digital RS256 e SAF-T auditado</p>
            </div>

            {/* 4. Províncias de Angola */}
            <div data-reveal className="sr-init bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center space-y-2 hover:border-indigo-500/40 hover:scale-[1.02] transition-all duration-300" style={{ transitionDelay: '300ms' }}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-indigo-400 font-mono-num tracking-tight">
                <AnimatedCounter end={settings.statProvincesCount || 18} suffix="/18" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Cobertura Territorial</h4>
              <p className="text-[11px] text-slate-500">Técnicos e assistência em todo o país</p>
            </div>

          </div>

          <div data-reveal className="sr-init mt-12 flex flex-wrap items-center justify-center gap-4 text-center">
            <button
              onClick={() => onNavigatePage('casos-sucesso')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Todos os Casos de Sucesso</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigatePage('provincias')}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Cobertura nas 18 Províncias</span>
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div ref={sectionsRef}>

        {/* ========== VÍDEO SPOTLIGHT — KIVORA EM AÇÃO ========== */}
        {settings.videoHomeUrl && (
          <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto">
            <div data-reveal className="sr-init text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
                Tour Virtual & Demonstração
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {settings.videoHomeTitle || 'Conheça o KIVORA ERP em Ação'}
              </h2>
              <p className="text-sm text-slate-600">
                {settings.videoHomeDesc || 'Veja em menos de 2 minutos como emitir faturas certificadas, operar o POS e fechar o caixa sem internet.'}
              </p>
            </div>

            <div data-reveal className="sr-init">
              <YouTubePlayer
                videoUrl={settings.videoHomeUrl}
                title={settings.videoHomeTitle || 'Conheça o KIVORA ERP'}
                subtitle={settings.videoHomeDesc}
                badge="Demonstração Oficial"
                accentColor="blue"
                aspectRatio="video"
              />
            </div>
          </section>
        )}

        {/* ========== COMO FUNCIONA — 5 Passos ========== */}
        <section className="py-24 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
          <div data-reveal className="sr-init text-center mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Instalação Simples</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Em 5 passos, está a faturar.
            </h2>
          </div>

          <div className="flex flex-wrap items-start justify-center gap-y-12 gap-x-4 md:gap-x-10 relative">
            {/* Linha conectora (decorativa) */}
            <div className="absolute top-7 left-[10%] right-[10%] h-[1px] bg-slate-200 hidden lg:block" />

            <Step num="01" title="Escolha a Licença" desc="Selecione o plano ideal no nosso site" delay={0} />
            <Step num="02" title="Baixe o Instalador" desc="Descarregue o Setup.exe (~48 MB)" delay={100} />
            <Step num="03" title="Instale no PC" desc="Instalação rápida em menos de 2 min" delay={200} />
            <Step num="04" title="Configure a Empresa" desc="Introduza o seu NIF e dados fiscais" delay={300} />
            <Step num="05" title="Comece a Faturar" desc="Emita a primeira fatura eletrónica" delay={400} />
          </div>

          <div data-reveal className="sr-init mt-12 text-center">
            <button
              onClick={() => onNavigatePage('download')}
              className="shimmer-button inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              <span>Baixar KIVORA Setup — Grátis</span>
            </button>
          </div>
        </section>

        {/* ========== FEATURES — 3 CARDS ========== */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
          <div data-reveal className="sr-init mb-12">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Principais Funcionalidades</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-950 tracking-tight max-w-lg leading-tight">
              Tudo o que a sua empresa precisa, num único sistema.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="w-5 h-5" strokeWidth={1.75} />}
              title="Faturação Eletrónica AGT"
              desc="Fatura com QR Code, assinatura digital RS256 e conformidade total com o DS.120. Comunicação automática com o portal da AGT."
              delay={0}
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" strokeWidth={1.75} />}
              title="POS de Balcão Rápido"
              desc="Interface de venda otimizada para velocidade, suporte a talão térmico, multi-caixa e fecho de turno sem falhas."
              delay={100}
            />
            <FeatureCard
              icon={<Wifi className="w-5 h-5" strokeWidth={1.75} />}
              title="Rede Local — Sem Internet"
              desc="Liga múltiplos postos de trabalho em rede LAN. A sua base de dados fica 100% dentro da empresa, sem depender de nuvem."
              delay={200}
            />
          </div>

          {/* ========== SEÇÃO MULTI-DISPOSITIVOS: POS, DESKTOP E LAPTOP ========== */}
          <div data-reveal className="sr-init mt-20 pt-16 border-t border-slate-100">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Flexibilidade Total de Hardware</span>
              <h3 className="mt-2 text-3xl font-black text-slate-950 tracking-tight">
                Instale em Qualquer Computador da Sua Empresa
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                O KIVORA foi desenvolvido para correr de forma nativa e ultra-rápida no Windows em três formatos de postos de trabalho:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. POS TOUCH */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
                <div>
                  <div className="aspect-[4/3] bg-white rounded-2xl p-4 border border-slate-200/60 mb-5 flex items-center justify-center overflow-hidden">
                    <img
                      src={posImg}
                      alt="Terminal Touch POS KIVORA"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] mb-2">
                    <Monitor className="w-3 h-3" />
                    Terminal Touch POS
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Caixas Rápidos & Restauração</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Interface tátil de toque direto para supermercados, padarias e restaurantes. Emite talões e comanda mesas num piscar de olhos.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Compatível com ecrã 15.6" Touch</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Impressão Térmica 80mm com QR Code</div>
                </div>
              </div>

              {/* 2. DESKTOP */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
                <div>
                  <div className="aspect-[4/3] bg-white rounded-2xl p-4 border border-slate-200/60 mb-5 flex items-center justify-center overflow-hidden">
                    <img
                      src={desktopImg}
                      alt="Computador Desktop KIVORA"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] mb-2">
                    <Monitor className="w-3 h-3" />
                    Computador Desktop
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Escritório & Rede Local LAN</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Ideal para estações de backoffice, contabilidade, gestão de armazém e servidor central multi-postos em rede interna.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Multi-utilizadores com permissões</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Exportação SAF-T AO e Mapas Fiscais</div>
                </div>
              </div>

              {/* 3. LAPTOP */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
                <div>
                  <div className="aspect-[4/3] bg-white rounded-2xl p-4 border border-slate-200/60 mb-5 flex items-center justify-center overflow-hidden">
                    <img
                      src={laptopImg}
                      alt="Portátil Laptop KIVORA"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] mb-2">
                    <Laptop className="w-3 h-3" />
                    Portátil / Laptop
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Gestores & Vendas em Mobilidade</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Perfeito para gerentes, consultores e equipas de vendas em viagem. Funciona 100% offline onde quer que vá.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Windows 10 e 11 nativo</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Leve, rápido e sem mensalidades</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========== SHOWCASE — Imagem Grande + Texto ========== */}
        <section className="py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            
            {/* Texto */}
            <div data-reveal className="sr-init space-y-6">
              <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Base de Dados Local</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Os seus dados ficam<br />sempre na sua empresa.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                O KIVORA não envia os dados da sua empresa para servidores externos. A base de dados fica instalada no seu próprio computador ou servidor local, garantindo total privacidade e controlo.
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  'Funciona mesmo sem internet',
                  'Cópia de segurança para Pen USB',
                  'Migração e restauro simples',
                  'Dados protegidos contra ransomware externo',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigatePage('solucoes')}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <span>Ver arquitetura de rede</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Imagem */}
            <div data-reveal className="sr-init sr-right">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src={supermercadoImg}
                  alt="Operação de Caixa Kivora no Retalho"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========== ARQUITETURA HÍBRIDA & FLUXO AGT OFFLINE-FIRST ========== */}
        <section className="py-12 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
          <div data-reveal className="sr-init">
            <SystemArchitectureFlow />
          </div>
        </section>

        {/* ========== REDE LAN — Showcase invertido ========== */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            
            {/* Imagem primeiro no mobile, segundo no desktop */}
            <div data-reveal className="sr-init sr-left order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                <img
                  src={executivosImg}
                  alt="Gestão de Empresas e Contabilidade Kivora"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Texto */}
            <div data-reveal className="sr-init order-1 lg:order-2 space-y-6">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Rede Local — Multi-Postos</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
                Uma rede inteira de caixas,<br />a trabalhar em simultâneo.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                Ligue o computador principal como servidor e conecte caixas, gerência e armazém na mesma rede local. Dados partilhados em milissegundos, sem depender de internet.
              </p>
              <button
                onClick={() => onNavigatePage('solucoes')}
                className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <span>Ver Soluções de Rede</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

          </div>
        </section>

        {/* ========== SEÇÃO 1 (ÁREA BRANCA): JOVEM EMPRESÁRIA COM TABLET ========== */}
        <section className="pt-16 sm:pt-20 lg:pt-24 pb-0 bg-white border-t border-slate-100 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            
            {/* Texto */}
            <div data-reveal className="sr-init lg:col-span-6 space-y-4 sm:space-y-6 pb-12 sm:pb-16 lg:pb-20">
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Gestão Moderna & Mobilidade Empresarial
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-950 leading-tight">
                O Seu Negócio Sob Controlo em Qualquer Lugar
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed">
                Acompanhe o desempenho das suas vendas, fechos de caixa e movimentações de stock com relatórios gerenciais claros e em tempo real. O <strong>KIVORA ERP</strong> foi desenhado para simplificar a vida dos gestores em Angola.
              </p>

              <div className="space-y-2.5 sm:space-y-3 pt-2">
                {[
                  'Acompanhe múltiplos postos de trabalho e filiais',
                  'Fecho de turno de caixas sem divergências',
                  'Relatórios financeiros e mapas fiscais instantâneos',
                  'Conformidade total com a AGT e Decreto Presidencial n.º 71/25',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 sm:pt-4 flex items-center gap-4">
                <button
                  onClick={() => onNavigatePage('solucoes')}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
                >
                  <span>Conhecer Todas as Soluções</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Imagem em Destaque Ancorada na Base */}
            <div data-reveal className="sr-init sr-right lg:col-span-6 flex items-end justify-center self-end">
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl relative flex items-end justify-center">
                <img
                  src={empresariaTabletImg}
                  alt="Jovem Empresária com Tablet KIVORA ERP"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[460px] sm:max-h-[560px] lg:max-h-[640px] xl:max-h-[700px] object-contain object-bottom block"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========== SEÇÃO 2 (FUNDO AZUL ESCURO): JOVEM EMPRESÁRIO / CONSULTORIA & BOAS-VINDAS ========== */}
        <section className="pt-16 sm:pt-20 lg:pt-24 pb-0 bg-slate-950 text-white border-t border-slate-800 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            
            {/* Imagem em Destaque Ancorada na Base na Esquerda */}
            <div data-reveal className="sr-init sr-left lg:col-span-6 flex items-end justify-center self-end order-2 lg:order-1">
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl relative flex items-end justify-center">
                <img
                  src={empresarioBoasVindasImg}
                  alt="Consultor KIVORA ERP"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[460px] sm:max-h-[560px] lg:max-h-[640px] xl:max-h-[700px] object-contain object-bottom block select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Texto na Direita */}
            <div data-reveal className="sr-init lg:col-span-6 space-y-6 order-1 lg:order-2 pb-12 sm:pb-16 lg:pb-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Headphones className="w-3.5 h-3.5" />
                Consultoria e Suporte Local em Angola
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Estamos Prontos Para Ajudar a Sua Empresa a Crescer
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Não fica sozinho na implementação do seu sistema de faturação. A nossa equipa técnica sediada em Luanda presta acompanhamento presencial, configuração de rede local e formação completa para a sua equipa.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="font-bold text-white text-xs sm:text-sm mb-1">Apoio Presencial & Remoto</p>
                  <p className="text-[11px] text-slate-400">Técnicos especializados disponíveis 6 dias por semana via WhatsApp e chamadas.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="font-bold text-white text-xs sm:text-sm mb-1">Formação de Operadores</p>
                  <p className="text-[11px] text-slate-400">Treinamos os seus caixas e gerentes para faturar sem erros desde o primeiro dia.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => onOpenDemoModal('Consultoria Geral')}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Agendar Demonstração VIP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ========== SEÇÃO 3 (ÁREA BRANCA): PROGRAMA DE PARCEIROS ========== */}
        <section className="pt-16 sm:pt-20 lg:pt-24 pb-0 bg-white border-t border-slate-100 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            
            {/* Texto */}
            <div data-reveal className="sr-init lg:col-span-6 space-y-4 sm:space-y-6 pb-12 sm:pb-16 lg:pb-20">
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                Canais de Distribuição & Revenda
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-950 leading-tight">
                Seja Parceiro Certificado KIVORA na Sua Província
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed">
                Junte-se à maior rede de distribuição de software certificado em Angola. Compre licenças a preço de atacado, defina a sua margem de lucro e emita certificados oficiais aos seus clientes.
              </p>

              <div className="space-y-2.5 sm:space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Portal exclusivo com emissão instantânea de licenças 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Certificado oficial de revenda e kit comercial completo</span>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 flex items-center gap-4">
                <button
                  onClick={() => onNavigatePage('parceiros')}
                  className="inline-flex items-center justify-center gap-2 bg-[#1d4ed8] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
                >
                  <span>Conhecer Programa de Parceiros</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Imagem em Destaque Ancorada na Base */}
            <div data-reveal className="sr-init sr-right lg:col-span-6 flex items-end justify-center self-end">
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl relative flex items-end justify-center">
                <img
                  src={parceirosImg}
                  alt="Parceiros KIVORA ERP em Angola"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[460px] sm:max-h-[560px] lg:max-h-[640px] xl:max-h-[700px] object-contain object-bottom block"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========== CTA FINAL ========== */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 bg-blue-600">
          <div data-reveal className="sr-init max-w-3xl mx-auto text-center text-white space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Pronto para modernizar<br />a gestão da sua empresa?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Baixe agora o KIVORA e comece a emitir faturas eletrónicas em conformidade com a AGT.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigatePage('download')}
                className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-600 font-black text-sm px-8 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                <span>Baixar KIVORA Setup</span>
              </button>
              <button
                onClick={() => onOpenDemoModal()}
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm px-7 py-4 rounded-2xl transition-all hover:-translate-y-0.5"
              >
                <span>Falar com Consultor</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Monitor, ShoppingCart, HardDrive, Server, Boxes } from 'lucide-react';

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  icon: any;
  specs: string[];
}

export const HERO_SLIDES: CarouselSlide[] = [
  {
    id: 'faturacao-dashboard',
    title: 'Faturação Eletrónica Homologada pela AGT',
    subtitle: 'Emissão de Facturas, Recibos e Notas com assinatura digital RS256, QR Code e conformidade com o Decreto Presidencial n.º 71/25.',
    category: 'Faturação & Gestão Comercial',
    image: '/imagens/imagem.png',
    icon: Monitor,
    specs: ['Validação AGT DS.120', 'Assinatura RS256', 'QR Code Oficial', 'Contingência 45 Dias'],
  },
  {
    id: 'pos-multicaixa',
    title: 'Ponto de Venda (POS) de Balcão e Alta Rotatividade',
    subtitle: 'Vendas ultra-rápidas para lojas, restaurantes e supermercados com abertura de gaveta e impressão em talões térmicos de 58mm e 80mm.',
    category: 'Vendas & Frente de Caixa',
    image: '/imagens/imagem2.png',
    icon: ShoppingCart,
    specs: ['Fecho de Caixa Cego', 'Impressão Térmica Direta', 'Suporte a Código de Barras', 'Operação Contínua Local'],
  },
  {
    id: 'instalacao-disco',
    title: 'Software Instalado com Base de Dados Local',
    subtitle: 'O KIVORA é instalado diretamente no computador da sua empresa. Os seus dados permanecem no seu espaço físico, com máxima velocidade.',
    category: 'Instalação & Base de Dados Local',
    image: '/imagens/pacote-de-instalação-com-disco.png',
    icon: HardDrive,
    specs: ['Base de Dados Local', 'Setup Rápido no Windows', 'Backups em Pen Drive / Disco', 'Independência de Internet'],
  },
  {
    id: 'servidor-rede',
    title: 'Arquitetura Multi-Postos em Rede Local (LAN)',
    subtitle: 'Interligue o computador principal aos caixas, gabinetes de gerência e armazém na rede interna da empresa sem depender da nuvem.',
    category: 'Rede Local Empresarial',
    image: '/imagens/servidor.png',
    icon: Server,
    specs: ['Servidor Central na LAN', 'Caixas e Gerência Ligados', 'Sincronização em Milissegundos', 'Permissões por Utilizador'],
  },
  {
    id: 'pacote-stock-rh',
    title: 'Gestão Completa de Stock, Salários & SAF-T AO',
    subtitle: 'Controlo rigoroso de inventário por lotes e validades, processamento salarial com tabelas de IRT 2026 e exportação do SAF-T (AO).',
    category: 'Módulos Integrados',
    image: '/imagens/pacote.png',
    icon: Boxes,
    specs: ['Tabelas IRT / INSS 2026', 'Multiarmazém & Lotes', 'Plano Contabilístico PGC-AO', 'Exportação SAF-T (AO)'],
  },
];

interface HeroCarouselProps {
  onNavigatePage?: (page: any) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigatePage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 6000; // 6 seconds per slide

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    setProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setProgress(0);
  }, []);

  const handleSelectSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Timer & progress bar tick
  useEffect(() => {
    if (!isPlaying) return;

    const intervalStep = 50; // update progress every 50ms
    const progressIncrement = (intervalStep / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPlaying, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const activeSlide = HERO_SLIDES[currentIndex];
  const IconComponent = activeSlide.icon;

  return (
    <div
      className="relative w-full max-w-7xl mx-auto"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Main Cinema Display Frame */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Top Window Bar (Chrome Style) */}
        <div className="px-5 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-slate-300 font-semibold tracking-wide">
              KIVORA DESKTOP v2026 • {activeSlide.category}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-slate-400 font-bold">
              0{currentIndex + 1} <span className="text-slate-600">/ 0{HERO_SLIDES.length}</span>
            </span>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title={isPlaying ? 'Pausar apresentação' : 'Reproduzir apresentação'}
              aria-label="Pausar ou reproduzir apresentação"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Play className="w-3.5 h-3.5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Slide Visual Area - Full Responsive Canvas */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.2/1] min-h-[380px] sm:min-h-[480px] bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />

          {/* Active Image with smooth transition */}
          <div className="relative w-full h-full p-4 sm:p-8 flex items-center justify-center">
            <img
              key={activeSlide.id}
              src={activeSlide.image}
              alt={activeSlide.title}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-500 transform animate-fadeIn"
            />
          </div>

          {/* Overlay Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 shadow-lg"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 shadow-lg"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
          </button>

          {/* Slide Caption Box (Overlay at bottom) */}
          <div className="absolute bottom-0 inset-x-0 z-20 p-5 sm:p-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                  <IconComponent className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{activeSlide.category}</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {activeSlide.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {activeSlide.subtitle}
                </p>

                {/* Specs Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {activeSlide.specs.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-200 border border-slate-700 text-[11px] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => onNavigatePage && onNavigatePage('download')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <span>Baixar Versão</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Progress Bar */}
        <div className="w-full h-1 bg-slate-800 relative overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* Interactive Thumbnail / Slide Indicators */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const SlideIcon = slide.icon;
          return (
            <button
              key={slide.id}
              onClick={() => handleSelectSlide(idx)}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                isActive
                  ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                  : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/70 text-slate-500'}`}>
                <SlideIcon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <span className={`block text-[11px] font-bold truncate ${isActive ? 'text-slate-950' : 'text-slate-700'}`}>
                  0{idx + 1}. {slide.category}
                </span>
                <span className="block text-[10px] text-slate-500 truncate">
                  {slide.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

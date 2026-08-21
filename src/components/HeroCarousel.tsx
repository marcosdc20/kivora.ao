import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Download } from 'lucide-react';

import laptopImg from '../assets/kivora/pc-laptop-kivora.png';
import posImg from '../assets/kivora/pc-pos-kivora.png';
import desktopImg from '../assets/kivora/pc-descktop-kivora.png';
import executivosImg from '../assets/kivora/executivos-kivora.jpg';
import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';
import restauranteImg from '../assets/kivora/restaurante-kivora.jpg';

interface SlideProps {
  image: string;
  tagline: string;
  headline: string;
  sub: string;
  cta: { label: string; action: 'download' | 'demo' };
  align: 'left' | 'center';
  overlay: string;
  deviceImage: string;
  deviceAlt: string;
}

interface HeroCarouselProps {
  onNavigatePage: (page: any) => void;
  onOpenDemoModal: (subject?: string) => void;
}

const SLIDES: SlideProps[] = [
  {
    image: executivosImg,
    tagline: 'Faturação Eletrónica Certificada AGT',
    headline: 'Emita faturas legais\nem Angola, sem papel,\nsem complicações.',
    sub: 'Conformidade total com DS.120, QR Code e assinatura digital RS256 homologados pela AGT.',
    cta: { label: 'Baixar KIVORA Grátis', action: 'download' },
    align: 'left',
    overlay: 'from-black/90 via-black/65 to-black/30',
    deviceImage: laptopImg,
    deviceAlt: 'Portátil Laptop KIVORA ERP',
  },
  {
    image: supermercadoImg,
    tagline: 'Ponto de Venda — POS de Balcão',
    headline: 'Vendas mais rápidas.\nFecho de caixa\nsem erros.',
    sub: 'Impressão térmica de talões, gestão de turno e integração multicaixa num único sistema.',
    cta: { label: 'Ver Demonstração', action: 'demo' },
    align: 'left',
    overlay: 'from-black/90 via-black/65 to-black/30',
    deviceImage: posImg,
    deviceAlt: 'Terminal Touch POS KIVORA ERP',
  },
  {
    image: restauranteImg,
    tagline: 'Rede Local LAN — Multi-Postos',
    headline: 'Um sistema para toda\na sua empresa,\nsem depender da internet.',
    sub: 'Ligue caixas, gerência e armazém na mesma rede local. Dados 100% na sua empresa.',
    cta: { label: 'Conhecer Soluções', action: 'demo' },
    align: 'left',
    overlay: 'from-black/90 via-black/65 to-black/30',
    deviceImage: desktopImg,
    deviceAlt: 'Computador Desktop KIVORA ERP',
  },
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigatePage, onOpenDemoModal }) => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const goTo = useCallback((index: number, dir: 'next' | 'prev') => {
    if (animating) return;
    setAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 500);
  }, [animating]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 'next');
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, 'prev');
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[640px] lg:h-screen lg:min-h-[640px] lg:max-h-[920px] overflow-hidden bg-slate-950 flex items-center">
      
      {/* ─── IMAGENS DE FUNDO ORIGINAIS EM CARROSSEL ─────────────────────── */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={s.image}
            alt={s.headline}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover object-[center_top]"
          />
          {/* Overlay Escuro com Gradiente */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>
      ))}

      {/* ─── CONTEÚDO DO SLIDE COM IMAGEM DO DISPOSITIVO POR CIMA ───────── */}
      <div className="relative z-10 w-full pt-20 sm:pt-28 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Coluna Esquerda: Textos Originais do Slide */}
            <div
              key={`text-${current}`}
              className={`lg:col-span-7 transition-all duration-500 text-left ${
                animating
                  ? direction === 'next'
                    ? 'opacity-0 translate-y-6'
                    : 'opacity-0 -translate-y-6'
                  : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Tag / Tagline com badge pulsante live */}
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-300 border border-blue-400/30 bg-blue-950/70 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{slide.tagline}</span>
              </div>

              {/* Headline Responsivo com Tipografia Editorial */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-extrabold text-white leading-[1.12] sm:leading-[1.08] tracking-tight mb-4 whitespace-pre-line drop-shadow-md">
                {slide.headline}
              </h1>

              {/* Subtítulo */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed mb-6 sm:mb-8 max-w-xl font-normal">
                {slide.sub}
              </p>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {slide.cta.action === 'download' ? (
                  <button
                    onClick={() => onNavigatePage('download')}
                    className="shimmer-button inline-flex items-center justify-center gap-2 bg-[#1d4ed8] hover:bg-blue-600 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-900/40 transition-all hover:-translate-y-0.5 cursor-pointer border border-blue-400/30"
                  >
                    <Download className="w-4 h-4" strokeWidth={2.25} />
                    <span>{slide.cta.label}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenDemoModal()}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-950 font-bold text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer border border-slate-200"
                  >
                    <span>{slide.cta.label}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
                  </button>
                )}

                <button
                  onClick={() => onNavigatePage('funcionalidades')}
                  className="bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl cursor-pointer backdrop-blur-xs"
                >
                  <span>Conhecer Módulos</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>

              {/* Destaques Rápidos de Confiança */}
              <div className="pt-6 sm:pt-8 border-t border-white/15 mt-6 sm:mt-8 grid grid-cols-3 gap-3 text-left">
                <div>
                  <p className="text-xs sm:text-sm font-black text-white font-mono-num">0 Minutos</p>
                  <p className="text-[11px] text-slate-300">Paragem sem Internet</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-emerald-400 font-mono-num">100% Legal</p>
                  <p className="text-[11px] text-slate-300">Decreto 71/25 AGT</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-white font-mono-num">18 Províncias</p>
                  <p className="text-[11px] text-slate-300">Apoio Presencial</p>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Imagem do Equipamento Responsiva */}
            <div
              key={`device-${current}`}
              className={`lg:col-span-5 flex items-center justify-center transition-all duration-600 ${
                animating
                  ? direction === 'next'
                    ? 'opacity-0 scale-95'
                    : 'opacity-0 scale-95'
                  : 'opacity-100 scale-100'
              }`}
            >
              <div className="w-full max-w-[280px] sm:max-w-md lg:max-w-xl xl:max-w-2xl flex items-center justify-center pt-2 sm:pt-0">
                <img
                  src={slide.deviceImage}
                  alt={slide.deviceAlt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[220px] sm:max-h-[380px] lg:max-h-[480px] xl:max-h-[540px] object-contain select-none pointer-events-none drop-shadow-2xl"
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ─── NAVEGAÇÃO: SETAS (Ocultas em telas muito pequenas para evitar sobreposição) ─── */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all backdrop-blur-sm cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2} />
      </button>

      <button
        onClick={next}
        aria-label="Próximo slide"
        className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all backdrop-blur-sm cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* ─── DOTS DE NAVEGAÇÃO INFERIORES ────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-3 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            aria-label={`Ir para slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === current
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Contador de Slides */}
      <div className="absolute bottom-8 right-8 sm:right-12 z-20 text-white/50 text-xs font-mono tracking-widest">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Download } from 'lucide-react';

import laptopImg from '../assets/kivora/pc-laptop-kivora.png';
import posImg from '../assets/kivora/pc-pos-kivora.png';
import desktopImg from '../assets/kivora/pc-descktop-kivora.png';

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
    image: '/imagens/46908.jpg',
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
    image: '/imagens/13608.jpg',
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
    image: '/imagens/136227.jpg',
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
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Coluna Esquerda: Textos Originais do Slide */}
            <div
              key={`text-${current}`}
              className={`lg:col-span-6 transition-all duration-500 text-left ${
                animating
                  ? direction === 'next'
                    ? 'opacity-0 translate-y-6'
                    : 'opacity-0 -translate-y-6'
                  : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Tag / Tagline */}
              <span className="inline-block mb-3 sm:mb-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/40 bg-blue-500/10 px-3 py-1 rounded-full backdrop-blur-xs">
                {slide.tagline}
              </span>

              {/* Headline Responsivo */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.12] sm:leading-[1.08] tracking-tight mb-3 sm:mb-4 whitespace-pre-line drop-shadow-lg break-words">
                {slide.headline}
              </h1>

              {/* Subtítulo */}
              <p className="text-xs sm:text-base lg:text-lg text-white/85 leading-relaxed mb-6 sm:mb-8 max-w-lg font-normal">
                {slide.sub}
              </p>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {slide.cta.action === 'download' ? (
                  <button
                    onClick={() => onNavigatePage('download')}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" strokeWidth={2} />
                    <span>{slide.cta.label}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenDemoModal()}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{slide.cta.label}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                )}

                <button
                  onClick={() => onNavigatePage('download')}
                  className="text-white/85 hover:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center sm:justify-start gap-1.5 py-2 cursor-pointer"
                >
                  <span>Ver funcionalidades</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Coluna Direita: Imagem do Equipamento Responsiva */}
            <div
              key={`device-${current}`}
              className={`lg:col-span-6 flex items-center justify-center transition-all duration-600 ${
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
                  className="w-full h-auto max-h-[220px] sm:max-h-[380px] lg:max-h-[520px] xl:max-h-[580px] object-contain select-none pointer-events-none drop-shadow-md"
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

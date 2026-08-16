import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Download } from 'lucide-react';

interface SlideProps {
  image: string;
  tagline: string;
  headline: string;
  sub: string;
  cta: { label: string; action: 'download' | 'demo' };
  align: 'left' | 'center';
  overlay: string; // css gradient class
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
    overlay: 'from-black/85 via-black/55 to-transparent',
  },
  {
    image: '/imagens/13608.jpg',
    tagline: 'Ponto de Venda — POS de Balcão',
    headline: 'Vendas mais rápidas.\nFecho de caixa\nsem erros.',
    sub: 'Impressão térmica de talões, gestão de turno e integração multicaixa num único sistema.',
    cta: { label: 'Ver Demonstração', action: 'demo' },
    align: 'left',
    overlay: 'from-black/85 via-black/55 to-transparent',
  },
  {
    image: '/imagens/136227.jpg',
    tagline: 'Rede Local LAN — Multi-Postos',
    headline: 'Um sistema para toda\na sua empresa,\nsem depender da internet.',
    sub: 'Ligue caixas, gerência e armazém na mesma rede local. Dados 100% na sua empresa.',
    cta: { label: 'Conhecer Soluções', action: 'demo' },
    align: 'left',
    overlay: 'from-black/85 via-black/55 to-transparent',
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
    }, 600);
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
    <div className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-slate-950">
      
      {/* Imagem de Fundo */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={s.image}
            alt={s.headline}
            className="w-full h-full object-cover object-[center_top]"
          />
          {/* Overlay escuro */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
          {/* Gradiente inferior para suavizar */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>
      ))}

      {/* Conteúdo do Slide com espaçamento para Navbar Fixa */}
      <div className="relative z-10 h-full flex items-center pt-24 sm:pt-28 pb-16">
        <div className={`max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full ${slide.align === 'center' ? 'text-center' : 'text-left'}`}>
          <div
            key={current}
            className={`max-w-2xl ${slide.align === 'center' ? 'mx-auto' : ''} transition-all duration-500 ${
              animating
                ? direction === 'next'
                  ? 'opacity-0 translate-y-6'
                  : 'opacity-0 -translate-y-6'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Tag */}
            <span className="inline-block mb-5 text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/40 bg-blue-500/10 px-3 py-1 rounded-full backdrop-blur-sm">
              {slide.tagline}
            </span>

            {/* Headline — 3 linhas forçadas com whitespace-pre-line */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-5 whitespace-pre-line drop-shadow-lg">
              {slide.headline}
            </h1>

            {/* Sub */}
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-lg font-normal">
              {slide.sub}
            </p>

            {/* CTA */}
            <div className={`flex items-center gap-4 ${slide.align === 'center' ? 'justify-center' : ''}`}>
              {slide.cta.action === 'download' ? (
                <button
                  onClick={() => onNavigatePage('download')}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-600/40"
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                  <span>{slide.cta.label}</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenDemoModal()}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-7 py-3.5 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <span>{slide.cta.label}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
              )}

              <button
                onClick={() => onNavigatePage('download')}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5 group"
              >
                <span>Ver funcionalidades</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação — Setas */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all backdrop-blur-sm hover:-translate-x-0.5 hover:-translate-y-1/2"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2} />
      </button>

      <button
        onClick={next}
        aria-label="Próximo slide"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all backdrop-blur-sm hover:translate-x-0.5 hover:-translate-y-1/2"
      >
        <ChevronRight className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Dots de Navegação */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-3 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            aria-label={`Ir para slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
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

      {/* Scroll Down indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/40 animate-bounce">
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Download, Play, X } from 'lucide-react';
import { subscribeSystemSettings, getCachedSystemSettings, SystemCompanySettings } from '../services/systemSettingsService';

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
  deviceImage: string;
  deviceAlt: string;
  pill1: { text: string; sub: string };
  pill2: { text: string; sub: string };
  ambientColor: string;
}

interface HeroCarouselProps {
  onNavigatePage: (page: any) => void;
  onOpenDemoModal: (subject?: string) => void;
}

const SLIDES: SlideProps[] = [
  {
    image: executivosImg,
    tagline: 'Faturação Eletrónica Certificada AGT',
    headline: 'Emita faturas legais em Angola\ncom assinatura digital e QR Code.',
    sub: 'Conformidade plena com o Decreto Presidencial n.º 71/25. Assinatura criptográfica RSA-SHA256 e exportação mensal de SAF-T (AO) sem divergências.',
    cta: { label: 'Descarregar KIVORA Grátis', action: 'download' },
    deviceImage: laptopImg,
    deviceAlt: 'Portátil Laptop KIVORA SOFT',
    pill1: { text: 'Certificação AGT FE/387', sub: 'Software Certificado' },
    pill2: { text: 'SAF-T AO 100% Válido', sub: 'Sem erros de submissão' },
    ambientColor: 'rgba(23, 70, 162, 0.45)',
  },
  {
    image: supermercadoImg,
    tagline: 'Ponto de Venda POS • Ultra-Rápido',
    headline: 'Atendimento veloz no balcão.\nFecho de turno com zero erros.',
    sub: 'Interface tátil otimizada para caixas rápidos, leitores de código de barras, impressoras térmicas de 80mm e gestão rigorosa de sangrias e reforços.',
    cta: { label: 'Solicitar Demonstração VIP', action: 'demo' },
    deviceImage: posImg,
    deviceAlt: 'Terminal Touch POS KIVORA SOFT',
    pill1: { text: 'Turnos e Caixa Z', sub: 'Diferença de caixa 0 Kz' },
    pill2: { text: 'Talões Térmicos 80mm', sub: 'Impressão instantânea' },
    ambientColor: 'rgba(5, 150, 105, 0.45)',
  },
  {
    image: restauranteImg,
    tagline: 'Rede Local LAN • Soberania de Dados',
    headline: 'O software completo para a sua empresa,\n100% funcional mesmo sem internet.',
    sub: 'A instabilidade da fibra ou dados móveis nunca paralisa as suas vendas. Base de dados SQLite local no seu próprio computador ou servidor LAN multi-postos.',
    cta: { label: 'Conhecer Arquitetura LAN', action: 'demo' },
    deviceImage: desktopImg,
    deviceAlt: 'Computador Desktop KIVORA SOFT',
    pill1: { text: 'Base Local Offline', sub: 'Zero dependência da cloud' },
    pill2: { text: 'Multi-Postos em Rede', sub: 'Até 20 caixas simultâneos' },
    ambientColor: 'rgba(255, 101, 0, 0.4)',
  },
];

const AUTOPLAY_DURATION = 7500;

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigatePage, onOpenDemoModal }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const effectiveSlides = useMemo(() => {
    return SLIDES.map((s, idx) => {
      if (idx === 0 && settings.heroImageUrl) {
        return { ...s, image: settings.heroImageUrl };
      }
      return s;
    });
  }, [settings.heroImageUrl]);

  const goTo = useCallback((nextIdx: number, newDir: number) => {
    setDirection(newDir);
    setCurrent(nextIdx);
    setProgress(0);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, -1);
  }, [current, goTo]);

  // Autoplay and progress bar logic
  useEffect(() => {
    if (isPaused) return;

    const stepMs = 50;
    const increment = (stepMs / AUTOPLAY_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          next();
          return 0;
        }
        return prevProgress + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  const slide = effectiveSlides[current] || effectiveSlides[0];

  // Motion variants for text container
  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 30 : -30,
      filter: 'blur(4px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -30 : 30,
      filter: 'blur(4px)',
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  const deviceVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 0.94,
      y: dir > 0 ? 20 : -20,
    }),
    center: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section
      aria-label="KIVORA SOFT Hero Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[640px] sm:min-h-[700px] lg:min-h-[800px] xl:min-h-[860px] overflow-hidden bg-[#060D19] flex items-center select-none"
    >
      {/* ─── BACKGROUND AMBIENT GRADIENTS & PHOTO CAROUSEL ─────────────────── */}
      {effectiveSlides.map((s, idx) => (
        <div
          key={`bg-slide-${idx}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={s.image}
            alt=""
            aria-hidden="true"
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover object-[center_28%] scale-105 transition-transform duration-10000 ease-out transform"
          />
          {/* Multi-layered cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060D19] via-[#060D19]/90 to-[#060D19]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060D19] via-transparent to-[#060D19]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        </div>
      ))}

      {/* Subtle dynamic background glow matching current slide */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at 70% 50%, ${slide.ambientColor} 0%, rgba(6,13,25,0) 65%)`,
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 pointer-events-none opacity-80"
      />

      {/* Ambient Grid Subtle Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ─── MAIN SLIDE CONTENT CONTAINER ─────────────────────────────────── */}
      <div className="relative z-10 w-full pt-28 sm:pt-32 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* ═══ COLUNA ESQUERDA: TEXTOS & CTAS ═══ */}
            <div className="lg:col-span-7 text-left">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`content-${current}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Tagline Badge com micro-interação */}
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] backdrop-blur-md shadow-xs transition-colors">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">
                      {slide.tagline}
                    </span>
                  </div>

                  {/* Headline com Tipografia Geist / Display */}
                  <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white leading-[1.12] sm:leading-[1.08] tracking-tight font-display whitespace-pre-line drop-shadow-sm">
                    {slide.headline}
                  </h1>

                  {/* Subtítulo Refinado */}
                  <p className="text-sm sm:text-base lg:text-[17px] text-slate-300 leading-relaxed font-sans max-w-xl font-normal">
                    {slide.sub}
                  </p>

                  {/* Botões de Ação de Alto Impacto */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-3">
                    {slide.cta.action === 'download' ? (
                      <button
                        onClick={() => onNavigatePage('download')}
                        className="bg-[#FF6500] hover:bg-[#EB5B00] active:scale-[0.98] text-white font-bold text-sm px-8 py-4 rounded-full shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 hover:shadow-orange-500/40 transition-all cursor-pointer group"
                      >
                        <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" strokeWidth={2.2} />
                        <span>{slide.cta.label}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenDemoModal('Demonstração Executiva KIVORA')}
                        className="bg-[#FF6500] hover:bg-[#EB5B00] active:scale-[0.98] text-white font-bold text-sm px-8 py-4 rounded-full shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 hover:shadow-orange-500/40 transition-all cursor-pointer group"
                      >
                        <span>{slide.cta.label}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
                      </button>
                    )}

                    <button
                      onClick={() => onNavigatePage('funcionalidades')}
                      className="inline-flex items-center justify-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] border border-white/[0.16] hover:border-white/[0.28] text-white text-sm font-semibold px-7 py-4 rounded-full backdrop-blur-md transition-all cursor-pointer group"
                    >
                      <span>Explorar Módulos</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {settings.heroVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setShowVideoModal(true)}
                        className="inline-flex items-center justify-center gap-2 bg-[#FF6500]/20 hover:bg-[#FF6500]/35 active:scale-[0.98] border border-[#FF6500]/40 text-[#FFA726] text-sm font-semibold px-6 py-4 rounded-full backdrop-blur-md transition-all cursor-pointer group"
                      >
                        <Play className="w-4 h-4 fill-current text-[#FF6500] group-hover:scale-110 transition-transform" />
                        <span>Ver Vídeo Demonstrativo</span>
                      </button>
                    )}
                  </div>

                  {/* Indicadores de Slide Elegantes no Fluxo do Conteúdo */}
                  <div className="pt-6 sm:pt-7 flex items-center gap-2.5 max-w-lg">
                    {effectiveSlides.map((s, idx) => {
                      const isActive = idx === current;
                      return (
                        <button
                          key={`nav-seg-${idx}`}
                          onClick={() => goTo(idx, idx > current ? 1 : -1)}
                          className="flex-1 group text-left cursor-pointer focus:outline-none py-1"
                          aria-label={`Ver slide ${idx + 1}: ${s.tagline}`}
                        >
                          <div className="relative h-1.5 w-full bg-white/20 rounded-full overflow-hidden transition-colors group-hover:bg-white/30">
                            {isActive && (
                              <motion.div
                                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#FF6500] to-[#FFA726] rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            )}
                            {!isActive && idx < current && (
                              <div className="absolute inset-0 bg-white/50 rounded-full" />
                            )}
                          </div>
                          <div className="mt-1 text-[11px] font-medium tracking-tight truncate text-slate-400 group-hover:text-slate-200">
                            <span className={isActive ? 'text-white font-bold' : ''}>
                              0{idx + 1}
                              <span className="hidden sm:inline"> • {s.tagline.split('•')[0].trim()}</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ═══ COLUNA DIREITA: EQUIPAMENTO LIMPO E MODERNO ═══ */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`device-wrapper-${current}`}
                  custom={direction}
                  variants={deviceVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="relative w-full max-w-[340px] sm:max-w-md lg:max-w-xl flex items-center justify-center"
                >
                  {/* Subtle Background Glow behind device */}
                  <div
                    className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-1000"
                    style={{ backgroundColor: slide.ambientColor }}
                  />

                  {/* Imagem do Equipamento com Efeito Float Gentle */}
                  <div className="relative z-10 w-full flex items-center justify-center animate-float-gentle">
                    <img
                      src={slide.deviceImage}
                      alt={slide.deviceAlt}
                      loading={current === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      width="680"
                      height="460"
                      className="w-full h-auto max-h-[280px] sm:max-h-[380px] lg:max-h-[460px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] select-none pointer-events-none"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* ─── NAVIGATION CONTROLS: ARROWS ─────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.15] border border-white/[0.15] hover:border-white/30 text-white transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
      </button>

      <button
        onClick={next}
        aria-label="Próximo slide"
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.15] border border-white/[0.15] hover:border-white/30 text-white transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" strokeWidth={2.2} />
      </button>

      {/* ─── VIDEO DEMO MODAL ─────────────────────────────────────────────────── */}
      {showVideoModal && settings.heroVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF6500] animate-pulse" />
                <h3 className="text-sm font-bold text-white font-display">Apresentação Oficial KIVORA SOFT</h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar vídeo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {settings.heroVideoUrl.endsWith('.mp4') || settings.heroVideoUrl.endsWith('.webm') ? (
                <video
                  src={settings.heroVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={
                    settings.heroVideoUrl.includes('youtube.com/watch?v=')
                      ? settings.heroVideoUrl.replace('watch?v=', 'embed/')
                      : settings.heroVideoUrl.includes('youtu.be/')
                      ? settings.heroVideoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                      : settings.heroVideoUrl
                  }
                  title="KIVORA SOFT Vídeo Oficial"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

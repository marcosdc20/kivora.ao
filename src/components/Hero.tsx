import React, { useState } from 'react';
import { ArrowRight, GraduationCap, BookOpen } from 'lucide-react';
import { HeroCarousel, HERO_SLIDES } from './HeroCarousel';
import { HeroOfferCards } from './HeroOfferCards';

interface HeroProps {
  onNavigateSection?: (sectionId: string) => void;
  onOpenMatricula?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateSection, onOpenMatricula }) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const handleScrollTo = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const currentSlide = HERO_SLIDES[currentSlideIdx];

  return (
    <section id="inicio" className="relative min-h-screen w-full flex flex-col justify-between pt-20 lg:pt-24 pb-8 overflow-hidden bg-brand-dark">

      {/* Full-Screen Dynamic Background Carousel */}
      <HeroCarousel onSlideChange={(idx) => setCurrentSlideIdx(idx)} />

      {/* Main Content Container Overlaid on Screen */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-12">
        <div className="max-w-3xl">

          {/* Dynamic Badge Pill with Gold Star Accent */}
          <div className="inline-flex items-center gap-2 bg-brand-navy/90 text-white text-xs font-extrabold uppercase px-4 py-1.5 rounded-full shadow-lg border border-brand-amber/50 backdrop-blur-md mb-6 animate-fadeIn">
            <GraduationCap className="w-3.5 h-3.5 text-brand-amber" />
            <span>{currentSlide.badge || 'Kivora – Soluções Tecnológicas'}</span>
          </div>

          {/* Hero Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md">
              Soluções inteligentes <br />
              que{' '}
              <span className="text-blue-400 font-black underline decoration-brand-amber underline-offset-8">
                impulsionam
              </span>{' '}
              <br />
              o seu futuro
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-200 leading-relaxed font-medium max-w-2xl drop-shadow">
            Ecossistema de tecnologia e gestão integrada em Angola. Automatize processos, acompanhe resultados e eleve a eficiência da sua organização com a Kivora.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleScrollTo('modulos')}
              className="bg-brand-blue hover:bg-brand-blue-dark text-white text-base font-extrabold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0 border border-blue-400/30"
            >
              <span>Explorar Soluções & Módulos</span>
              <ArrowRight className="w-5 h-5 text-brand-amber" />
            </button>

            <button
              onClick={onOpenMatricula || (() => handleScrollTo('suporte'))}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md text-base font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-brand-amber" />
              <span>Solicitar Demonstração</span>
            </button>
          </div>

        </div>
      </div>

      {/* Hero Stats Cards Row at the Bottom */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <HeroOfferCards />
      </div>

    </section>
  );
};

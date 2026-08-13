import React from 'react';
import { ArrowRight, ShieldCheck, Download, HardDrive, WifiOff, Database, ArrowDown } from 'lucide-react';
import { HeroCarousel } from './HeroCarousel';
import { CURRENT_RELEASE } from '../data/kivoraData';

interface HeroProps {
  onOpenDemoModal: () => void;
  onNavigatePage: (page: any) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigatePage }) => {
  const scrollToExplore = () => {
    const el = document.getElementById('conformidade-agt');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-white text-slate-900 overflow-hidden">
      
      {/* Subtle Blueprint Mesh Gradient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-slate-100/70 via-blue-50/20 to-transparent pointer-events-none rounded-b-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Header & Value Proposition */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Official AGT Certification Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
            <span>Certificado AGT nº XXX/AGT/2026 • Decreto Presidencial n.º 71/25</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
            Faturação e Gestão Empresarial, <br />
            <span className="text-blue-600">Diretamente no Seu Computador</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed max-w-2xl mx-auto text-balance">
            Instale o KIVORA no computador da sua empresa. Os seus dados permanecem armazenados localmente, garantindo máxima velocidade e continuidade operacional sem depender de ligação permanente à Internet.
          </p>

          {/* Value Checklist (Monochrome minimal) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 text-xs font-semibold text-slate-800">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200">
              <WifiOff className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
              <span>100% Offline-First</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200">
              <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
              <span>Base de Dados Local</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200">
              <HardDrive className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
              <span>Rede Local (LAN) Multi-Postos</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigatePage('download')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-98"
            >
              <Download className="w-4 h-4" strokeWidth={1.75} />
              <span>Baixar KIVORA Setup (v{CURRENT_RELEASE.version})</span>
            </button>

            <button
              onClick={() => onNavigatePage('solucoes')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Ver Arquitetura em Rede</span>
              <ArrowRight className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
            </button>
          </div>

        </div>

        {/* Full-Width Cinema Product Carousel (The Visual Hero) */}
        <div className="pt-4">
          <HeroCarousel onNavigatePage={onNavigatePage} />
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center pt-2">
          <button
            onClick={scrollToExplore}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>Deslize para explorar módulos e conformidade</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" strokeWidth={1.75} />
          </button>
        </div>

      </div>
    </section>
  );
};

import React from 'react';
import { AnimatedText } from './AnimatedText';

interface PageHeroProps {
  image: string;
  tag?: string;
  title: string;
  sub?: string;
  imageFit?: 'contain' | 'cover';
}

/**
 * PageHero — Banner Showcase Premium para as páginas internas do site Kivora.
 * Utiliza o Navy/Azul Real Executivo Kivora com gradiente de alta sofisticação,
 * iluminação radial sutil e tipografia Geist/DM Sans.
 */
export const PageHero: React.FC<PageHeroProps> = ({
  image,
  tag,
  title,
  sub,
  imageFit,
}) => {
  // Auto-identifica imagens de pessoas para aterramento/grounding perfeito na base
  const isPerson =
    image &&
    (image.includes('jovem-empresario') ||
      image.includes('tablet') ||
      image.includes('parceiros'));

  // Auto-identifica imagens PNG transparentes / dispositivos
  const isCutout =
    imageFit === 'contain' ||
    isPerson ||
    (image && (image.includes('.png') || image.includes('pc-') || image.includes('pos')));

  return (
    <div className="relative w-full bg-gradient-to-br from-[#0B192C] via-[#0F224A] to-[#1746A2] text-white pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden border-b border-blue-900/60 select-none">
      
      {/* Luz ambiente sutil decorativa */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid sutil de fundo */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Coluna Texto (Esquerda) */}
          <div className="lg:col-span-7 space-y-4 text-left py-4">
            {tag && (
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-200 border border-white/20 bg-white/[0.08] px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-md font-display animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6500]" />
                <span>{tag}</span>
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white leading-[1.14] tracking-tight font-display">
              <AnimatedText text={title} el="span" mode="letter-stagger" className="text-white" />
            </h1>
            {sub && (
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed font-normal font-sans animate-fade-in" style={{ animationDelay: '200ms' }}>
                {sub}
              </p>
            )}
          </div>

          {/* Coluna Imagem — Renderização Livre, Aterrada na Base Sem Cortes */}
          <div className={`lg:col-span-5 flex relative ${
            isPerson 
              ? 'items-end justify-center lg:justify-end -mb-12 sm:-mb-16' 
              : 'items-center justify-center'
          }`}>
            {isCutout ? (
              <div className={`relative w-full max-w-sm sm:max-w-md lg:max-w-lg flex ${
                isPerson ? 'items-end justify-center lg:justify-end' : 'items-center justify-center'
              }`}>
                {/* Brilho de profundidade sutil no fundo */}
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-2xl pointer-events-none scale-90" />
                <img
                  src={image}
                  alt={title}
                  loading="eager"
                  decoding="async"
                  style={
                    isPerson
                      ? {
                          maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                        }
                      : undefined
                  }
                  className={`relative z-10 w-full h-auto select-none pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-103 ${
                    isPerson
                      ? 'max-h-[380px] sm:max-h-[460px] lg:max-h-[500px] object-contain object-bottom'
                      : 'max-h-[340px] sm:max-h-[420px] lg:max-h-[460px] object-contain'
                  }`}
                />
              </div>
            ) : (
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/15 aspect-[16/10]">
                  <img
                    src={image}
                    alt={title}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover object-center select-none"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

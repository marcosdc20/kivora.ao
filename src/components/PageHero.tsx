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
 * Utiliza o Azul Real Oficial Kivora com gradiente de alta elegância e enquadramento
 * executivo em vidro fosco (glassmorphism) adaptativo para evitar cortes em figuras humanas e dispositivos.
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
    <div className="relative w-full bg-gradient-to-r from-[#1746A2] via-[#1D4ED8] to-[#1E40AF] text-white pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden border-b border-blue-600/50">
      
      {/* Luz ambiente sutil decorativa */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Coluna Texto (Esquerda) */}
          <div className="lg:col-span-7 space-y-4 text-left py-4">
            {tag && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white border border-white/25 bg-white/15 px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-md animate-fade-in">
                {tag}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
              <AnimatedText text={title} el="span" mode="letter-stagger" className="text-white" />
            </h1>
            {sub && (
              <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed font-normal animate-fade-in" style={{ animationDelay: '200ms' }}>
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
                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl pointer-events-none scale-90" />
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
                  className={`relative z-10 w-full h-auto select-none pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:scale-105 ${
                    isPerson
                      ? 'max-h-[380px] sm:max-h-[460px] lg:max-h-[500px] object-contain object-bottom'
                      : 'max-h-[340px] sm:max-h-[420px] lg:max-h-[460px] object-contain'
                  }`}
                />
              </div>
            ) : (
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/40 border border-white/20 aspect-[16/10]">
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

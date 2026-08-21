import React from 'react';

interface PageHeroProps {
  image: string;
  tag?: string;
  title: string;
  sub?: string;
}

/**
 * PageHero — Banner Showcase para as páginas do site Kivora.
 * Exibe a fotografia 100% por completo em destaque na lateral (sem cortes de rostos)
 * e o conteúdo textual com máxima legibilidade e sofisticação visual.
 */
export const PageHero: React.FC<PageHeroProps> = ({
  image,
  tag,
  title,
  sub,
}) => {
  return (
    <div className="relative w-full bg-slate-950 text-white pt-28 sm:pt-36 pb-0 overflow-hidden border-b border-slate-800/80">
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* Coluna Texto (Esquerda) */}
          <div className="lg:col-span-7 space-y-4 text-left pb-12 sm:pb-16 lg:pb-20">
            {tag && (
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 rounded-full shadow-xs">
                {tag}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
              {title}
            </h1>
            {sub && (
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
                {sub}
              </p>
            )}
          </div>

          {/* Coluna Imagem - Exibição em destaque ancorada na base sem cortes artificiais */}
          <div className="lg:col-span-5 flex items-end justify-center self-end">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl relative flex items-end justify-center">
              <img
                src={image}
                alt={title}
                loading="eager"
                className="w-full h-auto max-h-[460px] sm:max-h-[540px] lg:max-h-[620px] object-contain object-bottom block select-none pointer-events-none"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

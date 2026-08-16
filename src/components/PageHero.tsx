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
    <div className="relative w-full bg-slate-950 text-white pt-28 sm:pt-36 pb-14 sm:pb-20 overflow-hidden border-b border-slate-800/80">
      
      {/* Efeitos de iluminação ambiente no fundo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Coluna Texto (Esquerda) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {tag && (
              <span className="inline-block text-xs font-black uppercase tracking-widest text-blue-400 border border-blue-500/40 bg-blue-500/10 px-3.5 py-1.5 rounded-full shadow-sm">
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

          {/* Coluna Imagem Completa (Direita) - Exibe a foto 100% inteira sem cortes de rostos */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/80 p-2 sm:p-2.5 backdrop-blur-sm group">
              <img
                src={image}
                alt={title}
                loading="eager"
                className="w-full h-auto max-h-[380px] sm:max-h-[420px] object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface PageHeroProps {
  image: string;
  tag?: string;
  title: string;
  sub?: string;
}

/**
 * PageHero — banner de imagem full-width no topo de cada página.
 * Inspirado em: Vercel, Linear, Framer.
 * Layout: imagem de fundo com overlay escuro + texto sobreposto no rodapé.
 */
export const PageHero: React.FC<PageHeroProps> = ({ image, tag, title, sub }) => {
  return (
    <div className="page-hero">
      <img src={image} alt={title} loading="eager" />
      <div className="page-hero-overlay" />
      <div className="page-hero-content">
        <div className="space-y-2">
          {tag && (
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm px-3 py-1 rounded-full">
              {tag}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            {title}
          </h1>
          {sub && (
            <p className="text-sm sm:text-base text-white/65 max-w-xl leading-relaxed pt-1">
              {sub}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

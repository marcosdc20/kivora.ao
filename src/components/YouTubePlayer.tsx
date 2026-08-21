import React, { useState } from 'react';
import { Play, Youtube, ExternalLink } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../services/systemSettingsService';

interface YouTubePlayerProps {
  videoUrl?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  posterImage?: string;
  aspectRatio?: 'video' | 'wide' | 'cinema';
  className?: string;
  accentColor?: 'blue' | 'emerald' | 'purple' | 'amber';
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoUrl,
  title,
  subtitle,
  badge = 'Vídeo Oficial',
  posterImage,
  aspectRatio = 'video',
  className = '',
  accentColor = 'blue',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  const accentColors = {
    blue: {
      glow: 'from-blue-600/20 via-indigo-500/10 to-transparent',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40',
      badge: 'bg-blue-600 text-white',
      border: 'border-blue-500/20',
    },
    emerald: {
      glow: 'from-emerald-600/20 via-teal-500/10 to-transparent',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40',
      badge: 'bg-emerald-600 text-white',
      border: 'border-emerald-500/20',
    },
    purple: {
      glow: 'from-purple-600/20 via-pink-500/10 to-transparent',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/40',
      badge: 'bg-purple-600 text-white',
      border: 'border-purple-500/20',
    },
    amber: {
      glow: 'from-amber-600/20 via-orange-500/10 to-transparent',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/40',
      badge: 'bg-amber-600 text-white',
      border: 'border-amber-500/20',
    },
  }[accentColor];

  const aspectClasses = {
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    cinema: 'aspect-[16/10]',
  }[aspectRatio];

  if (!videoUrl || !embedUrl) {
    return null;
  }

  return (
    <div className={`relative group w-full ${className}`}>
      
      {/* Halo de Luz Ambiente Subtil (Sem Molduras Rígidas de IA) */}
      <div className={`absolute -inset-4 bg-gradient-to-r ${accentColors.glow} rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10`} />

      {/* Container de Reprodução Orgânico e Sem Borda Pesada */}
      <div className={`relative w-full ${aspectClasses} rounded-3xl overflow-hidden shadow-2xl bg-slate-950/90 backdrop-blur-md`}>
        
        {isPlaying ? (
          <iframe
            src={`${embedUrl}&autoplay=1`}
            title={title || 'Vídeo Kivora'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center cursor-pointer group/cover" onClick={() => setIsPlaying(true)}>
            
            {/* Poster / Imagem de Fundo ou Gradiente Cinematográfico */}
            {posterImage ? (
              <img
                src={posterImage}
                alt={title || 'Vídeo'}
                className="absolute inset-0 w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-700 opacity-60"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/80 opacity-90" />
            )}

            {/* Overlay Escuro com Vinheta Suave */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Badges e Informações Superiores */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-10">
              {badge && (
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg ${accentColors.badge} flex items-center gap-1.5`}>
                  <Youtube className="w-3.5 h-3.5" />
                  <span>{badge}</span>
                </span>
              )}

              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-black/40 hover:bg-black/60 text-white/80 hover:text-white p-2 rounded-full backdrop-blur-md transition-all text-xs flex items-center gap-1 border border-white/10"
                title="Abrir no YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Botão de Play Central com Pulso Suave */}
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
              <div className="relative flex items-center justify-center">
                {/* Efeito de Ondulação */}
                <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 animate-ping" />
                <button
                  type="button"
                  aria-label="Reproduzir Vídeo"
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover/cover:scale-110 shadow-2xl ${accentColors.btn}`}
                >
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                </button>
              </div>

              {/* Título & Subtítulo Sobrepostos */}
              {(title || subtitle) && (
                <div className="max-w-lg space-y-1 mt-2">
                  {title && (
                    <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl drop-shadow-md">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-slate-300 text-xs sm:text-sm font-medium line-clamp-2 drop-shadow">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Dica no Canto Inferior */}
            <div className="absolute bottom-4 left-6 z-10 hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Clique em qualquer lugar para reproduzir em alta definição</span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

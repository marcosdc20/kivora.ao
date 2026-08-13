import React, { useState } from 'react';
import { ScrollReveal, ScrollRevealItem } from '../components/ScrollReveal';
import { NEWS_DATA } from '../data/school';
import { NewsPost } from '../types/school';
import { Newspaper, Calendar, Tag, ArrowRight } from 'lucide-react';

const CATEGORY_COLORS: Record<NewsPost['category'], string> = {
  'Comunicado': 'bg-blue-100 text-blue-700',
  'Evento': 'bg-green-100 text-green-700',
  'Notícia': 'bg-brand-gold/10 text-brand-gold',
  'Aviso': 'bg-red-100 text-red-700',
};

interface NoticiasPageProps {
  onSelectPost?: (post: NewsPost) => void;
}

export const NoticiasPage: React.FC<NoticiasPageProps> = ({ onSelectPost }) => {
  const [filterCat, setFilterCat] = useState<string>('');

  const filtered = filterCat
    ? NEWS_DATA.filter(n => n.category === filterCat)
    : NEWS_DATA;

  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HEADER */}
      <section className="bg-brand-navy py-16 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4 border border-blue-400/30">
              <Newspaper className="w-3.5 h-3.5 text-brand-amber" />
              Notícias & Comunicados
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Fique sempre <span className="text-blue-400">informado</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl">
              Notícias, comunicados, avisos e eventos — tudo centralizado no ecossistema Kivora.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* FILTROS */}
      <section className="bg-white border-b border-gray-100 py-4 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {['', 'Comunicado', 'Evento', 'Notícia', 'Aviso'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  filterCat === cat
                    ? 'bg-brand-green text-white shadow-md'
                    : 'bg-gray-100 text-brand-body hover:bg-brand-green-light hover:text-brand-green'
                }`}
              >
                {cat || 'Todos'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CARDS DAS NOTÍCIAS */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="stagger">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(news => (
                <ScrollRevealItem key={news.id}>
                  <div
                    className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer border border-brand-border hover:border-brand-green/30 transform hover:-translate-y-1"
                    onClick={() => onSelectPost && onSelectPost(news)}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/50 to-transparent" />
                      <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[news.category]}`}>
                        {news.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-extrabold text-brand-dark text-sm mb-2 leading-snug group-hover:text-brand-green transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-xs text-brand-body mb-3 line-clamp-2 leading-relaxed">{news.excerpt}</p>
                      <div className="flex items-center justify-between text-[10px] text-brand-body border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{news.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-brand-green font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Ler mais</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {news.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-brand-bg text-brand-body px-1.5 py-0.5 rounded-full">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
};

import React from 'react';
import { KIVORA_NEWS } from '../data/kivoraData';
import { NewsPost } from '../types/kivora';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface NoticiasPageProps {
  onSelectPost: (post: NewsPost) => void;
}

export const NoticiasPage: React.FC<NoticiasPageProps> = ({ onSelectPost }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner - Clean Light Neutral */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
            Legislação & Atualizações
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Notícias & Legislação Fiscal em Angola
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Fique a par das alterações tributárias da AGT e melhores práticas de gestão para a sua empresa.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {KIVORA_NEWS.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
              onClick={() => onSelectPost(post)}
            >
              <div className="h-52 bg-slate-100 overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">
                  {post.category}
                </span>
              </div>

              <div className="p-6 space-y-3 flex-grow">
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{post.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Por {post.author}</span>
                <span className="font-bold text-blue-600 flex items-center gap-1">
                  <span>Ler Artigo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

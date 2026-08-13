import React from 'react';
import { NewsPost } from '../types/kivora';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface NoticiaDetailPageProps {
  post: NewsPost;
  onBack: () => void;
}

export const NoticiaDetailPage: React.FC<NoticiaDetailPageProps> = ({ post, onBack }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner - Clean Light Neutral */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar às Notícias</span>
          </button>

          <span className="inline-block text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {post.category}
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{post.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.readTime}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.author}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          
          <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 max-h-96">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-slate max-w-none space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {post.content.map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={onBack}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              ← Voltar à lista de artigos
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

import React from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { NewsPost } from '../types/school';
import { ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';

const CATEGORY_COLORS: Record<NewsPost['category'], string> = {
  'Comunicado': 'bg-blue-100 text-blue-700',
  'Evento': 'bg-green-100 text-green-700',
  'Notícia': 'bg-brand-gold/10 text-brand-gold',
  'Aviso': 'bg-red-100 text-red-700',
};

interface NoticiaDetailPageProps {
  post: NewsPost;
  onBack?: () => void;
}

export const NoticiaDetailPage: React.FC<NoticiaDetailPageProps> = ({ post, onBack }) => {
  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HERO */}
      <section className="relative h-72 overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 w-full">
            <ScrollReveal variant="fade-up">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm font-bold mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar às Notícias</span>
              </button>
              <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full mb-3 ${CATEGORY_COLORS[post.category]}`}>
                {post.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{post.title}</h1>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-brand-body mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-green" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-green" />
                <span>{post.author}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs font-bold bg-brand-green-light text-brand-green px-2.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-lg text-brand-dark font-medium mb-6 leading-relaxed italic border-l-4 border-brand-green pl-4">
              {post.excerpt}
            </p>

            {/* Content */}
            <div className="prose prose-sm max-w-none text-brand-body leading-relaxed space-y-4">
              <p>{post.content}</p>
              <p>
                A plataforma Kivora continua a inovar para garantir que as organizações angolanas tenham acesso à melhor tecnologia de gestão integrada disponível. 
                A nossa missão é simplificar processos e elevar a eficiência das equipas no seu dia a dia.
              </p>
              <p>
                Para mais informações sobre este comunicado, entre em contacto com o suporte técnico ou aceda ao portal da Kivora.
              </p>
            </div>

            {/* Share */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-3">
              <Share2 className="w-4 h-4 text-brand-body" />
              <span className="text-sm text-brand-body font-medium">Partilhar:</span>
              <div className="flex gap-2">
                <button className="text-xs font-bold bg-brand-bg text-brand-body hover:bg-brand-green-light hover:text-brand-green px-3 py-1.5 rounded-full transition-colors">WhatsApp</button>
                <button className="text-xs font-bold bg-brand-bg text-brand-body hover:bg-brand-green-light hover:text-brand-green px-3 py-1.5 rounded-full transition-colors">Facebook</button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
};

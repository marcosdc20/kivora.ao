import React, { useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ArrowRight, FileText, Video, BookOpen, Download } from 'lucide-react';
import { PageId } from '../components/Header';

interface RecursosPageProps {
  onNavigatePage: (page: PageId) => void;
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('sr-visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export const RecursosPage: React.FC<RecursosPageProps> = ({ onNavigatePage }) => {
  useScrollReveal();

  const resources = [
    {
      icon: <FileText className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Documentação',
      title: 'Guia de Instalação Passo a Passo',
      desc: 'Manual completo para instalar o KIVORA em modo standalone ou em rede local com múltiplos postos.',
      action: 'Ler Guia',
    },
    {
      icon: <FileText className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Documentação',
      title: 'Manual de Faturação AGT DS.120',
      desc: 'Como configurar QR Code, assinatura digital RS256 e comunicação com o portal da AGT para conformidade fiscal.',
      action: 'Ler Manual',
    },
    {
      icon: <Video className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Tutoriais em Vídeo',
      title: 'Primeiros Passos com o KIVORA',
      desc: 'Vídeo passo-a-passo desde a instalação até à emissão da primeira fatura eletrónica.',
      action: 'Ver Vídeo',
    },
    {
      icon: <BookOpen className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Conformidade Fiscal',
      title: 'SAF-T Angola — Exportação e Submissão',
      desc: 'Como gerar o ficheiro SAF-T no KIVORA e como submetê-lo ao portal da AGT dentro do prazo legal.',
      action: 'Ver Guia',
    },
    {
      icon: <FileText className="w-5 h-5" strokeWidth={1.75} />,
      category: 'RH & Salários',
      title: 'Configuração IRT 2026',
      desc: 'Tabela de IRT 2026 já incluída no KIVORA. Este guia explica como processar o mapa de salários mensal.',
      action: 'Ler Guia',
    },
    {
      icon: <Download className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Downloads',
      title: 'Notas de Versão v2026.08',
      desc: 'Resumo de todas as novas funcionalidades, correções e melhorias na versão atual do KIVORA.',
      action: 'Ver Notas',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      <div className="pt-16">
        <PageHero
          image="/imagens/pacote.png"
          tag="Centro de Recursos"
          title="Documentação, tutoriais e guias de conformidade"
          sub="Tudo o que precisa para instalar, configurar e tirar o máximo partido do KIVORA."
        />
      </div>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res, i) => (
            <div
              key={i}
              data-reveal
              className="sr-init bg-white border border-slate-200 rounded-3xl p-7 flex flex-col gap-4 hover:border-blue-400/40 hover:shadow-lg transition-all group"
              style={{ transitionDelay: `${Math.min(i, 4) * 70}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {res.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{res.category}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-950 mb-2 leading-snug">{res.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{res.desc}</p>
              </div>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group/btn transition-colors self-start">
                <span>{res.action}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Baixar Instalador */}
      <section className="bg-slate-950 py-16 px-6 sm:px-10 lg:px-16">
        <div data-reveal className="sr-init max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-xl font-black mb-1">Pronto para instalar?</h3>
            <p className="text-slate-400 text-sm">Baixe o instalador KIVORA v2026.08 e comece hoje.</p>
          </div>
          <button
            onClick={() => onNavigatePage('download')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            <span>Ir para Downloads</span>
          </button>
        </div>
      </section>

    </div>
  );
};

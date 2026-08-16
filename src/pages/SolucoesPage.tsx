import React, { useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { CheckCircle2, Monitor, Network, Server, ArrowRight, Download } from 'lucide-react';
import { PageId } from '../components/Header';

interface SolucoesPageProps {
  onOpenDemoModal: (subject?: string) => void;
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

export const SolucoesPage: React.FC<SolucoesPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      {/* Hero com imagem */}
      <PageHero
        image="/imagens/136227.jpg"
        tag="Arquitetura Local"
        title="Soluções para cada tipo de empresa"
        sub="PC único ou rede com múltiplos postos — o KIVORA adapta-se à sua estrutura sem depender de internet."
      />

      {/* Secção 1 — PC Único */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div data-reveal className="sr-init space-y-5">
          <div className="inline-flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Monitor className="w-4 h-4" strokeWidth={1.75} />
            <span>Modo Standalone — PC Único</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
            Para lojas, consultórios<br />e escritórios com 1 posto.
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md">
            Instale o KIVORA diretamente no seu computador de trabalho. A base de dados fica no disco rígido do PC — rápido, simples, 100% offline.
          </p>
          <ul className="space-y-2.5">
            {[
              'Instalação em menos de 2 minutos',
              'Sem infraestrutura de rede dedicada',
              'Backup rápido para Pen Drive USB',
              'Ideal para pequenos negócios e startups',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigatePage('download')}
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            <span>Baixar Instalador</span>
          </button>
        </div>
        <div data-reveal className="sr-init sr-right">
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
            <img src="/imagens/pacote-de-instalação-com-disco.png" alt="KIVORA Standalone" className="w-full h-auto object-cover" />
          </div>
        </div>
      </section>

      {/* Secção 2 — Rede LAN */}
      <section className="bg-slate-950 py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div data-reveal className="sr-init sr-left order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src="/imagens/servidor.png" alt="Rede LAN KIVORA" className="w-full h-auto object-cover" />
            </div>
          </div>
          <div data-reveal className="sr-init order-1 lg:order-2 space-y-5">
            <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Network className="w-4 h-4" strokeWidth={1.75} />
              <span>Rede Local — Multi-Postos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Múltiplas caixas,<br />em simultâneo.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Configure um PC principal como servidor local e ligue caixas, gerência e armazém na mesma rede LAN. Dados partilhados em milissegundos, sem internet.
            </p>
            <ul className="space-y-2.5">
              {[
                'Stock atualizado em todos os postos em tempo real',
                'Permissões por utilizador e por posto',
                'Fechos de caixa independentes por turno',
                'Funciona mesmo sem conexão à internet',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onOpenDemoModal('Rede Local')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
            >
              <span>Falar com Técnico de Redes</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* Diagrama de Arquitetura */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
        <div data-reveal className="sr-init text-center mb-14">
          <h2 className="text-3xl font-black text-slate-950">Arquitetura em Rede Local</h2>
          <p className="text-slate-500 text-sm mt-2">Como os postos se interligam sem internet</p>
        </div>
        <div data-reveal className="sr-init sr-scale flex flex-col items-center gap-4">
          {/* Servidor */}
          <div className="bg-slate-950 text-white rounded-2xl px-10 py-5 flex items-center gap-4 shadow-2xl w-full max-w-sm">
            <Server className="w-8 h-8 text-blue-400 shrink-0" strokeWidth={1.5} />
            <div>
              <strong className="block text-sm font-black">PC Servidor Principal</strong>
              <span className="text-slate-400 text-xs">Base de Dados Central — KIVORA Server</span>
            </div>
          </div>
          {/* Linha vertical */}
          <div className="w-[1px] h-8 bg-slate-300" />
          {/* Rótulo LAN */}
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
            Rede Local / LAN (Switch ou Wi-Fi)
          </div>
          <div className="w-[1px] h-8 bg-slate-300" />
          {/* Postos */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
            {['PC Caixa 1', 'PC Gerência', 'PC Armazém'].map((posto) => (
              <div key={posto} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <Monitor className="w-5 h-5 text-blue-600 mx-auto mb-2" strokeWidth={1.75} />
                <span className="text-xs font-bold text-slate-900 block">{posto}</span>
                <span className="text-[10px] text-slate-400">KIVORA Client</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

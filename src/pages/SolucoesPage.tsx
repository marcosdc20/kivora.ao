import React, { useEffect, useState } from 'react';
import { PageHero } from '../components/PageHero';
import { CheckCircle2, Monitor, Network, Server, ArrowRight, Download } from 'lucide-react';
import { PageId } from '../components/Header';
import { subscribeSystemSettings, getCachedSystemSettings } from '../services/systemSettingsService';

import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';
import executivosImg from '../assets/kivora/executivos-kivora.jpg';
import restauranteImg from '../assets/kivora/restaurante-kivora.jpg';

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
  const [settings, setSettings] = useState(getCachedSystemSettings());

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      {/* Hero com imagem */}
      <PageHero
        image={settings.heroImageUrl || executivosImg}
        tag="Arquitetura Local"
        title="Soluções para cada tipo de empresa"
        sub="PC único ou rede com múltiplos postos — o KIVORA adapta-se à sua estrutura sem depender de internet."
      />

      {/* Secção 1 — PC Único */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div data-reveal className="sr-init space-y-6">
          <div className="inline-flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
            <Monitor className="w-4 h-4" strokeWidth={1.75} />
            <span>Modo Standalone — PC Único</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-950 leading-tight">
            Para lojas, consultórios<br />e escritórios com 1 posto.
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md font-normal">
            Instale o KIVORA diretamente no seu computador de trabalho. A base de dados fica no disco rígido do PC — rápido, simples, 100% offline.
          </p>
          <ul className="space-y-3">
            {[
              'Instalação em menos de 2 minutos',
              'Sem infraestrutura de rede dedicada',
              'Backup rápido para Pen Drive USB com 1 clique',
              'Ideal para pequenos negócios, boutiques e startups',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <button
              onClick={() => onNavigatePage('download')}
              className="btn-cta text-sm font-bold px-7 py-4 rounded-xl transition-all shadow-xl shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              <span>Baixar Instalador Oficial</span>
            </button>
          </div>
        </div>
        <div data-reveal className="sr-init sr-right">
          <div className="surface-card overflow-hidden p-2.5 bg-slate-100/80">
            <img src={settings.moduleStockImageUrl || supermercadoImg} alt="KIVORA Standalone" className="w-full h-auto object-cover rounded-2xl shadow-sm" />
          </div>
        </div>
      </section>

      {/* Secção 2 — Rede LAN */}
      <section className="bg-[#0B192C] py-24 text-white relative overflow-hidden border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center relative z-10">
          <div data-reveal className="sr-init sr-left order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden border border-white/15 shadow-2xl p-2.5 bg-white/5 backdrop-blur-md">
              <img src={settings.moduleRestauranteImageUrl || restauranteImg} alt="Rede LAN KIVORA" className="w-full h-auto object-cover rounded-2xl" />
            </div>
          </div>
          <div data-reveal className="sr-init order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
              <Network className="w-4 h-4" strokeWidth={1.75} />
              <span>Rede Local — Multi-Postos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white leading-tight">
              Múltiplas caixas,<br />em simultâneo.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md font-normal">
              Configure um PC principal como servidor local e ligue caixas, gerência e armazém na mesma rede LAN. Dados partilhados em milissegundos, sem internet.
            </p>
            <ul className="space-y-3">
              {[
                'Stock atualizado em todos os postos em tempo real',
                'Permissões por utilizador e por posto',
                'Fechos de caixa independentes por turno',
                'Funciona mesmo sem conexão à internet',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onOpenDemoModal('Rede Local')}
                className="btn-cta text-sm font-bold px-8 py-4 rounded-xl shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Falar com Técnico de Redes</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Diagrama de Arquitetura */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
        <div className="surface-card p-8 sm:p-14 space-y-12">
          <div data-reveal className="sr-init text-center space-y-2">
            <span className="text-xs font-bold uppercase text-blue-700 tracking-wider bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">Diagrama Operacional</span>
            <h2 className="text-3xl font-bold font-display text-slate-950 mt-3">Arquitetura em Rede Local</h2>
            <p className="text-slate-500 text-sm font-normal">Como os postos se interligam sem qualquer dependência da internet</p>
          </div>
          <div data-reveal className="sr-init sr-scale flex flex-col items-center gap-4">
            {/* Servidor */}
            <div className="bg-[#0B192C] text-white rounded-2xl px-8 py-5 flex items-center gap-5 shadow-xl w-full max-w-md border border-slate-800 group hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0">
                <Server className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div>
                <strong className="block text-base font-bold font-display text-white">PC Servidor Principal</strong>
                <span className="text-slate-300 text-xs font-normal">Base de Dados Central — KIVORA Server</span>
              </div>
            </div>
            {/* Linha vertical */}
            <div className="w-[2px] h-8 bg-blue-500/40" />
            {/* Rótulo LAN */}
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-5 py-2 rounded-full border border-blue-200 shadow-xs">
              Rede Local / LAN (Switch Ethernet ou Wi-Fi)
            </div>
            <div className="w-[2px] h-8 bg-blue-500/40" />
            {/* Postos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
              {['PC Caixa 1', 'PC Gerência', 'PC Armazém'].map((posto) => (
                <div key={posto} className="surface-card p-5 text-center hover:border-blue-300 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Monitor className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-bold font-display text-slate-900 block">{posto}</span>
                  <span className="text-[11px] text-slate-400 font-medium">KIVORA Client</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-[#0B192C] py-20 px-6 sm:px-10 lg:px-16 text-white text-center border-t border-slate-800">
        <div data-reveal className="sr-init max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight leading-tight">
            Pronto para implementar a solução ideal na sua empresa?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto font-normal">
            Fale com a nossa equipa técnica para dimensionar o número de postos e periféricos para o seu estabelecimento.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenDemoModal('Dimensionamento de Rede')}
              className="btn-cta text-sm font-bold px-8 py-4 rounded-xl shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Solicitar Estudo de Rede Gratuito</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigatePage('download')}
              className="px-7 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar KIVORA Setup</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { PageHero } from '../components/PageHero';
import { KIVORA_MODULES } from '../data/kivoraData';
import { KivoraModule } from '../types/kivora';
import { CheckCircle2, ArrowRight, Search } from 'lucide-react';

import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';

interface ModulosPageProps {
  onSelectModule: (module: KivoraModule) => void;
  onOpenDemoModal: (subject?: string) => void;
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('sr-visible'); obs.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'faturacao', label: 'Faturação' },
  { id: 'pos', label: 'POS' },
  { id: 'financas', label: 'Finanças' },
  { id: 'stock', label: 'Stock' },
  { id: 'rh', label: 'RH & Salários' },
  { id: 'contabilidade', label: 'Contabilidade' },
];

export const ModulosPage: React.FC<ModulosPageProps> = ({ onSelectModule, onOpenDemoModal }) => {
  useScrollReveal();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('todos');

  const modules = KIVORA_MODULES.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.shortDesc.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'todos' || m.category === cat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      {/* Hero */}
      <PageHero
        image={supermercadoImg}
        tag="Catálogo de Módulos"
        title="Funcionalidades especializadas para a sua atividade"
        sub="Do talão ao balanço, o KIVORA cobre todas as operações da sua empresa numa única plataforma instalada localmente."
      />

      {/* Filtros */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 pt-12 pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                  cat === c.id
                    ? 'bg-slate-950 text-white border-slate-950 shadow-sm font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Pesquisar módulo ou setor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Grid de Módulos */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-10">
        {modules.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Nenhum módulo encontrado. Tente outro termo de pesquisa.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <div
                key={mod.id}
                data-reveal
                className="sr-init card-premium rounded-3xl p-6 sm:p-7 flex flex-col justify-between group cursor-pointer"
                style={{ transitionDelay: `${Math.min(i, 5) * 70}ms` }}
                onClick={() => onSelectModule(mod)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-lg">
                      {mod.badge || 'Módulo'}
                    </span>
                    <span className="text-[11px] font-mono-num font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Homologado AGT
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-950 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{mod.shortDesc}</p>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    {mod.features.slice(0, 3).map((feat, fi) => (
                      <div key={fi} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.25} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-5 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                    Ver ficha técnica
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-bold font-mono-num text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    100% Offline LAN
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Premium */}
      <section className="bg-slate-950 py-20 px-6 sm:px-10 lg:px-16 border-t border-slate-800">
        <div data-reveal className="sr-init max-w-3xl mx-auto text-center text-white space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            Implementação Assistida
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Precisa de uma solução personalizada para o seu negócio?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xl mx-auto">
            O KIVORA adapta-se com precisão ao seu ramo de atividade: retalho, restauração, farmácias, supermercados ou prestação de serviços em Angola.
          </p>
          <button
            onClick={() => onOpenDemoModal('Solução Personalizada')}
            className="btn-premium-primary inline-flex items-center gap-2 text-sm px-8 py-4 rounded-2xl cursor-pointer"
          >
            <span>Falar com Consultor Especialista</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </section>

    </div>
  );
};

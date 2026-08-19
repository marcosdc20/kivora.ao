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
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                  cat === c.id
                    ? 'bg-slate-950 text-white border-slate-950'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Pesquisar módulo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Grid de Módulos */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-12">
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
                className="sr-init bg-white border border-slate-200 rounded-3xl p-7 flex flex-col gap-5 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-600/5 transition-all group cursor-pointer"
                style={{ transitionDelay: `${Math.min(i, 5) * 70}ms` }}
                onClick={() => onSelectModule(mod)}
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                    {mod.badge || 'Módulo'}
                  </span>
                  <h3 className="mt-3 text-lg font-black text-slate-950 group-hover:text-blue-600 transition-colors leading-tight">
                    {mod.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{mod.shortDesc}</p>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {mod.features.slice(0, 3).map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors flex items-center gap-1">
                    Ver ficha técnica
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-slate-950 py-20 px-6 sm:px-10 lg:px-16">
        <div data-reveal className="sr-init max-w-3xl mx-auto text-center text-white space-y-5">
          <h2 className="text-3xl font-black">Precisa de uma solução personalizada?</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            O KIVORA pode ser configurado para retalho, restauração, farmácia, supermercado ou prestação de serviços.
          </p>
          <button
            onClick={() => onOpenDemoModal('Solução Personalizada')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-7 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/30"
          >
            <span>Falar com Consultor</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </section>

    </div>
  );
};

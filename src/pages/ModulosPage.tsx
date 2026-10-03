import React, { useState } from 'react';
import { PageHero } from '../components/PageHero';
import { KIVORA_MODULES } from '../data/kivoraData';
import { KivoraModule } from '../types/kivora';
import { CheckCircle2, ArrowRight, Search } from 'lucide-react';

import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';

interface ModulosPageProps {
  onSelectModule: (module: KivoraModule) => void;
  onOpenDemoModal: (subject?: string) => void;
}

import { useScrollReveal } from '../hooks/useScrollReveal';

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
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer font-tight ${
                  cat === c.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1746A2] focus:bg-white focus:ring-2 focus:ring-[#1746A2]/15 transition-all"
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
            {modules.map((mod, i) => {
              const colorMap: Record<string, { badge: string; borderAccent: string }> = {
                faturacao: { badge: 'bg-blue-50 text-blue-700 border-blue-200/80', borderAccent: 'hover:border-blue-300' },
                pos:        { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', borderAccent: 'hover:border-emerald-300' },
                financas:   { badge: 'bg-amber-50 text-amber-700 border-amber-200/80', borderAccent: 'hover:border-amber-300' },
                stock:      { badge: 'bg-purple-50 text-purple-700 border-purple-200/80', borderAccent: 'hover:border-purple-300' },
                rh:         { badge: 'bg-rose-50 text-rose-700 border-rose-200/80', borderAccent: 'hover:border-rose-300' },
                contabilidade: { badge: 'bg-teal-50 text-teal-700 border-teal-200/80', borderAccent: 'hover:border-teal-300' },
              };
              const c = colorMap[mod.category] || colorMap['faturacao'];
              return (
                <div
                  key={mod.id}
                  data-reveal
                  className={`surface-card p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 bg-white ${c.borderAccent}`}
                  style={{ transitionDelay: `${Math.min(i, 5) * 50}ms` }}
                  onClick={() => onSelectModule(mod)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-md font-tight ${c.badge}`}>
                        {mod.badge || 'Módulo'}
                      </span>
                      <span className="text-[11px] font-mono-num font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Offline LAN
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold font-display text-slate-900 group-hover:text-[#1746A2] transition-colors leading-tight mb-2">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{mod.shortDesc}</p>

                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      {mod.features.slice(0, 3).map((feat, fi) => (
                        <div key={fi} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                          <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-5 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-semibold text-[#1746A2] group-hover:text-blue-700 transition-colors flex items-center gap-1 font-tight">
                      Ver ficha técnica
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                    </span>
                    <span className="text-[11px] font-semibold font-mono-num text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      100% Offline
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Premium */}
      <section className="bg-[#0B192C] py-20 px-6 sm:px-10 lg:px-16 border-t border-slate-800 text-white relative overflow-hidden">
        <div data-reveal className="max-w-3xl mx-auto text-center text-white space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider font-tight">
            Implementação Assistida
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold font-display tracking-tight text-white leading-tight">
            Precisa de uma solução personalizada para o seu negócio?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xl mx-auto font-normal">
            O KIVORA adapta-se com precisão ao seu ramo de atividade: retalho, restauração, farmácias, supermercados ou prestação de serviços em Angola.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenDemoModal('Solução Personalizada')}
              className="btn-cta text-sm px-8 py-3.5 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Falar com Consultor Especialista</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

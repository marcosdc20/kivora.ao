import React, { useState } from 'react';
import { KIVORA_MODULES } from '../data/kivoraData';
import { KivoraModule } from '../types/kivora';
import { CheckCircle2, ArrowRight, Search } from 'lucide-react';

interface ModulosPageProps {
  onSelectModule: (module: KivoraModule) => void;
  onOpenDemoModal: (moduleTitle?: string) => void;
}

export const ModulosPage: React.FC<ModulosPageProps> = ({ onSelectModule, onOpenDemoModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Módulos' },
    { id: 'faturacao', label: 'Faturação AGT' },
    { id: 'pos', label: 'POS de Balcão' },
    { id: 'financas', label: 'Finanças' },
    { id: 'stock', label: 'Stock & Armazém' },
    { id: 'rh', label: 'RH & Salários 2026' },
    { id: 'contabilidade', label: 'Contabilidade & SAF-T' },
  ];

  const filteredModules = KIVORA_MODULES.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'todos' || m.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white page-transition-enter">
      
      {/* Header Banner */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
            Catálogo Funcional do KIVORA ERP
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Módulos Especialistas de Gestão e Faturação
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Conheça as capacidades técnicas de cada módulo do sistema KIVORA, desenhado especificamente para a legislação e operação comercial em Angola.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Categories Buttons */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
                  selectedCat === cat.id
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Pesquisar funcionalidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none"
            />
          </div>

        </div>
      </section>

      {/* Modules Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModules.map((moduleItem) => (
            <div
              key={moduleItem.id}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                    {moduleItem.badge || 'Módulo Kivora'}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-950 group-hover:text-blue-600 transition-colors">
                  {moduleItem.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {moduleItem.shortDesc}
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Principais Recursos:</span>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    {moduleItem.features.slice(0, 4).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectModule(moduleItem)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5"
                >
                  <span>Ver ficha técnica completa</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Precisa de uma Solução Personalizada para a Sua Atividade?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            O KIVORA possui configurações especializadas para Retalho, Restauração, Supermercados, Farmácias e Empresas de Prestação de Serviços.
          </p>
          <button
            onClick={() => onOpenDemoModal('Consulta de Módulos')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
          >
            Falar com Consultor Comercial
          </button>
        </div>
      </section>

    </div>
  );
};

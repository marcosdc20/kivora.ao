import React, { useState } from 'react';
import { RESOURCE_GUIDES } from '../data/kivoraData';
import { ChevronRight, Download } from 'lucide-react';

interface RecursosPageProps {
  onNavigatePage: (page: any) => void;
}

export const RecursosPage: React.FC<RecursosPageProps> = ({ onNavigatePage }) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>('guia-instalacao');

  const selectedGuide = RESOURCE_GUIDES.find((g) => g.id === selectedGuideId) || RESOURCE_GUIDES[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
            Base de Conhecimento & Recursos
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Guias Técnicos e Manuais de Utilização
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Consulte documentação prática sobre instalação, configuração em rede local, backups e emissão do SAF-T (AO).
          </p>
        </div>
      </section>

      {/* Main Guides Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Guides Navigation Menu */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Selecione o Guia Técnico
            </h3>

            {RESOURCE_GUIDES.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setSelectedGuideId(guide.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedGuideId === guide.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">{guide.title}</h4>
                  <span className={`text-[10px] block mt-0.5 ${selectedGuideId === guide.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    Tempo de leitura: {guide.readTime}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${selectedGuideId === guide.id ? 'text-white' : 'text-slate-400'}`} />
              </button>
            ))}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-6 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Precisa do Ficheiro Setup?</span>
              <p className="text-[11px] text-slate-600">Descarregue a versão instalável oficial para Windows.</p>
              <button
                onClick={() => onNavigatePage('download')}
                className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ir para Downloads</span>
              </button>
            </div>
          </div>

          {/* Right Column: Guide Details Content */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              
              <div className="space-y-2 border-b border-slate-100 pb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-100">
                  {selectedGuide.category}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {selectedGuide.title}
                </h2>
                <p className="text-xs text-slate-600">
                  {selectedGuide.summary}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Passos de Execução
                </h3>

                <div className="space-y-3">
                  {selectedGuide.steps.map((stepText, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {stepText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

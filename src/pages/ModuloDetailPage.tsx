import React from 'react';
import { KivoraModule } from '../types/kivora';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { LiveFiscalReceipt } from '../components/LiveFiscalReceipt';

interface ModuloDetailPageProps {
  module: KivoraModule;
  onBack: () => void;
  onOpenDemoModal: (moduleTitle?: string) => void;
}

export const ModuloDetailPage: React.FC<ModuloDetailPageProps> = ({
  module,
  onBack,
  onOpenDemoModal,
}) => {
  const isFaturacao = module.id === 'faturacao-agt';

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white page-transition-enter">
      
      {/* Header Banner */}
      <section className="bg-mesh border-b border-slate-200/80 py-14 relative overflow-hidden shadow-xs">
        <div className="orb orb-blue w-48 h-48 -top-12 -right-12 opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>Voltar aos Módulos</span>
          </button>

          <div className="space-y-2">
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-100/70 px-3.5 py-1 rounded-full border border-blue-200/70 inline-block">
              {module.badge || 'Módulo KIVORA ERP'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight">
              {module.title}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
              {module.shortDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Main Details Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Overview & Screenshot / Live Demonstrator Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-950">
              Visão Geral e Arquitetura
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {module.description}
            </p>

            {module.agtSpec && (
              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/80 space-y-1">
                <strong className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
                  <span>Conformidade Fiscal AGT</span>
                </strong>
                <p className="text-xs text-blue-900">
                  {module.agtSpec}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onOpenDemoModal(module.title)}
                className="bg-[#FF6500] hover:bg-[#EB5B00] text-white font-bold text-xs sm:text-sm px-8 py-4 rounded-2xl shadow-xl shadow-orange-600/30 transition-all cursor-pointer hover:-translate-y-1 shimmer-button"
              >
                Solicitar Demonstração Deste Módulo
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center items-center">
            {isFaturacao ? (
              <LiveFiscalReceipt />
            ) : (
              <div className="w-full p-3 bg-slate-100/80 rounded-3xl border border-slate-200/90 shadow-2xl">
                <img
                  src={module.image}
                  alt={module.title}
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>
            )}
          </div>

        </div>

        {/* Features & Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Features */}
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 card-glow-blue">
            <h3 className="text-lg font-extrabold text-slate-950">
              Recursos e Funcionalidades Técnicas
            </h3>
            <ul className="space-y-3 text-xs text-slate-700 font-medium">
              {module.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-emerald-50/70 via-white to-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 card-glow-green">
            <h3 className="text-lg font-extrabold text-slate-950">
              Ganhos para a Operação da Sua Empresa
            </h3>
            <ul className="space-y-3 text-xs text-slate-700 font-medium">
              {module.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </section>

    </div>
  );
};

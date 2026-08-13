import React from 'react';
import { KIVORA_PLANS } from '../data/kivoraData';
import { CheckCircle2, ArrowRight, Monitor, Network, Building, Key } from 'lucide-react';

interface FinanceiroPageProps {
  onOpenDemoModal: (planName?: string) => void;
}

export const FinanceiroPage: React.FC<FinanceiroPageProps> = ({ onOpenDemoModal }) => {
  const getPlanIcon = (iconName: string) => {
    switch (iconName) {
      case 'Monitor':
        return <Monitor className="w-5 h-5 text-blue-600" strokeWidth={1.75} />;
      case 'Network':
        return <Network className="w-5 h-5 text-blue-600" strokeWidth={1.75} />;
      case 'Building':
        return <Building className="w-5 h-5 text-blue-600" strokeWidth={1.75} />;
      default:
        return <Key className="w-5 h-5 text-blue-600" strokeWidth={1.75} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white page-transition-enter">
      
      {/* Header Banner */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
            Licenciamento & Planos
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Licenças Transparentes para a Sua Empresa
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Escolha o modelo de licenciamento adequado à quantidade de computadores da sua empresa. Sem custos ocultos.
          </p>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {KIVORA_PLANS.map((plan) => {
            const isPopular = plan.popular;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-8 border flex flex-col justify-between space-y-8 transition-all relative ${
                  isPopular
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xl'
                    : 'border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Recomendado para Empresas
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-slate-100 rounded-xl">
                      {getPlanIcon(plan.icon)}
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {plan.billingPeriod}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-950">
                    {plan.name}
                  </h3>

                  <p className="text-xs text-slate-600 min-h-[36px] leading-relaxed">
                    {plan.target}
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                      {plan.priceAOA}
                    </span>
                  </div>

                  <ul className="space-y-2.5 pt-4 text-xs text-slate-700 font-medium">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onOpenDemoModal(`Licença: ${plan.name}`)}
                    className={`w-full font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                    }`}
                  >
                    <span>Adquirir Esta Licença</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* License Manager Overview Box */}
      <section className="bg-slate-50 border-t border-slate-200/80 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
              License Manager Integrado
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Como Funciona a Ativação da Licença no Software
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              O KIVORA possui um gestor de licenças local para ativação e controlo dos postos autorizados.
            </p>
          </div>

          {/* License Preview Widget */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gestor de Licença KIVORA</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ATIVA</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Empresa Registada:</span>
                <strong className="text-slate-900 block font-bold">SUA EMPRESA, LDA</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Modalidade:</span>
                <strong className="text-slate-900 block font-bold">Licença Anual PME</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Postos em Rede LAN:</span>
                <strong className="text-slate-900 block font-bold">3 / 5 Computadores</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Validade:</span>
                <strong className="text-slate-900 block font-bold">12 Meses com Suporte</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

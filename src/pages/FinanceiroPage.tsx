import React, { useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface FinanceiroPageProps {
  onOpenDemoModal: (subject?: string) => void;
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

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'mensal',
    name: 'Mensal',
    price: '15.000',
    period: '/ mês',
    desc: 'Ideal para experimentar ou negócios sazonais.',
    features: [
      '2 postos de trabalho em rede LAN',
      'Faturação eletrónica AGT',
      'POS de balcão',
      'Gestão de stock básica',
      'Suporte por email',
    ],
  },
  {
    id: 'anual',
    name: 'Anual',
    price: '120.000',
    period: '/ ano',
    desc: 'A escolha mais popular. Poupe 33% em relação ao mensal.',
    features: [
      'Tudo do plano Mensal',
      'Até 5 postos de trabalho em rede LAN',
      'Módulo de Recursos Humanos',
      'IRT 2026 incluído',
      'Exportação SAF-T Angola',
      'Suporte prioritário',
    ],
    highlight: true,
  },
  {
    id: 'ilimitado',
    name: 'Ilimitado',
    price: 'Sob Consulta',
    period: '',
    desc: 'Para empresas com múltiplos postos e necessidades específicas.',
    features: [
      'Postos ilimitados em rede LAN',
      'Configuração e instalação no local',
      'Módulos customizados por atividade',
      'Formação de equipa incluída',
      'Gestor de conta dedicado',
      'SLA de suporte técnico 8h',
    ],
  },
];

export const FinanceiroPage: React.FC<FinanceiroPageProps> = ({ onOpenDemoModal }) => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      {/* Hero */}
      <div className="pt-16">
        <PageHero
          image="/imagens/pacote.png"
          tag="Licenças e Preços"
          title="Escolha a licença certa para a sua empresa"
          sub="Pagamento único ou anual, sem contratos longos. Inclui instalação, suporte e todas as atualizações."
        />
      </div>

      {/* Planos */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              data-reveal
              className={`sr-init rounded-3xl p-8 border flex flex-col gap-6 transition-all ${
                plan.highlight
                  ? 'bg-slate-950 border-slate-800 shadow-2xl shadow-slate-950/30 ring-1 ring-blue-500/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {plan.highlight && (
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full self-start">
                  Mais Popular
                </span>
              )}
              <div>
                <h3 className={`text-lg font-black mb-1 ${plan.highlight ? 'text-white' : 'text-slate-950'}`}>{plan.name}</h3>
                <div className={`flex items-baseline gap-1 ${plan.highlight ? 'text-white' : 'text-slate-950'}`}>
                  {plan.price !== 'Sob Consulta' && (
                    <span className="text-xs font-semibold text-slate-400">Kz</span>
                  )}
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
                </div>
                <p className={`text-xs mt-2 leading-relaxed ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feat, fi) => (
                  <li key={fi} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-500'}`} strokeWidth={2} />
                    <span className={plan.highlight ? 'text-slate-300' : 'text-slate-700'}>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onOpenDemoModal(`Licença ${plan.name}`)}
                className={`w-full inline-flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-all hover:-translate-y-0.5 ${
                  plan.highlight
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                <span>{plan.price === 'Sob Consulta' ? 'Solicitar Proposta' : 'Adquirir Licença'}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ rápido */}
      <section className="border-t border-slate-100 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div data-reveal className="sr-init mb-10">
          <h3 className="text-2xl font-black text-slate-950">Perguntas frequentes sobre licenças</h3>
        </div>
        <div className="space-y-5">
          {[
            { q: 'A licença inclui atualizações?', a: 'Sim. Todas as atualizações de conformidade fiscal (IRT, SAF-T, DS.120) são incluídas durante o período de validade da licença.' },
            { q: 'Posso instalar em mais de um computador?', a: 'Depende do plano. O Mensal permite até 2 postos em rede local, o Anual até 5 postos LAN, e o Ilimitado não tem restrição. Pode ainda aumentar o número de terminais individualmente através do Admin Portal.' },
            { q: 'O que acontece quando a licença expira?', a: 'O sistema continua a funcionar para consulta, mas não permite emitir novas faturas até renovar a licença.' },
          ].map((faq, i) => (
            <div key={i} data-reveal className="sr-init border-b border-slate-100 pb-5" style={{ transitionDelay: `${i * 80}ms` }}>
              <h4 className="font-bold text-slate-900 mb-1">{faq.q}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

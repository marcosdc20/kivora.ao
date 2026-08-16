import React, { useState } from 'react';
import { PageHero } from '../components/PageHero';
import { CheckCircle2, ArrowRight, Calculator, ShieldCheck, Key, HelpCircle, Monitor, Sparkles } from 'lucide-react';
import { PageId } from '../components/Header';

interface FinanceiroPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage?: (page: PageId) => void;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlight?: boolean;
  ctaText: string;
}

const PLANS: Plan[] = [
  {
    id: 'mensal',
    name: 'Mensal Standalone',
    price: '25.000',
    period: '/ mês',
    desc: 'Flexibilidade total sem contratos de fidelização. Ideal para 1 computador isolado.',
    features: [
      '1 Posto de Trabalho Standalone',
      'Faturação Eletrónica AGT DS.120 com QR Code',
      'POS de Balcão e Fecho de Caixa',
      'Gestão de Stock Básica',
      'Exportação SAF-T AO mensal',
      'Atualizações fiscais incluídas',
      'Suporte por email e WhatsApp em horário comercial',
    ],
    ctaText: 'Aderir ao Plano Mensal',
  },
  {
    id: 'anual',
    name: 'Anual Multi-Postos',
    price: '250.000',
    period: '/ ano',
    desc: 'A opção mais vantajosa para pequenas e médias empresas. Poupe mais de 16% e ganhe postos em rede LAN.',
    features: [
      'Até 5 Postos de Trabalho em Rede LAN',
      'Tudo do Plano Mensal incluído',
      'Módulo de Recursos Humanos & IRT 2026',
      'Contabilidade PGC-AO & SAF-T Completo',
      'Multidepósito e Controlo de Validades de Stock',
      'Suporte Técnico Prioritário (SLA 4h)',
      'Formação inicial da equipa incluída',
    ],
    highlight: true,
    ctaText: 'Adquirir Licença Anual',
  },
  {
    id: 'ilimitado',
    name: 'Corporativo & Rede Ilimitada',
    price: 'Sob Consulta',
    period: '',
    desc: 'Para empresas com múltiplos estabelecimentos, cadeias de lojas e requisitos à medida.',
    features: [
      'Postos ilimitados em Rede Local / Servidor Dedicado',
      'Instalação e parametrização presencial no local',
      'Módulos customizados por ramo de atividade',
      'Formação presencial certificada para operadores',
      'Gestor de conta executivo dedicado',
      'SLA de Suporte Técnico em até 2 horas',
      'Backup automático local com espelhamento',
    ],
    ctaText: 'Solicitar Proposta à Medida',
  },
];

export const FinanceiroPage: React.FC<FinanceiroPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  // Simulador de Investimento
  const [terminals, setTerminals] = useState<number>(3);
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  // Cálculo da simulação
  const baseMonthlyPerTerminal = 15000;
  const baseAnnualPerTerminal = 120000; // Desconto de ~33%
  
  const estimatedPrice = billingCycle === 'annual'
    ? terminals * baseAnnualPerTerminal
    : terminals * baseMonthlyPerTerminal;

  const savings = billingCycle === 'annual'
    ? (terminals * baseMonthlyPerTerminal * 12) - (terminals * baseAnnualPerTerminal)
    : 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      {/* Hero Showcase */}
      <PageHero
        image="/imagens/46908.jpg"
        tag="Planos & Licenças Oficiais"
        title="Investimento Transparente, Sem Mensalidades Escondidas"
        sub="Software instalado localmente na sua empresa com licenciamento anual ou mensal. Inclui suporte técnico e todas as atualizações legais da AGT."
      />

      {/* Banner de Validador de Licença */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 -mt-8 relative z-20">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold block">Já possui uma Chave de Licença KIVORA?</strong>
              <span className="text-xs text-slate-400">Consulte a validade fiscal, estado do hardware e data de renovação no validador público.</span>
            </div>
          </div>
          <button
            onClick={() => onNavigatePage && onNavigatePage('validar-licenca')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Validar Licença Online</span>
          </button>
        </div>
      </section>

      {/* Grelha de Planos */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/60">
            Tabela de Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
            Escolha o Plano Ideal para a Sua Empresa
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Sem custos adicionais por documento emitido. Licenciamento claro em Kwanzas (AOA).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 sm:p-9 border flex flex-col justify-between transition-all ${
                plan.highlight
                  ? 'bg-slate-950 text-white border-slate-800 shadow-2xl shadow-slate-950/30 ring-2 ring-blue-500/40 relative'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-xl'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-8 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Mais Recomendado</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className={`text-xl font-black ${plan.highlight ? 'text-white' : 'text-slate-950'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {plan.desc}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${plan.highlight ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-baseline gap-1.5">
                    {plan.price !== 'Sob Consulta' && (
                      <span className={`text-xs font-bold ${plan.highlight ? 'text-blue-400' : 'text-slate-500'}`}>Kz</span>
                    )}
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">{plan.price}</span>
                    <span className={`text-xs font-medium ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider block ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Recursos Inclusos:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-emerald-400' : 'text-blue-600'}`} strokeWidth={2} />
                        <span className={plan.highlight ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => onOpenDemoModal(`Licença ${plan.name}`)}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-950 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simulador Interativo de Investimento */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3.5 py-1 rounded-full">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador Interativo</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
              Calcule o Valor à Medida da Sua Empresa
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
              Selecione o número de computadores / postos de trabalho e veja o valor estimado da licença em Kwanzas.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
            
            {/* Controlo de Postos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>Número de Postos de Trabalho (Computadores em Rede LAN):</span>
                </label>
                <span className="text-xl sm:text-2xl font-black text-blue-600 bg-blue-50 border border-blue-200 px-4 py-1 rounded-xl">
                  {terminals} {terminals === 1 ? 'Posto' : 'Postos'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={terminals}
                onChange={(e) => setTerminals(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                <span>1 PC (Standalone)</span>
                <span>5 PCs (Média Loja)</span>
                <span>10 PCs (Supermercado)</span>
                <span>15 PCs (Grande Rede)</span>
              </div>
            </div>

            {/* Ciclo de Pagamento */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Periodicidade de Pagamento:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    billingCycle === 'annual'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Anual (Poupe até 33%)</span>
                  {billingCycle === 'annual' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    billingCycle === 'monthly'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Mensal (Sem Contrato)</span>
                  {billingCycle === 'monthly' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </button>
              </div>
            </div>

            {/* Resultado do Cálculo */}
            <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-slate-400 text-xs font-semibold">Valor Total Estimado:</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span className="text-xs font-bold text-blue-400">Kz</span>
                  <span className="text-3xl sm:text-4xl font-black text-white">{estimatedPrice.toLocaleString('pt-AO')}</span>
                  <span className="text-xs text-slate-400">/ {billingCycle === 'annual' ? 'ano' : 'mês'}</span>
                </div>
                {savings > 0 && (
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    ✓ Poupança anual de {savings.toLocaleString('pt-AO')} Kz em relação ao plano mensal!
                  </span>
                )}
              </div>

              <button
                onClick={() => onOpenDemoModal(`Simulação: ${terminals} Postos (${billingCycle === 'annual' ? 'Anual' : 'Mensal'}) - Kz ${estimatedPrice.toLocaleString('pt-AO')}`)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 cursor-pointer shrink-0"
              >
                <span>Solicitar Licença Desta Simulação</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ de Licenciamento */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-20 space-y-10">
        <div className="text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-blue-600 mx-auto" />
          <h3 className="text-2xl font-black text-slate-950">Perguntas Frequentes sobre Licenças</h3>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'A licença inclui atualizações fiscais da AGT?',
              a: 'Sim. Todas as atualizações tributárias (IRT 2026, novas diretrizes do SAF-T, DS.120 e regras de IVA) estão incluídas sem qualquer custo extra durante a validade da licença ativa.',
            },
            {
              q: 'Como funciona a ativação da licença no computador?',
              a: 'Após o pagamento, recebe a sua chave de ativação alfanumérica por email e WhatsApp. O sistema valida a chave localmente via hardware ID e ativa todas as funcionalidades em menos de 1 minuto.',
            },
            {
              q: 'Posso adicionar mais computadores à rede mais tarde?',
              a: 'Sim. Pode expandir o número de terminais na sua rede local a qualquer momento. Basta contactar o suporte ou solicitar postos adicionais com taxa proporcional ao período restante.',
            },
            {
              q: 'O que acontece aos meus dados se a licença expirar?',
              a: 'Os seus dados ficam 100% gravados com total segurança no disco local do seu computador. O sistema permite consultar todo o histórico, emitir relatórios anteriores e imprimir segundas vias, apenas bloqueando a emissão de novas faturas até à renovação.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

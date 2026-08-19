import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import {
  CheckCircle2, ArrowRight, Calculator, ShieldCheck, Key,
  HelpCircle, Monitor, TrendingDown
} from 'lucide-react';
import { PageId } from '../components/Header';
import {
  SystemCompanySettings, DEFAULT_SETTINGS,
  subscribeSystemSettings, getCachedSystemSettings
} from '../services/systemSettingsService';

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
  highlightBadge?: string;
  ctaText: string;
}

export const FinanceiroPage: React.FC<FinanceiroPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(() => getCachedSystemSettings());
  const [terminals, setTerminals] = useState<number>(3);
  const [selectedPlanType, setSelectedPlanType] = useState<'anual' | 'mensal' | 'vitalicio'>('anual');

  useEffect(() => {
    const unsub = subscribeSystemSettings((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsub();
  }, []);

  const parseFeatures = (text?: string, fallback: string[] = []): string[] => {
    if (!text) return fallback;
    return text.split('\n').map(l => l.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean);
  };

  const dynamicPlans: Plan[] = [
    {
      id: 'mensal',
      name: settings.planMensalName || DEFAULT_SETTINGS.planMensalName || 'Mensal Standalone',
      price: settings.planMensalPrice || DEFAULT_SETTINGS.planMensalPrice || '25.000',
      period: settings.planMensalPeriod || DEFAULT_SETTINGS.planMensalPeriod || '/ mês',
      desc: settings.planMensalDesc || DEFAULT_SETTINGS.planMensalDesc || 'Flexibilidade total sem contratos de fidelização. Ideal para 1 computador isolado ou início de atividade.',
      features: parseFeatures(settings.planMensalFeatures, [
        '1 Posto de Trabalho Standalone',
        'Faturação Eletrónica AGT DS.120 com QR Code',
        'POS de Balcão e Fecho de Caixa com Relatório Z',
        'Gestão de Stock Básica e Preços de Venda',
        'Exportação SAF-T AO mensal sem erros',
        'Atualizações fiscais legais incluídas',
        'Suporte por email e WhatsApp em horário comercial',
      ]),
      ctaText: settings.planMensalCta || DEFAULT_SETTINGS.planMensalCta || 'Aderir ao Plano Mensal',
    },
    {
      id: 'anual',
      name: settings.planAnualName || DEFAULT_SETTINGS.planAnualName || 'Anual Multi-Postos (Recomendado)',
      price: settings.planAnualPrice || DEFAULT_SETTINGS.planAnualPrice || '250.000',
      period: settings.planAnualPeriod || DEFAULT_SETTINGS.planAnualPeriod || '/ ano',
      desc: settings.planAnualDesc || DEFAULT_SETTINGS.planAnualDesc || 'A opção mais rentável para empresas ativas. Inclui 3 postos em rede local e poupança imediata.',
      features: parseFeatures(settings.planAnualFeatures, [
        'Até 3 Postos de Trabalho em Rede LAN (Caixas + Servidor)',
        'Tudo do Plano Mensal incluído',
        'Módulo de Recursos Humanos & IRT 2026',
        'Contabilidade PGC-AO & SAF-T Completo',
        'Multidepósito e Controlo de Validades e Lotes',
        'Suporte Técnico Prioritário (SLA 4h)',
        'Formação operacional da equipa incluída',
      ]),
      highlight: true,
      highlightBadge: settings.planAnualBadge || DEFAULT_SETTINGS.planAnualBadge || 'MAIS POPULAR EM ANGOLA',
      ctaText: settings.planAnualCta || DEFAULT_SETTINGS.planAnualCta || 'Adquirir Licença Anual',
    },
    {
      id: 'vitalicio',
      name: settings.planVitalicioName || DEFAULT_SETTINGS.planVitalicioName || 'Licença Vitalícia Perpétua',
      price: settings.planVitalicioPrice || DEFAULT_SETTINGS.planVitalicioPrice || '650.000',
      period: settings.planVitalicioPeriod || DEFAULT_SETTINGS.planVitalicioPeriod || 'pagamento único',
      desc: settings.planVitalicioDesc || DEFAULT_SETTINGS.planVitalicioDesc || 'Sem renovações anuais ou mensalidades. A licença definitiva para a sua empresa com 5 postos LAN.',
      features: parseFeatures(settings.planVitalicioFeatures, [
        '5 Postos de Trabalho em Rede Local / Servidor Dedicado',
        'Licença perpétua sem expiração',
        'Instalação e parametrização presencial ou remota assistida',
        'Todos os módulos do Kivora ERP desbloqueados',
        'Formação presencial certificada para operadores e gerentes',
        'Gestor de conta executivo e canal VIP de atendimento',
        'Cópia de segurança automática local e em Pen USB',
      ]),
      ctaText: settings.planVitalicioCta || DEFAULT_SETTINGS.planVitalicioCta || 'Adquirir Licença Perpétua',
    },
  ];

  const parseNumeric = (val?: string, fallback: number = 0): number => {
    if (!val) return fallback;
    const num = parseInt(val.replace(/\D/g, ''), 10);
    return isNaN(num) ? fallback : num;
  };

  const baseMensal = parseNumeric(settings.planMensalPrice, 25000);
  const extraMensal = Number(settings.planMensalExtraTerminal ?? 10000);

  const baseAnual = parseNumeric(settings.planAnualPrice, 250000);
  const extraAnual = Number(settings.planAnualExtraTerminal ?? 35000);

  const baseVitalicio = parseNumeric(settings.planVitalicioPrice, 650000);
  const extraVitalicio = Number(settings.planVitalicioExtraTerminal ?? 60000);

  // Cálculos harmonizados
  const calculatePrice = () => {
    if (selectedPlanType === 'mensal') {
      const extra = Math.max(0, terminals - 1);
      return (baseMensal + extra * extraMensal);
    }
    if (selectedPlanType === 'anual') {
      const extra = Math.max(0, terminals - 3);
      return (baseAnual + extra * extraAnual);
    }
    // Vitalício
    const extra = Math.max(0, terminals - 5);
    return (baseVitalicio + extra * extraVitalicio);
  };

  const calculatedPrice = calculatePrice();

  // Comparação com Cloud ERP (USD $80/mês + Internet Fibra 40.000 Kz/mês)
  const cloudErpAnnualCost = 1344000;
  const kivoraAnnualEquivalent = selectedPlanType === 'anual' ? calculatedPrice : calculatedPrice * 12;
  const realSavingsAoa = Math.max(0, cloudErpAnnualCost - kivoraAnnualEquivalent);

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      {/* Hero Showcase */}
      <PageHero
        image="/imagens/46908.jpg"
        tag="Planos & Licenças Oficiais"
        title="Investimento Transparente, Sem Custos Escondidos"
        sub="Software instalado localmente na sua empresa com licenciamento em Kwanzas (AOA). Inclui suporte técnico e todas as atualizações fiscais da AGT."
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
              <span className="text-xs text-slate-400">Consulte a autenticidade fiscal, postos autorizados e validade no validador oficial.</span>
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
            {settings.pricingTag || DEFAULT_SETTINGS.pricingTag || 'Tabela de Preços Oficiais'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
            {settings.pricingTitle || DEFAULT_SETTINGS.pricingTitle || 'Escolha a Modalidade de Licenciamento'}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {settings.pricingSubtitle || DEFAULT_SETTINGS.pricingSubtitle || 'Preços claros em Kwanzas (AOA) com IVA incluído no regime de isenção de software e sem cobrança por fatura emitida.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {dynamicPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlight
                  ? 'bg-slate-950 text-white shadow-2xl border-2 border-blue-500/50 scale-[1.02] z-10'
                  : 'bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                  {plan.highlightBadge || 'Mais Popular em Angola'}
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black">{plan.name}</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {plan.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-blue-600">Kz</span>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">{plan.price}</span>
                    <span className={`text-xs font-semibold ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className={`text-[11px] font-black uppercase tracking-wider block ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
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

      {/* Simulador Interativo & Comparador de ROI */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3.5 py-1 rounded-full">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador de Licenciamento & ROI</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
              Personalize o Seu Pacote e Veja a Poupança Real
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
              Selecione o número de computadores na sua rede local e compare os custos com soluções cloud importadas.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
            
            {/* Escolha da Modalidade */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Modalidade de Licenciamento Desejada:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedPlanType('anual')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    selectedPlanType === 'anual'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Anual Multi-Postos</span>
                  {selectedPlanType === 'anual' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => setSelectedPlanType('mensal')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    selectedPlanType === 'mensal'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Mensal Standalone</span>
                  {selectedPlanType === 'mensal' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </button>

                <button
                  onClick={() => setSelectedPlanType('vitalicio')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    selectedPlanType === 'vitalicio'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Vitalício / Perpétuo</span>
                  {selectedPlanType === 'vitalicio' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Controlo de Postos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>Número de Postos de Trabalho (Caixas + Terminais em Rede LAN):</span>
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
                <span>1 PC (Balcão Único)</span>
                <span>3 PCs (Loja Normal)</span>
                <span>7 PCs (Supermercado)</span>
                <span>15 PCs (Rede Completa)</span>
              </div>
            </div>

            {/* Resultado do Cálculo */}
            <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-slate-400 text-xs font-semibold">Valor Total da Licença:</span>
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span className="text-xs font-bold text-blue-400">Kz</span>
                  <span className="text-3xl sm:text-4xl font-black text-white">{calculatedPrice.toLocaleString('pt-AO')}</span>
                  <span className="text-xs text-slate-400">
                    / {selectedPlanType === 'anual' ? 'ano' : selectedPlanType === 'mensal' ? 'mês' : 'pagamento único'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block pt-1">
                  {selectedPlanType === 'anual'
                    ? `Inclui 3 postos base + ${Math.max(0, terminals - 3)} posto(s) adicional(is) em rede LAN.`
                    : selectedPlanType === 'mensal'
                    ? `Inclui 1 posto base + ${Math.max(0, terminals - 1)} terminal(is) adicional(is).`
                    : `Inclui 5 postos base + ${Math.max(0, terminals - 5)} terminal(is) vitalício(s).`}
                </span>
              </div>

              <button
                onClick={() => onOpenDemoModal(`Simulação: ${terminals} Postos (${selectedPlanType.toUpperCase()}) - Kz ${calculatedPrice.toLocaleString('pt-AO')}`)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 cursor-pointer shrink-0"
              >
                <span>Solicitar Proposta Desta Simulação</span>
              </button>
            </div>

            {/* Comparativo de Poupança Real vs Softwares Cloud */}
            <div className="p-5 bg-blue-50 border border-blue-200/80 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-blue-950 text-sm">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>Comparativo de Custo & Confiabilidade com Sistemas na Nuvem</span>
              </div>
              <p className="text-blue-900 leading-relaxed">
                Ao contrário de softwares baseados na nuvem internacional (que cobram mensalidades em USD e bloqueiam as vendas se a internet fibra falhar), o <strong>KIVORA ERP funciona 100% offline</strong> no computador da sua loja.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-blue-200 text-[11px] font-bold text-blue-950">
                <span>✓ Zero risco de paragem de caixas por quebra de internet</span>
                <span className="text-emerald-700 font-mono">Poupança estimada: ~{realSavingsAoa.toLocaleString('pt-AO')} Kz / ano</span>
              </div>
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
              a: 'Sim. Todas as atualizações tributárias (IRT 2026, novas diretrizes do SAF-T AO, DS.120 e regras de IVA) estão incluídas sem qualquer custo extra durante a validade da licença ativa.',
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

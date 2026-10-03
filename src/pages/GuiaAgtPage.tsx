import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import {
  CheckCircle2, AlertTriangle,
  Calendar, QrCode, Lock, ArrowRight,
  Scale, Database, Clock, ShieldCheck
} from 'lucide-react';
import { PageId } from '../components/Header';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { CountUp } from '../components/CountUp';
import { AnimatedText } from '../components/AnimatedText';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';

import welcomeImg from '../assets/kivora/jovem-empresario-dado-boas-vindas.png';
import { LiveFiscalReceipt } from '../components/LiveFiscalReceipt';

interface GuiaAgtPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

export const GuiaAgtPage: React.FC<GuiaAgtPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  // Estado do checklist de prontidão fiscal
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const checklist = [
    {
      id: 1,
      titulo: 'Software de Faturação Certificado e Validado',
      desc: 'O sistema utilizado não permite a alteração ou eliminação de faturas emitidas e possui algoritmo de assinatura criptográfica.',
    },
    {
      id: 2,
      titulo: 'Impressão de QR Code e Hash em Todos os Documentos',
      desc: 'Todas as Faturas (FT), Faturas-Recibo (FR) e Notas de Crédito (NC) contêm o QR Code oficial e os 4 caracteres de validação da assinatura.',
    },
    {
      id: 3,
      titulo: 'Exportação Mensal do Ficheiro SAF-T AO (XML)',
      desc: 'Capacidade de gerar o ficheiro SAF-T AO auditado até ao dia 15 de cada mês, sem divergências no validador da AGT.',
    },
    {
      id: 4,
      titulo: 'Anulação Exclusiva por Nota de Crédito (NC)',
      desc: 'Nunca rasgar ou apagar faturas no sistema. Qualquer retificação é feita por emissão de Nota de Crédito devidamente numerada.',
    },
    {
      id: 5,
      titulo: 'Cópias de Segurança (Backups) em Local Seguro',
      desc: 'Realização de backups regulares da base de dados guardados em suporte externo (Pen Drive, NAS ou Nuvem Cifrada).',
    },
    {
      id: 6,
      titulo: 'Identificação Correta do NIF do Cliente',
      desc: 'Registo do NIF do cliente em faturas acima do valor limite legal ou sempre que solicitado pelo comprador.',
    },
  ];

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const regimesIva = [
    {
      nome: 'Regime Geral do IVA',
      taxa: '14%',
      enquadramento: 'Volume de negócios anual superior a 25.000.000 AOA ou adesão por opção.',
      obrigacoes: [
        'Liquidará IVA à taxa geral de 14% (ou reduzidas)',
        'Direito à dedução do IVA suportado nas compras',
        'Submissão obrigatória do SAF-T AO até ao dia 15 de cada mês',
        'Entrega da Declaração Periódica do IVA e pagamento mensal',
      ],
      cor: 'border-blue-500 bg-blue-500/5',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      nome: 'Regime Simplificado do IVA',
      taxa: '7%',
      enquadramento: 'Volume de negócios entre 10.000.000 AOA e 25.000.000 AOA.',
      obrigacoes: [
        'Imposto de 7% sobre o valor das vendas cobradas',
        'Dedução de 7% do IVA suportado nas faturas de compras',
        'Emissão de faturas em sistema de faturação eletrónica',
        'Submissão do ficheiro SAF-T AO mensalmente à AGT',
      ],
      cor: 'border-amber-500 bg-amber-500/5',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      nome: 'Regime de Exclusão do IVA',
      taxa: 'Isento de IVA',
      enquadramento: 'Volume de negócios anual inferior a 10.000.000 AOA.',
      obrigacoes: [
        'Não liquida IVA aos clientes finais',
        'Sujeito a Imposto de Selo (quando aplicável)',
        'Obrigação de emissão de faturas através de software validado',
        'Manutenção do arquivo documental por 10 anos',
      ],
      cor: 'border-emerald-500 bg-emerald-500/5',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter font-sans">
      
      {/* Hero Showcase Institucional */}
      <PageHero
        image={welcomeImg}
        tag="Conformidade Tributária & Legislação Angola"
        title="Guia Oficial de Conformidade Fiscal AGT 2026"
        sub="Tudo o que os empresários, diretores financeiros e contabilistas precisam de saber sobre o Decreto Presidencial n.º 71/25, emissão de faturas eletrónicas, SAF-T AO e regras de auditoria tributária."
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-20">

        {/* 1. Resumo do Decreto Presidencial 71/25 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>Marco Legal em Vigor</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 leading-tight">
              O Que Exige o Decreto Presidencial n.º 71/25?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              O <strong>Decreto Presidencial n.º 71/25</strong> veio reforçar e regulamentar a obrigatoriedade da utilização de <strong>programas informáticos de faturação validados pela Administração Geral Tributária (AGT)</strong> para todos os sujeitos passivos com sede ou estabelecimento estável em Angola.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              O objetivo central é combater a economia informal, garantir a rastreabilidade das transações comerciais e assegurar que nenhuma fatura emitida possa ser eliminada, reescrita ou ocultada da contabilidade da empresa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-blue-600 font-black text-sm mb-1">
                  <QrCode className="w-4 h-4" />
                  <span>QR Code Obrigatório</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Permite a qualquer cliente ou fiscal da AGT validar a autenticidade do documento através da câmara do telemóvel.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-emerald-600 font-black text-sm mb-1">
                  <Lock className="w-4 h-4" />
                  <span>Assinatura Digital SHA</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chaves criptográficas privadas encadeiam as faturas de forma sequencial, tornando impossível apagar registos.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0B192C] text-white rounded-3xl p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
              <h3 className="font-semibold font-display text-base text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Riscos de Não Conformidade</span>
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/25 px-2 py-0.5 rounded-full font-tight">
                Atenção
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300 relative z-10">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span><strong>Coimas e Multas Tributárias:</strong> Aplicação de pesadas sanções financeiras pela AGT por emissão em programas não certificados.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span><strong>Invalidação de Custos Fiscais:</strong> Os seus clientes empresariais não poderão deduzir as despesas caso as suas faturas não cumpram a lei.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span><strong>Bloqueio de Reembolsos de IVA:</strong> Divergências no ficheiro SAF-T AO bloqueiam processos de crédito e liquidação tributária.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-800 relative z-10">
              <button
                onClick={() => onOpenDemoModal('Auditoria Fiscal AGT')}
                className="btn-primary w-full text-xs py-3 px-4 rounded-xl cursor-pointer text-center"
              >
                Solicitar Validação Gratuita do Sistema Atual
              </button>
            </div>
          </div>
        </section>

        {/* 1.1 Demonstrador Interativo de Faturação Eletrónica AGT */}
        <section className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Simulação Prática em Tempo Real</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Demonstrador de Faturação Eletrónica com QR Code e Hash AGT
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Experimente abaixo o motor fiscal do KIVORA SOFT. Alterne entre setores comerciais e veja o cálculo de IVA, o QR Code de autenticação e a assinatura inviolável em ação.
            </p>
          </div>

          <div className="flex justify-center items-center">
            <LiveFiscalReceipt />
          </div>
        </section>

        {/* 2. Tabela de Regimes de IVA em Angola */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold font-display tracking-tight text-slate-900">
              Enquadramento nos Regimes de IVA em Angola
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O KIVORA SOFT suporta todos os regimes tributários previstos no Código do IVA angolano, aplicando automaticamente as taxas e isenções legais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regimesIva.map((regime, index) => {
              const borderAccents = [
                'hover:border-blue-300',
                'hover:border-amber-300',
                'hover:border-emerald-300',
              ];
              return (
                <div
                  key={index}
                  className={`surface-card bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ${borderAccents[index % 3]}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold font-mono-num uppercase px-3 py-0.5 rounded-md border font-tight ${regime.badge}`}>
                        {regime.taxa}
                      </span>
                      <span className="text-xs text-slate-400 font-medium font-tight">Código do IVA</span>
                    </div>

                    <h3 className="text-lg font-semibold font-display text-slate-900 group-hover:text-[#1746A2] transition-colors">{regime.nome}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{regime.enquadramento}</p>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-tight">Obrigações Operacionais:</p>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {regime.obrigacoes.map((obrigacao, idx) => (
                          <li key={idx} className="flex items-start gap-2 font-medium">
                            <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                            </div>
                            <span>{obrigacao}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onNavigatePage('calculadora-fiscal')}
                      className="btn-secondary w-full text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-tight"
                    >
                      <span>Simular Valores na Calculadora</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Vídeo Explicativo do Decreto 71/25 & Faturação AGT */}
        {settings.videoAgtUrl && (
          <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Vídeo Jurídico & Fiscal
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {settings.videoAgtTitle || 'Exigências do Decreto 71/25 & Faturação AGT'}
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl">
                  {settings.videoAgtDesc || 'Entenda os regimes de IVA (14% e 7%), a regra de anulação com Nota de Crédito e os prazos do SAF-T AO.'}
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <YouTubePlayer
                videoUrl={settings.videoAgtUrl}
                title={settings.videoAgtTitle}
                subtitle={settings.videoAgtDesc}
                badge="Guia Fiscal AGT"
                accentColor="emerald"
                aspectRatio="video"
              />
            </div>
          </section>
        )}

        {/* 3. Checklist Interativo de Conformidade */}
        <section className="bg-[#0B192C] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 space-y-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-xs font-semibold mb-2 font-tight">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Autoavaliação Fiscal Interativa</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold font-display text-white tracking-tight">
                <AnimatedText text="Checklist de Prontidão para Auditoria da AGT" el="span" mode="letter-stagger" className="text-white" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Verifique se o seu sistema e a sua empresa cumprem os 6 requisitos essenciais exigidos pela fiscalização.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[160px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 block mb-1 font-tight">
                Índice de Conformidade
              </span>
              <div className="text-3xl font-bold text-emerald-400 font-mono-num">
                <CountUp end={progressPercent} suffix="%" type="odometer" duration={0.8} />
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                {completedCount} de {checklist.length} requisitos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {checklist.map((item) => {
              const isChecked = !!checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                    isChecked
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm -translate-y-0.5'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isChecked
                        ? 'bg-emerald-500 text-white font-bold shadow-xs'
                        : 'border-2 border-slate-500 bg-slate-800'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold font-display ${isChecked ? 'text-emerald-300' : 'text-white'}`}>
                      {item.titulo}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 text-xs text-slate-300 relative z-10">
            <p>
              <strong className="text-white">Recomendação KIVORA:</strong> Com o KIVORA SOFT instalado, a sua empresa cumpre 100% dos requisitos de forma nativa e automática desde o primeiro dia.
            </p>
            <button
              onClick={() => onOpenDemoModal('Instalação Certificada AGT')}
              className="btn-cta text-xs py-3 px-6 shrink-0 cursor-pointer"
            >
              Garantir Conformidade com KIVORA SOFT
            </button>
          </div>
        </section>

        {/* 4. Calendário de Prazos Fiscais Mensais */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Calendário de Obrigações Fiscais em Angola
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Marque na agenda os prazos legais inadiáveis perante a Administração Geral Tributária:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4 group hover:border-blue-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1746A2] flex items-center justify-center font-bold group-hover:bg-[#1746A2] group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#1746A2] uppercase tracking-wider font-tight">Até ao Dia 15 do Mês</span>
                <h3 className="text-base font-semibold font-display text-slate-900">Envio do Ficheiro SAF-T AO</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extração e submissão do ficheiro XML das faturas emitidas no mês anterior através do Portal do Contribuinte da AGT.
              </p>
            </div>

            <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4 group hover:border-emerald-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider font-tight">Último Dia do Mês</span>
                <h3 className="text-base font-semibold font-display text-slate-900">Pagamento do IVA & Retenções</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Liquidação do imposto apurado e entrega das retenções na fonte de clientes e prestadores de serviços.
              </p>
            </div>

            <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4 group hover:border-amber-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider font-tight">Diariamente</span>
                <h3 className="text-base font-semibold font-display text-slate-900">Fecho de Caixa & Backup</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emissão do relatório diário Z-Report e cópia de segurança física dos dados fiscais gravados no computador.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { PageHero } from '../components/PageHero';
import { ShoppingCart, Utensils, Pill, Briefcase, CheckCircle2, ArrowRight, ShieldCheck, Download, Monitor, Zap } from 'lucide-react';
import { PageId } from '../components/Header';
import { useScrollReveal } from '../hooks/useScrollReveal';

import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';
import restauranteImg from '../assets/kivora/restaurante-kivora.jpg';
import farmaciaImg from '../assets/kivora/farmacia-kivora.jpg';
import executivosImg from '../assets/kivora/executivos-kivora.jpg';

interface SetoresPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
  initialSector?: string;
}

interface SectorInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  tagline: string;
  description: string;
  image: string;
  features: string[];
  highlights: { title: string; desc: string }[];
  ctaText: string;
}

const SECTORS: SectorInfo[] = [
  {
    id: 'retalho',
    name: 'Retalho & Supermercados',
    icon: <ShoppingCart className="w-5 h-5" />,
    tagline: 'Alta Rotação de Caixa & Leitor de Código de Barras',
    description: 'Concebido para mercearias, boutiques, lojas de conveniência e grandes superfícies. Vendas rápidas em menos de 3 segundos com suporte a balanças, leitores óticos e impressão de talões.',
    image: supermercadoImg,
    features: [
      'Leitura ultra-rápida de códigos de barras EAN-13, QR Code e balança de pesagem',
      'Fecho de caixa cego por operador e controlo rigoroso de quebras e sangrias',
      'Impressão térmica instantânea em impressoras de 58mm e 80mm',
      'Gestão de preços por atacado e retalho na mesma ficha de produto',
      'Alertas automáticos de stock mínimo e sugestão de compras ao fornecedor',
      'Modo de contingência AGT 100% offline para nunca parar as vendas',
    ],
    highlights: [
      { title: 'Fim das Filas no Balcão', desc: 'Atendimento 4x mais rápido com atalhos táteis e pesquisa por código.' },
      { title: 'Controlo Total de Caixa', desc: 'Registo de cada entrada, sangria e meio de pagamento (TPA, Numerário, Transferência).' },
    ],
    ctaText: 'Solicitar Demonstração para Retalho',
  },
  {
    id: 'restauracao',
    name: 'Restauração & Bares',
    icon: <Utensils className="w-5 h-5" />,
    tagline: 'Gestão de Mesas, Pedidos & Impressão em Cozinha',
    description: 'Solução ágil para restaurantes, bares, pastelarias, lanchonetes e hotéis. Permite controlo de mesas abertas, divisão de contas por cliente e pedidos diretos para impressoras de bar e cozinha.',
    image: restauranteImg,
    features: [
      'Mapa visual de salas e mesas com estado em tempo real (Livre, Ocupada, Conta Pedida)',
      'Envio de pedidos para impressoras de produção (Cozinha, Copa e Bar)',
      'Divisão de conta flexível por cliente, por artigo ou em partes iguais',
      'Fichas técnicas de pratos e abatimento automático de ingredientes no stock',
      'Gestão de menus do dia, promoções de Happy Hour e taxas de serviço',
      'Conformidade integral com emissão de Facturas-Recibo certificadas AGT',
    ],
    highlights: [
      { title: 'Comunicação Bar-Cozinha', desc: 'Elimine erros de pedidos manuais com impressão imediata na copa e cozinha.' },
      { title: 'Divisão de Contas Simples', desc: 'Divida facilmente o valor total entre vários clientes na mesma mesa.' },
    ],
    ctaText: 'Solicitar Demonstração para Restauração',
  },
  {
    id: 'farmacia',
    name: 'Farmácias & Saúde',
    icon: <Pill className="w-5 h-5" />,
    tagline: 'Controlo Rigoroso de Lotes, Validades & Receitas',
    description: 'Especializado para farmácias comunitárias, postos de saúde, clínicas e ervanárias. Rastreabilidade completa de medicamentos por lote, fabricante e prazo de validade com regras de isenção de IVA.',
    image: farmaciaImg,
    features: [
      'Controlo de lotes e alertas de medicamentos a caducar nos próximos 30, 60 e 90 dias',
      'Aplicação automática de isenção de IVA (Código M02/M04) para medicamentos essenciais',
      'Pesquisa avançada por princípio ativo (DCI), laboratório, dosagem e genéricos',
      'Registo de prescritor / médico e número de receita para medicamentos sujeitos a receita',
      'Histórico de vendas por cliente para acompanhamento de tratamentos contínuos',
      'Exportação SAF-T AO com classificação fiscal rigorosa exigida pela AGT',
    ],
    highlights: [
      { title: 'Zero Perdas por Validade', desc: 'Alertas visuais antecipados evitam o vencimento de produtos nas prateleiras.' },
      { title: 'Isenções Fiscais AGT', desc: 'Configuração automática de artigos isentos e taxas reduzidas de IVA.' },
    ],
    ctaText: 'Solicitar Demonstração para Farmácias',
  },
  {
    id: 'servicos',
    name: 'Prestação de Serviços & Consultoria',
    icon: <Briefcase className="w-5 h-5" />,
    tagline: 'Avenças Mensais, Retenção na Fonte de 6.5% & Proformas',
    description: 'Ideal para escritórios de contabilidade, advocacia, empresas de segurança, consultorias e empresas de TI. Emita Facturas e Proformas com retenção na fonte automática e gestão de contratos recorrentes.',
    image: executivosImg,
    features: [
      'Cálculo automático de Retenção na Fonte de 6.5% e Imposto de Selo de 1%',
      'Conversão instantânea de Facturas Proforma em Facturas Definitivas com 1 clique',
      'Faturação em lote de avenças e mensalidades de clientes com envio em PDF',
      'Extratos de conta-corrente de clientes e relatórios de saldos pendentes',
      'Suporte a transações multimoeda (AOA, USD, EUR) com taxa de câmbio atualizada',
      'Assinatura digital RS256 e código QR AGT em todos os documentos emitidos',
    ],
    highlights: [
      { title: 'Retenção na Fonte 6.5%', desc: 'Cálculo e discriminação automática no documento fiscal em conformidade com o CIRT.' },
      { title: 'Gestão de Contas Correntes', desc: 'Controlo de prazos de pagamento, liquidações parciais e emissão de recibos.' },
    ],
    ctaText: 'Solicitar Demonstração para Serviços',
  },
];

export const SetoresPage: React.FC<SetoresPageProps> = ({
  onOpenDemoModal,
  onNavigatePage,
  initialSector = 'retalho',
}) => {
  const [activeSectorId, setActiveSectorId] = useState<string>(initialSector);
  const pageRef = useRef<HTMLDivElement>(null);

  const currentSector = SECTORS.find((s) => s.id === activeSectorId) || SECTORS[0];

  useScrollReveal(pageRef, [activeSectorId]);

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-slate-900 page-enter">

      {/* Showcase Hero */}
      <PageHero
        image={currentSector.image}
        tag="Soluções Especializadas por Atividade"
        title="Software de Gestão Adaptado ao Seu Setor"
        sub="Do pequeno comércio à média empresa, o KIVORA disponibiliza fluxos de trabalho específicos para a sua área de negócio."
      />

      {/* Tabs de Seleção de Setor */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 -mt-8 relative z-20" data-reveal>
        <div className="bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl flex flex-wrap gap-2 justify-center">
          {SECTORS.map((sec) => {
            const isActive = sec.id === activeSectorId;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSectorId(sec.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950'
                }`}
              >
                <span className={isActive ? 'text-blue-400' : 'text-slate-500'}>
                  {sec.icon}
                </span>
                <span>{sec.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Detalhes do Setor Selecionado */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 space-y-16">
        
        {/* Bloco de Apresentação */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-6" data-reveal data-reveal-dir="left">
            <span className="inline-block text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200/80 px-3.5 py-1 rounded-full">
              {currentSector.tagline}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
              Especializado para as exigências de {currentSector.name}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {currentSector.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {currentSector.highlights.map((hl, i) => (
                <div key={i} data-reveal data-delay={(i + 1) * 100} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{hl.title}</span>
                  </strong>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hl.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 flex flex-wrap gap-3">
              <button
                onClick={() => onOpenDemoModal(currentSector.name)}
                className="btn-premium-primary inline-flex items-center gap-2 text-xs sm:text-sm px-7 py-3.5 rounded-2xl cursor-pointer"
              >
                <span>{currentSector.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigatePage('download')}
                className="btn-premium-secondary inline-flex items-center gap-2 text-xs sm:text-sm px-6 py-3.5 rounded-2xl cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Instalador</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6" data-reveal data-reveal-dir="right">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100 p-2 sm:p-3 group">
              <img
                src={currentSector.image}
                alt={currentSector.name}
                className="w-full h-auto max-h-[420px] object-cover rounded-2xl transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-400 font-mono-num">100% Homologado AGT</span>
                  <p className="text-xs font-bold text-slate-200">Decreto Presidencial n.º 71/25</p>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Grelha de Funcionalidades Técnicas */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 sm:p-12 space-y-6" data-reveal>
          <div className="space-y-2">
            <span className="text-blue-600 text-xs font-black uppercase tracking-widest">Recursos Inclusos</span>
            <h3 className="text-2xl font-black text-slate-950">
              Funcionalidades Essenciais para {currentSector.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {currentSector.features.map((feat, idx) => (
              <div key={idx} data-reveal data-delay={((idx % 3) + 1) * 100} className="card-premium p-5 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" strokeWidth={2.25} />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">{feat}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* CTA Final */}
      <section className="bg-slate-950 py-20 px-6 sm:px-10 lg:px-16 text-white text-center border-t border-slate-800" data-reveal>
        <div className="max-w-3xl mx-auto space-y-5">
          <Monitor className="w-10 h-10 text-blue-400 mx-auto" strokeWidth={1.75} />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Pronto para testar o KIVORA na sua empresa?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto">
            Instalação local rápida em menos de 2 minutos. Comece hoje mesmo a emitir documentos fiscais certificados pela AGT.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenDemoModal(`Apresentação: ${currentSector.name}`)}
              className="btn-premium-primary inline-flex items-center gap-2 text-sm px-8 py-4 rounded-2xl cursor-pointer"
            >
              <span>Agendar Apresentação Gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigatePage('solucoes')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-sm px-7 py-4 rounded-2xl border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
            >
              <span>Ver Arquitetura de Rede</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

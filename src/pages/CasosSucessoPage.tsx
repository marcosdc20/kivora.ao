import React, { useState, useRef } from 'react';
import {
  Building2, MapPin, ArrowRight,
  ShieldCheck, TrendingUp, Clock,
  Award, Filter, Download, Star
} from 'lucide-react';
import { PageId } from '../components/Header';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CountUp } from '../components/CountUp';
import { AnimatedText } from '../components/AnimatedText';

import tabletImg from '../assets/kivora/jovem-empresaria-com-tablet.png';
import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';
import restauranteImg from '../assets/kivora/restaurante-kivora.jpg';
import farmaciaImg from '../assets/kivora/farmacia-kivora.jpg';
import executivosImg from '../assets/kivora/executivos-kivora.jpg';

interface CasosSucessoPageProps {
  onNavigatePage: (page: PageId) => void;
  onOpenDemo?: (sector?: string) => void;
}

interface CaseStudy {
  id: string;
  clientName: string;
  sector: 'retalho' | 'restauracao' | 'farmacia' | 'servicos' | 'armazem';
  sectorLabel: string;
  image: string;
  city: string;
  province: string;
  terminals: number;
  results: {
    metric: string;
    label: string;
  }[];
  challenge: string;
  solution: string;
  quote: string;
  author: string;
  role: string;
  verified: boolean;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: '1',
    clientName: 'Supermercados Aliança & Filhos, Lda',
    sector: 'retalho',
    sectorLabel: 'Supermercado & Retalho',
    image: supermercadoImg,
    city: 'Luanda',
    province: 'Luanda (Viana & Talatona)',
    terminals: 12,
    results: [
      { metric: '0 Minutos', label: 'De paragem por falha de internet' },
      { metric: '-68%', label: 'Tempo no fecho de caixa diário' },
      { metric: '100%', label: 'Conformidade SAF-T AO à primeira' },
    ],
    challenge: 'A constante instabilidade na ligação de fibra ótica travava os caixas de pagamento, gerando filas longas e insatisfação dos clientes com softwares em nuvem.',
    solution: 'Implementação do KIVORA SOFT em rede local LAN multi-postos com base de dados local de alta performance e sincronização contínua entre os 12 caixas.',
    quote: 'Com o Kivora, a internet pode ir abaixo que os nossos 12 caixas continuam a faturar e emitir com QR Code AGT a velocidade máxima. Foi a melhor decisão técnica que tomámos.',
    author: 'Eng. Manuel Domingos',
    role: 'Diretor de Operações e TI',
    verified: true,
  },
  {
    id: '2',
    clientName: 'Restaurante & Lounge Baía Azul',
    sector: 'restauracao',
    sectorLabel: 'Restauração & Bares',
    image: restauranteImg,
    city: 'Benguela',
    province: 'Benguela (Praia Morena)',
    terminals: 6,
    results: [
      { metric: '+35%', label: 'Rotação de mesas no almoço' },
      { metric: '100%', label: 'Eliminação de extravios de pedidos' },
      { metric: 'Zero USD', label: 'Custo de câmbio (preço em Kwanzas)' },
    ],
    challenge: 'O software anterior cobrava mensalidades pesadas em dólares americanos e sofria com atrasos na comunicação entre as mesas da esplanada e a impressora de cozinha.',
    solution: 'KIVORA POS Restauração com gestão gráfica de mesas, impressão simultânea no bar e na cozinha e pagamento em moeda nacional Kz.',
    quote: 'A comunicação com a cozinha é instantânea e a facilidade de fecho de conta dividida por clientes facilitou muito o nosso atendimento aos fins de semana.',
    author: 'Teresa Gonçalves',
    role: 'Gerente Geral',
    verified: true,
  },
  {
    id: '3',
    clientName: 'Farmácias Vida & Saúde, Lda',
    sector: 'farmacia',
    sectorLabel: 'Farmácias & Saúde',
    image: farmaciaImg,
    city: 'Huambo',
    province: 'Huambo',
    terminals: 4,
    results: [
      { metric: '-85%', label: 'Perdas por medicamentos vencidos' },
      { metric: '100%', label: 'Rastreabilidade de lotes' },
      { metric: '4 Postos', label: 'Atendimento contínuo' },
    ],
    challenge: 'Dificuldade em controlar a validade de medicamentos por lote e lentidão na busca de substâncias ativas e genéricos nos caixas.',
    solution: 'Módulo de Farmácia KIVORA com alerta antecipado de caducidade de lotes e pesquisa instantânea por princípio ativo no POS.',
    quote: 'O controlo de lotes e datas de caducidade do Kivora evitou prejuízos enormes com medicamentos perto do prazo. É um software seguro e muito fiável.',
    author: 'Dr. António Silva',
    role: 'Farmacêutico Chefe e Proprietário',
    verified: true,
  },
  {
    id: '4',
    clientName: 'Centro Grossista do Kikolo — Armazém Luanda',
    sector: 'armazem',
    sectorLabel: 'Distribuição & Grossista',
    image: executivosImg,
    city: 'Cacuaco',
    province: 'Luanda',
    terminals: 8,
    results: [
      { metric: '+400%', label: 'Capacidade de emissão em pico' },
      { metric: '3 Armazéns', label: 'Inventário sincronizado' },
      { metric: '24/7', label: 'Operação sem falhas de conexão' },
    ],
    challenge: 'Volume massivo de emissão de faturas no período da manhã e necessidade de gerir transferências entre três armazéns distintos com rapidez.',
    solution: 'KIVORA SOFT com base de dados local otimizada e gestão multi-armazém com leitura rápida por código de barras.',
    quote: 'No mercado grossista o tempo é ouro. O Kivora imprime faturas e recibos em menos de 1 segundo sem travar mesmo com milhares de linhas por dia.',
    author: 'Mateus Kanhanga',
    role: 'Responsável de Logística',
    verified: true,
  },
];

export const CasosSucessoPage: React.FC<CasosSucessoPageProps> = ({
  onNavigatePage,
  onOpenDemo,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const pageRef = useRef<HTMLElement>(null);

  const filteredCases = selectedSector === 'todos'
    ? CASE_STUDIES
    : CASE_STUDIES.filter(c => c.sector === selectedSector);

  useScrollReveal(pageRef, [selectedSector]);

  return (
    <main ref={pageRef} className="min-h-screen bg-slate-50 pt-28 pb-20 page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header da Página */}
        <div className="text-center max-w-3xl mx-auto mb-14" data-reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Histórias de Sucesso em Angola
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            <AnimatedText text="Como Empresas Reais Crescem com o KIVORA SOFT" el="span" mode="letter-stagger" highlightWords={['KIVORA', 'SOFT']} highlightClass="text-blue-600 font-black" />
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Conheça as experiências de gestores e proprietários que eliminaram problemas de faturação, filas e paragens por quebra de internet em Angola.
          </p>
        </div>

        {/* Métricas Globais em Destaque */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div data-reveal data-delay="100" className="surface-card p-6 text-center hover:border-slate-300 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <p className="font-display text-3xl font-extrabold text-slate-900 mb-1 font-mono-num">
              <CountUp end={99.9} decimals={1} suffix="%" type="counter" duration={1.8} />
            </p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Disponibilidade Operacional (Offline-First)</p>
          </div>

          <div data-reveal data-delay="200" className="surface-card p-6 text-center hover:border-slate-300 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="font-display text-3xl font-extrabold text-slate-900 mb-1 font-mono-num">
              <CountUp end={100} suffix="%" type="counter" duration={1.8} />
            </p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Conformidade AGT (Dec. Pres. 71/25)</p>
          </div>

          <div data-reveal data-delay="300" className="surface-card p-6 text-center hover:border-slate-300 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="font-display text-3xl font-extrabold text-slate-900 mb-1 font-mono-num">
              <CountUp end={35} prefix="> " suffix="%" type="odometer" duration={1.8} />
            </p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Aumento Médio na Velocidade de Caixa</p>
          </div>

          <div data-reveal data-delay="400" className="surface-card p-6 text-center hover:border-slate-300 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="font-display text-3xl font-extrabold text-slate-900 mb-1 font-mono-num">
              <CountUp end={18} suffix=" Províncias" type="odometer" duration={1.5} />
            </p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Suporte e Distribuição em Todo o País</p>
          </div>
        </div>

        {/* ========== BANNER DE DESTAQUE EXECUTIVO EM ÁREA BRANCA ========== */}
        <div data-reveal className="surface-card p-6 sm:p-10 mb-16 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                História de Liderança & Eficiência
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 leading-tight">
                "Com o KIVORA SOFT, tenho controlo total dos 5 postos da minha loja em tempo real."
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                Gestão simplificada de stock, relatórios de fecho de caixa sem discrepâncias e emissão de faturas certificadas pela AGT sem depender da instabilidade da internet.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Dra. Ana Teresa Vasconcelos</p>
                  <p className="text-xs text-blue-600 font-medium">Diretora-Geral • Grupo Comercial Luanda</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm flex items-center justify-center">
                <img
                  src={tabletImg}
                  alt="Gestora com Tablet KIVORA"
                  className="w-full h-auto max-h-[420px] object-contain filter drop-shadow-xl"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros por Setor */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10" data-reveal>
          <div className="flex items-center gap-1.5 mr-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="w-4 h-4" /> Filtrar por:
          </div>
          {[
            { id: 'todos', label: 'Todos os Setores' },
            { id: 'retalho', label: 'Supermercados & Retalho' },
            { id: 'restauracao', label: 'Restauração & Bares' },
            { id: 'farmacia', label: 'Farmácias & Saúde' },
            { id: 'armazem', label: 'Grossistas & Armazéns' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSector(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedSector === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grelha de Casos de Sucesso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {filteredCases.map((study, sIdx) => (
            <div
              key={study.id}
              data-reveal
              data-delay={((sIdx % 2) + 1) * 100}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Imagem Real do Setor */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src={study.image}
                  alt={study.clientName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-xs shadow">
                      {study.sectorLabel}
                    </span>
                    <p className="text-white text-xs font-semibold mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {study.province}
                    </p>
                  </div>
                  {study.verified && (
                    <div className="flex items-center gap-1 bg-emerald-500/90 text-white backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold shadow">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Auditado AGT
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  {/* Header do Card */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                        {study.terminals} Terminais em Rede Local
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">{study.clientName}</h3>
                    </div>
                  </div>

                {/* Métricas do Caso */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-2xl mb-6 border border-slate-100">
                  {study.results.map((res, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-base sm:text-lg font-black text-[#1d4ed8]">{res.metric}</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-tight">{res.label}</p>
                    </div>
                  ))}
                </div>

                {/* Desafio e Solução */}
                <div className="space-y-3 mb-6 text-sm">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider text-rose-600 mb-1">
                      O Desafio:
                    </span>
                    <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{study.challenge}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider text-emerald-600 mb-1">
                      A Solução KIVORA:
                    </span>
                    <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{study.solution}</p>
                  </div>
                </div>

                {/* Depoimento do Cliente */}
                <div className="border-l-4 border-[#1d4ed8] bg-blue-50/40 p-4 rounded-r-2xl mb-4">
                  <p className="text-xs sm:text-sm italic text-slate-700 leading-relaxed mb-2">
                    "{study.quote}"
                  </p>
                  <p className="text-xs font-bold text-slate-900">{study.author}</p>
                  <p className="text-[11px] text-slate-500">{study.role} — {study.clientName}</p>
                </div>
              </div>

              {/* Ações no Rodapé do Card */}
              <div className="px-6 sm:px-8 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenDemo ? onOpenDemo(study.sectorLabel) : onNavigatePage('download')}
                  className="text-xs font-bold text-[#1d4ed8] hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  Solicitar Demonstração neste Setor
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>

        {/* Banner de Chamada para Ação */}
        <div className="bg-[#0B192C] rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 inline-block">
              Modernização Comercial
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-black text-white leading-tight">
              Pronto para Transformar a Gestão da sua Empresa em Angola?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Junte-se a centenas de empresas que garantem 100% de conformidade com a AGT sem depender da internet.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigatePage('download')}
                className="btn-cta text-sm px-8 py-4 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Experimentar Grátis por 15 Dias
              </button>
              <button
                onClick={() => onNavigatePage('planos')}
                className="btn-secondary text-sm px-7 py-4 flex items-center gap-2"
              >
                Ver Tabela de Preços & Postos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

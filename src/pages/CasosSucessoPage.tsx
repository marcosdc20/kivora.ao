import React, { useState, useRef } from 'react';
import {
  Building2, MapPin, ArrowRight,
  ShieldCheck, TrendingUp, Clock,
  Award, Filter, Download, Star
} from 'lucide-react';
import { PageId } from '../components/Header';
import { useScrollReveal } from '../hooks/useScrollReveal';

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
    solution: 'Implementação do KIVORA ERP em rede local LAN multi-postos com base de dados local de alta performance e sincronização contínua entre os 12 caixas.',
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
    solution: 'KIVORA ERP com base de dados local otimizada e gestão multi-armazém com leitura rápida por código de barras.',
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" />
            Histórias de Sucesso em Angola
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Como Empresas Reais Crescem com o <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d4ed8] to-blue-600">KIVORA ERP</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Conheça as experiências de gestores e proprietários que eliminaram problemas de faturação, filas e paragens por quebra de internet em Angola.
          </p>
        </div>

        {/* Métricas Globais em Destaque */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div data-reveal data-delay="100" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">99.9%</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Disponibilidade Operacional (Offline-First)</p>
          </div>

          <div data-reveal data-delay="200" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">100%</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Conformidade AGT (Dec. Pres. 71/25)</p>
          </div>

          <div data-reveal data-delay="300" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">&gt; 35%</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Aumento Médio na Velocidade de Caixa</p>
          </div>

          <div data-reveal data-delay="400" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">18 Províncias</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Suporte e Distribuição em Todo o País</p>
          </div>
        </div>

        {/* ========== BANNER DE DESTAQUE EXECUTIVO EM ÁREA BRANCA ========== */}
        <div data-reveal className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg mb-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                História de Liderança & Eficiência
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 leading-tight">
                "Com o KIVORA ERP, tenho controlo total dos 5 postos da minha loja em tempo real."
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Gestão simplificada de stock, relatórios de fecho de caixa sem discrepâncias e emissão de faturas homologadas pela AGT sem depender da instabilidade da internet.
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
                  className="w-full h-auto max-h-[420px] object-contain"
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
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedSector === tab.id
                  ? 'bg-[#1d4ed8] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
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
        <div className="bg-gradient-to-br from-[#1d4ed8] via-blue-700 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl shadow-blue-900/20">
          <h2 className="text-2xl sm:text-4xl font-black mb-4">
            Pronto para Transformar a Gestão da sua Empresa em Angola?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Junte-se a centenas de empresas que garantem 100% de conformidade com a AGT sem depender da internet.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigatePage('download')}
              className="px-6 py-3.5 bg-white text-[#1d4ed8] rounded-xl font-bold text-sm shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Experimentar Grátis por 15 Dias
            </button>
            <button
              onClick={() => onNavigatePage('planos')}
              className="px-6 py-3.5 bg-blue-800/80 border border-blue-400/40 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-all flex items-center gap-2"
            >
              Ver Tabela de Preços & Postos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

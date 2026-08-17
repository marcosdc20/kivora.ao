import React, { useState } from 'react';
import { PageHero } from '../components/PageHero';
import {
  Printer, ScanLine, Scale, Monitor,
  CheckCircle2, ShieldCheck, Download
} from 'lucide-react';
import { PageId } from '../components/Header';

import posImg from '../assets/kivora/pc-pos-kivora.png';

interface HardwarePageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

interface HardwareCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  tagline: string;
  description: string;
  models: {
    name: string;
    brand: string;
    type: string;
    specs: string[];
    connection: string;
    verified: boolean;
  }[];
}

const HARDWARE_CATEGORIES: HardwareCategory[] = [
  {
    id: 'printers',
    name: 'Impressoras Térmicas de Talões',
    icon: <Printer className="w-5 h-5" />,
    tagline: 'Impressão Ultrarrápida de Faturas com QR Code AGT (58mm e 80mm)',
    description: 'Compatibilidade nativa via USB, Ethernet (Rede) e Serial com corte automático e suporte a comandos ESC/POS.',
    models: [
      {
        name: 'TM-T20III / TM-T88VI',
        brand: 'Epson',
        type: 'Impressora Térmica 80mm',
        specs: ['Velocidade: 250 mm/s', 'Corte automático guilhotina', 'Resolução: 203 dpi', 'Suporte a QR Code nativo AGT'],
        connection: 'USB / Ethernet / Serial',
        verified: true,
      },
      {
        name: 'SRP-330II / SRP-350III',
        brand: 'Bixolon',
        type: 'Impressora Térmica 80mm',
        specs: ['Velocidade: 200 mm/s', 'Alta durabilidade de cabeça térmica', 'Conexão direta a gaveta de dinheiro RJ11'],
        connection: 'USB / Ethernet',
        verified: true,
      },
      {
        name: 'XP-N160M / XP-80C',
        brand: 'Xprinter',
        type: 'Impressora Térmica 80mm & 58mm',
        specs: ['Excelente custo-benefício', 'Ideal para retalho e restauração', 'Driver Windows 10/11 100% testado'],
        connection: 'USB / Rede LAN',
        verified: true,
      },
    ],
  },
  {
    id: 'scanners',
    name: 'Leitores de Código de Barras & QR',
    icon: <ScanLine className="w-5 h-5" />,
    tagline: 'Leitura Instantânea de Artigos, Lotes e QR Codes de Faturação',
    description: 'Leitores 1D (EAN-13, Code 128) e 2D (QR Code, DataMatrix) com suporte a leitura em ecrãs de telemóvel e modo mãos-livres com suporte.',
    models: [
      {
        name: 'Voyager 1400g / 1250g',
        brand: 'Honeywell',
        type: 'Leitor 1D/2D Imager USB',
        specs: ['Leitura de códigos danificados ou rasurados', 'Suporte com sensor automático', 'Plug & Play sem configuração'],
        connection: 'USB',
        verified: true,
      },
      {
        name: 'DS2208 / Symbol LS2208',
        brand: 'Zebra Technologies',
        type: 'Leitor Laser / Imager de Alta Precisão',
        specs: ['Alcance alargado de leitura', 'Construção robusta anti-queda (1.5m)', 'Modo contínuo de checkout'],
        connection: 'USB / RS-232',
        verified: true,
      },
      {
        name: 'QuickScan QD2400',
        brand: 'Datalogic',
        type: 'Leitor 2D Omnidirecional',
        specs: ['Mira LED de alta visibilidade', 'Leitura rápida em qualquer ângulo', 'Ideal para balcões com espaço reduzido'],
        connection: 'USB',
        verified: true,
      },
    ],
  },
  {
    id: 'pos_terminals',
    name: 'Terminais Touch POS & All-in-One',
    icon: <Monitor className="w-5 h-5" />,
    tagline: 'Computadores de Ponto de Venda Dedicados de Alta Resistência',
    description: 'Ecrãs táteis capacitivos resistentes a gordura, pó e salpicos de água. Funcionamento 24/7 para balcões de alta rotação.',
    models: [
      {
        name: 'Terminal POS Touch 15.6" Capacitivo',
        brand: 'PosBank / Sunmi',
        type: 'Terminal All-in-One Windows',
        specs: ['Processador Intel Core i3 / i5', '8 GB RAM + 128 GB SSD', 'Ecrã tátil True-Flat sem moldura', 'Display de cliente traseiro opcional'],
        connection: '6x USB, 2x COM (RS232), 1x LAN Gigabit',
        verified: true,
      },
      {
        name: 'Desktop Slim / Mini PC Empresarial',
        brand: 'HP / Dell / Lenovo',
        type: 'Servidor Local ou Posto de Caixa',
        specs: ['Ideal para servidor central da loja', 'Baixo consumo energético (TDP 35W)', 'Instalação da base de dados SQLite/Server'],
        connection: 'USB 3.0, HDMI, VGA, Rede Ethernet',
        verified: true,
      },
    ],
  },
  {
    id: 'drawers_scales',
    name: 'Gavetas de Dinheiro & Balanças',
    icon: <Scale className="w-5 h-5" />,
    tagline: 'Abertura Automática no Pagamento e Pesagem em Tempo Real',
    description: 'Gavetas metálicas reforçadas acionadas pela impressora e balanças com envio de peso por protocolo serial.',
    models: [
      {
        name: 'Gaveta Metálica Automática Heavy-Duty',
        brand: 'Universal POS',
        type: 'Gaveta de Dinheiro RJ11',
        specs: ['4 ou 5 compartimentos para notas de Kwanzas', '8 divisórias para moedas', 'Abertura automática via comando da impressora', 'Fechadura com 3 posições'],
        connection: 'Cabo RJ11 ligado à impressora',
        verified: true,
      },
      {
        name: 'Balança de Checkout Peso-Preço',
        brand: 'Toledo / Dibal / Digi',
        type: 'Balança Eletrónica com Protocolo Serial',
        specs: ['Capacidade até 15 kg / 30 kg', 'Envio de peso instantâneo para o Kivora POS', 'Tara automática e verificação de pesagem'],
        connection: 'RS-232 / USB Serial',
        verified: true,
      },
    ],
  },
];

export const HardwarePage: React.FC<HardwarePageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  const [activeCat, setActiveCat] = useState<string>('printers');

  const currentCategory = HARDWARE_CATEGORIES.find((c) => c.id === activeCat) || HARDWARE_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Hero Showcase */}
      <PageHero
        image={posImg}
        tag="Hardware Homologado"
        title="Equipamentos 100% Compatíveis com KIVORA ERP"
        sub="Testamos e homologamos impressoras de talões, leitores de código de barras, gavetas e balanças para garantir um checkout rápido e sem falhas."
      />

      {/* Main Container */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-16">
        
        {/* Banner de Garantia Plug & Play */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantia de Compatibilidade Plug & Play</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Já tem equipamentos na sua loja?</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              O Kivora ERP suporta os drivers padrão do Windows (ESC/POS, OPOS e COM Serial), sendo compatível com <strong>mais de 95% dos periféricos de ponto de venda</strong> existentes em Angola.
            </p>
          </div>

          <button
            onClick={() => onOpenDemoModal('Dúvida sobre Hardware')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/30 shrink-0 cursor-pointer"
          >
            Consultar Compatibilidade Grátis
          </button>
        </div>

        {/* Tabs de Seleção de Categoria */}
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b border-slate-200 pb-6">
            {HARDWARE_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCat;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 -translate-y-0.5'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Conteúdo da Categoria Selecionada */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black uppercase text-blue-600 tracking-wider">
                {currentCategory.name}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
                {currentCategory.tagline}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {currentCategory.description}
              </p>
            </div>

            {/* Grelha de Modelos Homologados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentCategory.models.map((model, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-blue-400 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
                        {model.brand}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Homologado</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-slate-950">{model.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{model.type}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Especificações Testadas:</span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {model.specs.map((spec, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">Interface: <strong>{model.connection}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guia de Ligação & Dicas Técnicas */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-950">
              Como configurar os seus periféricos no KIVORA
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              O módulo de configuração de hardware do Kivora permite testes em tempo real com 1 clique.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">1</div>
              <h4 className="font-black text-slate-950 text-sm">Ligue o Periférico</h4>
              <p className="text-slate-600 leading-relaxed">
                Conecte a impressora ou leitor à porta USB do computador e instale o driver oficial do fabricante para Windows.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">2</div>
              <h4 className="font-black text-slate-950 text-sm">Selecione no KIVORA</h4>
              <p className="text-slate-600 leading-relaxed">
                Aceda a <em>Configurações &gt; Periféricos &amp; Impressão</em> e selecione a impressora para talões de balcão (58mm/80mm) ou faturas A4.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">3</div>
              <h4 className="font-black text-slate-950 text-sm">Teste de Emissão</h4>
              <p className="text-slate-600 leading-relaxed">
                Clique no botão <strong>"Imprimir Talão de Teste"</strong> para verificar o corte de papel e a abertura automática da gaveta RJ11.
              </p>
            </div>
          </div>
        </div>

        {/* CTA para Download ou Apoio */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">
              Pronto para configurar o seu posto de venda?
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
              Descarregue o KIVORA ERP e teste a impressão e os leitores no seu próprio computador gratuitamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all shadow-lg cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar KIVORA Setup</span>
            </button>
            <button
              onClick={() => onNavigatePage('planos')}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all border border-blue-400/30 cursor-pointer"
            >
              <span>Ver Planos de Licença</span>
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};

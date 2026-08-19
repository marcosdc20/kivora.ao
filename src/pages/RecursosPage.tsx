import React, { useState, useMemo } from 'react';
import { PageHero } from '../components/PageHero';
import {
  Download, ArrowRight, X, Search, HelpCircle
} from 'lucide-react';
import { PageId } from '../components/Header';

import executivosImg from '../assets/kivora/executivos-kivora.jpg';

interface RecursosPageProps {
  onNavigatePage: (page: PageId) => void;
}

interface GuideItem {
  id: string;
  category: 'faturacao' | 'saft' | 'redes' | 'pos' | 'rh';
  categoryLabel: string;
  title: string;
  readTime: string;
  summary: string;
  overview: string;
  steps: { title: string; desc: string }[];
  legalNotes?: string;
  tips: string;
}

const GUIDES: GuideItem[] = [
  {
    id: 'faturacao-agt',
    category: 'faturacao',
    categoryLabel: 'Faturação Eletrónica AGT',
    title: 'Guia de Emissão de Faturas Eletrónicas com QR Code & Hash RS256',
    readTime: '4 min',
    summary: 'Passo a passo para emitir Faturas, Faturas-Recibo e Notas de Crédito em conformidade com o Decreto Presidencial n.º 71/25.',
    overview: 'O Kivora ERP assegura a assinatura criptográfica sequencial em cada documento emitido, gerando o Hash RS256 e o QR Code de autenticação fiscal imediata.',
    steps: [
      { title: '1. Aceder ao Módulo de Vendas', desc: 'No menu principal do Kivora, clique em Faturação ou pressione a tecla de atalho F3.' },
      { title: '2. Selecionar o Tipo de Documento', desc: 'Escolha Fatura (FT), Fatura-Recibo (FR) ou Fatura Pró-forma (FP) consoante a transação comercial.' },
      { title: '3. Identificar o Cliente Adquirente', desc: 'Introduza o NIF do cliente. Para clientes ocasionais, utilize o NIF 999999999 (Consumidor Final).' },
      { title: '4. Adicionar Artigos ou Serviços', desc: 'Utilize o leitor de código de barras ou a pesquisa por nome/código. O sistema calcula o IVA automaticamente.' },
      { title: '5. Selecionar Meio de Pagamento e Emitir', desc: 'Escolha Numerário, TPA Multicaixa ou Transferência e confirme. A fatura é impressa em formato A4 ou talão térmico com QR Code.' },
    ],
    legalNotes: 'Conforme exigido pelo Regime Jurídico das Faturas, nunca altere a data e hora do computador emissor para não quebrar a cadeia criptográfica da AGT.',
    tips: 'Pode configurar o envio automático da fatura em PDF para o email do cliente no momento da conclusão da venda.',
  },
  {
    id: 'saft-ao-export',
    category: 'saft',
    categoryLabel: 'SAF-T Angola',
    title: 'Como Exportar e Pré-Validar o Ficheiro SAF-T (AO) sem Erros',
    readTime: '5 min',
    summary: 'Procedimento legal para gerar o ficheiro XML de faturação e submeter no portal e-AGT dentro do prazo regulamentar.',
    overview: 'O ficheiro SAF-T (Standard Audit File for Tax purposes - Angola) deve ser exportado e submetido mensalmente até ao dia 15 do mês seguinte.',
    steps: [
      { title: '1. Verificar se Todos os Caixas Foram Fechados', desc: 'Certifique-se de que não existem sessões de caixa ou faturas pendentes de fecho no mês a reportar.' },
      { title: '2. Aceder a Relatórios > SAF-T (AO)', desc: 'No menu lateral, selecione a opção SAF-T e escolha o mês e ano correspondente.' },
      { title: '3. Executar o Pré-Validador Integrado', desc: 'Clique em "Verificar Integridade". O Kivora confere se existem NIFs em falta, taxas de IVA incorretas ou séries descontinuadas.' },
      { title: '4. Gerar e Descarregar o XML', desc: 'Clique em "Exportar SAF-T". Guarde o ficheiro XML na pasta de contabilidade ou numa Pen USB.' },
      { title: '5. Submeter no Portal e-AGT', desc: 'Aceda a agt.minfin.gov.ao, entre com as credenciais da sua empresa e faça o upload do ficheiro gerado.' },
    ],
    legalNotes: 'A submissão do SAF-T é obrigatória para todos os sujeitos passivos de IVA ou com contabilidade organizada na República de Angola.',
    tips: 'Guarde sempre o comprovativo de entrega emitido pelo portal da AGT juntamente com a pasta do mês fiscal.',
  },
  {
    id: 'rede-lan-setup',
    category: 'redes',
    categoryLabel: 'Rede Local LAN',
    title: 'Configuração de Rede Local (LAN) sem Depender de Internet',
    readTime: '6 min',
    summary: 'Como ligar múltiplos postos de trabalho (caixas e gerência) em rede local partilhando a mesma base de dados.',
    overview: 'O Kivora ERP opera de forma ultrarrápida em rede local. Um computador assume o papel de Servidor e os postos clientes conectam-se por cabo de rede ou Wi-Fi interno.',
    steps: [
      { title: '1. Instalar o Servidor Central', desc: 'No computador principal (servidor da loja), execute o setup e marque a opção "Criar Servidor Local".' },
      { title: '2. Obter o Endereço IP do Servidor', desc: 'No computador servidor, abra a aplicação Kivora e anote o IP exibido em Configurações > Rede (ex: 192.168.1.100).' },
      { title: '3. Instalar nos Postos Clientes', desc: 'Nos computadores dos caixas, execute o instalador e selecione "Conectar a Servidor Existente".' },
      { title: '4. Introduzir o IP e Conectar', desc: 'Digite o IP do servidor e clique em "Testar Ligação". A sincronização de artigos e clientes é imediata.' },
    ],
    legalNotes: 'Recomendamos a fixação de IP estático no computador servidor através das configurações do router da loja.',
    tips: 'Para garantir máxima velocidade de atendimento, prefira cabos de rede Ethernet (Cat6) para os caixas de maior fluxo.',
  },
  {
    id: 'fecho-caixa-relatorio-z',
    category: 'pos',
    categoryLabel: 'POS & Caixas',
    title: 'Fecho de Turno de Caixa e Emissão do Relatório Z',
    readTime: '3 min',
    summary: 'Como realizar a contagem física de valores, conferir vendas por TPA/Numerário e fechar o turno com rigor.',
    overview: 'O fecho de caixa cego do Kivora ERP assegura que o operador insere o montante real apurado sem visualizar previamente os totais do sistema.',
    steps: [
      { title: '1. Aceder a Gestão de Caixa > Fechar Turno', desc: 'No ecrã do POS, clique no botão "Fechar Caixa" ou use o atalho F12.' },
      { title: '2. Contagem Cega das Moedas e Notas', desc: 'Insira o montante apurado em numerário na gaveta e os totais emitidos pelos terminais TPA Multicaixa.' },
      { title: '3. Emitir o Relatório Z Fiscal', desc: 'Confirme o encerramento. A impressora emite o Relatório Z com o resumo de IVA liquidado e meios de pagamento.' },
    ],
    tips: 'Os relatórios de fecho de caixa ficam arquivados na base de dados para consulta da gerência a qualquer momento.',
  },
  {
    id: 'isencoes-iva-angola',
    category: 'faturacao',
    categoryLabel: 'Faturação Eletrónica AGT',
    title: 'Cadastro de Artigos com Isenção de IVA (Códigos M02, M04, M05)',
    readTime: '4 min',
    summary: 'Como associar o motivo legal de isenção de IVA exigido pela AGT para medicamentos, cesta básica e educação.',
    overview: 'A legislação angolana exige que todo o artigo vendido com taxa de IVA 0% tenha associado o respetivo código oficial da Tabela de Motivos de Isenção da AGT.',
    steps: [
      { title: '1. Aceder a Artigos > Novo / Editar', desc: 'Abra a ficha do produto que pretende configurar no Kivora.' },
      { title: '2. Definir a Taxa de IVA para 0%', desc: 'No campo Taxa de IVA, selecione a opção 0% (Isento).' },
      { title: '3. Selecionar o Motivo Legal da AGT', desc: 'Escolha na lista: M02 (Transmissão de bens e serviços não sujeitos), M04 (Isenção nos termos da alínea a) do art. 12.º), etc.' },
      { title: '4. Gravar o Artigo', desc: 'Ao faturar este produto, o Kivora imprime automaticamente a menção legal no rodapé da fatura conforme a lei.' },
    ],
    legalNotes: 'A ausência do motivo legal de isenção no ficheiro SAF-T é motivo de rejeição automática no portal da AGT.',
    tips: 'Consulte o seu contabilista para confirmar o enquadramento fiscal exato dos produtos da sua atividade comercial.',
  },
  {
    id: 'irt-2026-recursos-humanos',
    category: 'rh',
    categoryLabel: 'Recursos Humanos & IRT',
    title: 'Tabelas de IRT 2026 e Processamento Salarial no KIVORA RH',
    readTime: '5 min',
    summary: 'Como configurar os escalões do Imposto sobre o Rendimento do Trabalho (IRT) e Segurança Social (INSS).',
    overview: 'O módulo de RH do Kivora já incorpora os limites de isenção e taxas progressivas do IRT 2026, calculando o salário líquido com 1 clique.',
    steps: [
      { title: '1. Cadastrar os Colaboradores', desc: 'Introduza o Nome, NIF, Número de INSS, Salário Base e Subsídios (Alimentação, Transporte).' },
      { title: '2. Processar Folha de Salários do Mês', desc: 'No menu RH > Processamento, clique em "Gerar Folha". O sistema calcula as retenções de IRT e INSS (3% trabalhador e 8% entidade patronal).' },
      { title: '3. Emitir Recibos de Vencimento e Mapas', desc: 'Imprima os recibos de ordenado e gere o Mapa de Remunerações e Guia de Pagamento de Impostos.' },
    ],
    tips: 'Pode exportar a folha de salários para ficheiro de transferências bancárias em lote (formato PS2/Excel).',
  },
];

export const RecursosPage: React.FC<RecursosPageProps> = ({ onNavigatePage }) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  const filteredGuides = useMemo(() => {
    return GUIDES.filter((g) => {
      const matchCat = activeCategory === 'todos' || g.category === activeCategory;
      const matchQuery =
        !searchQuery ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Hero Showcase */}
      <PageHero
        image={executivosImg}
        tag="Base de Conhecimento & Manuais"
        title="Documentação Operacional & Fiscal do KIVORA"
        sub="Guias práticos, normas da AGT, manuais de redes locais e procedimentos para tirar o máximo partido do software na sua empresa."
      />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-12">
        
        {/* Search & Category Filter */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Pesquisar por assunto (ex: SAF-T, Relatório Z, Rede LAN, Isenção de IVA, IRT)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
            {[
              { id: 'todos', label: 'Todos os Guias' },
              { id: 'faturacao', label: 'Faturação AGT' },
              { id: 'saft', label: 'SAF-T Angola' },
              { id: 'redes', label: 'Redes Locais LAN' },
              { id: 'pos', label: 'POS & Caixas' },
              { id: 'rh', label: 'Recursos Humanos & IRT' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase">
                  <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    {guide.categoryLabel}
                  </span>
                  <span className="text-slate-400 font-bold">{guide.readTime} leitura</span>
                </div>

                <h3 className="text-base font-black text-slate-950 group-hover:text-blue-600 transition-colors leading-snug">
                  {guide.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {guide.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>Abrir Manual Completo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links Section */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase text-blue-400 tracking-wider">Apoio Adicional</span>
            <h3 className="text-2xl sm:text-3xl font-black">Não encontrou a resposta que procura?</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
              A nossa equipa de suporte técnico e consultoria fiscal está disponível para ajudar no seu negócio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigatePage('suporte')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contactar Suporte Técnico</span>
            </button>
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all border border-slate-700 cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Centro de Downloads</span>
            </button>
          </div>
        </div>

      </section>

      {/* Modal de Leitura de Manual Detalhado */}
      {selectedGuide && (
        <div className="modal-overlay fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-md">
                  {selectedGuide.categoryLabel}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-950">
                  {selectedGuide.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Manual */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wide">Visão Geral:</h4>
                <p className="text-blue-900 text-xs leading-relaxed">{selectedGuide.overview}</p>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="font-black text-slate-950 text-base">Procedimento Passo a Passo:</h4>
                <div className="space-y-3">
                  {selectedGuide.steps.map((step, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-slate-950 font-bold block text-xs sm:text-sm">{step.title}</strong>
                      <p className="text-xs text-slate-600">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedGuide.legalNotes && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 text-xs text-amber-900">
                  <strong className="font-black uppercase tracking-wider block text-[11px]">Enquadramento Legal & Fiscal AGT:</strong>
                  <p>{selectedGuide.legalNotes}</p>
                </div>
              )}

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs text-emerald-900">
                <strong className="font-black uppercase tracking-wider block text-[11px]">Dica dos Especialistas Kivora:</strong>
                <p>{selectedGuide.tips}</p>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-medium">
                Documentação Oficial KIVORA ERP v2026.08
              </span>
              <button
                onClick={() => setSelectedGuide(null)}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Fechar Manual
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

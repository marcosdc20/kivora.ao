import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import {
  BookOpen, Search, HelpCircle,
  ArrowRight, ShieldCheck, Printer
} from 'lucide-react';
import { PageId } from '../components/Header';
import { YouTubePlayer } from '../components/YouTubePlayer';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';

import welcomeImg from '../assets/kivora/jovem-empresario-dado-boas-vindas.png';

interface ManuaisPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

type RoleCategory = 'todos' | 'caixa' | 'gerencia' | 'contabilidade' | 'hardware';

interface GuiaItem {
  id: string;
  categoria: RoleCategory;
  perfil: string;
  titulo: string;
  resumo: string;
  tempoLeitura: string;
  passos: string[];
  dicaPro: string;
}

export const ManuaisPage: React.FC<ManuaisPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGuideId, setActiveGuideId] = useState<string | null>('caixa-1');

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const guias: GuiaItem[] = [
    {
      id: 'caixa-1',
      categoria: 'caixa',
      perfil: 'Operador de Ponto de Venda (POS)',
      titulo: 'Como Abrir o Caixa e Registar o Fundo de Maneio',
      resumo: 'Passo a passo para iniciar o turno de trabalho com contagem inicial de trocos em numerário.',
      tempoLeitura: '2 min',
      passos: [
        'No ecrã inicial do KIVORA POS, clique em "Abrir Turno de Caixa".',
        'Introduza o código de operador e senha pessoal.',
        'Insira o valor em Kwanzas (AOA) do fundo de maneio disponível na gaveta (trocos iniciais).',
        'Confirme a abertura. A gaveta abrirá automaticamente e o sistema emitirá o comprovativo de abertura de turno.',
      ],
      dicaPro: 'Nunca partilhe a sua senha de operador. Cada fecho de caixa é auditado individualmente por operador para evitar divergências.',
    },
    {
      id: 'caixa-2',
      categoria: 'caixa',
      perfil: 'Operador de Ponto de Venda (POS)',
      titulo: 'Como Registar Vendas Rápidas e Imprimir com NIF',
      resumo: 'Como passar artigos com leitor de código de barras e emitir Fatura-Recibo oficial.',
      tempoLeitura: '3 min',
      passos: [
        'Passe o leitor de código de barras nos produtos ou pesquise pelo nome/código rápido no ecrã.',
        'Para ajustar a quantidade, digite o número e prima a tecla multiplicadora (*).',
        'Caso o cliente solicite NIF, clique em "Inserir NIF" e digite o número de contribuinte (o nome é preenchido automaticamente se já estiver cadastrado).',
        'Prima a tecla de pagamento rápido, selecione o meio (Numerário, TPA Multicaixa ou Express) e clique em "Emitir Fatura-Recibo (FR)".',
      ],
      dicaPro: 'O talão sai impresso em menos de 1 segundo na impressora térmica 80mm com o QR Code oficial da AGT no rodapé.',
    },
    {
      id: 'caixa-3',
      categoria: 'caixa',
      perfil: 'Operador de Ponto de Venda (POS)',
      titulo: 'Como Fazer o Fecho de Turno (X) e Fecho Diário (Z-Report)',
      resumo: 'Conferência de valores de vendas em dinheiro, TPA Multicaixa e emissão do mapa de fecho.',
      tempoLeitura: '3 min',
      passos: [
        'No menu do POS, clique em "Fecho de Caixa".',
        'O sistema apresenta o ecrã de conferência cega: conte o dinheiro físico e os comprovativos de TPA e digite os valores apurados.',
        'O sistema compara os valores contados com as vendas registadas e gera o mapa de divergências (se houver).',
        'Imprima o relatório Z diário para arquivamento no fecho das contas da loja.',
      ],
      dicaPro: 'O relatório Z-Report numera sequencialmente cada dia de faturação e é o comprovativo físico exigido pelos auditores fiscais.',
    },
    {
      id: 'caixa-4',
      categoria: 'caixa',
      perfil: 'Operador de Ponto de Venda (POS)',
      titulo: 'Como Emitir Nota de Crédito para Retificação ou Devolução',
      resumo: 'Procedimento legal obrigatório da AGT para devolução de mercadorias ou anulação de faturas.',
      tempoLeitura: '3 min',
      passos: [
        'No menu Faturação > Documentos Emitidos, localize a fatura original pelo número ou NIF do cliente.',
        'Clique em "Emitir Nota de Crédito (NC)".',
        'Selecione se a devolução é total ou parcial (escolhendo apenas os artigos devolvidos).',
        'Indique o motivo da retificação (ex: "Devolução de mercadoria com defeito" ou "Erro no NIF").',
        'Confirme a emissão. O stock dos artigos devolvidos regressa automaticamente ao armazém da loja.',
      ],
      dicaPro: 'De acordo com o Decreto 71/25 da AGT, é estritamente proibido rasgar faturas. Qualquer anulação tem de ser feita através de Nota de Crédito.',
    },
    {
      id: 'gerencia-1',
      categoria: 'gerencia',
      perfil: 'Gerente & Gestão de Stock',
      titulo: 'Como Dar Entrada de Compras com Fatura de Fornecedor',
      resumo: 'Registo de mercadorias no armazém e atualização automática do Preço Médio Ponderado (PMP).',
      tempoLeitura: '4 min',
      passos: [
        'Aceda ao menu Compras > Entrada de Mercadoria.',
        'Selecione o fornecedor e digite o número da fatura de compra do fornecedor.',
        'Adicione os artigos recebidos, quantidades e preços de custo unitários.',
        'Verifique os impostos aplicados (IVA suportado) e clique em "Validar Entrada de Stock".',
        'O stock é imediatamente incrementado e o custo médio é recalculado.',
      ],
      dicaPro: 'Defina sempre o "Stock Mínimo" de cada artigo para o KIVORA alertar no ecrã principal antes que o produto esgote nas prateleiras.',
    },
    {
      id: 'gerencia-2',
      categoria: 'gerencia',
      perfil: 'Gerente & Gestão de Stock',
      titulo: 'Como Transferir Mercadorias Entre Armazém e Lojas',
      resumo: 'Movimentação segura de artigos com emissão de Guia de Transporte (GT) oficial.',
      tempoLeitura: '3 min',
      passos: [
        'No menu Stock > Transferências, clique em "Nova Transferência Interna".',
        'Selecione o Armazém de Origem e o Armazém ou Loja de Destino.',
        'Insira os produtos e quantidades a transportar.',
        'Clique em "Emitir Guia de Transporte (GT)".',
        'A mercadoria sai do stock de origem e só dá entrada no destino quando o encarregado da loja confirmar a receção.',
      ],
      dicaPro: 'A Guia de Transporte emitida pelo KIVORA possui QR Code válido para circulação rodoviária fiscalizada pela Polícia Fiscal e AGT.',
    },
    {
      id: 'contabilidade-1',
      categoria: 'contabilidade',
      perfil: 'Contabilista & Diretor Financeiro',
      titulo: 'Como Extrair e Validar o Ficheiro SAF-T AO (XML) para a AGT',
      resumo: 'Passo a passo para gerar o ficheiro mensal de auditoria fiscal sem erros até dia 15.',
      tempoLeitura: '3 min',
      passos: [
        'No menu Relatórios Fiscais > SAF-T AO, selecione o Ano e o Mês de referência (ex: Janeiro 2026).',
        'Clique em "Auditar Integridade da Base de Dados". O KIVORA verifica se todas as faturas têm hash válido e clientes com NIF correto.',
        'Clique em "Exportar Ficheiro SAF-T AO (XML)".',
        'Guarde o ficheiro na pasta de contabilidade e submeta-o no Portal do Contribuinte da AGT.',
      ],
      dicaPro: 'O validador interno do KIVORA antecipa todos os testes do portal da AGT, garantindo 0% de rejeições ou mensagens de erro no upload.',
    },
    {
      id: 'contabilidade-2',
      categoria: 'contabilidade',
      perfil: 'Contabilista & Diretor Financeiro',
      titulo: 'Como Extrair o Mapa de Apuramento do IVA (Liquidado vs Dedutível)',
      resumo: 'Resumo contabilístico para preenchimento da Declaração Periódica do IVA.',
      tempoLeitura: '3 min',
      passos: [
        'Aceda a Contabilidade > Mapas Fiscais > Declaração Periódica do IVA.',
        'Defina o período pretendido (mensal ou trimestral).',
        'Consulte o total de IVA Liquidado nas vendas a 14% e 7%, e o total de IVA Dedutível nas compras a fornecedores.',
        'Exporte o mapa detalhado em PDF e folha de cálculo Excel/CSV para reconciliação bancária.',
      ],
      dicaPro: 'Os relatórios do KIVORA já vêm formatados com os códigos das linhas oficiais do modelo da Declaração Periódica de IVA da AGT.',
    },
    {
      id: 'hardware-1',
      categoria: 'hardware',
      perfil: 'Técnico de TI & Infraestrutura',
      titulo: 'Como Configurar a Impressora Térmica 80mm ESC/POS (USB / Rede)',
      resumo: 'Guia de instalação de impressoras de talões para corte automático e alta velocidade.',
      tempoLeitura: '4 min',
      passos: [
        'Ligue o cabo USB ou cabo de rede Ethernet da impressora ao computador ou router.',
        'No KIVORA ERP, vá a Definições > Dispositivos & Periféricos > Impressora de Talões.',
        'Selecione o modelo (ESC/POS Genérico 80mm, Epson TM-T20, Bixolon ou Xprinter).',
        'Clique em "Imprimir Talão de Teste". A impressora imprimirá o logotipo da KIVORA e efetuará o corte automático de papel.',
      ],
      dicaPro: 'Recomendamos rolos de papel térmico de 80x80mm com sensibilidade para conservação de impressão até 5 anos.',
    },
    {
      id: 'hardware-2',
      categoria: 'hardware',
      perfil: 'Técnico de TI & Infraestrutura',
      titulo: 'Como Ligar a Gaveta de Dinheiro RJ11 à Impressora',
      resumo: 'Abertura elétrica automática da gaveta ao finalizar cada transação no POS.',
      tempoLeitura: '2 min',
      passos: [
        'Conecte o cabo telefónico RJ11 da gaveta de dinheiro à porta "DK / Drawer" na traseira da impressora térmica 80mm.',
        'Nas configurações do KIVORA POS, certifique-se de que a opção "Abrir Gaveta ao Concluir Venda" está ativa.',
        'Faça uma venda de teste em dinheiro: a gaveta abrirá instantaneamente ao imprimir o talão.',
      ],
      dicaPro: 'Não precisa de cabos de alimentação extra para a gaveta; o sinal elétrico é enviado diretamente através do cabo RJ11 da impressora.',
    },
  ];

  const filteredGuias = guias.filter((guia) => {
    const matchesCat = selectedCategory === 'todos' || guia.categoria === selectedCategory;
    const matchesSearch =
      guia.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guia.resumo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guia.perfil.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeGuide = guias.find((g) => g.id === activeGuideId) || guias[0];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 page-enter font-sans">
      
      {/* Hero Showcase Institucional */}
      <PageHero
        image={welcomeImg}
        tag="Base de Conhecimento & Formação Operacional"
        title="Central de Manuais & Tutoriais Rápidos KIVORA"
        sub="Guias práticos passo a passo para operadores de caixa, gerentes de loja, contabilistas e equipas de TI. Aprenda a operar todas as rotinas diárias com máxima eficiência e conformidade fiscal."
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-12">
        
        {/* Filtros e Barra de Pesquisa */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Categorias por Perfil */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'todos', label: 'Todos os Manuais' },
              { id: 'caixa', label: 'Operadores de Caixa' },
              { id: 'gerencia', label: 'Gerentes & Stock' },
              { id: 'contabilidade', label: 'Contabilistas' },
              { id: 'hardware', label: 'Hardware & TI' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as RoleCategory)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar manual ou dúvida..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

        </div>

        {/* Vídeo Tutorial em Destaque — Sem Molduras Pesadas */}
        {settings.videoManuaisUrl && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-amber-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Vídeo-Aula em Destaque
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {settings.videoManuaisTitle || 'Guia Rápido: Operação de Caixa & Fecho Z'}
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl">
                  {settings.videoManuaisDesc || 'Aprenda passo a passo como realizar a abertura de turno, registo de vendas por código de barras e emissão do relatório diário Z.'}
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <YouTubePlayer
                videoUrl={settings.videoManuaisUrl}
                title={settings.videoManuaisTitle}
                subtitle={settings.videoManuaisDesc}
                badge="Tutorial em Vídeo"
                accentColor="amber"
                aspectRatio="video"
              />
            </div>
          </div>
        )}

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lista de Manuais (Esquerda) */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Manuais Encontrados ({filteredGuias.length})
            </p>

            {filteredGuias.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Nenhum manual encontrado</p>
                <p className="text-xs text-slate-500">Tente pesquisar por outro termo ou selecione "Todos os Manuais".</p>
              </div>
            ) : (
              filteredGuias.map((guia) => {
                const isActive = activeGuide.id === guia.id;
                return (
                  <div
                    key={guia.id}
                    onClick={() => setActiveGuideId(guia.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 select-none ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {guia.perfil}
                      </span>
                      <span className={`text-[11px] font-semibold ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {guia.tempoLeitura}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold leading-snug ${isActive ? 'text-white' : 'text-slate-950'}`}>
                      {guia.titulo}
                    </h3>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                      {guia.resumo}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Visualizador do Manual Selecionado (Direita) */}
          <div className="lg:col-span-7">
            {activeGuide && (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8 sticky top-24">
                
                {/* Cabeçalho do Guia */}
                <div className="space-y-3 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{activeGuide.perfil}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Tempo estimado: {activeGuide.tempoLeitura}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight">
                    {activeGuide.titulo}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {activeGuide.resumo}
                  </p>
                </div>

                {/* Passos do Procedimento */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>Instruções Passo a Passo:</span>
                  </h4>

                  <div className="space-y-3">
                    {activeGuide.passos.map((passo, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {idx + 1}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                          {passo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dica Profissional */}
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Recomendação de Boas Práticas KIVORA:</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {activeGuide.dicaPro}
                  </p>
                </div>

                {/* Footer do Guia */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 font-medium">
                    Precisa de formação presencial para a sua equipa em Luanda?
                  </span>
                  <button
                    onClick={() => onOpenDemoModal(`Formação: ${activeGuide.titulo}`)}
                    className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shrink-0 cursor-pointer"
                  >
                    Agendar Sessão Técnica
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Banners de Atalho Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div
            onClick={() => onNavigatePage('guia-agt')}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-950">Guia Oficial de Conformidade AGT</h4>
                <p className="text-xs text-slate-500 mt-0.5">Decreto Presidencial 71/25, regimes de IVA e prazos SAF-T.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>

          <div
            onClick={() => onNavigatePage('hardware')}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-950">Hardware & Equipamentos Homologados</h4>
                <p className="text-xs text-slate-500 mt-0.5">Impressoras térmicas 80mm, leitores 2D e gavetas elétricas.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
        </div>

      </div>
    </div>
  );
};

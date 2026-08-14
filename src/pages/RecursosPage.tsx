import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ArrowRight, FileText, Video, BookOpen, Download, X, Sparkles } from 'lucide-react';
import { PageId } from '../components/Header';
import { CURRENT_RELEASE } from '../data/kivoraData';

interface RecursosPageProps {
  onNavigatePage: (page: PageId) => void;
}

interface ResourceItem {
  icon: React.ReactNode;
  category: string;
  title: string;
  desc: string;
  action: string;
  content: {
    overview: string;
    steps: string[];
    tips?: string;
  };
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

export const RecursosPage: React.FC<RecursosPageProps> = ({ onNavigatePage }) => {
  useScrollReveal();
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const resources: ResourceItem[] = [
    {
      icon: <FileText className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Documentação',
      title: 'Guia de Instalação Passo a Passo',
      desc: 'Manual completo para instalar o KIVORA em modo standalone ou em rede local com múltiplos postos.',
      action: 'Ler Guia',
      content: {
        overview: 'O instalador do Kivora foi projetado para ser intuitivo e autónomo, configurando a base de dados e os serviços de rede local automaticamente.',
        steps: [
          'Descarregue o instalador Setup na página de Downloads do Kivora.',
          'Execute o instalador com privilégios de administrador no Windows 10 ou 11.',
          'Selecione a pasta de destino e marque a opção "Criar Servidor Local" se for o computador principal.',
          'Conclua a instalação e execute o Kivora para introduzir a sua chave de ativação.',
        ],
        tips: 'Em instalações em rede local, certifique-se de que os computadores clientes estão conectados ao mesmo router ou switch de rede.',
      },
    },
    {
      icon: <FileText className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Documentação',
      title: 'Manual de Faturação AGT DS.120',
      desc: 'Como configurar QR Code, assinatura digital RS256 e comunicação com o portal da AGT para conformidade fiscal.',
      action: 'Ler Manual',
      content: {
        overview: 'O Kivora cumpre todas as regras da especificação técnica DS.120 da AGT, emitindo faturas com assinatura criptográfica inalterável.',
        steps: [
          'Aceda a Configurações > Empresa e preencha o NIF e a morada fiscal exatamente como consta na certidão comercial.',
          'Insira as séries de faturação autorizadas pela AGT.',
          'O sistema gera automaticamente o Hash RS256 de 4 caracteres para o rodapé do documento.',
          'O QR Code impresso permite ao cliente e à fiscalização verificar a autenticidade imediata no portal da AGT.',
        ],
        tips: 'Nunca altere a data do computador após iniciar a emissão de faturas para não quebrar a ordem cronológica exigida pela AGT.',
      },
    },
    {
      icon: <Video className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Tutoriais',
      title: 'Primeiros Passos com o KIVORA',
      desc: 'Guia prático desde a configuração inicial da empresa até à emissão da primeira fatura eletrónica.',
      action: 'Ver Tutorial',
      content: {
        overview: 'Em menos de 10 minutos terá a sua empresa pronta para começar a vender e faturar aos seus clientes.',
        steps: [
          'Cadastre os artigos com as respetivas taxas de IVA (14%, 7%, 5% ou regime de Isenção).',
          'Configure a sua impressora de talões térmica (58mm/80mm) ou impressora A4 de secretária.',
          'Abra a gaveta de dinheiro e a sessão do caixa.',
          'Adicione produtos ao carrinho por código de barras ou pesquisa rápida e conclua a venda.',
        ],
        tips: 'Pode importar a lista de produtos em massa através de folha de cálculo Excel.',
      },
    },
    {
      icon: <BookOpen className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Conformidade Fiscal',
      title: 'SAF-T Angola — Exportação e Submissão',
      desc: 'Como gerar o ficheiro SAF-T no KIVORA e como submetê-lo ao portal da AGT dentro do prazo legal.',
      action: 'Ver Guia',
      content: {
        overview: 'A entrega do ficheiro SAF-T (AO) é obrigatória até ao dia 15 do mês seguinte para contribuintes registados.',
        steps: [
          'No menu lateral, aceda a Faturação > Exportar SAF-T (AO).',
          'Selecione o mês e o ano que deseja comunicar à AGT.',
          'Clique em "Gerar e Validar Ficheiro XML".',
          'Submeta o ficheiro gerado no Portal do Contribuinte da AGT com o seu login fiscal.',
        ],
        tips: 'O Kivora faz uma pré-validação antes de gerar o ficheiro para garantir que não existem erros de estrutura.',
      },
    },
    {
      icon: <FileText className="w-5 h-5" strokeWidth={1.75} />,
      category: 'RH & Salários',
      title: 'Configuração IRT 2026',
      desc: 'Tabela de IRT 2026 já incluída no KIVORA. Este guia explica como processar o mapa de salários mensal.',
      action: 'Ler Guia',
      content: {
        overview: 'O módulo de Recursos Humanos do Kivora automatiza as deduções de segurança social e escalões progressivos de IRT.',
        steps: [
          'Cadastre os colaboradores no menu Recursos Humanos.',
          'Insira o salário base, subsídios de alimentação, transporte e outros abonos.',
          'Processe a folha de pagamento mensal com um clique.',
          'Emita os recibos de vencimento individuais e o mapa recapitulativo para a AGT e INSS.',
        ],
        tips: 'Os cálculos respeitam as isenções legais de subsídios de transporte e alimentação em vigor em Angola.',
      },
    },
    {
      icon: <Download className="w-5 h-5" strokeWidth={1.75} />,
      category: 'Downloads',
      title: `Notas de Versão v${CURRENT_RELEASE.version}`,
      desc: 'Resumo de todas as novas funcionalidades, correções e melhorias na versão atual do KIVORA.',
      action: 'Ver Notas',
      content: {
        overview: `Versão oficial ${CURRENT_RELEASE.version} lançada em ${CURRENT_RELEASE.date}.`,
        steps: CURRENT_RELEASE.changelog,
        tips: 'Mantenha o seu sistema sempre atualizado para usufruir das últimas regras fiscais da AGT.',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      <div className="pt-16">
        <PageHero
          image="/imagens/pacote.png"
          tag="Centro de Recursos"
          title="Documentação, tutoriais e guias de conformidade"
          sub="Tudo o que precisa para instalar, configurar e tirar o máximo partido do KIVORA."
        />
      </div>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res, i) => (
            <div
              key={i}
              data-reveal
              onClick={() => setSelectedResource(res)}
              className="sr-init bg-white border border-slate-200 rounded-3xl p-7 flex flex-col gap-4 hover:border-blue-400/40 hover:shadow-lg transition-all group cursor-pointer"
              style={{ transitionDelay: `${Math.min(i, 4) * 70}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {res.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{res.category}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-950 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{res.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{res.desc}</p>
              </div>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group/btn transition-colors self-start cursor-pointer">
                <span>{res.action}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Resource Guide Reader Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                  {selectedResource.icon}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{selectedResource.category}</span>
                  <h3 className="text-lg font-black text-slate-950 leading-tight">{selectedResource.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-700">
              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {selectedResource.content.overview}
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {selectedResource.category === 'Downloads' ? 'Lista de Melhorias e Novidades:' : 'Passos Recomendados:'}
                </h4>
                <div className="space-y-2.5">
                  {selectedResource.content.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedResource.content.tips && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p><strong>Dica Técnica:</strong> {selectedResource.content.tips}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setSelectedResource(null);
                  onNavigatePage('download');
                }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Instalador KIVORA</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Baixar Instalador */}
      <section className="bg-slate-950 py-16 px-6 sm:px-10 lg:px-16">
        <div data-reveal className="sr-init max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-xl font-black mb-1">Pronto para instalar?</h3>
            <p className="text-slate-400 text-sm">Baixe o instalador KIVORA v2026.08 e comece hoje.</p>
          </div>
          <button
            onClick={() => onNavigatePage('download')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            <span>Ir para Downloads</span>
          </button>
        </div>
      </section>

    </div>
  );
};

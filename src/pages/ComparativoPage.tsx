import React, { useState } from 'react';
import {
  Check, X, AlertTriangle,
  Zap, Download, Calculator, HelpCircle
} from 'lucide-react';
import { PageId } from '../components/Header';

interface ComparativoPageProps {
  onNavigatePage: (page: PageId) => void;
}

interface ComparisonFeature {
  category: string;
  feature: string;
  description: string;
  kivora: {
    supported: boolean | 'partial';
    text: string;
  };
  cloudSoftware: {
    supported: boolean | 'partial';
    text: string;
  };
  pirateSoftware: {
    supported: boolean | 'partial';
    text: string;
  };
}

const COMPARISON_DATA: ComparisonFeature[] = [
  {
    category: 'Estabilidade & Conexão',
    feature: 'Funcionamento sem Internet (Offline-First)',
    description: 'Capacidade de emitir faturas e gerir caixas quando a fibra ótica ou 4G falha.',
    kivora: { supported: true, text: '100% Funcional (Base Local)' },
    cloudSoftware: { supported: false, text: 'Trava totalmente sem internet' },
    pirateSoftware: { supported: true, text: 'Funciona, mas sem segurança' },
  },
  {
    category: 'Estabilidade & Conexão',
    feature: 'Velocidade de Impressão e Caixa (POS)',
    description: 'Tempo médio entre fechar a venda e imprimir o talão fiscal.',
    kivora: { supported: true, text: '< 1 segundo (Rede LAN Local)' },
    cloudSoftware: { supported: 'partial', text: '3 a 8 seg (depende da latência web)' },
    pirateSoftware: { supported: 'partial', text: 'Variável e instável' },
  },
  {
    category: 'Conformidade Fiscal AGT',
    feature: 'Certificação AGT (Decreto Pres. 71/25)',
    description: 'Certificação oficial com assinatura RS256 e QR Code impresso.',
    kivora: { supported: true, text: 'Certificado Oficial AGT' },
    cloudSoftware: { supported: true, text: 'Geralmente certificado' },
    pirateSoftware: { supported: false, text: 'ILEGAL (Risco de Multas Fiscais)' },
  },
  {
    category: 'Conformidade Fiscal AGT',
    feature: 'Exportação SAF-T (AO) Pré-Validada',
    description: 'Geração de ficheiro XML do SAF-T pronto para submissão no portal da AGT.',
    kivora: { supported: true, text: 'Sem erros de estrutura' },
    cloudSoftware: { supported: true, text: 'Disponível' },
    pirateSoftware: { supported: false, text: 'Inexistente ou corrompido' },
  },
  {
    category: 'Custos & Licenciamento',
    feature: 'Preços Fixados em Kwanzas (AOA)',
    description: 'Proteção contra a desvalorização cambial do Dólar ou Euro.',
    kivora: { supported: true, text: 'Valores 100% em Kwanzas' },
    cloudSoftware: { supported: false, text: 'Cobrado em USD/EUR com variação' },
    pirateSoftware: { supported: 'partial', text: 'Sem garantia nem suporte' },
  },
  {
    category: 'Custos & Licenciamento',
    feature: 'Opção de Licença Vitalícia Perpétua',
    description: 'Possibilidade de adquirir o software de forma definitiva sem mensalidade eterna.',
    kivora: { supported: true, text: 'Disponível (Plano Vitalício)' },
    cloudSoftware: { supported: false, text: 'Apenas aluguer mensal perpétuo' },
    pirateSoftware: { supported: false, text: 'Pode expirar ou bloquear a qualquer hora' },
  },
  {
    category: 'Custos & Licenciamento',
    feature: 'Expansão de Postos em Rede (LAN) Económica',
    description: 'Adicionar computadores de caixa e backoffice por preços justos.',
    kivora: { supported: true, text: 'Terminais acessíveis em rede local' },
    cloudSoftware: { supported: false, text: 'Cobra mensalidade cheia por cada utilizador' },
    pirateSoftware: { supported: false, text: 'Sem suporte a rede estável' },
  },
  {
    category: 'Privacidade & Suporte',
    feature: 'Soberania e Custódia dos Dados da Empresa',
    description: 'Onde os seus dados de clientes, receitas e compras ficam guardados.',
    kivora: { supported: true, text: 'No seu próprio computador ou servidor' },
    cloudSoftware: { supported: 'partial', text: 'Em servidores no exterior' },
    pirateSoftware: { supported: false, text: 'Risco de vírus, cavalos de troia e ransomware' },
  },
  {
    category: 'Privacidade & Suporte',
    feature: 'Assistência Técnica Presencial em Angola',
    description: 'Técnicos credenciados em Luanda e nas 18 províncias para instalação e socorro.',
    kivora: { supported: true, text: 'Rede Nacional de Parceiros' },
    cloudSoftware: { supported: 'partial', text: 'Apenas tickets por email ou chat' },
    pirateSoftware: { supported: false, text: 'Zero assistência' },
  },
];

export const ComparativoPage: React.FC<ComparativoPageProps> = ({ onNavigatePage }) => {
  const [activeCategory, setActiveCategory] = useState<string>('todas');

  const categories = ['todas', 'Estabilidade & Conexão', 'Conformidade Fiscal AGT', 'Custos & Licenciamento', 'Privacidade & Suporte'];

  const filteredFeatures = activeCategory === 'todas'
    ? COMPARISON_DATA
    : COMPARISON_DATA.filter(f => f.category === activeCategory);

  return (
    <main className="min-h-screen bg-slate-50/50 pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Header da Página */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Comparativo de Mercado Transparente</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-slate-950 tracking-tight leading-tight">
            Por Que o <span className="text-[#1746A2]">KIVORA ERP</span> é a Escolha Certa?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Compare o KIVORA com softwares internacionais 100% em nuvem e softwares não homologados. Entenda porque somos a solução ideal para o ambiente de negócios em Angola.
          </p>
        </div>

        {/* 3 Cartões Rápidos de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card Kivora */}
          <div className="bg-[#0B192C] text-white p-7 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-blue-500/30 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block">
                Solução Recomendada
              </span>
              <h3 className="text-2xl font-bold font-display text-white">KIVORA ERP</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                Base de dados local segura, não trava sem internet, preços em Kwanzas e certificação AGT vitalícia.
              </p>
              <div className="space-y-3 text-xs font-medium text-white pt-2 border-t border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Fatura 24/7 sem internet (Offline-First)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Sem risco cambial com dólar ou euro</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Suporte presencial nas 18 províncias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Cloud Estrangeiro */}
          <div className="surface-card p-7 sm:p-8 flex flex-col justify-between space-y-6 text-slate-800">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block border border-slate-200">
                Softwares 100% Nuvem (SaaS)
              </span>
              <h3 className="text-2xl font-bold font-display text-slate-900">Nuvem Estrangeira</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal">
                Dependem 100% de ligação à internet fibra e cobram mensalidades em USD/EUR por cada terminal.
              </p>
              <div className="space-y-3 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-rose-600">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span>Trava quando a internet da loja cai</span>
                </div>
                <div className="flex items-center gap-2.5 text-rose-600">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span>Mensalidades caras indexadas ao dólar</span>
                </div>
                <div className="flex items-center gap-2.5 text-amber-700">
                  <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <span>Suporte remoto lento por fuso horário</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Software Pirata */}
          <div className="surface-card p-7 sm:p-8 flex flex-col justify-between space-y-6 text-slate-800 border-rose-200/80 bg-rose-50/20">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block">
                Softwares Não Certificados
              </span>
              <h3 className="text-2xl font-bold font-display text-slate-900">Cópias / Não Homologados</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal">
                Programas crackeados ou sem certificação oficial pela AGT. Alto risco jurídico e técnico.
              </p>
              <div className="space-y-3 text-xs font-medium text-slate-600 pt-2 border-t border-rose-100">
                <div className="flex items-center gap-2.5 text-rose-600 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span>Multas pesadas da AGT (milhões Kz)</span>
                </div>
                <div className="flex items-center gap-2.5 text-rose-600">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span>Risco de corrupção total de dados</span>
                </div>
                <div className="flex items-center gap-2.5 text-rose-600">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span>Zero assistência e sem atualizações</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Filtros da Tabela */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#0B192C] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'todas' ? 'Todas as Categorias' : cat}
            </button>
          ))}
        </div>

        {/* Tabela Detalhada de Comparação */}
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="p-4 sm:p-6 text-xs font-bold font-display uppercase tracking-wider text-slate-900 w-2/5">
                    Critério / Funcionalidade
                  </th>
                  <th className="p-4 sm:p-6 text-xs font-bold font-display uppercase tracking-wider text-blue-700 bg-blue-50/60 w-1/5 text-center">
                    KIVORA ERP
                  </th>
                  <th className="p-4 sm:p-6 text-xs font-bold font-display uppercase tracking-wider text-slate-700 w-1/5 text-center">
                    SaaS em Nuvem
                  </th>
                  <th className="p-4 sm:p-6 text-xs font-bold font-display uppercase tracking-wider text-slate-700 w-1/5 text-center">
                    Não Certificado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredFeatures.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:p-6">
                      <p className="font-bold text-slate-900 text-sm sm:text-base">{item.feature}</p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-normal">{item.description}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>

                    {/* Coluna Kivora */}
                    <td className="p-4 sm:p-6 bg-blue-50/20 text-center font-bold text-slate-900">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-emerald-950 font-bold">{item.kivora.text}</span>
                      </div>
                    </td>

                    {/* Coluna SaaS Cloud */}
                    <td className="p-4 sm:p-6 text-center text-slate-600">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {item.cloudSoftware.supported === true && (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.cloudSoftware.supported === 'partial' && (
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.cloudSoftware.supported === false && (
                          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-xs text-slate-600">{item.cloudSoftware.text}</span>
                      </div>
                    </td>

                    {/* Coluna Pirata */}
                    <td className="p-4 sm:p-6 text-center text-slate-600">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {item.pirateSoftware.supported === true && (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.pirateSoftware.supported === 'partial' && (
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.pirateSoftware.supported === false && (
                          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-xs text-slate-600">{item.pirateSoftware.text}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seção de FAQ Rápido sobre Migração */}
        <div className="surface-card p-8 sm:p-12 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950 text-center">
            Dúvidas Comuns sobre Migrar para o KIVORA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/90 space-y-2 hover:border-blue-300 transition-all">
              <h3 className="font-bold font-display text-slate-950 text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span>Como funciona a migração dos meus artigos e clientes?</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-10">
                O KIVORA possui importador automático através de ficheiros Excel / CSV. Os nossos técnicos parceiros ajudam a importar todos os seus produtos, preços, stocks iniciais e clientes em menos de 1 hora.
              </p>
            </div>

            <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/90 space-y-2 hover:border-blue-300 transition-all">
              <h3 className="font-bold font-display text-slate-950 text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span>Preciso comprar computadores novos?</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-10">
                Não. O KIVORA é extremamente leve e foi otimizado para rodar em computadores comuns com Windows 10 ou 11 (a partir de 4GB de RAM), aproveitando as impressoras e leitores que já possui.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Executivo */}
        <div className="bg-[#0B192C] rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-white leading-tight">
              Faça a Escolha Segura para a sua Empresa
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Economize em taxas cambiais e garanta uma operação sem paragens com o software de faturação certificado pela AGT.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigatePage('download')}
                className="btn-cta px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Testar Gratuitamente por 15 Dias</span>
              </button>
              <button
                onClick={() => onNavigatePage('planos')}
                className="px-7 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Simular Preços & Postos LAN</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

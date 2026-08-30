import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { KIVORA_INFO } from '../data/kivoraData';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-all mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Página Principal</span>
        </button>

        <div className="card-premium p-8 md:p-12 rounded-3xl space-y-8">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-6">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Termos e Condições de Licenciamento</h1>
              <p className="text-xs text-slate-500 font-semibold">KIVORA ERP • Kivora Tecnologias, Lda. • Luanda, Angola</p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-extrabold text-slate-950">1. Licenciamento e Uso do Software</h2>
            <p>
              O KIVORA ERP é um software executivo de gestão empresarial e faturação eletrónica certificado pela Administração Geral Tributária (AGT) com o número de homologação oficial <strong>FE/440/AGT/2026</strong> ao abrigo do <strong>Decreto Presidencial n.º 71/25</strong> e Regime Jurídico das Faturas. A utilização da plataforma é concedida mediante subscrição de planos ou aquisição de licença vitalícia para execução local (Desktop Offline-First).
            </p>

            <h2 className="text-base font-extrabold text-slate-950">2. Responsabilidade sobre Dados Fiscais e Comerciais</h2>
            <p>
              O utilizador é responsável pela exatidão dos dados inseridos no sistema (NIFs de clientes, preços de venda, alíquotas de IVA e artigos). O KIVORA garante a inviolabilidade da numeração sequencial das séries, o cálculo automático de retenções na fonte, a exportação do ficheiro SAF-T AO auditado e a geração da assinatura digital RS256 com QR Code fiscal em todos os documentos.
            </p>

            <h2 className="text-base font-extrabold text-slate-950">3. Operação Offline-First & Soberania Local</h2>
            <p>
              Em caso de indisponibilidade ou corte na ligação à internet, o KIVORA ERP opera 100% offline em posto individual ou em rede local (LAN) multi-caixas, armazenando de forma blindada todas as transações fiscais e stocks sem perda de produtividade.
            </p>

            <h2 className="text-base font-extrabold text-slate-950">4. Suporte Técnico e Atualizações Normativas</h2>
            <p>
              Todas as licenças e subscrições ativas incluem suporte técnico especializado através da equipa em Luanda ({KIVORA_INFO.phoneDisplay}) e atualizações de conformidade legal sem custos adicionais sempre que a AGT publicar novas portarias normativas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

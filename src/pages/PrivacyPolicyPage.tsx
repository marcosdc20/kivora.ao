import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { KIVORA_INFO } from '../data/kivoraData';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Política de Privacidade</h1>
              <p className="text-xs text-slate-500 font-semibold">KIVORA ERP • Kivora Tecnologias, Lda. • Luanda, Angola</p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-slate-950">1. Proteção de Dados Fiscais e Comerciais</h3>
            <p>
              A <strong>Kivora Tecnologias, Lda.</strong>, detentora da plataforma <strong>KIVORA ERP</strong>, compromete-se a proteger a privacidade e a confidencialidade dos dados das empresas clientes. Todas as informações comerciais, cadastros de clientes, faturação e dados de vencimentos são armazenados com encriptação e segurança de alto padrão.
            </p>

            <h3 className="text-base font-extrabold text-slate-950">2. Encriptação de Chaves Privadas do Contribuinte</h3>
            <p>
              Em estrita conformidade com as diretrizes da AGT para a faturação eletrónica, as chaves privadas do contribuinte fornecidas para a assinatura digital de documentos (algoritmo RSA/SHA) são armazenadas encriptadas e nunca são expostas em texto simples após a gravação no sistema.
            </p>

            <h3 className="text-base font-extrabold text-slate-950">3. Comunicação Segura com a AGT</h3>
            <p>
              O envio de dados de faturação e submissão do SAF-T AO ocorre exclusivamente através de canais seguros com autenticação autorizada, visando o cumprimento das obrigações fiscais legais decorrentes da legislação angolana.
            </p>

            <h3 className="text-base font-extrabold text-slate-950">4. Contacto de Proteção de Dados</h3>
            <p>
              Para esclarecimentos sobre o tratamento dos seus dados no KIVORA ERP, contacte o nosso encarregado de proteção através do email <strong>{KIVORA_INFO.supportEmail}</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

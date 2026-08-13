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
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Página Principal</span>
        </button>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Política de Privacidade</h1>
              <p className="text-xs text-slate-500">Última atualização: Fevereiro de 2026 • Kivora ERP</p>
            </div>
          </div>

          <div className="space-y-6 text-xs md:text-sm text-slate-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-slate-900">1. Proteção de Dados Fiscais e Comerciais</h3>
            <p>
              A <strong>Visual Software</strong>, detentora da plataforma <strong>Kivora</strong>, compromete-se a proteger a privacidade e a confidencialidade dos dados das empresas clientes. Todas as informações comerciais, cadastros de clientes, faturação e dados de vencimentos são armazenados com encriptação de nível bancário.
            </p>

            <h3 className="text-base font-extrabold text-slate-900">2. Encriptação de Chaves Privadas do Contribuinte</h3>
            <p>
              Em estrita conformidade com as diretrizes da AGT para a faturação eletrónica, as chaves privadas do contribuinte fornecidas para a assinatura digital de documentos (algoritmo RS256) são armazenadas encriptadas em repouso e nunca são expostas em texto simples após a gravação no sistema.
            </p>

            <h3 className="text-base font-extrabold text-slate-900">3. Comunicação com a AGT</h3>
            <p>
              O envio de dados de facturação aos webservices da AGT ocorre exclusivamente através de canais seguros HTTPS/TLS com autenticação autorizada, visando o cumprimento das obrigações fiscais legais decorrentes da legislação angolana.
            </p>

            <h3 className="text-base font-extrabold text-slate-900">4. Contacto de Proteção de Dados</h3>
            <p>
              Para esclarecimentos sobre o tratamento dos seus dados no Kivora ERP, contacte o nosso encarregado de proteção através do email <strong>{KIVORA_INFO.supportEmail}</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

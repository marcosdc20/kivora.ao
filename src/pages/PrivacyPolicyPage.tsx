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
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Política de Privacidade & Protecção de Dados</h1>
              <p className="text-xs text-slate-500 font-semibold">KIVORA ERP • Em conformidade com a Lei n.º 22/11 da República de Angola • Luanda, Angola</p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/60 text-xs text-blue-950 font-medium">
              A presente Política de Privacidade regula o tratamento de dados pelo <strong>KIVORA ERP</strong> em estrito cumprimento da <strong>Lei n.º 22/11, de 27 de Junho (Lei da Protecção de Dados Pessoais da República de Angola)</strong> e das normas da Agência de Protecção de Dados (APD), bem como do <strong>Decreto Presidencial n.º 71/25</strong> e Certificação AGT n.º <strong>FE/440/AGT/2026</strong>.
            </div>

            <h2 className="text-base font-extrabold text-slate-950">1. Princípio da Soberania dos Dados & Armazenamento Local (Offline-First)</h2>
            <p>
              O KIVORA ERP opera prioritariamente em regime desktop local. Os bancos de dados operacionais, cadastros de clientes e fechos de caixa residem diretamente na infraestrutura física do cliente (computador ou servidor local LAN). A <strong>Visual Software / Kivora Tecnologias, Lda.</strong> não possui acesso não autorizado nem efetua cópias remotas dos seus dados comerciais e fiscais.
            </p>

            <h2 className="text-base font-extrabold text-slate-950">2. Tratamento de Dados e Finalidades (Lei n.º 22/11)</h2>
            <p>
              Os dados recolhidos através do website (pedidos de demonstração, candidaturas a parceiros e chamados de suporte) destinam-se exclusivamente à prestação de serviços comerciais, emissão de faturas, credenciamento técnico e suporte ao utilizador. É expressamente vedada a cedência, partilha ou comercialização de dados pessoais a terceiros não autorizados.
            </p>

            <h2 className="text-base font-extrabold text-slate-950">3. Segurança Criptográfica & Chaves Privadas RSA</h2>
            <p>
              Em conformidade com as regras de certificação da AGT, os pares de chaves criptográficas (algoritmo RSA/SHA) utilizados na assinatura digital dos documentos fiscais são armazenados de forma blindada no seu computador. As senhas de utilizador são processadas com hashing irreversível.
            </p>

            <h2 className="text-base font-extrabold text-slate-950">4. Direitos dos Titulares dos Dados</h2>
            <p>
              Nos termos dos artigos da Lei n.º 22/11, é assegurado a qualquer titular o direito de acesso, confirmação, retificação, atualização e eliminação dos seus dados pessoais constantes nos nossos registos de contacto e suporte.
            </p>

            <h2 className="text-base font-extrabold text-slate-950">5. Contacto do Responsável pelo Tratamento</h2>
            <p>
              Para exercer qualquer dos seus direitos ou solicitar esclarecimentos adicionais, poderá contactar a nossa equipa de conformidade através do e-mail <strong>{KIVORA_INFO.supportEmail}</strong> ou na nossa sede em Luanda, Angola.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

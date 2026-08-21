import React, { useRef } from 'react';
import {
  ShieldCheck, Lock, Key, Server,
  CheckCircle2, FileText, Download,
  ArrowRight, Database
} from 'lucide-react';
import { PageId } from '../components/Header';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface SegurancaPageProps {
  onNavigatePage: (page: PageId) => void;
}

export const SegurancaPage: React.FC<SegurancaPageProps> = ({ onNavigatePage }) => {
  const pageRef = useRef<HTMLElement>(null);
  useScrollReveal(pageRef);

  return (
    <main ref={pageRef} className="min-h-screen bg-slate-50 pt-28 pb-20 page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header da Página */}
        <div className="text-center max-w-3xl mx-auto mb-16" data-reveal>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Lock className="w-3.5 h-3.5 text-[#1d4ed8]" />
            Cibersegurança & Conformidade Fiscal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Arquitetura de Segurança de <span className="text-[#1d4ed8]">Nível Empresarial</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Como o KIVORA ERP protege os dados financeiros, fiscais e operacionais da sua empresa contra intrusões, vazamentos e adulteração.
          </p>
        </div>

        {/* Pilares da Blindagem Kivora */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Pilar 1: Criptografia Assimétrica */}
          <div data-reveal data-delay="100" className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center mb-6">
              <Key className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Criptografia Assimétrica RSA-2048 & RS256
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Cada documento fiscal emitido é assinado digitalmente com algoritmos de chave pública/privada de alta complexidade matemática. Impossibilita a adulteração ou falsificação de faturas.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Hash encadeado em cascata inquebrável
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                QR Code fiscal homologado pela AGT
              </li>
            </ul>
          </div>

          {/* Pilar 2: Base Local Cifrada AES-256 */}
          <div data-reveal data-delay="200" className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <Database className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Base de Dados Cifrada SQLCipher AES-256
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Os ficheiros de dados armazenados no seu computador ou servidor Windows são blindados com cifra de grau bancário AES-256 bits. Mesmo em caso de roubo físico do computador, os dados permanecem ilegíveis.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Proteção contra extração indevida
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Backup automático local e redundante
              </li>
            </ul>
          </div>

          {/* Pilar 3: Hardware Fingerprint */}
          <div data-reveal data-delay="300" className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <Server className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Hardware Fingerprint & Anti-Tampering
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              A licença do software é vinculada criptograficamente aos componentes físicos do computador (Motherboard UUID + CPU + Disco). Impede a duplicação pirata ou o sequestro da licença.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Proteção anti-recuo de relógio (Anti-Clock Rollback)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Binários protegidos contra engenharia reversa
              </li>
            </ul>
          </div>

        </div>

        {/* Quadro Comparativo de Conformidade AGT & Leis de Angola */}
        <div data-reveal className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 mb-16 shadow-sm">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Conformidade Legal & Fiscal em Angola
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              O KIVORA cumpre com todas as normas jurídicas e decretos presidenciais reguladores de tecnologias e faturação eletrónica em Angola.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 text-[#1d4ed8]" />
                <h3 className="text-lg font-bold text-slate-900">Decreto Presidencial n.º 71/25</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                Homologação e certificação obrigatória de sistemas de faturação eletrónica em Angola. O Kivora implementa todas as regras de numeração sequencial sem saltos, série fiscal e exportação do SAF-T AO.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Homologado
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">Lei de Proteção de Dados (APD Angola)</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                Como os dados residem na base de dados local do seu negócio (e não em servidores terceiros estrangeiros), a sua empresa mantém 100% da soberania e custódia dos dados de clientes e receitas.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100/80 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Soberania Local Total
              </span>
            </div>
          </div>
        </div>

        {/* Camadas de Segurança em Nuvem & Portais Web */}
        <div data-reveal className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-16 shadow-xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Blindagem Web nos Portais de Parceiros e Clientes
            </h2>
            <p className="text-slate-400 text-sm">
              Segurança contínua também nos portais de validação, consulta de extratos e suporte.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
              <p className="text-blue-400 font-bold text-lg mb-1">Firebase App Check</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                reCAPTCHA Enterprise ativo. Rejeita requisições automatizadas ou ataques de bots.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
              <p className="text-blue-400 font-bold text-lg mb-1">Zero-Trust RBAC</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Regras de base de dados estritas. Nenhum utilizador acede a dados de outras empresas.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
              <p className="text-blue-400 font-bold text-lg mb-1">HSTS & Anti-Clickjack</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Cabeçalhos HTTP seguros (X-Frame-Options DENY, HTTPS forçado com Preload).
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
              <p className="text-blue-400 font-bold text-lg mb-1">Logs Imutáveis</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Trilha de auditoria fiscal e de licenças 100% à prova de alterações (*Append-Only*).
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div data-reveal className="text-center">
          <p className="text-slate-600 text-sm mb-4">
            Deseja testar a robustez e a velocidade do KIVORA na prática?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigatePage('download')}
              className="px-6 py-3.5 bg-[#1d4ed8] text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar Instalador Oficial KIVORA
            </button>
            <button
              onClick={() => onNavigatePage('validar-licenca')}
              className="px-6 py-3.5 bg-white border border-slate-300 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              Validar Licença Online
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

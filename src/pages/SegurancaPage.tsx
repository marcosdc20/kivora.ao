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
    <main ref={pageRef} className="min-h-screen bg-slate-50/50 pt-28 pb-20 page-enter font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header da Página */}
        <div className="text-center max-w-3xl mx-auto space-y-4" data-reveal>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-blue-700" />
            <span>Cibersegurança & Conformidade Fiscal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-slate-950 tracking-tight leading-tight">
            Arquitetura de Segurança de <span className="text-[#1746A2]">Nível Empresarial</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Como o KIVORA SOFT protege os dados financeiros, fiscais e operacionais da sua empresa contra intrusões, vazamentos e adulteração.
          </p>
        </div>

        {/* Pilares da Blindagem Kivora */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pilar 1: Criptografia Assimétrica */}
          <div data-reveal data-delay="100" className="surface-card p-8 flex flex-col justify-between group hover:border-blue-300 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Key className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold font-display text-slate-900 group-hover:text-blue-600 transition-colors">
                Criptografia Assimétrica RSA-2048 & RS256
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                Cada documento fiscal emitido é assinado digitalmente com algoritmos de chave pública/privada de alta complexidade matemática. Impossibilita a adulteração ou falsificação de faturas.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hash encadeado em cascata inquebrável</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>QR Code fiscal certificado pela AGT</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pilar 2: Base Local Cifrada AES-256 */}
          <div data-reveal data-delay="200" className="surface-card p-8 flex flex-col justify-between group hover:border-indigo-300 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Database className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold font-display text-slate-900 group-hover:text-indigo-600 transition-colors">
                Base de Dados Cifrada SQLCipher AES-256
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                Os ficheiros de dados armazenados no seu computador ou servidor Windows são blindados com cifra de grau bancário AES-256 bits. Mesmo em caso de roubo físico do computador, os dados permanecem ilegíveis.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Proteção contra extração indevida</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Backup automático local e redundante</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pilar 3: Hardware Fingerprint */}
          <div data-reveal data-delay="300" className="surface-card p-8 flex flex-col justify-between group hover:border-purple-300 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-xs group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Server className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold font-display text-slate-900 group-hover:text-purple-600 transition-colors">
                Hardware Fingerprint & Anti-Tampering
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                A licença do software é vinculada criptograficamente aos componentes físicos do computador (Motherboard UUID + CPU + Disco). Impede a duplicação pirata ou o sequestro da licença.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Proteção anti-recuo de relógio (Anti-Clock Rollback)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Binários protegidos contra engenharia reversa</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Quadro Comparativo de Conformidade AGT & Leis de Angola */}
        <div data-reveal className="surface-card p-8 sm:p-12 space-y-8 bg-white">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">
              Conformidade Legal & Fiscal em Angola
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-normal">
              O KIVORA cumpre com todas as normas jurídicas e decretos presidenciais reguladores de tecnologias e faturação eletrónica em Angola.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3 hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900">Decreto Presidencial n.º 71/25</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Certificação obrigatória de sistemas de faturação eletrónica em Angola. O Kivora implementa todas as regras de numeração sequencial sem saltos, série fiscal e exportação do SAF-T AO.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Certificado Oficial AGT: FE/387/AGT/2026</span>
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3 hover:border-purple-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900">Lei de Proteção de Dados (APD Angola)</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Como os dados residem na base de dados local do seu negócio (e não em servidores terceiros estrangeiros), a sua empresa mantém 100% da soberania e custódia dos dados de clientes e receitas.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Soberania Local Total</span>
              </span>
            </div>
          </div>
        </div>

        {/* Camadas de Segurança em Nuvem & Portais Web */}
        <div data-reveal className="bg-[#0B192C] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-slate-800 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Blindagem Web nos Portais de Parceiros e Clientes
            </h2>
            <p className="text-slate-300 text-sm font-normal">
              Segurança contínua também nos portais de validação, consulta de extratos e suporte.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all space-y-2">
              <p className="text-blue-300 font-bold font-display text-base">Firebase App Check</p>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                reCAPTCHA Enterprise ativo. Rejeita requisições automatizadas ou ataques de bots.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all space-y-2">
              <p className="text-blue-300 font-bold font-display text-base">Zero-Trust RBAC</p>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                Regras de base de dados estritas. Nenhum utilizador acede a dados de outras empresas.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all space-y-2">
              <p className="text-blue-300 font-bold font-display text-base">HSTS & Anti-Clickjack</p>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                Cabeçalhos HTTP seguros (X-Frame-Options DENY, HTTPS forçado com Preload).
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all space-y-2">
              <p className="text-blue-300 font-bold font-display text-base">Logs Imutáveis</p>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                Trilha de auditoria fiscal e de licenças 100% à prova de alterações (*Append-Only*).
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div data-reveal className="text-center space-y-4">
          <p className="text-slate-600 text-sm font-medium">
            Deseja testar a robustez e a velocidade do KIVORA na prática?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigatePage('download')}
              className="btn-cta px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Instalador Oficial KIVORA</span>
            </button>
            <button
              onClick={() => onNavigatePage('validar-licenca')}
              className="px-7 py-4 bg-white border border-slate-200 text-slate-800 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Validar Licença Online</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

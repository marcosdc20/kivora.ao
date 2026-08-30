import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ArrowRight, CheckCircle2, Users, Award, ShieldCheck, CreditCard, Download } from 'lucide-react';
import {
  subscribePartnerPolicy, DEFAULT_PARTNER_POLICY,
  PartnerLicensingPolicy
} from '../admin/services/partnerDebtService';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { PartnerProgramConditionsModal } from '../components/PartnerProgramConditionsModal';

import executivosImg from '../assets/kivora/executivos-kivora.jpg';

import { useScrollReveal } from '../hooks/useScrollReveal';

const fmt = (n: number) => n.toLocaleString('pt-AO');

interface ParceirosPageProps {
  onNavigatePage?: (page: any) => void;
}

export const ParceirosPage: React.FC<ParceirosPageProps> = ({ onNavigatePage }) => {
  useScrollReveal();
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [policy, setPolicy] = useState<PartnerLicensingPolicy>(DEFAULT_PARTNER_POLICY);
  const [showConditionsModal, setShowConditionsModal] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeSystemSettings(setSettings);
    const unsubPolicy = subscribePartnerPolicy(setPolicy);
    return () => {
      unsubSettings();
      unsubPolicy();
    };
  }, []);

  const handleGoCandidatura = () => {
    if (onNavigatePage) {
      onNavigatePage('candidatura-parceiro');
    }
  };

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = '/documentos/Regulamento_Programa_Parceiros_KIVORA.pdf';
    link.download = 'Regulamento_Programa_Parceiros_KIVORA.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      <PageHero
        image={executivosImg}
        tag="Programa de Parceiros & Canais"
        title={`Revenda o ${settings.fullName} e cresça connosco`}
        sub={`Torne-se distribuidor oficial da ${settings.company} e lucre com margens de atacado em cada licença na sua região.`}
      />

      {/* Benefícios & 2 Documentos Oficiais */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20 space-y-16">
        <div data-reveal className="sr-init text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Homologação & Certificação
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-3">Por que ser parceiro oficial?</h2>
          <p className="text-slate-500 text-sm mt-2">Benefícios exclusivos, emissão instantânea e reconhecimento institucional.</p>
        </div>

        {/* Grade de 4 Benefícios Chave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Preços de Atacado & Margem de 30% a 50%', desc: 'Preços especiais de revenda com margens atrativas e liberdade total para definir o preço dos seus serviços de instalação e formação ao cliente.', from: 'from-blue-50/70', border: 'hover:border-blue-400 card-glow-blue', iconColor: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white', wm: <CreditCard className="icon-watermark wm-blue w-32 h-32" strokeWidth={1.25} /> },
            { title: 'Portal do Parceiro & Licenciamento Autónomo', desc: 'Painel completo para ativação de licenças 24/7 com emissão imediata e controlo de clientes da sua carteira.', from: 'from-emerald-50/70', border: 'hover:border-emerald-400 card-glow-green', iconColor: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white', wm: <ShieldCheck className="icon-watermark wm-emerald w-32 h-32" strokeWidth={1.25} /> },
            { title: 'Suporte Técnico Prioritário Nível 2', desc: 'Linha direta com os engenheiros de desenvolvimento da Kivora para apoio em implementações fiscais complexas e redes locais LAN.', from: 'from-purple-50/70', border: 'hover:border-purple-400 card-glow-purple', iconColor: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white', wm: <Users className="icon-watermark wm-purple w-32 h-32" strokeWidth={1.25} /> },
            { title: 'Kit Oficial: Licença NFR & Formação', desc: 'Acesso a licença NFR para demonstrações comerciais em clientes, apresentações comerciais e material promocional oficial.', from: 'from-amber-50/70', border: 'hover:border-amber-400 card-glow-amber', iconColor: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white', wm: <Award className="icon-watermark wm-amber w-32 h-32" strokeWidth={1.25} /> },
          ].map((b, i) => (
            <div key={i} data-reveal className={`sr-init bg-gradient-to-br ${b.from} via-white to-white border border-slate-200/90 rounded-3xl p-7 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 ${b.border} transition-all duration-300 relative overflow-hidden`} style={{ transitionDelay: `${i * 80}ms` }}>
              {b.wm}
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${b.iconColor} flex items-center justify-center mb-4 transition-all duration-300 shadow-sm`}>
                  <CheckCircle2 className="w-6 h-6" strokeWidth={2.25} />
                </div>
                <h3 className="text-base font-extrabold text-slate-950 mb-1.5 group-hover:text-blue-600 transition-colors">{b.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Destaque dos 2 Documentos Oficiais */}
        <div data-reveal className="sr-init p-6 sm:p-8 bg-mesh rounded-3xl border border-slate-200/80 space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-44 h-44 orb orb-orange opacity-20" />
          <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6500] flex items-center justify-center font-bold shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-950">
                Documento Oficial Recebido na Homologação
              </h3>
              <p className="text-xs text-slate-600">Documentação jurídica séria com selo de autenticidade para apresentar aos seus clientes empresariais:</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Comprovativo de Parceiro Revendedor Credenciado KIVORA SOFT</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full self-start">
                Certificação Oficial
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Emitido pela <strong>Visual Software, Lda.</strong> (NIF 5002863944), outorgando plenos poderes para comercialização, promoção e revenda autorizada do software de faturação eletrónica certificado pela AGT ao abrigo do Decreto Presidencial n.º 71/25.
            </p>
          </div>

          {/* Taxa de Homologação e Botões Oficiais */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 text-xs relative z-10">
            <div className="flex items-center gap-2 text-slate-700">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Taxa única de adesão e credenciamento: <strong className="text-slate-950 font-mono-num font-black">{fmt(policy.partner_membership_fee_aoa ?? 25000)} Kz</strong></span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Baixar Regulamento (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vídeo do Programa de Parceiros */}
        {settings.videoParceirosUrl && (
          <div data-reveal className="sr-init space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
                Apresentação Comercial
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
                {settings.videoParceirosTitle || 'Como Funciona o Programa de Canais & Distribuição'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {settings.videoParceirosDesc || 'Entenda em detalhe o modelo de negócio, margens de revenda até 50% e suporte direto aos parceiros.'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <YouTubePlayer
                videoUrl={settings.videoParceirosUrl}
                title={settings.videoParceirosTitle}
                subtitle={settings.videoParceirosDesc}
                badge="Vídeo para Parceiros"
                accentColor="blue"
                aspectRatio="video"
              />
            </div>
          </div>
        )}
      </section>

      {/* Formulário / CTA */}
      <section className="bg-mesh-dark py-20 px-6 sm:px-10 lg:px-16 border-t border-slate-800 text-white relative overflow-hidden">
        <div className="orb orb-blue w-80 h-80 -top-20 -left-20 opacity-30" />
        <div className="orb orb-orange w-48 h-48 -bottom-10 right-10 opacity-25" />
        <div data-reveal className="sr-init max-w-3xl mx-auto text-center text-white space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8 text-blue-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">Candidate-se ao Programa de Parceiros</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto font-normal">
            Aceda à página exclusiva de candidatura com todos os requisitos oficiais e formulário de credenciamento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleGoCandidatura}
              className="inline-flex items-center gap-2 bg-[#FF6500] hover:bg-[#EB5B00] text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-orange-600/40 transition-all hover:-translate-y-1 cursor-pointer shimmer-button"
            >
              <span>Enviar Candidatura Oficial</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-4 rounded-2xl border border-white/20 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Condições em PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal Oficial de Condições em PDF */}
      {showConditionsModal && (
        <PartnerProgramConditionsModal onClose={() => setShowConditionsModal(false)} />
      )}

    </div>
  );
};

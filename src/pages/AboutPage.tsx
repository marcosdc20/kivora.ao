import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ShieldCheck, Award, Users, CheckCircle, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { CountUp } from '../components/CountUp';
import { AnimatedText } from '../components/AnimatedText';

import executivosImg from '../assets/kivora/executivos-kivora.jpg';

interface AboutPageProps {
  onOpenDemoModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenDemoModal }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);
  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Header Banner Showcase */}
      <PageHero
        image={executivosImg}
        tag="Sobre a Kivora Tecnologias"
        title="Tecnologia de Gestão e Faturação para Angola"
        sub="Desenvolvemos o KIVORA ERP para capacitar empresários e gestores angolanos com software robusto, alinhado com as normas da AGT e com suporte presencial em Luanda."
      />

      {/* Main Content Showcase */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sobre a Kivora Tecnologias
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
              <AnimatedText text="A Nossa Missão: Simplificar e Garantir a Conformidade Fiscal das Empresas" el="span" mode="letter-stagger" />
            </h2>
            
            <p className="text-slate-600 text-sm leading-relaxed">
              Fundada em Luanda, a <strong>Kivora Tecnologias</strong> nasceu com a missão de transformar a forma como as empresas em Angola gerem os seus processos comerciais, financeiros e contabilísticos.
            </p>

            <p className="text-slate-600 text-sm leading-relaxed">
              O <strong>Kivora ERP</strong> representa a evolução tecnológica necessária para responder aos desafios da Faturação Eletrónica (Decreto Presidencial n.º 71/25), garantindo interoperabilidade com as diretrizes da AGT, segurança criptográfica e operação local ininterrupta.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { icon: <ShieldCheck className="w-4 h-4" />, text: 'Software Validado e Certificado em Conformidade com a AGT', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                { icon: <CheckCircle className="w-4 h-4" />, text: 'Equipa Técnica de Desenvolvimento e Suporte Sediada em Luanda', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                { icon: <Award className="w-4 h-4" />, text: 'Arquitetura Resiliente: Base de Dados Local, Rede LAN e Operação Offline', color: 'bg-amber-50 text-amber-600 border-amber-100' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 hover:shadow-sm transition-all group">
                  <div className={`w-8 h-8 rounded-xl ${item.color} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{item.text}</span>
                </div>
              ))}
            </div>

          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-lg relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl group-hover:opacity-70 opacity-50 transition-opacity" />
              <img
                src={executivosImg}
                alt="Gestão Moderna Kivora ERP"
                className="relative w-full h-[360px] sm:h-[440px] rounded-3xl border border-slate-200 shadow-2xl object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

        </div>

        {/* Dynamic Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-white p-6 rounded-3xl border border-slate-200/90 shadow-sm text-center card-glow-blue hover:-translate-y-1 transition-all">
            <p className="text-2xl sm:text-3xl font-black text-blue-600 mb-1 font-mono-num">
              <CountUp end={2800} suffix="+" type="odometer" duration={2} />
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Empresas Ativas</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50/70 via-white to-white p-6 rounded-3xl border border-slate-200/90 shadow-sm text-center card-glow-green hover:-translate-y-1 transition-all">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mb-1 font-mono-num">
              <CountUp end={18} suffix=" Províncias" type="odometer" duration={1.5} />
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Presença Nacional</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50/70 via-white to-white p-6 rounded-3xl border border-slate-200/90 shadow-sm text-center card-glow-purple hover:-translate-y-1 transition-all">
            <p className="text-2xl sm:text-3xl font-black text-purple-600 mb-1 font-mono-num">
              <CountUp end={440} prefix="FE/" suffix="/AGT" type="scramble" duration={2.2} />
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Certificação Oficial</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50/70 via-white to-white p-6 rounded-3xl border border-slate-200/90 shadow-sm text-center card-glow-amber hover:-translate-y-1 transition-all">
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mb-1 font-mono-num">
              <CountUp end={100} suffix="% Offline" type="counter" duration={1.8} />
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Autonomia em LAN</p>
          </div>
        </div>

        {/* Pillars / Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: <ShieldCheck className="w-6 h-6" />, wm: <ShieldCheck className="w-32 h-32" />, title: 'Rigor Fiscal & Segurança', desc: 'Cada linha de código do Kivora é auditada para garantir o cumprimento estrito do Código do IVA, PGC-AO, IRT 2026 e proteção dos dados da sua empresa.', from: 'from-blue-50/60', border: 'hover:border-blue-400', iconColor: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white', wmColor: 'wm-blue', titleHover: 'group-hover:text-blue-600' },
            { icon: <Award className="w-6 h-6" />, wm: <Award className="w-32 h-32" />, title: 'Inovação Orientada ao Cliente', desc: 'Atualizações contínuas para incorporar novas regras legais da AGT e funcionalidades sugeridas pelas empresas angolanas.', from: 'from-amber-50/60', border: 'hover:border-amber-400', iconColor: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white', wmColor: 'wm-amber', titleHover: 'group-hover:text-amber-600' },
            { icon: <Users className="w-6 h-6" />, wm: <Users className="w-32 h-32" />, title: 'Suporte & Formação Local', desc: 'Oferecemos acompanhamento personalizado, formação presencial para a sua equipa e canal direto de WhatsApp em Luanda.', from: 'from-emerald-50/60', border: 'hover:border-emerald-400', iconColor: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white', wmColor: 'wm-emerald', titleHover: 'group-hover:text-emerald-600' },
          ].map((card, i) => (
            <div key={i} className={`bg-gradient-to-br ${card.from} via-white to-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 ${card.border} transition-all duration-300 cursor-default`}>
              {/* Large watermark */}
              <div className={`icon-watermark ${card.wmColor}`}>
                {React.cloneElement(card.wm, { strokeWidth: 1.25 })}
              </div>
              {/* Icon */}
              <div className={`relative z-10 w-12 h-12 rounded-2xl ${card.iconColor} flex items-center justify-center shadow-sm transition-all`}>
                {card.icon}
              </div>
              <h3 className={`relative z-10 text-lg font-black text-slate-950 transition-colors ${card.titleHover}`}>{card.title}</h3>
              <p className="relative z-10 text-sm text-slate-600 leading-relaxed">{card.desc}</p>
              {/* Bottom arrow */}
              <div className="relative z-10 flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'currentcolor' }}>
              </div>
            </div>
          ))}
        </div>

        {/* Contactos & Sede */}
        <div className="bg-gradient-to-r from-[#1746A2] via-[#1D4ED8] to-[#1E40AF] rounded-3xl p-8 sm:p-12 text-white grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xl border border-blue-600/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 text-white flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Sede em Luanda</h4>
              <p className="text-xs text-blue-100 mt-1 font-normal">{settings.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 text-white flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Linha Telefónica</h4>
              <p className="text-xs text-blue-100 mt-1 font-normal">{settings.phoneDisplay}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 text-white flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Email Corporativo</h4>
              <p className="text-xs text-blue-100 mt-1 font-normal">{settings.email}</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-mesh-dark rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
          {/* Orbs */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Quer conhecer o KIVORA de perto?
            </h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Agende uma sessão de demonstração presencial no seu escritório em Luanda ou via reunião online.
            </p>
          </div>
          <button
            onClick={onOpenDemoModal}
            className="bg-[#FF6500] hover:bg-[#EB5B00] text-white font-bold text-xs sm:text-sm px-8 py-4 rounded-2xl shadow-xl shadow-orange-600/40 transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:-translate-y-1 shimmer-button relative z-10"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Agendar Apresentação</span>
          </button>
        </div>

      </section>

    </div>
  );
};

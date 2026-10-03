import React, { useState, useEffect } from 'react';
import {
  CheckCircle, MapPin, Phone, Mail, ArrowRight,
  ChevronRight, Star, Quote
} from 'lucide-react';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { CountUp } from '../components/CountUp';

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

  const advisors = [
    {
      name: 'Dr. Nelson Capoco',
      role: 'Consultor Sénior de Faturação AGT',
      image: '/imagens/1085.webp',
      badge: 'Certificado AGT',
    },
    {
      name: 'Eng. Carlos Mendonça',
      role: 'Especialista de Redes LAN & Offline',
      image: '/imagens/2149153824.webp',
      badge: 'Infraestrutura',
    },
    {
      name: 'Dra. Beatriz Ferreira',
      role: 'Especialista em Gestão de Stocks & POS',
      image: '/imagens/1163.webp',
      badge: 'Operações',
    },
    {
      name: 'Dra. Ana Sebastião',
      role: 'Consultora Contabilística & SAF-T AO',
      image: '/imagens/2150690165.webp',
      badge: 'Contabilidade PGC',
    },
  ];

  const testimonials = [
    {
      text: 'O KIVORA revolucionou os nossos supermercados em Luanda e Benguela. Conseguimos emitir milhares de talões por dia mesmo sem sinal de internet e a exportação do SAF-T AO para a AGT nunca teve uma única inconformidade.',
      author: 'Alexandre Sarkovic',
      role: 'Diretor de Operações de Retalho',
      location: 'Luanda, Angola',
      image: '/imagens/1085.webp',
      rating: 5,
    },
    {
      text: 'A formação presencial e o acompanhamento dos técnicos foram excecionais. Toda a equipa de caixas adaptou-se em menos de 2 horas. Recomendo vivamente a qualquer empresa que procure estabilidade e conformidade legal.',
      author: 'Marcos Silva',
      role: 'Sócio-Gerente e Auditor',
      location: 'Benguela, Angola',
      image: '/imagens/2149153824.webp',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 page-enter">
      
      {/* Breadcrumb Bar — Top navigation indicator */}
      <div className="bg-slate-100/80 border-b border-slate-200/60 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium">
          <a href="#home" className="hover:text-blue-600 transition-colors">Início</a>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#FF6500] font-bold">Sobre a Kivora</span>
        </div>
      </div>

      {/* Hero / About Kivora Section — Inspired by Image 2 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Description & Feature Pills */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Orange zigzag accent */}
            <div className="flex items-center gap-2">
              <svg className="w-6 h-3 text-[#FF6500]" viewBox="0 0 40 16" fill="currentColor">
                <path d="M0 8 L10 0 L20 8 L30 0 L40 8 L30 16 L20 8 L10 16 Z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF6500]">
                Sobre a Kivora Tecnologias
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Tecnologia de Gestão & Faturação Certificada para Angola
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Fundada em Luanda, a <strong>Kivora Tecnologias</strong> é uma software house dedicada a fornecer soluções corporativas robustas, desenhadas especificamente para o contexto angolano. O nosso software KIVORA ERP combina certificação rigorosa da AGT, arquitetura local independente da internet e suporte técnico presencial.
            </p>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Com mais de uma década de experiência no mercado de tecnologias de informação e contabilidade, capacitamos pequenas, médias e grandes empresas em todas as 18 províncias com conformidade integral ao Decreto Presidencial n.º 71/25.
            </p>

            {/* 4 Feature Checklist Items with Orange Checkmarks */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { title: 'Certificação AGT', desc: 'Validado FE/387/AGT' },
                { title: 'Soluções Offline', desc: 'Base de dados local' },
                { title: 'Consultoria Local', desc: 'Equipa em Luanda' },
                { title: 'Suporte 24/7', desc: 'Assistência dedicada' },
              ].map((pill, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-orange-300 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6500] to-[#FFA726] flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 leading-tight">{pill.title}</h2>
                    <p className="text-[10px] text-slate-500">{pill.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenDemoModal}
                className="px-7 py-3.5 rounded-full bg-[#FF6500] hover:bg-[#EB5B00] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Agendar Demonstração</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={settings.whatsappUrl || 'https://wa.me/244974855494'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                Falar com Consultor
              </a>
            </div>

          </div>

          {/* Right Column: Hero Image with Floating Experience Badge */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={executivosImg}
                  alt="Equipa Executiva Kivora Tecnologias Angola"
                  className="w-full h-[380px] sm:h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                {/* Floating Experience Badge matching Image 2 */}
                <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xl flex items-center gap-4">
                  <div className="text-4xl sm:text-5xl font-black text-[#FF6500] font-mono leading-none">
                    12<span className="text-2xl text-slate-900">+</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <p className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">
                      Anos de Experiência
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Desenvolvendo software e prestando consultoria em Angola
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Dark Metrics Section: "What We Done?" / "O Que Conquistámos?" — Exact match Image 2 */}
      <section className="bg-[#0B1528] py-16 sm:py-24 relative overflow-hidden text-white border-y border-slate-800">
        
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E40AF_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-12">
          
          <div className="space-y-3 max-w-xl mx-auto">
            {/* Orange zigzag accent */}
            <div className="flex items-center justify-center gap-2">
              <svg className="w-6 h-3 text-[#FF6500]" viewBox="0 0 40 16" fill="currentColor">
                <path d="M0 8 L10 0 L20 8 L30 0 L40 8 L30 16 L20 8 L10 16 Z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              O Que Conquistámos?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Mais de uma década ao lado dos empresários, garantindo rigor fiscal e autonomia operacional.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40 transition-all text-center">
              <div className="text-4xl sm:text-5xl font-black text-[#FF6500] font-mono mb-2">
                <CountUp end={12} suffix="+" duration={2} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">Anos de Experiência</p>
              <p className="text-[11px] text-slate-400 mt-1">Presença sólida no mercado</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40 transition-all text-center">
              <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono mb-2">
                <CountUp end={43} suffix="+" duration={2} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">Releases & Validações</p>
              <p className="text-[11px] text-slate-400 mt-1">100% em dia com a AGT</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40 transition-all text-center">
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono mb-2">
                <CountUp end={2800} suffix="+" duration={2} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">Empresas Ativas</p>
              <p className="text-[11px] text-slate-400 mt-1">Clientes satisfeitos</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40 transition-all text-center">
              <div className="text-4xl sm:text-5xl font-black text-blue-400 font-mono mb-2">
                <CountUp end={18} duration={1.5} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">Províncias em Angola</p>
              <p className="text-[11px] text-slate-400 mt-1">Assistência nacional</p>
            </div>
          </div>

        </div>
      </section>

      {/* Advisors / Equipa Profissional — Exact match Image 2 */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Orange Badge Header Banner */}
        <div className="max-w-md mx-auto text-center bg-gradient-to-r from-[#FF6500] to-[#FFA726] text-white py-4 px-8 rounded-2xl shadow-lg shadow-orange-500/20">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
            Consultores & Especialistas
          </h2>
          <p className="text-xs text-orange-100 font-medium mt-0.5">
            A Nossa Equipa Profissional em Luanda
          </p>
        </div>

        {/* 4 Cards with Circular Orange Portrait Rings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {advisors.map((advisor, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all text-center group"
            >
              {/* Circular Portrait with Orange Ring */}
              <div className="relative w-28 h-28 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6500] to-[#FFA726] p-1 shadow-md group-hover:scale-105 transition-transform">
                  <img
                    src={advisor.image}
                    alt={advisor.name}
                    className="w-full h-full object-cover rounded-full bg-slate-100"
                  />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#FF6500] transition-colors">
                {advisor.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {advisor.role}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="inline-block px-3 py-1 bg-orange-50 text-[#FF6500] border border-orange-200/60 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {advisor.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Orange Banner: Clientes Satisfeitos & Parceiros — Exact match Image 2 */}
      <section className="bg-gradient-to-r from-[#FF6500] via-[#FF7A1A] to-[#FF8C38] py-14 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto space-y-8 text-center">
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-6 h-3 text-white" viewBox="0 0 40 16" fill="currentColor">
                <path d="M0 8 L10 0 L20 8 L30 0 L40 8 L30 16 L20 8 L10 16 Z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Clientes Satisfeitos</h2>
            <p className="text-xs sm:text-sm text-orange-100">
              Mais de 2.800 empresas confiam diariamente no KIVORA ERP em Angola
            </p>
          </div>

          {/* White Rectangular Brand Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Rede de Farmácias Luanda', cat: 'Saúde & Farmácia' },
              { name: 'Grupo Comercial Kwanza', cat: 'Supermercados' },
              { name: 'Logística & Distribuição AO', cat: 'Armazenagem' },
              { name: 'Clínica & Cuidados Integrados', cat: 'Serviços Médicos' },
            ].map((client, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center min-h-[90px]"
              >
                <span className="text-xs sm:text-sm font-black text-slate-800 font-display">
                  {client.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  {client.cat}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials Section with Speech Bubbles — Exact match Image 2 */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-6 h-3 text-[#FF6500]" viewBox="0 0 40 16" fill="currentColor">
              <path d="M0 8 L10 0 L20 8 L30 0 L40 8 L30 16 L20 8 L10 16 Z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Testemunhos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Veja o que os gestores e parceiros dizem sobre a estabilidade do KIVORA
          </p>
        </div>

        {/* Speech Bubbles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t, idx) => (
            <div key={idx} className="flex flex-col items-center">
              
              {/* Speech Bubble with Orange Background & Downward Pointer */}
              <div className="relative bg-gradient-to-br from-[#FF6500] to-[#FFA726] text-white p-7 rounded-3xl shadow-xl space-y-3">
                <Quote className="w-6 h-6 text-white/40" />
                <p className="text-xs sm:text-sm leading-relaxed text-white/95 font-medium">
                  "{t.text}"
                </p>
                
                {/* 5 Stars */}
                <div className="flex items-center gap-1 pt-1">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-white text-white" />
                  ))}
                </div>

                {/* Downward triangle indicator */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-[#FFA726]" />
              </div>

              {/* Author Info Below Bubble with Circular Avatar */}
              <div className="mt-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#FF6500] to-[#FFA726] shadow-sm mb-2">
                  <img
                    src={t.image}
                    alt={t.author}
                    className="w-full h-full object-cover rounded-full bg-slate-100"
                  />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{t.author}</h4>
                <p className="text-[11px] text-slate-500">{t.role} • {t.location}</p>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* Office & Contacts Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-[#0B1528] rounded-3xl p-8 sm:p-10 text-white grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xl border border-slate-800">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Sede em Luanda</h4>
              <p className="text-xs text-slate-300 mt-1">{settings.address || 'Luanda, Angola'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Linha de Suporte</h4>
              <p className="text-xs text-slate-300 mt-1 font-mono">{settings.phoneDisplay || '+244 974 855 494'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Email Corporativo</h4>
              <p className="text-xs text-slate-300 mt-1">{settings.email || 'comercial@kivora.ao'}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Final Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-[#FF6500] via-[#FF7A1A] to-[#FF8C38] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-orange-500/20">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-950 bg-white/30 px-3 py-1 rounded-full inline-block">
              Demonstração Gratuita
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Quer ver o KIVORA ERP a funcionar na sua empresa?
            </h3>
            <p className="text-orange-100 text-xs sm:text-sm max-w-xl">
              Agende uma apresentação no seu escritório em Luanda ou teste gratuitamente por 15 dias sem compromisso.
            </p>
          </div>
          <button
            onClick={onOpenDemoModal}
            className="px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-950 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Solicitar Demonstração</span>
          </button>
        </div>
      </section>

    </div>
  );
};

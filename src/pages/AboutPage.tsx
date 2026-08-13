import React from 'react';
import { ScrollReveal, ScrollRevealItem } from '../components/ScrollReveal';
import { CountUp } from '../components/CountUp';
import { ArrowRight, CheckCircle, GraduationCap, Target, Eye, Heart, Users, BookOpen } from 'lucide-react';

const VALUES = [
  { icon: <Target className="w-6 h-6" />, title: 'Inovação', desc: 'Desenvolvemos soluções modernas adaptadas à realidade angolana.' },
  { icon: <Eye className="w-6 h-6" />, title: 'Transparência', desc: 'Dados claros e acessíveis para diretores, professores e famílias.' },
  { icon: <Heart className="w-6 h-6" />, title: 'Comprometimento', desc: 'Suporte local dedicado para garantir o sucesso de cada escola parceira.' },
  { icon: <CheckCircle className="w-6 h-6" />, title: 'Qualidade', desc: 'Excelência no desenvolvimento de software e na experiência do utilizador.' },
];

interface AboutPageProps {
  onOpenContact?: () => void;
  onNavigateTeam?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenContact, onNavigateTeam }) => {
  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HERO SOBRE */}
      <section className="bg-brand-navy py-20 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <span className="inline-flex items-center gap-2 bg-brand-blue/20 text-blue-400 text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-6 border border-blue-400/30">
              <GraduationCap className="w-3.5 h-3.5 text-brand-amber" />
              Sobre a Kivora
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              A plataforma desenvolvida <br />
              <span className="text-blue-400">para impulsionar a tecnologia</span> e gestão em Angola
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
              A Kivora é um ecossistema de soluções tecnológicas desenvolvido com foco total na eficiência, segurança e automação das organizações angolanas.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* MISSÃO E VISÃO */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal variant="fade-right">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop"
                  alt="Sobre a Kivora"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 to-transparent" />
                <div className="absolute bottom-6 left-6 bg-white/95 rounded-xl px-5 py-4 shadow-xl">
                  <p className="text-xs font-extrabold text-brand-navy uppercase tracking-wide">Líder em Inovação</p>
                  <p className="text-2xl font-extrabold text-brand-blue">Kivora Tech</p>
                  <p className="text-xs text-slate-500">Luanda, Angola</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-left">
              <div>
                <h2 className="text-3xl font-extrabold text-brand-navy mb-6 leading-tight">
                  Desenvolvemos tecnologias para tornar a gestão <span className="text-brand-blue">inteligente e integrada</span>
                </h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  A equipa da Kivora nasceu com o propósito de solucionar desafios críticos de gestão: transformar processos manuais em ecossistemas digitais de alta performance e disponibilidade.
                </p>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Desenvolvemos soluções intuitivas, escaláveis e perfeitamente adaptadas ao contexto nacional — com suporte técnico local, integração com pagamentos e emissão documental.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Missão', text: 'Digitalizar e potencializar os processos das organizações em Angola com tecnologia de ponta.' },
                    { label: 'Visão', text: 'Ser a marca de referência em software de gestão e inovação tecnológica em Angola.' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <h4 className="font-extrabold text-brand-navy text-sm mb-2 uppercase tracking-wide">{item.label}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={onNavigateTeam}
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white font-extrabold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <Users className="w-4 h-4 text-brand-amber" />
                    <span>Conheça a Equipa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onOpenContact}
                    className="border border-slate-300 text-brand-navy hover:border-brand-blue hover:text-brand-blue font-bold px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    Entrar em Contacto
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-blue-100 text-brand-blue text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4">
                <Heart className="w-3.5 h-3.5 text-brand-amber" />
                Os Nossos Valores
              </span>
              <h2 className="text-3xl font-extrabold text-brand-navy">O que nos guia a cada dia</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal variant="stagger">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val, i) => (
                <ScrollRevealItem key={i}>
                  <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-200 transition-all duration-300 group hover:border-brand-blue/40">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      {val.icon}
                    </div>
                    <h3 className="font-extrabold text-brand-navy mb-2">{val.title}</h3>
                    <p className="text-sm text-slate-600">{val.desc}</p>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="bg-brand-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-white">A Kivora em Números</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal variant="stagger">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { value: 50, suffix: '+', label: 'Organizações Parceiras', icon: <BookOpen className="w-6 h-6" /> },
                { value: 12000, suffix: '+', label: 'Utilizadores Ativos', icon: <Users className="w-6 h-6" /> },
                { value: 100, suffix: '%', label: 'Conformidade & Segurança', icon: <GraduationCap className="w-6 h-6" /> },
                { value: 99, suffix: '%', label: 'Taxa de Satisfação', icon: <Heart className="w-6 h-6" /> },
              ].map((stat, i) => (
                <ScrollRevealItem key={i}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-brand-amber flex items-center justify-center mb-2">
                      {stat.icon}
                    </div>
                    <CountUp end={stat.value} suffix={stat.suffix} className="text-4xl font-extrabold text-white" />
                    <span className="text-sm text-slate-400">{stat.label}</span>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
};

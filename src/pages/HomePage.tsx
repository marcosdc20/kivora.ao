import React from 'react';
import { Hero } from '../components/Hero';
import { ScrollReveal, ScrollRevealItem } from '../components/ScrollReveal';
import { CountUp } from '../components/CountUp';
import { MODULES_DATA, DIFFERENTIALS_DATA } from '../data/school';
import {
  ArrowRight, CheckCircle, Star, Users, BookOpen, GraduationCap,
  Shield, Zap, Smartphone, BarChart3, MessageCircle, DollarSign,
  ClipboardList, PieChart
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users className="w-7 h-7" />,
  BookOpen: <BookOpen className="w-7 h-7" />,
  GraduationCap: <GraduationCap className="w-7 h-7" />,
  ClipboardList: <ClipboardList className="w-7 h-7" />,
  BarChart3: <BarChart3 className="w-7 h-7" />,
  DollarSign: <DollarSign className="w-7 h-7" />,
  MessageCircle: <MessageCircle className="w-7 h-7" />,
  PieChart: <PieChart className="w-7 h-7" />,
  Shield: <Shield className="w-7 h-7" />,
  Zap: <Zap className="w-7 h-7" />,
  Smartphone: <Smartphone className="w-7 h-7" />,
};

const TESTIMONIALS = [
  {
    name: 'Directora Ana Luisa',
    role: 'Directora – Escola Secundária do Kilamba',
    text: 'A Kivora transformou completamente a gestão da nossa escola. Antes passávamos horas a processar documentos. Agora fazemos tudo em minutos.',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=100&auto=format&fit=crop',
  },
  {
    name: 'Prof. Carlos Mendes',
    role: 'Coordenador Pedagógico – Colégio Internacional de Luanda',
    text: 'A gestão de processos e o controlo de presenças ficaram muito mais simples. A equipa da Kivora presta um suporte excelente.',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
  },
  {
    name: 'Encarregada Maria José',
    role: 'Encarregada de Educação – 3 filhos matriculados',
    text: 'Finalmente consigo acompanhar os boletins e presenças dos meus filhos sem precisar deslocar-me. A plataforma Kivora é incrível!',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
  },
];

interface HomePageProps {
  onNavigateSection?: (secId: string) => void;
  onOpenMatricula?: () => void;
  onSelectModule?: (moduleId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateSection,
  onOpenMatricula,
  onSelectModule,
}) => {
  const handleNav = (id: string) => {
    if (onNavigateSection) onNavigateSection(id);
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <Hero
        onNavigateSection={onNavigateSection}
        onOpenMatricula={onOpenMatricula}
      />

      {/* ===== STATS SECTION ===== */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="stagger">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: 5000, suffix: '+', label: 'Alunos Geridos', color: 'text-brand-green' },
                { value: 120, suffix: '+', label: 'Turmas Ativas', color: 'text-brand-gold' },
                { value: 30, suffix: '+', label: 'Escolas Parceiras', color: 'text-blue-600' },
                { value: 98, suffix: '%', label: 'Satisfação', color: 'text-purple-600' },
              ].map((stat, i) => (
                <ScrollRevealItem key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <CountUp
                      end={stat.value}
                      suffix={stat.suffix}
                      className={`text-4xl font-extrabold ${stat.color}`}
                    />
                    <span className="text-sm text-brand-body font-medium">{stat.label}</span>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== MÓDULOS DESTAQUE ===== */}
      <section id="modulos-home" className="bg-brand-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-brand-green-light text-brand-green text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                Módulos do Sistema
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark leading-tight">
                Tudo que a sua escola precisa,<br />
                <span className="text-brand-green">num só sistema</span>
              </h2>
              <p className="mt-4 text-brand-body max-w-2xl mx-auto">
                8 módulos integrados para cobrir todas as necessidades da sua gestão escolar — desde a matrícula ao relatório final.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="stagger">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MODULES_DATA.slice(0, 8).map((mod) => (
                <ScrollRevealItem key={mod.id}>
                  <div
                    className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer border border-brand-border hover:border-brand-green/30 transform hover:-translate-y-1"
                    onClick={() => onSelectModule && onSelectModule(mod.id)}
                  >
                    {mod.badge && (
                      <span className="inline-block text-[10px] font-extrabold uppercase bg-brand-green text-white px-2 py-0.5 rounded-full mb-3">
                        {mod.badge}
                      </span>
                    )}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${mod.color}`}>
                      {ICON_MAP[mod.icon]}
                    </div>
                    <h3 className="text-base font-extrabold text-brand-dark mb-2 group-hover:text-brand-green transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-brand-body leading-relaxed">{mod.shortDesc}</p>
                    <div className="mt-4 flex items-center gap-1 text-brand-green text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Ver detalhes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.3}>
            <div className="mt-10 text-center">
              <button
                onClick={() => handleNav('modulos')}
                className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Ver Todos os Módulos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== DIFERENCIAIS ===== */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal variant="fade-right">
              <div>
                <span className="inline-flex items-center gap-2 bg-blue-100 text-brand-blue text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4">
                  <Shield className="w-3.5 h-3.5 text-brand-amber" />
                  Por que escolher a Kivora?
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy leading-tight mb-6">
                  Simples, seguro e feito <br />
                  <span className="text-brand-blue">para Angola</span>
                </h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  A Kivora foi desenvolvida especificamente para a realidade das organizações angolanas, com suporte local dedicado, alta segurança e recursos que realmente fazem a diferença.
                </p>
                <div className="space-y-4">
                  {DIFFERENTIALS_DATA.map((diff, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-brand-blue flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        {ICON_MAP[diff.icon] || <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-brand-navy text-sm mb-1">{diff.title}</h4>
                        <p className="text-xs text-slate-600">{diff.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-left">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop"
                  alt="Sistema Kivora em uso"
                  className="w-full h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur rounded-xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-brand-navy">Kivora Tech – Angola</p>
                        <p className="text-[10px] text-slate-500">50+ instituições confiam em nós</p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-brand-amber text-brand-amber" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== TESTEMUNHOS ===== */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-amber-100 text-brand-amber text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4">
                <Star className="w-3.5 h-3.5 fill-brand-amber" />
                O que dizem sobre nós
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
                Organizações que confiam na Kivora
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="stagger">
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <ScrollRevealItem key={i}>
                  <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-200">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-brand-amber text-brand-amber" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-extrabold text-brand-navy">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="bg-brand-navy py-20 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal variant="zoom-in">
            <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-6 border border-blue-400/30">
              <Zap className="w-3.5 h-3.5 text-brand-amber" />
              Comece Hoje Mesmo
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
              Transforme a gestão <br />
              <span className="text-brand-amber">da sua organização agora</span>
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
              Junte-se às mais de 50 organizações angolanas que já digitalizam e otimizam a sua gestão com a Kivora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onOpenMatricula || (() => handleNav('suporte'))}
                className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Experimentar Grátis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleNav('suporte')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold px-10 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <MessageCircle className="w-5 h-5 text-brand-gold" />
                <span>Falar com Consultor</span>
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

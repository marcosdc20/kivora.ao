import React from 'react';
import { ScrollReveal, ScrollRevealItem } from '../components/ScrollReveal';
import { TEAM_DATA } from '../data/school';
import { ArrowLeft, Mail, BookOpen, Award } from 'lucide-react';

interface TeamPageProps {
  onBack?: () => void;
  onOpenContact?: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onBack, onOpenContact }) => {
  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HERO EQUIPA */}
      <section className="bg-brand-navy py-16 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4 border border-blue-400/30">
              <Award className="w-3.5 h-3.5 text-brand-amber" />
              Nossa Equipa
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              As pessoas por trás da <span className="text-blue-400">Kivora</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl">
              Uma equipa dedicada de especialistas em tecnologia e gestão, comprometida com a inovação contínua das organizações em Angola.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CARDS DA EQUIPA */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="stagger">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {TEAM_DATA.map((member) => (
                <ScrollRevealItem key={member.id}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group border border-brand-border hover:border-brand-green/30">
                    <div className="relative overflow-hidden h-56">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-extrabold text-brand-dark text-base mb-1">{member.name}</h3>
                      <p className="text-brand-green text-xs font-bold mb-2">{member.role}</p>
                      <p className="text-xs text-brand-body mb-3 leading-relaxed">{member.bio}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {member.subjects.map((subj, i) => (
                          <span key={i} className="text-[10px] font-bold bg-brand-green-light text-brand-green px-2 py-0.5 rounded-full">
                            {subj}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-brand-body border-t border-gray-100 pt-3">
                        <BookOpen className="w-3.5 h-3.5 text-brand-green shrink-0" />
                        <span>{member.experience} de experiência</span>
                      </div>

                      <a
                        href={`mailto:${member.email}`}
                        className="mt-2 flex items-center gap-2 text-xs text-brand-body hover:text-brand-green transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-brand-green shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    </div>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal variant="fade-up" delay={0.3}>
            <div className="mt-14 text-center">
              <p className="text-brand-body mb-4">Quer fazer parte da nossa equipa pedagógica?</p>
              <button
                onClick={onOpenContact}
                className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar Candidatura</span>
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
};

import React from 'react';
import { ScrollReveal, ScrollRevealItem } from '../components/ScrollReveal';
import { CLASSROOMS_DATA } from '../data/school';
import { Users, Clock, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

const SHIFT_COLORS = {
  'Manhã': 'bg-amber-100 text-amber-700',
  'Tarde': 'bg-blue-100 text-blue-700',
  'Noite': 'bg-purple-100 text-purple-700',
};

interface TurmasPageProps {
  onOpenContact?: () => void;
}

export const TurmasPage: React.FC<TurmasPageProps> = ({ onOpenContact }) => {
  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HEADER */}
      <section className="bg-brand-dark py-16 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <span className="inline-flex items-center gap-2 bg-brand-green/20 text-brand-green text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4 border border-brand-green/30">
              <BookOpen className="w-3.5 h-3.5" />
              Gestão de Turmas
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Organize as turmas da <span className="text-brand-green">sua escola</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Crie, gerencie e monitore todas as turmas — com professores, horários, alunos e sala de aula num só lugar.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* STATS RÁPIDAS */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <BookOpen className="w-5 h-5" />, value: CLASSROOMS_DATA.length, label: 'Turmas Activas', color: 'text-brand-green' },
              { icon: <Users className="w-5 h-5" />, value: CLASSROOMS_DATA.reduce((sum, c) => sum + c.studentCount, 0), label: 'Alunos no Total', color: 'text-blue-600' },
              { icon: <GraduationCap className="w-5 h-5" />, value: CLASSROOMS_DATA.length, label: 'Professores', color: 'text-purple-600' },
              { icon: <Clock className="w-5 h-5" />, value: 3, label: 'Turnos', color: 'text-brand-gold' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 py-4">
                <div className={`${stat.color} mb-1`}>{stat.icon}</div>
                <span className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</span>
                <span className="text-xs text-brand-body">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARDS DAS TURMAS */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="stagger">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {CLASSROOMS_DATA.map(cls => {
                const occupancyPct = Math.round((cls.studentCount / cls.maxCapacity) * 100);
                return (
                  <ScrollRevealItem key={cls.id}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group border border-brand-border hover:border-brand-green/30">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={cls.image}
                          alt={cls.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
                        <span className={`absolute top-4 right-4 text-xs font-extrabold px-2.5 py-1 rounded-full ${SHIFT_COLORS[cls.shift]}`}>
                          {cls.shift}
                        </span>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-extrabold text-lg drop-shadow">{cls.name}</h3>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6">
                        {/* Teacher */}
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                          <img src={cls.teacherPhoto} alt={cls.teacher} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="text-xs text-brand-body">Professor(a) Responsável</p>
                            <p className="text-sm font-extrabold text-brand-dark">{cls.teacher}</p>
                          </div>
                        </div>

                        {/* Occupancy */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-brand-body mb-1.5">
                            <span>{cls.studentCount} alunos</span>
                            <span>Cap. {cls.maxCapacity} • {occupancyPct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${occupancyPct >= 95 ? 'bg-red-400' : occupancyPct >= 80 ? 'bg-brand-gold' : 'bg-brand-green'}`}
                              style={{ width: `${occupancyPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Info chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-[10px] font-bold bg-brand-bg text-brand-body px-2.5 py-1 rounded-full">
                            {cls.room}
                          </span>
                          {cls.subjects.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[10px] font-bold bg-brand-green-light text-brand-green px-2.5 py-1 rounded-full">
                              {s}
                            </span>
                          ))}
                          {cls.subjects.length > 3 && (
                            <span className="text-[10px] font-bold bg-brand-bg text-brand-body px-2.5 py-1 rounded-full">
                              +{cls.subjects.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Schedule preview */}
                        <div className="text-xs text-brand-body border-t border-gray-100 pt-3">
                          <p className="font-bold text-brand-dark mb-1">Horário:</p>
                          <p>{cls.schedule[0]}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollRevealItem>
                );
              })}
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal variant="fade-up" delay={0.3}>
            <div className="mt-12 text-center">
              <p className="text-brand-body mb-4">Precisa de criar novas turmas para a sua escola?</p>
              <button
                onClick={onOpenContact}
                className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Solicitar Demonstração</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
};

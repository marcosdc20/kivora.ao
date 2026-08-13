import React from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { MODULES_DATA } from '../data/school';
import { SchoolModule } from '../types/school';
import {
  Users, BookOpen, GraduationCap, ClipboardList,
  BarChart3, DollarSign, MessageCircle, PieChart, ArrowRight
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  GraduationCap: <GraduationCap className="w-8 h-8" />,
  ClipboardList: <ClipboardList className="w-8 h-8" />,
  BarChart3: <BarChart3 className="w-8 h-8" />,
  DollarSign: <DollarSign className="w-8 h-8" />,
  MessageCircle: <MessageCircle className="w-8 h-8" />,
  PieChart: <PieChart className="w-8 h-8" />,
};

interface ModulosPageProps {
  onSelectModule?: (module: SchoolModule) => void;
  onOpenContact?: () => void;
}

export const ModulosPage: React.FC<ModulosPageProps> = ({ onSelectModule, onOpenContact }) => {
  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HEADER */}
      <section className="bg-brand-dark py-16 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <span className="inline-flex items-center gap-2 bg-brand-green/20 text-brand-green text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4 border border-brand-green/30">
              <BookOpen className="w-3.5 h-3.5" />
              Módulos do Sistema
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              8 módulos integrados para<br />
              <span className="text-brand-green">gestão escolar completa</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Cada módulo foi desenhado para resolver um problema específico da gestão escolar — e todos funcionam perfeitamente em conjunto.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* LISTA DE MÓDULOS */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {MODULES_DATA.map((mod, i) => (
              <ScrollReveal key={mod.id} variant={i % 2 === 0 ? 'fade-right' : 'fade-left'}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border border-brand-border hover:border-brand-green/30 transition-all duration-300 group">
                  <div className={`grid lg:grid-cols-5 gap-0 ${i % 2 !== 0 ? 'lg:grid-flow-dense' : ''}`}>

                    {/* Image */}
                    <div className={`lg:col-span-2 relative overflow-hidden h-60 lg:h-auto ${i % 2 !== 0 ? 'lg:col-start-4' : ''}`}>
                      <img
                        src={mod.image}
                        alt={mod.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className={`lg:col-span-3 p-8 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${mod.color}`}>
                          {ICON_MAP[mod.icon]}
                        </div>
                        <div>
                          {mod.badge && (
                            <span className="inline-block text-[10px] font-extrabold uppercase bg-brand-green text-white px-2 py-0.5 rounded-full mb-1">
                              {mod.badge}
                            </span>
                          )}
                          <h2 className="text-xl font-extrabold text-brand-dark group-hover:text-brand-green transition-colors">
                            {mod.title}
                          </h2>
                        </div>
                      </div>

                      <p className="text-brand-body mb-6 leading-relaxed">{mod.description}</p>

                      <div className="grid sm:grid-cols-2 gap-2 mb-6">
                        {mod.features.slice(0, 4).map((feat, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-brand-body">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-green mt-2 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => onSelectModule && onSelectModule(mod)}
                          className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
                        >
                          <span>Ver Detalhes</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={onOpenContact}
                          className="border border-brand-border text-brand-dark hover:border-brand-green hover:text-brand-green font-bold px-6 py-2.5 rounded-lg transition-all duration-300"
                        >
                          Solicitar Demo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-green py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal variant="zoom-in">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Pronto para digitalizar a sua escola?
            </h2>
            <p className="text-green-100 mb-8">
              Experimente todos os módulos gratuitamente por 30 dias. Sem compromisso, sem cartão de crédito.
            </p>
            <button
              onClick={onOpenContact}
              className="bg-white text-brand-green hover:bg-brand-green-light font-extrabold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Começar Gratuitamente</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
};

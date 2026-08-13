import React from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { SchoolModule } from '../types/school';
import {
  ArrowLeft, CheckCircle, Users, BookOpen, GraduationCap,
  ClipboardList, BarChart3, DollarSign, MessageCircle, PieChart, ArrowRight
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users className="w-10 h-10" />,
  BookOpen: <BookOpen className="w-10 h-10" />,
  GraduationCap: <GraduationCap className="w-10 h-10" />,
  ClipboardList: <ClipboardList className="w-10 h-10" />,
  BarChart3: <BarChart3 className="w-10 h-10" />,
  DollarSign: <DollarSign className="w-10 h-10" />,
  MessageCircle: <MessageCircle className="w-10 h-10" />,
  PieChart: <PieChart className="w-10 h-10" />,
};

interface ModuloDetailPageProps {
  module: SchoolModule;
  onBack?: () => void;
  onOpenContact?: () => void;
}

export const ModuloDetailPage: React.FC<ModuloDetailPageProps> = ({ module, onBack, onOpenContact }) => {
  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HERO */}
      <section className="bg-brand-dark py-16 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar aos Módulos</span>
            </button>
            <div className="flex items-center gap-5 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${module.color}`}>
                {ICON_MAP[module.icon]}
              </div>
              <div>
                {module.badge && (
                  <span className="inline-block text-[10px] font-extrabold uppercase bg-brand-green text-white px-2 py-0.5 rounded-full mb-2">
                    {module.badge}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{module.title}</h1>
              </div>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl">{module.description}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Imagem */}
            <ScrollReveal variant="fade-right" className="lg:col-span-1">
              <div className="rounded-2xl overflow-hidden shadow-xl sticky top-28">
                <img
                  src={module.image}
                  alt={module.title}
                  className="w-full h-72 object-cover"
                />
              </div>
            </ScrollReveal>

            {/* Features e Benefits */}
            <ScrollReveal variant="fade-left" className="lg:col-span-2">
              <div className="space-y-8">

                {/* Funcionalidades */}
                <div className="bg-white rounded-2xl p-8 shadow-card border border-brand-border">
                  <h2 className="text-xl font-extrabold text-brand-dark mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-brand-green" />
                    Funcionalidades Incluídas
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {module.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-brand-green-light/50 hover:bg-brand-green-light transition-colors">
                        <CheckCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                        <span className="text-sm text-brand-dark font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefícios */}
                <div className="bg-white rounded-2xl p-8 shadow-card border border-brand-border">
                  <h2 className="text-xl font-extrabold text-brand-dark mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-gold" />
                    Principais Benefícios
                  </h2>
                  <div className="space-y-4">
                    {module.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-brand-border hover:border-brand-green/30 hover:bg-brand-bg transition-all group">
                        <div className="w-8 h-8 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-extrabold text-sm shrink-0 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                          {i + 1}
                        </div>
                        <span className="text-brand-dark font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={onOpenContact}
                    className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <span>Solicitar Demonstração</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onBack}
                    className="border border-brand-border text-brand-dark hover:border-brand-green hover:text-brand-green font-bold px-8 py-4 rounded-xl transition-all duration-300"
                  >
                    Ver Outros Módulos
                  </button>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

    </div>
  );
};

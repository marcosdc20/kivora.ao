import React from 'react';
import { ScrollReveal, ScrollRevealItem } from '../components/ScrollReveal';
import { FINANCIAL_PLANS } from '../data/school';
import { CheckCircle, Star, ArrowRight, DollarSign, TrendingUp, Shield } from 'lucide-react';

interface FinanceiroPageProps {
  onOpenContact?: () => void;
}

export const FinanceiroPage: React.FC<FinanceiroPageProps> = ({ onOpenContact }) => {
  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HEADER */}
      <section className="bg-brand-dark py-16 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <span className="inline-flex items-center gap-2 bg-brand-green/20 text-brand-green text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4 border border-brand-green/30">
              <DollarSign className="w-3.5 h-3.5" />
              Planos & Preços
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Gestão financeira <span className="text-brand-green">transparente</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Escolha o plano ideal para a sua escola. Preços em kwanzas, sem taxas ocultas e com suporte local incluído.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* PLANOS */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-brand-green-light text-brand-green text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4">
              <Star className="w-3.5 h-3.5 fill-brand-green" />
              Planos Disponíveis
            </span>
            <h2 className="text-3xl font-extrabold text-brand-dark">
              Escolha o plano certo para a sua escola
            </h2>
            <p className="mt-3 text-brand-body">Todos os planos incluem 30 dias grátis. Cancele a qualquer momento.</p>
          </ScrollReveal>

          <ScrollReveal variant="stagger">
            <div className="grid md:grid-cols-3 gap-8">
              {FINANCIAL_PLANS.map(plan => (
                <ScrollRevealItem key={plan.id}>
                  <div className={`relative rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-brand-green text-white shadow-2xl scale-105 border-0'
                      : 'bg-white border border-brand-border shadow-card hover:shadow-card-hover hover:border-brand-green/30'
                  }`}>
                    {plan.badge && (
                      <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-full shadow-lg ${
                        plan.highlighted ? 'bg-brand-gold text-brand-dark' : 'bg-brand-green text-white'
                      }`}>
                        {plan.badge}
                      </span>
                    )}

                    <div className="mb-6">
                      <h3 className={`text-xl font-extrabold mb-2 ${plan.highlighted ? 'text-white' : 'text-brand-dark'}`}>
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-brand-dark'}`}>
                          {plan.price}
                        </span>
                        <span className={`text-sm ${plan.highlighted ? 'text-green-100' : 'text-brand-body'}`}>
                          {plan.period}
                        </span>
                      </div>
                      <p className={`mt-2 text-sm ${plan.highlighted ? 'text-green-100' : 'text-brand-body'}`}>
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-3 flex-1 mb-8">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-green-200' : 'text-brand-green'}`} />
                          <span className={plan.highlighted ? 'text-green-50' : 'text-brand-body'}>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={onOpenContact}
                      className={`w-full font-extrabold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                        plan.highlighted
                          ? 'bg-white text-brand-green hover:bg-brand-green-light shadow-xl'
                          : 'bg-brand-green text-white hover:bg-brand-green-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      <span>{plan.ctaLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* MÓDULO FINANCEIRO */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal variant="fade-right">
              <span className="inline-flex items-center gap-2 bg-brand-green-light text-brand-green text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4">
                <TrendingUp className="w-3.5 h-3.5" />
                Módulo Financeiro
              </span>
              <h2 className="text-3xl font-extrabold text-brand-dark mb-4 leading-tight">
                Controle completo das <span className="text-brand-green">finanças escolares</span>
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                O módulo financeiro da Kivora permite controlar receitas, emitir recibos digitais, acompanhar pendências e gerar relatórios financeiros automáticos.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <DollarSign />, title: 'Propinas mensais', desc: 'Registo automático de pagamentos e alertas de atraso.' },
                  { icon: <Shield />, title: 'Recibos digitais', desc: 'Emita recibos em PDF com um clique e envie por email.' },
                  { icon: <TrendingUp />, title: 'Relatórios financeiros', desc: 'Dashboards mensais e anuais para tomada de decisão.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-green/30 hover:bg-brand-green-light transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center text-sm shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-brand-dark text-sm mb-0.5">{item.title}</h4>
                      <p className="text-xs text-brand-body">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-left">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop"
                  alt="Gestão Financeira"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur rounded-xl p-4 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-brand-dark">Propinas em dia</p>
                        <p className="text-[10px] text-brand-body">98% dos pagamentos processados</p>
                      </div>
                      <div className="ml-auto text-2xl font-extrabold text-brand-green">98%</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

    </div>
  );
};

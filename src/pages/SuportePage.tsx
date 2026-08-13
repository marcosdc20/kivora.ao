import React, { useState } from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { SCHOOL_INFO } from '../data/school';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle, GraduationCap } from 'lucide-react';

interface SuportePageProps {
  initialSubject?: string;
}

export const SuportePage: React.FC<SuportePageProps> = ({ initialSubject = '' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HEADER */}
      <section className="bg-brand-dark py-16 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <span className="inline-flex items-center gap-2 bg-brand-green/20 text-brand-green text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4 border border-brand-green/30">
              <MessageCircle className="w-3.5 h-3.5" />
              Suporte & Contacto
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Estamos aqui para <span className="text-brand-green">ajudar</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Tem alguma dúvida, quer solicitar uma demonstração ou precisa de suporte técnico? Entre em contacto connosco — resposta em menos de 24h.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* INFO LATERAL */}
            <ScrollReveal variant="fade-right" className="lg:col-span-2">
              <div className="space-y-6">

                {/* Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-border">
                  <h3 className="font-extrabold text-brand-dark text-base mb-5 pb-3 border-b border-gray-100">Informações de Contacto</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-body">Telefone / WhatsApp</p>
                        <a href={`tel:${SCHOOL_INFO.phoneRaw}`} className="font-bold text-brand-dark hover:text-brand-green transition-colors">
                          {SCHOOL_INFO.phoneDisplay}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-body">Email de Suporte</p>
                        <a href={`mailto:${SCHOOL_INFO.email}`} className="font-bold text-brand-dark hover:text-brand-green transition-colors">
                          {SCHOOL_INFO.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-body">Localização</p>
                        <p className="font-bold text-brand-dark">{SCHOOL_INFO.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={SCHOOL_INFO.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-[#25D366] hover:bg-[#1da851] text-white rounded-2xl p-5 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm">Fale pelo WhatsApp</p>
                    <p className="text-xs text-green-100">Resposta imediata em horário comercial</p>
                  </div>
                </a>

                {/* Horário */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-border">
                  <h4 className="font-extrabold text-brand-dark text-sm mb-4">Horário de Suporte</h4>
                  <div className="space-y-2 text-xs text-brand-body">
                    <div className="flex justify-between">
                      <span>Segunda a Sexta</span>
                      <span className="font-bold text-brand-dark">08h – 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado</span>
                      <span className="font-bold text-brand-dark">09h – 13h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo</span>
                      <span className="font-bold text-red-500">Fechado</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* FORMULÁRIO */}
            <ScrollReveal variant="fade-left" className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 shadow-card border border-brand-border">
                {!submitted ? (
                  <>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-brand-dark">Enviar Mensagem</h3>
                        <p className="text-xs text-brand-body">Resposta em até 24 horas</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-extrabold text-brand-dark mb-1.5">Nome Completo *</label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="O seu nome"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-extrabold text-brand-dark mb-1.5">Email *</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="email@exemplo.ao"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-brand-dark mb-1.5">Nome da Escola</label>
                        <input
                          type="text"
                          value={schoolName}
                          onChange={e => setSchoolName(e.target.value)}
                          placeholder="Nome da sua instituição"
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-brand-dark mb-1.5">Assunto *</label>
                        <select
                          required
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-colors"
                        >
                          <option value="">Selecione o assunto</option>
                          <option value="demonstracao">Solicitar Demonstração</option>
                          <option value="planos">Informações sobre Planos</option>
                          <option value="suporte">Suporte Técnico</option>
                          <option value="parceria">Proposta de Parceria</option>
                          <option value="outro">Outro Assunto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-brand-dark mb-1.5">Mensagem *</label>
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder="Descreva a sua dúvida ou pedido em detalhe..."
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-extrabold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar Mensagem</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-brand-dark mb-2">Mensagem Enviada!</h3>
                    <p className="text-brand-body">
                      Obrigado pelo seu contacto, <strong>{name}</strong>. Responderemos em breve para <strong>{email}</strong>.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMessage(''); }}
                      className="mt-6 text-brand-green font-bold text-sm hover:underline"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                )}
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

    </div>
  );
};

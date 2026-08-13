import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { KIVORA_INFO } from '../data/kivoraData';

interface SuportePageProps {
  initialSubject?: string;
}

export const SuportePage: React.FC<SuportePageProps> = ({ initialSubject = '' }) => {
  const [submitted, setSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    subject: initialSubject || 'Suporte Técnico Faturação AGT',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner - Clean Light Neutral */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
            Apoio ao Cliente & Assistência
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Estamos Aqui para Apoiar o Seu Negócio
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Fale com a nossa equipa de apoio em Luanda para assistência técnica, dúvidas fiscais ou formação de operadores.
          </p>
        </div>
      </section>

      {/* Main Support Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct Contacts & Hours */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                Canais de Atendimento Direto
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block text-xs">Linha Comercial & Suporte</span>
                    <a href={`tel:${KIVORA_INFO.phoneRaw}`} className="text-blue-600 font-bold hover:underline block mt-0.5">
                      {KIVORA_INFO.phoneDisplay}
                    </a>
                    <span className="text-[10px] text-slate-500">Atendimento telefónico em Luanda</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block text-xs">Email de Suporte Técnico</span>
                    <a href={`mailto:${KIVORA_INFO.supportEmail}`} className="text-blue-600 font-bold hover:underline block mt-0.5">
                      {KIVORA_INFO.supportEmail}
                    </a>
                    <span className="text-[10px] text-slate-500">Resposta rápida em horário laboral</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block text-xs">Escritório Presencial</span>
                    <span className="text-slate-700 block mt-0.5 font-medium">{KIVORA_INFO.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Horário de Funcionamento</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Segunda a Sexta:</span>
                  <strong className="text-white">08h00 às 18h00</strong>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Sábado:</span>
                  <strong className="text-white">09h00 às 13h00</strong>
                </li>
                <li className="flex justify-between">
                  <span>Suporte Urgente Cloud (24/7):</span>
                  <strong className="text-emerald-400">Ativo para Clientes VIP</strong>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Support Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Submeter Pedido de Suporte ou Contacto
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Preencha o formulário abaixo e receba assistência da nossa equipa técnica.
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    Mensagem Recebida!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    O seu pedido de assistência foi registado no nosso sistema. Um técnico especialista entrará em contacto muito em breve.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
                  >
                    Enviar Outro Pedido
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Seu Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Seu nome"
                        value={ticketData.name}
                        onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Empresa / NIF *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nome da empresa ou NIF"
                        value={ticketData.company}
                        onChange={(e) => setTicketData({ ...ticketData, company: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+244 9XX XXX XXX"
                        value={ticketData.phone}
                        onChange={(e) => setTicketData({ ...ticketData, phone: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Email Corporativo *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="email@empresa.ao"
                        value={ticketData.email}
                        onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Assunto do Pedido
                    </label>
                    <select
                      value={ticketData.subject}
                      onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 outline-none"
                    >
                      <option value="Suporte Técnico Faturação AGT">Suporte Técnico Faturação AGT</option>
                      <option value="Dúvidas sobre Séries e QR Code">Dúvidas sobre Séries e QR Code</option>
                      <option value="Configuração de POS e Impressora Térmica">Configuração de POS e Impressora Térmica</option>
                      <option value="Exportação de SAF-T (AO)">Exportação de SAF-T (AO)</option>
                      <option value="Formação de Operadores de Caixa">Formação de Operadores de Caixa</option>
                      <option value="Renovação de Licença / Upgrade">Renovação de Licença / Upgrade</option>
                      <option value="Outro Assunto">Outro Assunto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Descrição da Solicitação *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Descreva a sua dúvida ou a solicitação técnica..."
                      value={ticketData.message}
                      onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Pedido de Assistência</span>
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

import React, { useState } from 'react';
import { Users, Handshake, TrendingUp, ShieldCheck, CheckCircle2, Send } from 'lucide-react';

export const ParceirosPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    province: 'Luanda',
    clientsEstimate: '1 a 5 empresas por mês',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
            Programa de Parceiros & Revendedores
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Cresça Connosco a Comercializar o KIVORA em Angola
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Seja um parceiro de implementação e revenda de licenças do KIVORA. Ofereça um software certificado pela AGT com excelentes margens de comissão.
          </p>
        </div>
      </section>

      {/* Benefits for Partners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Comissões Atrativas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Obtenha margens de lucro elevadas na revenda de licenças mensais, anuais e serviços de instalação técnica local.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Portal do Parceiro Exclusivo</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Acesso à plataforma para registar clientes, gerar licenças de ativação, acompanhar comissões e descarregar materiais de apoio.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Formação & Suporte Técnico</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A equipa da Visual Software oferece formação presencial e remota em Luanda e províncias para a sua equipa comercial e técnica.
            </p>
          </div>
        </div>

        {/* Partner Application Form */}
        <div className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <Handshake className="w-4 h-4" />
              <span>Seja um Revendedor Oficial</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Junte-se à Nossa Rede de Parceiros em Angola
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Procuramos consultores de TI, contabilistas e empresas de informática em Luanda, Benguela, Huambo, Huíla, Cabinda e demais províncias.
            </p>
            <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sem taxa de adesão ou custo de franquia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Gestão direta dos seus clientes no Portal do Parceiro</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Candidatura Recebida!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Obrigado pelo interesse em ser parceiro KIVORA. O nosso gestor de parcerias entrará em contacto dentro de 24 horas.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
                >
                  Enviar Outra Candidatura
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">Formulário de Candidatura a Parceiro</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome da Empresa / Atividade *</label>
                    <input
                      type="text"
                      required
                      placeholder="Empresa de TI ou Consultoria"
                      value={partnerForm.company}
                      onChange={(e) => setPartnerForm({ ...partnerForm, company: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+244 9XX XXX XXX"
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="email@empresa.ao"
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Província Principal de Atuação</label>
                  <select
                    value={partnerForm.province}
                    onChange={(e) => setPartnerForm({ ...partnerForm, province: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="Luanda">Luanda</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Huíla">Huíla</option>
                    <option value="Cabinda">Cabinda</option>
                    <option value="Outra Província">Outra Província</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submeter Candidatura de Parceiro</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

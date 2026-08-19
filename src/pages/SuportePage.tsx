import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import {
  Mail, Phone, MessageCircle, Send, CheckCircle2,
  Clock, Loader2, Headphones, Building2
} from 'lucide-react';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';

import welcomeImg from '../assets/kivora/jovem-empresario-dado-boas-vindas.png';

interface SuportePageProps {
  initialSubject?: string;
}

export const SuportePage: React.FC<SuportePageProps> = ({ initialSubject }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nif, setNif] = useState('');
  const [departamento, setDepartamento] = useState('tecnico');
  const [assunto, setAssunto] = useState(initialSubject || '');
  const [mensagem, setMensagem] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [ticketProtocol, setTicketProtocol] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefone || !mensagem) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const protocol = `TICK-AO-${Date.now().toString().slice(-6)}`;
      setTicketProtocol(protocol);
    }, 1000);
  };

  const faqs = [
    {
      categoria: 'Operação & Faturação',
      q: 'O KIVORA funciona mesmo se a internet da loja falhar?',
      a: 'Sim, a 100%. A base de dados do Kivora fica instalada no seu computador. Todas as vendas, emissão de faturas, fecho de caixa e impressão de talões ocorrem localmente sem depender de ligação à internet.',
    },
    {
      categoria: 'Redes Locais & Multi-Posto',
      q: 'Como posso ligar 3 ou mais caixas em rede local na mesma loja?',
      a: 'Basta instalar o Kivora como "Servidor" no computador principal e como "Terminal Cliente" nos computadores dos caixas, todos conectados ao mesmo router/switch de rede local.',
    },
    {
      categoria: 'Conformidade Fiscal AGT',
      q: 'Como é gerado e entregue o ficheiro SAF-T AO?',
      a: 'No menu Relatórios > SAF-T, selecione o mês pretendido e clique em "Gerar SAF-T". O ficheiro XML gerado é auditado pelo validador interno e fica pronto para submissão no portal da AGT até ao dia 15 de cada mês.',
    },
    {
      categoria: 'Segurança & Backups',
      q: 'Como garantir que não perco os dados das vendas da minha empresa?',
      a: 'O Kivora possui rotina de backup automático com 1 clique para pastas locais, unidades secundárias ou Pen USB. Recomendamos a realização de cópias diárias de segurança no encerramento do dia.',
    },
  ];

  const whatsappHref = settings.whatsappUrl || `https://wa.me/${settings.phoneRaw || '244923456789'}`;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 page-enter font-sans">

      {/* Hero Showcase */}
      <PageHero
        image={welcomeImg}
        tag="Central de Atendimento & Suporte Técnico"
        title="Assistência Especializada para a Sua Empresa"
        sub="Equipa técnica sediada em Luanda disponível para apoio presencial e remoto, configurações de rede local, parametrização fiscal e esclarecimento de dúvidas operacionais."
      />

      {/* Main Container */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 space-y-16">
        
        {/* Canais Diretos de Contacto Corporativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: WhatsApp */}
          <div className="bg-white rounded-3xl p-7 flex flex-col justify-between space-y-6 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Atendimento Ativo
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">WhatsApp & Chat Imediato</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Canal prioritário para suporte em tempo real com os nossos técnicos especializados em Angola.
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>{settings.phoneDisplay}</span>
                <span className="text-[11px] font-sans font-medium text-slate-400">Direto</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{settings.supportHours || 'Segunda a Sábado: 08h00 – 19h00'}</span>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar no WhatsApp Agora</span>
            </a>
          </div>

          {/* Card 2: Telefone Central */}
          <div className="bg-white rounded-3xl p-7 flex flex-col justify-between space-y-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Voz & Central
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Atendimento Telefónico Central</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Linha de suporte telefónico dedicada a operadores, caixas, gerentes e contabilistas.
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>{settings.phoneDisplay}</span>
                <span className="text-[11px] font-sans font-medium text-slate-400">Luanda / Nacional</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{settings.supportHoursSunday || 'Atendimento Comercial & Suporte Remoto'}</span>
              </div>
            </div>

            <a
              href={`tel:${settings.phoneRaw || '244923456789'}`}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Ligar para a Central</span>
            </a>
          </div>

          {/* Card 3: Email Suporte */}
          <div className="bg-white rounded-3xl p-7 flex flex-col justify-between space-y-6 border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Logs & Ficheiros
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Email de Suporte Técnico & Fiscal</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Envio de ficheiros de log, cópias de segurança, relatórios e esclarecimento de regras fiscais.
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 pt-3 border-t border-slate-100 truncate">
                {settings.supportEmail || 'suporte@kivora.ao'}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{settings.address || 'Luanda, Angola'}</span>
              </div>
            </div>

            <a
              href={`mailto:${settings.supportEmail || 'suporte@kivora.ao'}`}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar Mensagem por Email</span>
            </a>
          </div>

        </div>

        {/* Formulário Interativo de Abertura de Ticket com Protocolo */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3.5 py-1 rounded-full">
              <Headphones className="w-3.5 h-3.5" />
              <span>Abertura de Chamado Técnico</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
              Precisa de Intervenção Técnica ou Formação?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Preencha o formulário para gerar o seu número de protocolo e ser atendido por um engenheiro de suporte.
            </p>
          </div>

          {ticketProtocol ? (
            <div className="bg-white border-2 border-emerald-500 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-xl animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-950">Chamado Registado com Sucesso!</h4>
              <p className="text-xs text-slate-600">
                O seu pedido foi encaminhado para a equipa técnica. O protocolo oficial de acompanhamento é:
              </p>
              <div className="bg-slate-900 text-white py-3 px-6 rounded-2xl font-mono font-black text-lg tracking-wider w-fit mx-auto shadow-inner">
                {ticketProtocol}
              </div>
              <p className="text-[11px] text-slate-500">
                Um técnico entrará em contacto para o número <strong>{telefone}</strong> em menos de 2 horas úteis.
              </p>
              <button
                onClick={() => {
                  setTicketProtocol(null);
                  setMensagem('');
                  setAssunto('');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer pt-2 block mx-auto"
              >
                Abrir novo chamado
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="max-w-3xl mx-auto space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nome do Solicitante / Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Baptista"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +244 923 000 000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Corporativo</label>
                  <input
                    type="email"
                    placeholder="Ex: geral@empresa.ao"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">NIF da Empresa Licenciada</label>
                  <input
                    type="text"
                    placeholder="Ex: 5417088920"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Departamento / Área</label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="tecnico">Instalação & Configuração de Rede LAN</option>
                    <option value="faturacao">Faturação Eletrónica & Validação AGT</option>
                    <option value="licencas">Licenciamento, Ativações & Pagamentos</option>
                    <option value="formacao">Formação de Caixas e Gerência</option>
                    <option value="outro">Outro Assunto</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Assunto Principal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dúvida na exportação do SAF-T mensal"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Descrição Detalhada do Pedido ou Ocorrência *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva o que necessita, mensagem de erro que surgiu ou a data pretendida para formação..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A gerar protocolo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Pedido & Gerar Protocolo Oficial</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Perguntas Frequentes Expandidas */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-slate-950">Perguntas Frequentes (FAQ)</h3>
            <p className="text-xs text-slate-500">Respostas rápidas às principais dúvidas operacionais e fiscais.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-2.5">
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {faq.categoria}
                </span>
                <h4 className="font-bold text-sm text-slate-950">{faq.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
};

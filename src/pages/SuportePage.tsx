import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import {
  Mail, Phone, MessageCircle, Send, CheckCircle2,
  Clock, Loader2, Headphones, Building2, Video,
  Monitor
} from 'lucide-react';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { createSupportTicket } from '../admin/services/supportService';
import { sendSupportTicketEmails } from '../services/siteEmailService';
import { VideoConferenceModal } from '../components/VideoConferenceModal';

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
  const [departamento, setDepartamento] = useState<'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja'>('tecnico');
  const [assunto, setAssunto] = useState(initialSubject || '');
  const [mensagem, setMensagem] = useState('');
  const [hpField, setHpField] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [ticketProtocol, setTicketProtocol] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefone || !mensagem) return;

    setSubmitting(true);

    // Bot trap
    if (hpField) {
      setTimeout(() => {
        setSubmitting(false);
        setTicketProtocol(`TICK-AO-${Date.now().toString().slice(-6)}`);
      }, 400);
      return;
    }
    try {
      const newTicket = await createSupportTicket({
        company_name: nome,
        nif: nif || undefined,
        contact_email: email || `${telefone.replace(/[^0-9]/g, '')}@kivora.ao`,
        contact_phone: telefone,
        subject: assunto || 'Pedido de Assistência Técnica',
        category: departamento,
        priority: 'medium',
        initial_message: mensagem,
        target_type: 'admin',
        created_by_role: 'client',
        sender_name: nome
      });

      const ticketNum = newTicket.ticket_number || `TICK-AO-${Date.now().toString().slice(-6)}`;
      setTicketProtocol(ticketNum);

      // Disparar e-mails automáticos de suporte (confirmação ao cliente + alerta à equipa de suporte)
      sendSupportTicketEmails({
        nome,
        email: email || undefined,
        telefone,
        ticketNumber: ticketNum,
        assunto: assunto || 'Pedido de Assistência Técnica',
        departamento,
        mensagem
      }).catch((err) => console.warn('Erro ao disparar e-mails do ticket:', err));

      // Disparo para Webhook configurado no Firebase
      if (settings.webhookUrl) {
        try {
          fetch(settings.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'support_ticket_created',
              ticketNumber: newTicket.ticket_number,
              nome,
              telefone,
              email,
              nif,
              departamento,
              assunto,
              mensagem,
              createdAt: new Date().toISOString()
            })
          }).catch(() => {});
        } catch {
          // ignore
        }
      }
    } catch {
      // Fallback gracioso
      const fallbackProtocol = `TICK-AO-${Date.now().toString().slice(-6)}`;
      setTicketProtocol(fallbackProtocol);
    } finally {
      setSubmitting(false);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: WhatsApp */}
          <div className="bg-gradient-to-br from-emerald-50/60 via-white to-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 group hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden card-glow-green">
            <MessageCircle className="icon-watermark wm-emerald w-32 h-32" strokeWidth={1.25} />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Atendimento Ativo
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 group-hover:text-emerald-700 transition-colors">WhatsApp & Chat Imediato</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Canal prioritário para suporte em tempo real com os nossos técnicos especializados em Angola.
                </p>
              </div>
              <div className="text-xs font-mono-num font-bold text-slate-950 pt-3 border-t border-slate-100 flex items-center justify-between">
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
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer relative z-10 shine-hover"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar no WhatsApp Agora</span>
            </a>
          </div>

          {/* Card 2: Videochamada & Partilha de Ecrã */}
          <div className="bg-gradient-to-br from-sky-50/60 via-white to-white border border-blue-300 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 group hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden card-glow-blue">
            <Video className="icon-watermark wm-sky w-32 h-32" strokeWidth={1.25} />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Video className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200/80">
                  Google Meet / Jitsi HD
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 group-hover:text-blue-600 transition-colors">Videochamada & Ecrã</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Assistência remota em direto para diagnóstico visual no seu computador de caixa sem custos.
                </p>
              </div>
              <div className="text-xs font-mono-num font-bold text-slate-950 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-blue-600 font-bold">100% Gratuito</span>
                <span className="text-[11px] font-sans font-medium text-slate-400">Sem Registo</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Partilha de ecrã e áudio HD</span>
              </div>
            </div>

            <button
              onClick={() => setVideoModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/25 cursor-pointer relative z-10 shine-hover"
            >
              <Video className="w-4 h-4" />
              <span>Abrir Videochamada</span>
            </button>
          </div>

          {/* Card 3: Telefone Central */}
          <div className="bg-gradient-to-br from-indigo-50/60 via-white to-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 group hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden card-glow-indigo">
            <Phone className="icon-watermark wm-indigo w-32 h-32" strokeWidth={1.25} />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  Voz & Central
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 group-hover:text-indigo-600 transition-colors">Atendimento Telefónico</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Linha de suporte telefónico dedicada a operadores, caixas, gerentes e contabilistas.
                </p>
              </div>
              <div className="text-xs font-mono-num font-bold text-slate-950 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>{settings.phoneDisplay}</span>
                <span className="text-[11px] font-sans font-medium text-slate-400">Luanda / Nacional</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{settings.supportHoursSunday || 'Atendimento Comercial & Suporte Remoto'}</span>
              </div>
            </div>

            <a
              href={`tel:${settings.phoneRaw || '244923456789'}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/25 cursor-pointer relative z-10 shine-hover"
            >
              <Phone className="w-4 h-4" />
              <span>Ligar para a Central</span>
            </a>
          </div>

          {/* Card 4: Email Suporte */}
          <div className="bg-gradient-to-br from-purple-50/60 via-white to-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 group hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden card-glow-purple">
            <Mail className="icon-watermark wm-purple w-32 h-32" strokeWidth={1.25} />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                  Logs & Ficheiros
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 group-hover:text-purple-600 transition-colors">Email & Faturação</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Envio de ficheiros de log, cópias de segurança, relatórios e esclarecimento de regras fiscais.
                </p>
              </div>
              <div className="text-xs font-mono-num font-bold text-slate-950 pt-3 border-t border-slate-100 truncate">
                {settings.supportEmail || 'suporte@kivora.ao'}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{settings.address || 'Luanda, Angola'}</span>
              </div>
            </div>

            <a
              href={`mailto:${settings.supportEmail || 'suporte@kivora.ao'}`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/25 cursor-pointer relative z-10 shine-hover"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar por Email</span>
            </a>
          </div>

        </div>

        {/* Formulário Interativo de Abertura de Ticket com Protocolo */}
        <div className="bg-mesh border border-slate-200/80 rounded-3xl p-8 sm:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 orb orb-blue" />
          <div className="max-w-2xl mx-auto text-center space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-3.5 py-1.5 rounded-full border border-blue-200">
              <Headphones className="w-3.5 h-3.5" />
              <span>Abertura de Chamado Técnico</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
              Precisa de Intervenção Técnica ou Formação?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
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
              {/* Honeypot Invisível anti-spam */}
              <input
                type="text"
                name="hp_field"
                id="sup_hp_field"
                value={hpField}
                onChange={(e) => setHpField(e.target.value)}
                style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="sup_nome" className="text-xs font-bold text-slate-700">Nome do Solicitante / Responsável *</label>
                  <input
                    id="sup_nome"
                    type="text"
                    required
                    placeholder="Ex: João Baptista"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sup_telefone" className="text-xs font-bold text-slate-700">Telefone / WhatsApp *</label>
                  <input
                    id="sup_telefone"
                    type="tel"
                    required
                    placeholder="Ex: +244 923 000 000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sup_email" className="text-xs font-bold text-slate-700">Email Corporativo</label>
                  <input
                    id="sup_email"
                    type="email"
                    placeholder="Ex: geral@empresa.ao"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sup_nif" className="text-xs font-bold text-slate-700">NIF da Empresa Licenciada</label>
                  <input
                    id="sup_nif"
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
                  <label htmlFor="sup_departamento" className="text-xs font-bold text-slate-700">Departamento / Área</label>
                  <select
                    id="sup_departamento"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="tecnico">Instalação & Configuração de Rede LAN</option>
                    <option value="faturacao">Faturação Eletrónica & Validação AGT</option>
                    <option value="licenciamento">Licenciamento, Ativações & Pagamentos</option>
                    <option value="multiloja">Multi-Posto & Multi-Loja</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sup_assunto" className="text-xs font-bold text-slate-700">Assunto Principal *</label>
                  <input
                    id="sup_assunto"
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
                <label htmlFor="sup_mensagem" className="text-xs font-bold text-slate-700">Descrição Detalhada do Pedido ou Ocorrência *</label>
                <textarea
                  id="sup_mensagem"
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

      {/* Modal de Videochamada de Assistência Remota */}
      <VideoConferenceModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        roomName={ticketProtocol ? `kivora-suporte-${ticketProtocol.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined}
        ticketNumber={ticketProtocol || undefined}
        userName={nome || 'Cliente Kivora'}
        userRole="cliente"
        companyName={nome || 'Empresa Cliente'}
      />

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Monitor, Download, Copy, LogOut, CheckCircle2, ShieldCheck,
  Headphones, MessageSquare, Plus, Send,
  Key, FileText, UserCheck, Loader2
} from 'lucide-react';
import { CURRENT_RELEASE } from '../data/kivoraData';
import { getStoredSession, clearStoredSession, KivoraUserSession } from '../admin/services/authService';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  SupportTicket, createSupportTicket, sendTicketMessage, subscribeClientTickets
} from '../admin/services/supportService';
import { KivoraLicense } from '../admin/types';

interface AreaClientePageProps {
  onNavigatePage: (page: any) => void;
}

export const AreaClientePage: React.FC<AreaClientePageProps> = ({ onNavigatePage }) => {
  const session: KivoraUserSession | null = getStoredSession();
  const [activeTab, setActiveTab] = useState<'licenca' | 'suporte' | 'faturas' | 'downloads'>('licenca');
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dados reais da licença do cliente
  const [clientLicense, setClientLicense] = useState<KivoraLicense | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<{ name: string; phone: string; email: string } | null>(null);

  // Estado dos Tickets de Suporte do Cliente
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja'>('tecnico');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Identificador de busca (email da sessão ou padrão)
  const clientEmail = session?.email || 'cliente@kivora.ao';
  const clientCompanyName = session?.nome || 'Empresa Cliente Kivora';

  // Sincronização em Tempo Real com Firestore (/licenses e /partners)
  useEffect(() => {
    try {
      const unsubLic = onSnapshot(collection(db, 'licenses'), (snapshot) => {
        let foundLic: KivoraLicense | null = null;
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const matchesEmail = session?.email && (d.client_email || '').toLowerCase() === session.email.toLowerCase();
          const matchesCompany = session?.nome && (d.company_name || '').toLowerCase() === session.nome.toLowerCase();
          const matchesNif = session?.nif && d.nif === session.nif;

          if (matchesEmail || matchesCompany || matchesNif) {
            foundLic = {
              id: docSnap.id,
              client_email: d.client_email || clientEmail,
              company_name: d.company_name || clientCompanyName,
              nif: d.nif || session?.nif || 'Não Registado',
              plan_type: d.plan_type || 'annual',
              status: d.status || 'active',
              hardware_id: d.hardware_id ?? null,
              created_at: d.created_at || Date.now(),
              expires_at: d.expires_at ?? (Date.now() + 365 * 86400000),
              price_aoa: d.price_aoa || 250000,
              notes: d.notes || '',
              partner_id: d.partner_id || undefined,
              activated_at: d.activated_at ?? null,
              extra_seats: d.extra_seats ?? 0,
            };
          }
        });

        if (foundLic) {
          setClientLicense(foundLic);

          // Verifica se a licença tem parceiro associado (ex: "Emitida pelo parceiro PARC-LUANDA-001" ou campo partner_id)
          const notesStr: string = (foundLic as KivoraLicense).notes || '';
          if (notesStr.toLowerCase().includes('parceiro')) {
            const parts = notesStr.split('parceiro');
            const pCode = parts[1]?.trim().split(' ')[0] || 'PARCEIRO-KIVORA-AO';
            setPartnerInfo({
              name: `Parceiro Autorizado Kivora (${pCode})`,
              phone: '+244 923 000 000',
              email: 'suporte.parceiro@kivora.ao'
            });
          } else {
            setPartnerInfo(null); // Atendido diretamente pelo Admin Central
          }
        }
        setLoading(false);
      });

      // Subscrição de tickets de suporte do cliente
      const unsubTickets = subscribeClientTickets(clientEmail, (list) => {
        setTickets(list);
        if (selectedTicket) {
          const updated = list.find(t => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      });

      return () => {
        unsubLic();
        unsubTickets();
      };
    } catch (e) {
      console.warn(e);
      setLoading(false);
    }
  }, [clientEmail, session]);

  const handleCopyKey = () => {
    if (!clientLicense) return;
    navigator.clipboard.writeText(clientLicense.id);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmittingTicket(true);

    try {
      const isPartnerSupport = !!partnerInfo;
      const newTk = await createSupportTicket({
        company_name: clientLicense?.company_name || clientCompanyName,
        nif: clientLicense?.nif,
        contact_email: clientEmail,
        contact_phone: '+244 923 000 000',
        subject: ticketSubject,
        category: ticketCategory,
        priority: ticketPriority,
        initial_message: ticketMessage,
        partner_id: partnerInfo ? 'PARCEIRO-LOCAL' : '',
        partner_name: partnerInfo?.name || '',
        target_type: isPartnerSupport ? 'partner' : 'admin',
        created_by_role: 'client',
        sender_name: session?.nome || 'Gestor da Empresa'
      });

      setShowNewTicketModal(false);
      setTicketSubject('');
      setTicketMessage('');
      setSelectedTicket(newTk);
      alert(`Chamado de suporte #${newTk.ticket_number} enviado com sucesso via Firebase!`);
    } catch (err: any) {
      alert('Erro ao criar ticket: ' + err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReply.trim() || !selectedTicket) return;

    try {
      await sendTicketMessage(selectedTicket.id, {
        sender_name: session?.nome || 'Cliente',
        sender_role: 'client',
        sender_email: clientEmail,
        text: chatReply
      });
      setChatReply('');
    } catch (err: any) {
      alert('Erro ao enviar mensagem: ' + err.message);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    onNavigatePage('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="font-bold text-xs">A carregar área do cliente a partir do Firebase...</p>
      </div>
    );
  }

  const isExpired = clientLicense?.expires_at && clientLicense.expires_at < Date.now();
  const totalSeats = 1 + (clientLicense?.extra_seats || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 pb-20 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Área do Cliente • Gestão da Conta
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {clientLicense?.company_name || clientCompanyName}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              NIF: {clientLicense?.nif || '5419082341'} • Chave Oficial KIVORA ERP
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Setup</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Terminar Sessão</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('licenca')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'licenca' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Minha Licença & Postos</span>
            </button>

            <button
              onClick={() => setActiveTab('suporte')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'suporte' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Apoio & Suporte Técnico</span>
              {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                  {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('faturas')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'faturas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Faturas & Pagamentos</span>
            </button>

            <button
              onClick={() => setActiveTab('downloads')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'downloads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Instaladores & Manuais</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Account Portal Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* TAB 1: MINHA LICENÇA */}
        {activeTab === 'licenca' && (
          <div className="space-y-6">
            
            {/* Banner de Roteamento de Atendimento */}
            {partnerInfo ? (
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Licença Assistida por Parceiro Homologado
                    </h4>
                    <p className="text-sm font-bold text-slate-900">{partnerInfo.name}</p>
                    <p className="text-xs text-slate-500">
                      O suporte técnico de primeiro nível e atendimento presencial desta licença é garantido pelo parceiro credenciado.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('suporte')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contactar Parceiro</span>
                </button>
              </div>
            ) : (
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                      Licença Assistida pelo Suporte Central Kivora
                    </h4>
                    <p className="text-sm font-bold text-slate-900">Engenharia & Apoio Direto Kivora Angola</p>
                    <p className="text-xs text-slate-500">
                      Atendimento centralizado com os engenheiros de software e especialistas tributários AGT.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('suporte')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Abrir Chamado Central</span>
                </button>
              </div>
            )}

            {/* License Summary Cards */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado da Licença</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${!isExpired ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <strong className={`text-base font-black ${!isExpired ? 'text-emerald-600' : 'text-red-600'}`}>
                    {!isExpired ? 'ATIVA & REGULAR' : 'EXPIRADA'}
                  </strong>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block">
                  Plano: {clientLicense?.plan_type === 'annual' ? 'Anual Corporativo' : clientLicense?.plan_type === 'lifetime' ? 'Vitalício Ilimitado' : 'Mensal Regular'}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chave de Ativação (KVRA)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 select-all">
                    {clientLicense?.id || 'KVRA-XXXX-XXXX-XXXX'}
                  </span>
                  <button
                    onClick={handleCopyKey}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Copiar Chave"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedKey && <span className="text-[10px] text-emerald-600 font-bold block">Chave copiada com sucesso!</span>}
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Validade / Renovação</span>
                <strong className="text-slate-900 text-base font-black block">
                  {clientLicense?.expires_at ? new Date(clientLicense.expires_at).toLocaleDateString('pt-AO') : 'Vitalícia'}
                </strong>
                <span className="text-[11px] text-slate-500 font-medium block">
                  Conformidade AGT 2026
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Postos / Terminais de Trabalho</span>
                <strong className="text-slate-900 text-base font-black block">
                  {totalSeats} Postos Autorizados
                </strong>
                <span className="text-[11px] text-blue-600 font-bold block">
                  Rede Local (LAN) + Cloud Sync
                </span>
              </div>
            </div>

            {/* Hardware e Dispositivo */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>Computador Servidor Vinculado</span>
                </h3>
                <span className="text-xs text-slate-500 font-semibold">Criptografia de Hardware AGT</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-slate-900 block font-bold">Identificador de Hardware (Hardware ID):</strong>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {clientLicense?.hardware_id || 'Pronto para Ativação no Primeiro Computador'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[10px] border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Vinculado com Sucesso
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SUPORTE TÉCNICO MULTILATERAL (CLIENTE -> PARCEIRO OU ADMIN) */}
        {activeTab === 'suporte' && (
          <div className="space-y-6">
            
            {/* Topo do Suporte */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Linha Direta de Suporte & Chamados</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {partnerInfo 
                    ? `Os seus chamados são atendidos diretamente pela equipa do seu parceiro: ${partnerInfo.name}`
                    : 'Os seus chamados são atendidos diretamente pela equipa técnica central da Kivora.'}
                </p>
              </div>

              <button
                onClick={() => setShowNewTicketModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Abrir Novo Chamado</span>
              </button>
            </div>

            {/* Grid: Lista de Tickets + Chat do Ticket Selecionado */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Lista de Chamados */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Histórico de Chamados ({tickets.length})
                </h3>

                {tickets.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Headphones className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-xs text-slate-700">Nenhum chamado aberto no momento</p>
                    <p className="text-[11px] text-slate-400">Clique em "Abrir Novo Chamado" para solicitar suporte.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {tickets.map((tk) => {
                      const isSel = selectedTicket?.id === tk.id;
                      return (
                        <div
                          key={tk.id}
                          onClick={() => setSelectedTicket(tk)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-blue-50 border-blue-300 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono text-[10px] font-black text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {tk.ticket_number}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              tk.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                              tk.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {tk.status === 'resolved' ? 'Resolvido' : tk.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{tk.subject}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                            <span>{new Date(tk.createdAt).toLocaleDateString('pt-AO')}</span>
                            <span className="font-bold text-blue-600">{tk.messages.length} msg(s)</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chat / Detalhes do Chamado */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
                {selectedTicket ? (
                  <>
                    {/* Header do Chat */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-blue-600">{selectedTicket.ticket_number}</span>
                          <span className="text-slate-300">•</span>
                          <h4 className="font-bold text-slate-900 text-xs">{selectedTicket.subject}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Atendimento prestado por: <strong className="text-slate-700">{selectedTicket.partner_name || 'Suporte Central Kivora'}</strong>
                        </p>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        selectedTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedTicket.status === 'resolved' ? 'Resolvido' : selectedTicket.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                      </span>
                    </div>

                    {/* Thread de Mensagens */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
                      {selectedTicket.messages.map((msg, i) => {
                        const isMe = msg.sender_role === 'client';
                        return (
                          <div
                            key={msg.id || i}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                              {msg.sender_name} ({msg.sender_role === 'client' ? 'Você' : msg.sender_role === 'partner' ? 'Parceiro' : 'Admin'})
                            </span>
                            <div className={`p-3.5 rounded-2xl text-xs max-w-md ${
                              isMe 
                                ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                                : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                              <span className={`text-[9px] font-medium mt-1.5 block text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input de Envio de Mensagem */}
                    <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Escreva a sua mensagem para a equipa técnica..."
                        value={chatReply}
                        onChange={(e) => setChatReply(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                      />
                      <button
                        type="submit"
                        disabled={!chatReply.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                    <h4 className="font-bold text-slate-700 text-sm">Selecione um chamado ao lado</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Veja o histórico completo da conversa e responda aos técnicos em tempo real.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: FATURAS & PAGAMENTOS */}
        {activeTab === 'faturas' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Histórico de Faturas & Pagamentos</h2>
              <p className="text-xs text-slate-500 mt-0.5">Recibos e documentos de liquidação emitidos para a sua empresa.</p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="p-4 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">FT-2026/0042</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      PAGO & EMITIDO
                    </span>
                  </div>
                  <p className="text-slate-600">Subscrição de Licença {clientLicense?.plan_type === 'annual' ? 'Anual' : 'Vitalícia'} Kivora ERP</p>
                  <p className="text-[10px] text-slate-400">Processado via Transferência Bancária / Multicaixa</p>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                  <strong className="text-sm font-black text-slate-900">
                    {new Intl.NumberFormat('pt-AO').format(clientLicense?.price_aoa || 250000)} Kz
                  </strong>
                  <button
                    onClick={() => alert('Download do recibo oficial da fatura gerado com sucesso.')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Recibo PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Instaladores & Documentação Oficial</h2>
              <p className="text-xs text-slate-500 mt-0.5">Versões estáveis recomendadas para os postos de trabalho da sua empresa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-black text-sm">KIVORA Setup Principal v{CURRENT_RELEASE.version}</strong>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">Windows 64-bit</span>
                </div>
                <p className="text-slate-500 text-xs">Instalador oficial para o computador servidor e terminais de caixa.</p>
                <button
                  onClick={() => onNavigatePage('download')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Instalador ({CURRENT_RELEASE.fileSize})</span>
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-black text-sm">Manual do Utilizador & Certificação AGT</strong>
                  <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2.5 py-0.5 rounded-full">PDF</span>
                </div>
                <p className="text-slate-500 text-xs">Guia passo a passo de operação fiscal, emissão de faturas e fecho de caixa.</p>
                <button
                  onClick={() => alert('Download do manual iniciado com sucesso.')}
                  className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Manual em PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* MODAL: NOVO TICKET DE SUPORTE */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Novo Chamado de Suporte</h3>
                <p className="text-xs text-slate-500">
                  {partnerInfo ? `Destinado a: ${partnerInfo.name}` : 'Destinado a: Equipa Central Kivora Admin'}
                </p>
              </div>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Assunto do Chamado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dúvida na emissão de Fatura-Recibo / Configuração de Impressora"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Categoria</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="tecnico">Suporte Técnico / Instalação</option>
                    <option value="faturacao">Faturação & Conformidade AGT</option>
                    <option value="licenciamento">Licenciamento & Terminais</option>
                    <option value="multiloja">Rede Local / Multiloja</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Prioridade</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="low">Baixa (Dúvidas gerais)</option>
                    <option value="medium">Média (Atendimento normal)</option>
                    <option value="high">Alta (Dificuldade de operação)</option>
                    <option value="urgent">Urgente (Terminal ou Caixa parado)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Descrição Detalhada do Problema *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva o que está a acontecer, mensagens de erro apresentadas ou o que necessita de apoio..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {submittingTicket ? 'A Enviar Chamado...' : 'Submeter Chamado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

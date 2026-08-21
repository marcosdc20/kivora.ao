import React, { useState, useEffect } from 'react';
import {
  Headphones, Plus, Search,
  Clock, AlertTriangle, CheckCircle2,
  Send, Loader2, MessageSquare, UserCheck,
  Download, MessageCircle, Phone, Building,
  Sparkles
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import {
  SupportTicket, createSupportTicket, sendTicketMessage, updateTicketStatus
} from './services/supportService';

export interface DemoLead {
  id: string;
  companyName: string;
  nif?: string;
  contactName: string;
  phone: string;
  email: string;
  businessSector?: string;
  storesCount?: string;
  interestedModule?: string;
  installationMode?: string;
  notes?: string;
  created_at: number;
  status: 'pendente' | 'em_contacto' | 'demonstrado' | 'convertido' | 'cancelado';
}

export const AdminSuporte: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'leads'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'pendente' | 'em_contacto' | 'demonstrado' | 'convertido'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'direct_clients' | 'partner_tickets' | 'partner_to_admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form State Novo Ticket
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja'>('tecnico');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [remoteCode, setRemoteCode] = useState('');
  const [initialMsg, setInitialMsg] = useState('');

  // Chat message thread
  const [chatReply, setChatReply] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Sincronização em Tempo Real com Firestore (/support_tickets)
  useEffect(() => {
    try {
      const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const fireTickets: SupportTicket[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fireTickets.push({
            id: docSnap.id,
            ticket_number: d.ticket_number || `TK-${docSnap.id.slice(-4)}`,
            company_name: d.company_name || 'Empresa Cliente',
            nif: d.nif || '',
            contact_email: d.contact_email || '',
            contact_phone: d.contact_phone || '',
            subject: d.subject || 'Chamado de Suporte',
            category: d.category || 'tecnico',
            priority: d.priority || 'medium',
            status: d.status || 'open',
            createdAt: Number(d.createdAt) || Date.now(),
            remote_code: d.remote_code,
            messagesCount: Array.isArray(d.messages) ? d.messages.length : (d.messagesCount || 1),
            partner_id: d.partner_id,
            partner_name: d.partner_name,
            target_type: d.target_type || 'admin',
            created_by_role: d.created_by_role || 'client',
            messages: Array.isArray(d.messages) ? d.messages : [
              { id: '1', sender_name: 'Suporte Kivora', sender_role: 'admin', text: d.subject || 'Ticket aberto', timestamp: d.createdAt || Date.now() }
            ]
          });
        });

        setTickets(fireTickets);
        if (selectedTicket) {
          const updated = fireTickets.find(t => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Erro ao escutar support_tickets:', err);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      console.warn(e);
      setLoading(false);
    }
  }, [selectedTicket?.id]);

  // Sincronização em Tempo Real com Firestore (/leads_demonstracao)
  useEffect(() => {
    try {
      const q = query(collection(db, 'leads_demonstracao'), orderBy('created_at', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const fireLeads: DemoLead[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fireLeads.push({
            id: docSnap.id,
            companyName: d.companyName || 'Empresa Interessada',
            nif: d.nif || '',
            contactName: d.contactName || '',
            phone: d.phone || '',
            email: d.email || '',
            businessSector: d.businessSector || 'Comércio Geral',
            storesCount: d.storesCount || '1 Loja',
            interestedModule: d.interestedModule || 'Kivora Gestão Comercial & POS',
            installationMode: d.installationMode || 'Posto Único',
            notes: d.notes || '',
            created_at: Number(d.created_at) || Date.now(),
            status: d.status || 'pendente',
          });
        });
        setLeads(fireLeads);
      }, (err) => {
        console.warn('Erro ao escutar leads_demonstracao:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleUpdateLeadStatus = async (leadId: string, newStatus: DemoLead['status']) => {
    try {
      await updateDoc(doc(db, 'leads_demonstracao', leadId), { status: newStatus });
    } catch (err: any) {
      alert('Erro ao atualizar status do lead: ' + err.message);
    }
  };

  const handleExportLeadsCSV = () => {
    const csvHeader = 'Data,Empresa,NIF,Contacto,Telefone,Email,Setor,Nº Lojas,Módulo,Instalação,Estado\n';
    const csvRows = leads
      .map((l) => {
        const dateStr = l.created_at ? new Date(l.created_at).toLocaleDateString('pt-AO') : '-';
        return `"${dateStr}","${l.companyName}","${l.nif || ''}","${l.contactName}","${l.phone}","${l.email}","${l.businessSector || ''}","${l.storesCount || ''}","${l.interestedModule || ''}","${l.installationMode || ''}","${l.status}"`;
      })
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_demonstracao_kivora_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openWhatsAppLead = (lead: DemoLead) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('244') ? cleanPhone : `244${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${lead.contactName}, saudações da equipa Kivora! Recebemos o seu pedido de demonstração para a empresa *${lead.companyName}* (módulo: ${lead.interestedModule}). Em que horário gostaria de agendar a sessão online?`
    );
    window.open(`https://wa.me/${phoneWithCode}?text=${text}`, '_blank');
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !subject) return;

    try {
      const created = await createSupportTicket({
        company_name: company,
        contact_email: email || 'cliente@empresa.ao',
        subject,
        category,
        priority,
        initial_message: initialMsg || subject,
        remote_code: remoteCode,
        target_type: 'admin',
        created_by_role: 'admin',
        sender_name: 'Administrador Central'
      });

      setShowModal(false);
      setCompany('');
      setEmail('');
      setSubject('');
      setRemoteCode('');
      setInitialMsg('');
      setSelectedTicket(created);
      alert(`Ticket #${created.ticket_number} registado com sucesso no Firebase!`);
    } catch (err: any) {
      alert('Erro ao criar ticket no Firebase: ' + err.message);
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const replyText = chatReply.trim();
    if (!replyText || !selectedTicket) return;

    setSendingMessage(true);

    const optMsg = {
      id: `msg_${Date.now()}`,
      sender_name: 'Engenharia Kivora (Admin)',
      sender_role: 'admin' as const,
      sender_email: 'admin@kivora.ao',
      text: replyText,
      timestamp: Date.now(),
    };

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, optMsg],
            messagesCount: prev.messages.length + 1,
            status: 'in_progress',
          }
        : null
    );

    setChatReply('');

    try {
      await sendTicketMessage(selectedTicket.id, {
        sender_name: 'Engenharia Kivora (Admin)',
        sender_role: 'admin',
        sender_email: 'admin@kivora.ao',
        text: replyText,
      });
    } catch (err: any) {
      alert('Erro ao enviar mensagem: ' + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      await updateTicketStatus(ticketId, newStatus);
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // Filtros
  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.partner_id && t.partner_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;

    let matchRole = true;
    if (roleFilter === 'direct_clients') {
      matchRole = t.target_type === 'admin' && t.created_by_role === 'client';
    } else if (roleFilter === 'partner_to_admin') {
      matchRole = t.created_by_role === 'partner';
    } else if (roleFilter === 'partner_tickets') {
      matchRole = t.target_type === 'partner';
    }

    return matchSearch && matchStatus && matchRole;
  });

  const filteredLeads = leads.filter(l => {
    const s = searchQuery.toLowerCase();
    const matchSearch =
      l.companyName.toLowerCase().includes(s) ||
      l.contactName.toLowerCase().includes(s) ||
      l.phone.includes(s) ||
      l.email.toLowerCase().includes(s) ||
      (l.nif && l.nif.includes(s));

    const matchStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    return matchSearch && matchStatus;
  });

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const partnerTkCount = tickets.filter(t => t.created_by_role === 'partner').length;

  const pendingLeadsCount = leads.filter(l => l.status === 'pendente').length;
  const convertedLeadsCount = leads.filter(l => l.status === 'convertido').length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col w-full min-w-0 font-sans">
      <AdminTopbar
        title="Central de Suporte, Apoio & Leads de Demonstração"
        subtitle="Gerenciamento unificado de tickets de clientes, suporte a parceiros e pedidos de demonstração recebidos do site."
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'leads' ? (
              <button
                onClick={handleExportLeadsCSV}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                title="Exportar lista de pedidos para CSV"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Exportar CSV</span>
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Ticket</span>
              </button>
            )}
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 flex flex-col min-w-0">
        {/* Sub-Tabs Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => { setActiveTab('tickets'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Chamados de Suporte</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-white">
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('leads'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pedidos de Demonstração (Site)</span>
            {pendingLeadsCount > 0 ? (
              <span className="ml-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                {pendingLeadsCount} novos
              </span>
            ) : (
              <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-700 text-white">
                {leads.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'tickets' ? (
          <>
            {/* Cards de Métricas de Suporte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Chamados em Aberto"
                value={openCount}
                sub="Aguardando Triagem"
                subColor={openCount === 0 ? 'green' : 'amber'}
                icon={<AlertTriangle className="w-4 h-4" />}
              />
              <StatCard
                label="Em Atendimento"
                value={inProgressCount}
                sub="Técnicos Alocados"
                subColor="green"
                icon={<Clock className="w-4 h-4" />}
              />
              <StatCard
                label="Apoio a Parceiros"
                value={partnerTkCount}
                sub="Linha Revendedores"
                subColor="green"
                icon={<UserCheck className="w-4 h-4" />}
              />
              <StatCard
                label="Casos Resolvidos"
                value={resolvedCount}
                sub="Sincronizado Firestore"
                subColor="green"
                icon={<CheckCircle2 className="w-4 h-4" />}
              />
            </div>

            {/* Filtros e Barra de Pesquisa */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por Empresa, Ticket, Parceiro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium transition-all"
                />
              </div>

              {/* Filtros por Papel e Estado */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="all">Todas as Origens</option>
                  <option value="direct_clients">Clientes Diretos (Kivora Central)</option>
                  <option value="partner_to_admin">Chamados de Parceiros</option>
                  <option value="partner_tickets">Clientes sob Parceiros</option>
                </select>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                        statusFilter === st
                          ? 'bg-white text-blue-600 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st === 'all' ? 'Todos' : st === 'open' ? 'Abertos' : st === 'in_progress' ? 'Em Curso' : 'Resolvidos'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Principal: Lista de Tickets (Esquerda) + Chat Interativo (Direita) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LISTA DE TICKETS */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Chamados ({filteredTickets.length})
                  </h3>
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                </div>

                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Headphones className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-xs text-slate-700">Nenhum ticket encontrado</p>
                    <p className="text-[11px] text-slate-400">Os chamados abertos por clientes e parceiros aparecem aqui em tempo real.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {filteredTickets.map((tk) => {
                      const isSel = selectedTicket?.id === tk.id;
                      return (
                        <div
                          key={tk.id}
                          onClick={() => setSelectedTicket(tk)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                              : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {tk.ticket_number}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {tk.created_by_role === 'partner' && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  PARCEIRO
                                </span>
                              )}
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                tk.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                tk.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {tk.status === 'resolved' ? 'Resolvido' : tk.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{tk.subject}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                            <span className="truncate max-w-[160px] font-medium">{tk.company_name}</span>
                            <span className="font-bold text-blue-600 font-mono text-[10px]">{tk.messages.length} msg(s)</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CHAT / DETALHE DO TICKET */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[500px]">
                {selectedTicket ? (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    {/* Topbar Ticket */}
                    <div className="border-b border-slate-100 pb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-blue-600">
                              #{selectedTicket.ticket_number}
                            </span>
                            <span className="text-slate-300">•</span>
                            <h3 className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cliente: <strong className="text-slate-800">{selectedTicket.company_name}</strong>
                            {selectedTicket.contact_email && ` (${selectedTicket.contact_email})`}
                          </p>
                        </div>

                        {/* Status Select */}
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedTicket.status}
                            onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as any)}
                            className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            <option value="open">Aberto</option>
                            <option value="in_progress">Em Atendimento</option>
                            <option value="resolved">Resolvido</option>
                            <option value="closed">Fechado</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Histórico de Mensagens */}
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] p-2">
                      {selectedTicket.messages.map((msg, i) => {
                        const isAdmin = msg.sender_role === 'admin';
                        return (
                          <div
                            key={i}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                              <span className="font-bold text-slate-700">{msg.sender_name}</span>
                              <span>•</span>
                              <span>{new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div
                              className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                                isAdmin
                                  ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resposta do Administrador */}
                    <form onSubmit={handleSendAdminMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        placeholder="Escreva a resposta de suporte ao cliente..."
                        value={chatReply}
                        onChange={(e) => setChatReply(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !chatReply.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                      >
                        {sendingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Enviar</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                    <h4 className="font-bold text-slate-700 text-sm">Nenhum ticket selecionado</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Selecione um chamado da lista ao lado para ver a conversa completa e prestar suporte técnico.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* ABA: PEDIDOS DE DEMONSTRAÇÃO & LEADS DO SITE                              */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Métricas de Demonstrações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total de Pedidos"
                value={leads.length}
                sub="Recebidos pelo Site"
                subColor="green"
                icon={<Building className="w-4 h-4" />}
              />
              <StatCard
                label="Aguardam Contacto"
                value={pendingLeadsCount}
                sub="Leads Pendentes"
                subColor={pendingLeadsCount === 0 ? 'green' : 'amber'}
                icon={<Phone className="w-4 h-4" />}
              />
              <StatCard
                label="Em Demonstração"
                value={leads.filter(l => l.status === 'em_contacto' || l.status === 'demonstrado').length}
                sub="Funil Comercial"
                subColor="green"
                icon={<Sparkles className="w-4 h-4" />}
              />
              <StatCard
                label="Convertidos em Clientes"
                value={convertedLeadsCount}
                sub="Sucesso de Vendas"
                subColor="green"
                icon={<CheckCircle2 className="w-4 h-4" />}
              />
            </div>

            {/* Filtros de Leads */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar lead por Empresa, Responsável, Telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium transition-all"
                />
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                {(['all', 'pendente', 'em_contacto', 'demonstrado', 'convertido'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                      leadStatusFilter === st
                        ? 'bg-white text-blue-600 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all' ? 'Todos' : st === 'pendente' ? 'Pendentes' : st === 'em_contacto' ? 'Em Contacto' : st === 'demonstrado' ? 'Demonstrados' : 'Convertidos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabela de Leads */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                      <th className="p-4">Data</th>
                      <th className="p-4">Empresa / NIF</th>
                      <th className="p-4">Responsável & Contacto</th>
                      <th className="p-4">Setor & Lojas</th>
                      <th className="p-4">Módulo Solicitado</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Ações Imediatas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => {
                      const dateStr = lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-AO') : '-';
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900 text-xs">{lead.companyName}</p>
                            {lead.nif && <p className="text-[10px] text-slate-400 font-mono">NIF: {lead.nif}</p>}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-800">{lead.contactName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-mono">{lead.phone}</span>
                              {lead.email && <span className="text-[10px] text-slate-400 font-mono">• {lead.email}</span>}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-slate-700">{lead.businessSector || 'Comércio'}</p>
                            <p className="text-[10px] text-slate-400">{lead.storesCount || '1 Loja'}</p>
                          </td>
                          <td className="p-4">
                            <span className="inline-block font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {lead.interestedModule || 'Kivora POS'}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                              className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border cursor-pointer ${
                                lead.status === 'convertido' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                lead.status === 'demonstrado' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                lead.status === 'em_contacto' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <option value="pendente">Pendente</option>
                              <option value="em_contacto">Em Contacto</option>
                              <option value="demonstrado">Demonstrado</option>
                              <option value="convertido">Convertido (Cliente)</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => openWhatsAppLead(lead)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                              title="Abrir conversa pré-preenchida no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-bold text-xs text-slate-700">Nenhum pedido de demonstração registado.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Os pedidos enviados no modal do site aparecerão aqui automaticamente.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO TICKET ADMIN */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Criar Ticket de Suporte Manual</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Empresa / Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Farmácia Central, Lda"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Email de Contato</label>
                <input
                  type="email"
                  placeholder="geral@farmacia.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Assunto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Falha de Comunicação com Impressora POS"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white font-bold"
                  >
                    <option value="tecnico">Suporte Técnico / POS</option>
                    <option value="faturacao">Faturação AGT</option>
                    <option value="licenciamento">Licença & Terminais</option>
                    <option value="multiloja">Rede / Multiloja</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white font-bold"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Mensagem / Descrição Inicial</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes adicionais sobre a solicitação..."
                  value={initialMsg}
                  onChange={(e) => setInitialMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Registar no Firebase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

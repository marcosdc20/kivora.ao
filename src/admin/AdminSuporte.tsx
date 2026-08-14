import React, { useState, useEffect } from 'react';
import {
  Headphones, Plus, Search, Monitor,
  Clock, AlertTriangle, CheckCircle2,
  Send, X, Loader2
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  company_name: string;
  contact_email: string;
  subject: string;
  category: 'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: number;
  remote_code?: string;
  messagesCount: number;
}

export const AdminSuporte: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja'>('tecnico');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [remoteCode, setRemoteCode] = useState('');

  // Chat message thread
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Suporte Kivora', text: 'Linha de apoio ao cliente ativa. Indique como podemos ajudar.', time: '09:00' }
  ]);

  // Sincronização em Tempo Real com Firestore (/support_tickets)
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'support_tickets'), (snapshot) => {
        const fireTickets: SupportTicket[] = [];
        let count = 1;
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const num = String(count++).padStart(4, '0');
          fireTickets.push({
            id: docSnap.id,
            ticket_number: d.ticket_number || `TK-2026/${num}`,
            company_name: d.company_name || d.company || 'Empresa Cliente',
            contact_email: d.contact_email || d.email || '',
            subject: d.subject || d.assunto || 'Chamado de Suporte',
            category: d.category || 'tecnico',
            priority: d.priority || 'medium',
            status: d.status || 'open',
            createdAt: Number(d.createdAt) || Number(d.created_at) || Date.now(),
            remote_code: d.remote_code || d.anydesk_id || undefined,
            messagesCount: Number(d.messagesCount) || 1,
          });
        });

        setTickets(fireTickets);
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
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !subject) return;

    const tkId = `tk_${Date.now()}`;
    const tkNum = `TK-2026/${String(tickets.length + 1).padStart(4, '0')}`;

    try {
      await setDoc(doc(db, 'support_tickets', tkId), {
        ticket_number: tkNum,
        company_name: company,
        contact_email: email || 'cliente@empresa.ao',
        subject,
        category,
        priority,
        status: 'open',
        createdAt: Date.now(),
        remote_code: remoteCode || null,
        messagesCount: 1
      }, { merge: true });

      setShowModal(false);
      setCompany('');
      setEmail('');
      setSubject('');
      setRemoteCode('');
      alert(`Ticket #${tkNum} registado com sucesso no Firebase!`);
    } catch (err: any) {
      alert('Erro ao criar ticket no Firebase: ' + err.message);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = {
      sender: 'Suporte Kivora (Você)',
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setChatMessage('');
  };

  const handleUpdateStatus = async (id: string, status: SupportTicket['status']) => {
    try {
      await updateDoc(doc(db, 'support_tickets', id), {
        status
      });

      setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (err: any) {
      alert('Erro ao atualizar status do ticket: ' + err.message);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const s = searchQuery.toLowerCase();
    const matchesSearch = t.company_name.toLowerCase().includes(s) ||
      t.subject.toLowerCase().includes(s) ||
      t.ticket_number.toLowerCase().includes(s);
    return matchesStatus && matchesSearch;
  });

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const urgentCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Helpdesk & Suporte Técnico Remoto"
        subtitle="Atendimento a empresas, chamados urgentes e conexão AnyDesk/RustDesk"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Novo Ticket</span>
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            label="Tickets Abertos"
            value={openCount}
            sub="Aguardam triagem"
            subColor="amber"
            icon={<Headphones className="w-4 h-4" />}
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Urgentes"
            value={urgentCount}
            sub="Faturação & Retenção"
            subColor="red"
            icon={<AlertTriangle className="w-4 h-4" />}
            iconBg="bg-red-50 text-red-600"
          />
          <StatCard
            label="Em Atendimento"
            value={inProgressCount}
            sub="Sessões remotas ativas"
            subColor="green"
            icon={<Clock className="w-4 h-4" />}
            iconBg="bg-purple-50 text-purple-600"
          />
          <StatCard
            label="Resolvidos"
            value={resolvedCount}
            sub="Taxa de resolução 98%"
            subColor="green"
            icon={<CheckCircle2 className="w-4 h-4" />}
            iconBg="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos os Tickets' },
              { id: 'open', label: 'Abertos' },
              { id: 'in_progress', label: 'Em Atendimento' },
              { id: 'resolved', label: 'Resolvidos' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                  statusFilter === f.id
                    ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar por assunto, empresa, ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Tabela de Tickets */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <th className="p-4">N.º Chamado</th>
                <th className="p-4">Empresa / Email</th>
                <th className="p-4">Assunto & Categoria</th>
                <th className="p-4">Código Remoto</th>
                <th className="p-4">Prioridade</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>A sincronizar chamados do Firebase...</span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Headphones className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700">Nenhum chamado de suporte encontrado</p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      Os chamados abertos pelas empresas clientes e pelo site aparecerão aqui em tempo real.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((tk) => (
                  <tr key={tk.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">{tk.ticket_number}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{tk.company_name}</p>
                      <p className="text-slate-400 text-[10px]">{tk.contact_email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{tk.subject}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">
                        {tk.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {tk.remote_code ? (
                        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          {tk.remote_code}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Sem código</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        tk.priority === 'urgent' ? 'bg-red-50 text-red-700 border border-red-200' :
                        tk.priority === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        tk.priority === 'medium' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {tk.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tk.status === 'open' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        tk.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {tk.status === 'open' ? 'Aberto' : tk.status === 'in_progress' ? 'Em Atendimento' : 'Resolvido'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(tk)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                      >
                        Atender
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Atendimento Interativo com Chat */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedTicket.ticket_number}
                  </span>
                  <h3 className="text-base font-black text-slate-900">{selectedTicket.subject}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Empresa: <strong>{selectedTicket.company_name}</strong> • {selectedTicket.contact_email}
                </p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Código de Acesso Remoto */}
            {selectedTicket.remote_code && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900">Código AnyDesk / RustDesk do Cliente:</span>
                </div>
                <span className="font-mono text-sm font-black text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-200 select-all">
                  {selectedTicket.remote_code}
                </span>
              </div>
            )}

            {/* Mensagens de Suporte */}
            <div className="bg-slate-50 rounded-2xl p-4 h-56 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-xl max-w-[85%] ${
                  m.sender.includes('Você') || m.sender.includes('Suporte')
                    ? 'ml-auto bg-blue-600 text-white rounded-br-none'
                    : 'mr-auto bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                }`}>
                  <p className="font-bold text-[10px] opacity-75 mb-1">{m.sender} • {m.time}</p>
                  <p className="font-medium">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Caixa de Envio de Resposta */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Escrever resposta para o cliente..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>

            {/* Ações de Estado */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Alterar Estado:</span>
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg"
                >
                  Em Atendimento
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg"
                >
                  Marcar Resolvido
                </button>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1"
              >
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Novo Ticket */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Registar Novo Chamado</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Pastelaria Miramar, Lda"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Assunto / Descrição do Problema</label>
                <input
                  type="text"
                  required
                  placeholder="Configurar gaveta de dinheiro e scanner"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                  >
                    <option value="tecnico">Técnico / Hardware</option>
                    <option value="faturacao">Faturação AGT</option>
                    <option value="licenciamento">Licenças & Postos</option>
                    <option value="multiloja">Multiloja / Sincronia</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Código RustDesk / AnyDesk</label>
                <input
                  type="text"
                  placeholder="912 345 678"
                  value={remoteCode}
                  onChange={(e) => setRemoteCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                >
                  Abrir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { AdminRelatorios } from './AdminRelatorios';
export { AdminComunicacao } from './AdminComunicacao';
export { AdminUtilizadores } from './AdminUtilizadores';
export { AdminAuditoria } from './AdminAuditoria';
export { AdminPlanos } from './AdminPlanos';
export { AdminConfiguracoes } from './AdminConfiguracoes';

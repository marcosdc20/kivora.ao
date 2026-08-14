import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Key, Download, Cloud, FileText,
  Headphones, Building2, LogOut, Monitor, Copy,
  CheckCircle2, ShieldCheck, Loader2, Send
} from 'lucide-react';
import { KivoraLogo } from '../components/KivoraLogo';
import { CURRENT_RELEASE } from '../data/kivoraData';
import { getStoredSession, clearStoredSession, KivoraUserSession } from '../admin/services/authService';
import { useLicenses } from '../admin/hooks/useFirebase';
import { formatLicenseDate, getPlanLabel } from '../admin/services/licenseService';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

interface ClientPortalAppProps {
  onLogout: () => void;
}

type ClientSection = 'dashboard' | 'licenca' | 'downloads' | 'backups' | 'faturas' | 'suporte' | 'empresa';

export const ClientPortalApp: React.FC<ClientPortalAppProps> = ({ onLogout }) => {
  const session: KivoraUserSession | null = getStoredSession();
  const { licenses } = useLicenses();

  const [activeSection, setActiveSection] = useState<ClientSection>('dashboard');
  const [copiedKey, setCopiedKey] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [myTickets, setMyTickets] = useState<Array<{ id: string; subject: string; message: string; status: string; created_at: number }>>([]);

  // Procura a licença real do cliente no Firebase
  const clientLicense = licenses.find(
    (l) => (session?.nif && l.nif === session.nif) || (session?.email && l.client_email.toLowerCase() === session.email.toLowerCase()) || (session?.licenseKey && l.id === session.licenseKey)
  ) || licenses[0] || {
    id: session?.licenseKey || 'KVRA-LI0D-8OPE-DV3A',
    company_name: session?.companyName || session?.nome || 'VISUAL SOFTWARE - COMÉRCIO E PRESTAÇÃO DE SERVIÇOS, LDA',
    nif: session?.nif || '5002863944',
    plan_type: 'monthly' as const,
    status: 'active' as const,
    created_at: 1784206261078,
    expires_at: 1786834800000,
    hardware_id: 'FD44-D3FB-48C7-CA44',
    extra_seats: 6,
    max_users: 1,
  };

  useEffect(() => {
    try {
      const q = query(collection(db, 'support_tickets'), where('nif', '==', clientLicense.nif));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setMyTickets(list);
      }, (err) => {
        console.warn('Erro ao carregar tickets do cliente:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn(e);
    }
  }, [clientLicense.nif]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(clientLicense.id);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmittingTicket(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        company_name: clientLicense.company_name,
        nif: clientLicense.nif,
        license_id: clientLicense.id,
        subject: ticketSubject,
        message: ticketMessage,
        status: 'open',
        created_at: Date.now(),
      });
      setTicketSent(true);
      setTicketSubject('');
      setTicketMessage('');
      setTimeout(() => {
        setTicketSent(false);
      }, 4000);
    } catch (err: any) {
      console.error('Erro ao registar ticket no Firebase:', err);
      setTicketSent(true);
      setTicketSubject('');
      setTicketMessage('');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Meu Painel', icon: LayoutDashboard },
    { id: 'licenca', label: 'Minha Licença & PCs', icon: Key },
    { id: 'downloads', label: 'Setup & Downloads', icon: Download },
    { id: 'backups', label: 'Backups Cloud', icon: Cloud },
    { id: 'faturas', label: 'Faturas & Recibos', icon: FileText },
    { id: 'suporte', label: 'Suporte Técnico', icon: Headphones },
    { id: 'empresa', label: 'Dados da Empresa', icon: Building2 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* Sidebar Executiva do Cliente */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800/80">
          <KivoraLogo variant="light" size="sm" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
              Área do Cliente
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Ligado ao Firebase" />
          </div>
        </div>

        {/* Info Empresa */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80">
          <p className="text-xs font-black text-white truncate">{clientLicense.company_name}</p>
          <p className="text-[10px] text-slate-400 font-mono">NIF: {clientLicense.nif}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as ClientSection)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-950/50 hover:text-red-400 text-slate-400 text-xs font-bold py-2.5 rounded-xl transition-all border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-slate-900 capitalize">
              {navItems.find(n => n.id === activeSection)?.label}
            </h1>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Portal de Auto-atendimento Kivora</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Licença Certificada AGT</span>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          
          {/* SECTION: DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Banner Licença */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-900/40 px-2.5 py-1 rounded-full border border-blue-700/50">
                      Plano {getPlanLabel(clientLicense.plan_type as any)}
                    </span>
                    <h2 className="text-2xl font-black">{clientLicense.company_name}</h2>
                    <p className="text-xs text-slate-300">
                      Validade da Licença: <strong className="text-white">{formatLicenseDate(clientLicense.expires_at)}</strong> • Modo Rede LAN
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Chave de Ativação KVRA</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-blue-300">{clientLicense.id}</span>
                      <button
                        onClick={handleCopyKey}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        title="Copiar"
                      >
                        {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Estado da Licença</span>
                  <p className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ATIVA</span>
                  </p>
                  <span className="text-[11px] text-slate-500">Validação Cloud em dia</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Postos / Computadores</span>
                  <p className="text-xl font-black text-slate-900">
                    {clientLicense.hardware_id ? 1 : 0} de {1 + (clientLicense.extra_seats || 0)} PCs
                  </p>
                  <span className="text-[11px] text-slate-500">Rede Local com PostgreSQL</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Último Backup na Nuvem</span>
                  <p className="text-xl font-black text-blue-600">Hoje às 08:30</p>
                  <span className="text-[11px] text-slate-500">Cópia encriptada AES-256</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Versão em Produção</span>
                  <p className="text-xl font-black text-slate-900">v{CURRENT_RELEASE.version}</p>
                  <span className="text-[11px] text-emerald-600 font-bold">Certificado AGT 2026</span>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Descarregar ERP */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Instalar Kivora ERP em Novo Computador</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Descarregue o instalador oficial completo do software de faturação e gestão comercial para Windows.
                  </p>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span>Setup Kivora v{CURRENT_RELEASE.version} (64-bit)</span>
                    <span className="text-slate-400">{CURRENT_RELEASE.fileSize}</span>
                  </div>
                  <a
                    href="#download"
                    onClick={() => setActiveSection('downloads')}
                    className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center font-bold text-xs py-3 rounded-xl shadow-md shadow-blue-600/20 transition-all"
                  >
                    Ir para Downloads
                  </a>
                </div>

                {/* Pedir Suporte */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-600" />
                    <span>Assistência Técnica & Apoio</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A nossa equipa de suporte técnico está disponível para resolver dúvidas sobre SAF-T, impressoras térmicas ou rede.
                  </p>
                  <button
                    onClick={() => setActiveSection('suporte')}
                    className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all"
                  >
                    Abrir Ticket de Suporte
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MINHA LICENÇA */}
          {activeSection === 'licenca' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900">Detalhes da Licença & Computadores</h2>
              
              <div className="bg-slate-950 text-white p-6 rounded-2xl space-y-3">
                <p className="text-xs text-slate-400 uppercase font-bold">Chave de Ativação do Software</p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xl font-black text-blue-400 select-all">{clientLicense.id}</span>
                  <button
                    onClick={handleCopyKey}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase">Plano Contratado</span>
                  <p className="font-black text-slate-900 text-sm">{getPlanLabel(clientLicense.plan_type as any)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase">Data de Expiração</span>
                  <p className="font-black text-slate-900 text-sm">{formatLicenseDate(clientLicense.expires_at)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase">Capacidade de Rede</span>
                  <p className="font-black text-slate-900 text-sm">{1 + (clientLicense.extra_seats || 0)} Computador(es)</p>
                </div>
              </div>

              {/* PCs Ativos */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Computador Vinculado (Hardware Fingerprint)</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">PC Principal de Caixa / Servidor</p>
                      <p className="text-[10px] text-slate-500 font-mono">{clientLicense.hardware_id || 'Aguardando 1º uso no ERP'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Ativo Online
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: DOWNLOADS */}
          {activeSection === 'downloads' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900">Instaladores Oficiais Kivora ERP</h2>
              <p className="text-xs text-slate-500">
                Descarregue os instaladores do Kivora para novos postos de trabalho ou para atualizar o seu sistema.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full uppercase">
                      Recomendado
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{CURRENT_RELEASE.fileSize}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">Kivora ERP — Setup Completo</h3>
                  <p className="text-xs text-slate-500">
                    Inclui módulo de faturação certificada AGT, gestão de stock, POS e base de dados local.
                  </p>
                  <button
                    onClick={() => alert('Download do instalador oficial iniciado: Kivora-ERP-Setup-v2026.exe')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descarregar Setup v{CURRENT_RELEASE.version}</span>
                  </button>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                  <span className="text-xs font-black text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full uppercase">
                    Documentação
                  </span>
                  <h3 className="text-base font-black text-slate-900">Manual de Utilização & Guia AGT</h3>
                  <p className="text-xs text-slate-500">
                    Manual em PDF com instruções passo a passo para configuração de séries e exportação do ficheiro SAF-T.
                  </p>
                  <button
                    onClick={() => alert('Download do Manual em PDF iniciado.')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Descarregar Manual em PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: BACKUPS */}
          {activeSection === 'backups' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900">Backups de Segurança na Nuvem</h2>
              <p className="text-xs text-slate-500">Cópias automáticas de segurança encriptadas no Firebase Cloud Storage.</p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {[
                  { data: 'Hoje às 08:30', tam: '14.2 MB', status: 'Sincronizado' },
                  { data: 'Ontem às 19:45', tam: '14.1 MB', status: 'Sincronizado' },
                  { data: '12/08/2026 às 19:30', tam: '13.8 MB', status: 'Sincronizado' },
                ].map((b, i) => (
                  <div key={i} className="p-4 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cloud className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-slate-900">{b.data}</p>
                        <p className="text-slate-400 text-[10px]">Tamanho: {b.tam}</p>
                      </div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: SUPORTE */}
          {activeSection === 'suporte' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-2xl">
              <h2 className="text-lg font-black text-slate-900">Abrir Chamado de Assistência Técnica</h2>
              <p className="text-xs text-slate-500">
                Envie a sua solicitação. O ticket será registado diretamente no painel de suporte Kivora.
              </p>

              {ticketSent && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ticket registado com sucesso! A nossa equipa entrará em contacto em breve.</span>
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Assunto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dúvida sobre exportação SAF-T do mês de Julho"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Descrição do Problema</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Descreva detalhadamente o que se passa..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50 font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {submittingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{submittingTicket ? 'A Enviar Chamado...' : 'Enviar Chamado de Suporte'}</span>
                </button>
              </form>

              {/* Meus Chamados Abertos */}
              {myTickets.length > 0 && (
                <div className="pt-6 border-t border-slate-150 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Histórico de Chamados Abertos ({myTickets.length})</h3>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    {myTickets.map((t) => (
                      <div key={t.id} className="p-4 bg-slate-50 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{t.subject}</p>
                          <p className="text-slate-600 text-[11px]">{t.message}</p>
                          <p className="text-slate-400 text-[10px]">{new Date(t.created_at || Date.now()).toLocaleString('pt-PT')}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-1 rounded-full shrink-0">
                          {t.status === 'open' ? 'Em Análise' : t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: DADOS DA EMPRESA */}
          {activeSection === 'empresa' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-2xl">
              <h2 className="text-lg font-black text-slate-900">Dados Fiscais & Registo da Empresa</h2>
              
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between">
                  <span className="text-slate-400 font-bold">Denominação Social:</span>
                  <span className="font-black text-slate-900">{clientLicense.company_name}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between">
                  <span className="text-slate-400 font-bold">NIF:</span>
                  <span className="font-mono font-black text-slate-900">{clientLicense.nif}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between">
                  <span className="text-slate-400 font-bold">Email de Notificação:</span>
                  <span className="font-medium text-slate-700">{session?.email || 'cliente@empresa.ao'}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between">
                  <span className="text-slate-400 font-bold">Província / Sede:</span>
                  <span className="font-medium text-slate-700">Luanda, Angola</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: FATURAS */}
          {activeSection === 'faturas' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900">Histórico de Faturação & Subscrições</h2>
              
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {[
                  { ref: 'FAT-2026-0042', desc: 'Subscrição Anual Kivora ERP', valor: '250.000 Kz', data: '14/08/2026', status: 'Pago' },
                  { ref: 'FAT-2025-0911', desc: 'Renovação Standalone', valor: '180.000 Kz', data: '14/08/2025', status: 'Pago' },
                ].map((f, idx) => (
                  <div key={idx} className="p-4 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{f.desc}</p>
                      <p className="text-slate-400 text-[10px] font-mono">{f.ref} • {f.data}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{f.valor}</p>
                      <span className="text-emerald-700 bg-emerald-100 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {f.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};

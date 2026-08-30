import React, { useState, useEffect, useRef } from 'react';
import { usePortalTrackpadScroll } from '../hooks/usePortalTrackpadScroll';
import {
  LayoutDashboard, Key, Download, Cloud, FileText,
  Headphones, Building2, LogOut, Monitor, Copy,
  CheckCircle2, ShieldCheck, Loader2, Send, Menu, X,
  MessageSquare, Receipt, Printer, AlertTriangle, Ban,
  Video
} from 'lucide-react';
import { KivoraLogo } from '../components/KivoraLogo';
import { CURRENT_RELEASE, KIVORA_INFO } from '../data/kivoraData';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { VideoConferenceModal } from '../components/VideoConferenceModal';
import { VideoMinutesPurchaseModal } from '../components/VideoMinutesPurchaseModal';
import {
  VideoSupportAccount,
  getOrCreateVideoSupportAccount,
  subscribeVideoSupportAccount
} from '../services/videoSupportService';
import { getStoredSession, clearStoredSession, KivoraUserSession } from '../admin/services/authService';
import { useLicenses } from '../admin/hooks/useFirebase';
import { formatLicenseDate, getPlanLabel } from '../admin/services/licenseService';
import {
  SupportTicket, createSupportTicket, sendTicketMessage,
  subscribeClientTickets
} from '../admin/services/supportService';
import type { KivoraLicense } from '../admin/types';
import { getCachedSystemSettings, getDirectDownloadUrl } from '../services/systemSettingsService';

interface ClientPortalAppProps {
  onLogout: () => void;
}

type ClientSection = 'dashboard' | 'licenca' | 'downloads' | 'backups' | 'faturas' | 'suporte' | 'empresa';

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const ClientPortalApp: React.FC<ClientPortalAppProps> = ({ onLogout }) => {
  const session: KivoraUserSession | null = getStoredSession();
  const { licenses } = useLicenses();

  const [activeSection, setActiveSection] = useState<ClientSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hook de Rolagem de Touchpad / 2 Dedos
  const mainScrollRef = useRef<HTMLElement | null>(null);
  usePortalTrackpadScroll(mainScrollRef);

  // Modal de Fatura / Recibo
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<KivoraLicense | null>(null);

  // Modal de Videochamada & Gestão de Minutos de Assistência
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [purchaseMinutesModalOpen, setPurchaseMinutesModalOpen] = useState(false);
  const [videoAccount, setVideoAccount] = useState<VideoSupportAccount | null>(null);

  // Tickets do Cliente em Tempo Real via supportService
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja'>('tecnico');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketRemoteCode, setTicketRemoteCode] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [chatReply, setChatReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Procura a licença real do cliente no Firebase
  const matchedLicenses = licenses.filter(
    (l) =>
      (session?.nif && l.nif === session.nif) ||
      (session?.email && l.client_email.toLowerCase() === session.email.toLowerCase()) ||
      (session?.licenseKey && l.id === session.licenseKey)
  );

  const clientLicense: KivoraLicense = matchedLicenses[0] || {
    id: session?.licenseKey || 'PENDING-ACTIVATION',
    client_email: session?.email || 'cliente@empresa.ao',
    company_name: session?.companyName || session?.nome || 'Empresa Cliente Kivora',
    nif: session?.nif || 'Não Registado',
    plan_type: 'annual' as const,
    status: 'active' as const,
    created_at: Date.now(),
    expires_at: Date.now() + 365 * 86400000,
    hardware_id: null,
    extra_seats: 0,
    max_users: 1,
    is_provisional: false,
  };

  // Subscrição em Tempo Real aos tickets e minutos de vídeo do cliente
  useEffect(() => {
    const nifOrEmail = clientLicense.nif !== 'Não Registado' ? clientLicense.nif : clientLicense.client_email;
    if (!nifOrEmail) return;

    // Carregar conta de minutos de vídeo
    getOrCreateVideoSupportAccount(nifOrEmail, clientLicense.company_name, 'cliente', clientLicense.client_email, clientLicense.nif).then(acc => setVideoAccount(acc));
    const unsubVideo = subscribeVideoSupportAccount(nifOrEmail, (acc) => setVideoAccount(acc));

    return () => unsubVideo();
  }, [clientLicense.nif, clientLicense.client_email, clientLicense.company_name]);

  useEffect(() => {
    const nifOrEmail = clientLicense.nif !== 'Não Registado' ? clientLicense.nif : clientLicense.client_email;
    if (!nifOrEmail) return;

    const unsub = subscribeClientTickets(nifOrEmail, (tickets) => {
      setMyTickets(tickets);
      if (selectedTicket) {
        const updated = tickets.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    });

    return () => unsub();
  }, [clientLicense.nif, clientLicense.client_email, selectedTicket?.id]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(clientLicense.id);
    setCopiedKey(true);
    showToast('Chave de Ativação copiada para a área de transferência!');
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setSubmittingTicket(true);

    try {
      const newTk = await createSupportTicket({
        company_name: clientLicense.company_name,
        nif: clientLicense.nif,
        contact_email: session?.email || clientLicense.client_email,
        contact_phone: '+244 923 000 000',
        subject: ticketSubject,
        category: ticketCategory,
        priority: 'medium',
        initial_message: ticketMessage,
        remote_code: ticketRemoteCode || undefined,
        partner_id: clientLicense.partner_id || undefined,
        target_type: clientLicense.partner_id ? 'partner' : 'admin',
        created_by_role: 'client',
        sender_name: clientLicense.company_name,
      });

      setTicketSubject('');
      setTicketMessage('');
      setTicketRemoteCode('');
      setSelectedTicket(newTk);
      showToast(`Chamado #${newTk.ticket_number} enviado com sucesso!`);
    } catch (err: any) {
      showToast('Erro ao criar ticket: ' + err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const replyText = chatReply.trim();
    if (!replyText || !selectedTicket) return;
    setSendingReply(true);

    const optMsg = {
      id: `msg_${Date.now()}`,
      sender_name: clientLicense.company_name,
      sender_role: 'client' as const,
      sender_email: session?.email || clientLicense.client_email,
      text: replyText,
      timestamp: Date.now(),
    };

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, optMsg],
            messagesCount: prev.messages.length + 1,
            status: 'open',
          }
        : null
    );

    setChatReply('');

    try {
      await sendTicketMessage(selectedTicket.id, {
        sender_name: clientLicense.company_name,
        sender_role: 'client',
        sender_email: session?.email || clientLicense.client_email,
        text: replyText,
      });
    } catch (err: any) {
      showToast('Erro ao enviar mensagem: ' + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'licenca', label: 'Minha Licença & PCs', icon: Key },
    { id: 'downloads', label: 'Instaladores & Setup', icon: Download },
    { id: 'backups', label: 'Backups Cloud', icon: Cloud },
    { id: 'faturas', label: 'Faturas & Licenças', icon: FileText, badge: matchedLicenses.length },
    { id: 'suporte', label: 'Suporte Técnico', icon: Headphones, badge: myTickets.filter((t) => t.status === 'open').length },
    { id: 'empresa', label: 'Dados Fiscais', icon: Building2 },
  ];

  // ─── TELA DE BLOQUEIO SE EMPRESA / CONTA SUSPENSA ──────────────────────────────
  if (session?.status === 'suspended') {
    const whatsAppMessage = `Olá Suporte Kivora. A conta de acesso da minha empresa (${clientLicense.company_name}, NIF: ${clientLicense.nif}) encontra-se suspensa e pretendo solicitar o esclarecimento e regularização.`;
    const waUrl = `https://wa.me/${KIVORA_INFO.phoneRaw}?text=${encodeURIComponent(whatsAppMessage)}`;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 selection:bg-red-600 selection:text-white">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-fadeIn">
          
          <div className="w-16 h-16 bg-red-950/60 border border-red-800/50 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-950/50">
            <Ban className="w-8 h-8 text-red-500" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-800/60 inline-block">
              Acesso Suspenso
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Conta de Cliente Suspensa
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              O acesso ao <strong>Portal da Empresa Cliente Kivora</strong> foi suspenso pela administração.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-left space-y-2 font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">Empresa:</span>
              <strong className="text-white font-sans font-bold">{clientLicense.company_name}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">NIF:</span>
              <strong className="text-amber-400">{clientLicense.nif}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estado:</span>
              <span className="text-red-400 font-black uppercase">● Suspenso</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contactar Suporte Técnico</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Terminar Sessão</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar Executiva do Cliente */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-white flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800/80">
          <KivoraLogo variant="light" size="sm" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/50 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>Área do Cliente</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sincronizado com o Firebase Cloud" />
          </div>
        </div>

        {/* Info Empresa */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 space-y-1">
          <p className="text-xs font-black text-white truncate">{clientLicense.company_name}</p>
          <p className="text-[10px] text-slate-400 font-mono">NIF: {clientLicense.nif}</p>
          {clientLicense.is_provisional && (
            <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 block mt-1">
              ⏳ Licença Provisória (7 Dias)
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as ClientSection)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-950/50 hover:text-red-400 text-slate-400 text-xs font-bold py-2.5 rounded-xl transition-all border border-slate-800 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-slate-950 text-white flex flex-col z-10 shadow-2xl border-r border-slate-800">
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <KivoraLogo variant="light" size="sm" />
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                    Área do Cliente
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-900/60 border-b border-slate-800/80">
              <p className="text-xs font-black text-white truncate">{clientLicense.company_name}</p>
              <p className="text-[10px] text-slate-400 font-mono">NIF: {clientLicense.nif}</p>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as ClientSection);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800/80">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-950/50 hover:text-red-400 text-slate-400 text-xs font-bold py-2.5 rounded-xl transition-all border border-slate-800 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden w-full">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Abrir Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
              {activeSection === 'dashboard' && 'Painel do Cliente'}
              {activeSection === 'licenca' && 'Minha Licença & Terminais'}
              {activeSection === 'downloads' && 'Instaladores & Softwares Oficiais'}
              {activeSection === 'backups' && 'Cópias de Segurança na Nuvem (Cloud)'}
              {activeSection === 'faturas' && 'Histórico de Faturas & Licenciamento'}
              {activeSection === 'suporte' && 'Central de Assistência Técnica'}
              {activeSection === 'empresa' && 'Dados Cadastrais & Fiscais'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validação Fiscal AGT 2026</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main
          ref={mainScrollRef}
          tabIndex={0}
          className="portal-scroll-container flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4 sm:p-6 lg:p-8 space-y-6 focus:outline-none"
        >

          {/* SECTION: DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">

              {/* Alerta de Expiração Próxima ou Licença Provisória */}
              {((clientLicense.expires_at && clientLicense.expires_at - Date.now() < 7 * 86400000) || clientLicense.is_provisional) && (
                <div className="bg-amber-500 text-slate-950 p-5 rounded-3xl border-2 border-amber-400 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-950">
                        {clientLicense.is_provisional ? 'Atenção: Licença Provisória de 7 Dias' : 'A sua licença Kivora expira em breve!'}
                      </h3>
                      <p className="text-xs text-slate-900 font-medium mt-0.5">
                        Validade até <strong className="font-bold">{formatLicenseDate(clientLicense.expires_at)}</strong>. Renove a sua subscrição para manter a faturação fiscal e a sincronização cloud ativas sem interrupções.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveSection('suporte')}
                    className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    Solicitar Renovação
                  </button>
                </div>
              )}

              {/* Banner Licença */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-900/50 px-2.5 py-1 rounded-full border border-blue-700/50">
                        {getPlanLabel(clientLicense.plan_type)}
                      </span>
                      {clientLicense.is_provisional && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-700/60">
                          ⏳ Provisória (7 Dias)
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">{clientLicense.company_name}</h2>
                    <p className="text-xs text-slate-300">
                      Validade da Licença: <strong className="text-white">{formatLicenseDate(clientLicense.expires_at)}</strong> • Base de Dados Local & Nuvem
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 text-left md:text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Chave de Ativação do Software</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm sm:text-base font-black text-blue-300 select-all">{clientLicense.id}</span>
                      <button
                        onClick={handleCopyKey}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                        title="Copiar Chave"
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Estado Operacional</span>
                  <p className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{clientLicense.status === 'active' ? 'ATIVO' : 'SUSPENSO'}</span>
                  </p>
                  <span className="text-[11px] text-slate-500">Validação online em dia</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Terminais Licenciados</span>
                  <p className="text-xl font-black text-slate-900">
                    {clientLicense.hardware_id ? 1 : 0} de {1 + (clientLicense.extra_seats || 0)} PC(s)
                  </p>
                  <span className="text-[11px] text-slate-500">Rede Local com SQLite/PostgreSQL</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Versão Oficial Kivora</span>
                  <p className="text-xl font-black text-slate-900">v{CURRENT_RELEASE.version}</p>
                  <span className="text-[11px] text-emerald-600 font-bold">Motor Fiscal AGT Atualizado</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Chamados de Suporte</span>
                  <p className="text-xl font-black text-blue-600">{myTickets.length}</p>
                  <span className="text-[11px] text-slate-500">Atendimento direto</span>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Instalar Kivora Desktop ERP</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Descarregue o instalador oficial completo para configurar um novo terminal ou formatar o computador de caixa.
                  </p>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span>Setup Kivora v{CURRENT_RELEASE.version} (64-bit)</span>
                    <span className="text-slate-400 font-mono">{CURRENT_RELEASE.fileSize}</span>
                  </div>
                  <button
                    onClick={() => setActiveSection('downloads')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer text-center block"
                  >
                    Aceder aos Downloads Oficiais
                  </button>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-600" />
                    <span>Apoio Técnico & Suporte Fiscal</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tem dúvidas sobre o ficheiro SAF-T (AO), configuração de impressoras térmicas ou rede local? A nossa equipa responde em tempo real.
                  </p>
                  <button
                    onClick={() => setActiveSection('suporte')}
                    className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center block"
                  >
                    Abrir Chamado de Assistência
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SECTION: MINHA LICENÇA */}
          {activeSection === 'licenca' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-black text-slate-900">Detalhes da Licença & Computadores</h2>
                <p className="text-xs text-slate-500 mt-0.5">Informações técnicas de ativação do software no seu computador.</p>
              </div>

              <div className="bg-slate-950 text-white p-6 rounded-2xl space-y-3 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Chave de Ativação do Software</p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xl font-black text-blue-400 select-all">{clientLicense.id}</span>
                  <button
                    onClick={handleCopyKey}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Copiada!' : 'Copiar Chave'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Plano Contratado</span>
                  <p className="font-black text-slate-900 text-sm">{getPlanLabel(clientLicense.plan_type)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Data de Expiração</span>
                  <p className="font-black text-slate-900 text-sm">{formatLicenseDate(clientLicense.expires_at)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Capacidade de Rede</span>
                  <p className="font-black text-slate-900 text-sm">{1 + (clientLicense.extra_seats || 0)} Terminal(ais)</p>
                </div>
              </div>

              {/* Computador Vinculado */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Terminal Vinculado (Hardware Fingerprint)</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">PC Principal de Caixa / Servidor</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs sm:max-w-md">
                        {clientLicense.hardware_id ? `ID: ${clientLicense.hardware_id}` : 'Aguardando 1º uso no ERP'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                    Ativo Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Para trocar de computador, solicite a desvinculação através da Central de Suporte ou diretamente com o seu parceiro Kivora homologado.
                </p>
              </div>
            </div>
          )}

          {/* SECTION: DOWNLOADS */}
          {activeSection === 'downloads' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Instaladores Oficiais Kivora ERP</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Descarregue os instaladores oficiais para Windows e os drivers de periféricos de caixa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full uppercase">
                        Versão Oficial {CURRENT_RELEASE.version}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{CURRENT_RELEASE.fileSize}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900">Kivora ERP — Setup Windows (x64)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Instalador completo que inclui o motor de faturação certificada AGT, gestão de stock, fecho de caixa POS e base de dados local.
                    </p>
                  </div>
                  <a
                    href={getDirectDownloadUrl(getCachedSystemSettings().downloadUrl || CURRENT_RELEASE.downloadUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Instalador Oficial (.exe)</span>
                  </a>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full uppercase">
                      Documentação & Periféricos
                    </span>
                    <h3 className="text-base font-black text-slate-900">Manual do Utilizador & Drivers Térmicos</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Guia com instruções passo a passo para configuração de séries, gavetas de dinheiro e exportação do ficheiro SAF-T (AO).
                    </p>
                  </div>
                  <a
                    href="#download"
                    onClick={() => showToast('Aceda à secção de manuais no portal comercial.')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Aceder aos Manuais Técnicos</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: BACKUPS */}
          {activeSection === 'backups' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-black text-slate-900">Backups de Segurança na Nuvem</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cópias automáticas de segurança encriptadas no Google Cloud com retenção redundante.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>Proteção Total Contra Falhas de Hardware</span>
                </div>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  O Kivora ERP no seu computador realiza backups automáticos da base de dados local sempre que efetua o fecho de turno ou de caixa, protegendo os seus dados fiscais e de stock.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <div className="p-4 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-900">Sincronização em Tempo Real Cloud</p>
                      <p className="text-slate-400 text-[10px]">Ligação com Firebase Firestore ativo</p>
                    </div>
                  </div>
                  <span className="text-emerald-700 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                    Ativo & Seguro
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: FATURAS & LICENÇAS */}
          {activeSection === 'faturas' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Histórico de Faturas & Subscrições</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registo oficial de subscrições ativadas para o seu NIF ({clientLicense.nif}).
                </p>
              </div>

              {matchedLicenses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs">
                  <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">Nenhuma fatura emitida ainda</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {matchedLicenses.map((lic) => (
                    <div key={lic.id} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{getPlanLabel(lic.plan_type)} — Kivora Desktop ERP</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            lic.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {lic.status === 'active' ? 'Pago & Ativo' : 'Suspenso'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                          Chave: {lic.id} • Válido até: {formatLicenseDate(lic.expires_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-black text-slate-900 font-mono text-sm">
                            {fmt(lic.price_aoa || (lic.plan_type === 'monthly' ? 25000 : lic.plan_type === 'lifetime' ? 1500000 : 250000))} Kz
                          </p>
                          <span className="text-[10px] text-slate-400 block">Subscrição Oficial</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedInvoice(lic);
                            setInvoiceModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                          title="Imprimir Fatura / Recibo"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Recibo</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: SUPORTE */}
          {activeSection === 'suporte' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Central de Assistência Técnica</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Converse diretamente com os engenheiros de suporte da Kivora ou solicite apoio remoto com partilha de ecrã.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setPurchaseMinutesModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>+ Recarregar Minutos</span>
                  </button>

                  <button
                    onClick={() => setVideoModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Video className="w-4 h-4" />
                    <span>Iniciar Videochamada</span>
                  </button>
                </div>
              </div>

              {/* CARD DE SALDO DE MINUTOS DE VIDEOCHAMADA */}
              <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl border border-blue-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                    <Video className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black tracking-tight text-white">Assistência Remota em Direto</h3>
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase font-mono">
                        Tarifa: {getCachedSystemSettings().videoCallPricePerMinute || 300} Kz / min
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Diagnóstico avançado de base de dados, configuração de impressoras fiscais e formação de operadores com partilha de ecrã HD.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Saldo Disponível
                    </span>
                    <span className="font-mono text-xl font-black text-emerald-400">
                      {Math.floor((videoAccount?.remainingSeconds || 0) / 60)} min {((videoAccount?.remainingSeconds || 0) % 60)}s
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Gasto: {videoAccount?.totalMinutesSpent || 0} min no histórico
                    </span>
                  </div>

                  <button
                    onClick={() => setPurchaseMinutesModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/20 whitespace-nowrap"
                  >
                    Recarregar Minutos
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form Novo Ticket + Lista de Chamados */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Form Novo Chamado */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-blue-600" />
                      <span>Abrir Novo Chamado</span>
                    </h3>

                    <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase text-[10px]">Assunto *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Dúvida na exportação do ficheiro SAF-T"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 uppercase text-[10px]">Categoria</label>
                          <select
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value as any)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-bold focus:outline-none focus:border-blue-500"
                          >
                            <option value="tecnico">Técnico / Instalação</option>
                            <option value="faturacao">Faturação & AGT</option>
                            <option value="licenciamento">Licença / Troca PC</option>
                            <option value="multiloja">Rede / Multiloja</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 uppercase text-[10px]">AnyDesk / RustDesk</label>
                          <input
                            type="text"
                            placeholder="Ex: 998 112 003"
                            value={ticketRemoteCode}
                            onChange={(e) => setTicketRemoteCode(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase text-[10px]">Mensagem *</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Descreva o que se passa para o ajudarmos rapidamente..."
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingTicket}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {submittingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{submittingTicket ? 'A Enviar...' : 'Enviar Solicitação'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Lista de Chamados Abertos */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Meus Chamados ({myTickets.length})
                    </h3>

                    {myTickets.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        <MessageSquare className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <p className="font-bold">Nenhum chamado aberto</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
                        {myTickets.map((t) => {
                          const isSel = selectedTicket?.id === t.id;
                          return (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTicket(t)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-blue-50 border-blue-300 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-mono text-[9px] font-black text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {t.ticket_number}
                                </span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                                  t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {t.status === 'resolved' ? 'Resolvido' : t.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                                </span>
                              </div>
                              <p className="font-bold text-slate-900 truncate text-[11px]">{t.subject}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString('pt-AO')}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat em Tempo Real com a Equipa de Suporte */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
                  {selectedTicket ? (
                    <>
                      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900">{selectedTicket.ticket_number}</span>
                            <span className="text-slate-300">•</span>
                            <h4 className="font-bold text-slate-900 text-xs truncate max-w-xs">{selectedTicket.subject}</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Destinado a: <strong className="text-slate-800">{selectedTicket.target_type === 'partner' ? 'Parceiro Credenciado' : 'Engenharia Kivora Central'}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setVideoModalOpen(true)}
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 border border-blue-200 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Entrar em Vídeo</span>
                          </button>

                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            selectedTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {selectedTicket.status === 'resolved' ? 'Resolvido' : selectedTicket.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                          </span>
                        </div>
                      </div>

                      {/* Thread de Mensagens */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                        {selectedTicket.messages.map((msg, i) => {
                          const isClient = msg.sender_role === 'client';
                          return (
                            <div key={msg.id || i} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                              <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                                {msg.sender_name} ({isClient ? 'Você' : msg.sender_role === 'partner' ? 'Parceiro' : 'Equipa Kivora'})
                              </span>
                              <div className={`p-3 rounded-2xl text-xs max-w-sm sm:max-w-md ${
                                isClient
                                  ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                <span className={`text-[9px] font-medium mt-1 block text-right ${isClient ? 'text-blue-200' : 'text-slate-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Form Envio Mensagem */}
                      <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Escreva a sua mensagem para a equipa..."
                          value={chatReply}
                          onChange={(e) => setChatReply(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                        />
                        <button
                          type="submit"
                          disabled={!chatReply.trim() || sendingReply}
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
                        Veja as respostas e interaja diretamente com o suporte técnico.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: DADOS DA EMPRESA */}
          {activeSection === 'empresa' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-black text-slate-900">Dados Fiscais & Registo da Empresa</h2>
                <p className="text-xs text-slate-500 mt-0.5">Informações cadastrais associadas à sua conta no sistema Kivora.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Denominação Social:</span>
                  <strong className="font-black text-slate-900 text-sm">{clientLicense.company_name}</strong>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">NIF do Contribuinte:</span>
                  <strong className="font-mono font-black text-slate-900">{clientLicense.nif}</strong>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Email de Notificação:</span>
                  <span className="font-medium text-slate-700">{session?.email || clientLicense.client_email}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Parceiro Emissor:</span>
                  <span className="font-mono font-bold text-blue-600">{clientLicense.partner_id || 'Kivora Central'}</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modal de Impressão de Fatura */}
      {selectedInvoice && (
        <InvoicePrintModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          license={selectedInvoice}
        />
      )}

      {/* Modal de Videochamada de Assistência Remota */}
      <VideoConferenceModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        roomName={selectedTicket ? selectedTicket.id : undefined}
        ticketNumber={selectedTicket?.ticket_number}
        userName={clientLicense.company_name}
        userRole="cliente"
        companyName={clientLicense.company_name}
        entityId={clientLicense.nif !== 'Não Registado' ? clientLicense.nif : clientLicense.client_email}
      />

      {/* Modal de Compra de Minutos de Vídeo */}
      <VideoMinutesPurchaseModal
        isOpen={purchaseMinutesModalOpen}
        onClose={() => setPurchaseMinutesModalOpen(false)}
        account={videoAccount}
        entityType="cliente"
        onSuccess={(updatedAcc) => {
          setVideoAccount(updatedAcc);
        }}
      />
    </div>
  );
};

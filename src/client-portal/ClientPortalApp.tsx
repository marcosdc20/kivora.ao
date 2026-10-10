import React, { useState, useEffect, useRef } from 'react';
import { usePortalTrackpadScroll } from '../hooks/usePortalTrackpadScroll';
import {
  LayoutDashboard, Key, Download, Cloud, FileText,
  Headphones, Building2, LogOut, Monitor, Copy,
  CheckCircle2, ShieldCheck, Loader2, Send, Menu,
  MessageSquare, Receipt, Printer, AlertTriangle, Ban,
  Video, ShoppingBag, Truck, Package, ExternalLink, Play
} from 'lucide-react';
import {
  PortalSidebar,
  PortalNavItem,
  PortalNavGroup,
  PortalFooterButton,
} from '../components/portal/PortalSidebar';
import { CURRENT_RELEASE, KIVORA_INFO } from '../data/kivoraData';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { VideoConferenceModal } from '../components/VideoConferenceModal';
import { VideoMinutesPurchaseModal } from '../components/VideoMinutesPurchaseModal';
import {
  VideoSupportAccount,
  getOrCreateVideoSupportAccount,
  subscribeVideoSupportAccount
} from '../services/videoSupportService';
import { getStoredSession, logoutUser, KivoraUserSession } from '../admin/services/authService';
import { formatLicenseDate, getPlanLabel, subscribeClientLicenses } from '../admin/services/licenseService';
import {
  SupportTicket, createSupportTicket, sendTicketMessage,
  subscribeClientTickets
} from '../admin/services/supportService';
import { subscribeToStoreOrders } from '../admin/services/storeService';
import type { KivoraLicense, StoreOrder } from '../admin/types';
import { getCachedSystemSettings, subscribeSystemSettings, getDirectDownloadUrl } from '../services/systemSettingsService';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';

interface ClientPortalAppProps {
  onLogout: () => void;
}

type ClientSection = 'dashboard' | 'licenca' | 'downloads' | 'encomendas' | 'backups' | 'faturas' | 'suporte' | 'empresa';

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const ClientPortalApp: React.FC<ClientPortalAppProps> = ({ onLogout }) => {
  const session: KivoraUserSession | null = getStoredSession();
  const [matchedLicenses, setMatchedLicenses] = useState<KivoraLicense[]>([]);

  useEffect(() => {
    if (!session) return;
    const unsub = subscribeClientLicenses(
      {
        nif: session.nif,
        email: session.email,
        licenseKey: session.licenseKey || (session.id?.startsWith('KVRA-') ? session.id : undefined),
      },
      (list) => {
        setMatchedLicenses(list);
      }
    );
    return () => unsub();
  }, [session?.nif, session?.email, session?.licenseKey, session?.id]);

  const [systemSettings, setSystemSettings] = useState(getCachedSystemSettings());

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSystemSettings);
    return () => unsub();
  }, []);

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
  const [selectedInvoiceMeta, setSelectedInvoiceMeta] = useState<{ invoiceNumber?: string; paymentMethod?: string } | null>(null);

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

  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null);

  useEffect(() => {
    if (matchedLicenses.length > 0) {
      setSelectedLicenseId((prev) => {
        if (prev && matchedLicenses.some((l) => l.id === prev)) return prev;
        return matchedLicenses[0].id;
      });
    }
  }, [matchedLicenses]);

  // Licença ativa ou primária do cliente logado
  const clientLicense: KivoraLicense =
    matchedLicenses.find((l) => l.id === selectedLicenseId) ||
    matchedLicenses[0] || {
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

  // ─── SINCRONIZAÇÃO EM TEMPO REAL: ENCOMENDAS DA LOJA ────────────────────────
  const [clientOrders, setClientOrders] = useState<StoreOrder[]>([]);
  useEffect(() => {
    const unsub = subscribeToStoreOrders((allOrders) => {
      const myNif = clientLicense.nif?.trim().toLowerCase();
      const myEmail = (session?.email || clientLicense.client_email || '').trim().toLowerCase();
      const myCompany = (clientLicense.company_name || '').trim().toLowerCase();

      const matched = allOrders.filter((ord: any) => {
        const ordNif = (ord.companyNif || ord.nif || '').trim().toLowerCase();
        const ordEmail = (ord.clientEmail || ord.customerEmail || '').trim().toLowerCase();
        const ordCompany = (ord.companyName || ord.clientName || ord.customerName || '').trim().toLowerCase();
        return (
          (myNif && myNif !== 'não registado' && ordNif && ordNif === myNif) ||
          (myEmail && ordEmail && ordEmail === myEmail) ||
          (myCompany && ordCompany && ordCompany.includes(myCompany))
        );
      });
      setClientOrders(matched);
    });
    return () => unsub();
  }, [clientLicense.nif, clientLicense.client_email, clientLicense.company_name, session?.email]);

  // ─── SINCRONIZAÇÃO EM TEMPO REAL: FATURAS & SUBSGRIÇÕES OFICIAIS ───────────
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  useEffect(() => {
    const myNif = clientLicense.nif?.trim();
    if (!myNif || myNif === 'Não Registado') return;

    try {
      const q = query(collection(db, 'subscription_invoices'), where('nif', '==', myNif));
      const unsub = onSnapshot(q, (snap) => {
        const invs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClientInvoices(invs);
      }, (err) => console.warn('Invoices snap error:', err));
      return () => unsub();
    } catch (e) {
      console.warn(e);
    }
  }, [clientLicense.nif]);

  // ─── SINCRONIZAÇÃO EM TEMPO REAL: TELEMETRIA DE BACKUPS CLOUD ─────────────
  const [cloudBackupStatus, setCloudBackupStatus] = useState<any>(null);
  useEffect(() => {
    const myNif = clientLicense.nif?.trim();
    if (!myNif || myNif === 'Não Registado') return;
    try {
      const unsub = onSnapshot(doc(db, 'cloud_backups', myNif), (snap) => {
        if (snap.exists()) {
          setCloudBackupStatus(snap.data());
        } else {
          setCloudBackupStatus(null);
        }
      }, (err) => console.warn('Backup snap error:', err));
      return () => unsub();
    } catch (e) {
      console.warn(e);
    }
  }, [clientLicense.nif]);

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

  const handleLogout = async () => {
    await logoutUser();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'licenca', label: 'Minha Licença & PCs', icon: Key },
    { id: 'downloads', label: 'Instaladores & Setup', icon: Download },
    { id: 'encomendas', label: 'Minhas Encomendas', icon: ShoppingBag, badge: clientOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length || undefined },
    { id: 'backups', label: 'Backups Cloud', icon: Cloud },
    { id: 'faturas', label: 'Faturas & Subscrições', icon: FileText, badge: (clientInvoices.length > 0 ? clientInvoices.length : matchedLicenses.length) },
    { id: 'suporte', label: 'Suporte Técnico', icon: Headphones, badge: myTickets.filter((t) => t.status === 'open').length },
    { id: 'empresa', label: 'Minha Empresa & NIF', icon: Building2 },
  ];

  /** Sidebar partilhada: uma única renderização para desktop e drawer móvel. */
  const renderClientSidebar = (closeDrawer?: () => void): React.ReactElement => {
    const toNavItem = (item: (typeof navItems)[number]): PortalNavItem<ClientSection> => {
      const Icon = item.icon;
      const base = {
        id: item.id as ClientSection,
        label: item.label,
        icon: <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />,
      };
      if (item.badge !== undefined && item.badge > 0) {
        return { ...base, badge: item.badge, badgeTone: 'slate' as const };
      }
      return base;
    };

    const groups: PortalNavGroup<ClientSection>[] = [
      { title: 'Visão Geral', items: navItems.slice(0, 4).map(toNavItem) },
      { title: 'Serviços & Gestão', items: navItems.slice(4).map(toNavItem) },
    ];

    return (
      <PortalSidebar<ClientSection>
        portalLabel="Área do Cliente"
        groups={groups}
        activeId={activeSection}
        onSelect={(id: ClientSection) => {
          setActiveSection(id);
          closeDrawer?.();
        }}
        onClose={closeDrawer}
        identity={
          <div className="rounded-xl bg-white/[0.06] border border-white/[0.1] p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF6500] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {clientLicense.company_name ? clientLicense.company_name.slice(0, 2).toUpperCase() : 'CL'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{clientLicense.company_name}</p>
                <p className="text-[11px] text-slate-400 font-mono-num truncate">NIF: {clientLicense.nif}</p>
              </div>
            </div>
            {clientLicense.is_provisional && (
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 block text-center">
                Licença Provisória (7 Dias)
              </span>
            )}
          </div>
        }
        footer={
          <>
            <PortalFooterButton
              icon={<LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />}
              label="Terminar sessão"
              onClick={handleLogout}
              tone="danger"
            />
            <p className="px-3 pt-2 text-[10px] text-slate-400">Certificado AGT FE/387/AGT/2026</p>
          </>
        }
      />
    );
  };

  if (session?.status === 'suspended') {
    const whatsAppMessage = `Olá Suporte Kivora. A conta de acesso da minha empresa (${clientLicense.company_name}, NIF: ${clientLicense.nif}) encontra-se suspensa e pretendo solicitar o esclarecimento e regularização.`;
    const effectivePhoneRaw = (systemSettings.phoneRaw || KIVORA_INFO.phoneRaw || '').replace(/\D/g, '');
    const waUrl = `https://wa.me/${effectivePhoneRaw}?text=${encodeURIComponent(whatsAppMessage)}`;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 selection:bg-rose-600 selection:text-white">
        <div className="max-w-lg w-full surface-card bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-fadeIn">
          
          <div className="w-14 h-14 bg-rose-950/60 border border-rose-800/50 rounded-2xl flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-950/50">
            <Ban className="w-7 h-7 text-rose-500" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono-num font-semibold uppercase tracking-widest text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-800/60 inline-block">
              Acesso Suspenso
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold font-display text-white tracking-tight">
              Conta de Cliente Suspensa
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
              O acesso ao <strong className="text-slate-200">Portal da Empresa Cliente Kivora</strong> foi suspenso pela administração.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-left space-y-2 font-mono-num">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500 font-sans">Empresa:</span>
              <strong className="text-white font-display font-semibold">{clientLicense.company_name}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500 font-sans">NIF:</span>
              <strong className="text-amber-400 font-semibold">{clientLicense.nif}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Estado:</span>
              <span className="text-rose-400 font-semibold uppercase">● Suspenso</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contactar Suporte Técnico</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
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
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* Toast Notification Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-display font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar (componente partilhado entre painéis) */}
      <div className="hidden lg:flex h-full shrink-0">
        {renderClientSidebar()}
      </div>

      {/* Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[85vw] h-full z-10 shadow-2xl">
            {renderClientSidebar(() => setMobileMenuOpen(false))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden w-full">

        {/* Topbar unificada e limpa */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold font-display text-slate-900 tracking-tight truncate">
              {activeSection === 'dashboard' && 'Painel do Cliente'}
              {activeSection === 'licenca' && 'Minha Licença'}
              {activeSection === 'downloads' && 'Instaladores'}
              {activeSection === 'encomendas' && 'Minhas Encomendas de Hardware'}
              {activeSection === 'backups' && 'Cópias de Segurança'}
              {activeSection === 'faturas' && 'Histórico de Faturas'}
              {activeSection === 'suporte' && 'Assistência Técnica'}
              {activeSection === 'empresa' && 'Dados Cadastrais'}
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-500 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Certificado AGT FE/387/AGT/2026
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

              {/* Banner Oficial do Cliente Configurado no Admin */}
              {systemSettings.clientPortalBannerUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs bg-slate-900 relative">
                  <img
                    src={systemSettings.clientPortalBannerUrl}
                    alt="Banner Oficial da Empresa Cliente"
                    className="w-full max-h-56 object-cover"
                  />
                </div>
              )}

              {/* Vídeo / Tutorial para o Cliente Configurado no Admin */}
              {systemSettings.clientPortalVideoUrl && (
                <div className="bg-gradient-to-r from-[#0B1528] to-[#1746A2] rounded-2xl p-5 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6500] border border-orange-500/30 flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">Tutorial em Vídeo & Primeiros Passos</h4>
                      <p className="text-xs text-slate-300">Aprenda a operar o KIVORA SOFT, emitir faturas certificadas e gerir caixas com agilidade.</p>
                    </div>
                  </div>
                  <a
                    href={systemSettings.clientPortalVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#FF6500] hover:bg-[#EB5B00] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Assistir Vídeo</span>
                  </a>
                </div>
              )}

              {/* Alerta de Expiração Próxima ou Licença Provisória */}
              {((clientLicense.expires_at && clientLicense.expires_at - Date.now() < 7 * 86400000) || clientLicense.is_provisional) && (
                <div className="bg-amber-50 text-slate-950 p-5 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-display text-sm text-slate-950">
                        {clientLicense.is_provisional ? 'Atenção: Licença Provisória de 7 Dias' : 'A sua licença Kivora expira em breve!'}
                      </h3>
                      <p className="text-xs text-slate-700 font-sans mt-0.5">
                        Validade até <strong className="font-mono-num font-semibold text-slate-900">{formatLicenseDate(clientLicense.expires_at)}</strong>. Renove a sua subscrição para manter a faturação fiscal e a sincronização cloud ativas sem interrupções.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveSection('suporte')}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer active:scale-[0.98]"
                  >
                    Solicitar Renovação
                  </button>
                </div>
              )}

              {/* Seletor de Licenças (para empresas com múltiplos postos ou filiais) */}
              {matchedLicenses.length > 1 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold font-display text-slate-900">
                        Terminais & Postos da Sua Empresa ({matchedLicenses.length})
                      </p>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Alterne entre as licenças ativas da sua empresa para consultar validade e terminais vinculados.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                    {matchedLicenses.map((lic, idx) => {
                      const isSel = lic.id === clientLicense.id;
                      return (
                        <button
                          key={lic.id}
                          onClick={() => setSelectedLicenseId(lic.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                            isSel
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Posto {idx + 1} ({getPlanLabel(lic.plan_type)})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cartão de Identificação da Licença - Limpo e Claro */}
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        {getPlanLabel(clientLicense.plan_type)}
                      </span>
                      {clientLicense.is_provisional && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Provisória (7 Dias)
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {clientLicense.company_name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      NIF: <span className="font-mono-num font-semibold text-slate-700">{clientLicense.nif}</span> • Validade: <span className="font-mono-num font-semibold text-slate-700">{formatLicenseDate(clientLicense.expires_at)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                    <span className="font-mono-num text-xs sm:text-sm font-bold text-slate-800 select-all">{clientLicense.id}</span>
                    <button
                      onClick={handleCopyKey}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copiar Chave"
                    >
                      {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 space-y-1 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Estado Operacional</span>
                  <p className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{clientLicense.status === 'active' ? 'Ativo' : 'Suspenso'}</span>
                  </p>
                  <span className="text-xs text-slate-400 block mt-1">Validação online em dia</span>
                </div>

                <div className="bg-white p-5 space-y-1 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Terminais Licenciados</span>
                  <p className="text-xl font-bold text-slate-900 font-mono-num">
                    {clientLicense.hardware_id ? 1 : 0} de {1 + (clientLicense.extra_seats || 0)} PC(s)
                  </p>
                  <span className="text-xs text-slate-400 block mt-1">Rede Local com SQLite</span>
                </div>

                <div className="bg-white p-5 space-y-1 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Versão Oficial Kivora</span>
                  <p className="text-xl font-bold text-slate-900 font-mono-num">v{CURRENT_RELEASE.version}</p>
                  <span className="text-xs text-emerald-600 font-medium block mt-1">Motor Fiscal AGT Atualizado</span>
                </div>

                <div className="bg-white p-5 space-y-1 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Chamados de Suporte</span>
                  <p className="text-xl font-bold text-slate-900 font-mono-num">{myTickets.length}</p>
                  <span className="text-xs text-slate-400 block mt-1">Atendimento direto</span>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-slate-700" />
                    <span>Instalar Kivora Soft Desktop</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Descarregue o instalador oficial completo para configurar um novo terminal ou formatar o computador de caixa.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">Setup Kivora v{CURRENT_RELEASE.version} (64-bit)</span>
                    <span className="text-slate-500 font-mono-num text-[11px]">{CURRENT_RELEASE.fileSize}</span>
                  </div>
                  <button
                    onClick={() => setActiveSection('downloads')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer text-center block"
                  >
                    Aceder aos Downloads Oficiais
                  </button>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-600" />
                    <span>Apoio Técnico & Suporte Fiscal</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Tem dúvidas sobre o ficheiro SAF-T (AO), configuração de impressoras térmicas ou rede local? A nossa equipa responde em tempo real.
                  </p>
                  <button
                    onClick={() => setActiveSection('suporte')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer text-center block"
                  >
                    Abrir Chamado de Assistência
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SECTION: MINHA LICENÇA */}
          {activeSection === 'licenca' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 max-w-3xl shadow-xs">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Detalhes da Licença & Computadores</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Informações técnicas de ativação do software no seu computador.</p>
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Chave de Ativação do Software</p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono-num text-xl font-bold text-slate-100 select-all">{clientLicense.id}</span>
                  <button
                    onClick={handleCopyKey}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Copiada!' : 'Copiar Chave'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">Plano Contratado</span>
                  <p className="font-semibold text-slate-900 text-sm font-display">{getPlanLabel(clientLicense.plan_type)}</p>
                </div>
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">Data de Expiração</span>
                  <p className="font-mono-num font-semibold text-slate-900 text-sm">{formatLicenseDate(clientLicense.expires_at)}</p>
                </div>
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">Capacidade de Rede</span>
                  <p className="font-mono-num font-semibold text-slate-900 text-sm">{1 + (clientLicense.extra_seats || 0)} Terminal(ais)</p>
                </div>
              </div>

              {/* Computador Vinculado */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold font-display text-slate-900">Terminal Vinculado (Hardware Fingerprint)</h3>
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-slate-700 shrink-0" />
                    <div>
                      <p className="font-semibold font-display text-slate-900">PC Principal de Caixa / Servidor</p>
                      <p className="text-[10px] text-slate-500 font-mono-num truncate max-w-xs sm:max-w-md">
                        {clientLicense.hardware_id ? `ID: ${clientLicense.hardware_id}` : 'Aguardando 1º uso no software'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shrink-0">
                    Ativo Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Para trocar de computador, solicite a desvinculação através da Central de Suporte ou diretamente com o seu parceiro Kivora credenciado.
                </p>
              </div>
            </div>
          )}

          {/* SECTION: DOWNLOADS */}
          {activeSection === 'downloads' && (
            <div className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold font-display text-slate-900 tracking-tight">Instaladores Oficiais Kivora Soft</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Descarregue os instaladores oficiais para Windows e os drivers de periféricos de caixa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold font-mono-num text-slate-900 bg-slate-200/80 border border-slate-300/80 px-2.5 py-0.5 rounded-full uppercase">
                        Versão Oficial {CURRENT_RELEASE.version}
                      </span>
                      <span className="text-xs text-slate-500 font-mono-num">{CURRENT_RELEASE.fileSize}</span>
                    </div>
                    <h3 className="text-base font-semibold font-display text-slate-900">Kivora Soft — Setup Windows (x64)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Instalador completo que inclui o motor de faturação certificada AGT, gestão de stock, fecho de caixa POS e base de dados local.
                    </p>
                  </div>
                  <a
                    href={getDirectDownloadUrl(getCachedSystemSettings().downloadUrl || CURRENT_RELEASE.downloadUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Instalador Oficial (.exe)</span>
                  </a>
                </div>

                <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/80 border border-slate-300/80 px-2.5 py-0.5 rounded-full uppercase font-display">
                      Documentação & Periféricos
                    </span>
                    <h3 className="text-base font-semibold font-display text-slate-900">Manual do Utilizador & Drivers Térmicos</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Guia com instruções passo a passo para configuração de séries, gavetas de dinheiro e exportação do ficheiro SAF-T (AO).
                    </p>
                  </div>
                  <a
                    href="#download"
                    onClick={() => showToast('Aceda à secção de manuais no portal comercial.')}
                    className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-display font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200/80 active:scale-[0.98]"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Aceder aos Manuais Técnicos</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ENCOMENDAS DE HARDWARE */}
          {activeSection === 'encomendas' && (
            <div className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold font-display text-slate-900 tracking-tight">Minhas Encomendas de Equipamentos POS</h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Acompanhe o estado de entrega dos seus equipamentos de faturação, impressoras e periféricos comprados na loja oficial.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const phone = getCachedSystemSettings().phoneRaw || '244974855494';
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Olá Suporte Comercial Kivora, pretendo encomendar novos equipamentos POS para a empresa ${clientLicense.company_name} (NIF: ${clientLicense.nif}).`)}`, '_blank');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-display font-semibold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pedir Novo Equipamento</span>
                </button>
              </div>

              {clientOrders.length === 0 ? (
                <div className="p-10 text-center text-slate-400 border border-dashed border-slate-200/80 rounded-2xl space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold font-display text-slate-700 text-sm">Nenhuma encomenda registada para o seu NIF ({clientLicense.nif})</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-sans">
                      As impressoras térmicas, leitores de código de barras ou bobinas de papel encomendados na loja Kivora aparecerão aqui com rastreamento em tempo real.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientOrders.map((order) => {
                    const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
                      pending: { label: 'Pendente de Confirmação', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
                      processing: { label: 'Em Separação & Faturação', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
                      shipped: { label: 'Em Trânsito com Estafeta', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
                      delivered: { label: 'Entregue com Sucesso', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                      cancelled: { label: 'Cancelada', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
                    };
                    const st = statusConfig[order.status] || { label: order.status, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };

                    return (
                      <div key={order.id} className="surface-card border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-2xs hover:border-slate-300 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono-num font-semibold text-sm text-slate-900">{order.orderNumber}</span>
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${st.bg} ${st.color} ${st.border}`}>
                                {st.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                              Registo: <span className="font-mono-num">{new Date(order.createdAt).toLocaleDateString('pt-AO')}</span> às <span className="font-mono-num">{new Date(order.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}</span> • Destino: {order.deliveryProvince}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase font-semibold text-slate-500 font-display tracking-wider block">Total da Encomenda</span>
                            <span className="font-mono-num text-base font-bold text-slate-900">
                              {fmt(order.totalAOA || 0)} Kz
                            </span>
                          </div>
                        </div>

                        {/* Itens */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-display block">Equipamentos Solicitados:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-slate-800 font-display">{item.productName || (item as any).product?.name || 'Item de Loja'}</p>
                                  <p className="text-[10px] text-slate-500 font-mono-num">Qtd: {item.quantity} un.</p>
                                </div>
                                <span className="font-mono-num font-semibold text-slate-800 text-xs">
                                  {fmt(item.unitPriceAOA ? item.unitPriceAOA * item.quantity : 0)} Kz
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.notes && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-sans">
                            <strong className="font-semibold text-slate-900 font-display">Notas de Transporte:</strong> {order.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 text-xs">
                          <span className="text-slate-500 text-[11px] font-sans flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-600" />
                            Taxa de Entrega: <strong className="font-mono-num">{order.deliveryFeeAOA === 0 ? 'Grátis' : fmt(order.deliveryFeeAOA || 0) + ' Kz'}</strong>
                          </span>
                          <button
                            onClick={() => {
                              const phone = getCachedSystemSettings().phoneRaw || '244974855494';
                              const text = `Olá, pretendo informações sobre a encomenda ${order.orderNumber} para a empresa ${clientLicense.company_name}.`;
                              window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="inline-flex items-center gap-1 text-slate-900 hover:text-slate-700 font-display font-semibold text-xs cursor-pointer"
                          >
                            <span>Apoio ao Estafeta</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION: BACKUPS */}
          {activeSection === 'backups' && (
            <div className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-semibold font-display text-slate-900 tracking-tight">Backups de Segurança na Nuvem</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Cópias automáticas de segurança encriptadas no Google Cloud com retenção redundante.
                </p>
              </div>

              {cloudBackupStatus && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold font-display text-emerald-950">Última Sincronização Cloud Registada</p>
                      <p className="text-[11px] text-emerald-700 font-sans">
                        {cloudBackupStatus.updated_at ? new Date(cloudBackupStatus.updated_at).toLocaleString('pt-AO') : 'Recente'} • Terminal: <span className="font-mono-num">{cloudBackupStatus.hostname || clientLicense.hardware_id || 'Principal'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-mono-num font-semibold text-[10px] px-2.5 py-1 rounded-full shrink-0">
                    Sincronizado
                  </span>
                </div>
              )}

              <div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-semibold font-display">
                  <Cloud className="w-4 h-4 text-slate-700" />
                  <span>Proteção Total Contra Falhas de Hardware & Ransomware</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-sans">
                  O Kivora Soft no seu computador realiza backups automáticos da base de dados local sempre que efetua o fecho de turno ou de caixa, protegendo os seus dados fiscais, clientes e existências de stock.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-display">Destino Local das Cópias</span>
                  <p className="font-mono-num text-xs font-semibold text-slate-900 truncate">%APPDATA%\Kivora\backups</p>
                  <span className="text-[11px] text-slate-500 font-sans">Gravado em disco local isolado</span>
                </div>
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-display">Terminal Vinculado</span>
                  <p className="font-mono-num text-xs font-semibold text-slate-900 truncate">
                    {clientLicense.hardware_id || 'Servidor / Caixa Principal'}
                  </p>
                  <span className="text-[11px] text-slate-500 font-sans">Chave: <span className="font-mono-num">{clientLicense.id}</span></span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden text-xs">
                <div className="p-4 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-4 h-4 text-slate-700" />
                    <div>
                      <p className="font-semibold font-display text-slate-900">Sincronização em Tempo Real Cloud</p>
                      <p className="text-slate-500 text-[10px] font-sans">Cloud Firestore & Validação de Licenças AGT</p>
                    </div>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                    Ativo & Seguro
                  </span>
                </div>
                <div className="p-4 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold font-display text-slate-900">Criptografia em Trânsito</p>
                      <p className="text-slate-500 text-[10px] font-sans">TLS 1.3 / AES-256 com Chaves RSA-SHA256</p>
                    </div>
                  </div>
                  <span className="text-slate-800 bg-slate-100 border border-slate-200/80 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                    Certificado
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 text-xs space-y-2">
                <h4 className="font-semibold font-display text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Como restaurar uma cópia de segurança em caso de troca de computador:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed font-sans">
                  <li>Instale o Kivora Soft no novo computador a partir do menu <strong>Downloads</strong>.</li>
                  <li>Inicie o software e introduza a sua chave de ativação <strong className="font-mono-num">{clientLicense.id}</strong>.</li>
                  <li>No menu <em>Definições &gt; Manutenção &gt; Restaurar Cópia</em>, selecione o ficheiro <code className="font-mono-num">.db</code> ou <code className="font-mono-num">.kvr</code> guardado no seu pendrive ou disco externo.</li>
                </ol>
              </div>
            </div>
          )}

          {/* SECTION: FATURAS & LICENÇAS */}
          {activeSection === 'faturas' && (
            <div className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold font-display text-slate-900 tracking-tight">Histórico de Faturas & Subscrições</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Registo oficial de subscrições ativadas para o seu NIF (<span className="font-mono-num font-semibold">{clientLicense.nif}</span>).
                </p>
              </div>

              {/* Faturas Oficiais em /subscription_invoices se existirem */}
              {clientInvoices.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-slate-500 font-display tracking-wider">Faturas e Recibos Fiscais</h3>
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden text-xs">
                    {clientInvoices.map((inv) => (
                      <div key={inv.id} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num font-semibold text-slate-900">{inv.invoice_number || inv.id}</span>
                            <span className="font-medium text-slate-700 font-display">— {inv.plan_label || 'Subscrição Kivora Soft'}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80'
                            }`}>
                              {inv.status === 'paid' ? 'Pago & Liquidado' : 'Pendente'}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10px] font-sans mt-0.5">
                            Emitida a: <span className="font-mono-num">{inv.issue_date || '2026-08-01'}</span> • Vencimento: <span className="font-mono-num">{inv.due_date || '2026-08-30'}</span> {inv.payment_method ? `• Método: ${inv.payment_method}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-slate-900 font-mono-num text-sm">
                              {fmt(inv.amount || inv.totalAOA || 250000)} Kz
                            </p>
                            <span className="text-[10px] text-slate-400 font-display block">Fatura Oficial</span>
                          </div>
                          <button
                            onClick={() => {
                              const matchingLic = matchedLicenses.find(l => l.id === inv.licenseId) || clientLicense;
                              setSelectedInvoice(matchingLic);
                              setSelectedInvoiceMeta({
                                invoiceNumber: inv.invoice_number,
                                paymentMethod: inv.payment_method || 'Pagamento Validado',
                              });
                              setInvoiceModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg border border-slate-200/80 text-xs font-display font-semibold transition-colors cursor-pointer"
                            title="Imprimir Fatura / Recibo"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Recibo</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabela de Licenças Ativas */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase text-slate-500 font-display tracking-wider">
                  {clientInvoices.length > 0 ? 'Chaves de Licença & Postos Associados' : 'Subscrições & Licenças'}
                </h3>
                {matchedLicenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200/80 rounded-xl text-xs">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold font-display text-slate-700">Nenhuma fatura ou licença emitida ainda</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden text-xs">
                    {matchedLicenses.map((lic) => (
                      <div key={lic.id} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold font-display text-slate-900">{getPlanLabel(lic.plan_type)} — Kivora Soft Desktop</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              lic.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-rose-50 text-rose-700 border-rose-200/80'
                            }`}>
                              {lic.status === 'active' ? 'Pago & Ativo' : 'Suspenso'}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10px] font-mono-num mt-0.5">
                            Chave: {lic.id} • Válido até: {formatLicenseDate(lic.expires_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-slate-900 font-mono-num text-sm">
                              {fmt(lic.price_aoa || (lic.plan_type === 'monthly' ? 25000 : lic.plan_type === 'lifetime' ? 1500000 : 250000))} Kz
                            </p>
                            <span className="text-[10px] text-slate-400 font-display block">Subscrição Oficial</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedInvoice(lic);
                              setSelectedInvoiceMeta(null);
                              setInvoiceModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg border border-slate-200/80 text-xs font-display font-semibold transition-colors cursor-pointer"
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
            </div>
          )}

          {/* SECTION: SUPORTE */}
          {activeSection === 'suporte' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold font-display text-slate-900 tracking-tight">Central de Assistência Técnica</h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Converse diretamente com os engenheiros de suporte da Kivora ou solicite apoio remoto com partilha de ecrã.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setPurchaseMinutesModalOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-display font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 border border-slate-200/80 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span>+ Recarregar Minutos</span>
                  </button>

                  <button
                    onClick={() => setVideoModalOpen(true)}
                    className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-display font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Video className="w-4 h-4" />
                    <span>Iniciar Videochamada</span>
                  </button>
                </div>
              </div>

              {/* CARD DE SALDO DE MINUTOS DE VIDEOCHAMADA */}
              <div className="surface-card p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold font-display tracking-tight text-white">Assistência Remota em Direto</h3>
                      <span className="bg-white/10 text-slate-300 border border-white/10 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase font-mono-num">
                        Tarifa: {getCachedSystemSettings().videoCallPricePerMinute || 300} Kz / min
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed font-sans">
                      Diagnóstico avançado de base de dados, configuração de impressoras fiscais e formação de operadores com partilha de ecrã HD.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider font-display block">
                      Saldo Disponível
                    </span>
                    <span className="font-mono-num text-xl font-bold text-emerald-400">
                      {Math.floor((videoAccount?.remainingSeconds || 0) / 60)} min {((videoAccount?.remainingSeconds || 0) % 60)}s
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                      Gasto: <span className="font-mono-num">{videoAccount?.totalMinutesSpent || 0}</span> min no histórico
                    </span>
                  </div>

                  <button
                    onClick={() => setPurchaseMinutesModalOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white font-display font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-white/10 whitespace-nowrap active:scale-[0.98]"
                  >
                    Recarregar Minutos
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form Novo Ticket + Lista de Chamados */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Form Novo Chamado */}
                  <div className="surface-card rounded-2xl border border-slate-200/80 p-5 space-y-4">
                    <h3 className="text-xs font-semibold font-display text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-slate-700" />
                      <span>Abrir Novo Chamado</span>
                    </h3>

                    <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 uppercase font-display text-[10px] tracking-wider">Assunto *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Dúvida na exportação do ficheiro SAF-T"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 uppercase font-display text-[10px] tracking-wider">Categoria</label>
                          <select
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value as any)}
                            className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                          >
                            <option value="tecnico">Técnico / Instalação</option>
                            <option value="faturacao">Faturação & AGT</option>
                            <option value="licenciamento">Licença / Troca PC</option>
                            <option value="multiloja">Rede / Multiloja</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 uppercase font-display text-[10px] tracking-wider">AnyDesk / RustDesk</label>
                          <input
                            type="text"
                            placeholder="Ex: 998 112 003"
                            value={ticketRemoteCode}
                            onChange={(e) => setTicketRemoteCode(e.target.value)}
                            className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-mono-num text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 uppercase font-display text-[10px] tracking-wider">Mensagem *</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Descreva o que se passa para o ajudarmos rapidamente..."
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingTicket}
                        className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                      >
                        {submittingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{submittingTicket ? 'A Enviar...' : 'Enviar Solicitação'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Lista de Chamados Abertos */}
                  <div className="surface-card rounded-2xl border border-slate-200/80 p-5 space-y-3">
                    <h3 className="text-xs font-semibold uppercase text-slate-500 font-display tracking-wider">
                      Meus Chamados ({myTickets.length})
                    </h3>

                    {myTickets.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        <MessageSquare className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <p className="font-semibold font-display text-slate-600">Nenhum chamado aberto</p>
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
                                  ? 'bg-slate-100 border-slate-300 shadow-xs'
                                  : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-mono-num text-[10px] font-semibold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
                                  {t.ticket_number}
                                </span>
                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                                  t.status === 'resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80' :
                                  t.status === 'in_progress' ? 'bg-slate-100 text-slate-800 border-slate-200/80' :
                                  'bg-amber-50 text-amber-800 border-amber-200/80'
                                }`}>
                                  {t.status === 'resolved' ? 'Resolvido' : t.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                                </span>
                              </div>
                              <p className="font-semibold font-display text-slate-900 truncate text-[11px]">{t.subject}</p>
                              <p className="text-[10px] text-slate-400 font-mono-num mt-0.5">{new Date(t.createdAt).toLocaleDateString('pt-AO')}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat em Tempo Real com a Equipa de Suporte */}
                <div className="lg:col-span-7 surface-card rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[560px] overflow-hidden">
                  {selectedTicket ? (
                    <>
                      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num text-xs font-bold text-slate-900">{selectedTicket.ticket_number}</span>
                            <span className="text-slate-300">•</span>
                            <h4 className="font-semibold font-display text-slate-900 text-xs truncate max-w-xs">{selectedTicket.subject}</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                            Destinado a: <strong className="text-slate-800">{selectedTicket.target_type === 'partner' ? 'Parceiro Credenciado' : 'Engenharia Kivora Central'}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setVideoModalOpen(true)}
                            className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80 text-[11px] font-display font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Entrar em Vídeo</span>
                          </button>

                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                            selectedTicket.status === 'resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80' :
                            selectedTicket.status === 'in_progress' ? 'bg-slate-100 text-slate-800 border-slate-200/80' :
                            'bg-amber-50 text-amber-800 border-amber-200/80'
                          }`}>
                            {selectedTicket.status === 'resolved' ? 'Resolvido' : selectedTicket.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                          </span>
                        </div>
                      </div>

                      {/* Thread de Mensagens */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                        {selectedTicket.messages.map((msg, i) => {
                          const isClient = msg.sender_role === 'client';
                          return (
                            <div key={msg.id || i} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                              <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1 font-display">
                                {msg.sender_name} ({isClient ? 'Você' : msg.sender_role === 'partner' ? 'Parceiro' : 'Equipa Kivora'})
                              </span>
                              <div className={`p-3.5 rounded-2xl text-xs max-w-sm sm:max-w-md ${
                                isClient
                                  ? 'bg-slate-950 text-white rounded-br-xs shadow-xs'
                                  : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs shadow-xs'
                              }`}>
                                <p className="whitespace-pre-wrap font-sans leading-relaxed">{msg.text}</p>
                                <span className={`text-[9px] font-mono-num mt-1 block text-right ${isClient ? 'text-slate-400' : 'text-slate-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Form Envio Mensagem */}
                      <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Escreva a sua mensagem para a equipa..."
                          value={chatReply}
                          onChange={(e) => setChatReply(e.target.value)}
                          className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-sans focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 focus:bg-white transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!chatReply.trim() || sendingReply}
                          className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                      <h4 className="font-semibold font-display text-slate-700 text-sm">Selecione um chamado ao lado</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">
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
            <div className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold font-display text-slate-900 tracking-tight">Dados Fiscais & Registo da Empresa</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Informações cadastrais associadas à sua conta no sistema Kivora.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">Denominação Social:</span>
                  <strong className="font-semibold font-display text-slate-900 text-sm">{clientLicense.company_name}</strong>
                </div>
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">NIF do Contribuinte:</span>
                  <strong className="font-mono-num font-bold text-slate-900">{clientLicense.nif}</strong>
                </div>
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">Email de Notificação:</span>
                  <span className="font-medium text-slate-700 font-sans">{session?.email || clientLicense.client_email}</span>
                </div>
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">Parceiro Emissor:</span>
                  <span className="font-mono-num font-semibold text-slate-800">{clientLicense.partner_id || 'Kivora Central'}</span>
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
          onClose={() => {
            setInvoiceModalOpen(false);
            setSelectedInvoiceMeta(null);
          }}
          license={selectedInvoice}
          invoiceNumber={selectedInvoiceMeta?.invoiceNumber}
          paymentMethod={selectedInvoiceMeta?.paymentMethod}
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

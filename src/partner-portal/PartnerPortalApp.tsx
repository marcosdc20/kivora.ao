import React, { useState, useEffect, useRef } from 'react';
import { usePortalTrackpadScroll } from '../hooks/usePortalTrackpadScroll';
import {
  LayoutDashboard, Users, Key, DollarSign, Package,
  Headphones, LogOut, Plus, Copy, CheckCircle2,
  Download, FileText, Send, MessageSquare,
  Building2, Search, AlertCircle, Menu, X,
  RefreshCw, Ban, ShieldCheck, Printer, Calculator,
  ExternalLink, Lock, Check, Share2, Award,
  Unlink, UserPlus, Receipt, ArrowRight, PhoneCall,
  Wallet, CreditCard, Clock, Save, Video, Eye, EyeOff, Loader2, Play
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
import {
  getStoredSession, logoutUser, KivoraUserSession,
  changeUserPassword
} from '../admin/services/authService';
import { useCompanies } from '../admin/hooks/useFirebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  subscribePartnerLicenses,
  revokeLicense, reactivateLicense, releaseLicenseFromDevice,
  extendLicenseExpiry, formatLicenseDate, getPlanLabel, updateLicenseSeats,
  mapDocToKivoraLicense, calculateExpiresAt
} from '../admin/services/licenseService';
import {
  createLicenseRequest, subscribePartnerLicenseRequests, LicenseRequest
} from '../admin/services/licenseRequestService';
import { issueInstantPartnerLicense } from './services/partnerCreditService';
import {
  SupportTicket, createSupportTicket, sendTicketMessage,
  updateTicketStatus, subscribePartnerTickets
} from '../admin/services/supportService';
import {
  subscribePartnerPricing, subscribePartnerDebts, recordPartnerDebt,
  subscribePartnerAccount, deductPartnerWallet, getActiveCreditSlots,
  hasOverdueDebts, reconcilePartnerDebtsWithLicenses,
  subscribePartnerPolicy, DEFAULT_PARTNER_POLICY,
  DEFAULT_PARTNER_PRICING, PartnerPricingPlan, PartnerDebtEntry, PartnerAccount, PartnerLicensingPolicy,
  getPartnerSeatCost
} from '../admin/services/partnerDebtService';
import type { PlanType, KivoraLicense, Company } from '../admin/types';
import { notify, alertDialog } from '../services/notificationService';
import { PartnerOfficialCertificatesModal } from '../components/PartnerOfficialCertificatesModal';
import { LicenseOfficialCertificateModal } from '../components/LicenseOfficialCertificateModal';
import { subscribeSystemSettings, getCachedSystemSettings, SystemCompanySettings } from '../services/systemSettingsService';

interface PartnerPortalAppProps {
  onLogout: () => void;
}

type PartnerSection =
  | 'dashboard'
  | 'licencas'
  | 'clientes'
  | 'emitir-licenca'
  | 'certificados'
  | 'extrato'
  | 'simulador'
  | 'materiais'
  | 'suporte'
  | 'perfil';

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const PartnerPortalApp: React.FC<PartnerPortalAppProps> = ({ onLogout }) => {
  const session: KivoraUserSession | null = getStoredSession();
  const { companies, addCompany } = useCompanies();
  const [myPartnerLicenses, setMyPartnerLicenses] = useState<KivoraLicense[]>([]);
  // Licenças de solicitações aprovadas pelo administrador
  const [approvedRequestLicenses, setApprovedRequestLicenses] = useState<Record<string, KivoraLicense>>({});

  const [activeSection, setActiveSection] = useState<PartnerSection>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const partnerCode = session?.partnerCode || session?.email || 'PARCEIRO-KIVORA';
  const partnerName = session?.nome || 'Parceiro Credenciado Kivora';

  // Conta de Parceiro (Wallet & Limite de Crédito)
  const [partnerAccount, setPartnerAccount] = useState<PartnerAccount | null>(null);
  const displayPartnerCode = partnerAccount?.code || partnerCode;
  const displayPartnerName = partnerAccount?.name || partnerName;
  const [policy, setPolicy] = useState<PartnerLicensingPolicy>(DEFAULT_PARTNER_POLICY);
  const [systemSettings, setSystemSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [partnerDiscoveredCodes, setPartnerDiscoveredCodes] = useState<string[]>([]);

  // Escuta em tempo real as políticas de crédito de parceiro e coordenadas bancárias centrais
  useEffect(() => {
    const unsubPolicy = subscribePartnerPolicy(setPolicy);
    const unsubSettings = subscribeSystemSettings(setSystemSettings);
    return () => {
      unsubPolicy();
      unsubSettings();
    };
  }, []);

  const officialBank1Name = policy.membership_bank_info?.bank || systemSettings.bank1Name || 'Banco BAI';
  const officialBank1Iban = policy.membership_bank_info?.iban || systemSettings.ibanBai || '';
  const officialBank2Name = policy.membership_bank_info_2?.bank || systemSettings.bank2Name || 'Banco BFA';
  const officialBank2Iban = policy.membership_bank_info_2?.iban || systemSettings.ibanBfa || '';
  const officialBeneficiary = policy.membership_bank_info?.beneficiary || systemSettings.ibanTitular || 'VISUAL SOFTWARE LIMITADA';

  const hasBank1 = Boolean(officialBank1Iban && officialBank1Iban.trim().length > 0);
  const hasBank2 = Boolean(officialBank2Iban && officialBank2Iban.trim().length > 0);

  // Descoberta dinâmica em tempo real de códigos/aliases vinculados a este parceiro
  useEffect(() => {
    const userEmail = (session?.email || '').trim().toLowerCase();
    const currentCode = (session?.partnerCode || '').trim().toLowerCase();
    if (!userEmail && !currentCode) return;

    const unsubs: (() => void)[] = [];

    // Escuta em /partners todos os registos correspondentes ao e-mail ou código
    try {
      const uPartners = onSnapshot(collection(db, 'partners'), (snap) => {
        const found = new Set<string>();
        snap.forEach((d) => {
          const data = d.data();
          const dEmail = (data.email || '').trim().toLowerCase();
          const dCode = (data.code || '').trim();
          const dAlias = (data.alias_code || '').trim();
          const dId = d.id.trim();

          const matchesEmail = userEmail && dEmail === userEmail;
          const matchesCode =
            currentCode &&
            (dId.toLowerCase() === currentCode ||
              dCode.toLowerCase() === currentCode ||
              dAlias.toLowerCase() === currentCode);

          if (matchesEmail || matchesCode) {
            if (dId) found.add(dId);
            if (dCode) found.add(dCode);
            if (dAlias) found.add(dAlias);
          }
        });
        if (found.size > 0) {
          setPartnerDiscoveredCodes((prev) => Array.from(new Set([...prev, ...found])));
        }
      });
      unsubs.push(uPartners);
    } catch (e) {
      console.warn('Erro ao descobrir aliases em partners:', e);
    }

    // Escuta em /users todos os registos vinculados ao e-mail
    if (userEmail) {
      try {
        const qUsers = query(collection(db, 'users'), where('email', '==', userEmail));
        const uUsers = onSnapshot(qUsers, (snap) => {
          const found = new Set<string>();
          snap.forEach((d) => {
            const data = d.data();
            if (data.partnerCode) found.add(data.partnerCode.trim());
            if (data.alias_partner_code) found.add(data.alias_partner_code.trim());
          });
          if (found.size > 0) {
            setPartnerDiscoveredCodes((prev) => Array.from(new Set([...prev, ...found])));
          }
        });
        unsubs.push(uUsers);
      } catch (e) {
        console.warn('Erro ao descobrir aliases em users:', e);
      }
    }

    return () => unsubs.forEach((u) => u());
  }, [session?.email, session?.partnerCode]);

  // Identificadores resilientes do parceiro (Código, Email, ID, Aliases descobertos e variações de caixa)
  const partnerIdentifiers = React.useMemo(() => {
    const ids = new Set<string>();
    if (session?.partnerCode) ids.add(session.partnerCode.trim());
    if (session?.email) ids.add(session.email.trim());
    if (session?.id) ids.add(session.id.trim());
    if (partnerAccount?.code) ids.add(partnerAccount.code.trim());
    if (partnerAccount?.id) ids.add(partnerAccount.id.trim());
    if (partnerAccount?.email) ids.add(partnerAccount.email.trim());
    if (partnerCode) ids.add(partnerCode.trim());
    partnerDiscoveredCodes.forEach((c) => {
      if (c) ids.add(c.trim());
    });

    const result: string[] = [];
    ids.forEach((id) => {
      if (id) {
        result.push(id);
        result.push(id.toLowerCase());
        result.push(id.toUpperCase());
      }
    });
    return Array.from(new Set(result)).filter(Boolean);
  }, [session, partnerAccount, partnerCode, partnerDiscoveredCodes]);
  const [showOfficialCertificatesModal, setShowOfficialCertificatesModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hook de Rolagem de Touchpad / 2 Dedos
  const mainScrollRef = useRef<HTMLElement | null>(null);
  usePortalTrackpadScroll(mainScrollRef);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tabela de Preços e Dívidas em tempo real
  const [pricingPlans, setPricingPlans] = useState<PartnerPricingPlan[]>(DEFAULT_PARTNER_PRICING);
  const [partnerDebts, setPartnerDebts] = useState<PartnerDebtEntry[]>([]);

  // Filtros de Licenças
  const [licenseSearch, setLicenseSearch] = useState('');
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<'all' | 'active' | 'provisional' | 'expiring' | 'expired' | 'revoked'>('all');
  const [selectedLicenseForCert, setSelectedLicenseForCert] = useState<KivoraLicense | null>(null);
  const [selectedLicenseForInvoice, setSelectedLicenseForInvoice] = useState<KivoraLicense | null>(null);
  const [renewLicenseModal, setRenewLicenseModal] = useState<{ open: boolean; license: KivoraLicense | null; days: number }>({ open: false, license: null, days: 30 });
  const [addSeatsModalLic, setAddSeatsModalLic] = useState<KivoraLicense | null>(null);
  const [seatsToAdd, setSeatsToAdd] = useState<number>(1);
  const [addSeatsSubmitting, setAddSeatsSubmitting] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states de emissão de licença
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nif, setNif] = useState('');
  const [plan, setPlan] = useState<PlanType>('annual');
  const [priceAoa, setPriceAoa] = useState(250000);
  const [extraSeats, setExtraSeats] = useState(0);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatedIsProvisional, setGeneratedIsProvisional] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<LicenseRequest | null>(null);
  const [myLicenseRequests, setMyLicenseRequests] = useState<LicenseRequest[]>([]);
  const [activeLicensesTab, setActiveLicensesTab] = useState<'emitidas' | 'solicitacoes'>('emitidas');
  const [submitting, setSubmitting] = useState(false);

  // Carteira de clientes
  const [clientSearch, setClientSearch] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientNif, setNewClientNif] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('Luanda');
  const [newClientLogoUrl, setNewClientLogoUrl] = useState('');
  const [addingClient, setAddingClient] = useState(false);

  // Extrato & Notificação de Pagamento / Recarga de Wallet
  const [showProofPaymentModal, setShowProofPaymentModal] = useState(false);
  const [showTopUpWalletModal, setShowTopUpWalletModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentBank, setPaymentBank] = useState<string>('BAI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  // Simulador de Rentabilidade
  const [simMonthlyClients, setSimMonthlyClients] = useState(5);
  const [simAnnualClients, setSimAnnualClients] = useState(10);
  const [simMonthlySalePrice, setSimMonthlySalePrice] = useState(25000);
  const [simAnnualSalePrice, setSimAnnualSalePrice] = useState(250000);

  // Perfil & Senha & Branding
  const [partnerLogoUrl, setPartnerLogoUrl] = useState<string>(
    localStorage.getItem(`kivora_partner_logo_${session?.id || 'default'}`) || ''
  );
  const [partnerBrandingSaved, setPartnerBrandingSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notificação & Modal de Primeiro Acesso (Troca Obrigatória de Senha Provisória)
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(() => {
    return session?.mustChangePassword === true;
  });
  const [showFirstLoginPasswordModal, setShowFirstLoginPasswordModal] = useState<boolean>(() => {
    return session?.mustChangePassword === true;
  });
  const [firstNewPassword, setFirstNewPassword] = useState('');
  const [firstConfirmPassword, setFirstConfirmPassword] = useState('');
  const [firstPasswordError, setFirstPasswordError] = useState('');
  const [firstPasswordSaving, setFirstPasswordSaving] = useState(false);
  const [showFirstPassText, setShowFirstPassText] = useState(false);

  useEffect(() => {
    if (session?.mustChangePassword) {
      setMustChangePassword(true);
      setShowFirstLoginPasswordModal(true);
    }
  }, [session?.mustChangePassword]);

  const handleFirstPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstPasswordError('');
    if (firstNewPassword.length < 6) {
      setFirstPasswordError('A nova palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }
    if (firstNewPassword !== firstConfirmPassword) {
      setFirstPasswordError('A confirmação da palavra-passe não coincide com a nova palavra-passe.');
      return;
    }

    setFirstPasswordSaving(true);
    try {
      await changeUserPassword(session?.id || partnerCode, firstNewPassword, session?.email, partnerCode);
      setMustChangePassword(false);
      setShowFirstLoginPasswordModal(false);
      setFirstNewPassword('');
      setFirstConfirmPassword('');
      showToast('Palavra-passe pessoal atualizada com sucesso! A sua conta está segura.');
    } catch (err: any) {
      setFirstPasswordError('Erro ao atualizar palavra-passe: ' + err.message);
    } finally {
      setFirstPasswordSaving(false);
    }
  };

  const handleSavePartnerBranding = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`kivora_partner_logo_${session?.id || 'default'}`, partnerLogoUrl.trim());
    setPartnerBrandingSaved(true);
    showToast('Logótipo corporativo gravado com sucesso!');
    setTimeout(() => setPartnerBrandingSaved(false), 3000);
  };

  // Estados de Suporte do Parceiro & Videochamadas
  const [supportTab, setSupportTab] = useState<'clientes' | 'admin'>('clientes');
  const [clientTickets, setClientTickets] = useState<SupportTicket[]>([]);
  const [adminTickets, setAdminTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [chatReply, setChatReply] = useState('');
  const [showAdminTicketModal, setShowAdminTicketModal] = useState(false);
  const [adminTicketSubject, setAdminTicketSubject] = useState('');
  const [adminTicketCategory, setAdminTicketCategory] = useState<'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja'>('licenciamento');
  const [adminTicketMessage, setAdminTicketMessage] = useState('');
  const [submittingAdminTicket, setSubmittingAdminTicket] = useState(false);

  // Videochamada & Saldo de Minutos do Parceiro
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPurchaseMinutesModal, setShowPurchaseMinutesModal] = useState(false);
  const [videoAccount, setVideoAccount] = useState<VideoSupportAccount | null>(null);

  // Subscrição em Tempo Real aos Preços de Atacado
  useEffect(() => {
    const unsub = subscribePartnerPricing((plans) => {
      setPricingPlans(plans);
    });
    return () => unsub();
  }, []);

  // Subscrição em Tempo Real às Políticas Globais de Licenciamento
  useEffect(() => {
    const unsub = subscribePartnerPolicy((p) => {
      setPolicy(p);
    });
    return () => unsub();
  }, []);

  // Subscrição em Tempo Real à Conta do Parceiro (Wallet & Limite)
  useEffect(() => {
    if (!partnerCode && !session?.email && partnerIdentifiers.length === 0) return;
    const unsub = subscribePartnerAccount(
      partnerIdentifiers.length > 0 ? partnerIdentifiers : (partnerCode || session?.email || ''),
      (acc) => {
        setPartnerAccount(acc);
      },
      session?.email
    );
    return () => unsub();
  }, [partnerCode, session?.email, partnerIdentifiers]);

  // Subscrição em Tempo Real à Conta de Minutos de Vídeo do Parceiro
  useEffect(() => {
    if (!partnerCode) return;
    getOrCreateVideoSupportAccount(partnerCode, partnerName, 'parceiro', session?.email || '', (partnerAccount as any)?.nif || '').then(acc => setVideoAccount(acc));
    const unsub = subscribeVideoSupportAccount(partnerCode, (acc) => setVideoAccount(acc));
    return () => unsub();
  }, [partnerCode, partnerName, session?.email, partnerAccount]);

  // Subscrição em Tempo Real às Dívidas deste Parceiro (Multi-identificador resiliente)
  useEffect(() => {
    if (!partnerCode && partnerIdentifiers.length === 0) return;
    const unsub = subscribePartnerDebts(
      partnerIdentifiers.length > 0 ? partnerIdentifiers : partnerCode,
      (debts) => {
        setPartnerDebts(debts);
      }
    );
    return () => unsub();
  }, [partnerCode, partnerIdentifiers]);

  // Subscrição em Tempo Real aos Chamados do Parceiro (Segregação Multi-Tenant Estrita)
  useEffect(() => {
    const ids = partnerIdentifiers.length > 0 ? partnerIdentifiers : partnerCode;
    const unsub = subscribePartnerTickets(ids, session?.email || '', ({ clientTickets: cTks, adminTickets: aTks }) => {
      setClientTickets(cTks);
      setAdminTickets(aTks);
      if (selectedTicket) {
        const all = [...cTks, ...aTks];
        const updated = all.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    });
    return () => unsub();
  }, [partnerCode, session?.email, partnerIdentifiers, selectedTicket]);

  // Subscrição em Tempo Real às Licenças deste Parceiro (Multi-identificador resiliente)
  useEffect(() => {
    if (partnerIdentifiers.length === 0) return;
    const unsub = subscribePartnerLicenses(partnerIdentifiers, (list) => {
      setMyPartnerLicenses(list);
    });
    return () => unsub();
  }, [partnerIdentifiers]);

  // Subscrição em Tempo Real às Solicitações de Licença deste Parceiro (Multi-identificador resiliente)
  useEffect(() => {
    if (partnerIdentifiers.length === 0) return;
    const unsub = subscribePartnerLicenseRequests(partnerIdentifiers, (list) => {
      setMyLicenseRequests(list);
    });
    return () => unsub();
  }, [partnerIdentifiers]);

  // Escuta em tempo real os documentos oficiais em /licenses de solicitações que foram aprovadas
  useEffect(() => {
    const approvedReqs = myLicenseRequests.filter((r) => {
      const licKey = (r.license_id || (r as any).licenseId || (r as any).licenseKey || '').trim();
      return r.status === 'approved' && licKey.length > 0;
    });

    if (approvedReqs.length === 0) {
      setApprovedRequestLicenses({});
      return;
    }

    const unsubs: (() => void)[] = [];

    approvedReqs.forEach((req) => {
      const licId = (req.license_id || (req as any).licenseId || (req as any).licenseKey || '').trim();
      try {
        const unsub = onSnapshot(
          doc(db, 'licenses', licId),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              const lic = mapDocToKivoraLicense(snap.id, data);
              setApprovedRequestLicenses((prev) => ({ ...prev, [licId]: lic }));
            } else {
              // Fallback imediato de alta fidelidade
              const fallbackLic: KivoraLicense = {
                id: licId,
                company_name: req.company_name,
                nif: req.nif,
                client_email: req.client_email || '',
                plan_type: req.plan_type,
                status: 'active',
                hardware_id: null,
                created_at: req.approved_at || req.created_at,
                expires_at: calculateExpiresAt(req.plan_type),
                price_aoa: req.price_aoa,
                notes: req.notes || `Aprovada pelo Administrador (${req.reviewed_by || 'Admin'})`,
                partner_id: req.partner_id || partnerCode,
                activated_at: null,
                extra_seats: req.extra_seats,
                is_provisional: req.is_provisional,
              };
              setApprovedRequestLicenses((prev) => ({ ...prev, [licId]: fallbackLic }));
            }
          },
          (err) => {
            console.warn('Erro ao sincronizar licença aprovada:', licId, err);
          }
        );
        unsubs.push(unsub);
      } catch (err) {
        console.warn('Erro ao iniciar listener para licença aprovada:', licId, err);
      }
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [myLicenseRequests, partnerCode]);

  // UNIFICAÇÃO MASTER: Licenças emitidas diretamente + Licenças de solicitações aprovadas pelo Admin
  const allPartnerLicenses = React.useMemo(() => {
    const map = new Map<string, KivoraLicense>();

    // 1. Licenças emitidas diretamente pelo parceiro (da subscrição de licenças)
    myPartnerLicenses.forEach((lic) => {
      map.set(lic.id.toUpperCase(), lic);
    });

    // 2. Licenças de solicitações aprovadas (escutadas em tempo real de /licenses)
    Object.values(approvedRequestLicenses).forEach((lic) => {
      const keyUpper = lic.id.toUpperCase();
      if (!map.has(keyUpper)) {
        map.set(keyUpper, lic);
      } else {
        // Enriquecer dados se o doc oficial trouxer mais detalhes de ativação/hardware
        map.set(keyUpper, { ...map.get(keyUpper)!, ...lic });
      }
    });

    // 3. Fallback imediato para qualquer solicitação aprovada que ainda não tenha entrado em approvedRequestLicenses
    myLicenseRequests.forEach((req) => {
      const licKey = (req.license_id || (req as any).licenseId || (req as any).licenseKey || '').trim();
      if (req.status === 'approved' && licKey) {
        const keyUpper = licKey.toUpperCase();
        if (!map.has(keyUpper)) {
          map.set(keyUpper, {
            id: licKey,
            company_name: req.company_name,
            nif: req.nif,
            client_email: req.client_email || '',
            plan_type: req.plan_type,
            status: 'active',
            hardware_id: null,
            created_at: req.approved_at || req.created_at,
            expires_at: calculateExpiresAt(req.plan_type),
            price_aoa: req.price_aoa,
            notes: req.notes || 'Aprovada pela Administração Kivora',
            partner_id: req.partner_id || partnerCode,
            activated_at: null,
            extra_seats: req.extra_seats,
            is_provisional: req.is_provisional,
          });
        }
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    return list;
  }, [myPartnerLicenses, approvedRequestLicenses, myLicenseRequests, partnerCode]);

  // Reconciliação em background com debounce e lock anti-loop
  const isReconcilingRef = React.useRef(false);
  useEffect(() => {
    if (!partnerCode || allPartnerLicenses.length === 0 || isReconcilingRef.current) return;
    const timer = setTimeout(async () => {
      if (isReconcilingRef.current) return;
      isReconcilingRef.current = true;
      try {
        await reconcilePartnerDebtsWithLicenses(
          partnerCode,
          partnerName,
          allPartnerLicenses,
          partnerDebts,
          policy,
          pricingPlans,
          partnerAccount?.tier || 'bronze'
        );
      } finally {
        setTimeout(() => { isReconcilingRef.current = false; }, 4000);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [partnerCode, partnerName, allPartnerLicenses.length, partnerDebts.length, policy, pricingPlans, partnerAccount?.tier]);

  // Lista Efetiva de Débitos (Garante coerência de slots e extrato mesmo antes da gravação assíncrona)
  const effectiveDebts = React.useMemo(() => {
    const list = [...partnerDebts];
    const existingLicIds = new Set(list.map((d) => (d.license_id || d.id).toLowerCase()));

    allPartnerLicenses.forEach((lic) => {
      if (!existingLicIds.has(lic.id.toLowerCase())) {
        const baseCost = pricingPlans.find((p) => p.plan_type === lic.plan_type)?.cost_aoa ?? 120000;
        const seatCost = getPartnerSeatCost(partnerAccount?.tier || 'bronze', policy);
        const totalCost = baseCost + (lic.extra_seats || 0) * seatCost;
        const isPaidViaWallet = Boolean(lic.notes && lic.notes.toLowerCase().includes('carteira pré-paga'));

        list.push({
          id: lic.id,
          partner_id: partnerCode,
          partner_name: partnerName,
          license_id: lic.id,
          company_name: lic.company_name,
          plan_type: lic.plan_type,
          cost_aoa: totalCost,
          client_price_aoa: lic.price_aoa || Math.round(totalCost * 1.8),
          created_at: lic.created_at || Date.now(),
          paid: isPaidViaWallet,
          paid_at: isPaidViaWallet ? (lic.created_at || Date.now()) : null,
          payment_method: isPaidViaWallet ? 'wallet' : 'credit',
          is_provisional: lic.is_provisional ?? false,
        });
      }
    });

    list.sort((a, b) => b.created_at - a.created_at);
    return list;
  }, [partnerDebts, allPartnerLicenses, pricingPlans, partnerAccount?.tier, policy, partnerCode, partnerName]);

  const partnerClients = React.useMemo(() => {
    const clientMap = new Map<string, Company>();

    const isGenericNif = (n?: string) => {
      if (!n) return true;
      const clean = n.replace(/\D/g, '');
      return (
        clean.length === 0 ||
        clean === '999999999' ||
        clean === '000000000' ||
        n.trim().toLowerCase() === 'consumidor final'
      );
    };

    const cleanIdentifiers = new Set(
      partnerIdentifiers
        .filter((id): id is string => Boolean(id && typeof id === 'string' && id.trim().length > 0))
        .map((id) => id.trim().toLowerCase())
    );

    // 1. Clientes registados na coleção 'companies'
    // REGRA DE OURO ZERO-LEAK: Nunca incluir uma empresa que pertença a outro parceiro!
    companies.forEach((c) => {
      const cPartner = (c.partner_id || '').trim().toLowerCase();

      // Se a empresa possui explicitamente um parceiro diferente deste parceiro, NUNCA expor!
      if (cPartner.length > 0 && !cleanIdentifiers.has(cPartner)) {
        return;
      }

      // Pertence diretamente a este parceiro pelo partner_id
      const matchesDirectPartner = cPartner.length > 0 && cleanIdentifiers.has(cPartner);

      // Ou corresponde a uma licença OU solicitação deste parceiro com NIF específico (não genérico) ou email
      const cNif = (c.nif || '').trim().toUpperCase();
      const cEmail = (c.email || '').trim().toLowerCase();
      const hasSpecificNif = !isGenericNif(cNif);
      const matchesLicenseNif =
        hasSpecificNif &&
        allPartnerLicenses.some((l) => (l.nif || '').trim().toUpperCase() === cNif);
      const matchesLicenseEmail =
        Boolean(cEmail && allPartnerLicenses.some((l) => (l.client_email || '').trim().toLowerCase() === cEmail));
      const matchesRequestNif =
        hasSpecificNif &&
        myLicenseRequests.some((r) => (r.nif || '').trim().toUpperCase() === cNif);
      const matchesRequestEmail =
        Boolean(cEmail && myLicenseRequests.some((r) => (r.client_email || '').trim().toLowerCase() === cEmail));

      if (matchesDirectPartner || matchesLicenseNif || matchesLicenseEmail || matchesRequestNif || matchesRequestEmail) {
        const mapKey = hasSpecificNif ? `NIF_${cNif}` : `DOC_${c.id}`;
        clientMap.set(mapKey, {
          ...c,
          partner_id: c.partner_id || partnerCode,
        });
      }
    });

    // 2. Fallback de alta fidelidade: Derivar clientes diretamente de todas as licenças oficiais e aprovadas deste parceiro
    allPartnerLicenses.forEach((lic) => {
      const licNif = (lic.nif || '').trim();
      const hasSpecificNif = !isGenericNif(licNif);
      const mapKey = hasSpecificNif
        ? `NIF_${licNif.toUpperCase()}`
        : `LIC_${lic.id.toUpperCase()}`;

      if (!clientMap.has(mapKey)) {
        clientMap.set(mapKey, {
          id: hasSpecificNif ? licNif : `lic_client_${lic.id}`,
          name: lic.company_name || 'Cliente Empresarial',
          nif: lic.nif || '',
          email: lic.client_email || '',
          phone: '',
          address: 'Angola',
          partner_id: lic.partner_id || partnerCode,
          status: 'active',
          createdAt: lic.created_at || Date.now(),
        });
      } else {
        // Enriquecer dados cadastrais se a licença tiver email mais detalhado
        const existing = clientMap.get(mapKey)!;
        if (!existing.email && lic.client_email) {
          existing.email = lic.client_email;
        }
      }
    });

    // 3. Derivar também a partir de solicitações de licença deste parceiro
    myLicenseRequests.forEach((req) => {
      const reqNif = (req.nif || '').trim();
      const hasSpecificNif = !isGenericNif(reqNif);
      const mapKey = hasSpecificNif
        ? `NIF_${reqNif.toUpperCase()}`
        : `REQ_${req.id.toUpperCase()}`;

      if (!clientMap.has(mapKey)) {
        clientMap.set(mapKey, {
          id: hasSpecificNif ? reqNif : `req_client_${req.id}`,
          name: req.company_name || 'Cliente Solicitado',
          nif: req.nif || '',
          email: req.client_email || '',
          phone: '',
          address: 'Angola',
          partner_id: req.partner_id || partnerCode,
          status: 'active',
          createdAt: req.created_at || Date.now(),
        });
      }
    });

    const list = Array.from(clientMap.values());
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  }, [companies, partnerIdentifiers, allPartnerLicenses, myLicenseRequests, partnerCode]);

  const filteredClients = partnerClients.filter((c) => {
    if (!clientSearch) return true;
    const s = clientSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(s) ||
      (c.nif || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s)
    );
  });

  // Solicitações aprovadas prontas para entrega ao cliente
  const approvedRequestsReady = React.useMemo(() => {
    return myLicenseRequests.filter(
      (r) =>
        r.status === 'approved' &&
        Boolean((r.license_id || (r as any).licenseId || (r as any).licenseKey || '').trim())
    );
  }, [myLicenseRequests]);

  // Filtro de Licenças do Parceiro (Todas as licenças: emitidas diretamente + aprovadas por solicitação)
  const filteredLicenses = allPartnerLicenses.filter((lic) => {
    const s = licenseSearch.toLowerCase();
    const matchesSearch =
      !licenseSearch ||
      (lic.id || '').toLowerCase().includes(s) ||
      (lic.company_name || '').toLowerCase().includes(s) ||
      (lic.nif || '').includes(s) ||
      (lic.client_email || '').toLowerCase().includes(s);

    if (!matchesSearch) return false;

    const now = Date.now();
    const isExpiringSoon = lic.expires_at && lic.expires_at > now && lic.expires_at - now < 7 * 86400000;
    const isExpired = lic.expires_at && lic.expires_at <= now;

    if (licenseStatusFilter === 'provisional') return lic.is_provisional;
    if (licenseStatusFilter === 'active') return lic.status === 'active' && !isExpired && !lic.is_provisional;
    if (licenseStatusFilter === 'expiring') return isExpiringSoon && lic.status === 'active';
    if (licenseStatusFilter === 'expired') return isExpired || lic.status === 'expired';
    if (licenseStatusFilter === 'revoked') return lic.status === 'revoked';
    return true;
  });

  // Cálculos Financeiros & Sistema de Quotas de Slots (Incluindo Terminais por Nível de Parceiro)
  const basePlanCost = pricingPlans.find((p) => p.plan_type === plan)?.cost_aoa ?? 120000;
  const partnerSeatCost = getPartnerSeatCost(partnerAccount?.tier || 'bronze', policy);
  const totalExtraSeatsCost = extraSeats * partnerSeatCost;
  const currentTotalCost = basePlanCost + totalExtraSeatsCost;

  const currentPlanCost = basePlanCost; // Referência do plano base

  const retailSeatPrice = policy.retail_extra_seat_price_aoa || 35000;
  const totalExtraSeatsClientPrice = extraSeats * retailSeatPrice;
  const totalClientPrice = priceAoa + totalExtraSeatsClientPrice;
  const partnerMargin = Math.max(0, totalClientPrice - currentTotalCost);

  const walletBalance = partnerAccount?.wallet_balance_aoa || 0;
  const creditSlotsLimit = partnerAccount?.credit_slots_limit || policy.tier_slots[partnerAccount?.tier || 'bronze'] || 2;
  const activeSlotsInUse = getActiveCreditSlots(effectiveDebts);
  const availableCreditSlots = Math.max(0, creditSlotsLimit - activeSlotsInUse);
  const overdueDaysLimit = partnerAccount?.overdue_days_limit || policy.overdue_tolerance_days || 15;
  const isOverdue = hasOverdueDebts(effectiveDebts, overdueDaysLimit);

  const totalPendingDebt = effectiveDebts.filter((d) => !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalPaidToKivora = effectiveDebts.filter((d) => d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalPartnerProfit = effectiveDebts.reduce(
    (acc, d) => acc + Math.max(0, (d.client_price_aoa || 0) - d.cost_aoa),
    0
  );

  const canPayWithWallet = walletBalance >= currentTotalCost;
  const canPayWithCredit = !canPayWithWallet && availableCreditSlots > 0 && !isOverdue;

  const handlePlanChange = (p: PlanType) => {
    setPlan(p);
    const planCost = pricingPlans.find((item) => item.plan_type === p)?.cost_aoa;
    if (p === 'daily') setPriceAoa(planCost ? Math.round(planCost * 1.5) : 5000);
    else if (p === 'weekly') setPriceAoa(planCost ? Math.round(planCost * 1.5) : 10000);
    else if (p === 'biweekly') setPriceAoa(planCost ? Math.round(planCost * 1.5) : 15000);
    else if (p === 'monthly') setPriceAoa(planCost ? Math.round(planCost * 1.6) : 25000);
    else if (p === 'quarterly') setPriceAoa(planCost ? Math.round(planCost * 1.6) : 70000);
    else if (p === 'semiannual') setPriceAoa(planCost ? Math.round(planCost * 1.6) : 130000);
    else if (p === 'annual') setPriceAoa(planCost ? Math.round(planCost * 1.8) : 250000);
    else if (p === 'quadrennial') setPriceAoa(planCost ? Math.round(planCost * 1.8) : 800000);
    else if (p === 'lifetime') setPriceAoa(planCost ? Math.round(planCost * 1.8) : 1500000);
  };

  const handleSelectClientForIssue = (c: Company) => {
    setCompanyName(c.name);
    setNif(c.nif);
    setClientEmail(c.email || '');
    setActiveSection('emitir-licenca');
  };

  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !nif) return;
    setSubmitting(true);
    try {
      // 1. Pagamento via Carteira Virtual (Pré-pago) -> 100% INSTANTÂNEO 24/7
      if (canPayWithWallet) {
        const instantRes = await issueInstantPartnerLicense({
          partnerCode: displayPartnerCode,
          partnerDocId: partnerAccount?.id || displayPartnerCode,
          partnerName: displayPartnerName,
          companyName,
          nif,
          clientEmail,
          planType: plan,
          extraSeats,
          priceAoa: totalClientPrice,
          costAoa: currentTotalCost,
          paymentMethod: 'wallet',
          isProvisional: false,
        });

        if (instantRes.success && instantRes.licenseId) {
          setGeneratedKey(instantRes.licenseId);
          setGeneratedIsProvisional(false);
          setPartnerAccount((prev) => prev ? {
            ...prev,
            wallet_balance_aoa: Math.max(0, (prev.wallet_balance_aoa || 0) - currentTotalCost),
          } : prev);
          showToast('Licença emitida instantaneamente com sucesso via Carteira Virtual!');
          setSubmitting(false);
          return;
        }

        if (instantRes.error) {
          showToast('Erro ao emitir via Carteira: ' + instantRes.error);
          setSubmitting(false);
          return;
        }
      }

      // 2. Emissão com Quota de Crédito (Slot Rotativo) -> INSTANTÂNEO (salvo se bloqueado manualmente)
      const isAutoInstant = partnerAccount?.credit_issuance_mode !== 'manual_approval';
      if (canPayWithCredit && isAutoInstant) {
        const isHighRiskPlan = (plan === 'lifetime' && policy.require_provisional_lifetime) || extraSeats >= 3;

        const instantRes = await issueInstantPartnerLicense({
          partnerCode: displayPartnerCode,
          partnerDocId: partnerAccount?.id || displayPartnerCode,
          partnerName: displayPartnerName,
          companyName,
          nif,
          clientEmail,
          planType: plan,
          extraSeats,
          priceAoa: totalClientPrice,
          costAoa: currentTotalCost,
          paymentMethod: 'credit',
          isProvisional: isHighRiskPlan,
        });

        if (instantRes.success && instantRes.licenseId) {
          setGeneratedKey(instantRes.licenseId);
          setGeneratedIsProvisional(instantRes.isProvisional ?? isHighRiskPlan);
          showToast('Licença emitida instantaneamente a Crédito!');
          setSubmitting(false);
          return;
        }

        if (instantRes.error && !instantRes.requiresManualApproval) {
          showToast('Erro ao emitir a crédito: ' + instantRes.error);
          setSubmitting(false);
          return;
        }
      }

      // 3. Fila de Exceção / Solicitação ao Administrador (Apenas se quota esgotada, faturas vencidas ou modo manual)
      let exceptionReason = '';
      if (isOverdue) {
        exceptionReason = `[EXCEÇÃO: DÍVIDA VENCIDA > ${overdueDaysLimit} DIAS]`;
      } else if (availableCreditSlots <= 0 && !canPayWithWallet) {
        exceptionReason = `[EXCEÇÃO: QUOTA ESGOTADA (${activeSlotsInUse}/${creditSlotsLimit} SLOTS)]`;
      } else if (partnerAccount?.credit_issuance_mode === 'manual_approval') {
        exceptionReason = `[PARCEIRO EM MODO DE REVISÃO MANUAL]`;
      }

      const req = await createLicenseRequest({
        partner_id: displayPartnerCode,
        partner_name: displayPartnerName,
        company_name: companyName,
        nif,
        client_email: clientEmail,
        plan_type: plan,
        extra_seats: extraSeats,
        price_aoa: totalClientPrice,
        cost_aoa: currentTotalCost,
        payment_method: canPayWithWallet ? 'wallet' : 'credit',
        is_provisional: plan === 'lifetime' || extraSeats >= 3,
        ...(plan === 'lifetime' ? { provisional_target_plan: plan } : {}),
        notes: `${exceptionReason} Solicitada pelo parceiro ${displayPartnerCode} (+${extraSeats} postos extras). Requer aprovação da Administração.`,
      });

      // Regista também na coleção de empresas clientes se ainda não existir
      const exists = companies.some((c) => c.nif === nif);
      if (!exists) {
        await addCompany({
          name: companyName,
          nif,
          email: clientEmail,
          phone: '',
          address: `Parceiro: ${displayPartnerCode}`,
          partner_id: displayPartnerCode,
          status: 'active',
        }).catch(() => {});
      }

      setSubmittedRequest(req);
      showToast('Solicitação de licença registada com sucesso! Aguarda validação da administração.');
    } catch (err: any) {
      showToast('Erro ao processar licença: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handler para Adicionar Terminais a uma Licença Existente
  const handleAddSeatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSeatsModalLic || seatsToAdd <= 0) return;
    setAddSeatsSubmitting(true);

    try {
      const pSeatCost = getPartnerSeatCost(partnerAccount?.tier || 'bronze', policy);
      const expansionCost = seatsToAdd * pSeatCost;
      const expansionClientPrice = seatsToAdd * (policy.retail_extra_seat_price_aoa || 35000);
      const currentSeats = addSeatsModalLic.extra_seats || 0;
      const newTotalExtraSeats = currentSeats + seatsToAdd;

      let isPaid = false;
      let paymentMethod: 'wallet' | 'credit' = 'credit';

      if (walletBalance >= expansionCost) {
        const deducted = await deductPartnerWallet(partnerCode, expansionCost);
        if (deducted) {
          isPaid = true;
          paymentMethod = 'wallet';
        }
      } else if (availableCreditSlots > 0 && !isOverdue) {
        isPaid = false;
        paymentMethod = 'credit';
      } else {
        if (isOverdue) {
          await alertDialog({
            title: 'Bloqueio de Crédito',
            message: `Regularize os débitos pendentes há mais de ${overdueDaysLimit} dias ou recarregue a Carteira Pré-paga.`,
            type: 'warning',
          });
        } else {
          await alertDialog({
            title: 'Limite de Quota Atingido',
            message: `Saldo insuficiente na Carteira (${fmt(walletBalance)} Kz vs ${fmt(expansionCost)} Kz) e sem slots de crédito livres (${activeSlotsInUse}/${creditSlotsLimit} em uso).`,
            type: 'warning',
          });
        }
        setAddSeatsSubmitting(false);
        return;
      }

      // 1. Atualizar licença no Firebase
      await updateLicenseSeats(addSeatsModalLic.id, newTotalExtraSeats);

      // 2. Registar débito/transação no extrato do parceiro
      await recordPartnerDebt({
        partner_id: partnerCode,
        partner_name: partnerName,
        license_id: addSeatsModalLic.id,
        company_name: `${addSeatsModalLic.company_name} (+${seatsToAdd} Postos LAN)`,
        plan_type: addSeatsModalLic.plan_type,
        cost_aoa: expansionCost,
        client_price_aoa: expansionClientPrice,
        created_at: Date.now(),
        paid: isPaid,
        paid_at: isPaid ? Date.now() : null,
        payment_method: paymentMethod,
      });

      showToast(`+${seatsToAdd} terminal(ais) adicionado(s) com sucesso à licença de ${addSeatsModalLic.company_name}!`);
      setAddSeatsModalLic(null);
      setSeatsToAdd(1);
    } catch (err: any) {
      showToast('Erro ao expandir terminais: ' + err.message);
    } finally {
      setAddSeatsSubmitting(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast('Chave de licença copiada!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShareWhatsapp = (lic: KivoraLicense) => {
    const text = `*KIVORA SOFT DESKTOP — Dados de Ativação*\n\n` +
      `Olá *${lic.company_name}*,\n` +
      `A sua licença oficial Kivora foi gerada com sucesso!\n\n` +
      `• *Chave de Ativação:* \`${lic.id}\`\n` +
      `• *Plano:* ${getPlanLabel(lic.plan_type)}\n` +
      `• *Validade:* ${formatLicenseDate(lic.expires_at)}\n` +
      `• *Terminais Incluídos:* ${1 + (lic.extra_seats || 0)} Computador(es)\n\n` +
      `• *Download do Instalador:* ${window.location.origin}/#download\n\n` +
      `Para ativar: Abra o Kivora Soft no seu PC, aceda a Menu > Licenciamento e cole a chave acima.\n` +
      `Em caso de dúvidas, estamos à sua disposição!`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleUnlinkDevice = async (lic: KivoraLicense) => {
    setActionLoading(lic.id);
    try {
      await releaseLicenseFromDevice(lic.id);
      showToast('Computador desvinculado com sucesso no Firebase!');
    } catch (e: any) {
      showToast('Erro ao desvincular: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLicenseStatus = async (lic: KivoraLicense) => {
    const isSuspended = lic.status === 'revoked';

    setActionLoading(lic.id);
    try {
      if (isSuspended) {
        await reactivateLicense(lic.id);
        showToast('Licença reativada com sucesso no Firebase!');
      } else {
        await revokeLicense(lic.id);
        showToast('Licença suspensa com sucesso no Firebase!');
      }
    } catch (e: any) {
      showToast('Erro ao alterar estado: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenewLicense = async () => {
    if (!renewLicenseModal.license) return;
    const lic = renewLicenseModal.license;
    const days = renewLicenseModal.days;
    setActionLoading(lic.id);

    const matchedPlan: PlanType = days >= 365 ? 'annual' : days >= 180 ? 'semiannual' : days >= 90 ? 'quarterly' : 'monthly';
    const renewCost = pricingPlans.find(p => p.plan_type === matchedPlan)?.cost_aoa ?? 15000;

    try {
      await extendLicenseExpiry(lic.id, days);

      await recordPartnerDebt({
        partner_id: partnerCode,
        partner_name: partnerName,
        license_id: lic.id,
        company_name: lic.company_name,
        plan_type: matchedPlan,
        cost_aoa: renewCost,
        client_price_aoa: Math.round(renewCost * 1.6),
        created_at: Date.now(),
        paid: false,
        paid_at: null,
      });

      showToast(`Licença estendida por +${days} dias com sucesso!`);
      setRenewLicenseModal({ open: false, license: null, days: 30 });
    } catch (e: any) {
      // Se as regras de segurança impedirem alteração direta de expiração (Zero-Trust Anti-Tampering),
      // submete formalmente um pedido de renovação com aprovação pelo Administrador
      try {
        const isWallet = walletBalance >= renewCost;
        await createLicenseRequest({
          partner_id: partnerCode,
          partner_name: partnerName,
          company_name: lic.company_name,
          nif: lic.nif,
          client_email: lic.client_email,
          plan_type: matchedPlan,
          extra_seats: lic.extra_seats,
          price_aoa: Math.round(renewCost * 1.6),
          cost_aoa: renewCost,
          payment_method: isWallet ? 'wallet' : 'credit',
          notes: `[PEDIDO DE RENOVAÇÃO] Extensão de validade por +${days} dias para a licença existente ${lic.id}.`,
        });

        showToast(`Solicitação de renovação para ${lic.company_name} enviada à Administração com sucesso!`);
        setRenewLicenseModal({ open: false, license: null, days: 30 });
        setActiveLicensesTab('solicitacoes');
      } catch (reqErr: any) {
        showToast('Erro ao processar renovação: ' + reqErr.message);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientNif) return;
    setAddingClient(true);
    try {
      await addCompany({
        name: newClientName,
        nif: newClientNif,
        email: newClientEmail,
        phone: newClientPhone,
        address: `${newClientAddress} (Parceiro: ${partnerCode})`,
        partner_id: partnerCode,
        status: 'active',
      });
      setShowAddClientModal(false);
      setNewClientName('');
      setNewClientNif('');
      setNewClientEmail('');
      setNewClientPhone('');
      showToast('Cliente adicionado à sua carteira com sucesso!');
    } catch (e: any) {
      showToast('Erro ao cadastrar cliente: ' + e.message);
    } finally {
      setAddingClient(false);
    }
  };

  const handleSendPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || !paymentRef) return;
    setSubmittingProof(true);

    try {
      await createSupportTicket({
        company_name: partnerName,
        contact_email: session?.email || 'parceiro@kivora.ao',
        contact_phone: '+244 923 000 000',
        subject: `[LIQUIDAÇÃO DE DÍVIDAS] Pagamento de ${fmt(paymentAmount)} Kz via ${paymentBank}`,
        category: 'faturacao',
        priority: 'urgent',
        initial_message: `Comprovativo de Liquidação de Dívidas:\n\n` +
          `• Montante Transferido: ${fmt(paymentAmount)} Kz\n` +
          `• Banco de Destino: ${paymentBank} (Conta Oficial Kivora)\n` +
          `• Número do Comprovativo / Operação: ${paymentRef}\n` +
          `• Observações: ${paymentNotes || 'Comprovativo enviado via Portal do Parceiro para baixa no extrato.'}`,
        partner_id: partnerCode,
        partner_name: partnerName,
        target_type: 'admin',
        created_by_role: 'partner',
        sender_name: partnerName
      });

      setShowProofPaymentModal(false);
      setPaymentAmount(0);
      setPaymentRef('');
      setPaymentNotes('');
      showToast('Comprovativo enviado com sucesso à Direção Kivora!');
    } catch (e: any) {
      showToast('Erro ao enviar notificação: ' + e.message);
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleSendWalletTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || !paymentRef) return;
    setSubmittingProof(true);

    try {
      await createSupportTicket({
        company_name: partnerName,
        contact_email: session?.email || 'parceiro@kivora.ao',
        contact_phone: '+244 923 000 000',
        subject: `[RECARGA DE WALLET] Depósito de ${fmt(paymentAmount)} Kz via ${paymentBank}`,
        category: 'faturacao',
        priority: 'urgent',
        initial_message: `Solicitação de Recarga de Saldo Pré-Pago (Wallet):\n\n` +
          `• Montante Depositado: ${fmt(paymentAmount)} Kz\n` +
          `• Banco de Destino: ${paymentBank} (Conta Oficial Kivora)\n` +
          `• Comprovativo / Referência: ${paymentRef}\n` +
          `• Código do Parceiro: ${partnerCode}\n` +
          `• Solicitação: Creditar saldo na carteira pré-paga para emissão automática de licenças.`,
        partner_id: partnerCode,
        partner_name: partnerName,
        target_type: 'admin',
        created_by_role: 'partner',
        sender_name: partnerName
      });

      setShowTopUpWalletModal(false);
      setPaymentAmount(0);
      setPaymentRef('');
      showToast('Solicitação de recarga de carteira enviada com sucesso!');
    } catch (e: any) {
      showToast('Erro ao solicitar recarga: ' + e.message);
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('A palavra-passe deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As palavras-passe não coincidem.');
      return;
    }

    setChangingPassword(true);
    try {
      await changeUserPassword(session?.id || partnerCode, newPassword, session?.email, partnerCode);
      setPasswordSuccess(true);
      setMustChangePassword(false);
      setShowFirstLoginPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Palavra-passe pessoal atualizada com sucesso!');
    } catch (e: any) {
      setPasswordError('Erro ao atualizar palavra-passe: ' + e.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreateAdminTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTicketSubject || !adminTicketMessage) return;
    setSubmittingAdminTicket(true);

    try {
      const newTk = await createSupportTicket({
        company_name: partnerName,
        contact_email: session?.email || 'parceiro@kivora.ao',
        contact_phone: '+244 923 000 000',
        subject: `[PARCEIRO] ${adminTicketSubject}`,
        category: adminTicketCategory,
        priority: 'high',
        initial_message: adminTicketMessage,
        partner_id: partnerCode,
        partner_name: partnerName,
        target_type: 'admin',
        created_by_role: 'partner',
        sender_name: partnerName,
      });

      setShowAdminTicketModal(false);
      setAdminTicketSubject('');
      setAdminTicketMessage('');
      setSelectedTicket(newTk);
      showToast(`Chamado para o Admin #${newTk.ticket_number} enviado com sucesso!`);
    } catch (err: any) {
      showToast('Erro ao enviar chamado: ' + err.message);
    } finally {
      setSubmittingAdminTicket(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const replyText = chatReply.trim();
    if (!replyText || !selectedTicket) return;

    const optMsg = {
      id: `msg_${Date.now()}`,
      sender_name: partnerName,
      sender_role: 'partner' as const,
      sender_email: session?.email || '',
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
        sender_name: partnerName,
        sender_role: 'partner',
        sender_email: session?.email || '',
        text: replyText,
      });
    } catch (err: any) {
      showToast('Erro ao enviar mensagem: ' + err.message);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await updateTicketStatus(ticketId, 'resolved');
      showToast('Chamado marcado como Resolvido no Firebase!');
    } catch (err: any) {
      showToast('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'licencas', label: 'Minhas Licenças', icon: Key, badge: allPartnerLicenses.length },
    { id: 'clientes', label: 'Meus Clientes', icon: Users, badge: partnerClients.length },
    { id: 'emitir-licenca', label: 'Emitir Licença', icon: Plus },
    { id: 'certificados', label: 'Certificados Oficiais', icon: Award },
    { id: 'extrato', label: 'Extrato & Dívida', icon: DollarSign, alertBadge: totalPendingDebt > 0 },
    { id: 'simulador', label: 'Simulador de Lucro', icon: Calculator },
    { id: 'materiais', label: 'Kits & Downloads', icon: Package },
    { id: 'suporte', label: 'Central de Suporte', icon: Headphones, badge: clientTickets.filter((t) => t.status === 'open').length },
    { id: 'perfil', label: 'Conta & Segurança', icon: ShieldCheck },
  ];

  // ─── TELA DE ACESSO RESTRITO (SESSÃO INVÁLIDA OU EXPIRADA) ─────────────────────
  if (!session || (session.role !== 'parceiro' && session.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full surface-card bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 text-white shadow-2xl">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold font-display tracking-tight">Acesso Restrito a Parceiros</h2>
            <p className="text-xs text-slate-400">É necessário iniciar sessão com uma conta de parceiro credenciado para aceder a este portal.</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs py-3 rounded-xl transition-all shadow-xs border border-white/10 cursor-pointer active:scale-[0.98]"
          >
            Ir para Início de Sessão
          </button>
        </div>
      </div>
    );
  }

  if (partnerAccount?.status === 'suspended' || session?.status === 'suspended') {
    const whatsAppMessage = `Olá Direção Kivora / Visual Software. Sou o parceiro credenciado ${partnerName} (Código: ${partnerCode}, Email: ${session?.email || ''}). A minha conta no Portal do Parceiro encontra-se suspensa e pretendo solicitar o esclarecimento e a regularização do meu acesso.`;
    const effectivePhoneRaw = (systemSettings.phoneRaw || KIVORA_INFO.phoneRaw || '').replace(/\D/g, '');
    const waUrl = `https://wa.me/${effectivePhoneRaw}?text=${encodeURIComponent(whatsAppMessage)}`;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 selection:bg-red-600 selection:text-white font-sans">
        <div className="max-w-lg w-full surface-card bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fadeIn">
          
          {/* Ícone de Bloqueio Executivo */}
          <div className="w-14 h-14 bg-red-950/60 border border-red-800/50 rounded-xl flex items-center justify-center mx-auto text-red-400 shadow-xs">
            <Ban className="w-7 h-7 text-red-500" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-800/60 inline-block font-display">
              Acesso Suspenso pela Administração
            </span>
            <h1 className="text-xl font-bold font-display text-white tracking-tight">
              Conta de Parceiro Suspensa
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              O seu acesso ao <strong className="text-slate-200">Portal de Parceiros KIVORA</strong> foi suspenso pela Direção da <strong className="text-slate-200">VISUAL SOFTWARE</strong>.
            </p>
          </div>

          {/* Dados do Parceiro */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-left space-y-2 font-mono-num">
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400 font-sans">Parceiro:</span>
              <strong className="text-white font-sans font-semibold">{partnerName}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400 font-sans">Código PRT:</span>
              <strong className="text-amber-400 font-mono-num font-semibold">{partnerCode}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400 font-sans">Email:</span>
              <span className="text-slate-300 font-sans">{session?.email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Estado:</span>
              <span className="text-red-400 font-semibold font-display uppercase tracking-wider text-[11px]">● Suspenso</span>
            </div>
          </div>

          {/* Orientações */}
          <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl text-[11px] text-amber-200/90 leading-relaxed text-left space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-amber-300 font-display">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Motivos de Suspensão de Canal:</span>
            </p>
            <p className="text-slate-300">• Pendência financeira ou faturas vencidas além do limite de tolerância.</p>
            <p className="text-slate-300">• Auditoria de conformidade fiscal e validação de licenças emitidas.</p>
            <p className="text-slate-300">• Atualização cadastral ou renegociação de quotas operacionais.</p>
          </div>

          {/* Ações */}
          <div className="space-y-2.5 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contactar Direção via WhatsApp</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-display font-semibold text-xs py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Terminar Sessão</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  /** Sidebar partilhada: uma única renderização para desktop e drawer móvel. */
  const renderPartnerSidebar = (closeDrawer?: () => void): React.ReactElement => {
    const toNavItem = (item: (typeof navItems)[number]): PortalNavItem<PartnerSection> => {
      const Icon = item.icon;
      const base = {
        id: item.id as PartnerSection,
        label: item.label,
        icon: <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />,
      };
      if (item.alertBadge) return { ...base, badge: 'Pendente', badgeTone: 'amber' };
      if (item.badge !== undefined && item.badge > 0) return { ...base, badge: item.badge, badgeTone: 'slate' };
      return base;
    };

    const groups: PortalNavGroup<PartnerSection>[] = [
      { title: 'Operação', items: navItems.slice(0, 4).map(toNavItem) },
      { title: 'Gestão', items: navItems.slice(4).map(toNavItem) },
    ];

    return (
      <PortalSidebar<PartnerSection>
        portalLabel="Portal do Parceiro"
        groups={groups}
        activeId={activeSection}
        onSelect={(id: PartnerSection) => {
          setActiveSection(id);
          closeDrawer?.();
        }}
        onClose={closeDrawer}
        identity={
          <div className="rounded-xl bg-white/[0.06] border border-white/[0.1] p-3 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#FF6500] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {partnerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{displayPartnerName}</p>
                <p className="text-[11px] text-slate-400 font-mono-num truncate">{displayPartnerCode}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/[0.08]">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Saldo Wallet</p>
                <p className="text-sm font-bold text-white font-mono-num truncate">{fmt(walletBalance)} Kz</p>
              </div>
              <button
                onClick={() => {
                  setShowTopUpWalletModal(true);
                  closeDrawer?.();
                }}
                className="shrink-0 px-3 py-1.5 rounded-full bg-[#FF6500] hover:bg-[#EB5B00] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Recarregar</span>
              </button>
            </div>
          </div>
        }
        footer={
          <>
            <PortalFooterButton
              icon={<Video className="w-[18px] h-[18px]" strokeWidth={1.75} />}
              label="Apoio em vídeo"
              onClick={() => {
                setShowVideoModal(true);
                closeDrawer?.();
              }}
            />
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

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50 font-sans selection:bg-slate-900 selection:text-white">

      {/* Toast Flutuante de Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 surface-card bg-slate-950 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs font-semibold font-display flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Desktop (componente partilhado entre painéis) */}
      <div className="hidden lg:flex h-full shrink-0">
        {renderPartnerSidebar()}
      </div>

      {/* Drawer Mobile */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[85vw] h-full z-10 shadow-2xl">
            {renderPartnerSidebar(() => setMobileSidebarOpen(false))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden w-full">

        {/* Topbar mínima: título da secção + acção principal */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold font-display text-slate-900 tracking-tight truncate">
              {activeSection === 'dashboard' && 'Visão Geral'}
              {activeSection === 'licencas' && 'Minhas Licenças'}
              {activeSection === 'clientes' && 'Carteira de Clientes'}
              {activeSection === 'emitir-licenca' && 'Emissão de Licenças'}
              {activeSection === 'certificados' && 'Certificados Oficiais'}
              {activeSection === 'extrato' && 'Extrato & Cobrança'}
              {activeSection === 'simulador' && 'Simulador de Lucro'}
              {activeSection === 'materiais' && 'Kits Comerciais'}
              {activeSection === 'suporte' && 'Central de Suporte'}
              {activeSection === 'perfil' && 'Conta do Parceiro'}
            </h1>
          </div>

          <button
            onClick={() => setActiveSection('emitir-licenca')}
            className="bg-[#FF6500] hover:bg-[#EB5B00] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Licença</span>
          </button>
        </header>

        {/* Content Scrollable */}
        <main
          ref={mainScrollRef}
          tabIndex={0}
          className="portal-scroll-container flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4 sm:p-6 lg:p-8 space-y-6 focus:outline-none"
        >

          {/* BANNER DE AVISO DE SEGURANÇA: SENHA PROVISÓRIA */}
          {mustChangePassword && (
            <div className="p-4 sm:p-5 surface-card bg-amber-50/50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950 animate-fadeIn shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold font-display text-amber-950 flex items-center gap-2">
                    <span>Aviso de Segurança: Palavra-passe Padrão em Uso</span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-full uppercase font-display">Provisória</span>
                  </h4>
                  <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                    A sua conta de parceiro está atualmente a utilizar a palavra-passe padrão atribuída pelo sistema. Por motivos de conformidade e segurança da sua carteira comercial, altere a sua palavra-passe para uma combinação pessoal e segura.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 sm:self-center">
                <button
                  type="button"
                  onClick={() => setShowFirstLoginPasswordModal(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-display font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Alterar Palavra-passe Agora</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">

              {/* Banner Institucional Configurado no Admin */}
              {systemSettings.partnerPortalBannerUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs bg-slate-900 relative">
                  <img
                    src={systemSettings.partnerPortalBannerUrl}
                    alt="Banner Oficial do Parceiro"
                    className="w-full max-h-56 object-cover"
                  />
                </div>
              )}

              {/* Vídeo de Treinamento e Orientação Configurado no Admin */}
              {systemSettings.partnerPortalVideoUrl && (
                <div className="bg-gradient-to-r from-[#0B1528] to-[#1746A2] rounded-2xl p-5 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6500] border border-orange-500/30 flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">Vídeo de Treinamento & Orientação Oficial</h4>
                      <p className="text-xs text-slate-300">Consulte o guia audiovisual oficial com as melhores práticas de revenda e ativação.</p>
                    </div>
                  </div>
                  <a
                    href={systemSettings.partnerPortalVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#FF6500] hover:bg-[#EB5B00] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Assistir Vídeo</span>
                  </a>
                </div>
              )}

              {/* 4 Cards de Métricas Principais — Limpos e Minimalistas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Saldo da Wallet</span>
                    <button
                      onClick={() => setShowTopUpWalletModal(true)}
                      className="text-xs font-semibold text-[#FF6500] hover:text-[#EB5B00] cursor-pointer"
                    >
                      + Recarregar
                    </button>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 font-mono-num tracking-tight">{fmt(walletBalance)} Kz</p>
                    <span className="text-xs text-slate-400 block mt-1">Pronto para emissões</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Licenças Emitidas</span>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 font-mono-num tracking-tight">{allPartnerLicenses.length}</p>
                    <span className="text-xs text-slate-400 block mt-1">Total gerado</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Clientes Ativos</span>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 font-mono-num tracking-tight">{partnerClients.length}</p>
                    <span className="text-xs text-slate-400 block mt-1">Empresas na carteira</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">
                    {totalPendingDebt > 0 ? 'Dívida Pendente' : 'Margem Obtida'}
                  </span>
                  <div>
                    <p className={`text-2xl font-bold font-mono-num tracking-tight ${totalPendingDebt > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {totalPendingDebt > 0 ? `${fmt(totalPendingDebt)} Kz` : `+${fmt(totalPartnerProfit)} Kz`}
                    </p>
                    <span className="text-xs text-slate-400 block mt-1">
                      {totalPendingDebt > 0 ? 'Valor em aberto' : 'Lucro acumulado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Destaque: Licenças Aprovadas Prontas para Entrega */}
              {approvedRequestsReady.length > 0 && (
                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {approvedRequestsReady.length === 1
                              ? '1 Licença Oficial Aprovada pela Kivora'
                              : `${approvedRequestsReady.length} Licenças Oficiais Aprovadas pela Kivora`}
                          </h4>
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Pronta para Entrega
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">
                          As chaves abaixo foram emitidas e ativadas pela Kivora e já se encontram ativas. Copie e entregue diretamente aos clientes.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSection('licencas');
                        setActiveLicensesTab('solicitacoes');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                    >
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver Todas as Solicitações</span>
                    </button>
                  </div>

                  {/* Mini-cards das Licenças Aprovadas Recentes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {approvedRequestsReady.slice(0, 4).map((req) => {
                      const licKey = (req.license_id || (req as any).licenseId || (req as any).licenseKey || '').trim();
                      const associatedLic = allPartnerLicenses.find(l => l.id.toUpperCase() === licKey.toUpperCase());
                      return (
                        <div key={req.id} className="p-4 bg-slate-50/60 rounded-lg border border-slate-200 flex flex-col justify-between gap-3">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono-num text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {licKey}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                {getPlanLabel(req.plan_type)}
                              </span>
                            </div>
                            <h5 className="font-semibold text-slate-900 text-sm mt-2">{req.company_name}</h5>
                            <p className="text-[11px] text-slate-500 font-mono-num">NIF: {req.nif}</p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 flex-wrap">
                            <button
                              onClick={() => handleCopyKey(licKey)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            >
                              {copiedKey === licKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === licKey ? 'Copiada!' : 'Copiar Chave'}</span>
                            </button>

                            {associatedLic && (
                              <button
                                onClick={() => handleShareWhatsapp(associatedLic)}
                                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                const licToCert: KivoraLicense = associatedLic || {
                                  id: licKey,
                                  company_name: req.company_name,
                                  nif: req.nif,
                                  client_email: req.client_email || '',
                                  plan_type: req.plan_type,
                                  status: 'active',
                                  hardware_id: null,
                                  created_at: req.approved_at || req.created_at,
                                  expires_at: calculateExpiresAt(req.plan_type),
                                  price_aoa: req.price_aoa,
                                  notes: req.notes || 'Aprovada pela Administração Kivora',
                                  partner_id: req.partner_id || partnerCode,
                                  activated_at: null,
                                  extra_seats: req.extra_seats,
                                  is_provisional: req.is_provisional,
                                };
                                setSelectedLicenseForCert(licToCert);
                              }}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-600" />
                              <span>Certificado AGT</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dívida Alert se houver pendência */}
              {totalPendingDebt > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-950 text-sm">Saldo Devedor de {fmt(totalPendingDebt)} Kz referente a licenças emitidas a crédito</h4>
                      <p className="text-amber-900/80 text-[11px] mt-0.5">Efetue a transferência para as contas oficiais Kivora e envie o comprovativo para regularização do crédito.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowProofPaymentModal(true)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-2 rounded-lg shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Notificar Pagamento</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('extrato')}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-3 py-2 rounded-lg shrink-0 cursor-pointer shadow-xs transition-colors"
                    >
                      Ver Extrato
                    </button>
                  </div>
                </div>
              )}

              {/* Licenças Recentes */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Últimas Licenças Emitidas pela sua Conta</h3>
                    <p className="text-xs text-slate-500">Histórico de chaves KVRA geradas para a sua carteira.</p>
                  </div>
                  <button
                    onClick={() => setActiveSection('licencas')}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <span>Ver Todas ({allPartnerLicenses.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {allPartnerLicenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Key className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-xs text-slate-700">Ainda não emitiu licenças</p>
                    <p className="text-[11px]">Clique no botão "Emitir Licença" para gerar a primeira chave para o seu cliente.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">

                    {allPartnerLicenses.slice(0, 5).map((lic) => {
                      const isApprovedFromReq = myLicenseRequests.some(
                        (r) => r.status === 'approved' && r.license_id?.toUpperCase() === lic.id.toUpperCase()
                      );
                      return (
                        <div key={lic.id} className="p-4 bg-slate-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono-num font-bold text-slate-900">{lic.id}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border font-display ${
                                lic.is_provisional ? 'bg-amber-100 text-amber-900 border-amber-300' :
                                lic.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {lic.is_provisional ? '⏳ Provisória (7 Dias)' : lic.status === 'active' ? 'Ativa' : 'Suspensa'}
                              </span>
                              {isApprovedFromReq ? (
                                <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-display">
                                  ✓ Aprovada por Solicitação
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-display">
                                  ⚡ Emissão Direta
                                </span>
                              )}
                              {lic.hardware_id ? (
                                <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-display">
                                  PC Vinculado
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-display">
                                  Livre p/ Ativar
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 font-medium mt-1 font-display">
                              {lic.company_name} <span className="font-mono-num text-slate-500">(NIF: {lic.nif})</span> • Plano: {getPlanLabel(lic.plan_type)}
                            </p>
                          </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyKey(lic.id)}
                            className="p-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-xs font-display font-medium flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Copiar Chave"
                          >
                            {copiedKey === lic.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === lic.id ? 'Copiada' : 'Copiar'}</span>
                          </button>
                          <button
                            onClick={() => handleShareWhatsapp(lic)}
                            className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-display font-medium flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Enviar por WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => setSelectedLicenseForCert(lic)}
                            className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-display font-medium flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Certificado Oficial"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-600" />
                            <span>Certificado</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SECTION: MINHAS LICENÇAS */}
          {activeSection === 'licencas' && (
            <div className="surface-card bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight">Gestão de Licenças Emitidas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controlo operacional de chaves, desvinculação de terminais, renovações e emissão de certificados.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveSection('emitir-licenca')}
                    className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-display font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Emitir Nova Licença</span>
                  </button>
                </div>
              </div>

              {/* Abas: Licenças Emitidas vs Minhas Solicitações */}
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
                <button
                  onClick={() => setActiveLicensesTab('emitidas')}
                  className={`px-4 py-2 rounded-xl text-xs font-display transition-all flex items-center gap-2 cursor-pointer ${
                    activeLicensesTab === 'emitidas'
                      ? 'bg-slate-950 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Licenças Emitidas ({allPartnerLicenses.length})</span>
                </button>

                <button
                  onClick={() => setActiveLicensesTab('solicitacoes')}
                  className={`px-4 py-2 rounded-xl text-xs font-display transition-all flex items-center gap-2 cursor-pointer ${
                    activeLicensesTab === 'solicitacoes'
                      ? 'bg-slate-950 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Minhas Solicitações ({myLicenseRequests.length})</span>
                  {myLicenseRequests.filter((r) => r.status === 'pending').length > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-full">
                      {myLicenseRequests.filter((r) => r.status === 'pending').length} pendente{myLicenseRequests.filter((r) => r.status === 'pending').length > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              </div>

              {activeLicensesTab === 'emitidas' ? (
                <>
                  {/* Filtros & Pesquisa */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Pesquisar por chave KVRA, nome da empresa ou NIF..."
                        value={licenseSearch}
                        onChange={(e) => setLicenseSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 text-slate-900 font-display focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
                      {(['all', 'active', 'provisional', 'expiring', 'expired', 'revoked'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setLicenseStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-display transition-all cursor-pointer whitespace-nowrap ${
                            licenseStatusFilter === st
                              ? 'bg-slate-950 text-white shadow-xs font-semibold'
                              : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 font-medium'
                          }`}
                        >
                          {st === 'all' && `Todas (${allPartnerLicenses.length})`}
                          {st === 'active' && 'Ativas'}
                          {st === 'provisional' && 'Provisórias (7d)'}
                          {st === 'expiring' && 'A Expirar'}
                          {st === 'expired' && 'Expiradas'}
                          {st === 'revoked' && 'Suspensas'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tabela / Cards de Licenças */}
                  {filteredLicenses.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200/80 rounded-2xl">
                      <Key className="w-10 h-10 mx-auto text-slate-300" />
                      <h4 className="font-semibold text-slate-700 text-sm font-display">Nenhuma licença encontrada</h4>
                      <p className="text-xs text-slate-400">Tente ajustar os filtros de pesquisa ou emita uma nova licença.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredLicenses.map((lic) => {
                        const now = Date.now();
                        const isExpiringSoon = lic.expires_at && lic.expires_at > now && lic.expires_at - now < 7 * 86400000;
                        const isExpired = lic.expires_at && lic.expires_at <= now;
                        const isApprovedFromReq = myLicenseRequests.some(
                          (r) => r.status === 'approved' && r.license_id?.toUpperCase() === lic.id.toUpperCase()
                        );

                        return (
                          <div
                            key={lic.id}
                            className="surface-card p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono-num text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                                    {lic.id}
                                  </span>
                                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border font-display ${
                                    lic.is_provisional ? 'bg-amber-100 text-amber-900 border-amber-300' :
                                    lic.status === 'revoked' ? 'bg-red-50 text-red-700 border-red-200' :
                                    isExpired ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    isExpiringSoon ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {lic.is_provisional ? '⏳ Provisória (7 Dias)' : lic.status === 'revoked' ? 'Suspensa' : isExpired ? 'Expirada' : isExpiringSoon ? 'A Expirar em Breve' : 'Ativa'}
                                  </span>
                                  {isApprovedFromReq ? (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1 font-display">
                                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                      <span>Aprovada por Solicitação</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1 font-display">
                                      <span>⚡ Emissão Direta</span>
                                    </span>
                                  )}
                                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-display">
                                    {getPlanLabel(lic.plan_type)}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-slate-900 text-sm mt-2 font-display">{lic.company_name}</h4>
                                <p className="text-slate-500 text-xs font-mono-num">NIF: {lic.nif} • {lic.client_email || 'Email não registado'}</p>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                                <button
                                  onClick={() => handleCopyKey(lic.id)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-display font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                                >
                                  {copiedKey === lic.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedKey === lic.id ? 'Copiada' : 'Copiar Chave'}</span>
                                </button>

                                <button
                                  onClick={() => handleShareWhatsapp(lic)}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-display font-medium flex items-center gap-1.5 border border-slate-200/80 cursor-pointer shadow-xs transition-all"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </button>

                                <button
                                  onClick={() => setSelectedLicenseForCert(lic)}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-display font-medium flex items-center gap-1.5 border border-slate-200/80 cursor-pointer shadow-xs transition-all"
                                >
                                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Certificado</span>
                                </button>

                                <button
                                  onClick={() => setSelectedLicenseForInvoice(lic)}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-display font-medium flex items-center gap-1.5 border border-slate-200/80 cursor-pointer shadow-xs transition-all"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Recibo / Fatura</span>
                                </button>
                              </div>
                            </div>

                            {/* Detalhes de Ativação & Terminal */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/60 rounded-xl text-xs border border-slate-200/70">
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase font-semibold font-display block tracking-wider">Validade da Licença</span>
                                <span className="font-semibold text-slate-800 font-mono-num">{formatLicenseDate(lic.expires_at)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase font-semibold font-display block tracking-wider">Computadores / Terminais</span>
                                <span className="font-semibold text-slate-800">{1 + (lic.extra_seats || 0)} Terminal(ais)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase font-semibold font-display block tracking-wider">Hardware Fingerprint (PC)</span>
                                <span className="font-mono-num text-slate-700 text-[11px] truncate block" title={lic.hardware_id || 'Nenhum'}>
                                  {lic.hardware_id ? `Vinculado: ${lic.hardware_id.slice(0, 16)}...` : 'Livre para Ativação'}
                                </span>
                              </div>
                            </div>

                            {/* Ações Técnicas & Gestão de Terminais */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                {lic.hardware_id ? (
                                  <button
                                    onClick={() => handleUnlinkDevice(lic)}
                                    disabled={actionLoading === lic.id}
                                    className="text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl font-display font-semibold border border-amber-200/80 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                                    title="Desvincular do computador atual para permitir instalação em novo dispositivo"
                                  >
                                    <Unlink className="w-3.5 h-3.5" />
                                    <span>{actionLoading === lic.id ? 'A desvincular...' : 'Desvincular Computador'}</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-[11px] italic font-display">Nenhum computador ativado ainda</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => {
                                    setAddSeatsModalLic(lic);
                                    setSeatsToAdd(1);
                                  }}
                                  className="text-blue-800 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-display font-semibold border border-blue-200/80 flex items-center gap-1.5 cursor-pointer transition-all"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  <span>+ Postos LAN</span>
                                </button>

                                <button
                                  onClick={() => setRenewLicenseModal({ open: true, license: lic, days: 30 })}
                                  className="text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-display font-semibold border border-emerald-200/80 flex items-center gap-1.5 cursor-pointer transition-all"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Renovar / Prorrogar</span>
                                </button>

                                <button
                                  onClick={() => handleToggleLicenseStatus(lic)}
                                  disabled={actionLoading === lic.id}
                                  className={`px-3 py-1.5 rounded-xl font-display font-semibold flex items-center gap-1.5 cursor-pointer border transition-all ${
                                    lic.status === 'revoked'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                  }`}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>{lic.status === 'revoked' ? 'Reativar Licença' : 'Suspender Licença'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Sub-aba: Minhas Solicitações */
                <div className="space-y-4 pt-1">
                  <div className="p-4 surface-card bg-blue-50/50 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold font-display block">Segurança Fiscal & Privacidade Comercial</strong>
                      <span className="text-blue-950/80">
                        As licenças aprovadas pela Kivora são disponibilizadas aqui para que possa copiar e fornecer diretamente ao cliente. Nenhuma chave é enviada automaticamente aos clientes finais por WhatsApp ou e-mail.
                      </span>
                    </div>
                  </div>

                  {myLicenseRequests.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200/80 rounded-2xl">
                      <Clock className="w-10 h-10 mx-auto text-slate-300" />
                      <h4 className="font-semibold text-slate-700 text-sm font-display">Nenhuma solicitação de licença registada</h4>
                      <p className="text-xs text-slate-400">As suas solicitações de novas licenças aparecerão aqui para acompanhamento em tempo real.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {myLicenseRequests.map((req) => (
                        <div
                          key={req.id}
                          className="surface-card p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono-num text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                                  {req.id}
                                </span>
                                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border font-display ${
                                  req.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                                  req.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                  'bg-red-50 text-red-800 border-red-300'
                                }`}>
                                  {req.status === 'pending' ? '⏳ Aguarda Confirmação do Admin' :
                                   req.status === 'approved' ? '✓ Aprovada & Emitida' : '✕ Recusada'}
                                </span>
                                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-display">
                                  {getPlanLabel(req.plan_type)}
                                  {req.extra_seats > 0 ? ` (+${req.extra_seats} postos)` : ''}
                                </span>
                                <span className="text-[10px] font-mono-num text-slate-500">
                                  {new Date(req.created_at).toLocaleDateString('pt-AO')}
                                </span>
                              </div>

                              <h4 className="font-semibold text-slate-900 text-sm mt-2 font-display">{req.company_name}</h4>
                              <p className="text-slate-500 text-xs font-mono-num">
                                NIF: {req.nif} • {req.client_email || 'Email não registado'}
                              </p>
                            </div>

                            <div className="text-right flex flex-col sm:items-end justify-center">
                              <span className="text-xs text-slate-500">Custo de Atacado:</span>
                              <span className="font-bold text-sm text-slate-900 font-mono-num">{fmt(req.cost_aoa)} Kz</span>
                              <span className="text-[10px] text-slate-400 font-display">
                                {req.payment_method === 'wallet' ? 'Pago via Carteira' : 'Linha de Crédito'}
                              </span>
                            </div>
                          </div>

                          {req.status === 'approved' && req.license_id && (
                            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <div>
                                    <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block font-display">Chave de Licença Oficial (Entregar ao Cliente):</span>
                                    <span className="font-mono-num font-bold text-slate-900 text-sm select-all">{req.license_id}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleCopyKey(req.license_id!)}
                                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-display font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                                  >
                                    {copiedKey === req.license_id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedKey === req.license_id ? 'Copiada!' : 'Copiar Chave'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      const lic = allPartnerLicenses.find(l => l.id.toUpperCase() === req.license_id!.toUpperCase()) || {
                                        id: req.license_id!,
                                        company_name: req.company_name,
                                        nif: req.nif,
                                        client_email: req.client_email || '',
                                        plan_type: req.plan_type,
                                        status: 'active',
                                        hardware_id: null,
                                        created_at: req.approved_at || req.created_at,
                                        expires_at: calculateExpiresAt(req.plan_type),
                                        price_aoa: req.price_aoa,
                                        notes: req.notes,
                                        partner_id: partnerCode,
                                        activated_at: null,
                                        extra_seats: req.extra_seats,
                                        is_provisional: req.is_provisional,
                                      };
                                      setSelectedLicenseForCert(lic);
                                    }}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-display font-medium flex items-center gap-1.5 border border-slate-200/80 cursor-pointer shadow-xs transition-all"
                                    title="Visualizar e Imprimir Certificado Oficial A4"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Certificado</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      const lic = allPartnerLicenses.find(l => l.id.toUpperCase() === req.license_id!.toUpperCase()) || {
                                        id: req.license_id!,
                                        company_name: req.company_name,
                                        nif: req.nif,
                                        client_email: req.client_email || '',
                                        plan_type: req.plan_type,
                                        status: 'active',
                                        hardware_id: null,
                                        created_at: req.approved_at || req.created_at,
                                        expires_at: calculateExpiresAt(req.plan_type),
                                        price_aoa: req.price_aoa,
                                        notes: req.notes,
                                        partner_id: partnerCode,
                                        activated_at: null,
                                        extra_seats: req.extra_seats,
                                        is_provisional: req.is_provisional,
                                      };
                                      setSelectedLicenseForInvoice(lic);
                                    }}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-display font-medium flex items-center gap-1.5 border border-slate-200/80 cursor-pointer shadow-xs transition-all"
                                    title="Visualizar Fatura/Recibo A4"
                                  >
                                    <Receipt className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Recibo / Fatura</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setLicenseSearch(req.license_id!);
                                      setActiveLicensesTab('emitidas');
                                    }}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-display font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                                    title="Localizar esta licença na aba de emitidas"
                                  >
                                    <Key className="w-3.5 h-3.5" />
                                    <span>Ver nas Emitidas</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      const lic = allPartnerLicenses.find(l => l.id.toUpperCase() === req.license_id!.toUpperCase()) || {
                                        id: req.license_id!,
                                        company_name: req.company_name,
                                        nif: req.nif,
                                        client_email: req.client_email || '',
                                        plan_type: req.plan_type,
                                        status: 'active',
                                        hardware_id: null,
                                        created_at: req.approved_at || req.created_at,
                                        expires_at: calculateExpiresAt(req.plan_type),
                                        price_aoa: req.price_aoa,
                                        notes: req.notes,
                                        partner_id: partnerCode,
                                        activated_at: null,
                                        extra_seats: req.extra_seats,
                                        is_provisional: req.is_provisional,
                                      };
                                      handleShareWhatsapp(lic);
                                    }}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-display font-medium flex items-center gap-1.5 border border-slate-200/80 cursor-pointer shadow-xs transition-all"
                                    title="Enviar dados de ativação por WhatsApp"
                                  >
                                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>WhatsApp</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION: CLIENTES */}
          {activeSection === 'clientes' && (
            <div className="surface-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900">Carteira de Clientes do Parceiro</h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Empresas que utilizam licenças ativadas com o seu código de parceiro.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddClientModal(true)}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Novo Cliente</span>
                  </button>
                </div>
              </div>

              <div className="relative max-w-md w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou NIF..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 font-sans outline-none transition-all"
                />
              </div>

              {filteredClients.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200/80 rounded-2xl bg-slate-50/40">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="font-display font-bold text-slate-700 text-sm">
                    {clientSearch ? `Nenhum cliente com "${clientSearch}"` : 'Nenhum cliente registado ainda'}
                  </h4>
                  <p className="text-xs text-slate-400 font-sans">Emita uma licença ou adicione clientes manualmente à sua carteira.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden text-xs bg-white shadow-xs">
                  {filteredClients.map((c) => {
                    const clientLicenses = allPartnerLicenses.filter((l) => {
                      const cNif = (c.nif || '').trim();
                      if (cNif && !['999999999', '000000000'].includes(cNif)) {
                        return (l.nif || '').trim() === cNif;
                      }
                      return (l.company_name || '').toLowerCase().trim() === (c.name || '').toLowerCase().trim();
                    });
                    return (
                      <div key={c.id || c.nif} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-slate-900 text-sm">{c.name}</h4>
                            <span className="text-[10px] font-mono-num font-semibold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              {clientLicenses.length} Licença(s)
                            </span>
                          </div>
                          <p className="text-slate-500 font-sans text-[11px] mt-0.5">
                            NIF: <span className="font-mono-num font-medium text-slate-700">{c.nif}</span> • {c.email || 'Email não registado'} • {c.phone || 'Sem telefone'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.phone && (
                            <a
                              href={`https://wa.me/244${c.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-display font-semibold text-xs rounded-xl border border-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleSelectClientForIssue(c)}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Emitir Licença</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION: EMITIR LICENÇA */}
          {activeSection === 'emitir-licenca' && (
            <div className="surface-card p-6 sm:p-8 space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-900">Emitir Chave de Licença para Cliente</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Gere uma licença oficial com débito automático em Wallet, Linha de Crédito ou Modo Provisório de 7 Dias.
                </p>
              </div>

              {/* Status do Método de Cobrança da Emissão */}
              <div className="p-4 rounded-2xl border text-xs space-y-2 flex items-start gap-3 bg-slate-50/70 border-slate-200/80">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {canPayWithWallet ? <Wallet className="w-4 h-4 text-emerald-400" /> : canPayWithCredit ? <CreditCard className="w-4 h-4 text-blue-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-slate-900 font-display font-bold">
                      {canPayWithWallet ? 'Pagamento Direto via Saldo Wallet' : canPayWithCredit ? 'Pagamento via Linha de Crédito Autorizada' : 'Emissão Provisória (7 Dias de Graça / Grace Period)'}
                    </strong>
                    <span className={`text-[10px] font-display font-semibold px-2 py-0.5 rounded-full border ${
                      canPayWithWallet ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                      canPayWithCredit ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                    }`}>
                      {canPayWithWallet ? 'Débito Instantâneo' : canPayWithCredit ? (plan === 'lifetime' || extraSeats >= 3 ? 'Ativação 30 Dias (Crédito)' : 'Crédito Ativo') : 'Regularização Necessária'}
                    </span>
                  </div>
                  <p className="text-slate-600 font-sans text-[11px] mt-0.5 leading-relaxed">
                    {canPayWithWallet ? (
                      <>O valor de custo de atacado (<span className="font-mono-num font-semibold text-slate-800">{fmt(currentPlanCost)} Kz</span>) será debitado do seu saldo em carteira (<span className="font-mono-num font-semibold text-slate-800">{fmt(walletBalance)} Kz</span>). Licença ativada definitivamente.</>
                    ) : canPayWithCredit ? (
                      plan === 'lifetime' || extraSeats >= 3 ? (
                        <>O custo de atacado (<span className="font-mono-num font-semibold text-slate-800">{fmt(currentPlanCost)} Kz</span>) consumirá 1 slot de crédito. A licença é emitida com 30 dias de ativação provisória e torna-se definitiva após confirmação de liquidação com o Admin.</>
                      ) : (
                        <>O custo de atacado (<span className="font-mono-num font-semibold text-slate-800">{fmt(currentPlanCost)} Kz</span>) consumirá 1 slot de crédito (<span className="font-mono-num font-semibold text-slate-800">{availableCreditSlots} slots livres</span> de {creditSlotsLimit}).</>
                      )
                    ) : isOverdue ? (
                      `Emissão a crédito suspensa: possui licenças pendentes há mais de ${overdueDaysLimit} dias. Regularize o pagamento com o Admin ou utilize a Carteira Virtual.`
                    ) : (
                      `A sua quota de ${creditSlotsLimit} slots de crédito está esgotada. Efetue a liquidação de licenças pendentes ou utilize a Carteira Pré-paga.`
                    )}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] flex-wrap gap-1">
                    <span className="text-slate-500 font-sans font-medium">Modo de Processamento:</span>
                    {canPayWithWallet ? (
                      <span className="font-display font-semibold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                        ⚡ Emissão Instantânea (Débito em Carteira)
                      </span>
                    ) : canPayWithCredit && partnerAccount?.credit_issuance_mode !== 'manual_approval' ? (
                      <span className="font-display font-semibold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 flex items-center gap-1">
                        ⚡ Emissão Instantânea a Crédito (Chave Imediata)
                      </span>
                    ) : (
                      <span className="font-display font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                        🛡️ Fila de Exceção (Aprovação pelo Administrador)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {submittedRequest ? (
                <div className="surface-card bg-slate-950 text-white border-slate-800 p-8 space-y-5 text-center animate-fadeIn shadow-xl">
                  <div className="w-14 h-14 bg-amber-500/15 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-amber-400">
                      Solicitação Registada com Sucesso!
                    </h3>
                    <p className="text-xs text-slate-300 font-sans mt-1.5 max-w-md mx-auto leading-relaxed">
                      O seu pedido de emissão foi enviado em tempo real para a Administração Kivora.
                      Assim que validado pelo Administrador, a licença oficial estará disponível no seu painel.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 text-left space-y-2.5 text-xs font-sans">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Código do Pedido:</span>
                      <span className="font-mono-num font-bold text-amber-400 select-all">{submittedRequest.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Cliente / Empresa:</span>
                      <span className="font-display font-semibold text-white">{submittedRequest.company_name} (NIF: <span className="font-mono-num">{submittedRequest.nif}</span>)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Plano Solicitado:</span>
                      <span className="font-display font-semibold text-blue-400">
                        {getPlanLabel(submittedRequest.plan_type)}
                        {submittedRequest.extra_seats > 0 ? ` (+${submittedRequest.extra_seats} postos)` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Modalidade:</span>
                      <span className="font-display font-semibold text-emerald-400">
                        {submittedRequest.payment_method === 'wallet' ? 'Carteira Pré-paga' : 'Linha de Crédito'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-950/40 border border-blue-800/50 rounded-xl text-[11px] text-blue-200 text-left flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="font-display font-semibold text-white">Entrega Comercial Sob Controlo:</strong> Nenhuma chave é enviada automaticamente aos clientes finais por e-mail ou WhatsApp. O fornecimento da chave oficial ao cliente é 100% da responsabilidade do Parceiro após aprovação da licença.
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSubmittedRequest(null);
                        setCompanyName('');
                        setNif('');
                        setClientEmail('');
                      }}
                      className="bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-display font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                    >
                      + Nova Solicitação
                    </button>
                    <button
                      onClick={() => {
                        setSubmittedRequest(null);
                        setActiveSection('licencas');
                        setActiveLicensesTab('solicitacoes');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-display font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all"
                    >
                      Acompanhar Solicitações
                    </button>
                  </div>
                </div>
              ) : generatedKey ? (
                <div className="surface-card bg-slate-950 text-white border-slate-800 p-8 space-y-5 text-center animate-fadeIn shadow-xl">
                  <div className="w-14 h-14 bg-emerald-500/15 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold">
                      {generatedIsProvisional ? 'Chave Provisória Emitida!' : 'Chave KVRA Emitida com Sucesso!'}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-1">
                      A licença foi emitida e associada à sua carteira de revendedor.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80">
                    <p className="font-mono-num text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider select-all">{generatedKey}</p>
                  </div>

                  <div className="flex items-center justify-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => handleCopyKey(generatedKey)}
                      className="bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-display font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedKey === generatedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey === generatedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const lic = allPartnerLicenses.find(l => l.id.toUpperCase() === generatedKey.toUpperCase()) || {
                          id: generatedKey,
                          company_name: companyName,
                          nif: nif,
                          client_email: clientEmail,
                          plan_type: plan,
                          status: 'active',
                          hardware_id: null,
                          created_at: Date.now(),
                          expires_at: calculateExpiresAt(plan),
                          price_aoa: totalClientPrice,
                          notes: 'Emitida via Portal do Parceiro',
                          partner_id: partnerCode,
                          activated_at: null,
                          extra_seats: extraSeats,
                          is_provisional: generatedIsProvisional,
                        };
                        setSelectedLicenseForCert(lic);
                      }}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-display font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Imprimir Certificado Oficial A4"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Certificado Oficial</span>
                    </button>

                    <button
                      onClick={() => {
                        const lic = allPartnerLicenses.find(l => l.id.toUpperCase() === generatedKey.toUpperCase()) || {
                          id: generatedKey,
                          company_name: companyName,
                          nif: nif,
                          client_email: clientEmail,
                          plan_type: plan,
                          status: 'active',
                          hardware_id: null,
                          created_at: Date.now(),
                          expires_at: calculateExpiresAt(plan),
                          price_aoa: totalClientPrice,
                          notes: 'Emitida via Portal do Parceiro',
                          partner_id: partnerCode,
                          activated_at: null,
                          extra_seats: extraSeats,
                          is_provisional: generatedIsProvisional,
                        };
                        setSelectedLicenseForInvoice(lic);
                      }}
                      className="bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-xs font-display font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Imprimir Fatura / Recibo A4"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Recibo / Fatura</span>
                    </button>

                    <button
                      onClick={() => {
                        setGeneratedKey(null);
                        setCompanyName('');
                        setNif('');
                        setClientEmail('');
                        setActiveSection('licencas');
                        setActiveLicensesTab('emitidas');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-display font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Key className="w-4 h-4" />
                      <span>Ver em Minhas Licenças</span>
                    </button>
                  </div>

                  <div className="p-3.5 bg-blue-950/40 border border-blue-800/50 rounded-xl text-[11px] text-blue-200 text-left flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="font-display font-semibold text-white">Entrega Comercial Sob Controlo:</strong> Nenhuma chave foi enviada ao cliente final por WhatsApp ou e-mail. Copie a chave acima e forneça diretamente ao cliente junto com a sua fatura ou contrato.
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setGeneratedKey(null);
                        setCompanyName('');
                        setNif('');
                        setClientEmail('');
                      }}
                      className="text-xs font-display font-semibold text-slate-400 hover:text-white underline cursor-pointer transition-colors"
                    >
                      + Emitir Outra Licença
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
                  {/* Seleção rápida de cliente existente */}
                  {partnerClients.length > 0 && (
                    <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Preenchimento Rápido com Cliente da Carteira</label>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          const c = partnerClients.find((item) => (item.id && item.id === val) || item.nif === val);
                          if (c) {
                            setCompanyName(c.name);
                            setNif(c.nif);
                            setClientEmail(c.email || '');
                          }
                        }}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-display font-medium text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                      >
                        <option value="">-- Selecione uma empresa já cadastrada ou digite abaixo --</option>
                        {partnerClients.map((c) => (
                          <option key={c.id || c.nif} value={c.id || c.nif}>
                            {c.name} {c.nif ? `(NIF: ${c.nif})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Nome da Empresa / Cliente *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pastelaria Luanda, Lda"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border border-slate-200/80 rounded-xl px-3.5 py-2.5 bg-slate-50/70 font-sans text-xs focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">NIF da Empresa *</label>
                      <input
                        type="text"
                        required
                        placeholder="5412345678"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        className="w-full border border-slate-200/80 rounded-xl px-3.5 py-2.5 bg-slate-50/70 font-mono-num font-bold text-xs focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Email do Cliente (Para Envio de Credenciais)</label>
                    <input
                      type="email"
                      placeholder="geral@pastelaria.ao"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full border border-slate-200/80 rounded-xl px-3.5 py-2.5 bg-slate-50/70 font-sans text-xs focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Plano Selecionado</label>
                      <select
                        value={plan}
                        onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                        className="w-full border border-slate-200/80 rounded-xl px-3.5 py-2.5 bg-white font-display font-semibold text-xs focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                      >
                        {pricingPlans.map((p) => (
                          <option key={p.plan_type} value={p.plan_type}>
                            {p.label} (Custo Atacado: {fmt(p.cost_aoa)} Kz)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Preço Base do Software p/ Cliente (Kz)</label>
                      <input
                        type="number"
                        min={basePlanCost}
                        value={priceAoa}
                        onChange={(e) => setPriceAoa(Number(e.target.value))}
                        className="w-full border border-slate-200/80 rounded-xl px-3.5 py-2.5 bg-slate-50/70 font-mono-num font-bold text-xs focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Seletor de Postos Extras com Política por Nível */}
                  <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="font-display font-bold text-slate-800 uppercase text-[10px] flex items-center gap-1.5 tracking-wider">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Computadores Adicionais / Rede Local (Extra Seats)</span>
                      </label>
                      <span className="text-[10px] font-mono-num font-semibold text-blue-700 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                        Nível {partnerAccount?.tier?.toUpperCase() || 'BRONZE'}: {fmt(partnerSeatCost)} Kz / posto
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 8, 10].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setExtraSeats(st)}
                          className={`py-1.5 px-1 rounded-xl text-xs font-mono-num font-semibold border transition-all cursor-pointer ${
                            extraSeats === st
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          +{st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-sans">
                      <span>Total de Computadores: <strong className="text-slate-900 font-display font-bold">{1 + extraSeats} PC(s)</strong></span>
                      {extraSeats > 0 && (
                        <span>Custo Terminais: <strong className="text-blue-700 font-mono-num font-bold">{fmt(totalExtraSeatsCost)} Kz</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Resumo Financeiro da Operação com Discriminação Completa */}
                  <div className="p-5 surface-card bg-slate-950 text-white rounded-2xl space-y-2.5 text-xs shadow-md border border-slate-800">
                    <div className="flex justify-between items-center text-slate-300 font-sans">
                      <span>Custo Licença Base (Atacado):</span>
                      <span className="font-mono-num text-slate-200 font-bold">{fmt(basePlanCost)} Kz</span>
                    </div>
                    {extraSeats > 0 && (
                      <div className="flex justify-between items-center text-blue-300 font-sans">
                        <span>{extraSeats} Posto(s) Extra ({fmt(partnerSeatCost)} Kz/unid):</span>
                        <span className="font-mono-num font-bold">+{fmt(totalExtraSeatsCost)} Kz</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-amber-400 font-bold pt-1 border-t border-slate-800">
                      <span className="font-sans">Total Débito Kivora (a liquidar/wallet):</span>
                      <strong className="font-mono-num text-sm">{fmt(currentTotalCost)} Kz</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 font-sans">
                      <span>Preço Cobrado ao Cliente Final:</span>
                      <strong className="text-white font-mono-num text-sm">{fmt(totalClientPrice)} Kz</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="font-display font-bold text-emerald-400">Sua Margem Líquida Estimada:</span>
                      <strong className="text-emerald-400 font-mono-num text-lg font-black">+{fmt(partnerMargin)} Kz</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full text-white font-display font-semibold text-xs py-3.5 rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${
                      canPayWithWallet
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : canPayWithCredit && partnerAccount?.credit_issuance_mode !== 'manual_approval'
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-amber-600 hover:bg-amber-500'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span>
                      {submitting
                        ? 'A Processar...'
                        : canPayWithWallet
                        ? '⚡ Emitir Licença Imediata (Débito em Carteira)'
                        : canPayWithCredit && partnerAccount?.credit_issuance_mode !== 'manual_approval'
                        ? '⚡ Emitir Licença Imediata a Crédito'
                        : 'Solicitar Liberação Excepcional ao Administrador'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION: EXTRATO DE DÍVIDA */}
          {activeSection === 'extrato' && (
            <div className="surface-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900">Extrato Financeiro & Cobrança Híbrida</h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Acompanhamento de liquidações via Wallet, lançamentos a crédito e comprovativos enviados.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setShowTopUpWalletModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Recarregar Wallet</span>
                  </button>

                  <button
                    onClick={() => setShowProofPaymentModal(true)}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Liquidar Dívida</span>
                  </button>

                  <button
                    onClick={() => {
                      const headers = ['Licenca_ID', 'Empresa', 'Plano', 'Custo_Devido_Kivora_AOA', 'Cobrado_Cliente_AOA', 'Margem_AOA', 'Metodo', 'Estado', 'Data'];
                      const rows = partnerDebts.map(d => [
                        d.license_id,
                        `"${(d.company_name || '').replace(/"/g, '""')}"`,
                        d.plan_type,
                        d.cost_aoa,
                        d.client_price_aoa,
                        Math.max(0, (d.client_price_aoa || 0) - d.cost_aoa),
                        d.payment_method || (d.paid ? 'wallet' : 'credit'),
                        d.paid ? 'Liquidado' : d.is_provisional ? 'Provisório' : 'Pendente',
                        new Date(d.created_at).toISOString().split('T')[0]
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const link = document.createElement('a');
                      link.setAttribute('href', encodeURI(csvContent));
                      link.setAttribute('download', `extrato_parceiro_${partnerCode}_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 font-display font-medium text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="surface-card p-5 space-y-1">
                  <span className="text-[10px] uppercase font-display font-bold text-slate-500 tracking-wider block">Saldo na Carteira (Wallet)</span>
                  <span className="text-xl font-bold font-mono-num text-emerald-600 block">
                    {fmt(walletBalance)} Kz
                  </span>
                  <span className="text-[10px] text-emerald-700 font-sans font-medium block">Créditos pré-pagos</span>
                </div>

                <div className="surface-card p-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-display font-bold text-slate-500 tracking-wider block">Slots de Crédito</span>
                    {isOverdue && (
                      <span className="text-[9px] bg-red-500/10 text-red-700 border border-red-500/20 px-1.5 py-0.5 rounded font-display font-bold">Bloqueado</span>
                    )}
                  </div>
                  <span className={`text-xl font-bold font-mono-num block ${availableCreditSlots > 0 && !isOverdue ? 'text-blue-600' : 'text-amber-600'}`}>
                    {availableCreditSlots} / {creditSlotsLimit} Livres
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans block">
                    {activeSlotsInUse} licenças ativas a crédito
                  </span>
                </div>

                <div className="surface-card p-5 space-y-1">
                  <span className="text-[10px] uppercase font-display font-bold text-slate-500 tracking-wider block">Dívida Total Pendente</span>
                  <span className={`text-xl font-bold font-mono-num block ${totalPendingDebt > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {fmt(totalPendingDebt)} Kz
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans block">A regularizar</span>
                </div>

                <div className="surface-card p-5 space-y-1">
                  <span className="text-[10px] uppercase font-display font-bold text-slate-500 tracking-wider block">Total Já Liquidado</span>
                  <span className="text-xl font-bold text-slate-900 font-mono-num block">
                    {fmt(totalPaidToKivora)} Kz
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans block">Histórico pago</span>
                </div>
              </div>

              {/* Card de Coordenadas Bancárias */}
              <div className="surface-card bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-display font-bold uppercase tracking-wider text-blue-400">Coordenadas Bancárias Oficiais KIVORA</h4>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">Efetue a transferência para liquidar débitos ou recarregar a sua carteira pré-paga.</p>
                  </div>
                  {totalPendingDebt > 0 && (
                    <span className="text-amber-400 font-mono-num font-bold text-xs bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
                      Pendente: {fmt(totalPendingDebt)} Kz
                    </span>
                  )}
                </div>

                {hasBank1 || hasBank2 ? (
                  <div className={`grid ${hasBank1 && hasBank2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 text-xs`}>
                    {hasBank1 && (
                      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block">{officialBank1Name} (Kz) — {officialBeneficiary}</span>
                          <strong className="text-white font-mono-num text-xs">{officialBank1Iban}</strong>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(officialBank1Iban.replace(/\s/g, ''));
                            notify.success(`IBAN ${officialBank1Name} copiado para a área de transferência!`);
                          }}
                          className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                          title="Copiar IBAN"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {hasBank2 && (
                      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block">{officialBank2Name} (Kz) — {officialBeneficiary}</span>
                          <strong className="text-white font-mono-num text-xs">{officialBank2Iban}</strong>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(officialBank2Iban.replace(/\s/g, ''));
                            notify.success(`IBAN ${officialBank2Name} copiado para a área de transferência!`);
                          }}
                          className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                          title="Copiar IBAN"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 font-sans">
                    Nenhuma conta bancária oficial configurada de momento. Por favor contacte o administrador da Kivora.
                  </div>
                )}
              </div>

              {/* Tabela de Lançamentos de Dívida */}
              {effectiveDebts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200/80 rounded-2xl bg-slate-50/40">
                  <DollarSign className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-display font-bold text-slate-700 text-sm">Nenhum registo financeiro ainda</p>
                  <p className="text-xs text-slate-400 font-sans">Emita a sua primeira licença para ver os registos financeiros aqui.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden text-xs bg-white shadow-xs">
                  {effectiveDebts.map((debt) => (
                    <div key={debt.id} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-bold text-slate-900 text-sm">{debt.company_name}</p>
                          <span className={`font-display font-semibold text-[10px] px-2 py-0.5 rounded-full border ${
                            debt.paid ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' :
                            debt.is_provisional ? 'bg-amber-500/10 text-amber-900 border-amber-500/20' :
                            'bg-amber-500/10 text-amber-800 border-amber-500/20'
                          }`}>
                            {debt.paid ? '✓ Liquidado à Kivora' : debt.is_provisional ? 'Provisório (7 Dias)' : 'Dívida Pendente'}
                          </span>
                          <span className="text-[10px] font-mono-num text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                            {debt.payment_method === 'wallet' ? 'Via Wallet' : debt.payment_method === 'credit' ? 'Linha de Crédito' : 'Provisória'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-sans mt-0.5">
                          <span className="font-mono-num">{debt.license_id}</span> • Plano: <span className="font-display font-medium text-slate-600">{debt.plan_type}</span> • <span className="font-mono-num">{new Date(debt.created_at).toLocaleDateString('pt-AO')}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono-num font-bold text-slate-900 text-sm">{fmt(debt.cost_aoa)} Kz</p>
                        <p className="text-[10px] text-slate-400 font-sans">custo atacado</p>
                        {debt.client_price_aoa > 0 && (
                          <p className="text-[10px] text-emerald-600 font-display font-semibold mt-0.5">
                            Cobrado: <span className="font-mono-num">{fmt(debt.client_price_aoa)} Kz</span> (Margem: <span className="font-mono-num font-bold">+{fmt(Math.max(0, debt.client_price_aoa - debt.cost_aoa))} Kz</span>)
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: SIMULADOR DE LUCRO */}
          {activeSection === 'simulador' && (
            <div className="surface-card p-6 sm:p-8 space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-900">Simulador de Rentabilidade & Lucro do Parceiro</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Projete os seus ganhos mensais e anuais revendendo licenças Kivora para empresas e comércios da sua região.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parâmetros do Simulador */}
                <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4 text-xs">
                  <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-slate-950" />
                    <span>Configurar Volume de Vendas</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-display font-semibold text-slate-700 mb-1">
                        <span>Clientes com Plano Mensal:</span>
                        <span className="text-emerald-700 font-mono-num font-bold">{simMonthlyClients} empresas</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simMonthlyClients}
                        onChange={(e) => setSimMonthlyClients(Number(e.target.value))}
                        className="w-full accent-slate-950"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-display font-semibold text-slate-700 mb-1">
                        <span>Preço Cobrado no Plano Mensal:</span>
                        <span className="font-mono-num font-bold text-slate-900">{fmt(simMonthlySalePrice)} Kz</span>
                      </div>
                      <input
                        type="number"
                        min={15000}
                        step={5000}
                        value={simMonthlySalePrice}
                        onChange={(e) => setSimMonthlySalePrice(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono-num font-bold text-xs focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                      />
                      <span className="text-[10px] text-slate-400 font-sans">Custo Atacado Kivora: <span className="font-mono-num">15.000 Kz/mês</span></span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="flex justify-between font-display font-semibold text-slate-700 mb-1">
                        <span>Clientes com Plano Anual:</span>
                        <span className="text-emerald-700 font-mono-num font-bold">{simAnnualClients} empresas</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simAnnualClients}
                        onChange={(e) => setSimAnnualClients(Number(e.target.value))}
                        className="w-full accent-slate-950"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-display font-semibold text-slate-700 mb-1">
                        <span>Preço Cobrado no Plano Anual:</span>
                        <span className="font-mono-num font-bold text-slate-900">{fmt(simAnnualSalePrice)} Kz</span>
                      </div>
                      <input
                        type="number"
                        min={120000}
                        step={10000}
                        value={simAnnualSalePrice}
                        onChange={(e) => setSimAnnualSalePrice(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono-num font-bold text-xs focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                      />
                      <span className="text-[10px] text-slate-400 font-sans">Custo Atacado Kivora: <span className="font-mono-num">120.000 Kz/ano</span></span>
                    </div>
                  </div>
                </div>

                {/* Projeção de Resultados */}
                {(() => {
                  const monthlyProfitPerClient = Math.max(0, simMonthlySalePrice - 15000);
                  const totalMonthlyProfit = simMonthlyClients * monthlyProfitPerClient;

                  const annualProfitPerClient = Math.max(0, simAnnualSalePrice - 120000);
                  const totalAnnualProfit = simAnnualClients * annualProfitPerClient;

                  const projectedAnnualTotal = (totalMonthlyProfit * 12) + totalAnnualProfit;

                  return (
                    <div className="surface-card bg-slate-950 text-white rounded-2xl space-y-4 text-xs shadow-xl border border-slate-800 p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-display font-bold uppercase tracking-wider text-[10px]">
                          <Award className="w-4 h-4" />
                          <span>Projeção de Lucro Líquido do Parceiro</span>
                        </div>

                        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1">
                          <span className="text-slate-400 text-[11px] font-sans block">Renda Recorrente Mensal Estimada:</span>
                          <p className="text-2xl font-black text-emerald-400 font-mono-num">
                            +{fmt(totalMonthlyProfit)} Kz<span className="text-xs text-slate-400 font-sans font-normal">/mês</span>
                          </p>
                        </div>

                        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1">
                          <span className="text-slate-400 text-[11px] font-sans block">Lucro de Vendas Anuais:</span>
                          <p className="text-2xl font-black text-white font-mono-num">
                            +{fmt(totalAnnualProfit)} Kz
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-slate-300 text-xs font-display font-semibold block">Lucro Total Anual Projetado:</span>
                          <p className="text-3xl font-black text-emerald-400 font-mono-num mt-1">
                            +{fmt(projectedAnnualTotal)} Kz<span className="text-xs text-slate-400 font-sans font-normal">/ano</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveSection('emitir-licenca')}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-xs py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4 active:scale-[0.99]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Emitir Licença Agora</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* SECTION: MATERIAIS & DOWNLOADS */}
          {activeSection === 'materiais' && (
            <div className="space-y-6">
              <div className="surface-card p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900">Kits de Venda, Manuais & Downloads Oficiais</h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Materiais comerciais e técnicos para apresentar e instalar o Kivora Soft Desktop nos seus clientes.
                  </p>
                </div>

                {/* Softwares Oficiais Kivora */}
                <div className="space-y-3">
                  <h3 className="text-xs font-display font-bold uppercase text-slate-500 tracking-wider">Instaladores Oficiais Kivora Desktop</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="surface-card bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-num text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/50">
                          {CURRENT_RELEASE.version} Oficial
                        </span>
                        <span className="text-slate-400 text-xs font-mono-num">{CURRENT_RELEASE.fileSize}</span>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-white">Instalador Completo Windows (x64)</h4>
                        <p className="text-slate-400 font-sans text-xs mt-0.5">Para Windows 11, Windows 10 e Windows Server.</p>
                      </div>
                      <a
                        href={CURRENT_RELEASE.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-display font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Baixar Setup Oficial (.exe)</span>
                      </a>
                    </div>

                    <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-num text-xs font-bold text-blue-700 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                          Banco de Dados Local
                        </span>
                        <span className="text-slate-500 text-xs font-mono-num">15 MB</span>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">Motor SQLite & Drivers de Impressão Térmica</h4>
                        <p className="text-slate-500 font-sans text-xs mt-0.5">Drivers ESC/POS para gavetas e impressoras de talão 80mm/58mm.</p>
                      </div>
                      <button
                        onClick={() => notify.info('Download do pacote de drivers de impressão iniciado!')}
                        className="w-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-display font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Baixar Drivers Térmicos</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Materiais Comerciais */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-display font-bold uppercase text-slate-500 tracking-wider">Materiais Comerciais & Certificação AGT</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { titulo: 'Apresentação Comercial PDF', desc: 'Slides prontos para reuniões com clientes e demonstração.', tam: '4.2 MB' },
                      { titulo: 'Tabela de Preços & Margens', desc: 'Preços recomendados e cálculo de margens de revenda.', tam: '1.1 MB' },
                      { titulo: 'Certificado de Conformidade AGT', desc: 'Comprovativo oficial de validação fiscal para o cliente.', tam: '0.8 MB' },
                    ].map((m, i) => (
                      <div key={i} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                        <FileText className="w-6 h-6 text-slate-950" />
                        <h4 className="font-display font-bold text-slate-900 text-xs">{m.titulo}</h4>
                        <p className="text-[11px] text-slate-500 font-sans">{m.desc}</p>
                        <button
                          onClick={() => notify.info(`Download de ${m.titulo} iniciado.`)}
                          className="w-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-display font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar (<span className="font-mono-num">{m.tam}</span>)</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ferramentas de Suporte Remoto */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-display font-bold uppercase text-slate-500 tracking-wider">Softwares Recomendados para Suporte Remoto ao Cliente</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { nome: 'AnyDesk', desc: 'Acesso rápido para suporte aos seus clientes.', url: 'https://anydesk.com/pt/downloads' },
                      { nome: 'RustDesk', desc: 'Alternativa open-source rápida e segura.', url: 'https://rustdesk.com' },
                      { nome: 'TeamViewer', desc: 'Plataforma corporativa de assistência remota.', url: 'https://www.teamviewer.com' },
                    ].map((tool, i) => (
                      <a
                        key={i}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-slate-50/70 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <strong className="text-xs font-display font-bold text-slate-900 block">{tool.nome}</strong>
                          <span className="text-[10px] text-slate-500 font-sans">{tool.desc}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION: SUPORTE MULTILATERAL */}
          {activeSection === 'suporte' && (
            <div className="space-y-6">

              {/* Header do Suporte */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900">Central de Suporte & Atendimento</h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Atenda os chamados dos seus clientes ou solicite apoio direto via videochamada à administração central da Kivora.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowPurchaseMinutesModal(true)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 font-display font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>+ Recarregar Minutos</span>
                  </button>

                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-display font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Abrir Videochamada</span>
                  </button>

                  <button
                    onClick={() => setShowAdminTicketModal(true)}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Falar com o Admin (Kivora Central)</span>
                  </button>
                </div>
              </div>

              {/* Banner de Saldo de Minutos de Vídeo para Parceiros */}
              <div className="surface-card bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-display font-bold tracking-tight text-white">Assistência Remota em Direto (Google Meet / Jitsi)</h3>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-display font-semibold px-2.5 py-0.5 rounded-full uppercase">
                        Tarifa Parceiro
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans mt-1 max-w-xl leading-relaxed">
                      Apoio avançado de engenharia nível 2, auditoria de bases de dados e diagnóstico de sincronização multiloja em direto.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-display font-bold text-slate-400 tracking-wider block">
                      Saldo do Canal
                    </span>
                    <span className="font-mono-num text-xl font-bold text-emerald-400 block">
                      {Math.floor((videoAccount?.remainingSeconds || 0) / 60)} min {((videoAccount?.remainingSeconds || 0) % 60)}s
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                      Gasto: <span className="font-mono-num">{videoAccount?.totalMinutesSpent || 0} min</span> utilizados
                    </span>
                  </div>

                  <button
                    onClick={() => setShowPurchaseMinutesModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98]"
                  >
                    Recarregar (Wallet / Multicaixa)
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 text-xs">
                <button
                  onClick={() => { setSupportTab('clientes'); setSelectedTicket(null); }}
                  className={`px-3.5 py-1.5 rounded-xl font-display font-semibold transition-all cursor-pointer ${
                    supportTab === 'clientes'
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Chamados dos Meus Clientes ({clientTickets.length})
                </button>

                <button
                  onClick={() => { setSupportTab('admin'); setSelectedTicket(null); }}
                  className={`px-3.5 py-1.5 rounded-xl font-display font-semibold transition-all cursor-pointer ${
                    supportTab === 'admin'
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Minhas Conversas com o Admin Kivora ({adminTickets.length})
                </button>
              </div>

              {/* Grid: Lista de Tickets + Chat */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Lista de Chamados */}
                <div className="lg:col-span-5 surface-card p-5 space-y-4">
                  <h3 className="text-xs font-display font-bold uppercase text-slate-500 tracking-wider">
                    {supportTab === 'clientes' ? 'Tickets da Carteira de Clientes' : 'Chamados com a Direção Kivora'}
                  </h3>

                  {((supportTab === 'clientes' ? clientTickets : adminTickets).length === 0) ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Headphones className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-display font-bold text-xs text-slate-700">Nenhum chamado ativo nesta aba</p>
                      <p className="text-[11px] text-slate-400 font-sans">
                        {supportTab === 'clientes'
                          ? 'Os seus clientes poderão abrir tickets através da Área do Cliente deles.'
                          : 'Clique em "Falar com o Admin" para abrir uma solicitação.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {(supportTab === 'clientes' ? clientTickets : adminTickets).map((tk) => {
                        const isSel = selectedTicket?.id === tk.id;
                        return (
                          <div
                            key={tk.id}
                            onClick={() => setSelectedTicket(tk)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSel
                                ? 'bg-emerald-500/5 border-emerald-500/30 shadow-xs'
                                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono-num text-[10px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                                {tk.ticket_number}
                              </span>
                              <span className={`text-[10px] font-display font-semibold px-2 py-0.5 rounded-full border ${
                                tk.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' :
                                tk.status === 'in_progress' ? 'bg-blue-500/10 text-blue-800 border-blue-500/20' :
                                'bg-amber-500/10 text-amber-800 border-amber-500/20'
                              }`}>
                                {tk.status === 'resolved' ? 'Resolvido' : tk.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                              </span>
                            </div>

                            <h4 className="font-display font-bold text-slate-900 text-xs line-clamp-1">{tk.subject}</h4>
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-sans">
                              <span className="font-display font-semibold text-slate-800 truncate max-w-[160px]">{tk.company_name}</span>
                              <span className="font-mono-num font-semibold text-emerald-700">{tk.messages.length} msg(s)</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Chat / Resposta ao Chamado */}
                <div className="lg:col-span-7 surface-card flex flex-col h-[560px] overflow-hidden">
                  {selectedTicket ? (
                    <>
                      {/* Header do Chat */}
                      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num text-xs font-bold text-slate-900">{selectedTicket.ticket_number}</span>
                            <span className="text-slate-300">•</span>
                            <h4 className="font-display font-bold text-slate-900 text-xs">{selectedTicket.subject}</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                            Empresa: <strong className="text-slate-800 font-display">{selectedTicket.company_name}</strong> ({selectedTicket.contact_email})
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedTicket.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolveTicket(selectedTicket.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-[10px] px-3 py-1.5 rounded-lg shadow-xs cursor-pointer active:scale-95"
                            >
                              Marcar Resolvido
                            </button>
                          )}
                          <span className={`text-[10px] font-display font-semibold px-2.5 py-1 rounded-full border ${
                            selectedTicket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' :
                            selectedTicket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-800 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-800 border-amber-500/20'
                          }`}>
                            {selectedTicket.status === 'resolved' ? 'Resolvido' : selectedTicket.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                          </span>
                        </div>
                      </div>

                      {/* Thread de Mensagens */}
                      <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/40">
                        {selectedTicket.messages.map((msg, i) => {
                          const isMe = msg.sender_role === 'partner';
                          return (
                            <div
                              key={msg.id || i}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[10px] font-display font-medium text-slate-400 mb-1 px-1">
                                {msg.sender_name} ({msg.sender_role === 'partner' ? 'Você (Parceiro)' : msg.sender_role === 'client' ? 'Cliente' : 'Admin Central'})
                              </span>
                              <div className={`p-3.5 rounded-2xl text-xs max-w-md font-sans ${
                                isMe
                                  ? 'bg-slate-950 text-white rounded-br-xs shadow-xs'
                                  : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs shadow-xs'
                              }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                <span className={`text-[9px] font-mono-num font-medium mt-1.5 block text-right ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Input de Envio de Resposta */}
                      <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Escreva a sua resposta em tempo real..."
                          value={chatReply}
                          onChange={(e) => setChatReply(e.target.value)}
                          className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white font-sans transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!chatReply.trim()}
                          className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                      <h4 className="font-display font-bold text-slate-700 text-sm">Selecione um chamado ao lado</h4>
                      <p className="text-xs text-slate-400 font-sans mt-1 max-w-xs">
                        Veja o histórico de mensagens e responda diretamente pelo portal.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* SECTION: PERFIL & SENHA */}
          {activeSection === 'perfil' && (
            <div className="surface-card p-6 sm:p-8 space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-900">Conta do Parceiro & Segurança</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Informações da sua credencial de parceiro credenciado e alteração de palavra-passe.
                </p>
              </div>

              {/* Card de Dados do Parceiro */}
              <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center text-lg font-display font-bold shadow-xs">
                    {partnerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">{partnerName}</h3>
                    <p className="text-xs font-mono-num font-bold text-emerald-700">{partnerCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-display font-bold tracking-wider block">Email de Acesso</span>
                    <span className="font-sans font-medium text-slate-800">{session?.email || 'parceiro@kivora.ao'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-display font-bold tracking-wider block">Nível de Parceria</span>
                    <span className="font-display font-semibold text-emerald-700 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>{partnerAccount?.tier?.toUpperCase() || 'CREDENCIADO'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-display font-bold tracking-wider block">Quota de Slots a Crédito</span>
                    <span className="font-mono-num font-semibold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 inline-block">
                      {creditSlotsLimit} Licenças Simultâneas
                    </span>
                  </div>
                </div>
              </div>

              {/* Personalização de Identidade Visual & Logótipo */}
              <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>Identidade Visual & Logótipo da Empresa Parceira</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Este logótipo será impresso nos seus certificados oficiais de técnico credenciado e propostas.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePartnerBranding} className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shadow-xs shrink-0">
                      {partnerLogoUrl ? (
                        <img src={partnerLogoUrl} alt="Logo Parceiro" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="font-display font-semibold text-slate-400 text-xs text-center">Sem Logo</span>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">URL da Imagem / Logótipo (PNG ou JPG)</label>
                      <input
                        type="url"
                        value={partnerLogoUrl}
                        onChange={(e) => setPartnerLogoUrl(e.target.value)}
                        placeholder="https://suaempresa.ao/logo.png"
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 font-mono-num text-xs transition-all"
                      />
                    </div>
                  </div>

                  {partnerBrandingSaved && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl font-display font-semibold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Logótipo corporativo guardado com sucesso!</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-[0.98]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Gravar Logótipo</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Formulário de Alteração de Senha */}
              <div className="pt-4 border-t border-slate-200/80">
                <h3 className="text-sm font-display font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Alterar Palavra-passe de Acesso</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mb-4">Defina uma nova palavra-passe segura para entrar no portal.</p>

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Nova Palavra-passe</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-900 focus:bg-white font-sans text-xs transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Confirmar Nova Palavra-passe</label>
                    <input
                      type="password"
                      required
                      placeholder="Repita a palavra-passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-900 focus:bg-white font-sans text-xs transition-all"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 rounded-xl font-display font-medium text-xs">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl font-display font-semibold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Palavra-passe atualizada com sucesso no Firebase!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                  >
                    {changingPassword ? 'A Atualizar...' : 'Atualizar Palavra-passe'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECÇÃO: MEUS CERTIFICADOS OFICIAIS (VISUAL SOFTWARE & KIVORA SOFT)
              ========================================================================= */}
          {activeSection === 'certificados' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="surface-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-[10px] font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-slate-200/80">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Documentação Institucional & Credenciação Oficial</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-2">
                       Comprovativo Oficial de Parceiro Revendedor
                    </h2>
                    <p className="text-xs sm:text-sm font-sans text-slate-500 mt-1">
                      Aceda e imprima o seu comprovativo oficial de revenda credenciada emitido pela <strong>VISUAL SOFTWARE, LDA.</strong> com validade perante clientes e instituições de Angola.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowOfficialCertificatesModal(true)}
                    className="bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Visualizar & Imprimir (A4)</span>
                  </button>
                </div>

                {/* Card do Documento Oficial Único */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-5 hover:border-slate-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Award className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-display font-semibold text-slate-500 uppercase tracking-wider">
                            Certificação Oficial de Parceiro
                          </span>
                          <span className="text-[10px] font-display font-bold uppercase text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            ● CREDENCIADO
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-slate-950 text-lg sm:text-xl">
                          COMPROVATIVO DE PARCEIRO REVENDEDOR
                        </h3>
                        <p className="text-xs font-display font-semibold text-blue-700 uppercase tracking-wider">
                          CREDENCIADO KIVORA SOFT
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowOfficialCertificatesModal(true)}
                      className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs self-start sm:self-center shrink-0 active:scale-[0.98]"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Abrir Comprovativo Oficial</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                      <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-wider">Entidade Titular</p>
                      <p className="font-display font-semibold text-slate-900 mt-0.5 truncate">{partnerName}</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                      <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-wider">N.º de Credencial</p>
                      <p className="font-mono-num font-bold text-slate-900 mt-0.5">{partnerCode}</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                      <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-wider">Certificação de Software</p>
                      <p className="font-mono-num font-bold text-slate-900 mt-0.5">FE/387/AGT/2026</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    Este documento certifica que a entidade acima identificada é Parceiro Revendedor oficialmente credenciado pela Visual Software, encontrando-se devidamente autorizado a comercializar, promover e revender o software <strong>KIVORA SOFT</strong> nos termos do Contrato de Parceria de Revenda.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: RECARGA DE WALLET */}
      {showTopUpWalletModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-slate-900">Recarregar Saldo na Wallet</h3>
                  <p className="text-xs text-slate-500 font-sans">Créditos pré-pagos para emissão instantânea</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopUpWalletModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="surface-card bg-slate-950 text-white rounded-2xl p-4 space-y-2 text-xs border border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 border-b border-white/10 pb-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-display font-bold tracking-wider block">Contas Bancárias Oficiais para Depósito</span>
                <span className="text-[10px] text-slate-300 font-sans">Titular: <strong className="text-white font-display">{officialBeneficiary}</strong></span>
              </div>
              <div className="space-y-1 font-mono-num text-[11px] pt-1">
                {hasBank1 && <p className="font-sans text-slate-300">• {officialBank1Name}: <strong className="text-emerald-400 font-mono-num">{officialBank1Iban}</strong></p>}
                {hasBank2 && <p className="font-sans text-slate-300">• {officialBank2Name}: <strong className="text-blue-400 font-mono-num">{officialBank2Iban}</strong></p>}
                {!hasBank1 && !hasBank2 && <p className="text-slate-400 font-sans">Nenhuma conta oficial ativa de momento.</p>}
              </div>
            </div>

            <form onSubmit={handleSendWalletTopUp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Valor Depositado (Kz) *</label>
                  <input
                    type="number"
                    required
                    min={15000}
                    step={5000}
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="Ex: 300000"
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-mono-num font-bold text-xs transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Banco de Destino (Kivora)</label>
                  <select
                    value={paymentBank}
                    onChange={(e) => setPaymentBank(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-display font-semibold text-xs transition-all"
                  >
                    {hasBank1 && <option value={officialBank1Name}>{officialBank1Name} (Conta Oficial)</option>}
                    {hasBank2 && <option value={officialBank2Name}>{officialBank2Name} (Conta Oficial)</option>}
                    {!hasBank1 && !hasBank2 && <option value="A Definir">Aguardando Coordenadas Oficiais</option>}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Número do Comprovativo / Operação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TRF-BAI-998811"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopUpWalletModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-display font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-6 py-2.5 rounded-xl text-xs font-display font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  {submittingProof ? 'A Enviar Solicitação...' : 'Confirmar Recarga de Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CERTIFICADO OFICIAL DE LICENCIAMENTO (AGT) */}
      {selectedLicenseForCert && (
        <LicenseOfficialCertificateModal
          license={selectedLicenseForCert}
          partnerCode={partnerCode}
          onClose={() => setSelectedLicenseForCert(null)}
        />
      )}

      {/* MODAL: RENOVAR / PRORROGAR LICENÇA */}
      {renewLicenseModal.open && renewLicenseModal.license && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900">Renovar / Prorrogar Licença</h3>
                <p className="text-xs text-slate-500 font-sans">{renewLicenseModal.license.company_name}</p>
              </div>
              <button
                onClick={() => setRenewLicenseModal({ open: false, license: null, days: 30 })}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-display font-bold uppercase tracking-wider block">Chave de Ativação</span>
                <span className="font-mono-num font-bold text-slate-900">{renewLicenseModal.license.id}</span>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Validade Atual: <strong className="font-mono-num text-slate-700">{formatLicenseDate(renewLicenseModal.license.expires_at)}</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Período de Extensão</label>
                <select
                  value={renewLicenseModal.days}
                  onChange={(e) => setRenewLicenseModal(prev => ({ ...prev, days: Number(e.target.value) }))}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                >
                  <option value={30}>+30 Dias (Mensal) — Custo Kivora: {fmt(pricingPlans.find(p => p.plan_type === 'monthly')?.cost_aoa ?? 15000)} Kz</option>
                  <option value={90}>+90 Dias (Trimestral) — Custo Kivora: {fmt(pricingPlans.find(p => p.plan_type === 'quarterly')?.cost_aoa ?? 40000)} Kz</option>
                  <option value={180}>+180 Dias (Semestral) — Custo Kivora: {fmt(pricingPlans.find(p => p.plan_type === 'semiannual')?.cost_aoa ?? 70000)} Kz</option>
                  <option value={365}>+365 Dias (Anual) — Custo Kivora: {fmt(pricingPlans.find(p => p.plan_type === 'annual')?.cost_aoa ?? 120000)} Kz</option>
                </select>
              </div>

              <div className="p-3.5 bg-emerald-500/10 text-emerald-900 rounded-xl border border-emerald-500/20 text-[11px] font-sans leading-relaxed">
                Ao confirmar, a data de expiração da licença será estendida no Firebase Firestore e o lançamento de dívida de atacado será adicionado ao seu extrato financeiro.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenewLicenseModal({ open: false, license: null, days: 30 })}
                  className="px-4 py-2 rounded-xl text-xs font-display font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRenewLicense}
                  disabled={actionLoading === renewLicenseModal.license.id}
                  className="px-5 py-2 rounded-xl text-xs font-display font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  {actionLoading === renewLicenseModal.license.id ? 'A Renovar...' : 'Confirmar Renovação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRO DE NOVO CLIENTE */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">Cadastrar Novo Cliente</h3>
                <p className="text-xs text-slate-500 font-sans">Adicione uma empresa à sua carteira de revendedor</p>
              </div>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comercial Boa Esperança, Lda"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">NIF da Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="5412345678"
                    value={newClientNif}
                    onChange={(e) => setNewClientNif(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-mono-num font-bold text-xs transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="923 000 000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Email do Cliente</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.ao"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Província / Localização</label>
                  <input
                    type="text"
                    placeholder="Luanda, Benguela, Huambo..."
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">URL do Logótipo da Empresa Cliente (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://cliente.ao/logo.png"
                  value={newClientLogoUrl}
                  onChange={(e) => setNewClientLogoUrl(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-mono-num text-xs transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-display font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingClient}
                  className="px-6 py-2.5 rounded-xl text-xs font-display font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  {addingClient ? 'A Cadastrar...' : 'Gravar Cliente no Firebase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOTIFICAR PAGAMENTO / ENVIAR COMPROVATIVO */}
      {showProofPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">Notificar Liquidação de Dívida</h3>
                <p className="text-xs text-slate-500 font-sans">Informe a Direção Kivora sobre a transferência efetuada</p>
              </div>
              <button
                onClick={() => setShowProofPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendPaymentProof} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Valor Transferido (Kz) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="Ex: 120000"
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-mono-num font-bold text-xs transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Banco de Destino (Kivora)</label>
                  <select
                    value={paymentBank}
                    onChange={(e) => setPaymentBank(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-display font-semibold text-xs transition-all"
                  >
                    {hasBank1 && <option value={officialBank1Name}>{officialBank1Name} (Conta Oficial)</option>}
                    {hasBank2 && <option value={officialBank2Name}>{officialBank2Name} (Conta Oficial)</option>}
                    {!hasBank1 && !hasBank2 && <option value="A Definir">Aguardando Coordenadas Oficiais</option>}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Número do Comprovativo / Operação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TRF-2026-88992 ou Ref. do Talão"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Observações / Notas</label>
                <textarea
                  rows={3}
                  placeholder="Indique detalhes adicionais (ex: transferência referente às licenças X e Y)..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProofPaymentModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-display font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-6 py-2.5 rounded-xl text-xs font-display font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  {submittingProof ? 'A Enviar Comprovativo...' : 'Enviar Notificação à Direção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ABRIR TICKET DIRETO PARA O ADMIN */}
      {showAdminTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">Solicitação à Direção Kivora</h3>
                <p className="text-xs text-slate-500 font-sans">Destinado a: Equipa Executiva & Financeira Central</p>
              </div>
              <button
                onClick={() => setShowAdminTicketModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminTicket} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Assunto da Solicitação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Regularização de Dívidas / Dúvida Técnica Nível 2"
                  value={adminTicketSubject}
                  onChange={(e) => setAdminTicketSubject(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Categoria</label>
                <select
                  value={adminTicketCategory}
                  onChange={(e) => setAdminTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-display font-semibold text-xs transition-all"
                >
                  <option value="licenciamento">Licenciamento & Regularização de Dívidas</option>
                  <option value="tecnico">Suporte Técnico Nível 2 (Engenharia)</option>
                  <option value="faturacao">Conformidade Fiscal AGT & Faturação</option>
                  <option value="multiloja">Projetos Especiais / Redes Corporativas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px]">Mensagem Detalhada *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escreva os detalhes do seu pedido à Direção Kivora..."
                  value={adminTicketMessage}
                  onChange={(e) => setAdminTicketMessage(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10 font-sans text-xs transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminTicketModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-display font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingAdminTicket}
                  className="px-6 py-2.5 rounded-xl text-xs font-display font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  {submittingAdminTicket ? 'A Enviar ao Admin...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR / EXPANDIR TERMINAIS EM REDE LOCAL */}
      {addSeatsModalLic && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-slate-900">Expandir Terminais LAN</h3>
                  <p className="text-xs text-slate-500 font-sans">{addSeatsModalLic.company_name}</p>
                </div>
              </div>
              <button
                onClick={() => setAddSeatsModalLic(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSeatsSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 font-sans">
                  <span>Chave da Licença:</span>
                  <span className="font-mono-num font-bold text-slate-900">{addSeatsModalLic.id}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 font-sans">
                  <span>Capacidade Atual:</span>
                  <span className="font-display font-bold text-slate-800">{1 + (addSeatsModalLic.extra_seats || 0)} Computador(es)</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 font-sans">
                  <span>Seu Nível de Credenciamento:</span>
                  <span className="font-display font-semibold text-blue-700 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    {partnerAccount?.tier || 'Bronze'}
                  </span>
                </div>
              </div>

              {/* Seletor de Quantidade a Adicionar */}
              <div className="space-y-2">
                <label className="font-display font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Quantos postos extras deseja adicionar? *
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 5, 10].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSeatsToAdd(st)}
                      className={`py-2 rounded-xl text-xs font-mono-num font-semibold border transition-all cursor-pointer ${
                        seatsToAdd === st
                          ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{st} Posto{st > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={seatsToAdd}
                      onChange={(e) => setSeatsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-mono-num font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all"
                    />
                    <span className="text-slate-500 font-display font-semibold whitespace-nowrap">Posto(s)</span>
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro da Expansão */}
              {(() => {
                const pSeatCost = getPartnerSeatCost(partnerAccount?.tier || 'bronze', policy);
                const expansionCost = seatsToAdd * pSeatCost;
                const clientExpPrice = seatsToAdd * (policy.retail_extra_seat_price_aoa || 35000);
                const expMargin = clientExpPrice - expansionCost;
                const canWallet = walletBalance >= expansionCost;

                return (
                  <div className="p-4 surface-card bg-slate-950 text-white rounded-2xl space-y-2 text-xs shadow-md border border-slate-800">
                    <div className="flex justify-between items-center text-slate-300 font-sans">
                      <span>Custo Unitário p/ Seu Nível:</span>
                      <span className="font-mono-num font-bold text-blue-300">{fmt(pSeatCost)} Kz / posto</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-400 font-bold">
                      <span className="font-sans">Total Débito Atacado ({seatsToAdd}x):</span>
                      <span className="font-mono-num text-sm">{fmt(expansionCost)} Kz</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 font-sans">
                      <span>Preço Sugerido ao Cliente:</span>
                      <span className="font-mono-num font-bold text-white">{fmt(clientExpPrice)} Kz</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-emerald-400 font-bold">
                      <span className="font-display">Seu Lucro Líquido Estimado:</span>
                      <span className="font-mono-num text-sm">+{fmt(expMargin)} Kz</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                      <span>Método de Liquidação:</span>
                      <span className={canWallet ? 'text-emerald-400 font-mono-num font-bold' : 'text-amber-400 font-sans font-bold'}>
                        {canWallet ? `Wallet Pré-paga (${fmt(walletBalance)} Kz disp.)` : 'Slot de Crédito Rotativo'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSeatsModalLic(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-display font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addSeatsSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-display font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{addSeatsSubmitting ? 'A Processar...' : `Confirmar +${seatsToAdd} Posto(s)`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Impressão de Fatura / Recibo A4 */}
      <InvoicePrintModal
        isOpen={Boolean(selectedLicenseForInvoice)}
        onClose={() => setSelectedLicenseForInvoice(null)}
        license={selectedLicenseForInvoice}
      />

      {/* Modal dos 2 Certificados Oficiais (Visual Software & Kivora Soft) */}
      {showOfficialCertificatesModal && (
        <PartnerOfficialCertificatesModal
          partner={{
            partnerName: partnerName,
            partnerCode: partnerCode,
            nif: (partnerAccount as any)?.nif || (session as any)?.nif || 'Não Informado',
            tier: partnerAccount?.tier || 'bronze',
            region: partnerAccount?.region || 'Luanda, Angola',
            email: session?.email || '',
            phone: partnerAccount?.phone || '',
          }}
          onClose={() => setShowOfficialCertificatesModal(false)}
        />
      )}

      {/* Modal de Videochamada de Apoio Remoto para Parceiros */}
      <VideoConferenceModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        roomName={`kivora-parceiro-${partnerCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
        userName={partnerName}
        userRole="parceiro"
        companyName={partnerName}
        entityId={partnerCode}
        partnerWalletBalance={walletBalance}
        onDebitPartnerWallet={async (amount) => {
          return await deductPartnerWallet(partnerCode, amount);
        }}
      />

      {/* Modal de Compra de Minutos de Vídeo para Parceiros */}
      <VideoMinutesPurchaseModal
        isOpen={showPurchaseMinutesModal}
        onClose={() => setShowPurchaseMinutesModal(false)}
        account={videoAccount}
        entityType="parceiro"
        partnerWalletBalance={walletBalance}
        onDebitPartnerWallet={async (amount) => {
          return await deductPartnerWallet(partnerCode, amount);
        }}
        onSuccess={(updatedAcc) => {
          setVideoAccount(updatedAcc);
        }}
      />

      {/* Modal de Primeiro Acesso: Definição Obrigatória de Nova Palavra-passe */}
      {showFirstLoginPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="surface-card rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-scaleUp relative shadow-2xl">
            
            {/* Fechar / Lembrar Depois */}
            <button
              type="button"
              onClick={() => setShowFirstLoginPasswordModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Lembrar mais tarde"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xs">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                Proteja a sua Conta de Parceiro
              </h3>
              <p className="text-xs text-slate-500 font-sans leading-relaxed px-2">
                Detectámos que está a utilizar a palavra-passe padrão atribuída pelo sistema. Por motivos de segurança cibernética e proteção da sua carteira comercial, defina a sua nova palavra-passe pessoal.
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleFirstPasswordSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-display font-bold text-slate-700 uppercase tracking-wider block">
                  Nova Palavra-passe Definitiva
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showFirstPassText ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Mínimo de 6 caracteres"
                    value={firstNewPassword}
                    onChange={(e) => setFirstNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none font-sans transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFirstPassText(!showFirstPassText)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showFirstPassText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-display font-bold text-slate-700 uppercase tracking-wider block">
                  Confirmar Nova Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showFirstPassText ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Repita a nova palavra-passe"
                    value={firstConfirmPassword}
                    onChange={(e) => setFirstConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none font-sans transition-all"
                  />
                </div>
              </div>

              {/* Indicador de Requisitos */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 font-sans space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${firstNewPassword.length >= 6 ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Pelo menos 6 caracteres</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${firstNewPassword && firstNewPassword === firstConfirmPassword ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Ambas as palavras-passe coincidem</span>
                </div>
              </div>

              {firstPasswordError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-700 font-display font-medium animate-fadeIn">
                  {firstPasswordError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFirstLoginPasswordModal(false)}
                  className="w-1/3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 font-display font-semibold text-xs rounded-xl transition-all cursor-pointer text-center shadow-xs"
                >
                  Depois
                </button>
                <button
                  type="submit"
                  disabled={firstPasswordSaving}
                  className="w-2/3 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {firstPasswordSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A proteger conta...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Guardar & Proteger Conta</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

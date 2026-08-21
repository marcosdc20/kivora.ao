import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Key, DollarSign, Package,
  Headphones, LogOut, Plus, Copy, CheckCircle2,
  Download, FileText, Send, MessageSquare,
  Building2, Search, AlertCircle, Menu, X,
  RefreshCw, Ban, ShieldCheck, Printer, Calculator,
  ExternalLink, Lock, Check, Share2, Sparkles,
  Award, Unlink, UserPlus,
  Receipt, ArrowRight, PhoneCall, Wallet,
  CreditCard, Clock, Save
} from 'lucide-react';
import { KivoraLogo } from '../components/KivoraLogo';
import { CURRENT_RELEASE, KIVORA_INFO } from '../data/kivoraData';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import {
  getStoredSession, clearStoredSession, KivoraUserSession,
  changeUserPassword
} from '../admin/services/authService';
import { useCompanies } from '../admin/hooks/useFirebase';
import {
  createLicense, calculateExpiresAt, subscribePartnerLicenses,
  revokeLicense, reactivateLicense, releaseLicenseFromDevice,
  extendLicenseExpiry, formatLicenseDate, getPlanLabel, updateLicenseSeats
} from '../admin/services/licenseService';
import {
  SupportTicket, createSupportTicket, sendTicketMessage,
  updateTicketStatus, subscribePartnerTickets
} from '../admin/services/supportService';
import {
  subscribePartnerPricing, subscribePartnerDebts, recordPartnerDebt,
  subscribePartnerAccount, deductPartnerWallet, getActiveCreditSlots,
  hasOverdueDebts, getOldestUnpaidDebtDays,
  subscribePartnerPolicy, DEFAULT_PARTNER_POLICY,
  DEFAULT_PARTNER_PRICING, PartnerPricingPlan, PartnerDebtEntry, PartnerAccount, PartnerLicensingPolicy,
  getPartnerSeatCost
} from '../admin/services/partnerDebtService';
import type { PlanType, KivoraLicense, Company } from '../admin/types';
import { PartnerOfficialCertificatesModal } from '../components/PartnerOfficialCertificatesModal';
import { LicenseOfficialCertificateModal } from '../components/LicenseOfficialCertificateModal';

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

  const [activeSection, setActiveSection] = useState<PartnerSection>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const partnerCode = session?.partnerCode || session?.email || 'PARCEIRO-KIVORA';
  const partnerName = session?.nome || 'Parceiro Homologado Kivora';

  // Conta de Parceiro (Wallet & Limite de Crédito)
  const [partnerAccount, setPartnerAccount] = useState<PartnerAccount | null>(null);
  const [policy, setPolicy] = useState<PartnerLicensingPolicy>(DEFAULT_PARTNER_POLICY);
  const [showOfficialCertificatesModal, setShowOfficialCertificatesModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  const [paymentBank, setPaymentBank] = useState<'BAI' | 'BFA'>('BAI');
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

  const handleSavePartnerBranding = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`kivora_partner_logo_${session?.id || 'default'}`, partnerLogoUrl.trim());
    setPartnerBrandingSaved(true);
    showToast('Logótipo corporativo gravado com sucesso!');
    setTimeout(() => setPartnerBrandingSaved(false), 3000);
  };

  // Estados de Suporte do Parceiro
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
    if (!partnerCode) return;
    const unsub = subscribePartnerAccount(partnerCode, (acc) => {
      setPartnerAccount(acc);
    });
    return () => unsub();
  }, [partnerCode]);

  // Subscrição em Tempo Real às Dívidas deste Parceiro
  useEffect(() => {
    if (!partnerCode) return;
    const unsub = subscribePartnerDebts(partnerCode, (debts) => {
      setPartnerDebts(debts);
    });
    return () => unsub();
  }, [partnerCode]);

  // Subscrição em Tempo Real aos Chamados do Parceiro
  useEffect(() => {
    const unsub = subscribePartnerTickets(partnerCode, session?.email, ({ clientTickets: cTks, adminTickets: aTks }) => {
      setClientTickets(cTks);
      setAdminTickets(aTks);
      if (selectedTicket) {
        const all = [...cTks, ...aTks];
        const updated = all.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    });
    return () => unsub();
  }, [partnerCode, session?.email, selectedTicket]);

  // Subscrição em Tempo Real às Licenças deste Parceiro
  useEffect(() => {
    if (!partnerCode) return;
    const unsub = subscribePartnerLicenses(partnerCode, (list) => {
      setMyPartnerLicenses(list);
    });
    return () => unsub();
  }, [partnerCode]);

  const partnerClients = companies.filter(
    (c) =>
      (c.partner_id && c.partner_id === partnerCode) ||
      (c.address && c.address.includes(partnerCode)) ||
      myPartnerLicenses.some((l) => l.nif === c.nif)
  );

  const filteredClients = partnerClients.filter((c) => {
    if (!clientSearch) return true;
    const s = clientSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.nif.toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s)
    );
  });

  // Filtro de Licenças do Parceiro
  const filteredLicenses = myPartnerLicenses.filter((lic) => {
    const s = licenseSearch.toLowerCase();
    const matchesSearch =
      !licenseSearch ||
      lic.id.toLowerCase().includes(s) ||
      lic.company_name.toLowerCase().includes(s) ||
      lic.nif.includes(s) ||
      lic.client_email.toLowerCase().includes(s);

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
  const activeSlotsInUse = getActiveCreditSlots(partnerDebts);
  const availableCreditSlots = Math.max(0, creditSlotsLimit - activeSlotsInUse);
  const overdueDaysLimit = partnerAccount?.overdue_days_limit || policy.overdue_tolerance_days || 15;
  const isOverdue = hasOverdueDebts(partnerDebts, overdueDaysLimit);
  const oldestDebtDays = getOldestUnpaidDebtDays(partnerDebts);

  const totalPendingDebt = partnerDebts.filter((d) => !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalPaidToKivora = partnerDebts.filter((d) => d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalPartnerProfit = partnerDebts.reduce(
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
      let isPaid = false;
      let paymentMethod: 'wallet' | 'credit' | 'provisional' = 'credit';
      let isProvisional = false;

      // 1. Pagamento via Wallet (Pré-pago) -> 100% definitivo e livre de travas
      if (canPayWithWallet) {
        const deducted = await deductPartnerWallet(partnerCode, currentTotalCost);
        if (deducted) {
          isPaid = true;
          paymentMethod = 'wallet';
          isProvisional = false;
        }
      } else if (canPayWithCredit) {
        // 2. Emissão com Quota de Crédito (Slot Rotativo)
        isPaid = false;
        paymentMethod = 'credit';

        // Trava Anti-Fraude: Planos Vitalícios ou com 3+ postos LAN iniciam como Provisórios
        const isHighRiskPlan = (plan === 'lifetime' && policy.require_provisional_lifetime) || extraSeats >= 3;
        if (isHighRiskPlan) {
          isProvisional = true;
        } else {
          isProvisional = false;
        }
      } else {
        // 3. Sem slots disponíveis ou com dívida vencida
        if (isOverdue) {
          alert(`Bloqueio de Emissão a Crédito: Possui débitos pendentes com mais de ${overdueDaysLimit} dias. Por favor, regularize as pendências com o Admin ou efetue uma recarga na Wallet.`);
        } else {
          alert(`Limite de Quota Atingido: Utilizou todos os ${creditSlotsLimit} slots de crédito disponíveis. Proceda à liquidação de licenças pendentes ou utilize a Carteira Pré-paga (Wallet).`);
        }
        setSubmitting(false);
        return;
      }

      // Expiração inicial no Firestore (definida nas políticas configuradas pelo Admin)
      const normalExpiresAt = calculateExpiresAt(plan);
      const provisionalDays = policy.provisional_lifetime_days || 30;
      const expiresAt = isProvisional ? (Date.now() + provisionalDays * 86_400_000) : normalExpiresAt;

      const lic = await createLicense({
        client_email: clientEmail,
        company_name: companyName,
        nif,
        plan_type: plan,
        expires_at: expiresAt,
        price_aoa: totalClientPrice,
        notes: isProvisional
          ? `[PROVISÓRIA ${provisionalDays} DIAS - ${plan === 'lifetime' ? 'VITALÍCIO' : 'MULTI-POSTOS'} PENDENTE] Emitida a crédito pelo parceiro ${partnerCode} (${extraSeats} terminais extras). Tornar-se-á definitiva após liquidação.`
          : paymentMethod === 'wallet'
          ? `Emitida e 100% paga via Carteira Pré-paga pelo parceiro ${partnerCode} (${extraSeats} terminais extras).`
          : `Emitida a crédito (Slot ${activeSlotsInUse + 1}/${creditSlotsLimit}) pelo parceiro ${partnerCode} (${extraSeats} terminais extras).`,
        partner_id: partnerCode,
        extra_seats: extraSeats,
        is_provisional: isProvisional,
        provisional_target_plan: isProvisional ? plan : undefined,
      });

      // Regista dívida ou transação no Firebase
      await recordPartnerDebt({
        partner_id: partnerCode,
        partner_name: partnerName,
        license_id: lic.id,
        company_name: companyName,
        plan_type: plan,
        cost_aoa: currentTotalCost,
        client_price_aoa: totalClientPrice,
        created_at: Date.now(),
        paid: isPaid,
        paid_at: isPaid ? Date.now() : null,
        payment_method: paymentMethod,
        is_provisional: isProvisional,
        provisional_target_plan: isProvisional ? plan : undefined,
      });

      // Regista também na coleção de empresas clientes se ainda não existir
      const exists = companies.some((c) => c.nif === nif);
      if (!exists) {
        await addCompany({
          name: companyName,
          nif,
          email: clientEmail,
          phone: '',
          address: `Parceiro: ${partnerCode}`,
          partner_id: partnerCode,
          status: 'active',
        });
      }

      setGeneratedKey(lic.id);
      setGeneratedIsProvisional(isProvisional);
    } catch (err: any) {
      showToast('Erro ao emitir licença: ' + err.message);
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
          alert(`Bloqueio de Crédito: Regularize os débitos pendentes há mais de ${overdueDaysLimit} dias ou recarregue a Wallet.`);
        } else {
          alert(`Limite de Quota Atingido: Saldo insuficiente na Wallet (${fmt(walletBalance)} Kz vs ${fmt(expansionCost)} Kz) e sem slots de crédito.`);
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
    const text = `*KIVORA DESKTOP ERP — Dados de Ativação*\n\n` +
      `Olá *${lic.company_name}*,\n` +
      `A sua licença oficial Kivora foi gerada com sucesso!\n\n` +
      `🔑 *Chave de Ativação:* \`${lic.id}\`\n` +
      `📋 *Plano:* ${getPlanLabel(lic.plan_type)}\n` +
      `📅 *Validade:* ${formatLicenseDate(lic.expires_at)}\n` +
      `💻 *Terminais Incluídos:* ${1 + (lic.extra_seats || 0)} Computador(es)\n\n` +
      `📥 *Download do Instalador:* ${window.location.origin}/#download\n\n` +
      `Para ativar: Abra o Kivora ERP no seu PC, aceda a Menu > Licenciamento e cole a chave acima.\n` +
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

    try {
      await extendLicenseExpiry(lic.id, days);
      
      const matchedPlan: PlanType = days >= 365 ? 'annual' : days >= 180 ? 'semiannual' : days >= 90 ? 'quarterly' : 'monthly';
      const renewCost = pricingPlans.find(p => p.plan_type === matchedPlan)?.cost_aoa ?? 15000;

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
      showToast('Erro ao estender validade: ' + e.message);
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
      setNewPassword('');
      setConfirmPassword('');
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

  const handleLogout = () => {
    clearStoredSession();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'licencas', label: 'Minhas Licenças', icon: Key, badge: myPartnerLicenses.length },
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-white shadow-2xl">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Acesso Restrito a Parceiros</h2>
            <p className="text-xs text-slate-400">É necessário iniciar sessão com uma conta de parceiro credenciado para aceder a este portal.</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            Ir para Início de Sessão
          </button>
        </div>
      </div>
    );
  }

  // ─── TELA DE BLOQUEIO DE PARCEIRO SUSPENSO ──────────────────────────────────────
  if (partnerAccount?.status === 'suspended' || session?.status === 'suspended') {
    const whatsAppMessage = `Olá Direção Kivora / Visual Software. Sou o parceiro credenciado ${partnerName} (Código: ${partnerCode}, Email: ${session?.email || ''}). A minha conta no Portal do Parceiro encontra-se suspensa e pretendo solicitar o esclarecimento e a regularização do meu acesso.`;
    const waUrl = `https://wa.me/${KIVORA_INFO.phoneRaw}?text=${encodeURIComponent(whatsAppMessage)}`;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 selection:bg-red-600 selection:text-white">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-fadeIn">
          
          {/* Ícone de Bloqueio Executivo */}
          <div className="w-16 h-16 bg-red-950/60 border border-red-800/50 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-950/50">
            <Ban className="w-8 h-8 text-red-500" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-800/60 inline-block">
              Acesso Suspenso pela Administração
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Conta de Parceiro Suspensa
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              O seu acesso ao <strong>Portal de Parceiros KIVORA</strong> foi suspenso pela Direção da <strong>VISUAL SOFTWARE</strong>.
            </p>
          </div>

          {/* Dados do Parceiro */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-left space-y-2 font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">Parceiro:</span>
              <strong className="text-white font-sans font-bold">{partnerName}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">Código PRT:</span>
              <strong className="text-amber-400">{partnerCode}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-300">{session?.email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estado:</span>
              <span className="text-red-400 font-black uppercase">● Suspenso</span>
            </div>
          </div>

          {/* Orientações */}
          <div className="p-4 bg-amber-950/30 border border-amber-900/40 rounded-2xl text-[11px] text-amber-200/90 leading-relaxed text-left space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Motivos de Suspensão de Canal:</span>
            </p>
            <p>• Pendência financeira ou faturas vencidas além do limite de tolerância.</p>
            <p>• Auditoria de conformidade fiscal e validação de licenças emitidas.</p>
            <p>• Atualização cadastral ou renegociação de quotas operacionais.</p>
          </div>

          {/* Ações */}
          <div className="space-y-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contactar Direção via WhatsApp</span>
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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans selection:bg-emerald-600 selection:text-white">

      {/* Toast Flutuante de Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-white flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800/80">
          <KivoraLogo variant="light" size="sm" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Portal do Parceiro</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Ligado ao Firebase Firestore em Tempo Real" />
          </div>
        </div>

        {/* Info Parceiro com Wallet & Tier */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xs shadow-sm">
              {partnerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">{partnerName}</p>
              <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">{partnerCode}</p>
            </div>
          </div>

          {/* Mini Card de Wallet */}
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-400 font-medium">Saldo Wallet:</span>
            </div>
            <strong className="text-emerald-400 font-mono text-xs">{fmt(walletBalance)} Kz</strong>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as PartnerSection)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.alertBadge && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full" title="Dívida pendente">
                    Pendente
                  </span>
                )}
                {!item.alertBadge && item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => setShowTopUpWalletModal(true)}
            className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Recarregar Saldo Wallet</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-slate-950 text-white flex flex-col z-10 shadow-2xl border-r border-slate-800">
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <KivoraLogo variant="light" size="sm" />
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                    Portal do Parceiro
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-900/60 border-b border-slate-800/80">
              <p className="text-xs font-black text-white truncate">{partnerName}</p>
              <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">{partnerCode}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                <span>Wallet:</span>
                <strong className="text-emerald-400 font-mono">{fmt(walletBalance)} Kz</strong>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as PartnerSection);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.alertBadge && (
                      <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        Pendente
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-800/80">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Abrir Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
              {activeSection === 'dashboard' && 'Visão Geral do Parceiro'}
              {activeSection === 'licencas' && 'Minhas Licenças Emitidas'}
              {activeSection === 'clientes' && 'Carteira de Clientes'}
              {activeSection === 'emitir-licenca' && 'Emissão de Licenças'}
              {activeSection === 'certificados' && 'Certificados Oficiais da Parceria'}
              {activeSection === 'extrato' && 'Extrato & Cobrança Híbrida'}
              {activeSection === 'simulador' && 'Simulador de Rentabilidade & Lucro'}
              {activeSection === 'materiais' && 'Kits Comerciais & Downloads'}
              {activeSection === 'suporte' && 'Central de Suporte Multilateral'}
              {activeSection === 'perfil' && 'Conta do Parceiro & Segurança'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowOfficialCertificatesModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 transition-colors cursor-pointer"
              title="Ver Certificados Oficiais (Visual Software & Kivora)"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Certificados Oficiais</span>
            </button>

            {/* Badge Saldo Wallet */}
            <button
              onClick={() => setShowTopUpWalletModal(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 transition-colors cursor-pointer"
              title="Clique para Recarregar Saldo"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Wallet: {fmt(walletBalance)} Kz</span>
              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black">+ Recarga</span>
            </button>

            <button
              onClick={() => setActiveSection('emitir-licenca')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Emitir Licença</span>
            </button>
          </div>
        </header>

        {/* Content Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* SECTION: DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">

              {/* Banner de Saldo & Linha de Crédito Híbrida */}
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl border border-slate-800 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50 inline-block mb-1">
                      Modelo Híbrido de Cobrança — Kivora Tech
                    </span>
                    <h3 className="text-lg sm:text-xl font-black">
                      Carteira Pré-Paga & Linha de Crédito Operacional
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Emissão instantânea com débito em carteira ou dentro do seu teto de crédito homologado.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTopUpWalletModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Recarregar Wallet</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo na Carteira (Wallet)</span>
                    <span className="text-xl font-black font-mono text-emerald-400">{fmt(walletBalance)} Kz</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Ativação instantânea 24/7</span>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Slots de Crédito Livres</span>
                      {isOverdue && (
                        <span className="text-[9px] bg-red-500/30 text-red-300 border border-red-500/50 px-1.5 py-0.5 rounded font-black">Vencido</span>
                      )}
                    </div>
                    <span className={`text-xl font-black font-mono ${availableCreditSlots > 0 && !isOverdue ? 'text-blue-400' : 'text-amber-400'}`}>
                      {availableCreditSlots} / {creditSlotsLimit} Slots
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {activeSlotsInUse} licenças a crédito em aberto
                    </span>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Dívida Atual à Kivora</span>
                    <span className={`text-xl font-black font-mono ${totalPendingDebt > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {fmt(totalPendingDebt)} Kz
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {oldestDebtDays > 0 ? `Mais antiga: há ${oldestDebtDays} dias` : 'Sem pendências'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Licenças Emitidas</span>
                  <p className="text-2xl font-black text-slate-900">{myPartnerLicenses.length}</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Conectado ao Firebase
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Empresas Clientes</span>
                  <p className="text-2xl font-black text-slate-900">{partnerClients.length}</p>
                  <span className="text-[10px] text-slate-500 font-medium block">Carteira ativa</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Liquidado</span>
                  <p className="text-xl font-black text-emerald-600 font-mono">
                    {fmt(totalPaidToKivora)} Kz
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium block">Pago à Kivora</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Margem / Lucro Estimado</span>
                  <p className="text-xl font-black text-emerald-600 font-mono">
                    +{fmt(totalPartnerProfit)} Kz
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold block">Lucro bruto obtido</span>
                </div>
              </div>

              {/* Dívida Alert se houver pendência */}
              {totalPendingDebt > 0 && (
                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-950 text-sm">Saldo Devedor de {fmt(totalPendingDebt)} Kz referente a licenças emitidas a crédito</h4>
                      <p className="text-amber-800 text-[11px] mt-0.5">Efetue a transferência para as contas oficiais Kivora e envie o comprovativo para regularização do crédito.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowProofPaymentModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Notificar Pagamento</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('extrato')}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-xl shrink-0 cursor-pointer shadow-sm"
                    >
                      Ver Extrato
                    </button>
                  </div>
                </div>
              )}

              {/* Atalhos Rápidos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveSection('emitir-licenca')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Emitir Nova Licença</h4>
                  <p className="text-xs text-slate-500">Gere uma chave KVRA instantânea para o seu cliente.</p>
                </div>

                <div
                  onClick={() => setShowAddClientModal(true)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Cadastrar Novo Cliente</h4>
                  <p className="text-xs text-slate-500">Adicione uma empresa à sua carteira comercial.</p>
                </div>

                <div
                  onClick={() => setActiveSection('simulador')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Simular Lucros</h4>
                  <p className="text-xs text-slate-500">Calcule o seu potencial de faturamento mensal e anual.</p>
                </div>
              </div>

              {/* Licenças Recentes */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Últimas Licenças Emitidas pela sua Conta</h3>
                    <p className="text-xs text-slate-500">Histórico de chaves KVRA geradas para a sua carteira.</p>
                  </div>
                  <button
                    onClick={() => setActiveSection('licencas')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                  >
                    <span>Ver Todas ({myPartnerLicenses.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {myPartnerLicenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Key className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-xs text-slate-700">Ainda não emitiu licenças</p>
                    <p className="text-[11px]">Clique no botão "Emitir Licença" para gerar a primeira chave para o seu cliente.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                    {myPartnerLicenses.slice(0, 5).map((lic) => (
                      <div key={lic.id} className="p-4 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-slate-900">{lic.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              lic.is_provisional ? 'bg-amber-100 text-amber-900 border-amber-300' :
                              lic.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {lic.is_provisional ? '⏳ Provisória (7 Dias)' : lic.status === 'active' ? 'Ativa' : 'Suspensa'}
                            </span>
                            {lic.hardware_id ? (
                              <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                PC Vinculado
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                Livre p/ Ativar
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 font-medium mt-1">
                            {lic.company_name} (NIF: {lic.nif}) • Plano: {getPlanLabel(lic.plan_type)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyKey(lic.id)}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Copiar Chave"
                          >
                            {copiedKey === lic.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === lic.id ? 'Copiada' : 'Copiar'}</span>
                          </button>
                          <button
                            onClick={() => handleShareWhatsapp(lic)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Enviar por WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => setSelectedLicenseForCert(lic)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Certificado Oficial"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Certificado</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SECTION: MINHAS LICENÇAS */}
          {activeSection === 'licencas' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Gestão de Licenças Emitidas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controlo operacional de chaves, desvinculação de terminais, renovações e emissão de certificados.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveSection('emitir-licenca')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Emitir Nova Licença</span>
                  </button>
                </div>
              </div>

              {/* Filtros & Pesquisa */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Pesquisar por chave KVRA, nome da empresa ou NIF..."
                    value={licenseSearch}
                    onChange={(e) => setLicenseSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
                  {(['all', 'active', 'provisional', 'expiring', 'expired', 'revoked'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setLicenseStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        licenseStatusFilter === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all' && `Todas (${myPartnerLicenses.length})`}
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
                <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <Key className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-700 text-sm">Nenhuma licença encontrada</h4>
                  <p className="text-xs text-slate-400">Tente ajustar os filtros de pesquisa ou emita uma nova licença.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredLicenses.map((lic) => {
                    const now = Date.now();
                    const isExpiringSoon = lic.expires_at && lic.expires_at > now && lic.expires_at - now < 7 * 86400000;
                    const isExpired = lic.expires_at && lic.expires_at <= now;

                    return (
                      <div
                        key={lic.id}
                        className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                {lic.id}
                              </span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                lic.is_provisional ? 'bg-amber-100 text-amber-900 border-amber-300' :
                                lic.status === 'revoked' ? 'bg-red-50 text-red-700 border-red-200' :
                                isExpired ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                isExpiringSoon ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {lic.is_provisional ? '⏳ Provisória (7 Dias)' : lic.status === 'revoked' ? 'Suspensa' : isExpired ? 'Expirada' : isExpiringSoon ? 'A Expirar em Breve' : 'Ativa'}
                              </span>
                              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                {getPlanLabel(lic.plan_type)}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mt-2">{lic.company_name}</h4>
                            <p className="text-slate-500 text-xs font-mono">NIF: {lic.nif} • {lic.client_email || 'Email não registado'}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                            <button
                              onClick={() => handleCopyKey(lic.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              {copiedKey === lic.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === lic.id ? 'Copiada' : 'Copiar Chave'}</span>
                            </button>

                            <button
                              onClick={() => handleShareWhatsapp(lic)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => setSelectedLicenseForCert(lic)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Certificado</span>
                            </button>

                            <button
                              onClick={() => setSelectedLicenseForInvoice(lic)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Recibo / Fatura</span>
                            </button>
                          </div>
                        </div>

                        {/* Detalhes de Ativação & Terminal */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Validade da Licença</span>
                            <span className="font-bold text-slate-800">{formatLicenseDate(lic.expires_at)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Computadores / Terminais</span>
                            <span className="font-bold text-slate-800">{1 + (lic.extra_seats || 0)} Terminal(ais)</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Hardware Fingerprint (PC)</span>
                            <span className="font-mono text-slate-700 text-[11px] truncate block" title={lic.hardware_id || 'Nenhum'}>
                              {lic.hardware_id ? `Vinculado: ${lic.hardware_id.slice(0, 16)}...` : 'Livre para Ativação'}
                            </span>
                          </div>
                        </div>

                        {/* Ações Avançadas */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs flex-wrap">
                          <div className="flex items-center gap-2">
                            {lic.hardware_id && (
                              <button
                                onClick={() => handleUnlinkDevice(lic)}
                                disabled={actionLoading === lic.id}
                                className="text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl font-bold border border-amber-200 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Unlink className="w-3.5 h-3.5" />
                                <span>Desvincular PC (Troca de Máquina)</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setAddSeatsModalLic(lic);
                                setSeatsToAdd(1);
                              }}
                              className="text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-bold border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>+ Postos LAN</span>
                            </button>

                            <button
                              onClick={() => setRenewLicenseModal({ open: true, license: lic, days: 30 })}
                              className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Renovar / Prorrogar</span>
                            </button>

                            <button
                              onClick={() => handleToggleLicenseStatus(lic)}
                              disabled={actionLoading === lic.id}
                              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border ${
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
            </div>
          )}

          {/* SECTION: CLIENTES */}
          {activeSection === 'clientes' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Carteira de Clientes do Parceiro</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Empresas que utilizam licenças ativadas com o seu código de parceiro.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddClientModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {filteredClients.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-700 text-sm">
                    {clientSearch ? `Nenhum cliente com "${clientSearch}"` : 'Nenhum cliente registado ainda'}
                  </h4>
                  <p className="text-xs text-slate-400">Emita uma licença ou adicione clientes manualmente à sua carteira.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {filteredClients.map((c) => {
                    const clientLicenses = myPartnerLicenses.filter(l => l.nif === c.nif);
                    return (
                      <div key={c.id || c.nif} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                              {clientLicenses.length} Licença(s)
                            </span>
                          </div>
                          <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                            NIF: {c.nif} • {c.email || 'Email não registado'} • {c.phone || 'Sem telefone'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.phone && (
                            <a
                              href={`https://wa.me/244${c.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 flex items-center gap-1 cursor-pointer"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleSelectClientForIssue(c)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-black text-slate-900">Emitir Chave de Licença para Cliente</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gere uma licença oficial com débito automático em Wallet, Linha de Crédito ou Modo Provisório de 7 Dias.
                </p>
              </div>

              {/* Status do Método de Cobrança da Emissão */}
              <div className="p-4 rounded-2xl border text-xs space-y-2 flex items-start gap-3 bg-slate-50 border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {canPayWithWallet ? <Wallet className="w-4 h-4" /> : canPayWithCredit ? <CreditCard className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-black">
                      {canPayWithWallet ? 'Pagamento Direto via Saldo Wallet' : canPayWithCredit ? 'Pagamento via Linha de Crédito Homologada' : 'Emissão Provisória (7 Dias de Graça / Grace Period)'}
                    </strong>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      canPayWithWallet ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      canPayWithCredit ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {canPayWithWallet ? 'Débito Instantâneo' : canPayWithCredit ? (plan === 'lifetime' || extraSeats >= 3 ? 'Ativação 30 Dias (Crédito)' : 'Crédito Ativo') : 'Regularização Necessária'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    {canPayWithWallet ? (
                      `O valor de custo de atacado (${fmt(currentPlanCost)} Kz) será debitado do seu saldo em carteira (${fmt(walletBalance)} Kz). Licença ativada definitivamente.`
                    ) : canPayWithCredit ? (
                      plan === 'lifetime' || extraSeats >= 3 ? (
                        `O custo de atacado (${fmt(currentPlanCost)} Kz) consumirá 1 slot de crédito. A licença é emitida com 30 dias de ativação provisória e torna-se definitiva após confirmação de liquidação com o Admin.`
                      ) : (
                        `O custo de atacado (${fmt(currentPlanCost)} Kz) consumirá 1 slot de crédito (${availableCreditSlots} slots livres de ${creditSlotsLimit}).`
                      )
                    ) : isOverdue ? (
                      `Emissão a crédito suspensa: possui licenças pendentes há mais de ${overdueDaysLimit} dias. Regularize o pagamento com o Admin ou utilize a Carteira Virtual.`
                    ) : (
                      `A sua quota de ${creditSlotsLimit} slots de crédito está esgotada. Efetue a liquidação de licenças pendentes ou utilize a Carteira Pré-paga.`
                    )}
                  </p>
                </div>
              </div>

              {generatedKey ? (
                <div className="p-8 bg-slate-950 text-white rounded-3xl space-y-5 text-center animate-fadeIn shadow-xl">
                  <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">
                      {generatedIsProvisional ? 'Chave Provisória Emitida (7 Dias)!' : 'Chave KVRA Emitida com Sucesso!'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {generatedIsProvisional
                        ? 'A licença está ativa no cliente por 7 dias. Transfira o valor para torná-la definitiva.'
                        : 'A licença foi ativada e associada à sua carteira de revendedor.'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <p className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider select-all">{generatedKey}</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleCopyKey(generatedKey)}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === generatedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey === generatedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const fakeLic: KivoraLicense = {
                          id: generatedKey,
                          client_email: clientEmail,
                          company_name: companyName,
                          nif,
                          plan_type: plan,
                          status: 'active',
                          hardware_id: null,
                          created_at: Date.now(),
                          expires_at: generatedIsProvisional ? (Date.now() + 7 * 86400000) : calculateExpiresAt(plan),
                          extra_seats: extraSeats,
                          is_provisional: generatedIsProvisional,
                        };
                        handleShareWhatsapp(fakeLic);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Enviar p/ WhatsApp do Cliente</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setGeneratedKey(null);
                        setCompanyName('');
                        setNif('');
                        setClientEmail('');
                      }}
                      className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      + Emitir Outra Licença
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
                  {/* Seleção rápida de cliente existente */}
                  {partnerClients.length > 0 && (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Preenchimento Rápido com Cliente da Carteira</label>
                      <select
                        onChange={(e) => {
                          const c = partnerClients.find(item => item.nif === e.target.value);
                          if (c) {
                            setCompanyName(c.name);
                            setNif(c.nif);
                            setClientEmail(c.email || '');
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Selecione uma empresa já cadastrada ou digite abaixo --</option>
                        {partnerClients.map(c => (
                          <option key={c.id || c.nif} value={c.nif}>{c.name} (NIF: {c.nif})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">Nome da Empresa / Cliente *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pastelaria Luanda, Lda"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">NIF da Empresa *</label>
                      <input
                        type="text"
                        required
                        placeholder="5412345678"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Email do Cliente (Para Envio de Credenciais)</label>
                    <input
                      type="email"
                      placeholder="geral@pastelaria.ao"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">Plano Selecionado</label>
                      <select
                        value={plan}
                        onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold focus:outline-none focus:border-emerald-500"
                      >
                        {pricingPlans.map((p) => (
                          <option key={p.plan_type} value={p.plan_type}>
                            {p.label} (Custo Atacado: {fmt(p.cost_aoa)} Kz)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">Preço Base do Software p/ Cliente (Kz)</label>
                      <input
                        type="number"
                        min={basePlanCost}
                        value={priceAoa}
                        onChange={(e) => setPriceAoa(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Seletor de Postos Extras com Política por Nível */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Computadores Adicionais / Rede Local (Extra Seats)</span>
                      </label>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        Nível {partnerAccount?.tier?.toUpperCase() || 'BRONZE'}: {fmt(partnerSeatCost)} Kz / posto
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 8, 10].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setExtraSeats(st)}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            extraSeats === st
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          +{st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Total de Computadores: <strong className="text-slate-800">{1 + extraSeats} PC(s)</strong></span>
                      {extraSeats > 0 && (
                        <span>Custo Terminais: <strong className="text-blue-700 font-mono">{fmt(totalExtraSeatsCost)} Kz</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Resumo Financeiro da Operação com Discriminação Completa */}
                  <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl space-y-2.5 text-xs shadow-md">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Custo Licença Base (Atacado):</span>
                      <span className="font-mono text-slate-200 font-bold">{fmt(basePlanCost)} Kz</span>
                    </div>
                    {extraSeats > 0 && (
                      <div className="flex justify-between items-center text-blue-300">
                        <span>{extraSeats} Posto(s) Extra ({fmt(partnerSeatCost)} Kz/unid):</span>
                        <span className="font-mono font-bold">+{fmt(totalExtraSeatsCost)} Kz</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-amber-400 font-bold pt-1 border-t border-slate-800">
                      <span>Total Débito Kivora (a liquidar/wallet):</span>
                      <strong className="font-mono text-sm">{fmt(currentTotalCost)} Kz</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Preço Cobrado ao Cliente Final:</span>
                      <strong className="text-white font-mono text-sm">{fmt(totalClientPrice)} Kz</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="font-bold text-emerald-400">Sua Margem Líquida Estimada:</span>
                      <strong className="text-emerald-400 font-mono text-lg font-black">+{fmt(partnerMargin)} Kz</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>{submitting ? 'A Gravar no Firebase...' : 'Confirmar & Emitir Chave de Licença KVRA'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION: EXTRATO DE DÍVIDA */}
          {activeSection === 'extrato' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Extrato Financeiro & Cobrança Híbrida</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Acompanhamento de liquidações via Wallet, lançamentos a crédito e comprovativos enviados.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowTopUpWalletModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Recarregar Wallet</span>
                  </button>

                  <button
                    onClick={() => setShowProofPaymentModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Saldo na Carteira (Wallet)</span>
                  <span className="text-xl font-black font-mono text-emerald-700">
                    {fmt(walletBalance)} Kz
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Créditos pré-pagos</span>
                </div>

                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-800 block">Slots de Crédito</span>
                    {isOverdue && (
                      <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-black">Bloqueado</span>
                    )}
                  </div>
                  <span className={`text-xl font-black font-mono ${availableCreditSlots > 0 && !isOverdue ? 'text-blue-700' : 'text-amber-700'}`}>
                    {availableCreditSlots} / {creditSlotsLimit} Livres
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold block">
                    {activeSlotsInUse} licenças ativas a crédito
                  </span>
                </div>

                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Dívida Total Pendente</span>
                  <span className={`text-xl font-black font-mono ${totalPendingDebt > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {fmt(totalPendingDebt)} Kz
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold block">A regularizar</span>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Já Liquidado</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {fmt(totalPaidToKivora)} Kz
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block">Histórico pago</span>
                </div>
              </div>

              {/* Card de Coordenadas Bancárias */}
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl border border-slate-800 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">Coordenadas Bancárias Oficiais KIVORA</h4>
                    <p className="text-[11px] text-slate-300">Efetue a transferência para liquidar débitos ou recarregar a sua carteira pré-paga.</p>
                  </div>
                  {totalPendingDebt > 0 && (
                    <span className="text-amber-400 font-mono font-bold text-xs bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/30">
                      Pendente: {fmt(totalPendingDebt)} Kz
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Banco BAI (Kz) — Kivora Tech</span>
                      <strong className="text-white">AO06.0040.0000.1234.5678.9012.3</strong>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('AO06.0040.0000.1234.5678.9012.3');
                        alert('IBAN BAI copiado para a área de transferência!');
                      }}
                      className="p-2 text-slate-400 hover:text-white bg-white/10 rounded-lg cursor-pointer"
                      title="Copiar IBAN"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Banco BFA (Kz) — Kivora Tech</span>
                      <strong className="text-white">AO06.0006.0000.9876.5432.1098.7</strong>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('AO06.0006.0000.9876.5432.1098.7');
                        alert('IBAN BFA copiado para a área de transferência!');
                      }}
                      className="p-2 text-slate-400 hover:text-white bg-white/10 rounded-lg cursor-pointer"
                      title="Copiar IBAN"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabela de Lançamentos de Dívida */}
              {partnerDebts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <DollarSign className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">Nenhum registo financeiro ainda</p>
                  <p className="text-xs text-slate-400">Emita a sua primeira licença para ver os registos financeiros aqui.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {partnerDebts.map((debt) => (
                    <div key={debt.id} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm">{debt.company_name}</p>
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                            debt.paid ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            debt.is_provisional ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {debt.paid ? '✓ Liquidado à Kivora' : debt.is_provisional ? '⏳ Provisório (7 Dias)' : 'Dívida Pendente'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {debt.payment_method === 'wallet' ? 'Via Wallet' : debt.payment_method === 'credit' ? 'Linha de Crédito' : 'Provisória'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                          {debt.license_id} • Plano: {debt.plan_type} • {new Date(debt.created_at).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 font-mono text-sm">{fmt(debt.cost_aoa)} Kz</p>
                        <p className="text-[10px] text-slate-400">custo atacado</p>
                        {debt.client_price_aoa > 0 && (
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                            Cobrado: {fmt(debt.client_price_aoa)} Kz (Margem: +{fmt(Math.max(0, debt.client_price_aoa - debt.cost_aoa))} Kz)
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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-black text-slate-900">Simulador de Rentabilidade & Lucro do Parceiro</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Projete os seus ganhos mensais e anuais revendendo licenças Kivora para empresas e comércios da sua região.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parâmetros do Simulador */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <span>Configurar Volume de Vendas</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Clientes com Plano Mensal:</span>
                        <span className="text-emerald-600">{simMonthlyClients} empresas</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simMonthlyClients}
                        onChange={(e) => setSimMonthlyClients(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Preço Cobrado no Plano Mensal:</span>
                        <span className="font-mono text-slate-900">{fmt(simMonthlySalePrice)} Kz</span>
                      </div>
                      <input
                        type="number"
                        min={15000}
                        step={5000}
                        value={simMonthlySalePrice}
                        onChange={(e) => setSimMonthlySalePrice(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono"
                      />
                      <span className="text-[10px] text-slate-400">Custo Atacado Kivora: 15.000 Kz/mês</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Clientes com Plano Anual:</span>
                        <span className="text-emerald-600">{simAnnualClients} empresas</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={simAnnualClients}
                        onChange={(e) => setSimAnnualClients(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Preço Cobrado no Plano Anual:</span>
                        <span className="font-mono text-slate-900">{fmt(simAnnualSalePrice)} Kz</span>
                      </div>
                      <input
                        type="number"
                        min={120000}
                        step={10000}
                        value={simAnnualSalePrice}
                        onChange={(e) => setSimAnnualSalePrice(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono"
                      />
                      <span className="text-[10px] text-slate-400">Custo Atacado Kivora: 120.000 Kz/ano</span>
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
                    <div className="p-6 bg-gradient-to-br from-slate-950 to-emerald-950 text-white rounded-2xl space-y-4 text-xs shadow-xl flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                          <Award className="w-4 h-4" />
                          <span>Projeção de Lucro Líquido do Parceiro</span>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
                          <span className="text-slate-400 text-[11px] block">Renda Recorrente Mensal Estimada:</span>
                          <p className="text-2xl font-black text-emerald-400 font-mono">
                            +{fmt(totalMonthlyProfit)} Kz<span className="text-xs text-slate-400 font-sans">/mês</span>
                          </p>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
                          <span className="text-slate-400 text-[11px] block">Lucro de Vendas Anuais:</span>
                          <p className="text-2xl font-black text-white font-mono">
                            +{fmt(totalAnnualProfit)} Kz
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/10">
                          <span className="text-slate-300 text-xs font-bold block">Lucro Total Anual Projetado:</span>
                          <p className="text-3xl font-black text-emerald-300 font-mono mt-1">
                            +{fmt(projectedAnnualTotal)} Kz<span className="text-xs text-slate-400 font-sans">/ano</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveSection('emitir-licenca')}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4"
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
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Kits de Venda, Manuais & Downloads Oficiais</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Materiais comerciais e técnicos para apresentar e instalar o Kivora Desktop ERP nos seus clientes.
                  </p>
                </div>

                {/* Softwares Oficiais Kivora */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Instaladores Oficiais Kivora Desktop</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/50">
                          {CURRENT_RELEASE.version} Oficial
                        </span>
                        <span className="text-slate-400 text-xs font-mono">{CURRENT_RELEASE.fileSize}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-sm">Instalador Completo Windows (x64)</h4>
                        <p className="text-slate-400 text-xs mt-0.5">Para Windows 11, Windows 10 e Windows Server.</p>
                      </div>
                      <a
                        href={CURRENT_RELEASE.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Baixar Setup Oficial (.exe)</span>
                      </a>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          Banco de Dados Local
                        </span>
                        <span className="text-slate-500 text-xs font-mono">15 MB</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Motor SQLite & Drivers de Impressão Térmica</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Drivers ESC/POS para gavetas e impressoras de talão 80mm/58mm.</p>
                      </div>
                      <button
                        onClick={() => alert('Download do pacote de drivers de impressão iniciado!')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Baixar Drivers Térmicos</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Materiais Comerciais */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Materiais Comerciais & Homologação AGT</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { titulo: 'Apresentação Comercial PDF', desc: 'Slides prontos para reuniões com clientes e demonstração.', tam: '4.2 MB' },
                      { titulo: 'Tabela de Preços & Margens', desc: 'Preços recomendados e cálculo de margens de revenda.', tam: '1.1 MB' },
                      { titulo: 'Certificado de Conformidade AGT', desc: 'Comprovativo oficial de validação fiscal para o cliente.', tam: '0.8 MB' },
                    ].map((m, i) => (
                      <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h4 className="font-bold text-slate-900 text-xs">{m.titulo}</h4>
                        <p className="text-[11px] text-slate-500">{m.desc}</p>
                        <button
                          onClick={() => alert(`Download de ${m.titulo} iniciado.`)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar ({m.tam})</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ferramentas de Suporte Remoto */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Softwares Recomendados para Suporte Remoto ao Cliente</h3>
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
                        rel="noreferrer"
                        className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">{tool.nome}</strong>
                          <span className="text-[10px] text-slate-500">{tool.desc}</span>
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
                  <h2 className="text-lg font-black text-slate-900">Central de Suporte & Atendimento</h2>
                  <p className="text-xs text-slate-500">
                    Atenda os chamados dos seus clientes ou solicite apoio direto à administração central da Kivora.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAdminTicketModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Falar com o Admin (Kivora Central)</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                <button
                  onClick={() => { setSupportTab('clientes'); setSelectedTicket(null); }}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    supportTab === 'clientes'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Chamados dos Meus Clientes ({clientTickets.length})
                </button>

                <button
                  onClick={() => { setSupportTab('admin'); setSelectedTicket(null); }}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    supportTab === 'admin'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Minhas Conversas com o Admin Kivora ({adminTickets.length})
                </button>
              </div>

              {/* Grid: Lista de Tickets + Chat */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Lista de Chamados */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    {supportTab === 'clientes' ? 'Tickets da Carteira de Clientes' : 'Chamados com a Direção Kivora'}
                  </h3>

                  {((supportTab === 'clientes' ? clientTickets : adminTickets).length === 0) ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Headphones className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-bold text-xs text-slate-700">Nenhum chamado ativo nesta aba</p>
                      <p className="text-[11px] text-slate-400">
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
                                ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono text-[10px] font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
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
                              <span className="font-semibold text-slate-700 truncate max-w-[160px]">{tk.company_name}</span>
                              <span className="font-bold text-emerald-600">{tk.messages.length} msg(s)</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Chat / Resposta ao Chamado */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
                  {selectedTicket ? (
                    <>
                      {/* Header do Chat */}
                      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900">{selectedTicket.ticket_number}</span>
                            <span className="text-slate-300">•</span>
                            <h4 className="font-bold text-slate-900 text-xs">{selectedTicket.subject}</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Empresa: <strong className="text-slate-800">{selectedTicket.company_name}</strong> ({selectedTicket.contact_email})
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedTicket.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolveTicket(selectedTicket.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                            >
                              Marcar Resolvido
                            </button>
                          )}
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
                      <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
                        {selectedTicket.messages.map((msg, i) => {
                          const isMe = msg.sender_role === 'partner';
                          return (
                            <div
                              key={msg.id || i}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                                {msg.sender_name} ({msg.sender_role === 'partner' ? 'Você (Parceiro)' : msg.sender_role === 'client' ? 'Cliente' : 'Admin Central'})
                              </span>
                              <div className={`p-3.5 rounded-2xl text-xs max-w-md ${
                                isMe
                                  ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                <span className={`text-[9px] font-medium mt-1.5 block text-right ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Input de Envio de Resposta */}
                      <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Escreva a sua resposta em tempo real..."
                          value={chatReply}
                          onChange={(e) => setChatReply(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                        />
                        <button
                          type="submit"
                          disabled={!chatReply.trim()}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-black text-slate-900">Conta do Parceiro & Segurança</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informações da sua credencial de parceiro homologado e alteração de palavra-passe.
                </p>
              </div>

              {/* Card de Dados do Parceiro */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-lg font-black shadow-md">
                    {partnerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{partnerName}</h3>
                    <p className="text-xs font-mono font-bold text-emerald-600">{partnerCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Email de Acesso</span>
                    <span className="font-bold text-slate-800">{session?.email || 'parceiro@kivora.ao'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Nível de Parceria</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{partnerAccount?.tier?.toUpperCase() || 'HOMOLOGADO'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Quota de Slots a Crédito</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-block font-mono">
                      {creditSlotsLimit} Licenças Simultâneas
                    </span>
                  </div>
                </div>
              </div>

              {/* Personalização de Identidade Visual & Logótipo */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>Identidade Visual & Logótipo da Empresa Parceira</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Este logótipo será impresso nos seus certificados oficiais de técnico credenciado e propostas.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePartnerBranding} className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-xs shrink-0">
                      {partnerLogoUrl ? (
                        <img src={partnerLogoUrl} alt="Logo Parceiro" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="font-black text-slate-400 text-xs text-center">Sem Logo</span>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="font-bold text-slate-700 uppercase text-[11px]">URL da Imagem / Logótipo (PNG ou JPG)</label>
                      <input
                        type="url"
                        value={partnerLogoUrl}
                        onChange={(e) => setPartnerLogoUrl(e.target.value)}
                        placeholder="https://suaempresa.ao/logo.png"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {partnerBrandingSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Logótipo corporativo guardado com sucesso!</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Gravar Logótipo</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Formulário de Alteração de Senha */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Alterar Palavra-passe de Acesso</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">Defina uma nova palavra-passe segura para entrar no portal.</p>

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Nova Palavra-passe</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Confirmar Nova Palavra-passe</label>
                    <input
                      type="password"
                      required
                      placeholder="Repita a palavra-passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Palavra-passe atualizada com sucesso no Firebase!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    {changingPassword ? 'A Atualizar...' : 'Atualizar Palavra-passe'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECÇÃO: MEUS CERTIFICADOS OFICIAIS (VISUAL SOFTWARE & KIVORA ERP)
              ========================================================================= */}
          {activeSection === 'certificados' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-blue-200">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Documentos Institucionais & Credenciação Oficial</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                      Certificados Oficiais da Rede de Distribuição
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Aceda e imprima os seus certificados oficiais emitidos pela <strong>VISUAL SOFTWARE</strong> com validade perante clientes e instituições de Angola.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowOfficialCertificatesModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Visualizar & Imprimir (A4)</span>
                  </button>
                </div>

                {/* Grade dos 2 Documentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Documento 1: Visual Software */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 bg-slate-950 text-white font-black text-xs rounded-xl flex items-center justify-center">
                          VS
                        </span>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          ● HOMOLOGADO
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-950 text-base">
                          1. Certificado de Parceria Comercial
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Atestado oficial de membro credenciado e homologado da rede de canais da <strong>VISUAL SOFTWARE</strong> em Angola.
                        </p>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                        <p><strong>Entidade:</strong> {partnerName}</p>
                        <p><strong>Código:</strong> <span className="font-mono text-emerald-700 font-bold">{partnerCode}</span></p>
                        <p><strong>Categoria:</strong> <span className="font-bold uppercase text-blue-700">{(partnerAccount?.tier || 'bronze')} Partner</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowOfficialCertificatesModal(true)}
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-300" />
                      <span>Ver Certificado Visual Software</span>
                    </button>
                  </div>

                  {/* Card Documento 2: Kivora ERP */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <img src="/imagens/logo_sem_fundo.png" alt="Kivora Logo" className="h-7 w-auto object-contain" />
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          AGT 384/2024
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-950 text-base">
                          2. Autorização de Revenda Kivora ERP
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Outorga concedida pela Visual Software para comercialização, instalação de postos e emissão de licenças do software Kivora ERP.
                        </p>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                        <p><strong>Software:</strong> Kivora ERP v2.4</p>
                        <p><strong>Certificação Fiscal:</strong> <span className="font-mono font-bold text-amber-700">384/AGT/2024</span></p>
                        <p><strong>Concessão:</strong> Distribuição & Suporte Autorizado</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowOfficialCertificatesModal(true)}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-amber-200" />
                      <span>Ver Autorização de Revenda</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: RECARGA DE WALLET */}
      {showTopUpWalletModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Recarregar Saldo na Wallet</h3>
                  <p className="text-xs text-slate-500">Créditos pré-pagos para emissão instantânea</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopUpWalletModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-white rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Contas Bancárias Oficiais para Depósito</span>
              <div className="space-y-1 font-mono text-[11px]">
                <p>• BAI: <strong className="text-emerald-400">AO06.0040.0000.1234.5678.9012.3</strong></p>
                <p>• BFA: <strong className="text-blue-400">AO06.0006.0000.9876.5432.1098.7</strong></p>
              </div>
            </div>

            <form onSubmit={handleSendWalletTopUp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Valor Depositado (Kz) *</label>
                  <input
                    type="number"
                    required
                    min={15000}
                    step={5000}
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="Ex: 300000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Banco de Destino (Kivora)</label>
                  <select
                    value={paymentBank}
                    onChange={(e) => setPaymentBank(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="BAI">Banco BAI (Conta Kivora)</option>
                    <option value="BFA">Banco BFA (Conta Kivora)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Número do Comprovativo / Operação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TRF-BAI-998811"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopUpWalletModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Renovar / Prorrogar Licença</h3>
                <p className="text-xs text-slate-500">{renewLicenseModal.license.company_name}</p>
              </div>
              <button
                onClick={() => setRenewLicenseModal({ open: false, license: null, days: 30 })}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Chave de Ativação</span>
                <span className="font-mono font-bold text-slate-900">{renewLicenseModal.license.id}</span>
                <p className="text-[11px] text-slate-500">
                  Validade Atual: <strong>{formatLicenseDate(renewLicenseModal.license.expires_at)}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Período de Extensão</label>
                <select
                  value={renewLicenseModal.days}
                  onChange={(e) => setRenewLicenseModal(prev => ({ ...prev, days: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value={30}>+30 Dias (Mensal) — Custo Kivora: {fmt(pricingPlans.find(p => p.plan_type === 'monthly')?.cost_aoa ?? 15000)} Kz</option>
                  <option value={90}>+90 Dias (Trimestral) — Custo Kivora: {fmt(pricingPlans.find(p => p.plan_type === 'quarterly')?.cost_aoa ?? 40000)} Kz</option>
                  <option value={180}>+180 Dias (Semestral) — Custo Kivora: {fmt(pricingPlans.find(p => p.plan_type === 'semiannual')?.cost_aoa ?? 70000)} Kz</option>
                  <option value={365}>+365 Dias (Anual) — Custo Kivora: {fmt(pricingPlans.find(p => p.plan_type === 'annual')?.cost_aoa ?? 120000)} Kz</option>
                </select>
              </div>

              <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-[11px] leading-relaxed">
                Ao confirmar, a data de expiração da licença será estendida no Firebase Firestore e o lançamento de dívida de atacado será adicionado ao seu extrato financeiro.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenewLicenseModal({ open: false, license: null, days: 30 })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRenewLicense}
                  disabled={actionLoading === renewLicenseModal.license.id}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Cadastrar Novo Cliente</h3>
                <p className="text-xs text-slate-500">Adicione uma empresa à sua carteira de revendedor</p>
              </div>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comercial Boa Esperança, Lda"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">NIF da Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="5412345678"
                    value={newClientNif}
                    onChange={(e) => setNewClientNif(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="923 000 000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Email do Cliente</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.ao"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Província / Localização</label>
                  <input
                    type="text"
                    placeholder="Luanda, Benguela, Huambo..."
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">URL do Logótipo da Empresa Cliente (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://cliente.ao/logo.png"
                  value={newClientLogoUrl}
                  onChange={(e) => setNewClientLogoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingClient}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Notificar Liquidação de Dívida</h3>
                <p className="text-xs text-slate-500">Informe a Direção Kivora sobre a transferência efetuada</p>
              </div>
              <button
                onClick={() => setShowProofPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendPaymentProof} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Valor Transferido (Kz) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="Ex: 120000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Banco de Destino (Kivora)</label>
                  <select
                    value={paymentBank}
                    onChange={(e) => setPaymentBank(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="BAI">Banco BAI (Conta Kivora)</option>
                    <option value="BFA">Banco BFA (Conta Kivora)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Número do Comprovativo / Operação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TRF-2026-88992 ou Ref. do Talão"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Observações / Notas</label>
                <textarea
                  rows={3}
                  placeholder="Indique detalhes adicionais (ex: transferência referente às licenças X e Y)..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProofPaymentModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Solicitação à Direção Kivora</h3>
                <p className="text-xs text-slate-500">Destinado a: Equipa Executiva & Financeira Central</p>
              </div>
              <button
                onClick={() => setShowAdminTicketModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Assunto da Solicitação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Regularização de Dívidas / Dúvida Técnica Nível 2"
                  value={adminTicketSubject}
                  onChange={(e) => setAdminTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Categoria</label>
                <select
                  value={adminTicketCategory}
                  onChange={(e) => setAdminTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="licenciamento">Licenciamento & Regularização de Dívidas</option>
                  <option value="tecnico">Suporte Técnico Nível 2 (Engenharia)</option>
                  <option value="faturacao">Conformidade Fiscal AGT & Faturação</option>
                  <option value="multiloja">Projetos Especiais / Redes Corporativas</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Mensagem Detalhada *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escreva os detalhes do seu pedido à Direção Kivora..."
                  value={adminTicketMessage}
                  onChange={(e) => setAdminTicketMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminTicketModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingAdminTicket}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Expandir Terminais LAN</h3>
                  <p className="text-xs text-slate-500">{addSeatsModalLic.company_name}</p>
                </div>
              </div>
              <button
                onClick={() => setAddSeatsModalLic(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSeatsSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Chave da Licença:</span>
                  <span className="font-mono font-bold text-slate-900">{addSeatsModalLic.id}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Capacidade Atual:</span>
                  <span className="font-bold text-slate-800">{1 + (addSeatsModalLic.extra_seats || 0)} Computador(es)</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Seu Nível de Homologação:</span>
                  <span className="font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {partnerAccount?.tier || 'Bronze'}
                  </span>
                </div>
              </div>

              {/* Seletor de Quantidade a Adicionar */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 uppercase text-[11px] block">
                  Quantos postos extras deseja adicionar? *
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 5, 10].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSeatsToAdd(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        seatsToAdd === st
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-500 font-bold whitespace-nowrap">Posto(s)</span>
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
                  <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl space-y-2 text-xs shadow-md">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Custo Unitário p/ Seu Nível:</span>
                      <span className="font-mono font-bold text-blue-300">{fmt(pSeatCost)} Kz / posto</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-400 font-bold">
                      <span>Total Débito Atacado ({seatsToAdd}x):</span>
                      <span className="font-mono text-sm">{fmt(expansionCost)} Kz</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Preço Sugerido ao Cliente:</span>
                      <span className="font-mono font-bold text-white">{fmt(clientExpPrice)} Kz</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-emerald-400 font-bold">
                      <span>Seu Lucro Líquido Estimado:</span>
                      <span className="font-mono text-sm">+{fmt(expMargin)} Kz</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Método de Liquidação:</span>
                      <span className={canWallet ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addSeatsSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
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

      {/* Modal dos 2 Certificados Oficiais (Visual Software & Kivora ERP) */}
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

    </div>
  );
};

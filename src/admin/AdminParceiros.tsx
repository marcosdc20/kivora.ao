import React, { useState, useEffect } from 'react';
import {
  Plus, Eye, Check, X,
  DollarSign, Users, CheckCircle2, Loader2, Copy,
  Key, MessageSquare, Search, Ban, RotateCcw,
  Tag, TrendingDown, Wallet, Edit2, Save,
  ShieldCheck, Sliders, Download, Award, Mail,
  FileText, ExternalLink, Trash2
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { createOrApprovePartnerAccount, setPartnerSuspensionStatus } from './services/authService';
import { sendPartnerCredentialsEmail } from '../services/siteEmailService';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  subscribePartnerPricing, savePartnerPricing, subscribeAllDebts, markDebtsPaid,
  subscribePartnerPolicy, savePartnerPolicy,
  DEFAULT_PARTNER_PRICING, DEFAULT_PARTNER_POLICY
} from './services/partnerDebtService';
import type { PartnerPricingPlan, PartnerDebtEntry, PartnerLicensingPolicy } from './services/partnerDebtService';
import { PartnerOfficialCertificatesModal, PartnerCertificateData } from '../components/PartnerOfficialCertificatesModal';

export interface Partner {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  debt_aoa: number;
  total_paid_aoa: number;
  total_sales: number;
  credit_slots_limit: number;
  credit_limit_aoa: number;
  wallet_balance_aoa: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  status: 'active' | 'pending' | 'suspended';
  createdAt: number;
  nif?: string;
  payment_proof_url?: string;
  payment_proof_name?: string;
}

interface AdminParceirosProps {
  onCandidaturas?: () => void;
  onBack?: () => void;
  initialTab?: 'todos' | 'candidaturas' | 'precos' | 'politicas' | 'extrato_geral';
}

const fmt = (n: number) => n.toLocaleString('pt-AO');

export interface PartnerApplicationItem {
  id: string;
  nome: string;
  name?: string;
  responsible?: string;
  cargo_responsavel?: string;
  empresa_nome?: string;
  empresa?: string;
  nif?: string;
  email: string;
  telefone: string;
  provincia?: string;
  municipio?: string;
  region?: string;
  sede_completa?: string;
  tipo_parceria?: string;
  tem_clientes?: string;
  experiencia?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: number;
  protocol?: string;
  payment_proof_url?: string;
  payment_proof_name?: string;
  payment_proof_size?: string;
  payment_proof_type?: string;
  fee_amount_aoa?: number;
}

export const AdminParceiros: React.FC<AdminParceirosProps> = ({ initialTab = 'todos' }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [applications, setApplications] = useState<PartnerApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'todos' | 'candidaturas' | 'precos' | 'politicas' | 'extrato_geral'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);
  const [candidaturaFilter, setCandidaturaFilter] = useState<'pendentes' | 'aprovadas' | 'todas'>('pendentes');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('todos');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{
    open: boolean; partnerName: string; email: string; password: string; partnerCode: string; phone: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [sendingPartnerEmail, setSendingPartnerEmail] = useState(false);
  const [partnerEmailSent, setPartnerEmailSent] = useState(false);
  const [certificatesPartnerModal, setCertificatesPartnerModal] = useState<PartnerCertificateData | null>(null);
  const [viewProofModal, setViewProofModal] = useState<{ open: boolean; item: any } | null>(null);

  const [allDebts, setAllDebts] = useState<PartnerDebtEntry[]>([]);
  const [partnerDebts, setPartnerDebts] = useState<PartnerDebtEntry[]>([]);
  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([]);
  const [globalSelectedDebtIds, setGlobalSelectedDebtIds] = useState<string[]>([]);
  const [debtFilterStatus, setDebtFilterStatus] = useState<'todos' | 'pendentes' | 'pagos' | 'provisorios'>('pendentes');
  const [markingPaid, setMarkingPaid] = useState(false);

  const [editTier, setEditTier] = useState<'bronze' | 'silver' | 'gold' | 'diamond'>('bronze');
  const [editCreditSlots, setEditCreditSlots] = useState<number>(2);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [savingFinancials, setSavingFinancials] = useState(false);

  // Edição Direta do Perfil do Parceiro
  const [editPartnerName, setEditPartnerName] = useState('');
  const [editPartnerEmail, setEditPartnerEmail] = useState('');
  const [editPartnerPhone, setEditPartnerPhone] = useState('');
  const [editPartnerRegion, setEditPartnerRegion] = useState('');
  const [editPartnerNif, setEditPartnerNif] = useState('');
  const [savingPartnerProfile, setSavingPartnerProfile] = useState(false);

  const [pricingPlans, setPricingPlans] = useState<PartnerPricingPlan[]>(DEFAULT_PARTNER_PRICING);
  const [editingPricing, setEditingPricing] = useState(false);
  const [pricingDraft, setPricingDraft] = useState<PartnerPricingPlan[]>(DEFAULT_PARTNER_PRICING);
  const [savingPricing, setSavingPricing] = useState(false);

  const [policy, setPolicy] = useState<PartnerLicensingPolicy>(DEFAULT_PARTNER_POLICY);
  const [policyDraft, setPolicyDraft] = useState<PartnerLicensingPolicy>(DEFAULT_PARTNER_POLICY);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [newReqInput, setNewReqInput] = useState('');

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Luanda');
  const [newPartnerTier, setNewPartnerTier] = useState<'bronze' | 'silver' | 'gold' | 'diamond'>('bronze');

  // 1. Escuta em Tempo Real da Coleção `partners`
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'partners'), (snapshot) => {
        const map = new Map<string, Partner>();
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const pCode = (d.code || docSnap.id).toUpperCase().trim();
          const existing = map.get(pCode);

          const tier = (d.tier as any) || 'bronze';
          const defaultSlots = policy.tier_slots[tier as keyof typeof policy.tier_slots] || 2;

          const pName = d.name || d.empresa || d.empresa_nome || d.company_name || d.companyName || d.responsible || d.nome || d.nome_responsavel || d.partner_name || d.client_name;

          const item: Partner = {
            id: docSnap.id,
            code: pCode,
            name: pName || (pCode ? `Parceiro (${pCode})` : 'Parceiro Credenciado'),
            email: d.email || '',
            phone: d.phone || d.telefone || '',
            region: d.region || d.provincia || d.sede_completa || 'Luanda, Angola',
            debt_aoa: Number(d.debt_aoa) || 0,
            total_paid_aoa: Number(d.total_paid_aoa) || 0,
            total_sales: Number(d.total_sales) || 0,
            credit_slots_limit: Number(d.credit_slots_limit) || defaultSlots,
            credit_limit_aoa: Number(d.credit_limit_aoa) || 250000,
            wallet_balance_aoa: Number(d.wallet_balance_aoa) || 0,
            tier,
            status: d.status || 'pending',
            createdAt: Number(d.createdAt) || Number(d.created_at) || Date.now(),
            nif: d.nif || '',
            payment_proof_url: d.payment_proof_url || '',
          };

          if (!existing) {
            map.set(pCode, item);
          } else if (existing.status !== 'active' && item.status === 'active') {
            map.set(pCode, item);
          } else if (item.createdAt > existing.createdAt && item.status === existing.status) {
            map.set(pCode, item);
          }
        });
        setPartners(Array.from(map.values()));
        setLoading(false);
      }, (err) => { console.warn('Erro partners:', err); setLoading(false); });
      return () => unsub();
    } catch (e) { console.warn(e); setLoading(false); }
  }, [policy]);

  // 2. Escuta em Tempo Real da Coleção `partner_applications` (Candidaturas do Site)
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'partner_applications'), (snapshot) => {
        const list: PartnerApplicationItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            nome: d.nome || d.nome_responsavel || 'Candidato',
            cargo_responsavel: d.cargo_responsavel || d.cargo,
            empresa_nome: d.empresa_nome || d.empresa || d.nome,
            empresa: d.empresa || d.empresa_nome,
            nif: d.nif || '',
            email: d.email || '',
            telefone: d.telefone || d.phone || '',
            provincia: d.provincia || 'Luanda',
            municipio: d.municipio || '',
            region: d.sede_completa || (d.provincia ? `${d.provincia}${d.municipio ? ` (${d.municipio})` : ''}` : (d.region || 'Luanda')),
            sede_completa: d.sede_completa || '',
            tipo_parceria: d.tipo_parceria || d.tipoParceria || 'Distribuidor Autorizado',
            tem_clientes: d.tem_clientes,
            experiencia: d.experiencia,
            status: d.status || 'pending',
            created_at: Number(d.created_at) || Number(d.createdAt) || Date.now(),
            protocol: d.protocol || d.id,
            payment_proof_url: d.payment_proof_url || d.comprovativo_base64 || d.comprovativo_url || '',
            payment_proof_name: d.payment_proof_name || d.comprovativo_nome || 'comprovativo_transferencia',
            payment_proof_size: d.payment_proof_size || d.comprovativo_tamanho || '',
            payment_proof_type: d.payment_proof_type || d.comprovativo_tipo || '',
            fee_amount_aoa: d.fee_amount_aoa || 25000,
          });
        });
        list.sort((a, b) => b.created_at - a.created_at);
        setApplications(list);
      }, (err) => console.warn('Erro ao escutar partner_applications:', err));
      return () => unsub();
    } catch (e) { console.warn(e); }
  }, []);

  useEffect(() => {
    const unsub = subscribeAllDebts(setAllDebts);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribePartnerPricing((plans) => {
      setPricingPlans(plans);
      setEditingPricing(prev => { if (!prev) setPricingDraft(plans); return prev; });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribePartnerPolicy((p) => {
      setPolicy(p);
      setPolicyDraft(p);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      const cleanId = selectedPartner.id.trim().toLowerCase();
      const cleanCode = (selectedPartner.code || '').trim().toLowerCase();
      const cleanEmail = (selectedPartner.email || '').trim().toLowerCase();
      const cleanName = (selectedPartner.name || '').trim().toLowerCase();

      setPartnerDebts(allDebts.filter(d => {
        const pId = (d.partner_id || '').trim().toLowerCase();
        const pName = (d.partner_name || '').trim().toLowerCase();
        return (
          pId === cleanId ||
          pId === cleanCode ||
          (cleanEmail && pId === cleanEmail) ||
          (cleanName && pName.includes(cleanName))
        );
      }));
      setSelectedDebtIds([]);
      setEditTier(selectedPartner.tier || 'bronze');
      setEditCreditSlots(selectedPartner.credit_slots_limit || 2);
      setEditPartnerName(selectedPartner.name || '');
      setEditPartnerEmail(selectedPartner.email || '');
      setEditPartnerPhone(selectedPartner.phone || '');
      setEditPartnerRegion(selectedPartner.region || 'Luanda, Angola');
      setEditPartnerNif(selectedPartner.nif || '');
    }
  }, [selectedPartner, allDebts]);

  // Lista de parceiros enriquecida cruzando dados de candidaturas e dívidas para garantir nomes reais
  const resolvedPartners = React.useMemo(() => {
    return partners.map(p => {
      let finalName = p.name;
      let finalEmail = p.email;
      let finalPhone = p.phone;
      let finalRegion = p.region;
      let finalNif = p.nif;

      const pCode = (p.code || p.id).toUpperCase().trim();
      const pEmail = (p.email || '').toLowerCase().trim();

      // Procura candidatura correspondente por protocolo, id ou email
      const matchedApp = applications.find(a => 
        (a.protocol && a.protocol.toUpperCase().trim() === pCode) ||
        (a.id && a.id === p.id) ||
        (pEmail && a.email && a.email.toLowerCase().trim() === pEmail)
      );

      if (matchedApp) {
        if (!finalName || finalName === 'Parceiro Sem Nome' || finalName.startsWith('Parceiro (')) {
          finalName = matchedApp.empresa_nome || matchedApp.empresa || matchedApp.nome || matchedApp.responsible || `Parceiro (${pCode})`;
        }
        if (!finalEmail) finalEmail = matchedApp.email;
        if (!finalPhone) finalPhone = matchedApp.telefone;
        if (!finalRegion || finalRegion === 'Luanda') finalRegion = matchedApp.sede_completa || matchedApp.region || 'Luanda, Angola';
        if (!finalNif) finalNif = matchedApp.nif;
      }

      // Procura em dívidas/licenças emitidas caso ainda não tenha nome
      if (!finalName || finalName === 'Parceiro Sem Nome' || finalName.startsWith('Parceiro (')) {
        const matchedDebt = allDebts.find(d => 
          (d.partner_id && d.partner_id.toUpperCase().trim() === pCode) &&
          (d.partner_name && d.partner_name !== 'Parceiro Sem Nome')
        );
        if (matchedDebt && matchedDebt.partner_name && matchedDebt.partner_name !== 'Parceiro Sem Nome') {
          finalName = matchedDebt.partner_name;
        }
      }

      if (!finalName || finalName === 'Parceiro Sem Nome') {
        finalName = p.code ? `Parceiro (${p.code})` : 'Parceiro Credenciado';
      }

      return {
        ...p,
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        region: finalRegion,
        nif: finalNif,
      };
    });
  }, [partners, applications, allDebts]);

  // Combina e deduplica candidaturas do formulário web (`partner_applications`) com registos da coleção `partners`
  const { allApplicationsList, pendingApplicationsList, approvedApplicationsList } = React.useMemo(() => {
    const map = new Map<string, any>();

    // Conjunto de parceiros que já estão ATIVOS
    const activeEmails = new Set(resolvedPartners.filter(p => p.status === 'active').map(p => (p.email || '').toLowerCase().trim()).filter(Boolean));
    const activeNifs = new Set(resolvedPartners.filter(p => p.status === 'active').map(p => (p.nif || '').toLowerCase().trim()).filter(Boolean));
    const activeCodes = new Set(resolvedPartners.filter(p => p.status === 'active').map(p => (p.code || '').toLowerCase().trim()).filter(Boolean));

    // 1. Processa candidaturas da coleção `partner_applications`
    applications.forEach(app => {
      const email = (app.email || '').toLowerCase().trim();
      const nif = (app.nif || '').toLowerCase().trim();
      const protocol = (app.protocol || app.id || '').toLowerCase().trim();

      const dedupeKey = email || (nif ? `nif_${nif}` : `prot_${protocol}`);

      const isAlreadyActive =
        (email && activeEmails.has(email)) ||
        (nif && activeNifs.has(nif)) ||
        (protocol && activeCodes.has(protocol));

      const status: 'pending' | 'approved' | 'rejected' =
        app.status === 'approved' || isAlreadyActive ? 'approved' :
        app.status === 'rejected' ? 'rejected' : 'pending';

      const pCode = (app.protocol || `KVRA-PAR-${Math.floor(100 + Math.random() * 900)}`).trim();

      const item = {
        id: app.id,
        appId: app.id,
        code: pCode,
        name: app.empresa_nome || app.empresa || app.nome || 'Candidato a Parceiro',
        responsible: app.nome,
        email: app.email,
        phone: app.telefone,
        region: app.sede_completa || app.region || `${app.provincia || 'Luanda'}${app.municipio ? ` (${app.municipio})` : ''}`,
        sede_completa: app.sede_completa,
        nif: app.nif,
        tipo_parceria: app.tipo_parceria,
        tem_clientes: app.tem_clientes,
        experiencia: app.experiencia,
        status,
        createdAt: app.created_at || Date.now(),
        protocol: app.protocol,
        tier: 'bronze',
        payment_proof_url: app.payment_proof_url,
        payment_proof_name: app.payment_proof_name,
        payment_proof_size: app.payment_proof_size,
        payment_proof_type: app.payment_proof_type,
        fee_amount_aoa: app.fee_amount_aoa || 25000,
      };

      const existing = map.get(dedupeKey);
      if (!existing) {
        map.set(dedupeKey, item);
      } else {
        if (existing.status === 'pending' && item.status === 'approved') {
          map.set(dedupeKey, item);
        } else if (item.payment_proof_url && !existing.payment_proof_url) {
          map.set(dedupeKey, item);
        }
      }
    });

    // 2. Registos pendentes da coleção `partners` (apenas se não existirem em `partner_applications`)
    resolvedPartners.filter(p => p.status === 'pending').forEach(p => {
      const email = (p.email || '').toLowerCase().trim();
      const nif = (p.nif || '').toLowerCase().trim();
      const code = (p.code || p.id || '').toLowerCase().trim();
      const dedupeKey = email || (nif ? `nif_${nif}` : `code_${code}`);

      const isAlreadyActive =
        (email && activeEmails.has(email)) ||
        (nif && activeNifs.has(nif)) ||
        (code && activeCodes.has(code));

      if (isAlreadyActive) return;

      if (!map.has(dedupeKey)) {
        map.set(dedupeKey, {
          id: p.id,
          code: p.code,
          name: p.name,
          email: p.email,
          phone: p.phone,
          region: p.region,
          nif: p.nif,
          status: 'pending',
          createdAt: p.createdAt,
          tier: p.tier,
          payment_proof_url: p.payment_proof_url,
          payment_proof_name: p.payment_proof_name,
        });
      }
    });

    const all = Array.from(map.values());
    all.sort((a, b) => b.createdAt - a.createdAt);

    const pending = all.filter(c => c.status === 'pending');
    const approved = all.filter(c => c.status === 'approved');

    return { allApplicationsList: all, pendingApplicationsList: pending, approvedApplicationsList: approved };
  }, [applications, resolvedPartners]);

  const activePartners = resolvedPartners.filter(p => p.status === 'active');
  const pendingPartners = pendingApplicationsList;
  const totalDebtAoa = allDebts.filter(d => !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalReceivedAoa = allDebts.filter(d => d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalProvisionalDebts = allDebts.filter(d => d.is_provisional && !d.paid).length;

  const getPartnerPendingDebt = (pid: string) =>
    allDebts.filter(d => (d.partner_id === pid || (resolvedPartners.find(p => p.id === pid)?.code && d.partner_id === resolvedPartners.find(p => p.id === pid)?.code)) && !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  
  const getPartnerLicenseCount = (pid: string) =>
    allDebts.filter(d => d.partner_id === pid || (resolvedPartners.find(p => p.id === pid)?.code && d.partner_id === resolvedPartners.find(p => p.id === pid)?.code)).length;
  
  const getPartnerActiveCreditSlots = (pid: string) =>
    allDebts.filter(d => (d.partner_id === pid || (resolvedPartners.find(p => p.id === pid)?.code && d.partner_id === resolvedPartners.find(p => p.id === pid)?.code)) && !d.paid && d.payment_method !== 'wallet').length;

  const filteredPartners = resolvedPartners.filter((p) => {
    const matchesTier = tierFilter === 'todos' || p.tier === tierFilter;
    if (!matchesTier) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s) || p.region.toLowerCase().includes(s);
  });

  const currentCandidaturasList = 
    candidaturaFilter === 'pendentes' ? pendingApplicationsList :
    candidaturaFilter === 'aprovadas' ? approvedApplicationsList :
    allApplicationsList;

  const filteredCandidaturas = currentCandidaturasList.filter((cand) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return cand.name.toLowerCase().includes(s) || (cand.code && cand.code.toLowerCase().includes(s)) ||
      cand.email.toLowerCase().includes(s) || (cand.region && cand.region.toLowerCase().includes(s));
  });

  const filteredGlobalDebts = allDebts.filter(d => {
    if (debtFilterStatus === 'pendentes' && d.paid) return false;
    if (debtFilterStatus === 'pagos' && !d.paid) return false;
    if (debtFilterStatus === 'provisorios' && (!d.is_provisional || d.paid)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return d.company_name.toLowerCase().includes(s) || d.license_id.toLowerCase().includes(s) ||
      d.partner_name.toLowerCase().includes(s) || d.partner_id.toLowerCase().includes(s);
  });

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    const pCode = code.toUpperCase().trim();
    const pwd = `kivora${Math.floor(1000 + Math.random() * 9000)}`;
    const initialSlots = policy.tier_slots[newPartnerTier] || 2;
    try {
      await setDoc(doc(db, 'partners', pCode), {
        id: pCode, code: pCode, name, email, phone, region,
        tier: newPartnerTier, credit_slots_limit: initialSlots,
        debt_aoa: 0, total_paid_aoa: 0, total_sales: 0,
        status: 'active', createdAt: Date.now(),
      }, { merge: true });
      await createOrApprovePartnerAccount({ nome: name, email, phone, region, partnerCode: pCode, tier: newPartnerTier });
      
      // Envio automático de e-mail de credenciais ao parceiro via Google Gmail
      if (email && email.includes('@')) {
        sendPartnerCredentialsEmail({
          partnerEmail: email.toLowerCase().trim(),
          partnerName: name,
          partnerCode: pCode,
          password: pwd,
        }).catch((err) => console.warn('Aviso no envio de e-mail ao parceiro:', err));
      }

      setShowModal(false); setName(''); setCode(''); setEmail(''); setPhone('');
      setCredentialsModal({ open: true, partnerName: name, email, password: pwd, partnerCode: pCode, phone });
    } catch (err: any) { alert('Erro ao registar parceiro: ' + err.message); }
  };

  const handleApprovePartner = async (cand: any) => {
    setApproving(cand.id);
    const pwd = `kivora${Math.floor(1000 + Math.random() * 9000)}`;
    const pCode = (cand.code || `KVR-PR-2026-${Math.floor(100 + Math.random() * 900)}`).toUpperCase().trim();
    const initialSlots = policy.tier_slots['bronze'] || 2;
    try {
      // 1. Grava na coleção `partners` com status 'active'
      await setDoc(doc(db, 'partners', pCode), {
        id: pCode,
        code: pCode,
        name: cand.name,
        responsible: cand.responsible || cand.name,
        email: cand.email.toLowerCase().trim(),
        phone: cand.phone,
        region: cand.sede_completa || cand.region || 'Luanda, Angola',
        nif: cand.nif || '',
        tier: 'bronze',
        credit_slots_limit: initialSlots,
        debt_aoa: 0,
        total_paid_aoa: cand.fee_amount_aoa || 25000,
        total_sales: 0,
        status: 'active',
        payment_proof_url: cand.payment_proof_url || '',
        payment_proof_name: cand.payment_proof_name || '',
        createdAt: cand.createdAt || Date.now(),
        approvedAt: Date.now(),
      }, { merge: true });

      if (cand.id && cand.id !== pCode) {
        await setDoc(doc(db, 'partners', cand.id), { status: 'active', code: pCode }, { merge: true });
      }

      // 2. Se for candidatura de `partner_applications`, marca como aprovada
      if (cand.appId) {
        await updateDoc(doc(db, 'partner_applications', cand.appId), {
          status: 'approved',
          partner_code: pCode,
          approved_at: Date.now(),
        }).catch(() => {});
      }

      // 3. Cria utilizador no portal
      await createOrApprovePartnerAccount({
        nome: cand.name,
        email: cand.email,
        phone: cand.phone,
        region: cand.sede_completa || cand.region || 'Luanda, Angola',
        partnerCode: pCode,
      });

      // 4. Envio de e-mail de homologação oficial via Google Gmail (kivora.angola@gmail.com)
      if (cand.email && cand.email.includes('@')) {
        sendPartnerCredentialsEmail({
          partnerEmail: cand.email.toLowerCase().trim(),
          partnerName: cand.name,
          partnerCode: pCode,
          password: pwd,
        }).catch((err) => console.warn('Aviso no envio de e-mail ao parceiro:', err));
      }

      setCredentialsModal({
        open: true,
        partnerName: cand.name,
        email: cand.email,
        password: pwd,
        partnerCode: pCode,
        phone: cand.phone,
      });
    } catch (err: any) {
      alert('Erro ao aprovar parceiro: ' + err.message);
    } finally {
      setApproving(null);
    }
  };

  const handleRejectPartner = async (cand: any) => {
    if (!confirm(`Tem a certeza que deseja rejeitar a candidatura de ${cand.name}?`)) return;
    try {
      if (cand.appId) {
        await updateDoc(doc(db, 'partner_applications', cand.appId), {
          status: 'rejected',
          rejected_at: Date.now(),
        });
      }
      if (cand.id) {
        await updateDoc(doc(db, 'partners', cand.id), {
          status: 'rejected',
          rejected_at: Date.now(),
        }).catch(() => {});
      }
      alert('Candidatura arquivada com sucesso.');
    } catch (err: any) {
      alert('Erro ao rejeitar: ' + err.message);
    }
  };

  const handleToggleSuspend = async (p: Partner) => {
    const ns = p.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`${ns === 'suspended' ? 'Suspender' : 'Reativar'} ${p.name}?`)) return;
    try {
      await setPartnerSuspensionStatus(p.id, p.code, p.email, ns);
      alert(`Parceiro ${p.name} ${ns === 'suspended' ? 'suspenso' : 'reativado'} com sucesso em todas as coleções!`);
    } catch (err: any) { alert('Erro: ' + err.message); }
  };

  const handleDeletePartner = async (partner: Partner) => {
    const confirmDelete = window.confirm(`Tem a certeza que deseja eliminar o parceiro "${partner.name}" (${partner.code})? Esta ação apagará o registo do parceiro.`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'partners', partner.id));
      if (partner.code && partner.code !== partner.id) {
        await deleteDoc(doc(db, 'partners', partner.code)).catch(() => {});
      }
      setSelectedPartner(null);
      alert(`Parceiro "${partner.name}" eliminado com sucesso.`);
    } catch (e: any) {
      alert('Erro ao eliminar parceiro: ' + e.message);
    }
  };

  const handleSavePartnerProfile = async () => {
    if (!selectedPartner) return;
    if (!editPartnerName.trim()) {
      alert('Por favor insira o nome do parceiro ou da empresa.');
      return;
    }

    setSavingPartnerProfile(true);
    try {
      const updatePayload = {
        name: editPartnerName.trim(),
        responsible: editPartnerName.trim(),
        email: editPartnerEmail.trim().toLowerCase(),
        phone: editPartnerPhone.trim(),
        region: editPartnerRegion.trim() || 'Luanda, Angola',
        nif: editPartnerNif.trim().toUpperCase(),
      };

      await setDoc(doc(db, 'partners', selectedPartner.id), updatePayload, { merge: true });
      if (selectedPartner.code && selectedPartner.code !== selectedPartner.id) {
        await setDoc(doc(db, 'partners', selectedPartner.code), updatePayload, { merge: true }).catch(() => {});
      }

      // Sincroniza candidatura correspondente caso exista
      const matchingApp = applications.find(a => a.protocol === selectedPartner.code || a.id === selectedPartner.id);
      if (matchingApp) {
        await setDoc(doc(db, 'partner_applications', matchingApp.id), {
          name: editPartnerName.trim(),
          empresa: editPartnerName.trim(),
          empresa_nome: editPartnerName.trim(),
          nome: editPartnerName.trim(),
          email: editPartnerEmail.trim().toLowerCase(),
          telefone: editPartnerPhone.trim(),
          provincia: editPartnerRegion.trim(),
        }, { merge: true }).catch(() => {});
      }

      setSelectedPartner({
        ...selectedPartner,
        ...updatePayload,
      });

      alert('Dados do parceiro atualizados com sucesso no Firebase!');
    } catch (e: any) {
      alert('Erro ao guardar dados do parceiro: ' + e.message);
    } finally {
      setSavingPartnerProfile(false);
    }
  };

  const handleDeleteProof = async (item: any) => {
    const candidateName = item.name || item.empresa || 'este registo';
    const confirmDelete = window.confirm(`Tem a certeza que deseja apagar o ficheiro de comprovativo de "${candidateName}"?\n\nEsta ação irá libertar espaço de armazenamento no Firebase mantendo a candidatura e o parceiro ativos.`);
    if (!confirmDelete) return;

    try {
      const emptyProofPayload = {
        payment_proof_url: '',
        payment_proof_name: '',
        payment_proof_size: '',
        payment_proof_type: '',
      };

      const appId = item.appId || item.id;
      if (appId) {
        await updateDoc(doc(db, 'partner_applications', appId), emptyProofPayload).catch(() => {});
      }

      const pCode = item.protocol || item.code;
      if (pCode) {
        await updateDoc(doc(db, 'partners', pCode), emptyProofPayload).catch(() => {});
      }
      if (item.id) {
        await updateDoc(doc(db, 'partners', item.id), emptyProofPayload).catch(() => {});
      }

      if (viewProofModal && viewProofModal.open) {
        setViewProofModal(null);
      }

      alert(`Comprovativo de "${candidateName}" apagado com sucesso! Espaço libertado no Firebase.`);
    } catch (err: any) {
      alert('Erro ao apagar comprovativo: ' + err.message);
    }
  };

  const handleMarkPaid = async (debtIds: string[]) => {
    if (!debtIds.length) return;
    setMarkingPaid(true);
    try {
      await markDebtsPaid(debtIds);
      if (selectedPartner) {
        const amount = partnerDebts.filter(d => debtIds.includes(d.id)).reduce((a, d) => a + d.cost_aoa, 0);
        await setDoc(doc(db, 'partners', selectedPartner.id), {
          total_paid_aoa: (selectedPartner.total_paid_aoa || 0) + amount,
          debt_aoa: Math.max(0, getPartnerPendingDebt(selectedPartner.id) - amount),
        }, { merge: true });
      }
      setSelectedDebtIds([]);
      setGlobalSelectedDebtIds([]);
      alert(`Liquidação de ${debtIds.length} fatura(s) concluída com sucesso! Licenças provisórias foram promovidas a definitivas.`);
    } catch (err: any) { alert('Erro ao liquidar: ' + err.message); }
    finally { setMarkingPaid(false); }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try { await savePartnerPricing(pricingDraft); setEditingPricing(false); alert('Tabela de preços de atacado atualizada com sucesso!'); }
    catch (err: any) { alert('Erro: ' + err.message); }
    finally { setSavingPricing(false); }
  };

  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    try {
      await savePartnerPolicy(policyDraft);
      setPolicy(policyDraft);
      alert('Políticas e quotas de licenciamento guardadas com sucesso no Firebase!');
    } catch (err: any) {
      alert('Erro ao guardar políticas: ' + err.message);
    } finally {
      setSavingPolicy(false);
    }
  };

  const copyRefLink = (p: Partner) => {
    navigator.clipboard.writeText(`https://kivora.ao/?ref=${p.code}`);
    setCopiedCode(p.code); setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleExportPartnersCSV = () => {
    const csvHeader = 'Código,Nome,Email,Telefone,Província,Nível,Estado,Total Vendas,Dívida Pendente (Kz),Total Pago (Kz),Saldo Carteira (Kz),Data Criação\n';
    const csvRows = partners
      .map((p) => {
        const pending = getPartnerPendingDebt(p.id);
        const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-AO') : '-';
        return `"${p.code || p.id}","${p.name || ''}","${p.email || ''}","${p.phone || ''}","${p.region || 'Luanda'}","${p.tier || 'bronze'}","${p.status || 'active'}",${p.total_sales || 0},${pending},${p.total_paid_aoa || 0},${p.wallet_balance_aoa || 0},"${dateStr}"`;
      })
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `parceiros_kivora_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-w-0 flex flex-col font-sans pb-12">
      <AdminTopbar
        title="Rede de Parceiros & Políticas de Licenciamento"
        subtitle="Gestão de quotas de crédito, faturamento de atacado, carteiras pré-pagas e homologações"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPartnersCSV}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              title="Descarregar lista completa em ficheiro CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Parceiro</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Parceiros Ativos" value={activePartners.length}
            sub={`${pendingPartners.length} aguardam homologação`} subColor="green"
            icon={<Users className="w-4 h-4" />} iconBg="bg-blue-50 text-blue-600" />
          <StatCard label="Licenças Emitidas" value={allDebts.length}
            sub={`${totalProvisionalDebts} provisórias ativas`} subColor="amber"
            icon={<Key className="w-4 h-4" />} iconBg="bg-emerald-50 text-emerald-600" />
          <StatCard label="Dívida Total Pendente" value={`${fmt(totalDebtAoa)} Kz`}
            sub="A receber dos parceiros" subColor="amber"
            icon={<TrendingDown className="w-4 h-4" />} iconBg="bg-amber-50 text-amber-600" />
          <StatCard label="Total Recebido (Atacado)" value={`${fmt(totalReceivedAoa)} Kz`}
            sub="Pagamentos liquidados" subColor="green"
            icon={<Wallet className="w-4 h-4" />} iconBg="bg-purple-50 text-purple-600" />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'todos', label: `Parceiros & Quotas (${partners.length})`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'candidaturas', label: 'Candidaturas Pendentes', icon: <CheckCircle2 className="w-3.5 h-3.5" />, badge: pendingPartners.length },
            { id: 'politicas', label: 'Políticas & Quotas de Crédito', icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: 'precos', label: 'Tabela de Preços Atacado', icon: <Tag className="w-3.5 h-3.5" /> },
            { id: 'extrato_geral', label: 'Extrato Geral de Dívidas', icon: <DollarSign className="w-3.5 h-3.5" /> },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                tab === t.id ? 'bg-slate-950 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
              {t.icon}
              <span>{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full font-black">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'todos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, código PRT, email, província..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">Todos os Níveis</option>
                  <option value="bronze">Bronze (Iniciante)</option>
                  <option value="silver">Silver (Ativo)</option>
                  <option value="gold">Gold (Avançado)</option>
                  <option value="diamond">Diamond (Master)</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-4">Parceiro</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Slots a Crédito</th>
                      <th className="p-4">Saldo Carteira</th>
                      <th className="p-4">Dívida Pendente</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                          <span>A carregar parceiros do Firebase...</span>
                        </td>
                      </tr>
                    ) : filteredPartners.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Nenhum parceiro encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredPartners.map((p) => {
                        const debt = getPartnerPendingDebt(p.id);
                        const lics = getPartnerLicenseCount(p.id);
                        const activeSlots = getPartnerActiveCreditSlots(p.id);
                        const slotsLimit = p.credit_slots_limit || 2;
                        const isSlotsFull = activeSlots >= slotsLimit;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit mb-1 border border-blue-200">
                                  {p.code}
                                </span>
                                <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                                <span className="text-[11px] text-slate-400">
                                  {[p.email, p.phone, p.region].filter(Boolean).join(' • ') || 'Luanda, Angola'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                p.tier === 'diamond' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                p.tier === 'gold' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                p.tier === 'silver' ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                                'bg-amber-50 text-amber-900 border border-amber-200'
                              }`}>
                                <Award className="w-3 h-3" />
                                <span>{p.tier}</span>
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className={`font-mono font-bold text-xs ${isSlotsFull ? 'text-amber-700' : 'text-slate-900'}`}>
                                  {activeSlots} / {slotsLimit} em uso
                                </span>
                                <span className="text-[10px] text-slate-400">{lics} licenças emitidas</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {fmt(p.wallet_balance_aoa || 0)} Kz
                              </span>
                            </td>
                            <td className="p-4">
                              {debt > 0 ? (
                                <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{fmt(debt)} Kz</span>
                              ) : (
                                <span className="text-emerald-600 font-bold text-[11px]">✓ Regularizado</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                p.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-red-50 text-red-700 border border-red-200'}`}>
                                {p.status === 'active' ? 'Ativo' : p.status === 'pending' ? 'Pendente' : 'Suspenso'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setCertificatesPartnerModal({
                                    partnerName: p.name,
                                    partnerCode: p.code,
                                    tier: p.tier,
                                    region: p.region,
                                    email: p.email,
                                    phone: p.phone,
                                    createdAt: p.createdAt,
                                  })}
                                  title="Emitir Certificados Oficiais (Visual Software & Kivora)"
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Award className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => copyRefLink(p)}
                                  title="Copiar Link de Afiliado"
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  {copiedCode === p.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleToggleSuspend(p)}
                                  title={p.status === 'active' ? 'Suspender Parceiro' : 'Reativar Parceiro'}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  {p.status === 'active' ? <Ban className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => setSelectedPartner(p)}
                                  title="Ver Detalhes, Extrato & Editar Perfil"
                                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePartner(p)}
                                  title="Eliminar Parceiro do Sistema"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'candidaturas' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Candidaturas ao Programa de Parceiros</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Solicitações recebidas através do formulário oficial do site e histórico de homologações.
                </p>
              </div>

              {/* Sub-filtro de Candidaturas */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setCandidaturaFilter('pendentes')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    candidaturaFilter === 'pendentes'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Pendentes ({pendingApplicationsList.length})
                </button>
                <button
                  onClick={() => setCandidaturaFilter('aprovadas')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    candidaturaFilter === 'aprovadas'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Homologadas ({approvedApplicationsList.length})
                </button>
                <button
                  onClick={() => setCandidaturaFilter('todas')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    candidaturaFilter === 'todas'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Todas ({allApplicationsList.length})
                </button>
              </div>
            </div>

            {filteredCandidaturas.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="font-black text-slate-700 text-sm">
                  {candidaturaFilter === 'pendentes'
                    ? 'Todas as candidaturas foram homologadas! Não há novos candidatos pendentes.'
                    : 'Nenhuma candidatura encontrada nesta categoria.'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Novas solicitações de parceria preenchidas no site em <strong>kivora.ao/#parceiros</strong> aparecerão automaticamente aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCandidaturas.map((cand: any) => (
                  <div
                    key={cand.id}
                    className="p-5 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[10px] font-black text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {cand.protocol || cand.code}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm mt-1.5">{cand.name}</h4>
                        {cand.responsible && cand.responsible !== cand.name && (
                          <p className="text-xs text-slate-600 font-medium">Resp: {cand.responsible}</p>
                        )}
                      </div>

                      {cand.status === 'approved' ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Homologado / Ativo</span>
                        </span>
                      ) : cand.status === 'rejected' ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 shrink-0">
                          Arquivado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          Pendente
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">NIF:</span>
                        <strong className="text-slate-800">{cand.nif || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Localização:</span>
                        <strong className="text-slate-800 truncate block">{cand.region || 'Luanda'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Telefone:</span>
                        <a href={`tel:${cand.phone}`} className="text-blue-600 font-bold hover:underline">
                          {cand.phone}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">E-mail:</span>
                        <a href={`mailto:${cand.email}`} className="text-slate-700 font-medium truncate block hover:text-blue-600">
                          {cand.email}
                        </a>
                      </div>
                    </div>

                    {cand.tipo_parceria && (
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p><strong>Tipo de Parceria:</strong> <span className="text-emerald-700 font-semibold">{cand.tipo_parceria}</span></p>
                        {cand.tem_clientes && <p><strong>Clientes Atuais:</strong> {cand.tem_clientes}</p>}
                        {cand.experiencia && <p><strong>Experiência:</strong> {cand.experiencia}</p>}
                      </div>
                    )}

                    {/* Botão de Visualização / Exclusão do Comprovativo Bancário */}
                    <div className="pt-1">
                      {cand.payment_proof_url ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewProofModal({ open: true, item: cand })}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-xs"
                          >
                            <span className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <span>Comprovativo Bancário (25.000 Kz)</span>
                            </span>
                            <span className="text-[10px] bg-blue-200/80 text-blue-950 font-mono px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <span>Ver Anexo</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProof(cand)}
                            title="Apagar anexo para libertar espaço no Firebase"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center justify-between">
                          <span>Taxa de Homologação: <strong>25.000 Kz</strong></span>
                          <span className="text-[10px] text-slate-400 font-medium">Sem anexo digital (Opcional)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(cand.createdAt).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>

                      {cand.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectPartner(cand)}
                            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          >
                            Arquivar
                          </button>
                          <button
                            onClick={() => handleApprovePartner(cand)}
                            disabled={approving === cand.id}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            {approving === cand.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Aprovar & Homologar</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          Conta de Parceiro Ativa
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'politicas' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  <span>Configuração das Regras de Licenciamento & Crédito</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Defina os limites de slots por categoria de parceiro, tolerância de atraso e travas automáticas anti-calote.
                </p>
              </div>

              <button
                onClick={handleSavePolicy}
                disabled={savingPolicy}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer shrink-0"
              >
                {savingPolicy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Políticas no Firebase</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>1. Quotas Padrão de Slots de Crédito por Categoria</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Quantidade máxima de licenças que um parceiro deste nível pode emitir a crédito sem liquidação prévia:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {[
                    { key: 'bronze', label: 'Bronze (Iniciante)', desc: 'Novos parceiros homologados' },
                    { key: 'silver', label: 'Silver (Ativo)', desc: 'Parceiros com vendas regulares' },
                    { key: 'gold', label: 'Gold (Avançado)', desc: 'Revendedores com alto volume' },
                    { key: 'diamond', label: 'Diamond (Master)', desc: 'Distribuidores oficiais e masters' },
                  ].map((t) => (
                    <div key={t.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-black uppercase text-slate-800 block">{t.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={policyDraft.tier_slots[t.key as keyof typeof policyDraft.tier_slots]}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value) || 1);
                            setPolicyDraft({
                              ...policyDraft,
                              tier_slots: {
                                ...policyDraft.tier_slots,
                                [t.key]: val,
                              }
                            });
                          }}
                          className="w-20 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-center"
                        />
                        <span className="text-xs font-bold text-slate-600">Slots de Crédito</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Prazos e Travas de Segurança Anti-Inadimplência</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Tolerância de Vencimento de Dívidas (Dias)</label>
                    <p className="text-[11px] text-slate-500">Se o parceiro tiver faturas pendentes emitidas há mais tempo que este limite, novas emissões a crédito são bloqueadas:</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={policyDraft.overdue_tolerance_days}
                        onChange={(e) => setPolicyDraft({ ...policyDraft, overdue_tolerance_days: Number(e.target.value) || 15 })}
                        className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                      <span className="text-xs font-bold text-slate-700">Dias corridos</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Ativação Provisória para Vitalício a Crédito (Dias)</label>
                    <p className="text-[11px] text-slate-500">Prazo inicial que a licença vitalícia funciona no cliente antes da liquidação da fatura pelo parceiro:</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min={7}
                        max={90}
                        value={policyDraft.provisional_lifetime_days}
                        onChange={(e) => setPolicyDraft({ ...policyDraft, provisional_lifetime_days: Number(e.target.value) || 30 })}
                        className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                      <span className="text-xs font-bold text-slate-700">Dias de proteção inicial</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Recarga Mínima da Carteira Pré-Paga (Kz)</label>
                    <p className="text-[11px] text-slate-500">Valor mínimo sugerido para transferências de recarga de Wallet:</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        step={10000}
                        value={policyDraft.min_wallet_topup_aoa}
                        onChange={(e) => setPolicyDraft({ ...policyDraft, min_wallet_topup_aoa: Number(e.target.value) || 50000 })}
                        className="w-36 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                      <span className="text-xs font-bold text-slate-700">Kz Mínimo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Custos & Políticas de Terminais Adicionais (Rede Local LAN) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>3. Configuração de Custos de Terminais / Postos Extras</span>
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Diferenciado por Nível (Tier)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Configure o valor cobrado nas vendas diretas do Admin e o custo de atacado por terminal com desconto progressivo para cada nível de parceiro:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Preço de Terminal para Venda Final / Admin (Kz)</label>
                    <p className="text-[11px] text-slate-500">Valor cobrado quando o Admin adiciona postos a clientes ou nas vendas públicas:</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        step={5000}
                        value={policyDraft.admin_extra_seat_cost_aoa || 35000}
                        onChange={(e) => setPolicyDraft({
                          ...policyDraft,
                          admin_extra_seat_cost_aoa: Number(e.target.value) || 35000,
                          retail_extra_seat_price_aoa: Number(e.target.value) || 35000,
                          extra_seat_cost_aoa: Number(e.target.value) || 35000,
                        })}
                        className="w-36 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                      <span className="text-xs font-bold text-slate-700">Kz / Posto Final</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Custo Base de Atacado para Parceiros (Kz)</label>
                    <p className="text-[11px] text-slate-500">Referência base de custo por computador em rede cobrado aos parceiros:</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        step={5000}
                        value={policyDraft.partner_extra_seat_base_cost_aoa || 25000}
                        onChange={(e) => setPolicyDraft({
                          ...policyDraft,
                          partner_extra_seat_base_cost_aoa: Number(e.target.value) || 25000,
                        })}
                        className="w-36 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                      <span className="text-xs font-bold text-slate-700">Kz / Posto Base</span>
                    </div>
                  </div>
                </div>

                {/* Tabela de Custo de Terminal por Nível */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-3">
                  <span className="text-xs font-black uppercase text-blue-900 block">
                    Custo de Atacado por Posto Conforme o Nível do Parceiro (Tier):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { key: 'bronze', label: 'Bronze', defaultVal: 25000, desc: 'Margem: 10.000 Kz' },
                      { key: 'silver', label: 'Silver', defaultVal: 20000, desc: 'Margem: 15.000 Kz' },
                      { key: 'gold', label: 'Gold', defaultVal: 15000, desc: 'Margem: 20.000 Kz' },
                      { key: 'diamond', label: 'Diamond', defaultVal: 10000, desc: 'Margem: 25.000 Kz' },
                    ].map((t) => (
                      <div key={t.key} className="bg-white p-3 rounded-xl border border-blue-200/60 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black uppercase text-slate-800">{t.label}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {t.desc}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step={2500}
                            value={policyDraft.tier_extra_seat_costs?.[t.key as keyof typeof policyDraft.tier_extra_seat_costs] ?? t.defaultVal}
                            onChange={(e) => {
                              const val = Math.max(1000, Number(e.target.value) || t.defaultVal);
                              setPolicyDraft({
                                ...policyDraft,
                                tier_extra_seat_costs: {
                                  bronze: policyDraft.tier_extra_seat_costs?.bronze ?? 25000,
                                  silver: policyDraft.tier_extra_seat_costs?.silver ?? 20000,
                                  gold: policyDraft.tier_extra_seat_costs?.gold ?? 15000,
                                  diamond: policyDraft.tier_extra_seat_costs?.diamond ?? 10000,
                                  [t.key]: val,
                                }
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900"
                          />
                          <span className="text-[11px] font-bold text-slate-500">Kz</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seção 3: Requisitos de Homologação de Parceiros & Taxa de Adesão */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>3. Taxa de Adesão & Requisitos para se Tornar Parceiro</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Configure o valor cobrado para homologação inicial e os critérios exigidos exibidos na página de candidatura:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Taxa de Adesão / Homologação (Kz)</label>
                    <p className="text-[11px] text-slate-500">Valor único cobrado para ativação do credenciamento e emissão dos certificados oficiais:</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        step={5000}
                        value={policyDraft.partner_membership_fee_aoa ?? 25000}
                        onChange={(e) => setPolicyDraft({ ...policyDraft, partner_membership_fee_aoa: Number(e.target.value) || 0 })}
                        className="w-36 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                      <span className="text-xs font-bold text-slate-700">Kz / Adesão</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">IBAN / Conta para Pagamento da Taxa</label>
                    <div className="space-y-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Banco (ex: BAI / BFA)"
                        value={policyDraft.membership_bank_info?.bank || ''}
                        onChange={(e) => setPolicyDraft({
                          ...policyDraft,
                          membership_bank_info: { ...(policyDraft.membership_bank_info || DEFAULT_PARTNER_POLICY.membership_bank_info), bank: e.target.value }
                        })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="IBAN (ex: AO06 0040...)"
                        value={policyDraft.membership_bank_info?.iban || ''}
                        onChange={(e) => setPolicyDraft({
                          ...policyDraft,
                          membership_bank_info: { ...(policyDraft.membership_bank_info || DEFAULT_PARTNER_POLICY.membership_bank_info), iban: e.target.value }
                        })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">Critérios & Requisitos Exigidos do Candidato</label>
                  <div className="space-y-2">
                    {(policyDraft.partner_requirements || DEFAULT_PARTNER_POLICY.partner_requirements).map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => {
                            const list = [...(policyDraft.partner_requirements || DEFAULT_PARTNER_POLICY.partner_requirements)];
                            list[idx] = e.target.value;
                            setPolicyDraft({ ...policyDraft, partner_requirements: list });
                          }}
                          className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const list = (policyDraft.partner_requirements || DEFAULT_PARTNER_POLICY.partner_requirements).filter((_, i) => i !== idx);
                            setPolicyDraft({ ...policyDraft, partner_requirements: list });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Remover Requisito"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Adicionar novo requisito (ex: Experiência comprovada em suporte técnico)..."
                      value={newReqInput}
                      onChange={(e) => setNewReqInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newReqInput.trim()) return;
                        const current = policyDraft.partner_requirements || DEFAULT_PARTNER_POLICY.partner_requirements;
                        setPolicyDraft({ ...policyDraft, partner_requirements: [...current, newReqInput.trim()] });
                        setNewReqInput('');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {tab === 'precos' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Tabela de Preços de Atacado</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Custo que o parceiro deve pagar à Kivora por cada licença gerada no portal.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {editingPricing ? (
                  <>
                    <button onClick={() => { setEditingPricing(false); setPricingDraft(pricingPlans); }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 cursor-pointer">Cancelar</button>
                    <button onClick={handleSavePricing} disabled={savingPricing}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer">
                      {savingPricing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Guardar no Firebase</span>
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setEditingPricing(true); setPricingDraft([...pricingPlans]); }}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" /><span>Editar Preços</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 space-y-3">
              {(editingPricing ? pricingDraft : pricingPlans).map((plan, idx) => (
                <div key={plan.plan_type} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{plan.label}</span>
                    <span className="ml-2 text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{plan.plan_type}</span>
                  </div>
                  {editingPricing ? (
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} value={pricingDraft[idx].cost_aoa}
                        onChange={(e) => { const d = [...pricingDraft]; d[idx] = { ...d[idx], cost_aoa: Number(e.target.value) }; setPricingDraft(d); }}
                        className="w-36 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold bg-white focus:outline-none focus:border-blue-500 text-right" />
                      <span className="text-xs font-bold text-slate-500">Kz</span>
                    </div>
                  ) : (
                    <span className="font-mono font-black text-slate-900 text-sm">{fmt(plan.cost_aoa)} Kz</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'extrato_geral' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Extrato Geral de Faturamento & Liquidações</h3>
                <p className="text-xs text-slate-500">Consulte todas as licenças geradas pela rede e faça liquidações em lote.</p>
              </div>

              <div className="flex items-center gap-2">
                {globalSelectedDebtIds.length > 0 && (
                  <button
                    onClick={() => handleMarkPaid(globalSelectedDebtIds)}
                    disabled={markingPaid}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {markingPaid ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Liquidar Selecionadas ({globalSelectedDebtIds.length})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const headers = ['Licenca_ID', 'Parceiro', 'Empresa_Cliente', 'Plano', 'Custo_Kivora_AOA', 'Estado', 'Data'];
                    const rows = filteredGlobalDebts.map(d => [
                      d.license_id,
                      `"${(d.partner_name || d.partner_id || '').replace(/"/g, '""')}"`,
                      `"${(d.company_name || '').replace(/"/g, '""')}"`,
                      d.plan_type,
                      d.cost_aoa,
                      d.paid ? 'Pago' : d.is_provisional ? 'Provisório' : 'Pendente',
                      new Date(d.created_at).toISOString().split('T')[0]
                    ]);
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                    const link = document.createElement('a');
                    link.setAttribute('href', encodeURI(csvContent));
                    link.setAttribute('download', `extrato_geral_kivora_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              {[
                { id: 'pendentes', label: 'Dívidas Pendentes' },
                { id: 'provisorios', label: 'Provisórias (Aguardam Acerto)' },
                { id: 'pagos', label: 'Liquidadas' },
                { id: 'todos', label: 'Todas as Faturas' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDebtFilterStatus(f.id as any)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    debtFilterStatus === f.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={globalSelectedDebtIds.length > 0 && globalSelectedDebtIds.length === filteredGlobalDebts.filter(d => !d.paid).length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGlobalSelectedDebtIds(filteredGlobalDebts.filter(d => !d.paid).map(d => d.id));
                          } else {
                            setGlobalSelectedDebtIds([]);
                          }
                        }}
                        className="rounded accent-emerald-600"
                      />
                    </th>
                    <th className="p-3">Licença</th>
                    <th className="p-3">Parceiro</th>
                    <th className="p-3">Empresa Cliente</th>
                    <th className="p-3">Plano</th>
                    <th className="p-3">Custo Atacado</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGlobalDebts.length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-400">Nenhum registo encontrado com este filtro.</td></tr>
                  ) : filteredGlobalDebts.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          disabled={d.paid}
                          checked={globalSelectedDebtIds.includes(d.id)}
                          onChange={(e) => {
                            if (e.target.checked) setGlobalSelectedDebtIds(prev => [...prev, d.id]);
                            else setGlobalSelectedDebtIds(prev => prev.filter(id => id !== d.id));
                          }}
                          className="rounded accent-emerald-600"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-700">{d.license_id}</td>
                      <td className="p-3 font-semibold text-slate-800">{d.partner_name || d.partner_id}</td>
                      <td className="p-3 font-bold text-slate-900">{d.company_name}</td>
                      <td className="p-3 font-semibold">{d.plan_type}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{fmt(d.cost_aoa)} Kz</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.paid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          d.is_provisional ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {d.paid ? '✓ Pago' : d.is_provisional ? 'Provisório (30D)' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(d.created_at).toLocaleDateString('pt-AO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                  {selectedPartner.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedPartner.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">Código: {selectedPartner.code} • {selectedPartner.region}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {/* 1. Edição de Dados Cadastrais do Parceiro */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shrink-0 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 uppercase text-[10px] flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dados Cadastrais & Identificação do Parceiro</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-bold">Código: {selectedPartner.code}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nome da Empresa / Parceiro</label>
                  <input
                    type="text"
                    value={editPartnerName}
                    onChange={(e) => setEditPartnerName(e.target.value)}
                    placeholder="Ex: Luanda Softwares, Lda."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email do Parceiro</label>
                  <input
                    type="email"
                    value={editPartnerEmail}
                    onChange={(e) => setEditPartnerEmail(e.target.value)}
                    placeholder="parceiro@email.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={editPartnerPhone}
                    onChange={(e) => setEditPartnerPhone(e.target.value)}
                    placeholder="Ex: +244 923 000 000"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Região / Sede</label>
                  <input
                    type="text"
                    value={editPartnerRegion}
                    onChange={(e) => setEditPartnerRegion(e.target.value)}
                    placeholder="Ex: Luanda, Angola"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Comprovativo Bancário do Parceiro (se houver) */}
              {(() => {
                const matchingAppForProof = applications.find(a => 
                  (a.protocol && a.protocol === selectedPartner.code) ||
                  (a.id && a.id === selectedPartner.id) ||
                  (selectedPartner.email && a.email && a.email.toLowerCase() === selectedPartner.email.toLowerCase())
                );
                const proofUrl = matchingAppForProof?.payment_proof_url || (selectedPartner as any).payment_proof_url;
                if (!proofUrl) return null;

                return (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 text-[11px] block">Comprovativo de Taxa (25.000 Kz)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Ficheiro guardado no Firebase</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewProofModal({ open: true, item: matchingAppForProof || selectedPartner })}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2.5 py-1 rounded-lg cursor-pointer shadow-2xs"
                      >
                        Ver Anexo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProof(matchingAppForProof || selectedPartner)}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                        title="Apagar ficheiro para libertar espaço"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Apagar</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">NIF:</span>
                  <input
                    type="text"
                    value={editPartnerNif}
                    onChange={(e) => setEditPartnerNif(e.target.value.toUpperCase())}
                    placeholder="NIF da Empresa"
                    className="w-36 bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-mono font-bold uppercase"
                  />
                </div>

                <button
                  onClick={handleSavePartnerProfile}
                  disabled={savingPartnerProfile}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {savingPartnerProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Guardar Dados do Parceiro</span>
                </button>
              </div>
            </div>

            {/* 2. Configuração de Quotas & Saldo */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 shrink-0 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 uppercase text-[10px] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Configuração Individual de Quotas & Categoria</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">ID: {selectedPartner.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  >
                    <option value="bronze">Bronze ({policy.tier_slots.bronze} Slots)</option>
                    <option value="silver">Silver ({policy.tier_slots.silver} Slots)</option>
                    <option value="gold">Gold ({policy.tier_slots.gold} Slots)</option>
                    <option value="diamond">Diamond ({policy.tier_slots.diamond} Slots)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Quota Slots Crédito</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={editCreditSlots}
                    onChange={(e) => setEditCreditSlots(Number(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={async () => {
                      setSavingFinancials(true);
                      try {
                        await setDoc(doc(db, 'partners', selectedPartner.id), {
                          tier: editTier,
                          credit_slots_limit: editCreditSlots,
                        }, { merge: true });
                        alert('Categoria e Quota de Slots atualizadas no Firebase!');
                      } catch (e: any) { alert('Erro: ' + e.message); }
                      finally { setSavingFinancials(false); }
                    }}
                    disabled={savingFinancials}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {savingFinancials ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Atualizar Quota'}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Injetar Saldo na Carteira Pré-Paga (Kz)</label>
                  <input
                    type="number"
                    step={10000}
                    placeholder="Ex: 150000"
                    value={topUpAmount || ''}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!topUpAmount || topUpAmount <= 0) return;
                    setSavingFinancials(true);
                    try {
                      const cur = selectedPartner.wallet_balance_aoa || 0;
                      await setDoc(doc(db, 'partners', selectedPartner.id), { wallet_balance_aoa: cur + topUpAmount }, { merge: true });
                      alert(`Saldo de ${fmt(topUpAmount)} Kz creditado na carteira!`);
                      setTopUpAmount(0);
                    } catch (e: any) { alert('Erro: ' + e.message); }
                    finally { setSavingFinancials(false); }
                  }}
                  disabled={savingFinancials || !topUpAmount}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Recarregar Carteira
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="flex items-center justify-between sticky top-0 bg-white py-1 z-10">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Licenças Geradas ({partnerDebts.length})</h4>
                {selectedDebtIds.length > 0 && (
                  <button
                    onClick={() => handleMarkPaid(selectedDebtIds)}
                    disabled={markingPaid}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    {markingPaid ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Liquidar Selecionadas ({selectedDebtIds.length})</span>
                  </button>
                )}
              </div>

              {partnerDebts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Key className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Nenhuma licença emitida por este parceiro.</p>
                </div>
              ) : partnerDebts.map((d) => (
                <label key={d.id} className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  d.paid ? 'bg-slate-50 border-slate-100 opacity-60' :
                  selectedDebtIds.includes(d.id) ? 'bg-emerald-50 border-emerald-300' :
                  'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    disabled={d.paid}
                    checked={selectedDebtIds.includes(d.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedDebtIds(prev => [...prev, d.id]);
                      else setSelectedDebtIds(prev => prev.filter(id => id !== d.id));
                    }}
                    className="w-4 h-4 rounded accent-emerald-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-700">{d.license_id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        d.paid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        d.is_provisional ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {d.paid ? '✓ Pago' : d.is_provisional ? 'Provisório (30D)' : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{d.company_name}</p>
                    <p className="text-[10px] text-slate-400">{new Date(d.created_at).toLocaleDateString('pt-AO')} • Plano: {d.plan_type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-slate-900 text-xs">{fmt(d.cost_aoa)} Kz</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCertificatesPartnerModal({
                    partnerName: selectedPartner.name,
                    partnerCode: selectedPartner.code,
                    tier: selectedPartner.tier,
                    region: selectedPartner.region,
                    email: selectedPartner.email,
                    phone: selectedPartner.phone,
                    createdAt: selectedPartner.createdAt,
                  })}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-200" />
                  <span>Ver Certificados Oficiais</span>
                </button>

                <button
                  onClick={() => handleDeletePartner(selectedPartner)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 border border-rose-200 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Parceiro</span>
                </button>
              </div>

              <button onClick={() => setSelectedPartner(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Registar Novo Parceiro</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddPartner} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nome da Empresa / Revendedor</label>
                <input type="text" required placeholder="Ex: Luanda Softwares, Lda." value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Código Único (PRT)</label>
                  <input type="text" required placeholder="Ex: PRT-LUA-01" value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold focus:outline-none focus:border-blue-500 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Categoria Inicial</label>
                  <select
                    value={newPartnerTier}
                    onChange={(e) => setNewPartnerTier(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 font-bold"
                  >
                    <option value="bronze">Bronze ({policy.tier_slots.bronze} Slots)</option>
                    <option value="silver">Silver ({policy.tier_slots.silver} Slots)</option>
                    <option value="gold">Gold ({policy.tier_slots.gold} Slots)</option>
                    <option value="diamond">Diamond ({policy.tier_slots.diamond} Slots)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Email de Acesso</label>
                <input type="email" required placeholder="parceiro@empresa.ao" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Telefone / WhatsApp</label>
                  <input type="text" placeholder="+244 923 000 000" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Província</label>
                  <input type="text" placeholder="Luanda" value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer">
                Registar & Ativar Acesso
              </button>
            </form>
          </div>
        </div>
      )}

      {credentialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Key className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Acesso de Parceiro Homologado!</h3>
                  <p className="text-xs text-slate-500">Credenciais gravadas no Firebase</p>
                </div>
              </div>
              <button onClick={() => setCredentialsModal(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-slate-950 text-white rounded-2xl p-5 space-y-3 font-mono text-xs select-all border border-slate-800">
              {([
                ['Parceiro', credentialsModal.partnerName, 'text-white font-sans'],
                ['Código', credentialsModal.partnerCode, 'text-emerald-400'],
                ['Email', credentialsModal.email, 'text-blue-300'],
                ['Palavra-passe', credentialsModal.password, 'text-amber-300'],
                ['Portal', 'https://kivora.ao/#login', 'text-slate-300 text-[11px]'],
              ] as [string, string, string][]).map(([label, value, cls]) => (
                <div key={label} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-400 font-sans">{label}:</span>
                  <span className={cls}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                navigator.clipboard.writeText(`*Portal do Parceiro KIVORA*\n\n• Email: ${credentialsModal.email}\n• Palavra-passe: ${credentialsModal.password}\n• Código de Parceiro: ${credentialsModal.partnerCode}\n• Acesso: https://kivora.ao/#login`);
                setCopiedCredentials(true); setTimeout(() => setCopiedCredentials(false), 2500);
              }} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                {copiedCredentials ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCredentials ? 'Copiado!' : 'Copiar Mensagem'}</span>
              </button>
              {credentialsModal.phone && (
                <a href={`https://wa.me/${credentialsModal.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`*Portal do Parceiro KIVORA*\n• Email: ${credentialsModal.email}\n• Palavra-passe: ${credentialsModal.password}\n• Código de Parceiro: ${credentialsModal.partnerCode}\n• Acesso: https://kivora.ao/#login`)}`}
                  target="_blank" rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 shrink-0">
                  <MessageSquare className="w-4 h-4" /><span>WhatsApp</span>
                </a>
              )}
            </div>

            {/* BOTÃO DISPARAR / REENVIAR POR E-MAIL */}
            <button
              type="button"
              onClick={async () => {
                if (!credentialsModal.email || !credentialsModal.email.includes('@')) {
                  alert('Este parceiro não tem endereço de e-mail válido.');
                  return;
                }
                setSendingPartnerEmail(true);
                try {
                  const res = await sendPartnerCredentialsEmail({
                    partnerEmail: credentialsModal.email,
                    partnerName: credentialsModal.partnerName,
                    partnerCode: credentialsModal.partnerCode,
                    password: credentialsModal.password,
                  });
                  if (res.success) {
                    setPartnerEmailSent(true);
                    setTimeout(() => setPartnerEmailSent(false), 4000);
                    alert(`Credenciais enviadas com sucesso por e-mail para ${credentialsModal.email}!`);
                  } else {
                    alert(`Não foi possível enviar o e-mail: ${res.error || 'Verifique as definições em Configurações ➔ Serviço de E-mails.'}`);
                  }
                } catch (err: any) {
                  alert('Erro ao enviar e-mail: ' + err.message);
                } finally {
                  setSendingPartnerEmail(false);
                }
              }}
              disabled={sendingPartnerEmail}
              className={`w-full font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                partnerEmailSent 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
            >
              {sendingPartnerEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : partnerEmailSent ? <CheckCircle2 className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              <span>{partnerEmailSent ? 'E-mail Enviado com Sucesso!' : 'Enviar Credenciais por E-mail ao Parceiro'}</span>
            </button>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setCertificatesPartnerModal({
                    partnerName: credentialsModal.partnerName,
                    partnerCode: credentialsModal.partnerCode,
                    email: credentialsModal.email,
                    phone: credentialsModal.phone,
                    tier: 'bronze',
                    createdAt: Date.now(),
                  });
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Award className="w-4 h-4 text-amber-200" />
                <span>Emitir Certificados Oficiais</span>
              </button>
              <button onClick={() => setCredentialsModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render do Modal de Visualização do Comprovativo de Pagamento */}
      {viewProofModal && viewProofModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header do Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Comprovativo de Transferência Bancária</h3>
                  <p className="text-xs text-slate-400">Taxa Única de Homologação e Certificação (25.000 Kz)</p>
                </div>
              </div>
              <button
                onClick={() => setViewProofModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadados da Candidatura */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Empresa / Parceiro:</span>
                <strong className="text-slate-900 truncate block">{viewProofModal.item.name}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">NIF:</span>
                <strong className="text-slate-900 font-mono block">{viewProofModal.item.nif || 'Não informado'}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Montante:</span>
                <strong className="text-emerald-700 font-mono block">25.000,00 Kz</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Protocolo:</span>
                <strong className="text-blue-700 font-mono block">{viewProofModal.item.protocol || viewProofModal.item.code}</strong>
              </div>
            </div>

            {/* Visualizador do Comprovativo */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-100 min-h-[300px]">
              {viewProofModal.item.payment_proof_url ? (
                viewProofModal.item.payment_proof_type === 'application/pdf' || viewProofModal.item.payment_proof_url.startsWith('data:application/pdf') ? (
                  <div className="w-full h-80 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4 shadow-sm">
                    <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{viewProofModal.item.payment_proof_name || 'Comprovativo_Pagamento.pdf'}</h4>
                      <p className="text-xs text-slate-500 mt-1">Documento em formato PDF ({viewProofModal.item.payment_proof_size || 'Documento Oficial'})</p>
                    </div>
                    <a
                      href={viewProofModal.item.payment_proof_url}
                      download={viewProofModal.item.payment_proof_name || 'Comprovativo_Parceiro_25000Kz.pdf'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Abrir / Descarregar PDF</span>
                    </a>
                  </div>
                ) : (
                  <div className="max-w-full max-h-[500px] flex items-center justify-center">
                    <img
                      src={viewProofModal.item.payment_proof_url}
                      alt="Comprovativo de Transferência Bancária"
                      className="max-h-[460px] w-auto object-contain rounded-2xl shadow-md border border-slate-200"
                    />
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">Nenhum ficheiro anexado a este registo.</p>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {viewProofModal.item.payment_proof_url ? (
                  <>
                    <a
                      href={viewProofModal.item.payment_proof_url}
                      download={viewProofModal.item.payment_proof_name || `Comprovativo_${viewProofModal.item.name}.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descarregar</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteProof(viewProofModal.item)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                      title="Apagar este anexo para poupar espaço no Firebase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Apagar Anexo (Libertar Espaço)</span>
                    </button>
                  </>
                ) : <div />}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewProofModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                {viewProofModal.item.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = viewProofModal.item;
                      setViewProofModal(null);
                      handleApprovePartner(item);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar & Emitir Credencial</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Render do Modal de Certificados Oficiais */}
      {certificatesPartnerModal && (
        <PartnerOfficialCertificatesModal
          partner={certificatesPartnerModal}
          onClose={() => setCertificatesPartnerModal(null)}
        />
      )}
    </div>
  );
};

export const AdminCandidaturas: React.FC<AdminParceirosProps> = (props) => <AdminParceiros {...props} initialTab="candidaturas" />;

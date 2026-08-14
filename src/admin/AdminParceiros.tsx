import React, { useState, useEffect } from 'react';
import {
  Plus, Eye, Check, X,
  DollarSign, Users, CheckCircle2, Loader2, Copy,
  Key, MessageSquare, Search, Ban, RotateCcw,
  Tag, TrendingDown, Wallet, Edit2, Save
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { createOrApprovePartnerAccount } from './services/authService';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import {
  subscribePartnerPricing, savePartnerPricing, subscribeAllDebts, markDebtsPaid,
  DEFAULT_PARTNER_PRICING,
} from './services/partnerDebtService';
import type { PartnerPricingPlan, PartnerDebtEntry } from './services/partnerDebtService';

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
  status: 'active' | 'pending' | 'suspended';
  createdAt: number;
}

interface AdminParceirosProps {
  onCandidaturas?: () => void;
  onBack?: () => void;
  initialTab?: 'todos' | 'candidaturas';
}

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const AdminParceiros: React.FC<AdminParceirosProps> = ({ initialTab = 'todos' }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'todos' | 'candidaturas' | 'precos'>(initialTab === 'candidaturas' ? 'candidaturas' : 'todos');
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{
    open: boolean; partnerName: string; email: string; password: string; partnerCode: string; phone: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  const [allDebts, setAllDebts] = useState<PartnerDebtEntry[]>([]);
  const [partnerDebts, setPartnerDebts] = useState<PartnerDebtEntry[]>([]);
  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([]);
  const [markingPaid, setMarkingPaid] = useState(false);

  const [pricingPlans, setPricingPlans] = useState<PartnerPricingPlan[]>(DEFAULT_PARTNER_PRICING);
  const [editingPricing, setEditingPricing] = useState(false);
  const [pricingDraft, setPricingDraft] = useState<PartnerPricingPlan[]>(DEFAULT_PARTNER_PRICING);
  const [savingPricing, setSavingPricing] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Luanda');

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'partners'), (snapshot) => {
        const map = new Map<string, Partner>();
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const pCode = (d.code || docSnap.id).toUpperCase().trim();
          const existing = map.get(pCode);

          const item: Partner = {
            id: docSnap.id,
            code: pCode,
            name: d.name || d.responsible || d.nome_responsavel || 'Parceiro Sem Nome',
            email: d.email || '',
            phone: d.phone || d.telefone || '',
            region: d.region || d.provincia || 'Luanda',
            debt_aoa: Number(d.debt_aoa) || 0,
            total_paid_aoa: Number(d.total_paid_aoa) || 0,
            total_sales: Number(d.total_sales) || 0,
            status: d.status || 'pending',
            createdAt: Number(d.createdAt) || Number(d.created_at) || Date.now(),
          };

          // Prioritize 'active' or most recent if duplicated
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
    if (selectedPartner) {
      setPartnerDebts(allDebts.filter(d => d.partner_id === selectedPartner.id || d.partner_id === selectedPartner.code));
      setSelectedDebtIds([]);
    }
  }, [selectedPartner, allDebts]);

  const activePartners = partners.filter(p => p.status === 'active');
  const pendingPartners = partners.filter(p => p.status === 'pending');
  const totalDebtAoa = allDebts.filter(d => !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalReceivedAoa = allDebts.filter(d => d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);

  const getPartnerPendingDebt = (pid: string) =>
    allDebts.filter(d => (d.partner_id === pid || (partners.find(p => p.id === pid)?.code && d.partner_id === partners.find(p => p.id === pid)?.code)) && !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const getPartnerLicenseCount = (pid: string) =>
    allDebts.filter(d => d.partner_id === pid || (partners.find(p => p.id === pid)?.code && d.partner_id === partners.find(p => p.id === pid)?.code)).length;

  const filteredPartners = (tab === 'candidaturas' ? pendingPartners : partners).filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s) || p.region.toLowerCase().includes(s);
  });

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    const pCode = code.toUpperCase().trim();
    const pwd = `kivora${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await setDoc(doc(db, 'partners', pCode), {
        id: pCode, code: pCode, name, email, phone, region,
        debt_aoa: 0, total_paid_aoa: 0, total_sales: 0,
        status: 'active', createdAt: Date.now(),
      }, { merge: true });
      await createOrApprovePartnerAccount({ nome: name, email, phone, region, partnerCode: pCode });
      setShowModal(false); setName(''); setCode(''); setEmail(''); setPhone('');
      setCredentialsModal({ open: true, partnerName: name, email, password: pwd, partnerCode: pCode, phone });
    } catch (err: any) { alert('Erro ao registar parceiro: ' + err.message); }
  };

  const handleApprovePartner = async (p: Partner) => {
    setApproving(p.id);
    const pwd = `kivora${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await setDoc(doc(db, 'partners', p.id), { status: 'active', code: p.code }, { merge: true });
      if (p.id !== p.code) {
        await setDoc(doc(db, 'partners', p.code), { status: 'active', code: p.code }, { merge: true });
      }
      await createOrApprovePartnerAccount({ nome: p.name, email: p.email, phone: p.phone, region: p.region, partnerCode: p.code });
      setCredentialsModal({ open: true, partnerName: p.name, email: p.email, password: pwd, partnerCode: p.code, phone: p.phone });
    } catch (err: any) { alert('Erro ao aprovar: ' + err.message); }
    finally { setApproving(null); }
  };

  const handleToggleSuspend = async (p: Partner) => {
    const ns = p.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`${ns === 'suspended' ? 'Suspender' : 'Reativar'} ${p.name}?`)) return;
    try {
      await setDoc(doc(db, 'partners', p.id), { status: ns }, { merge: true });
      if (p.id !== p.code) {
        await setDoc(doc(db, 'partners', p.code), { status: ns }, { merge: true });
      }
    } catch (err: any) { alert('Erro: ' + err.message); }
  };

  const handleMarkPaid = async () => {
    if (!selectedDebtIds.length) return;
    setMarkingPaid(true);
    try {
      await markDebtsPaid(selectedDebtIds);
      if (selectedPartner) {
        const amount = partnerDebts.filter(d => selectedDebtIds.includes(d.id)).reduce((a, d) => a + d.cost_aoa, 0);
        await setDoc(doc(db, 'partners', selectedPartner.id), {
          total_paid_aoa: (selectedPartner.total_paid_aoa || 0) + amount,
          debt_aoa: Math.max(0, getPartnerPendingDebt(selectedPartner.id) - amount),
        }, { merge: true });
      }
      setSelectedDebtIds([]);
      alert('Pagamento registado com sucesso!');
    } catch (err: any) { alert('Erro: ' + err.message); }
    finally { setMarkingPaid(false); }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try { await savePartnerPricing(pricingDraft); setEditingPricing(false); alert('Preços atualizados!'); }
    catch (err: any) { alert('Erro: ' + err.message); }
    finally { setSavingPricing(false); }
  };

  const copyRefLink = (p: Partner) => {
    navigator.clipboard.writeText(`https://kivora.ao/?ref=${p.code}`);
    setCopiedCode(p.code); setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Rede de Parceiros & Revenda"
        subtitle="Gestão de canais de distribuição, dívidas por licença e preços de atacado"
        actions={
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all">
            <Plus className="w-4 h-4" /><span>Registar Novo Parceiro</span>
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard label="Parceiros Ativos" value={activePartners.length}
            sub={`${pendingPartners.length} aguardam aprovação`} subColor="green"
            icon={<Users className="w-4 h-4" />} iconBg="bg-blue-50 text-blue-600" />
          <StatCard label="Licenças Emitidas" value={allDebts.length}
            sub="Por todos os parceiros" subColor="green"
            icon={<Key className="w-4 h-4" />} iconBg="bg-emerald-50 text-emerald-600" />
          <StatCard label="Dívida Total Pendente" value={`${fmt(totalDebtAoa)} Kz`}
            sub="A receber dos parceiros" subColor="amber"
            icon={<TrendingDown className="w-4 h-4" />} iconBg="bg-amber-50 text-amber-600" />
          <StatCard label="Total Recebido" value={`${fmt(totalReceivedAoa)} Kz`}
            sub="Pagamentos confirmados" subColor="green"
            icon={<Wallet className="w-4 h-4" />} iconBg="bg-purple-50 text-purple-600" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'todos', label: `Todos os Parceiros (${partners.length})` },
            { id: 'candidaturas', label: 'Candidaturas Pendentes', badge: pendingPartners.length },
            { id: 'precos', label: 'Tabela de Preços' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                tab === t.id ? 'bg-slate-950 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
              {t.id === 'precos' && <Tag className="w-3.5 h-3.5" />}
              {t.label}
              {t.badge && t.badge > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full font-black">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ABA: Tabela de Preços */}
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
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100">Cancelar</button>
                    <button onClick={handleSavePricing} disabled={savingPricing}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm">
                      {savingPricing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Guardar no Firebase</span>
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setEditingPricing(true); setPricingDraft([...pricingPlans]); }}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm">
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
                    <span className="font-mono font-black text-slate-900 text-base">{fmt(plan.cost_aoa)} Kz</span>
                  )}
                </div>
              ))}
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900">
                <strong className="font-black">Como funciona:</strong> Cada licença emitida pelo parceiro gera automaticamente uma dívida com o custo acima. O parceiro define o preço de venda ao cliente livremente — a sua margem é a diferença.
              </div>
            </div>
          </div>
        )}

        {/* ABA: Parceiros */}
        {(tab === 'todos' || tab === 'candidaturas') && (
          <>
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input type="text" placeholder="Pesquisar parceiro, código, email..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium shadow-sm" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                    <th className="p-4">Código / Parceiro</th>
                    <th className="p-4">Região</th>
                    <th className="p-4">Licenças</th>
                    <th className="p-4">Dívida Pendente</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>A carregar parceiros do Firebase...</span>
                    </td></tr>
                  ) : filteredPartners.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-700">
                        {search ? `Nenhum resultado para "${search}"` : tab === 'candidaturas' ? 'Sem candidaturas pendentes' : 'Nenhum parceiro encontrado'}
                      </p>
                    </td></tr>
                  ) : filteredPartners.map((p) => {
                    const debt = getPartnerPendingDebt(p.id);
                    const lics = getPartnerLicenseCount(p.id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{p.code}</span>
                          <p className="font-bold text-slate-900 mt-1">{p.name}</p>
                          <p className="text-slate-400 text-[10px]">{p.email} • {p.phone}</p>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">{p.region}</td>
                        <td className="p-4 font-black text-slate-900">{lics}</td>
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
                            <button onClick={() => copyRefLink(p)} title="Copiar Link Ref"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              {copiedCode === p.code ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {p.status === 'pending' && (
                              <button onClick={() => handleApprovePartner(p)} disabled={approving === p.id}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all">
                                {approving === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                <span>Aprovar</span>
                              </button>
                            )}
                            {p.status !== 'pending' && (
                              <button onClick={() => handleToggleSuspend(p)}
                                title={p.status === 'active' ? 'Suspender' : 'Reativar'}
                                className={`p-1.5 rounded-lg transition-colors ${p.status === 'active' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                                {p.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button onClick={() => setSelectedPartner(p)} title="Ver Dívidas"
                              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL: Novo Parceiro */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Registar Novo Parceiro</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddPartner} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nome / Empresa</label>
                <input type="text" required placeholder="Ex: Luanda Tech Solutions" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Código Único</label>
                  <input type="text" required placeholder="REV-LUANDA-05" value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Telefone</label>
                  <input type="tel" placeholder="+244 923 000 000" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Email Comercial</label>
                <input type="email" required placeholder="parceiro@empresa.ao" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Província</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold focus:outline-none focus:border-blue-500">
                  {['Luanda','Benguela','Huíla (Lubango)','Cabinda','Huambo','Cuanza Sul','Uíge','Namibe','Outra Província'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded-xl p-3">
                O parceiro paga à Kivora por cada licença que emite. Preços definidos na aba "Tabela de Preços".
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20">
                  Criar Parceiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Dívidas do Parceiro */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{selectedPartner.code}</span>
                <h3 className="text-base font-black text-slate-900">{selectedPartner.name}</h3>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-400 hover:text-slate-900"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { label: 'Dívida Pendente', value: `${fmt(getPartnerPendingDebt(selectedPartner.id))} Kz`, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                { label: 'Total Pago', value: `${fmt(selectedPartner.total_paid_aoa || 0)} Kz`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
                { label: 'Licenças Emitidas', value: partnerDebts.length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
              ].map(item => (
                <div key={item.label} className={`p-3 rounded-2xl border ${item.bg} text-center`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{item.label}</span>
                  <span className={`font-black text-sm font-mono ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="flex items-center justify-between mb-2 sticky top-0 bg-white py-1 z-10">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Licenças & Dívidas</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const headers = ['Licenca_ID', 'Empresa', 'Plano', 'Custo_Devido_Kivora_AOA', 'Cobrado_Cliente_AOA', 'Estado', 'Data'];
                      const rows = partnerDebts.map(d => [
                        d.license_id,
                        `"${(d.company_name || '').replace(/"/g, '""')}"`,
                        d.plan_type,
                        d.cost_aoa,
                        d.client_price_aoa,
                        d.paid ? 'Pago' : 'Pendente',
                        new Date(d.created_at).toISOString().split('T')[0]
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const link = document.createElement('a');
                      link.setAttribute('href', encodeURI(csvContent));
                      link.setAttribute('download', `extrato_${selectedPartner.code}_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <span>CSV</span>
                  </button>

                  {selectedDebtIds.length > 0 && (
                    <button onClick={handleMarkPaid} disabled={markingPaid}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                      {markingPaid ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>Registar Pagamento ({selectedDebtIds.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {partnerDebts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">Nenhuma licença emitida</p>
                  <p className="text-xs">Este parceiro ainda não emitiu licenças.</p>
                </div>
              ) : partnerDebts.map((debt) => (
                <label key={debt.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  debt.paid ? 'bg-slate-50 border-slate-100 opacity-60' :
                  selectedDebtIds.includes(debt.id) ? 'bg-emerald-50 border-emerald-300' :
                  'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <input type="checkbox" disabled={debt.paid}
                    checked={selectedDebtIds.includes(debt.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedDebtIds(prev => [...prev, debt.id]);
                      else setSelectedDebtIds(prev => prev.filter(id => id !== debt.id));
                    }}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-blue-600">{debt.license_id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        debt.paid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {debt.paid ? '✓ Pago' : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">{debt.company_name}</p>
                    <p className="text-[10px] text-slate-400">{new Date(debt.created_at).toLocaleDateString('pt-AO')} • {debt.plan_type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-black text-slate-900 text-xs">{fmt(debt.cost_aoa)} Kz</p>
                    <p className="text-[10px] text-slate-400">custo Kivora</p>
                    {debt.client_price_aoa > 0 && (
                      <p className="text-[10px] text-emerald-600 font-bold">Venda: {fmt(debt.client_price_aoa)} Kz</p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end shrink-0 pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Credenciais */}
      {credentialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Key className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Acesso de Parceiro Ativado!</h3>
                  <p className="text-xs text-slate-500">Credenciais gravadas no Firebase</p>
                </div>
              </div>
              <button onClick={() => setCredentialsModal(null)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
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
                navigator.clipboard.writeText(`🎉 Portal Parceiro KIVORA\n\n👤 ${credentialsModal.email}\n🔑 ${credentialsModal.password}\n🏷️ ${credentialsModal.partnerCode}\n🌐 https://kivora.ao/#login`);
                setCopiedCredentials(true); setTimeout(() => setCopiedCredentials(false), 2500);
              }} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all">
                {copiedCredentials ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCredentials ? 'Copiado!' : 'Copiar Mensagem'}</span>
              </button>
              {credentialsModal.phone && (
                <a href={`https://wa.me/${credentialsModal.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`🎉 Portal Parceiro KIVORA\n👤 ${credentialsModal.email}\n🔑 ${credentialsModal.password}\n🏷️ ${credentialsModal.partnerCode}\n🌐 https://kivora.ao/#login`)}`}
                  target="_blank" rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 shrink-0">
                  <MessageSquare className="w-4 h-4" /><span>WhatsApp</span>
                </a>
              )}
            </div>
            <button onClick={() => setCredentialsModal(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl">
              Concluir & Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminCandidaturas: React.FC<AdminParceirosProps> = (props) => <AdminParceiros {...props} initialTab="candidaturas" />;

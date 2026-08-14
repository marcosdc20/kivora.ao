import React, { useState } from 'react';
import {
  Handshake, Plus, Eye, Check, X,
  DollarSign, Users, CheckCircle2, Loader2, Copy,
  Award
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { createOrApprovePartnerAccount } from './services/authService';

export interface Partner {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  commission_rate: number;
  total_sales: number;
  balance_aoa: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: number;
}

interface AdminParceirosProps {
  onCandidaturas?: () => void;
  onBack?: () => void;
  initialTab?: 'todos' | 'candidaturas';
}

const INITIAL_PARTNERS: Partner[] = [
  {
    id: '1',
    code: 'REV-LUANDA-01',
    name: 'AngoSolutions TI & Consultoria',
    email: 'comercial@angosolutions.ao',
    phone: '+244 923 456 789',
    region: 'Luanda',
    commission_rate: 20,
    total_sales: 3450000,
    balance_aoa: 690000,
    status: 'active',
    createdAt: Date.now() - 45 * 86400000
  },
  {
    id: '2',
    code: 'REV-BENGUELA-02',
    name: 'Lobito Tech & Automação Comercial',
    email: 'lobito.tech@gmail.com',
    phone: '+244 912 345 678',
    region: 'Benguela',
    commission_rate: 25,
    total_sales: 2100000,
    balance_aoa: 525000,
    status: 'active',
    createdAt: Date.now() - 30 * 86400000
  },
  {
    id: '3',
    code: 'REV-HUILA-03',
    name: 'Sul Digital Lubango, Lda.',
    email: 'geral@suldigital.co.ao',
    phone: '+244 933 111 222',
    region: 'Huíla (Lubango)',
    commission_rate: 15,
    total_sales: 850000,
    balance_aoa: 127500,
    status: 'pending',
    createdAt: Date.now() - 5 * 86400000
  },
  {
    id: '4',
    code: 'REV-CABINDA-04',
    name: 'Cabinda Sistemas & Redes',
    email: 'info@cabindasistemas.ao',
    phone: '+244 944 555 666',
    region: 'Cabinda',
    commission_rate: 20,
    total_sales: 1200000,
    balance_aoa: 240000,
    status: 'active',
    createdAt: Date.now() - 15 * 86400000
  }
];

export const AdminParceiros: React.FC<AdminParceirosProps> = ({ initialTab = 'todos' }) => {
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [tab, setTab] = useState<'todos' | 'candidaturas'>(initialTab);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Luanda');
  const [rate, setRate] = useState<number>(20);

  const activePartners = partners.filter(p => p.status === 'active');
  const pendingPartners = partners.filter(p => p.status === 'pending');
  const totalSalesAoa = partners.reduce((acc, p) => acc + p.total_sales, 0);
  const totalCommissionsAoa = partners.reduce((acc, p) => acc + p.balance_aoa, 0);

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const newP: Partner = {
      id: Date.now().toString(),
      code: code.toUpperCase().trim(),
      name,
      email,
      phone,
      region,
      commission_rate: rate,
      total_sales: 0,
      balance_aoa: 0,
      status: 'active',
      createdAt: Date.now()
    };

    setPartners([newP, ...partners]);
    setShowModal(false);
    setName('');
    setCode('');
    setEmail('');
    setPhone('');
    alert(`Parceiro ${newP.name} registado com sucesso! Link: https://kivora.ao/ref/${newP.code}`);
  };

  const copyRefLink = (p: Partner) => {
    const link = `https://kivora.ao/ref/${p.code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(p.code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApprovePartner = async (partner: Partner) => {
    setApproving(partner.id);
    try {
      await createOrApprovePartnerAccount({
        nome: partner.name,
        email: partner.email,
        phone: partner.phone,
        region: partner.region,
        partnerCode: partner.code,
      });

      setPartners(prev => prev.map(p =>
        p.id === partner.id ? { ...p, status: 'active' } : p
      ));

      alert(`Candidatura aprovada! Conta ativada no Firebase com o código de parceiro ${partner.code}.`);
    } catch (err: any) {
      alert('Erro ao aprovar parceiro: ' + err.message);
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Rede de Parceiros & Revenda"
        subtitle="Gestão de canais de distribuição, comissões em Kwanzas e candidaturas"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Novo Parceiro</span>
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            label="Parceiros Ativos"
            value={activePartners.length}
            sub={`${pendingPartners.length} aguardam aprovação`}
            subColor="green"
            icon={<Users className="w-4 h-4" />}
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Vendas por Parceiros"
            value={`${fmt(totalSalesAoa)} Kz`}
            sub="Volume acumulado"
            subColor="green"
            icon={<Award className="w-4 h-4" />}
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Comissões Acumuladas"
            value={`${fmt(totalCommissionsAoa)} Kz`}
            sub="Saldo de revenda"
            subColor="amber"
            icon={<DollarSign className="w-4 h-4" />}
            iconBg="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Taxa Média de Comissão"
            value="20.0%"
            sub="Margem padrão KIVORA"
            subColor="default"
            icon={<Handshake className="w-4 h-4" />}
            iconBg="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Abas */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setTab('todos')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              tab === 'todos'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
            }`}
          >
            Todos os Parceiros ({partners.length})
          </button>
          <button
            onClick={() => setTab('candidaturas')}
            className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              tab === 'candidaturas'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
            }`}
          >
            <span>Candidaturas Pendentes</span>
            {pendingPartners.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingPartners.length}
              </span>
            )}
          </button>
        </div>

        {/* Tabela de Parceiros */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <th className="p-4">Código / Parceiro</th>
                <th className="p-4">Região / Província</th>
                <th className="p-4">Taxa Comissão</th>
                <th className="p-4">Vendas Geradas</th>
                <th className="p-4">Saldo Comissão</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(tab === 'todos' ? partners : pendingPartners).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {p.code}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 mt-1">{p.name}</p>
                    <p className="text-slate-400 text-[10px]">{p.email} • {p.phone}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{p.region}</td>
                  <td className="p-4 font-bold text-purple-700 bg-purple-50/50">{p.commission_rate}%</td>
                  <td className="p-4 font-mono font-bold text-slate-900">{fmt(p.total_sales)} Kz</td>
                  <td className="p-4 font-mono font-bold text-emerald-700">{fmt(p.balance_aoa)} Kz</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      p.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {p.status === 'active' ? 'Ativo' : p.status === 'pending' ? 'Pendente' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => copyRefLink(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copiar Link de Referência"
                      >
                        {copiedCode === p.code ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleApprovePartner(p)}
                          disabled={approving === p.id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                        >
                          {approving === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span>Aprovar</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedPartner(p)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registar Novo Parceiro */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Registar Novo Parceiro Kivora</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nome / Empresa do Parceiro</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luanda Tech Solutions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Código Único (Ref)</label>
                  <input
                    type="text"
                    required
                    placeholder="REV-LUANDA-05"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Comissão (%)</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Email Comercial</label>
                  <input
                    type="email"
                    required
                    placeholder="parceiro@empresa.ao"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Telefone</label>
                  <input
                    type="tel"
                    placeholder="+244 923 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Província Principal</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                >
                  <option value="Luanda">Luanda</option>
                  <option value="Benguela">Benguela</option>
                  <option value="Huíla">Huíla (Lubango)</option>
                  <option value="Cabinda">Cabinda</option>
                  <option value="Huambo">Huambo</option>
                  <option value="Cuanza Sul">Cuanza Sul (Sumbe/Porto Amboim)</option>
                  <option value="Uíge">Uíge</option>
                  <option value="Namibe">Namibe</option>
                  <option value="Outra Província">Outra Província</option>
                </select>
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
                  Criar Parceiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhe do Parceiro */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {selectedPartner.code}
                </span>
                <h3 className="text-base font-black text-slate-900">{selectedPartner.name}</h3>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Província:</span>
                <strong className="text-slate-900">{selectedPartner.region}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <strong className="text-slate-900">{selectedPartner.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Telefone:</span>
                <strong className="text-slate-900">{selectedPartner.phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comissão Acordada:</span>
                <strong className="text-purple-700 font-bold">{selectedPartner.commission_rate}%</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Saldo a Liquidar:</span>
                <strong className="text-emerald-700 font-mono text-sm">{fmt(selectedPartner.balance_aoa)} Kz</strong>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  alert(`Comissão de ${fmt(selectedPartner.balance_aoa)} Kz liquidada para o parceiro ${selectedPartner.name}!`);
                  setPartners(partners.map(p => p.id === selectedPartner.id ? { ...p, balance_aoa: 0 } : p));
                  setSelectedPartner(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20"
              >
                Liquidar Comissão (Pagamento Efetuado)
              </button>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const AdminCandidaturas: React.FC<AdminParceirosProps> = (props) => <AdminParceiros {...props} initialTab="candidaturas" />;

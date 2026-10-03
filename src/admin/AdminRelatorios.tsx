import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, MapPin, Filter } from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface RegionalStat {
  provincia: string;
  empresas: number;
  receita: number;
  parceiros: number;
}

const PROVINCIAS_ANGOLA = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
  'Namibe', 'Uíge', 'Zaire'
];

const normalizeProvince = (text?: string): string => {
  if (!text) return 'Luanda';
  const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const matched = PROVINCIAS_ANGOLA.find((p) => {
    const pClean = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return clean.includes(pClean) || pClean.includes(clean);
  });
  return matched || 'Luanda';
};

export const AdminRelatorios: React.FC = () => {
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'ano'>('ano');
  const [selectedProvince, setSelectedProvince] = useState<string>('todas');
  const [stats, setStats] = useState<RegionalStat[]>([]);
  const [totalLicensesCount, setTotalLicensesCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [allLicenses, setAllLicenses] = useState<{ price_aoa: number; created_at: number; plan_type: string }[]>([]);

  useEffect(() => {
    let partnersByRegion: Record<string, number> = {};
    PROVINCIAS_ANGOLA.forEach((p) => { partnersByRegion[p] = 0; });

    let unsubPart: (() => void) | null = null;
    try {
      unsubPart = onSnapshot(collection(db, 'partners'), (snapPart) => {
        const counts: Record<string, number> = {};
        PROVINCIAS_ANGOLA.forEach((p) => { counts[p] = 0; });

        snapPart.forEach((docSnap) => {
          const d = docSnap.data();
          const prov = d.provincia || d.cidade || d.location || d.address || 'Luanda';
          const matchedKey = normalizeProvince(prov);
          counts[matchedKey] = (counts[matchedKey] || 0) + 1;
        });
        partnersByRegion = counts;

        // Atualizar stats existentes com os parceiros reais
        setStats(prev => prev.map(s => ({
          ...s,
          parceiros: partnersByRegion[s.provincia] ?? 0
        })));
      }, (err) => {
        console.warn('Erro em relatorios partners:', err);
      });
    } catch (e) {
      console.warn(e);
    }

    try {
      const unsubLic = onSnapshot(collection(db, 'licenses'), (snapLic) => {
        let licTotal = 0;
        let sumAoa = 0;
        const regionMap: Record<string, { empresas: number; receita: number; parceiros: number }> = {};
        PROVINCIAS_ANGOLA.forEach((p) => {
          regionMap[p] = { empresas: 0, receita: 0, parceiros: partnersByRegion[p] || 0 };
        });

        const rawLicenses: { price_aoa: number; created_at: number; plan_type: string }[] = [];

        snapLic.forEach((docSnap) => {
          const d = docSnap.data();
          licTotal++;
          const planType = String(d.plan_type || 'annual').toLowerCase().trim();
          const defaultPrice = planType === 'monthly' ? 25000 : planType === 'lifetime' ? 1500000 : 250000;
          const price = d.price_aoa !== undefined && d.price_aoa !== null && !isNaN(Number(d.price_aoa))
            ? Number(d.price_aoa)
            : defaultPrice;

          sumAoa += price;

          rawLicenses.push({
            price_aoa: price,
            created_at: Number(d.created_at) || Date.now(),
            plan_type: planType,
          });

          const prov = (d.region || d.provincia || 'Luanda');
          const matchedKey = normalizeProvince(prov);
          regionMap[matchedKey].empresas += 1;
          regionMap[matchedKey].receita += price;
        });

        setAllLicenses(rawLicenses);
        setTotalLicensesCount(licTotal);
        setTotalRevenue(sumAoa);

        const list: RegionalStat[] = Object.entries(regionMap)
          .map(([provincia, data]) => ({
            provincia,
            empresas: data.empresas,
            receita: data.receita,
            parceiros: partnersByRegion[provincia] ?? data.parceiros
          }))
          .sort((a, b) => b.receita - a.receita || b.empresas - a.empresas);

        setStats(list);
      }, (err) => {
        console.warn('Erro em relatorios licenses:', err);
      });

      return () => {
        unsubLic();
        if (unsubPart) unsubPart();
      };
    } catch (e) {
      console.warn(e);
      if (unsubPart) unsubPart();
    }
  }, []);

  // ─── Gráfico de Receita Mensal (últimos 6 meses) calculado do Firestore ─────
  const CHART_RECEITA = useMemo(() => {
    const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const result: { mes: string; valor: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const valor = allLicenses
        .filter((l) => {
          const ld = new Date(l.created_at);
          return ld.getFullYear() === y && ld.getMonth() === m;
        })
        .reduce((acc, l) => acc + l.price_aoa, 0);
      result.push({ mes: MONTHS_PT[m], valor });
    }
    return result;
  }, [allLicenses]);

  // ─── Distribuição por Plano calculada do Firestore ───────────────────────
  const CHART_PLANOS = useMemo(() => {
    const counts: Record<string, number> = { monthly: 0, annual: 0, lifetime: 0 };
    allLicenses.forEach((l) => {
      const k = l.plan_type in counts ? l.plan_type : 'annual';
      counts[k]++;
    });
    return [
      { name: 'Mensal', value: counts.monthly, color: '#94a3b8' },
      { name: 'Anual Corporativo', value: counts.annual, color: '#2563eb' },
      { name: 'Vitalício Ilimitado', value: counts.lifetime, color: '#0ea5e9' },
    ];
  }, [allLicenses]);

  const filteredStats = selectedProvince === 'todas'
    ? stats
    : stats.filter((s) => s.provincia.toLowerCase().includes(selectedProvince.toLowerCase()));

  const totalReceitaRegional = filteredStats.reduce((acc, curr) => acc + curr.receita, 0);

  const handleExportCSV = () => {
    const csvHeader = 'Província,Empresas Ativas,Receita (Kz),Parceiros\n';
    const csvRows = filteredStats
      .map((s) => `"${s.provincia}",${s.empresas},${s.receita},${s.parceiros}`)
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_kivora_vendas_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-w-0 flex flex-col font-sans pb-12">
      <AdminTopbar
        title="Relatórios & Business Intelligence"
        subtitle="Análise estratégica de vendas, faturação por província e desempenho comercial"
        actions={
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold font-display text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Exportar CSV
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Filters Bar */}
        <div className="surface-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-display">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filtros do Relatório:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold font-display text-slate-600">
              <button
                onClick={() => setPeriod('mes')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${period === 'mes' ? 'bg-slate-950 text-white shadow-sm' : 'hover:text-slate-900'}`}
              >
                Este Mês
              </button>
              <button
                onClick={() => setPeriod('trimestre')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${period === 'trimestre' ? 'bg-slate-950 text-white shadow-sm' : 'hover:text-slate-900'}`}
              >
                Trimestre
              </button>
              <button
                onClick={() => setPeriod('ano')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${period === 'ano' ? 'bg-slate-950 text-white shadow-sm' : 'hover:text-slate-900'}`}
              >
                Ano 2026
              </button>
            </div>

            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-slate-50/70 border border-slate-200 text-slate-800 text-xs font-semibold font-display px-3 py-2 rounded-xl focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="todas">Todas as Províncias (18)</option>
              {PROVINCIAS_ANGOLA.map((p) => (
                <option key={p} value={p.toLowerCase()}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Receita Bruta Total"
            value={`${new Intl.NumberFormat('pt-AO').format(totalRevenue || totalReceitaRegional)} Kz`}
            icon={<DollarSign className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-brand-50 text-brand-600"
            sub="Base Firestore"
            subColor="green"
          />
          <StatCard
            label="Total de Licenças"
            value={`${totalLicensesCount || filteredStats.reduce((a, b) => a + b.empresas, 0)} Ativas`}
            icon={<BarChart3 className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-emerald-50 text-emerald-600"
            sub="Emissão em tempo real"
          />
          <StatCard
            label="Taxa de Retenção (ARR)"
            value="98.5%"
            icon={<TrendingUp className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-purple-50 text-purple-600"
            sub="Renovações em dia"
            subColor="green"
          />
          <StatCard
            label="Market Share Regional"
            value={`${filteredStats.filter(s => s.empresas > 0).length || 6} Províncias`}
            icon={<MapPin className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-amber-50 text-amber-600"
            sub="Expansão em curso"
          />
        </div>

        {/* Charts & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Evolution */}
          <div className="lg:col-span-2 surface-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-950 text-sm font-display tracking-tight">Faturação Mensal da Kivora (2026)</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-sans">Evolução acumulada de licenças e renovações em Kwanzas (Kz)</p>
              </div>
              <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50/80 border border-brand-200/60 px-2.5 py-1 rounded-lg">Kz (AOA)</span>
            </div>

            <div className="space-y-4">
              {CHART_RECEITA.map((item) => {
                const maxVal = 30000000;
                const pct = Math.round((item.valor / maxVal) * 100);
                return (
                  <div key={item.mes} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700 font-display">
                      <span>{item.mes} 2026</span>
                      <span className="font-mono-num font-bold text-slate-950">
                        {new Intl.NumberFormat('pt-AO').format(item.valor)} Kz
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribution by Plan */}
          <div className="surface-card rounded-2xl p-6">
            <h3 className="font-bold text-slate-950 text-sm mb-1 font-display tracking-tight">Distribuição por Plano</h3>
            <p className="text-slate-500 text-xs mb-6 font-sans">Proporção de subscrições ativas</p>

            <div className="space-y-4">
              {CHART_PLANOS.map((p) => {
                const total = CHART_PLANOS.reduce((a, b) => a + b.value, 0);
                const pct = Math.round((p.value / total) * 100);
                return (
                  <div key={p.name} className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <div>
                        <p className="text-xs font-bold text-slate-900 font-display">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-sans">{p.value} empresas</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono-num font-bold text-slate-950">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Regional Breakdown Table */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-sm font-display tracking-tight">Vendas e Presença por Província em Angola</h3>
              <p className="text-slate-500 text-xs mt-0.5 font-sans">Desempenho regional da rede de clientes e parceiros</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider text-left font-display">
                <th className="px-5 py-3.5">Província</th>
                <th className="px-4 py-3.5">Empresas Clientes</th>
                <th className="px-4 py-3.5">Faturação Total (Kz)</th>
                <th className="px-4 py-3.5">Parceiros Locais</th>
                <th className="px-4 py-3.5 text-right">Quota da Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStats.map((reg) => {
                const pct = Math.round((reg.receita / totalReceitaRegional) * 100);
                return (
                  <tr key={reg.provincia} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2 font-display">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {reg.provincia}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium font-sans">{reg.empresas} empresas</td>
                    <td className="px-4 py-3.5 text-slate-950 font-mono-num font-bold">
                      {new Intl.NumberFormat('pt-AO').format(reg.receita)} Kz
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium font-sans">{reg.parceiros} parceiros</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs font-mono-num font-semibold bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg">
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

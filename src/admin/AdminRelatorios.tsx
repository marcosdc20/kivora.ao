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

export const AdminRelatorios: React.FC = () => {
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'ano'>('ano');
  const [selectedProvince, setSelectedProvince] = useState<string>('todas');
  const [stats, setStats] = useState<RegionalStat[]>([]);
  const [totalLicensesCount, setTotalLicensesCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [allLicenses, setAllLicenses] = useState<{ price_aoa: number; created_at: number; plan_type: string }[]>([]);

  useEffect(() => {
    try {
      const unsubLic = onSnapshot(collection(db, 'licenses'), (snapLic) => {
        let licTotal = 0;
        let sumAoa = 0;
        const regionMap: Record<string, { empresas: number; receita: number; parceiros: number }> = {
          'Luanda': { empresas: 0, receita: 0, parceiros: 0 },
          'Benguela': { empresas: 0, receita: 0, parceiros: 0 },
          'Huíla': { empresas: 0, receita: 0, parceiros: 0 },
          'Huambo': { empresas: 0, receita: 0, parceiros: 0 },
          'Cabinda': { empresas: 0, receita: 0, parceiros: 0 },
          'Cuanza Sul': { empresas: 0, receita: 0, parceiros: 0 },
        };

        const rawLicenses: { price_aoa: number; created_at: number; plan_type: string }[] = [];

        snapLic.forEach((docSnap) => {
          const d = docSnap.data();
          licTotal++;
          const price = Number(d.price_aoa) || 250000;
          sumAoa += price;

          rawLicenses.push({
            price_aoa: price,
            created_at: Number(d.created_at) || Date.now(),
            plan_type: String(d.plan_type || 'annual'),
          });

          const prov = (d.region || d.provincia || 'Luanda');
          const matchedKey = Object.keys(regionMap).find(k => prov.toLowerCase().includes(k.toLowerCase())) || 'Luanda';
          regionMap[matchedKey].empresas += 1;
          regionMap[matchedKey].receita += price;
        });

        setAllLicenses(rawLicenses);
        setTotalLicensesCount(licTotal);
        setTotalRevenue(sumAoa);

        const list: RegionalStat[] = Object.entries(regionMap).map(([provincia, data]) => ({
          provincia,
          empresas: data.empresas,
          receita: data.receita,
          parceiros: data.parceiros
        }));

        setStats(list);
      }, (err) => {
        console.warn('Erro em relatorios licenses:', err);
      });

      return () => unsubLic();
    } catch (e) {
      console.warn(e);
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Exportar CSV
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filtros do Relatório:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                onClick={() => setPeriod('mes')}
                className={`px-3 py-1.5 rounded-lg transition-all ${period === 'mes' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Este Mês
              </button>
              <button
                onClick={() => setPeriod('trimestre')}
                className={`px-3 py-1.5 rounded-lg transition-all ${period === 'trimestre' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Trimestre
              </button>
              <button
                onClick={() => setPeriod('ano')}
                className={`px-3 py-1.5 rounded-lg transition-all ${period === 'ano' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Ano 2026
              </button>
            </div>

            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="todas">Todas as Províncias</option>
              <option value="luanda">Luanda</option>
              <option value="benguela">Benguela</option>
              <option value="huila">Huíla</option>
              <option value="huambo">Huambo</option>
              <option value="cabinda">Cabinda</option>
            </select>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Receita Bruta Total"
            value={`${new Intl.NumberFormat('pt-AO').format(totalRevenue || totalReceitaRegional)} Kz`}
            icon={<DollarSign className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-blue-50 text-blue-600"
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
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Faturação Mensal da Kivora (2026)</h3>
                <p className="text-slate-500 text-xs mt-0.5">Evolução acumulada de licenças e renovações em Kwanzas (Kz)</p>
              </div>
              <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Kz (AOA)</span>
            </div>

            <div className="space-y-4">
              {CHART_RECEITA.map((item) => {
                const maxVal = 30000000;
                const pct = Math.round((item.valor / maxVal) * 100);
                return (
                  <div key={item.mes} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.mes} 2026</span>
                      <span className="font-mono text-slate-900">
                        {new Intl.NumberFormat('pt-AO').format(item.valor)} Kz
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribution by Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">Distribuição por Plano</h3>
            <p className="text-slate-500 text-xs mb-6">Proporção de subscrições ativas</p>

            <div className="space-y-4">
              {CHART_PLANOS.map((p) => {
                const total = CHART_PLANOS.reduce((a, b) => a + b.value, 0);
                const pct = Math.round((p.value / total) * 100);
                return (
                  <div key={p.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.value} empresas</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-slate-900">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Regional Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Vendas e Presença por Província em Angola</h3>
              <p className="text-slate-500 text-xs mt-0.5">Desempenho regional da rede de clientes e parceiros</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-wider text-left">
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
                  <tr key={reg.provincia} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {reg.provincia}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-semibold">{reg.empresas} empresas</td>
                    <td className="px-4 py-3.5 text-slate-900 font-mono font-extrabold">
                      {new Intl.NumberFormat('pt-AO').format(reg.receita)} Kz
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-semibold">{reg.parceiros} parceiros</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs font-mono font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">
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

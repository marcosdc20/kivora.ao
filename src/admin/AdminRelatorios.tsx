import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, MapPin, Filter } from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { MOCK_REGIONAL_STATS, CHART_RECEITA, CHART_PLANOS } from './mockData';

export const AdminRelatorios: React.FC = () => {
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'ano'>('ano');
  const [selectedProvince, setSelectedProvince] = useState<string>('todas');

  const filteredStats = selectedProvince === 'todas'
    ? MOCK_REGIONAL_STATS
    : MOCK_REGIONAL_STATS.filter((s) => s.provincia.toLowerCase().includes(selectedProvince.toLowerCase()));

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
    <div className="flex-1 overflow-y-auto bg-slate-50">
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
            value={`${(totalReceitaRegional / 1000000).toFixed(1)} M Kz`}
            icon={<DollarSign className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-blue-50 text-blue-600"
            sub="+24.5% vs ano anterior"
            subColor="green"
          />
          <StatCard
            label="Ticket Médio / Empresa"
            value="185.000 Kz"
            icon={<BarChart3 className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-emerald-50 text-emerald-600"
            sub="Planos anuais"
          />
          <StatCard
            label="Taxa de Retenção (ARR)"
            value="94.8%"
            icon={<TrendingUp className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-purple-50 text-purple-600"
            sub="Renovações em dia"
            subColor="green"
          />
          <StatCard
            label="Market Share Regional"
            value="6 Províncias"
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

          <table className="w-full text-xs">
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
  );
};

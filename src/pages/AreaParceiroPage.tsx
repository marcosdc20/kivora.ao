import React, { useState } from 'react';
import { Plus, LogOut } from 'lucide-react';

interface AreaParceiroPageProps {
  onNavigatePage: (page: any) => void;
}

export const AreaParceiroPage: React.FC<AreaParceiroPageProps> = ({ onNavigatePage }) => {
  const [activeTab, setActiveTab] = useState<'clientes' | 'licencas' | 'comissoes'>('clientes');

  const partnerInfo = {
    partnerName: 'SOLUÇÕES DE TI LUANDA, LDA',
    code: 'PARCEIRO-AO-042',
    totalClients: 18,
    totalCommissions: '1.450.000 AOA',
    pendingCommissions: '280.000 AOA',
    clientsList: [
      { name: 'SUPERMERCADO KIALA', nif: '5409871234', plan: 'Anual 3 PCs (Rede LAN)', date: '02/08/2026', status: 'Ativo' },
      { name: 'FARMÁCIA VIDA & SAÚDE', nif: '5411223344', plan: 'Anual 2 PCs', date: '20/07/2026', status: 'Ativo' },
      { name: 'RESTAURANTE MARISCO LUANDA', nif: '5422334455', plan: 'Mensal Standalone', date: '15/06/2026', status: 'Ativo' },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner */}
      <section className="bg-mesh border-b border-slate-200/80 py-10 relative overflow-hidden shadow-xs">
        <div className="orb orb-blue w-48 h-48 -top-12 -right-12 opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-0.5 rounded-full uppercase tracking-wider">Portal de Parceiros & Revendedores</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">{partnerInfo.partnerName}</h1>
            <p className="text-xs text-slate-500 font-mono font-bold">Código de Revendedor: {partnerInfo.code}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Modalidade de registo de novo cliente iniciada.')}
              className="bg-[#FF6500] hover:bg-[#EB5B00] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 cursor-pointer shimmer-button"
            >
              <Plus className="w-4 h-4" />
              <span>Registar Novo Cliente</span>
            </button>
            <button
              onClick={() => onNavigatePage('login')}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Partner Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-2 card-glow-blue">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clientes Ativos</span>
            <strong className="text-3xl sm:text-4xl font-black text-slate-950 block font-mono-num">{partnerInfo.totalClients} Empresas</strong>
            <span className="text-xs text-emerald-700 font-bold block">+3 empresas este mês</span>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-2 card-glow-purple">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comissões Acumuladas</span>
            <strong className="text-3xl sm:text-4xl font-black text-blue-600 block font-mono-num">{partnerInfo.totalCommissions}</strong>
            <span className="text-xs text-slate-500 font-medium block">Total histórico liquidado</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/70 via-white to-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-2 card-glow-green">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comissões a Receber</span>
            <strong className="text-3xl sm:text-4xl font-black text-emerald-600 block font-mono-num">{partnerInfo.pendingCommissions}</strong>
            <span className="text-xs text-slate-500 font-medium block">Processamento dia 25</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`pb-3 border-b-2 transition-all ${activeTab === 'clientes' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
          >
            Meus Clientes ({partnerInfo.clientsList.length})
          </button>
          <button
            onClick={() => setActiveTab('licencas')}
            className={`pb-3 border-b-2 transition-all ${activeTab === 'licencas' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
          >
            Gerar Chave de Licença
          </button>
          <button
            onClick={() => setActiveTab('comissoes')}
            className={`pb-3 border-b-2 transition-all ${activeTab === 'comissoes' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
          >
            Extrato de Comissões
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'clientes' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Lista de Empresas Registadas</h3>
              <button
                onClick={() => alert('Novo registo de cliente')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                + Registar Empresa
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Empresa</th>
                    <th className="p-4">NIF</th>
                    <th className="p-4">Plano de Licença</th>
                    <th className="p-4">Data Registo</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnerInfo.clientsList.map((client, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-4 font-bold text-slate-900">{client.name}</td>
                      <td className="p-4 font-mono">{client.nif}</td>
                      <td className="p-4">{client.plan}</td>
                      <td className="p-4">{client.date}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'licencas' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-xl">
            <h3 className="text-base font-extrabold text-slate-900">Gerar Nova Licença de Ativação</h3>
            <p className="text-xs text-slate-600">Selecione o cliente e a modalidade para emitir uma nova chave de ativação para a base de dados local do cliente.</p>
            
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Selecione a Empresa Cliente</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  {partnerInfo.clientsList.map((c, i) => (
                    <option key={i} value={c.nif}>{c.name} ({c.nif})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Licença</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="mensal">Licença Mensal Standalone (1 PC)</option>
                  <option value="anual">Licença Anual PME (Até 5 PCs LAN)</option>
                  <option value="ilimitada">Licença Ilimitada Corporativa</option>
                </select>
              </div>

              <button
                onClick={() => alert('Chave de licença emitida com sucesso!')}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-xs"
              >
                Gerar Chave de Licença
              </button>
            </div>
          </div>
        )}

      </section>

    </div>
  );
};

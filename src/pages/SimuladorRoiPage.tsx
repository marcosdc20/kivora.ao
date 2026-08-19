import React, { useState, useMemo } from 'react';
import { PageHero } from '../components/PageHero';
import {
  Calculator, TrendingUp, Clock, ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { PageId } from '../components/Header';

import welcomeImg from '../assets/kivora/jovem-empresario-dado-boas-vindas.png';

interface SimuladorRoiPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

export const SimuladorRoiPage: React.FC<SimuladorRoiPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  const [setor, setSetor] = useState('supermercado');
  const [postos, setPostos] = useState(2);
  const [faturacaoMensal, setFaturacaoMensal] = useState(8000000); // 8 milhões AOA
  const [horasFechoSemana, setHorasFechoSemana] = useState(6);

  const setores = [
    { id: 'supermercado', nome: 'Supermercado & Minimercado', fatorQuebra: 0.032 },
    { id: 'restaurante', nome: 'Restaurante & Bar', fatorQuebra: 0.045 },
    { id: 'farmacia', nome: 'Farmácia & Cosméticos', fatorQuebra: 0.028 },
    { id: 'boutique', nome: 'Loja de Moda & Retalho', fatorQuebra: 0.025 },
    { id: 'armazem', nome: 'Armazém Grossista & Distribuição', fatorQuebra: 0.035 },
    { id: 'servicos', nome: 'Oficina & Prestação de Serviços', fatorQuebra: 0.020 },
  ];

  // Cálculos dinâmicos de retorno
  const resultados = useMemo(() => {
    const setorAtivo = setores.find((s) => s.id === setor) || setores[0];
    
    // Poupança em horas por mês (redução de 75% no tempo de fechos manuais)
    const horasPoupadasMes = Math.round(horasFechoSemana * 4 * 0.75);
    const horasPoupadasAno = horasPoupadasMes * 12;

    // Recuperação de perdas/desvios de stock estimados
    const poupancaStockMensal = Math.round(faturacaoMensal * setorAtivo.fatorQuebra * 0.6); // 60% das quebras eliminadas
    const poupancaStockAnual = poupancaStockMensal * 12;

    // Poupança total anual em Kwanzas
    const valorHoraTrabalhoAOA = 2500; // Valor médio estimado da hora de trabalho de gerência/caixa em Angola
    const valorHorasAnual = horasPoupadasAno * valorHoraTrabalhoAOA;
    const poupancaTotalAnualAOA = poupancaStockAnual + valorHorasAnual;

    return {
      horasPoupadasMes,
      horasPoupadasAno,
      poupancaStockMensal,
      poupancaStockAnual,
      poupancaTotalAnualAOA,
    };
  }, [setor, postos, faturacaoMensal, horasFechoSemana]);

  const formatAOA = (valor: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 page-enter font-sans">
      
      {/* Hero Showcase Institucional */}
      <PageHero
        image={welcomeImg}
        tag="Inteligência Financeira & Otimização de Custos"
        title="Simulador de Poupança & Retorno de Investimento (ROI)"
        sub="Calcule em tempo real quanto a sua empresa em Angola pode poupar por ano ao eliminar quebras de stock, acelerar fechos de caixa e automatizar a conformidade fiscal da AGT com o KIVORA ERP."
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-16">
        
        {/* Bloco Interativo: Calculadora + Painel de Resultados */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inputs do Simulador (Esquerda) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>Dados da Sua Operação</span>
              </div>
              <h2 className="text-xl font-black text-slate-950">
                Parâmetros do Seu Negócio
              </h2>
            </div>

            {/* 1. Setor de Atividade */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                1. Setor de Atividade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {setores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSetor(s.id)}
                    className={`p-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border ${
                      setor === s.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Número de Caixas / Postos */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="uppercase tracking-wider">2. Postos de Trabalho / Caixas:</span>
                <span className="text-blue-600 font-black text-sm">{postos} postos</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={postos}
                onChange={(e) => setPostos(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 3. Faturação Mensal Estimada (AOA) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="uppercase tracking-wider">3. Faturação Mensal Média:</span>
                <span className="text-emerald-600 font-black text-sm">{formatAOA(faturacaoMensal)}</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={40000000}
                step={500000}
                value={faturacaoMensal}
                onChange={(e) => setFaturacaoMensal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>1.000.000 AOA</span>
                <span>20.000.000 AOA</span>
                <span>40.000.000 AOA</span>
              </div>
            </div>

            {/* 4. Horas Gastas por Semana em Fechos Manuais */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="uppercase tracking-wider">4. Tempo Semanal em Fechos Manuais:</span>
                <span className="text-amber-600 font-black text-sm">{horasFechoSemana} horas / semana</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                value={horasFechoSemana}
                onChange={(e) => setHorasFechoSemana(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

          </div>

          {/* Resultados Financeiros do ROI (Direita) */}
          <div className="lg:col-span-6 bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800 space-y-8 sticky top-24">
            
            <div className="space-y-1 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Impacto Financeiro Estimado</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Poupança Estimada Anual
              </h3>
            </div>

            {/* Grande Destaque do Valor em Kwanzas */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Poupança Direta Anual (AOA)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                {formatAOA(resultados.poupancaTotalAnualAOA)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Equivalente a <strong>{formatAOA(Math.round(resultados.poupancaTotalAnualAOA / 12))}</strong> poupados por mês
              </p>
            </div>

            {/* Decomposição dos Benefícios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Tempo Recuperado</span>
                </div>
                <div className="text-xl font-black text-white">
                  {resultados.horasPoupadasMes}h / mês
                </div>
                <p className="text-[10px] text-slate-400">
                  {resultados.horasPoupadasAno} horas a menos em conferências manuais e reconciliações.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Controlo de Quebras</span>
                </div>
                <div className="text-xl font-black text-white">
                  {formatAOA(resultados.poupancaStockMensal)} / mês
                </div>
                <p className="text-[10px] text-slate-400">
                  Redução imediata de extravios e quebras com auditoria cega de caixa.
                </p>
              </div>

            </div>

            {/* Blindagem AGT */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white block mb-0.5">Zero Risco de Multas da AGT:</strong>
                Garante 100% de conformidade com o Decreto 71/25 e evita coimas fiscais que podem ascender a milhões de Kwanzas.
              </div>
            </div>

            {/* CTA Final */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={() => onOpenDemoModal(`Estudo de ROI: ${setores.find((s) => s.id === setor)?.nome}`)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Agendar Demonstração VIP & Implementação</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigatePage('planos')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all border border-slate-800 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Consultar Tabela de Preços de Licenças</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

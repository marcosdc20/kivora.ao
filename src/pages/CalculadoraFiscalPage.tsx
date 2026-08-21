import React, { useState } from 'react';
import {
  Calculator, Receipt, ArrowRight,
  Info, Printer, Download
} from 'lucide-react';
import { PageId } from '../components/Header';

interface CalculadoraFiscalPageProps {
  onNavigatePage: (page: PageId) => void;
}

export const CalculadoraFiscalPage: React.FC<CalculadoraFiscalPageProps> = ({ onNavigatePage }) => {
  const [activeTab, setActiveTab] = useState<'irt' | 'iva'>('irt');

  // Estados do Simulador IRT
  const [salarioBase, setSalarioBase] = useState<number>(250000);
  const [subsidioAlimentacao, setSubsidioAlimentacao] = useState<number>(30000);
  const [subsidioTransporte, setSubsidioTransporte] = useState<number>(30000);
  const [outrosSubsidiosTributaveis, setOutrosSubsidiosTributaveis] = useState<number>(0);

  // Estados do Simulador IVA
  const [valorOperacao, setValorOperacao] = useState<number>(1000000);
  const [taxaIva, setTaxaIva] = useState<number>(14); // 14%, 7%, 5%, 0%
  const [aplicarRetencao65, setAplicarRetencao65] = useState<boolean>(true); // 6.5% serviços

  // ─── LÓGICA DE CÁLCULO IRT ANGOLA (Código do IRT Atualizado) ───────────────
  // Segurança Social (INSS): 3% do trabalhador (sobre base + subsídios tributáveis)
  const baseIncidenciaINSS = salarioBase + outrosSubsidiosTributaveis;
  const inssTrabalhador = baseIncidenciaINSS * 0.03;
  const inssEmpresa = baseIncidenciaINSS * 0.08;

  // Subsídios não tributáveis (limite de 30.000 Kz cada para alimentação e transporte)
  const excessoAlimentacao = Math.max(0, subsidioAlimentacao - 30000);
  const excessoTransporte = Math.max(0, subsidioTransporte - 30000);

  // Matéria Coletável do IRT = Salário Bruto Tributável - INSS 3%
  const rendimentoTributavel = salarioBase + outrosSubsidiosTributaveis + excessoAlimentacao + excessoTransporte;
  const materiaColetavelIRT = Math.max(0, rendimentoTributavel - inssTrabalhador);

  // Escalões Oficiais do IRT de Angola
  const calcularIRT = (materia: number): number => {
    if (materia <= 100000) return 0;
    if (materia <= 150000) return (materia - 100000) * 0.13;
    if (materia <= 200000) return 12500 * 0.13 + (materia - 150000) * 0.16;
    if (materia <= 300000) return 31250 + (materia - 200000) * 0.18;
    if (materia <= 500000) return 49250 + (materia - 300000) * 0.19;
    if (materia <= 1000000) return 87250 + (materia - 500000) * 0.20;
    if (materia <= 1500000) return 187250 + (materia - 1000000) * 0.21;
    if (materia <= 2000000) return 292250 + (materia - 1500000) * 0.22;
    if (materia <= 2500000) return 402250 + (materia - 2000000) * 0.23;
    if (materia <= 5000000) return 517250 + (materia - 2500000) * 0.24;
    if (materia <= 10000000) return 1117250 + (materia - 5000000) * 0.245;
    return 2342250 + (materia - 10000000) * 0.25;
  };

  const valorIRT = calcularIRT(materiaColetavelIRT);
  const salarioBrutoTotal = salarioBase + subsidioAlimentacao + subsidioTransporte + outrosSubsidiosTributaveis;
  const salarioLiquido = salarioBrutoTotal - inssTrabalhador - valorIRT;
  const custoTotalEmpresa = salarioBrutoTotal + inssEmpresa;

  // ─── LÓGICA DE CÁLCULO IVA & RETENÇÃO 6.5% ───────────────────────────────────
  const montanteIVA = valorOperacao * (taxaIva / 100);
  const valorComIVA = valorOperacao + montanteIVA;
  const montanteRetencao = aplicarRetencao65 ? valorOperacao * 0.065 : 0;
  const valorLiquidoAReceber = valorComIVA - montanteRetencao;

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20 print:pt-4 print:pb-4 print:bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header da Página */}
        <div className="text-center max-w-3xl mx-auto mb-12 print:hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            Ferramenta Fiscal Gratuita para Angola
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Calculadora Fiscal de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d4ed8] to-emerald-600">IRT & IVA Angola</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Simule salários líquidos, retenções de IRT, contribuições para o INSS e cálculo de IVA comercial segundo a legislação fiscal da AGT em vigor.
          </p>
        </div>

        {/* Abas de Seleção (IRT vs IVA) */}
        <div className="flex items-center justify-center gap-3 mb-10 print:hidden">
          <button
            onClick={() => setActiveTab('irt')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'irt'
                ? 'bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Simulador de Salário Líquido & IRT 2026
          </button>
          <button
            onClick={() => setActiveTab('iva')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'iva'
                ? 'bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Simulador de IVA & Retenção 6.5%
          </button>
        </div>

        {/* ─── ABA 1: SIMULADOR DE IRT E PROCESSAMENTO SALARIAL ─────────────── */}
        {activeTab === 'irt' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Coluna de Inputs (5 Colunas) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm print:hidden">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#1d4ed8]" />
                Dados da Remuneração Mensal
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Salário Base Ilíquido (Kz)
                  </label>
                  <input
                    type="number"
                    value={salarioBase}
                    onChange={(e) => setSalarioBase(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: 250000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subsídio de Alimentação (Kz)
                  </label>
                  <input
                    type="number"
                    value={subsidioAlimentacao}
                    onChange={(e) => setSubsidioAlimentacao(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Isento até 30.000 Kz/mês por lei.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subsídio de Transporte (Kz)
                  </label>
                  <input
                    type="number"
                    value={subsidioTransporte}
                    onChange={(e) => setSubsidioTransporte(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Isento até 30.000 Kz/mês por lei.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Outros Subsídios Tributáveis / Horas Extras (Kz)
                  </label>
                  <input
                    type="number"
                    value={outrosSubsidiosTributaveis}
                    onChange={(e) => setOutrosSubsidiosTributaveis(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#1d4ed8] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  O módulo de <strong>Recursos Humanos do KIVORA ERP</strong> processa automaticamente folhas de salário, recibos de vencimento timbrados, ficheiro de transferência bancária PS2 e mapas de IRT/INSS.
                </p>
              </div>
            </div>

            {/* Coluna de Resultados / Ficha de Vencimento (7 Colunas) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resumo do Processamento</span>
                  <h3 className="text-2xl font-black text-slate-900">Ficha de Simulação de Vencimento</h3>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 print:hidden"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
              </div>

              {/* Destaque do Salário Líquido */}
              <div className="bg-gradient-to-br from-[#1d4ed8] to-blue-700 text-white p-6 rounded-2xl mb-6 shadow-lg shadow-blue-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">
                    Salário Líquido a Receber pelo Trabalhador
                  </p>
                  <p className="text-3xl sm:text-4xl font-black">
                    {Math.round(salarioLiquido).toLocaleString('pt-AO')} <span className="text-xl font-bold">Kz</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Detalhamento dos Cálculos */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Remuneração Bruta Total</span>
                  <span className="font-bold text-slate-900">{salarioBrutoTotal.toLocaleString('pt-AO')} Kz</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600 font-medium">
                  <span className="flex items-center gap-1">
                    Desconto INSS Trabalhador (3%)
                  </span>
                  <span className="font-bold">- {Math.round(inssTrabalhador).toLocaleString('pt-AO')} Kz</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600 font-medium">
                  <span className="flex items-center gap-1">
                    Retenção na Fonte IRT (Tabela Oficial)
                  </span>
                  <span className="font-bold">- {Math.round(valorIRT).toLocaleString('pt-AO')} Kz</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 text-slate-500 text-xs">
                  <span>Matéria Coletável Sujeita a IRT</span>
                  <span className="font-semibold">{Math.round(materiaColetavelIRT).toLocaleString('pt-AO')} Kz</span>
                </div>

                <div className="flex justify-between py-2.5 bg-slate-50 px-4 rounded-xl text-xs font-semibold text-slate-700">
                  <span>Encargo Patronal INSS Empresa (8%)</span>
                  <span>+ {Math.round(inssEmpresa).toLocaleString('pt-AO')} Kz</span>
                </div>

                <div className="flex justify-between py-2.5 bg-slate-900 text-white px-4 rounded-xl text-xs sm:text-sm font-bold">
                  <span>Custo Total do Colaborador para a Empresa</span>
                  <span>{Math.round(custoTotalEmpresa).toLocaleString('pt-AO')} Kz</span>
                </div>
              </div>

              {/* CTA para o Software */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <p className="text-xs text-slate-500">
                  Emita recibos e mapas fiscais com o <strong>KIVORA Recursos Humanos</strong>.
                </p>
                <button
                  onClick={() => onNavigatePage('download')}
                  className="px-4 py-2.5 bg-[#1d4ed8] text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Experimentar Módulo RH
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ─── ABA 2: SIMULADOR DE IVA E RETENÇÕES COMERCIAIS ─────────────── */}
        {activeTab === 'iva' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Inputs IVA (5 Colunas) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm print:hidden">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#1d4ed8]" />
                Dados da Transação Comercial
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Valor da Fatura / Mercadoria (Sem IVA)
                  </label>
                  <input
                    type="number"
                    value={valorOperacao}
                    onChange={(e) => setValorOperacao(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: 1000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Taxa de IVA Aplicável
                  </label>
                  <select
                    value={taxaIva}
                    onChange={(e) => setTaxaIva(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value={14}>Taxa Geral — 14% (Comércio Geral e Serviços)</option>
                    <option value={7}>Taxa Reduzida — 7% (Produtos da Cesta Básica)</option>
                    <option value={5}>Taxa Especial — 5% (Província de Cabinda)</option>
                    <option value={0}>Isento — 0% (Artigo 12.º do Código do IVA)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Aplicar Retenção na Fonte de 6.5%</p>
                    <p className="text-[11px] text-slate-500">Obrigatória na prestação de serviços entre empresas.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aplicarRetencao65}
                    onChange={(e) => setAplicarRetencao65(e.target.checked)}
                    className="w-5 h-5 text-[#1d4ed8] rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Resultados IVA (7 Colunas) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cálculo Fiscal de Faturação</span>
                  <h3 className="text-2xl font-black text-slate-900">Resumo da Fatura Comercial</h3>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 print:hidden"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
              </div>

              {/* Total da Fatura com IVA */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl mb-6 shadow-lg shadow-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1">
                    Valor Total da Fatura Emitida (Com IVA)
                  </p>
                  <p className="text-3xl sm:text-4xl font-black">
                    {Math.round(valorComIVA).toLocaleString('pt-AO')} <span className="text-xl font-bold">Kz</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Detalhes */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Incidência / Valor Base</span>
                  <span className="font-bold text-slate-900">{valorOperacao.toLocaleString('pt-AO')} Kz</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 text-emerald-700 font-medium">
                  <span>Imposto sobre o Valor Acrescentado (IVA {taxaIva}%)</span>
                  <span className="font-bold">+ {Math.round(montanteIVA).toLocaleString('pt-AO')} Kz</span>
                </div>

                {aplicarRetencao65 && (
                  <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600 font-medium">
                    <span>Retenção na Fonte (6.5% sobre o valor base)</span>
                    <span className="font-bold">- {Math.round(montanteRetencao).toLocaleString('pt-AO')} Kz</span>
                  </div>
                )}

                <div className="flex justify-between py-3 bg-slate-900 text-white px-4 rounded-xl font-bold text-sm sm:text-base">
                  <span>Valor Líquido Efetivo a Receber no Caixa/Banco</span>
                  <span className="text-emerald-400">{Math.round(valorLiquidoAReceber).toLocaleString('pt-AO')} Kz</span>
                </div>
              </div>

              {/* CTA para o Software */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <p className="text-xs text-slate-500">
                  Emita faturas com QR Code AGT e cálculo automático no <strong>KIVORA ERP</strong>.
                </p>
                <button
                  onClick={() => onNavigatePage('download')}
                  className="px-4 py-2.5 bg-[#1d4ed8] text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Conhecer Módulo de Faturação
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
};

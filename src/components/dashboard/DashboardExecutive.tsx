import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  GraduationCap,
  Briefcase,
  BookOpen,
  Layers,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Award,
  Filter,
  Download,
  RotateCcw,
  Building,
  School,
  ArrowUpRight
} from 'lucide-react';

export const DashboardExecutive: React.FC = () => {
  // ==========================================
  // ESTADO DOS 7 FILTROS GLOBAIS
  // ==========================================
  const [anoLectivo, setAnoLectivo] = useState('2024/2025');
  const [campus, setCampus] = useState('todos');
  const [unidade, setUnidade] = useState('todas');
  const [curso, setCurso] = useState('todos');
  const [classe, setClasse] = useState('todas');
  const [turma, setTurma] = useState('todas');
  const [periodo, setPeriodo] = useState('todos');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Resetar todos os filtros
  const handleResetFilters = () => {
    setAnoLectivo('2024/2025');
    setCampus('todos');
    setUnidade('todas');
    setCurso('todos');
    setClasse('todas');
    setTurma('todas');
    setPeriodo('todos');
  };

  // Simular exportação de relatório executivo
  const handleExport = (_type: 'PDF' | 'Excel') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    }, 800);
  };

  // ==========================================
  // DADOS DOS 14 KPIS (COM MULTIPLICADOR DE FILTRO)
  // ==========================================
  const factor =
    (campus === 'todos' ? 1 : 0.45) *
    (curso === 'todos' ? 1 : 0.35) *
    (classe === 'todas' ? 1 : 0.22);

  const kpis = {
    totalAlunos: Math.round(5420 * (factor || 1)),
    alunosActivos: Math.round(5180 * (factor || 1)),
    novasMatriculas: Math.round(640 * (factor || 1)),
    professores: Math.round(184 * (campus === 'todos' ? 1 : 0.4)),
    funcionarios: Math.round(46 * (campus === 'todos' ? 1 : 0.4)),
    turmas: Math.round(120 * (factor || 1)),
    cursos: curso === 'todos' ? 6 : 1,
    propinasRecebidasKZ: 48500000 * (factor || 1),
    propinasAtrasoKZ: 5700000 * (factor || 1),
    receitaMensalKZ: 54200000 * (factor || 1),
    despesasKZ: 32100000 * (factor || 1),
    saldoKZ: 22100000 * (factor || 1),
    taxaFrequencia: 94.2,
    aproveitamentoAcademico: 86.8,
  };

  const formatKZ = (val: number) => {
    return new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(val) + ' Kz';
  };

  // ==========================================
  // DADOS DOS 7 GRÁFICOS
  // ==========================================

  // 1. Evolução de Matrículas (Mês a Mês)
  const matriculasMes = [
    { mes: 'Jan', val: 320 },
    { mes: 'Fev', val: 540 },
    { mes: 'Mar', val: 640 },
    { mes: 'Abr', val: 420 },
    { mes: 'Mai', val: 310 },
    { mes: 'Jun', val: 280 },
    { mes: 'Jul', val: 190 },
    { mes: 'Ago', val: 780 },
    { mes: 'Set', val: 920 },
    { mes: 'Out', val: 610 },
    { mes: 'Nov', val: 410 },
    { mes: 'Dez', val: 5180 },
  ];

  // 2. Receita Mensal vs. Despesas vs. Saldo
  const financeiroMeses = [
    { mes: 'Jul', receita: 48.2, despesa: 29.5, saldo: 18.7 },
    { mes: 'Ago', receita: 51.0, despesa: 30.2, saldo: 20.8 },
    { mes: 'Set', receita: 55.4, despesa: 31.8, saldo: 23.6 },
    { mes: 'Out', receita: 53.8, despesa: 32.0, saldo: 21.8 },
    { mes: 'Nov', receita: 54.2, despesa: 32.1, saldo: 22.1 },
    { mes: 'Dez', receita: 56.0, despesa: 33.4, saldo: 22.6 },
  ];

  // 3. Dívidas / Inadimplência por Mês
  const dividasHistorico = [
    { mes: 'Jul', percent: 14.2, valor: '7.1M Kz' },
    { mes: 'Ago', percent: 12.8, valor: '6.4M Kz' },
    { mes: 'Set', percent: 11.5, valor: '6.1M Kz' },
    { mes: 'Out', percent: 10.9, valor: '5.9M Kz' },
    { mes: 'Nov', percent: 10.5, valor: '5.7M Kz' },
    { mes: 'Dez', percent: 9.8, valor: '5.2M Kz' },
  ];

  // 4. Alunos por Curso
  const alunosPorCurso = [
    { curso: 'Ciências Físicas e Biológicas', total: 1420, percent: 27.4, color: 'bg-emerald-500' },
    { curso: 'Ciências Económicas e Jurídicas', total: 1180, percent: 22.8, color: 'bg-blue-500' },
    { curso: 'Informática de Gestão', total: 980, percent: 18.9, color: 'bg-purple-500' },
    { curso: 'Ensino Geral (Iº Ciclo)', total: 920, percent: 17.8, color: 'bg-amber-500' },
    { curso: 'Construção Civil & Eletricidade', total: 420, percent: 8.1, color: 'bg-rose-500' },
    { curso: 'Análises Clínicas', total: 260, percent: 5.0, color: 'bg-teal-500' },
  ];

  // 5. Alunos por Classe (7ª a 12ª)
  const alunosPorClasse = [
    { classe: '7ª Classe', alunos: 940, pct: 18 },
    { classe: '8ª Classe', alunos: 890, pct: 17 },
    { classe: '9ª Classe', alunos: 860, pct: 16 },
    { classe: '10ª Classe', alunos: 1020, pct: 20 },
    { classe: '11ª Classe', alunos: 880, pct: 17 },
    { classe: '12ª Classe', alunos: 830, pct: 16 },
  ];

  // 6. Aproveitamento por Departamento Curricular
  const aproveitamentoAreas = [
    { area: 'Línguas (Português/Inglês/Francês)', aprovacao: 91.5, media: 15.8 },
    { area: 'Matemática e Física', aprovacao: 78.4, media: 13.2 },
    { area: 'Química e Biologia', aprovacao: 84.6, media: 14.5 },
    { area: 'História, Geografia e Filosofia', aprovacao: 89.2, media: 15.1 },
    { area: 'Informática e Tecnologias', aprovacao: 93.0, media: 16.4 },
    { area: 'Educação Física e Expressões', aprovacao: 98.2, media: 17.5 },
  ];

  // 7. Frequência por Período / Turno
  const frequenciaTurnos = [
    { turno: 'Manhã (07h30 – 12h30)', presenca: 96.4, alunos: 2450 },
    { turno: 'Tarde (13h00 – 18h00)', presenca: 93.8, alunos: 1980 },
    { turno: 'Noite (18h30 – 22h00)', presenca: 90.1, alunos: 750 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* CABEÇALHO DO DASHBOARD COM EXPORTAÇÃO E RESUMO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-green/10 text-brand-green">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Executivo & Indicadores Estratégicos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Painel unificado de monitorização académica, operacional e financeira em tempo real.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'A gerar...' : 'Exportar PDF'}</span>
          </button>
          <button
            onClick={() => handleExport('Excel')}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm transition-all"
          >
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Relatório Executivo consolidado exportado com sucesso!</span>
        </div>
      )}

      {/* BARRA DE 7 FILTROS GLOBAIS DINÂMICOS */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-700 tracking-wider">
            <Filter className="w-4 h-4 text-brand-green" />
            <span>Filtros Globais de Análise (7 Dimensões)</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-green transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </button>
        </div>

        {/* 7 Filter Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          
          {/* 1. Ano Lectivo */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
              Ano Lectivo
            </label>
            <select
              value={anoLectivo}
              onChange={(e) => setAnoLectivo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
            >
              <option value="2024/2025">2024/2025 (Atual)</option>
              <option value="2023/2024">2023/2024</option>
              <option value="2022/2023">2022/2023</option>
            </select>
          </div>

          {/* 2. Campus */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
              Campus / Pólo
            </label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
            >
              <option value="todos">Todos os Campi</option>
              <option value="kilamba">Campus Kilamba</option>
              <option value="talatona">Campus Talatona</option>
              <option value="central">Campus Central</option>
            </select>
          </div>

          {/* 3. Unidade */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
              Unidade / Bloco
            </label>
            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
            >
              <option value="todas">Todas as Unidades</option>
              <option value="secundario">Unidade I – IIº Ciclo</option>
              <option value="ciclo1">Unidade II – Iº Ciclo</option>
              <option value="primario">Unidade III – Primário</option>
            </select>
          </div>

          {/* 4. Curso */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
              Curso
            </label>
            <select
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
            >
              <option value="todos">Todos os Cursos</option>
              <option value="cfb">Ciências Físicas e Biológicas</option>
              <option value="cej">Ciências Económicas e Jurídicas</option>
              <option value="info">Informática de Gestão</option>
              <option value="geral">Ensino Geral</option>
            </select>
          </div>

          {/* 5. Classe */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
              Classe
            </label>
            <select
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
            >
              <option value="todas">Todas as Classes</option>
              <option value="7">7ª Classe</option>
              <option value="8">8ª Classe</option>
              <option value="9">9ª Classe</option>
              <option value="10">10ª Classe</option>
              <option value="11">11ª Classe</option>
              <option value="12">12ª Classe</option>
            </select>
          </div>

          {/* 6. Turma */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
              Turma
            </label>
            <select
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
            >
              <option value="todas">Todas as Turmas</option>
              <option value="a">Turma A</option>
              <option value="b">Turma B</option>
              <option value="c">Turma C</option>
              <option value="d">Turma D</option>
            </select>
          </div>

          {/* 7. Período */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
              Período / Turno
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="manha">Manhã (07h30 - 12h30)</option>
              <option value="tarde">Tarde (13h00 - 18h00)</option>
              <option value="noite">Noite (18h30 - 22h00)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 14 KPIS & CARDS DE INDICADORES */}
      
      {/* BLOCO 1: ACADÉMICO & CORPO DISCENTE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          <School className="w-4 h-4 text-emerald-600" />
          <span>Indicadores Académicos & Alunos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Total de Alunos */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total de Alunos</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {kpis.totalAlunos.toLocaleString('pt-AO')}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+8.4% vs ano anterior</span>
              </div>
            </div>
          </div>

          {/* 2. Alunos Activos */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Alunos Activos</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {kpis.alunosActivos.toLocaleString('pt-AO')}
              </span>
              <div className="text-[11px] font-semibold text-slate-500">
                95.6% frequência regular
              </div>
            </div>
          </div>

          {/* 3. Novas Matrículas */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Novas Matrículas</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {kpis.novasMatriculas.toLocaleString('pt-AO')}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Meta atingida: 106%</span>
              </div>
            </div>
          </div>

          {/* 4. Taxa de Frequência */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Taxa de Frequência</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-teal-600 font-mono">
                {kpis.taxaFrequencia}%
              </span>
              <div className="text-[11px] font-semibold text-slate-500">
                Média geral de assiduidade
              </div>
            </div>
          </div>

          {/* 5. Aproveitamento Académico */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Aproveitamento</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                {kpis.aproveitamentoAcademico}%
              </span>
              <div className="text-[11px] font-semibold text-slate-500">
                Taxa global de aprovações
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BLOCO 2: GESTÃO FINANCEIRA & SALDOS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>Indicadores Financeiros & Faturação</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 6. Receita Mensal */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Receita Mensal</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {formatKZ(kpis.receitaMensalKZ)}
              </span>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+5.2% vs mês anterior</span>
              </div>
            </div>
          </div>

          {/* 7. Propinas Recebidas */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Propinas Recebidas</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                {formatKZ(kpis.propinasRecebidasKZ)}
              </span>
              <div className="text-[11px] font-semibold text-slate-500">
                89.5% das propinas do mês
              </div>
            </div>
          </div>

          {/* 8. Propinas em Atraso */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Propinas em Atraso</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
                {formatKZ(kpis.propinasAtrasoKZ)}
              </span>
              <div className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>10.5% taxa de inadimplência</span>
              </div>
            </div>
          </div>

          {/* 9. Despesas Operacionais */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Despesas do Mês</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {formatKZ(kpis.despesasKZ)}
              </span>
              <div className="text-[11px] font-semibold text-slate-500">
                Salários, energia e manutenção
              </div>
            </div>
          </div>

          {/* 10. Saldo Líquido Operacional */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 shadow-lg text-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Saldo Líquido</span>
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                +{formatKZ(kpis.saldoKZ)}
              </span>
              <div className="text-[11px] font-bold text-emerald-100">
                Margem positiva: 40.8%
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BLOCO 3: ESTRUTURA OPERACIONAL & RECURSOS HUMANOS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          <Building className="w-4 h-4 text-emerald-600" />
          <span>Estrutura & Recursos Humanos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 11. Professores */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Corpo Docente</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                {kpis.professores}
              </span>
              <span className="text-[11px] font-semibold text-purple-600 mt-1 block">100% salas com titulares</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          {/* 12. Funcionários Não-Docentes */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Funcionários</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                {kpis.funcionarios}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 mt-1 block">Secretaria, TI e Apoio</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          {/* 13. Turmas Ativas */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Turmas Ativas</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                {kpis.turmas}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">3 Turnos em funcionamento</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          {/* 14. Cursos Disponíveis */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Cursos Oferecidos</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                {kpis.cursos}
              </span>
              <span className="text-[11px] font-semibold text-amber-600 mt-1 block">PUNIV & Técnico-Profissional</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

        </div>
      </div>

      {/* 7 GRÁFICOS VISUAIS MODERNOS */}

      {/* LINHA 1 DE GRÁFICOS */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* GRÁFICO 1: EVOLUÇÃO DE MATRÍCULAS */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                1. Evolução Mensal de Matrículas
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Ingresso acumulado de alunos no ano lectivo {anoLectivo}</p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              Total: {kpis.totalAlunos} Alunos
            </span>
          </div>

          <div className="h-64 pt-6 flex items-end justify-between gap-2">
            {matriculasMes.map((item, idx) => {
              const max = 1000;
              const normalized = Math.min(100, Math.max(15, (item.val / max) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap pointer-events-none z-20 shadow-md">
                    {item.mes}: {item.val} alunos
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-xl overflow-hidden h-44 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300"
                      style={{ height: `${normalized}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 group-hover:text-slate-900">
                    {item.mes}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRÁFICO 2: RECEITA MENSAL VS DESPESAS VS SALDO */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                2. Fluxo Financeiro (Em Milhões Kz)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Receita Bruta vs. Despesas Operacionais vs. Saldo</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" />Rec.</span>
              <span className="flex items-center gap-1 text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-400" />Desp.</span>
              <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500" />Saldo</span>
            </div>
          </div>

          <div className="h-64 pt-4 flex items-end justify-between gap-3">
            {financeiroMeses.map((f, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[9px] font-bold py-1 px-2 rounded-md whitespace-nowrap pointer-events-none z-20 shadow">
                  Rec: {f.receita}M | Desp: {f.despesa}M | Saldo: +{f.saldo}M
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-44">
                  <div
                    className="w-1/3 bg-emerald-500 rounded-t-md transition-all"
                    style={{ height: `${(f.receita / 60) * 100}%` }}
                  />
                  <div
                    className="w-1/3 bg-rose-400 rounded-t-md transition-all"
                    style={{ height: `${(f.despesa / 60) * 100}%` }}
                  />
                  <div
                    className="w-1/3 bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${(f.saldo / 60) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-slate-500">{f.mes}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LINHA 2 DE GRÁFICOS */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* GRÁFICO 3: DÍVIDAS / INADIMPLÊNCIA */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                3. Taxa de Dívidas & Inadimplência
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Evolução de mensalidades por regularizar</p>
            </div>
            <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              10.5%
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {dividasHistorico.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{d.mes}</span>
                  <span className="font-mono text-rose-600 font-extrabold">{d.valor} ({d.percent}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(d.percent / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 4: ALUNOS POR CURSO */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                4. Distribuição por Curso
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Matrículas ativas por especialidade</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              6 Cursos
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {alunosPorCurso.map((c, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 truncate max-w-[190px]">{c.curso}</span>
                  <span className="font-mono font-bold text-slate-900">{c.total} ({c.percent}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${c.color} rounded-full`}
                    style={{ width: `${c.percent * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 5: ALUNOS POR CLASSE */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                5. Alunos por Classe
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Do Iº ao IIº Ciclo do Ensino Secundário</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              7ª à 12ª
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {alunosPorClasse.map((cl, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 font-bold">{cl.classe}</span>
                  <span className="font-mono font-bold text-slate-900">{cl.alunos} estudantes ({cl.pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${cl.pct * 3.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LINHA 3 DE GRÁFICOS */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* GRÁFICO 6: APROVEITAMENTO POR ÁREA */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                6. Aproveitamento Académico por Departamento
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Taxa de aprovação e média ponderada (0 a 20 valores)</p>
            </div>
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
              Média Global: 15.4 v.
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {aproveitamentoAreas.map((area, idx) => (
              <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{area.area}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-brand-green">{area.aprovacao}% aprovados</span>
                    <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm">
                      {area.media} / 20
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      area.aprovacao >= 90 ? 'bg-emerald-500' : area.aprovacao >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${area.aprovacao}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 7: FREQUÊNCIA POR TURNO */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  7. Taxa de Frequência por Turno
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Assiduidade média dos estudantes</p>
              </div>
              <span className="text-xs font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">
                Geral: 94.2%
              </span>
            </div>

            <div className="space-y-4 pt-3">
              {frequenciaTurnos.map((t, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-slate-800 block">{t.turno}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{t.alunos} alunos alocados</span>
                    </div>
                    <span className="text-lg font-black font-mono text-teal-600">{t.presenca}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${t.presenca}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-emerald-800 font-medium">
              A assiduidade no turno da manhã mantém-se no nível mais alto do histórico institucional (<strong>96.4%</strong>).
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

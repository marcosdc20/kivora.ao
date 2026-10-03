import React from 'react';
import {
  LayoutDashboard, Building2, Key, Monitor, Handshake,
  CreditCard, Package, HeadphonesIcon, BarChart3,
  Bell, Users, ScrollText, Settings, LogOut, Menu,
  ShoppingBag, ExternalLink, Activity
} from 'lucide-react';
import { AdminSection } from './types';
import {
  PortalSidebar,
  PortalFooterButton,
  PortalNavGroup,
} from '../components/portal/PortalSidebar';

interface SidebarProps {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onClose?: () => void;
  onLogout?: () => void;
  onExitAdmin?: () => void;
  userEmail?: string;
  collapsed?: boolean;
}

const ICON = 'w-[18px] h-[18px]';

const NAV_GROUPS: PortalNavGroup<AdminSection>[] = [
  {
    title: 'Visão Geral',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className={ICON} strokeWidth={1.75} /> },
      { id: 'relatorios', label: 'Relatórios & Vendas', icon: <BarChart3 className={ICON} strokeWidth={1.75} /> },
      { id: 'auditoria', label: 'Auditoria & Logs', icon: <ScrollText className={ICON} strokeWidth={1.75} /> },
    ]
  },
  {
    title: 'Gestão Comercial',
    items: [
      {
        id: 'licencas', label: 'Licenças', icon: <Key className={ICON} strokeWidth={1.75} />,
        children: [
          { id: 'licencas', label: 'Todas as Licenças' },
          { id: 'licenca-criar', label: 'Emitir Nova Licença' },
        ]
      },
      { id: 'empresas', label: 'Empresas Clientes', icon: <Building2 className={ICON} strokeWidth={1.75} /> },
      { id: 'instalacoes', label: 'Postos & Caixas', icon: <Monitor className={ICON} strokeWidth={1.75} /> },
      { id: 'planos', label: 'Planos & Produtos', icon: <Package className={ICON} strokeWidth={1.75} /> },
      { id: 'pagamentos', label: 'Pagamentos & Faturas', icon: <CreditCard className={ICON} strokeWidth={1.75} /> },
    ]
  },
  {
    title: 'Canais & Loja',
    items: [
      {
        id: 'parceiros', label: 'Parceiros', icon: <Handshake className={ICON} strokeWidth={1.75} />,
        children: [
          { id: 'parceiros', label: 'Todos os Parceiros' },
          { id: 'parceiros-candidaturas', label: 'Candidaturas' },
        ]
      },
      { id: 'loja', label: 'Loja & Pedidos', icon: <ShoppingBag className={ICON} strokeWidth={1.75} /> },
    ]
  },
  {
    title: 'Atendimento',
    items: [
      { id: 'suporte', label: 'Suporte & SLA', icon: <HeadphonesIcon className={ICON} strokeWidth={1.75} /> },
      { id: 'comunicacao', label: 'Comunicação & Avisos', icon: <Bell className={ICON} strokeWidth={1.75} /> },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { id: 'utilizadores', label: 'Utilizadores Admin', icon: <Users className={ICON} strokeWidth={1.75} /> },
      { id: 'firebase-monitor', label: 'Monitorização Cloud', icon: <Activity className={ICON} strokeWidth={1.75} /> },
      { id: 'configuracoes', label: 'Definições', icon: <Settings className={ICON} strokeWidth={1.75} /> },
    ]
  },
];

export const AdminSidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  onClose,
  onLogout,
  onExitAdmin,
  userEmail = 'admin@kivora.ao'
}) => {
  return (
    <PortalSidebar<AdminSection>
      portalLabel="Administração"
      groups={NAV_GROUPS}
      activeId={activeSection}
      onSelect={onNavigate}
      onClose={onClose}
      identity={
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1]">
          <div className="w-8 h-8 rounded-lg bg-[#FF6500] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {userEmail.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Super Admin</p>
            <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>
      }
      footer={
        <>
          {onExitAdmin && (
            <PortalFooterButton
              icon={<ExternalLink className="w-[18px] h-[18px]" strokeWidth={1.75} />}
              label="Ver site público"
              onClick={onExitAdmin}
            />
          )}
          {onLogout && (
            <PortalFooterButton
              icon={<LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />}
              label="Terminar sessão"
              onClick={onLogout}
              tone="danger"
            />
          )}
        </>
      }
    />
  );
};

// ============================
// ADMIN TOPBAR
// ============================
interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  actions?: React.ReactNode;
}

export const AdminTopbar: React.FC<TopbarProps> = ({ title, subtitle, onMenuToggle, actions }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex-shrink-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
};

// ============================
// STATUS BADGES
// ============================
export const StatusBadge: React.FC<{ status: string; type?: string }> = ({ status }) => {
  const configs: Record<string, { label: string; cls: string }> = {
    ativa: { label: 'Activa', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ativo: { label: 'Activo', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    suspensa: { label: 'Suspensa', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    suspenso: { label: 'Suspenso', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    expirada: { label: 'Expirada', cls: 'bg-red-50 text-red-700 border-red-200' },
    expirado: { label: 'Expirado', cls: 'bg-red-50 text-red-700 border-red-200' },
    pendente: { label: 'Pendente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    a_expirar: { label: 'A Expirar', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmado: { label: 'Confirmado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    falhou: { label: 'Falhou', cls: 'bg-red-50 text-red-700 border-red-200' },
    reembolsado: { label: 'Reembolsado', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    em_atendimento: { label: 'Em Atendimento', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    resolvido: { label: 'Resolvido', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    fechado: { label: 'Fechado', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const cfg = configs[status] || { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ============================
// STAT CARD
// ============================
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: 'green' | 'red' | 'amber' | 'default';
  icon: React.ReactNode;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, subColor = 'green', icon, iconBg = 'bg-blue-50 text-blue-600' }) => {
  const subColors = {
    green: 'text-emerald-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    default: 'text-slate-500',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-current/10 ${iconBg}`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight font-display font-mono-num">{value}</p>
      </div>
      {sub && <p className={`text-xs mt-2 font-semibold ${subColors[subColor]}`}>{sub}</p>}
    </div>
  );
};

// ============================
// EMPTY STATE
// ============================
export const EmptyState: React.FC<{ title: string; sub?: string; icon?: React.ReactNode }> = ({ title, sub, icon }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {icon && <div className="mb-4 text-slate-300">{icon}</div>}
    <p className="text-slate-600 font-bold text-sm font-display">{title}</p>
    {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
  </div>
);

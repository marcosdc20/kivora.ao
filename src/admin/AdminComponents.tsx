import React from 'react';
import {
  LayoutDashboard, Building2, Key, Monitor, Handshake,
  CreditCard, Package, HeadphonesIcon, BarChart3,
  Bell, Users, ScrollText, Settings, ChevronDown,
  ChevronRight, LogOut, Shield, X, Menu
} from 'lucide-react';
import { AdminSection } from './types';

interface SidebarProps {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onClose?: () => void;
  collapsed?: boolean;
}

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ReactNode;
  children?: { id: AdminSection; label: string }[];
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} /> },
  {
    id: 'empresas', label: 'Empresas', icon: <Building2 className="w-4 h-4" strokeWidth={1.75} />,
    children: [
      { id: 'empresas', label: 'Todas as empresas' },
      { id: 'empresa-detalhe', label: 'Activas' },
    ]
  },
  {
    id: 'licencas', label: 'Licenças', icon: <Key className="w-4 h-4" strokeWidth={1.75} />,
    children: [
      { id: 'licencas', label: 'Todas as licenças' },
      { id: 'licenca-criar', label: 'Criar licença' },
    ],
    badge: '37', badgeColor: 'amber'
  },
  {
    id: 'instalacoes', label: 'Instalações', icon: <Monitor className="w-4 h-4" strokeWidth={1.75} />,
    children: [
      { id: 'instalacoes', label: 'Computadores' },
    ]
  },
  {
    id: 'parceiros', label: 'Parceiros', icon: <Handshake className="w-4 h-4" strokeWidth={1.75} />,
    children: [
      { id: 'parceiros', label: 'Todos os parceiros' },
      { id: 'parceiros-candidaturas', label: 'Candidaturas' },
    ],
    badge: '9', badgeColor: 'blue'
  },
  {
    id: 'pagamentos', label: 'Pagamentos', icon: <CreditCard className="w-4 h-4" strokeWidth={1.75} />,
    badge: '3', badgeColor: 'orange'
  },
  { id: 'planos', label: 'Produtos / Planos', icon: <Package className="w-4 h-4" strokeWidth={1.75} /> },
  {
    id: 'suporte', label: 'Suporte', icon: <HeadphonesIcon className="w-4 h-4" strokeWidth={1.75} />,
    badge: '4', badgeColor: 'red'
  },
  { id: 'relatorios', label: 'Relatórios', icon: <BarChart3 className="w-4 h-4" strokeWidth={1.75} /> },
  { id: 'comunicacao', label: 'Comunicação', icon: <Bell className="w-4 h-4" strokeWidth={1.75} /> },
  { id: 'utilizadores', label: 'Utilizadores Admin', icon: <Users className="w-4 h-4" strokeWidth={1.75} /> },
  { id: 'auditoria', label: 'Auditoria', icon: <ScrollText className="w-4 h-4" strokeWidth={1.75} /> },
  { id: 'configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" strokeWidth={1.75} /> },
];

const BADGE_COLORS: Record<string, string> = {
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export const AdminSidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, onClose }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    new Set(['empresas', 'licencas', 'parceiros'])
  );

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-slate-950 border-r border-slate-800 overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <span className="text-white font-black text-sm tracking-tight">KIVORA</span>
            <span className="text-slate-500 text-[10px] block font-medium uppercase tracking-widest -mt-0.5">Admin Panel</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id || (item.children?.some(c => c.id === activeSection));
          const isExpanded = expanded.has(item.id);

          if (item.children) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggle(item.id)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-blue-600/15 text-blue-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${BADGE_COLORS[item.badgeColor || 'blue']}`}>
                        {item.badge}
                      </span>
                    )}
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 opacity-60" strokeWidth={2} />
                      : <ChevronRight className="w-3.5 h-3.5 opacity-60" strokeWidth={2} />
                    }
                  </span>
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-0.5 border-l border-slate-800 pl-3 space-y-0.5">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.id)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                          activeSection === child.id
                            ? 'text-white font-bold'
                            : 'text-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive ? 'bg-blue-600/15 text-blue-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </span>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${BADGE_COLORS[item.badgeColor || 'blue']}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
            VS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">Visual Software</p>
            <p className="text-slate-500 text-[10px] truncate">admin@kivora.ao</p>
          </div>
          <button className="text-slate-600 hover:text-red-400 transition-colors" title="Sair">
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
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
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 flex-shrink-0">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="lg:hidden text-slate-500 hover:text-slate-900">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-black text-slate-950 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-slate-950 tracking-tight">{value}</p>
      {sub && <p className={`text-xs mt-1 font-semibold ${subColors[subColor]}`}>{sub}</p>}
    </div>
  );
};

// ============================
// EMPTY STATE
// ============================
export const EmptyState: React.FC<{ title: string; sub?: string; icon?: React.ReactNode }> = ({ title, sub, icon }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {icon && <div className="mb-4 text-slate-300">{icon}</div>}
    <p className="text-slate-500 font-semibold text-sm">{title}</p>
    {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
  </div>
);

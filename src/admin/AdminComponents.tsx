import React from 'react';
import {
  LayoutDashboard, Building2, Key, Monitor, Handshake,
  CreditCard, Package, HeadphonesIcon, BarChart3,
  Bell, Users, ScrollText, Settings, ChevronDown,
  ChevronRight, LogOut, Shield, X, Menu, ShoppingBag,
  Award, ExternalLink, Activity
} from 'lucide-react';
import { AdminSection } from './types';

interface SidebarProps {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onClose?: () => void;
  onLogout?: () => void;
  onExitAdmin?: () => void;
  userEmail?: string;
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

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Visão Geral & Controlo',
    items: [
      { id: 'dashboard', label: 'Dashboard Executivo', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} /> },
      { id: 'relatorios', label: 'Relatórios & Vendas', icon: <BarChart3 className="w-4 h-4" strokeWidth={1.75} /> },
      { id: 'auditoria', label: 'Auditoria & Logs', icon: <ScrollText className="w-4 h-4" strokeWidth={1.75} /> },
    ]
  },
  {
    groupTitle: 'Gestão Comercial & AGT',
    items: [
      {
        id: 'licencas', label: 'Licenças de Software', icon: <Key className="w-4 h-4" strokeWidth={1.75} />,
        children: [
          { id: 'licencas', label: 'Todas as Licenças' },
          { id: 'licenca-criar', label: '+ Emitir Nova Licença' },
        ]
      },
      {
        id: 'empresas', label: 'Empresas Clientes', icon: <Building2 className="w-4 h-4" strokeWidth={1.75} />,
        children: [
          { id: 'empresas', label: 'Base de Empresas' },
          { id: 'empresa-detalhe', label: 'Empresas Ativas' },
        ]
      },
      {
        id: 'instalacoes', label: 'Postos & Caixas LAN', icon: <Monitor className="w-4 h-4" strokeWidth={1.75} />,
        children: [
          { id: 'instalacoes', label: 'Computadores e POS' },
        ]
      },
      { id: 'planos', label: 'Planos & Produtos', icon: <Package className="w-4 h-4" strokeWidth={1.75} /> },
      { id: 'pagamentos', label: 'Pagamentos & Faturas', icon: <CreditCard className="w-4 h-4" strokeWidth={1.75} /> },
    ]
  },
  {
    groupTitle: 'Rede de Canais & Loja POS',
    items: [
      {
        id: 'parceiros', label: 'Rede de Parceiros', icon: <Handshake className="w-4 h-4" strokeWidth={1.75} />,
        children: [
          { id: 'parceiros', label: 'Todos os Parceiros' },
          { id: 'parceiros-candidaturas', label: 'Candidaturas (25k)' },
        ]
      },
      {
        id: 'parceiros-candidaturas',
        label: 'Candidaturas & Homologação',
        icon: <Award className="w-4 h-4 text-amber-400" strokeWidth={1.75} />,
        badge: '25.000 Kz',
        badgeColor: 'amber'
      },
      {
        id: 'loja',
        label: 'Loja Hardware & Pedidos',
        icon: <ShoppingBag className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />,
        badge: 'Loja POS',
        badgeColor: 'emerald'
      },
    ]
  },
  {
    groupTitle: 'Atendimento & Mensagens',
    items: [
      { id: 'suporte', label: 'Central de Suporte & SLA', icon: <HeadphonesIcon className="w-4 h-4" strokeWidth={1.75} /> },
      { id: 'comunicacao', label: 'Comunicação & Avisos', icon: <Bell className="w-4 h-4" strokeWidth={1.75} /> },
    ]
  },
  {
    groupTitle: 'Sistema & Definições',
    items: [
      { id: 'utilizadores', label: 'Utilizadores Admin', icon: <Users className="w-4 h-4" strokeWidth={1.75} /> },
      {
        id: 'firebase-monitor',
        label: 'Monitorização Firebase & Cloud',
        icon: <Activity className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />,
        badge: 'Live',
        badgeColor: 'emerald'
      },
      { id: 'configuracoes', label: 'Definições do Sistema', icon: <Settings className="w-4 h-4" strokeWidth={1.75} /> },
    ]
  },
];

const BADGE_COLORS: Record<string, string> = {
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export const AdminSidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  onClose,
  onLogout,
  onExitAdmin,
  userEmail = 'admin@kivora.ao'
}) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    new Set(['licencas', 'empresas', 'parceiros'])
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
    <aside className="portal-scroll-container w-68 h-full flex flex-col bg-slate-950 border-r border-slate-800/80 overflow-y-auto flex-shrink-0 select-none">
      {/* Header Corporativo Executivo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/60 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/30 border border-blue-400/30">
            <Shield className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-black text-sm tracking-tight">KIVORA SOFT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Cloud Ativa" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400 text-[10px] font-bold tracking-wider uppercase">Painel Executivo</span>
              <span className="text-slate-600 text-[9px] font-mono">v2.4</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navegação Categorizada em Grupos */}
      <nav className="flex-1 py-3 px-3 space-y-4">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 pt-2 pb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {group.groupTitle}
              </span>
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isDirectActive = activeSection === item.id;
                const isChildActive = item.children?.some(c => c.id === activeSection);
                const isActive = isDirectActive || isChildActive;
                const isExpanded = expanded.has(item.id);

                if (item.children) {
                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        onClick={() => toggle(item.id)}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600/15 text-blue-300 font-bold border-l-2 border-blue-500 pl-2.5'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${BADGE_COLORS[item.badgeColor || 'blue']}`}>
                              {item.badge}
                            </span>
                          )}
                          {isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                            : <ChevronRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                          }
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="ml-3.5 border-l border-slate-800/80 pl-2.5 space-y-0.5 pt-0.5">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => onNavigate(child.id)}
                              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                activeSection === child.id
                                  ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-600/30'
                                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 font-medium'
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
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-300 font-bold border-l-2 border-blue-500 pl-2.5'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${BADGE_COLORS[item.badgeColor || 'blue']}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer com Perfil do Utilizador & Acesso Rápido */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2">
        {onExitAdmin && (
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold py-2 rounded-xl border border-slate-800 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Ver Site Público</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-white font-black text-xs flex items-center justify-center border border-slate-700">
            VS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">Visual Software</p>
            <p className="text-slate-400 text-[10px] truncate font-mono">{userEmail}</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Terminar Sessão"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
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
    <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-5 flex-shrink-0 w-full transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>}
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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight font-mono">{value}</p>
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
    <p className="text-slate-500 font-semibold text-sm">{title}</p>
    {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
  </div>
);

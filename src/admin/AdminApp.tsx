import React, { useState, useRef } from 'react';
import { usePortalTrackpadScroll } from '../hooks/usePortalTrackpadScroll';
import { AdminSidebar } from './AdminComponents';
import { AdminDashboard } from './AdminDashboard';
import { AdminEmpresas, AdminEmpresaDetalhe } from './AdminEmpresas';
import { AdminLicencas, AdminCriarLicenca } from './AdminLicencas';
import { AdminInstalacoes } from './AdminInstalacoes';
import { AdminParceiros, AdminCandidaturas } from './AdminParceiros';
import { AdminPagamentos } from './AdminPagamentos';
import { AdminSuporte } from './AdminSuporte';
import { AdminRelatorios } from './AdminRelatorios';
import { AdminComunicacao } from './AdminComunicacao';
import { AdminUtilizadores } from './AdminUtilizadores';
import { AdminAuditoria } from './AdminAuditoria';
import { AdminPlanos } from './AdminPlanos';
import { AdminConfiguracoes } from './AdminConfiguracoes';
import { AdminLoja } from './AdminLoja';
import { AdminFirebaseMonitor } from './AdminFirebaseMonitor';
import { AdminSection } from './types';
import { Empresa } from './types';
import { ArrowLeft, Lock, Menu, LogOut } from 'lucide-react';

import { getStoredSession, loginUser, logoutUser, KivoraUserSession } from './services/authService';

// ======================================================
// LOGIN SCREEN
// ======================================================
interface LoginProps {
  onLogin: (session: KivoraUserSession) => void;
}

const AdminLogin: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) {
      setError('Por favor preencha o email e a palavra-passe.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginUser(email, pass);
      if (res.success && res.session) {
        if (res.session.role !== 'admin') {
          setError('Acesso não autorizado: Esta conta não possui privilégios de Administrador.');
          return;
        }
        onLogin(res.session);
      } else {
        setError(res.error || 'Credenciais inválidas. Verifique o seu acesso de Administrador.');
      }
    } catch (err: any) {
      setError('Erro ao autenticar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Lock className="w-7 h-7 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-black text-white">KIVORA Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Acesso Executivo & Gestão Cloud (Firebase)</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email de Administrador</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kivora.ao"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Palavra-passe</label>
            <input
              type="password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-xl px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'A autenticar no Firebase...' : 'Entrar no Painel Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ======================================================
// MAIN ADMIN APP
// ======================================================
const SECTION_METAS: Record<AdminSection, { title: string; category: string }> = {
  'dashboard': { title: 'Dashboard Executivo', category: 'Visão Geral' },
  'empresas': { title: 'Empresas & Clientes', category: 'Operações' },
  'empresa-detalhe': { title: 'Ficha da Empresa', category: 'Operações' },
  'licencas': { title: 'Licenças de Software', category: 'Licenciamento' },
  'licenca-criar': { title: 'Emitir Nova Licença', category: 'Licenciamento' },
  'instalacoes': { title: 'Instalações & Versões', category: 'Software' },
  'loja': { title: 'Loja Hardware & POS', category: 'Comercial' },
  'parceiros': { title: 'Rede de Parceiros', category: 'Canais de Venda' },
  'parceiros-candidaturas': { title: 'Candidaturas a Parceiro', category: 'Canais de Venda' },
  'pagamentos': { title: 'Faturas & Pagamentos', category: 'Financeiro' },
  'planos': { title: 'Planos & Preços', category: 'Financeiro' },
  'suporte': { title: 'Central de Suporte & SLA', category: 'Atendimento' },
  'relatorios': { title: 'Relatórios & Métricas', category: 'Business Intelligence' },
  'comunicacao': { title: 'Comunicação & Avisos', category: 'Atendimento' },
  'utilizadores': { title: 'Utilizadores Administrativos', category: 'Segurança' },
  'auditoria': { title: 'Auditoria & Logs AGT', category: 'Conformidade Fiscal' },
  'firebase-monitor': { title: 'Monitorização Firebase & Cloud', category: 'Infraestrutura' },
  'configuracoes': { title: 'Definições do Sistema', category: 'Definições' },
};

interface AdminAppProps {
  onExitAdmin: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onExitAdmin }) => {
  const [session, setSession] = useState<KivoraUserSession | null>(() => getStoredSession());
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    const s = getStoredSession();
    return s?.role === 'admin';
  });
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Hook de Rolagem de Touchpad / 2 Dedos
  const mainScrollRef = useRef<HTMLElement | null>(null);
  usePortalTrackpadScroll(mainScrollRef);

  React.useEffect(() => {
    const s = getStoredSession();
    if (s && s.role === 'admin') {
      setSession(s);
      setAuthenticated(true);
    }
  }, []);

  const navigate = (section: AdminSection, extra?: any) => {
    if (section === 'empresa-detalhe' && extra) {
      setSelectedEmpresa(extra);
    }
    setActiveSection(section);
    setMobileSidebarOpen(false);
  };

  if (!authenticated) {
    return <AdminLogin onLogin={(s) => { setSession(s); setAuthenticated(true); }} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onNavigate={navigate} />;

      case 'empresas':
        return (
          <AdminEmpresas
            onSelectEmpresa={(empresa) => {
              setSelectedEmpresa(empresa);
              setActiveSection('empresa-detalhe');
            }}
          />
        );

      case 'empresa-detalhe':
        return (
          <AdminEmpresaDetalhe
            empresa={selectedEmpresa}
            onBack={() => navigate('empresas')}
          />
        );

      case 'licencas':
        return <AdminLicencas onCriarLicenca={() => navigate('licenca-criar')} />;

      case 'licenca-criar':
        return <AdminCriarLicenca onBack={() => navigate('licencas')} />;

      case 'instalacoes':
        return <AdminInstalacoes />;

      case 'loja':
        return <AdminLoja />;

      case 'parceiros':
        return <AdminParceiros onCandidaturas={() => navigate('parceiros-candidaturas')} />;

      case 'parceiros-candidaturas':
        return <AdminCandidaturas onBack={() => navigate('parceiros')} />;

      case 'pagamentos':
        return <AdminPagamentos />;

      case 'suporte':
        return <AdminSuporte />;

      case 'relatorios':
        return <AdminRelatorios />;

      case 'comunicacao':
        return <AdminComunicacao />;

      case 'utilizadores':
        return <AdminUtilizadores />;

      case 'auditoria':
        return <AdminAuditoria />;

      case 'planos':
        return <AdminPlanos />;

      case 'configuracoes':
        return <AdminConfiguracoes />;

      case 'firebase-monitor':
        return <AdminFirebaseMonitor />;

      default:
        return <AdminDashboard onNavigate={navigate} />;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setAuthenticated(false);
    setSession(null);
  };

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50 text-slate-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full flex-shrink-0">
        <AdminSidebar
          activeSection={activeSection}
          onNavigate={navigate}
          onLogout={handleLogout}
          onExitAdmin={onExitAdmin}
          userEmail={session?.email || 'admin@kivora.ao'}
        />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">
            <AdminSidebar
              activeSection={activeSection}
              onNavigate={navigate}
              onClose={() => setMobileSidebarOpen(false)}
              onLogout={handleLogout}
              onExitAdmin={onExitAdmin}
              userEmail={session?.email || 'admin@kivora.ao'}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full min-w-0 bg-slate-50">
        {/* Modern Unified SaaS Topbar Header */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-2xs z-20 sticky top-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="text-slate-400 font-semibold hidden md:inline">Kivora ERP</span>
              <span className="text-slate-300 hidden md:inline">/</span>
              <span className="text-slate-500 font-medium hidden sm:inline">{SECTION_METAS[activeSection]?.category || 'Administração'}</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-slate-900 font-black truncate">{SECTION_METAS[activeSection]?.title || 'Painel'}</span>
            </div>

            {/* AGT Certification Live Pill */}
            <div className="hidden xl:flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Validação Fiscal AGT 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Voltar ao Site Público */}
            {onExitAdmin && (
              <button
                onClick={onExitAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200/80 cursor-pointer shadow-2xs"
                title="Acessar o site público Kivora"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver Site Público</span>
                <span className="sm:hidden">Site</span>
              </button>
            )}

            {/* User Profile Pill & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {session?.email ? session.email.slice(0, 2).toUpperCase() : 'AD'}
              </div>

              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                  {session?.email || 'admin@kivora.ao'}
                </span>
                <span className="text-[10px] font-bold text-blue-600">SuperAdmin</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                title="Terminar Sessão Segura"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Section Main Scroll Container */}
        <main
          ref={mainScrollRef}
          tabIndex={0}
          className="portal-scroll-container flex-1 overflow-y-auto overflow-x-hidden min-h-0 w-full min-w-0 bg-slate-50 focus:outline-none"
        >
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

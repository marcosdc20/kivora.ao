import React, { useState } from 'react';
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
import { AdminSection } from './types';
import { Empresa } from './types';
import { ArrowLeft, Lock, Menu } from 'lucide-react';

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
interface AdminAppProps {
  onExitAdmin: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onExitAdmin }) => {
  const [session, setSession] = useState<KivoraUserSession | null>(() => getStoredSession());
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    const s = getStoredSession();
    return s?.role === 'admin';
  });
  const [activeSection, setActiveSection] = useState<AdminSection>('licencas');
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!authenticated) {
    return (
      <div>
        <button
          onClick={onExitAdmin}
          className="fixed top-4 left-4 z-50 flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-all shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Voltar ao Site
        </button>
        <AdminLogin onLogin={(sess) => {
          setSession(sess);
          setAuthenticated(true);
        }} />
      </div>
    );
  }

  const navigate = (section: AdminSection) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
    if (section !== 'empresa-detalhe') setSelectedEmpresa(null);
  };

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

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full flex-shrink-0">
        <AdminSidebar
          activeSection={activeSection}
          onNavigate={navigate}
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
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0 bg-slate-50">
        {/* Back to site & Session Header */}
        <div className="flex items-center justify-between bg-slate-950 px-3 sm:px-4 py-2 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" strokeWidth={2} />
              <span className="hidden sm:inline">Voltar ao Site Público</span>
              <span className="sm:hidden">Site</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-slate-400 text-[10px] sm:text-[11px] truncate max-w-[130px] sm:max-w-[220px]">
              {session?.email || 'admin@kivora.ao'}
            </span>
            <button
              onClick={async () => {
                await logoutUser();
                setAuthenticated(false);
                setSession(null);
              }}
              className="text-red-400 hover:text-red-300 text-[10px] sm:text-[11px] font-medium cursor-pointer"
            >
              Terminar Sessão
            </button>
            <span className="text-slate-600 text-[10px] font-mono border-l border-slate-800 pl-2 sm:pl-3 hidden md:inline">KIVORA ADMIN</span>
          </div>
        </div>

        {/* Section */}
        <div className="flex-1 overflow-y-auto flex flex-col min-w-0 bg-slate-50">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

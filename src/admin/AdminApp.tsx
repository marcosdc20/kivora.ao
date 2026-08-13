import React, { useState } from 'react';
import { AdminSidebar } from './AdminComponents';
import { AdminDashboard } from './AdminDashboard';
import { AdminEmpresas, AdminEmpresaDetalhe } from './AdminEmpresas';
import { AdminLicencas, AdminCriarLicenca } from './AdminLicencas';
import { AdminInstalacoes } from './AdminInstalacoes';
import { AdminParceiros, AdminCandidaturas } from './AdminParceiros';
import { AdminPagamentos } from './AdminPagamentos';
import {
  AdminSuporte, AdminRelatorios, AdminComunicacao,
  AdminUtilizadores, AdminAuditoria, AdminPlanos, AdminConfiguracoes,
} from './AdminSuporte';
import { AdminSection } from './types';
import { Empresa } from './types';
import { ArrowLeft, Lock } from 'lucide-react';

// ======================================================
// LOGIN SCREEN
// ======================================================
interface LoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@kivora.ao' && pass === 'admin123') {
      onLogin();
    } else {
      setError('Credenciais inválidas. Use: admin@kivora.ao / admin123');
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
          <p className="text-slate-500 text-sm mt-1">Acesso restrito — Visual Software</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email de Administrador</label>
            <input
              type="email"
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-0.5"
          >
            Entrar no Painel Admin
          </button>
          <p className="text-center text-[10px] text-slate-600">
            Demo: admin@kivora.ao / admin123
          </p>
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
  const [authenticated, setAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [sidebarOpen] = useState(true);

  if (!authenticated) {
    return (
      <div>
        <button
          onClick={onExitAdmin}
          className="fixed top-4 left-4 z-50 flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Voltar ao Site
        </button>
        <AdminLogin onLogin={() => setAuthenticated(true)} />
      </div>
    );
  }

  const navigate = (section: AdminSection) => {
    setActiveSection(section);
    if (section !== 'empresa-detalhe') setSelectedEmpresa(null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;

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
    <div className="flex h-screen overflow-hidden bg-slate-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onNavigate={navigate}
        collapsed={!sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Back to site */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 shrink-0">
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-[11px] font-semibold transition-colors"
          >
            <ArrowLeft className="w-3 h-3" strokeWidth={2} />
            Voltar ao Site Público
          </button>
          <span className="text-slate-600 text-[10px] font-mono">KIVORA ADMIN v2026.08</span>
        </div>

        {/* Section */}
        <div className="flex-1 overflow-hidden flex">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

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
import { KivoraLogo } from '../components/KivoraLogo';
import { Lock, Menu, ArrowRight, Loader2, UserCheck, Eye, EyeOff } from 'lucide-react';

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
  const [showPass, setShowPass] = useState(false);
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
    <div className="min-h-screen min-h-[100dvh] w-full bg-white flex flex-col lg:grid lg:grid-cols-12 selection:bg-orange-500 selection:text-white">
      {/* ── LADO ESQUERDO: IMAGEM LIMPA ── */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative overflow-hidden bg-[#0B1528] text-white flex-col justify-between p-12 xl:p-16 select-none">
        <img
          src="/imagens/imagem para a tela de loguin.webp"
          alt="Kivora Admin"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/80 to-[#0B1528]/40" />

        <div className="relative z-10">
          <KivoraLogo variant="white" size="lg" useOfficialImage={true} />
        </div>

        <div className="relative z-10 max-w-lg space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug font-display">
            Painel Executivo de Administração
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Gestão de licenças, auditoria fiscal e controlo global do ecossistema Kivora.
          </p>
        </div>
      </div>

      {/* ── LADO DIREITO: FORMULÁRIO LIMPO ── */}
      <div className="flex-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white">
        <div className="flex items-center justify-end w-full">
          <span className="text-xs text-slate-400 font-medium">Acesso Restrito</span>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-6">
          <div className="space-y-1.5">
            <div className="lg:hidden mb-4">
              <KivoraLogo variant="dark" size="sm" useOfficialImage={true} />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Acesso Administrativo
            </h1>
            <p className="text-xs text-slate-500">
              Inicie sessão com as suas credenciais de administrador.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="admin@kivora.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#FF6500] hover:bg-[#EB5B00] text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A entrar...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          KIVORA SOFT • Gestão Administrativa
        </div>
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
          <div className="relative w-64 max-w-[85vw] h-full z-10 shadow-2xl">
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
        {/* Topbar mínima: contexto (breadcrumb) + certificação AGT uma única vez */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline">{SECTION_METAS[activeSection]?.category || 'Administração'}</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-slate-900 font-semibold truncate">{SECTION_METAS[activeSection]?.title || 'Painel'}</span>
            </div>
          </div>

          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-500 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Certificado AGT FE/387/AGT/2026
          </span>
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

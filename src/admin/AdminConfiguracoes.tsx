import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Smartphone, Save,
  Database, Download, Loader2, Rocket, RotateCcw,
  X, GitBranch, CreditCard, Building2, ExternalLink, Plus, Tag,
  TrendingUp, Award, Briefcase, MapPin, Trash2, Monitor,
  Bell, Megaphone, Video, Youtube, Mail, Send, CheckCircle2, AlertTriangle,
  Bot, Sparkles, Eye, EyeOff, Key, Image as ImageIcon, Upload
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminTopbar } from './AdminComponents';
import {
  SystemCompanySettings, DEFAULT_SETTINGS,
  subscribeSystemSettings, saveSystemSettings,
  getDirectDownloadUrl, PartnerBrandLogo, InvestorSettings,
  DEFAULT_PROVINCES, DEFAULT_INVESTOR_SETTINGS,
  VideoCallPackage, DEFAULT_VIDEO_PACKAGES
} from '../services/systemSettingsService';
import {
  SiteEmailConfig, DEFAULT_SITE_EMAIL_CONFIG,
  subscribeSiteEmailConfig, saveSiteEmailConfig,
  testSiteEmailConnection
} from '../services/siteEmailService';
import {
  AIAssistantConfig, DEFAULT_AI_CONFIG, AIAssistantProvider,
  subscribeAIAssistantConfig, saveAIAssistantConfig,
  testAIConnection, detectAIProvider
} from '../services/aiAssistantService';
import { notify, confirmDialog, alertDialog } from '../services/notificationService';
import {
  PURGE_TARGETS, createPrePurgeBackup, executePurge, getLiveCollectionCounts
} from './services/databasePurgeService';
import { getStoredSession, ensureAdminFirebaseAuth } from './services/authService';

export interface UpdateRelease {
  id: string;
  version: string;
  channel: 'stable' | 'beta' | 'hotfix';
  releaseDate: string;
  changelog: string;
  downloadUrl: string;
  mandatory: boolean;
  rolloutPercentage: number;
  status: 'published' | 'testing' | 'rollback';
}

const INITIAL_RELEASES: UpdateRelease[] = [
  {
    id: '1',
    version: '1.1.0-x64',
    channel: 'stable',
    releaseDate: '2026-07-14',
    changelog: 'Instalador NSIS com encerramento automático do processo durante o update.\nSincronização otimizada com o Firebase e suporte offline melhorado.\nNovo tema escuro profissional e melhorias de performance no POS.',
    downloadUrl: 'https://cdn.kivora.ao/releases/v1.1.0/KIVORA_1.1.0_x64-setup.exe',
    mandatory: true,
    rolloutPercentage: 100,
    status: 'published'
  },
  {
    id: '2',
    version: '1.1.0-MSI-x64',
    channel: 'stable',
    releaseDate: '2026-07-14',
    changelog: 'Instalador MSI corporativo para deployment via Active Directory (GPO) em redes corporativas.',
    downloadUrl: 'https://cdn.kivora.ao/releases/v1.1.0/KIVORA_1.1.0_x64_en-US.msi',
    mandatory: false,
    rolloutPercentage: 100,
    status: 'published'
  },
  {
    id: '3',
    version: '1.2.0-beta.1',
    channel: 'beta',
    releaseDate: '2026-07-12',
    changelog: 'Integração inicial com novo motor de validação fiscal AGT e impressão térmica de 58mm customizável.\nTeste de stress para modo multiloja com mais de 20 terminais simultâneos.',
    downloadUrl: 'https://cdn.kivora.ao/releases/v1.2.0-beta.1/KIVORA_1.2.0_beta.exe',
    mandatory: false,
    rolloutPercentage: 35,
    status: 'testing'
  },
  {
    id: '4',
    version: '1.0.8-hotfix.2',
    channel: 'hotfix',
    releaseDate: '2026-06-30',
    changelog: 'Correção crítica no arredondamento decimal na conversão AOA / USD no relatório de fecho diário.',
    downloadUrl: 'https://cdn.kivora.ao/releases/v1.0.8/KIVORA_1.0.8_hotfix2.exe',
    mandatory: true,
    rolloutPercentage: 100,
    status: 'published'
  }
];

type ConfigTab = 'geral' | 'ia-assistente' | 'emails' | 'precos' | 'videochamada' | 'videos' | 'notificacoes' | 'comunicados' | 'metricas' | 'marcas' | 'investidores' | 'provincias' | 'contactos' | 'links' | 'bancos' | 'agt' | 'updates' | 'backups' | 'zona-perigo';

export const AdminConfiguracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('geral');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI Assistant Config State
  const [aiConfig, setAiConfig] = useState<AIAssistantConfig>(DEFAULT_AI_CONFIG);
  const [savingAI, setSavingAI] = useState(false);
  const [testingAI, setTestingAI] = useState(false);
  const [testAIResult, setTestAIResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAIKey, setShowAIKey] = useState(false);

  useEffect(() => {
    const unsub = subscribeAIAssistantConfig((cfg) => setAiConfig(cfg));
    return () => unsub();
  }, []);

  // Master Reset / Purge State
  const [selectedPurgeTargets, setSelectedPurgeTargets] = useState<string[]>(PURGE_TARGETS.map(t => t.id));
  const [purgeConfirmationPhrase, setPurgeConfirmationPhrase] = useState('');
  const [purgeAdminPassword, setPurgeAdminPassword] = useState('');
  const [purgeConsentChecked, setPurgeConsentChecked] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeProgressText, setPurgeProgressText] = useState('');
  const [purgeProgressPercent, setPurgeProgressPercent] = useState(0);
  const [purgeReport, setPurgeReport] = useState<{ totalDeleted: number; deletedCounts: Record<string, number>; backupFilename: string } | null>(null);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});
  const [loadingLiveCounts, setLoadingLiveCounts] = useState(false);

  const refreshLiveCounts = async () => {
    setLoadingLiveCounts(true);
    try {
      const counts = await getLiveCollectionCounts();
      setLiveCounts(counts);
    } catch (e) {
      console.warn('Erro ao carregar contagens reais de coleções:', e);
    } finally {
      setLoadingLiveCounts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'zona-perigo') {
      refreshLiveCounts();
    }
  }, [activeTab]);

  // System Settings State
  const [settings, setSettings] = useState<SystemCompanySettings>(DEFAULT_SETTINGS);

  // Email Config State
  const [emailConfig, setEmailConfig] = useState<SiteEmailConfig>(DEFAULT_SITE_EMAIL_CONFIG);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    const unsub = subscribeSiteEmailConfig((cfg) => setEmailConfig(cfg));
    return () => unsub();
  }, []);

  // Backups
  const [isExporting, setIsExporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(localStorage.getItem('kivora_last_backup_date'));

  // Updates OTA
  const [releases, setReleases] = useState<UpdateRelease[]>(INITIAL_RELEASES);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [newChannel, setNewChannel] = useState<'stable' | 'beta' | 'hotfix'>('stable');
  const [newChangelog, setNewChangelog] = useState('');
  const [newMandatory, setNewMandatory] = useState(false);
  const [newRollout, setNewRollout] = useState(100);

  // New Brand Logo Form State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandType, setNewBrandType] = useState<'parceiro' | 'cliente'>('cliente');
  const [newBrandSector, setNewBrandSector] = useState('');
  const [newBrandProvince, setNewBrandProvince] = useState('Luanda');
  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState('');

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const newBrand: PartnerBrandLogo = {
      id: Date.now().toString(),
      name: newBrandName.trim(),
      type: newBrandType,
      sector: newBrandSector.trim() || undefined,
      province: newBrandProvince.trim() || undefined,
      logoUrl: newBrandLogoUrl.trim() || undefined,
      active: true,
    };

    const currentBrands = settings.partnerLogos || [];

    setSettings(prev => ({
      ...prev,
      partnerLogos: [newBrand, ...currentBrands]
    }));

    setNewBrandName('');
    setNewBrandSector('');
    setNewBrandLogoUrl('');
  };

  const handleToggleBrandActive = (id: string) => {
    const currentBrands = settings.partnerLogos || [];

    setSettings(prev => ({
      ...prev,
      partnerLogos: currentBrands.map(b => b.id === id ? { ...b, active: !b.active } : b)
    }));
  };

  const handleDeleteBrand = (id: string) => {
    const currentBrands = settings.partnerLogos || [];

    setSettings(prev => ({
      ...prev,
      partnerLogos: currentBrands.filter(b => b.id !== id)
    }));
  };

  const handleProvinceChange = (id: string, field: 'activeClients' | 'certifiedPartners' | 'status', value: any) => {
    const currentProvinces = settings.provincesCoverage && settings.provincesCoverage.length > 0
      ? settings.provincesCoverage
      : DEFAULT_PROVINCES;

    setSettings(prev => ({
      ...prev,
      provincesCoverage: currentProvinces.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const handleInvestorChange = (field: keyof InvestorSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      investorInfo: {
        ...(prev.investorInfo || DEFAULT_INVESTOR_SETTINGS),
        [field]: value
      }
    }));
  };

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const handleChange = (field: keyof SystemCompanySettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFileLoad = (fieldKey: keyof SystemCompanySettings, file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify.warning('Ficheiro Grande', 'A imagem tem mais de 2MB. O carregamento pode ser mais lento; considere comprimir.');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleChange(fieldKey, result);
        notify.success('Imagem Carregada do PC', 'Imagem importada com sucesso do seu computador. Clique em "Guardar" para publicar.');
      }
    };
    reader.readAsDataURL(file);
  };

  const renderImageField = (
    label: string,
    fieldKey: keyof SystemCompanySettings,
    placeholder: string,
    hint: string
  ) => {
    const val = (settings[fieldKey] as string) || '';
    return (
      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider block truncate">
            {label}
          </label>
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer shadow-2xs shrink-0">
            <Upload className="w-3 h-3 text-[#FF6500]" />
            <span>Carregar do PC</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFileLoad(fieldKey, file);
              }}
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={val}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num text-xs text-slate-900 focus:border-slate-900 outline-none truncate"
          />
          {val && (
            <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center p-0.5">
              <img src={val} alt="Preview" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
        <p className="text-[10px] text-slate-500 font-sans">{hint}</p>
      </div>
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSystemSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      notify.success('Configurações gerais guardadas com sucesso no Firebase!');
    } catch (err: any) {
      notify.error('Erro ao guardar configurações: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportCollection = async (collectionName: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const [licenses, companies, partners, partner_debts, tickets] = await Promise.all([
        exportCollection('licenses'),
        exportCollection('companies'),
        exportCollection('partners'),
        exportCollection('partner_debts'),
        exportCollection('support_tickets'),
      ]);

      const backupData = {
        version: '1.0',
        system: 'KIVORA SOFT & ADMIN CLOUD',
        timestamp: new Date().toISOString(),
        collections: {
          licenses,
          companies,
          partners,
          partner_debts,
          tickets,
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `kivora_admin_backup_${dateStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const now = new Date().toLocaleString('pt-AO');
      setLastBackup(now);
      localStorage.setItem('kivora_last_backup_date', now);

      notify.success('Backup completo da nuvem Firebase exportado com sucesso em JSON!');
    } catch (error: any) {
      console.error('Erro ao fazer backup:', error);
      notify.error('Erro ao exportar dados: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await saveSiteEmailConfig(emailConfig);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      notify.success('Configurações do Serviço de E-mail guardadas no Firebase com sucesso!');
    } catch (err: any) {
      notify.error('Erro ao guardar configurações de e-mail: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setSavingEmail(false);
    }
  };

  const handleTestEmailSend = async () => {
    const target = testEmailAddress.trim() || emailConfig.senderEmail;
    if (!target) {
      notify.warning('Por favor insira um endereço de e-mail de destino para o teste.');
      return;
    }

    setIsTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await testSiteEmailConnection(target, emailConfig);
      if (res.success) {
        setTestEmailResult({ success: true, msg: `E-mail de teste enviado com sucesso para ${target}! Verifique a caixa de entrada.` });
      } else {
        setTestEmailResult({ success: false, msg: `Falha no envio: ${res.error || 'Verifique as credenciais.'}` });
      }
    } catch (err: any) {
      setTestEmailResult({ success: false, msg: err?.message || 'Erro inesperado ao disparar teste.' });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handlePublishRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion || !newChangelog) return;

    const newRel: UpdateRelease = {
      id: Date.now().toString(),
      version: newVersion,
      channel: newChannel,
      releaseDate: new Date().toISOString().split('T')[0],
      changelog: newChangelog,
      downloadUrl: `https://cdn.kivora.ao/releases/v${newVersion}/KIVORA_${newVersion.replace(/\./g, '_')}_setup.exe`,
      mandatory: newMandatory,
      rolloutPercentage: newRollout,
      status: newChannel === 'stable' ? 'published' : 'testing'
    };

    setReleases([newRel, ...releases]);
    setShowUpdateModal(false);
    setNewVersion('');
    setNewChangelog('');
    notify.success(`Versão v${newVersion} publicada no canal ${newChannel.toUpperCase()}! Rollout para ${newRollout}% dos terminais.`);
  };

  const handleRollback = async (rel: UpdateRelease) => {
    const confirmed = await confirmDialog({
      title: 'Rollback de Emergência',
      message: `Deseja acionar o ROLLBACK de emergência para a versão v${rel.version}? Todos os terminais reverterão para a versão estável anterior.`,
      confirmText: 'Acionar Rollback',
      variant: 'danger',
    });
    if (confirmed) {
      setReleases(releases.map(r => r.id === rel.id ? { ...r, status: 'rollback', rolloutPercentage: 0 } : r));
      notify.warning(`Rollback acionado para a versão v${rel.version}!`);
    }
  };

  const handleAIKeyChange = (newKey: string) => {
    const detected = detectAIProvider(newKey);
    setAiConfig((prev) => ({
      ...prev,
      apiKey: newKey,
      provider: detected.provider,
      model: prev.provider !== detected.provider ? detected.defaultModel : prev.model,
    }));
  };

  const handleSaveAIConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAI(true);
    try {
      await saveAIAssistantConfig(aiConfig);
      notify.success('Configurações do Assistente IA guardadas com sucesso no Firebase!');
    } catch (err: any) {
      notify.error('Erro ao guardar configurações de IA: ' + (err?.message || err));
    } finally {
      setSavingAI(false);
    }
  };

  const handleTestAI = async () => {
    setTestingAI(true);
    setTestAIResult(null);
    try {
      const res = await testAIConnection(aiConfig);
      setTestAIResult(res);
      if (res.success) {
        notify.success('Conexão com a IA estabelecida com sucesso!');
      } else {
        notify.warning('Falha no teste: ' + res.message);
      }
    } catch (err: any) {
      setTestAIResult({ success: false, message: err?.message || 'Erro de conexão' });
      notify.error('Erro ao testar IA: ' + err.message);
    } finally {
      setTestingAI(false);
    }
  };

  const handleTogglePurgeTarget = (id: string) => {
    setSelectedPurgeTargets(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPurgeTargets = () => {
    if (selectedPurgeTargets.length === PURGE_TARGETS.length) {
      setSelectedPurgeTargets([]);
    } else {
      setSelectedPurgeTargets(PURGE_TARGETS.map(t => t.id));
    }
  };

  const handleExecuteMasterReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurgeError(null);

    const session = getStoredSession();
    if (!session || session.role !== 'admin') {
      setPurgeError('Acesso Negado: Apenas utilizadores com perfil de Administrador Master têm permissão para aceder à Zona de Perigo.');
      return;
    }

    if (purgeConfirmationPhrase.trim() !== 'CONFIRMO LIMPAR DADOS KIVORA') {
      setPurgeError('Frase de confirmação incorreta. Digite exatamente: CONFIRMO LIMPAR DADOS KIVORA');
      return;
    }

    if (!purgeAdminPassword || purgeAdminPassword.length < 3) {
      setPurgeError('Por favor insira a sua palavra-passe de Administrador para autorizar a limpeza.');
      return;
    }

    if (!purgeConsentChecked) {
      setPurgeError('É obrigatório marcar a caixa de consentimento e responsabilidade antes de avançar.');
      return;
    }

    if (selectedPurgeTargets.length === 0) {
      setPurgeError('Selecione pelo menos uma coleção para limpar.');
      return;
    }

    const selectedTargetObjs = PURGE_TARGETS.filter(t => selectedPurgeTargets.includes(t.id));
    const targetCollectionNames = selectedTargetObjs.map(t => t.collectionName);

    setIsPurging(true);
    setPurgeProgressText('A autenticar permissões de Administrador no Firebase Auth...');
    setPurgeProgressPercent(5);

    // 1. Garantir autenticação real no Firebase Auth para cumprir a regra `allow delete: if isAdmin();`
    const authOk = await ensureAdminFirebaseAuth(purgeAdminPassword);
    if (!authOk) {
      setIsPurging(false);
      setPurgeError('Palavra-passe de Administrador incorreta ou sem permissões de SuperAdmin no Firebase Auth.');
      return;
    }

    setPurgeProgressText('A gerar cópia de segurança (backup) antes da limpeza...');
    setPurgeProgressPercent(15);

    try {
      // 2. Gera e descarrega automaticamente o backup de segurança
      const backupFilename = await createPrePurgeBackup(targetCollectionNames);
      setPurgeProgressText('Backup descarregado com sucesso! A iniciar remoção cirúrgica...');
      setPurgeProgressPercent(30);

      // 3. Executa a limpeza cirúrgica
      const result = await executePurge(selectedPurgeTargets, (step, pct) => {
        setPurgeProgressText(step);
        setPurgeProgressPercent(pct);
      });

      setPurgeReport({
        totalDeleted: result.totalDeleted,
        deletedCounts: result.deletedCounts,
        backupFilename,
      });

      setPurgeConfirmationPhrase('');
      setPurgeAdminPassword('');
      setPurgeConsentChecked(false);

      // 4. Atualizar imediatamente as contagens ao vivo para o admin ver todas zeradas
      await refreshLiveCounts();

      if (result.failedCount > 0) {
        alertDialog({
          title: 'Master Reset Concluído com Avisos',
          message: `Foram eliminados ${result.totalDeleted} documentos operacionais. ${result.failedCount} documentos não puderam ser apagados devido a regras de proteção.`,
          type: 'warning',
        });
      } else {
        alertDialog({
          title: 'Master Reset Concluído com Sucesso Total',
          message: `Foram eliminados ${result.totalDeleted} documentos operacionais do Firebase. O sistema está completamente limpo e pronto para começar do zero!`,
          type: 'info',
        });
      }
    } catch (err: any) {
      console.error('Erro no Master Reset:', err);
      setPurgeError('Erro durante a execução do Master Reset: ' + (err?.message || 'Falha na comunicação com o banco de dados.'));
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col font-sans pb-12">
      <AdminTopbar
        title="Configurações do Sistema & Empresa"
        subtitle="Gerencie manualmente números de contacto, links de download, GitHub, IBANs e dados da AGT"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Toast de Sucesso */}
        {savedSuccess && (
          <div className="surface-card bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs font-display font-semibold px-4 py-3 rounded-xl shadow-xs flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Configurações guardadas e sincronizadas no Firebase com sucesso!</span>
            </span>
            <button onClick={() => setSavedSuccess(false)} className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'geral', label: 'Geral & Empresa', icon: <Building2 className="w-4 h-4" /> },
            { id: 'ia-assistente', label: 'IA & Assistente Virtual', icon: <Bot className="w-4 h-4 text-amber-500" /> },
            { id: 'emails', label: 'Serviço de E-mails & API', icon: <Mail className="w-4 h-4" /> },
            { id: 'precos', label: 'Planos & Preços', icon: <Tag className="w-4 h-4" /> },
            { id: 'videochamada', label: 'Videochamada & Tarifas/Min', icon: <Video className="w-4 h-4" /> },
            { id: 'videos', label: 'Imagens, Vídeos & Mídias', icon: <Video className="w-4 h-4 text-[#FF6500]" /> },
            { id: 'notificacoes', label: 'Notificações & Webhook', icon: <Bell className="w-4 h-4" /> },
            { id: 'comunicados', label: 'Avisos & Comunicados', icon: <Megaphone className="w-4 h-4" /> },
            { id: 'metricas', label: 'Métricas & Números', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'marcas', label: 'Logótipos & Marcas', icon: <Award className="w-4 h-4" /> },
            { id: 'investidores', label: 'Investidores & Governança', icon: <Briefcase className="w-4 h-4" /> },
            { id: 'provincias', label: '18 Províncias', icon: <MapPin className="w-4 h-4" /> },
            { id: 'contactos', label: 'Telefones & WhatsApp', icon: <Smartphone className="w-4 h-4" /> },
            { id: 'links', label: 'Links, GitHub & Download', icon: <GitBranch className="w-4 h-4" /> },
            { id: 'bancos', label: 'Contas Bancárias (IBANs)', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'agt', label: 'Certificação AGT & Fiscal', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'updates', label: 'Atualizações OTA', icon: <Rocket className="w-4 h-4" /> },
            { id: 'backups', label: 'Backups Nuvem', icon: <Database className="w-4 h-4" /> },
            { id: 'zona-perigo', label: '🔄 Reinicialização (Reset)', icon: <RotateCcw className="w-4 h-4 text-rose-500" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ConfigTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-xs border border-slate-950'
                    : 'bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: GERAL & EMPRESA */}
        {activeTab === 'geral' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-slate-950 tracking-tight">Identificação da Empresa & Software</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Dados institucionais exibidos nos rodapés, propostas e termos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Nome Comercial do Software</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 transition-all outline-none"
                  placeholder="Ex: Kivora"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Razão Social da Empresa Detentora</label>
                <input
                  type="text"
                  value={settings.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 transition-all outline-none"
                  placeholder="Ex: Visual Software, Lda."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">NIF da Empresa</label>
                <input
                  type="text"
                  value={settings.nif}
                  onChange={(e) => handleChange('nif', e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 transition-all outline-none"
                  placeholder="Ex: 5417089123"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Nome Completo do Produto</label>
                <input
                  type="text"
                  value={settings.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 transition-all outline-none"
                  placeholder="Kivora Soft Desktop & POS"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Endereço Físico / Sede</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 transition-all outline-none"
                  placeholder="Edifício KIVORA, Rua Principal, Luanda, Angola"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Alterações</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: IA & ASSISTENTE VIRTUAL DO SITE */}
        {activeTab === 'ia-assistente' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveAIConfig} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                      <Bot className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-display font-bold text-slate-950 tracking-tight">Assistente Virtual de IA (Website 24/7)</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-sans mt-1">
                    Configure a chave de API de qualquer provedor de IA para atender visitantes com conhecimento certificado sobre o KIVORA SOFT.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-display font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sincronizado no Firestore</span>
                </div>
              </div>

              {/* Status do Assistente & Toggle Ativação */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-900">Ativação do Bot no Site Público</h4>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Quando ativo, o botão flutuante inteligente surge no canto inferior direito do site oficial para responder a visitantes.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={aiConfig.enabled !== false}
                    onChange={(e) => setAiConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Campo de Chave API com Auto-Detecção */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    Chave API de IA (Qualquer Provedor)
                  </label>
                  <span className="text-[11px] font-display font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-lg">
                    Auto-Detecção Ativa
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showAIKey ? 'text' : 'password'}
                    value={aiConfig.apiKey}
                    onChange={(e) => handleAIKeyChange(e.target.value)}
                    placeholder="Cole aqui a sua chave (ex: AIzaSy..., sk-proj-..., gsk_..., sk-or-..., sk-ant-...)"
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 text-xs font-mono-num font-semibold text-slate-900 outline-none pr-24 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowAIKey((prev) => !prev)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title={showAIKey ? 'Ocultar chave' : 'Mostrar chave'}
                    >
                      {showAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Banner de Provedor Detectado */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-500 font-medium">Provedor Reconhecido:</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-display font-bold capitalize bg-slate-950 text-white shadow-xs">
                    {aiConfig.provider}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    (Pode também alterar manualmente abaixo caso deseje outro endpoint)
                  </span>
                </div>
              </div>

              {/* Seleção de Provedor & Modelo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Provedor Selecionado</label>
                  <select
                    value={aiConfig.provider}
                    onChange={(e) => {
                      const p = e.target.value as AIAssistantProvider;
                      const defaults: Record<AIAssistantProvider, string> = {
                        gemini: 'gemini-1.5-flash',
                        openai: 'gpt-4o-mini',
                        groq: 'llama-3.3-70b-versatile',
                        openrouter: 'google/gemini-2.0-flash-exp:free',
                        anthropic: 'claude-3-5-haiku-20241022',
                        custom: 'gpt-4o-mini',
                      };
                      setAiConfig((prev) => ({ ...prev, provider: p, model: defaults[p] }));
                    }}
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 text-xs font-display font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="gemini">Google Gemini (Recomendado / Mais Rápido)</option>
                    <option value="openai">OpenAI (ChatGPT / GPT-4o-mini)</option>
                    <option value="groq">Groq (Llama 3.3 70B - Velocidade Extrema)</option>
                    <option value="openrouter">OpenRouter (Multi-Modelos Unificados)</option>
                    <option value="anthropic">Anthropic (Claude 3.5)</option>
                    <option value="custom">Endpoint Customizado / Próprio</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Modelo de IA</label>
                  <input
                    type="text"
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig((prev) => ({ ...prev, model: e.target.value }))}
                    placeholder="Ex: gemini-1.5-flash, gpt-4o-mini, llama-3.3-70b-versatile"
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 text-xs font-mono-num font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Temperatura / Criatividade</label>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={aiConfig.temperature ?? 0.7}
                      onChange={(e) => setAiConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="flex-1 accent-slate-950 cursor-pointer"
                    />
                    <span className="font-mono-num font-bold text-xs text-slate-900 w-8 text-right">
                      {aiConfig.temperature ?? 0.7}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endpoint Customizado (se provider === 'custom') */}
              {aiConfig.provider === 'custom' && (
                <div className="space-y-1.5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-amber-900">URL do Endpoint Customizado (OpenAI Compatível)</label>
                  <input
                    type="text"
                    value={aiConfig.customEndpoint || ''}
                    onChange={(e) => setAiConfig((prev) => ({ ...prev, customEndpoint: e.target.value }))}
                    placeholder="https://meu-servidor-ai.com/v1/chat/completions"
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs font-mono-num font-semibold text-slate-900 focus:border-slate-400 outline-none"
                  />
                </div>
              )}

              {/* Mensagem de Boas-Vindas */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Mensagem Inicial de Boas-Vindas aos Visitantes</label>
                <textarea
                  rows={2}
                  value={aiConfig.welcomeMessage || ''}
                  onChange={(e) => setAiConfig((prev) => ({ ...prev, welcomeMessage: e.target.value }))}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none leading-relaxed"
                  placeholder="Mensagem que o assistente exibe ao abrir a janela de chat..."
                />
              </div>

              {/* Base de Conhecimento e Prompt de Sistema */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">
                    Base de Conhecimento Kivora & Prompt do Sistema (Grounded)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAiConfig((prev) => ({ ...prev, systemPrompt: DEFAULT_AI_CONFIG.systemPrompt }))}
                    className="text-[11px] font-display font-semibold text-slate-600 hover:text-slate-950 cursor-pointer"
                  >
                    Restaurar Conhecimento Padrão
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={aiConfig.systemPrompt || ''}
                  onChange={(e) => setAiConfig((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl p-3.5 text-xs font-mono font-medium text-slate-800 outline-none leading-relaxed"
                  placeholder="Instruções de sistema e base factual..."
                />
                <p className="text-[11px] text-slate-400">
                  Inclui a certificação AGT (Decreto 71/25), funcionamento 100% offline, tabela de preços (25k/130k/250k/1.5M), licenças a crédito para parceiros e contactos.
                </p>
              </div>

              {/* Feedback do Teste de Conexão */}
              {testAIResult && (
                <div
                  className={`p-4 rounded-xl border text-xs font-display font-semibold leading-relaxed animate-fadeIn ${
                    testAIResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testAIResult.success ? '✓ ' : '✕ '}
                  {testAIResult.message}
                </div>
              )}

              {/* Ações */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestAI}
                  disabled={testingAI || !aiConfig.apiKey}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-display font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {testingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
                  <span>Testar Conexão com a IA</span>
                </button>

                <button
                  type="submit"
                  disabled={savingAI}
                  className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {savingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar Configurações de IA</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: SERVIÇO DE E-MAILS & NOTIFICAÇÕES (PORTAIS, CLIENTES & PARCEIROS) */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveEmailConfig} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-950 tracking-tight">Serviço de E-mails & Notificações KIVORA</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Configuração global para envio de credenciais, licenças, notificações a parceiros e comunicados</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-display font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sincronizado via Firestore</span>
                </div>
              </div>

              {/* Presets Rápidos */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-700">Predefinições Rápidas de 1 Clique</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailConfig(prev => ({
                        ...prev,
                        provider: 'gmail',
                        senderEmail: 'kivora.angola@gmail.com',
                        senderName: 'KIVORA SOFT',
                        smtpHost: 'smtp.gmail.com',
                        smtpPort: 465,
                        smtpUser: 'kivora.angola@gmail.com',
                      }));
                      notify.info('Predefinição Google Gmail selecionada. Insira a sua Palavra-passe de Aplicação de 16 caracteres.');
                    }}
                    className={`px-3 py-1.5 border rounded-xl text-xs font-display font-semibold transition-all shadow-xs cursor-pointer ${
                      emailConfig.provider === 'gmail' 
                        ? 'bg-slate-950 border-slate-950 text-white' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    Google Gmail Oficial (kivora.angola@gmail.com)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailConfig(prev => ({
                        ...prev,
                        provider: 'resend',
                        senderEmail: prev.senderEmail || 'kivora.angola@gmail.com',
                        senderName: prev.senderName || 'KIVORA SOFT',
                      }));
                      notify.info('Predefinição Resend API selecionada.');
                    }}
                    className={`px-3 py-1.5 border rounded-xl text-xs font-display font-semibold transition-all shadow-xs cursor-pointer ${
                      emailConfig.provider === 'resend' 
                        ? 'bg-slate-950 border-slate-950 text-white' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    Resend API
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailConfig(prev => ({
                        ...prev,
                        provider: 'sendgrid',
                        senderName: prev.senderName || 'KIVORA SOFT',
                      }));
                      notify.info('Predefinição SendGrid selecionada.');
                    }}
                    className={`px-3 py-1.5 border rounded-xl text-xs font-display font-semibold transition-all shadow-xs cursor-pointer ${
                      emailConfig.provider === 'sendgrid' 
                        ? 'bg-slate-950 border-slate-950 text-white' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    SendGrid API
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Provedor Ativo</label>
                  <select
                    value={emailConfig.provider || 'gmail'}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, provider: e.target.value as any }))}
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="gmail">Google Gmail Oficial (Recomendado)</option>
                    <option value="resend">Resend API</option>
                    <option value="sendgrid">SendGrid API</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">
                    {emailConfig.provider === 'gmail' ? 'Palavra-passe de Aplicação (App Password 16 Dígitos)' : 'Chave de API (API Key)'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={emailConfig.provider === 'gmail' ? 'xxxx xxxx xxxx xxxx' : 're_... ou SG....'}
                    value={emailConfig.apiKey || emailConfig.smtpPass || ''}
                    onChange={(e) => setEmailConfig(prev => ({ 
                      ...prev, 
                      apiKey: e.target.value,
                      smtpPass: e.target.value 
                    }))}
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-mono-num text-xs text-slate-900 outline-none"
                  />
                  {emailConfig.provider === 'gmail' ? (
                    <p className="text-[10px] text-slate-500 font-medium">
                      Gere uma senha de app em <strong>myaccount.google.com/apppasswords</strong> na conta <em>kivora.angola@gmail.com</em>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400">Obtenha a chave gratuita em resend.com ou sendgrid.com</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">E-mail Remetente Oficial</label>
                  <input
                    type="text"
                    required
                    placeholder="kivora.angola@gmail.com"
                    value={emailConfig.senderEmail || 'kivora.angola@gmail.com'}
                    onChange={(e) => setEmailConfig(prev => ({ 
                      ...prev, 
                      senderEmail: e.target.value,
                      smtpUser: prev.provider === 'gmail' ? e.target.value : prev.smtpUser 
                    }))}
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 outline-none"
                  />
                  <p className="text-[10px] text-emerald-600 font-medium">
                    O remetente visível para os clientes será <strong>{emailConfig.senderEmail || 'kivora.angola@gmail.com'}</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Nome de Exibição do Remetente</label>
                  <input
                    type="text"
                    required
                    placeholder="KIVORA SOFT"
                    value={emailConfig.senderName || 'KIVORA SOFT'}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, senderName: e.target.value }))}
                    className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingEmail}
                  className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar Definições de E-mail</span>
                </button>
              </div>
            </form>

            {/* Bloco de Teste de Envio */}
            <div className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-display font-bold text-slate-950 tracking-tight">Testar Conexão de E-mail em Tempo Real</h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Envie um e-mail de teste imediato para qualquer endereço para validar a entrega</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="destino.teste@gmail.com"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="flex-1 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 rounded-xl px-3.5 py-2.5 text-xs font-display font-semibold text-slate-900 outline-none"
                />
                <button
                  type="button"
                  disabled={isTestingEmail}
                  onClick={handleTestEmailSend}
                  className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {isTestingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isTestingEmail ? 'A Enviar Teste...' : 'Disparar E-mail de Teste'}</span>
                </button>
              </div>

              {testEmailResult && (
                <div className={`p-4 rounded-xl border text-xs font-display font-semibold flex items-start gap-2.5 animate-fadeIn ${
                  testEmailResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <span className="text-base">{testEmailResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}</span>
                  <div>
                    <p>{testEmailResult.msg}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PLANOS & PREÇOS (CONFIGURAÇÃO COMPLETA DA TABELA OFICIAL) */}
        {activeTab === 'precos' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-8">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-slate-950 tracking-tight">Tabela de Preços, Planos & Simulador</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Configure os valores, descrições, recursos e botões da página de preços (/planos)</p>
              </div>
            </div>

            {/* Configurações Gerais do Cabeçalho */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <h4 className="text-[11px] font-display font-bold text-slate-900 uppercase tracking-wider">Cabeçalho da Secção</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Tag Superior</label>
                  <input
                    type="text"
                    value={settings.pricingTag || ''}
                    onChange={(e) => handleChange('pricingTag', e.target.value)}
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-display font-semibold text-slate-900 focus:border-slate-400 outline-none"
                    placeholder="Tabela de Preços Oficiais"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Título Principal</label>
                  <input
                    type="text"
                    value={settings.pricingTitle || ''}
                    onChange={(e) => handleChange('pricingTitle', e.target.value)}
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-display font-semibold text-slate-900 focus:border-slate-400 outline-none"
                    placeholder="Escolha a Modalidade de Licenciamento"
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">Subtítulo / Descrição</label>
                  <input
                    type="text"
                    value={settings.pricingSubtitle || ''}
                    onChange={(e) => handleChange('pricingSubtitle', e.target.value)}
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 outline-none"
                    placeholder="Preços claros em Kwanzas (AOA) com IVA incluído no regime de isenção de software e sem cobrança por fatura emitida."
                  />
                </div>
              </div>
            </div>

            {/* Grelha dos 3 Planos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* PLANO 1: MENSAL STANDALONE */}
              <div className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div className="border-b border-slate-200/80 pb-2">
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                      Plano 1
                    </span>
                    <h4 className="font-display font-bold text-slate-950 text-sm mt-1">Mensal Standalone</h4>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Categoria / Tagline</label>
                    <input
                      type="text"
                      value={settings.planMensalCategory || ''}
                      onChange={(e) => handleChange('planMensalCategory', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-700 focus:border-slate-400 outline-none uppercase text-xs"
                      placeholder="Arranque Flexível"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Nome do Plano</label>
                    <input
                      type="text"
                      value={settings.planMensalName || ''}
                      onChange={(e) => handleChange('planMensalName', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="Plano Mensal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Preço (AOA)</label>
                      <input
                        type="text"
                        value={settings.planMensalPrice || ''}
                        onChange={(e) => handleChange('planMensalPrice', e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono-num font-bold text-slate-950 focus:border-slate-400 outline-none"
                        placeholder="25.000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Período</label>
                      <input
                        type="text"
                        value={settings.planMensalPeriod || ''}
                        onChange={(e) => handleChange('planMensalPeriod', e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-medium text-slate-700 focus:border-slate-400 outline-none"
                        placeholder="/ mês"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Descrição Curta</label>
                    <textarea
                      rows={2}
                      value={settings.planMensalDesc || ''}
                      onChange={(e) => handleChange('planMensalDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 font-medium text-slate-800 focus:border-slate-400 outline-none leading-relaxed"
                      placeholder="Flexibilidade total sem contratos de fidelização..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Preço Terminal Extra (Simulador)</label>
                    <input
                      type="number"
                      value={settings.planMensalExtraTerminal ?? 10000}
                      onChange={(e) => handleChange('planMensalExtraTerminal', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono-num font-bold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="10000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Texto do Botão (CTA)</label>
                    <input
                      type="text"
                      value={settings.planMensalCta || ''}
                      onChange={(e) => handleChange('planMensalCta', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="Aderir ao Plano Mensal"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Recursos Inclusos (1 por linha)</label>
                    <textarea
                      rows={6}
                      value={settings.planMensalFeatures || ''}
                      onChange={(e) => handleChange('planMensalFeatures', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 focus:border-slate-400 outline-none leading-relaxed"
                      placeholder="1 Posto de Trabalho Ativo&#10;Faturação Certificada AGT com QR Code"
                    />
                  </div>
                </div>
              </div>

              {/* PLANO 2: ANUAL MULTI-POSTOS (RECOMENDADO) */}
              <div className="p-5 rounded-xl bg-white border-2 border-slate-950 space-y-3.5 flex flex-col justify-between shadow-xs">
                <div className="space-y-3 text-xs">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Plano 2 (Destaque)
                    </span>
                    <span className="text-[10px] font-display font-bold text-slate-900">Mais Popular</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Categoria / Tagline</label>
                    <input
                      type="text"
                      value={settings.planAnualCategory || ''}
                      onChange={(e) => handleChange('planAnualCategory', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-700 focus:border-slate-400 outline-none uppercase text-xs"
                      placeholder="Multi-Postos & Rede LAN"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Nome do Plano</label>
                    <input
                      type="text"
                      value={settings.planAnualName || ''}
                      onChange={(e) => handleChange('planAnualName', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="Plano Anual LAN"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Badge Superior</label>
                      <input
                        type="text"
                        value={settings.planAnualBadge || ''}
                        onChange={(e) => handleChange('planAnualBadge', e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-900 focus:border-slate-400 outline-none uppercase text-xs"
                        placeholder="Mais Escolhido em Angola"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Nota de Poupança</label>
                      <input
                        type="text"
                        value={settings.planAnualSavings || ''}
                        onChange={(e) => handleChange('planAnualSavings', e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 font-display font-medium text-emerald-700 focus:border-slate-400 outline-none text-xs"
                        placeholder="Poupança de 50.000 Kz vs Mensal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Preço (AOA)</label>
                      <input
                        type="text"
                        value={settings.planAnualPrice || ''}
                        onChange={(e) => handleChange('planAnualPrice', e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 font-mono-num font-bold text-slate-950 focus:border-slate-400 outline-none"
                        placeholder="250.000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Período</label>
                      <input
                        type="text"
                        value={settings.planAnualPeriod || ''}
                        onChange={(e) => handleChange('planAnualPeriod', e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 font-medium text-slate-700 focus:border-slate-400 outline-none"
                        placeholder="/ ano"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Descrição Curta</label>
                    <textarea
                      rows={2}
                      value={settings.planAnualDesc || ''}
                      onChange={(e) => handleChange('planAnualDesc', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 font-medium text-slate-800 focus:border-slate-400 outline-none leading-relaxed"
                      placeholder="A opção mais rentável para empresas ativas..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Preço Terminal Extra (Simulador)</label>
                    <input
                      type="number"
                      value={settings.planAnualExtraTerminal ?? 35000}
                      onChange={(e) => handleChange('planAnualExtraTerminal', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 font-mono-num font-bold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="35000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Texto do Botão (CTA)</label>
                    <input
                      type="text"
                      value={settings.planAnualCta || ''}
                      onChange={(e) => handleChange('planAnualCta', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="Contratar Plano Anual"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Recursos Inclusos (1 por linha)</label>
                    <textarea
                      rows={6}
                      value={settings.planAnualFeatures || ''}
                      onChange={(e) => handleChange('planAnualFeatures', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 focus:border-slate-400 outline-none leading-relaxed"
                      placeholder="Até 3 Postos em Rede LAN Incluídos&#10;Módulos de Stock, POS e RH Integrados"
                    />
                  </div>
                </div>
              </div>

              {/* PLANO 3: VITALÍCIO PERPÉTUO */}
              <div className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div className="border-b border-slate-200/80 pb-2">
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded">
                      Plano 3
                    </span>
                    <h4 className="font-display font-bold text-slate-950 text-sm mt-1">Licença Vitalícia</h4>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Categoria / Tagline</label>
                    <input
                      type="text"
                      value={settings.planVitalicioCategory || ''}
                      onChange={(e) => handleChange('planVitalicioCategory', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-700 focus:border-slate-400 outline-none uppercase text-xs"
                      placeholder="Pagamento Único"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Nome do Plano</label>
                    <input
                      type="text"
                      value={settings.planVitalicioName || ''}
                      onChange={(e) => handleChange('planVitalicioName', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="Licença Vitalícia"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Preço (AOA)</label>
                      <input
                        type="text"
                        value={settings.planVitalicioPrice || ''}
                        onChange={(e) => handleChange('planVitalicioPrice', e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono-num font-bold text-slate-950 focus:border-slate-400 outline-none"
                        placeholder="650.000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Período</label>
                      <input
                        type="text"
                        value={settings.planVitalicioPeriod || ''}
                        onChange={(e) => handleChange('planVitalicioPeriod', e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-medium text-slate-700 focus:border-slate-400 outline-none"
                        placeholder="pagamento único"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Descrição Curta</label>
                    <textarea
                      rows={2}
                      value={settings.planVitalicioDesc || ''}
                      onChange={(e) => handleChange('planVitalicioDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 font-medium text-slate-800 focus:border-slate-400 outline-none leading-relaxed"
                      placeholder="Sem renovações anuais ou mensalidades..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Preço Terminal Extra (Simulador)</label>
                    <input
                      type="number"
                      value={settings.planVitalicioExtraTerminal ?? 60000}
                      onChange={(e) => handleChange('planVitalicioExtraTerminal', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono-num font-bold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="60000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Texto do Botão (CTA)</label>
                    <input
                      type="text"
                      value={settings.planVitalicioCta || ''}
                      onChange={(e) => handleChange('planVitalicioCta', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-display font-semibold text-slate-900 focus:border-slate-400 outline-none"
                      placeholder="Adquirir Licença Perpétua"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">Recursos Inclusos (1 por linha)</label>
                    <textarea
                      rows={6}
                      value={settings.planVitalicioFeatures || ''}
                      onChange={(e) => handleChange('planVitalicioFeatures', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 focus:border-slate-400 outline-none leading-relaxed"
                      placeholder="5 Postos de Trabalho em Rede Local&#10;Licença perpétua sem expiração"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Planos & Preços</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: VIDEOCHAMADA & TARIFAS POR MINUTO */}
        {activeTab === 'videochamada' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-8">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-display font-bold text-slate-950 flex items-center gap-2 tracking-tight">
                  <Video className="w-5 h-5 text-slate-700" />
                  <span>Assistência por Videochamada & Tarifação por Minuto</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Configure o valor por minuto em Kwanzas (Kz), minutos de cortesia de boas-vindas e pacotes oficiais de minutos para clientes e parceiros.
                </p>
              </div>
            </div>

            {/* Dica de Operação */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-display font-bold text-slate-900">Como funciona o Sistema de Tarifação por Minuto:</p>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  O cliente ou parceiro escolhe um pacote de minutos (ex: 20m, 30m, 60m ou personalizado) e paga o valor equivalente em Kwanzas. Durante a chamada, o sistema calcula o tempo consumido segundo a segundo. Quando o saldo de minutos se esgota, a videochamada bloqueia automaticamente até nova recarga.
                </p>
              </div>
            </div>

            {/* Parâmetros Globais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500 block">Preço Oficial por Minuto (Kz)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={settings.videoCallPricePerMinute ?? 300}
                    onChange={(e) => handleChange('videoCallPricePerMinute', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num font-bold text-slate-950 text-sm focus:border-slate-400 outline-none"
                    placeholder="300"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono-num font-bold text-slate-400">Kz / min</span>
                </div>
                <p className="text-[10px] text-slate-400">Valor base cobrado por cada 60 segundos de assistência.</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500 block">Minutos de Cortesia Inicial</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={settings.videoCallFreeMinutesOnboarding ?? 15}
                    onChange={(e) => handleChange('videoCallFreeMinutesOnboarding', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num font-bold text-emerald-600 text-sm focus:border-slate-400 outline-none"
                    placeholder="15"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono-num font-bold text-slate-400">minutos</span>
                </div>
                <p className="text-[10px] text-slate-400">Crédito grátis oferecido no primeiro registo do cliente.</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500 block">Mínimo Compra Personalizada</label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={settings.videoCallMinPackageMinutes ?? 10}
                    onChange={(e) => handleChange('videoCallMinPackageMinutes', parseInt(e.target.value) || 10)}
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num font-bold text-slate-900 text-sm focus:border-slate-400 outline-none"
                    placeholder="10"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono-num font-bold text-slate-400">minutos</span>
                </div>
                <p className="text-[10px] text-slate-400">Quantidade mínima permitida no slider personalizado.</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <label className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-500 block">Estado do Módulo</label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ativar ou pausar a tarifação por minuto no portal.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={settings.videoCallEnabled ?? true}
                    onChange={(e) => handleChange('videoCallEnabled', e.target.checked)}
                    className="w-4 h-4 accent-slate-950 rounded cursor-pointer"
                  />
                  <span className="font-display font-semibold text-xs text-slate-800">
                    {settings.videoCallEnabled ?? true ? 'Ativo & Tarifado' : 'Pausado (Acesso Livre)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Gestão de Pacotes de Minutos */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-display font-bold text-slate-900 uppercase tracking-wider">
                    Pacotes Oficiais de Minutos Sugeridos
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Configuração dos cartões exibidos no modal de compra rápida com descontos automáticos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const current = settings.videoCallPackages || DEFAULT_VIDEO_PACKAGES;
                    const newPkg: VideoCallPackage = {
                      id: `pkg-${Date.now()}`,
                      minutes: 45,
                      label: 'Pacote Especial (45 min)',
                      badge: 'OFERTA',
                      discountPercent: 8,
                      popular: false,
                    };
                    handleChange('videoCallPackages', [...current, newPkg]);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-display font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Pacote</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(settings.videoCallPackages || DEFAULT_VIDEO_PACKAGES).map((pkg, idx) => {
                  const unitPrice = settings.videoCallPricePerMinute ?? 300;
                  const rawCost = pkg.minutes * unitPrice;
                  const finalCost = rawCost - Math.round(rawCost * ((pkg.discountPercent || 0) / 100));

                  return (
                    <div key={pkg.id || idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3 relative text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-num font-bold text-slate-950 text-base">{pkg.minutes} minutos</span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = settings.videoCallPackages || DEFAULT_VIDEO_PACKAGES;
                            handleChange('videoCallPackages', current.filter((_, i) => i !== idx));
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Remover pacote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-display font-bold text-slate-500 uppercase">Rótulo / Nome</label>
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={(e) => {
                            const current = [...(settings.videoCallPackages || DEFAULT_VIDEO_PACKAGES)];
                            current[idx] = { ...current[idx], label: e.target.value };
                            handleChange('videoCallPackages', current);
                          }}
                          className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs font-display font-semibold focus:border-slate-400 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-display font-bold text-slate-500 uppercase">Desconto (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={pkg.discountPercent || 0}
                            onChange={(e) => {
                              const current = [...(settings.videoCallPackages || DEFAULT_VIDEO_PACKAGES)];
                              current[idx] = { ...current[idx], discountPercent: parseInt(e.target.value) || 0 };
                              handleChange('videoCallPackages', current);
                            }}
                            className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs font-mono-num font-bold text-emerald-600 focus:border-slate-400 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-display font-bold text-slate-500 uppercase">Badge / Tag</label>
                          <input
                            type="text"
                            value={pkg.badge || ''}
                            onChange={(e) => {
                              const current = [...(settings.videoCallPackages || DEFAULT_VIDEO_PACKAGES)];
                              current[idx] = { ...current[idx], badge: e.target.value };
                              handleChange('videoCallPackages', current);
                            }}
                            placeholder="Ex: POPULAR"
                            className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-[10px] font-display font-bold focus:border-slate-400 outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-sans">Valor Final:</span>
                        <span className="font-mono-num font-bold text-slate-950">
                          {new Intl.NumberFormat('pt-AO').format(finalCost)} Kz
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Definições de Videochamada</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: IMAGENS, VÍDEOS & MULTIMÉDIA */}
        {activeTab === 'videos' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            
            {/* SECÇÃO 1: IMAGENS DAS PÁGINAS & MÓDULOS */}
            <div className="border-b border-slate-200/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#FF6500]" />
                  <span>Imagens do Site Público & Módulos Oficiais</span>
                </h3>
                <p className="text-xs font-display text-slate-500 mt-0.5">
                  Substitua caminhos locais (ex: /imagens/pc-descktop-kivora.webp) ou insira URLs externas para todas as páginas e menus
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-display">
              {renderImageField(
                '1. Imagem Principal do Topo (Hero Desktop)',
                'heroImageUrl',
                '/imagens/pc-descktop-kivora.webp',
                'Exibida no topo da página inicial com os postos de trabalho'
              )}
              {renderImageField(
                '2. Imagem dos 4 Passos de Ativação',
                'stepsImageUrl',
                '/imagens/jovem-empresaria-com-tablet.webp',
                'Ilustração da secção de passos de implementação e download'
              )}
              {renderImageField(
                '3. Imagem "Sobre a Kivora Soft" (Equipa / Consultores)',
                'aboutImageUrl',
                '/imagens/executivos-kivora.jpg',
                'Fotografia institucional exibida na secção Sobre a Kivora'
              )}
              {renderImageField(
                '4. Imagem Módulo POS (Frente de Caixa)',
                'modulePosImageUrl',
                '/imagens/pc-pos-kivora.webp',
                'Captura do ecrã de vendas rápidas e touch'
              )}
              {renderImageField(
                '5. Imagem Módulo Faturação AGT',
                'moduleFaturacaoImageUrl',
                '/imagens/pc-laptop-kivora.webp',
                'Captura do ecrã de emissão de faturas e certificados'
              )}
              {renderImageField(
                '6. Imagem Módulo Restauração & Mesas',
                'moduleRestauranteImageUrl',
                '/imagens/pc-descktop-kivora.webp',
                'Captura do ecrã de gestão de salas e pedidos'
              )}
              {renderImageField(
                '7. Imagem Módulo Oficina Mecânica & Stand',
                'moduleOficinaImageUrl',
                '/imagens/pc-descktop-kivora.webp',
                'Captura do ecrã de ordens de serviço de oficina'
              )}
              {renderImageField(
                '8. Imagem Módulo Lavandaria Têxtil',
                'moduleLavandariaImageUrl',
                '/imagens/pc-laptop-kivora.webp',
                'Captura do ecrã do balcão e fases de lavagem'
              )}
              {renderImageField(
                '9. Imagem Módulo Gestão de Stocks & Armazéns',
                'moduleStockImageUrl',
                '/imagens/pos_touch_terminal.webp',
                'Captura do ecrã de inventário e armazéns'
              )}
            </div>

            {/* SECÇÃO 2: MÍDIAS DOS PAINÉIS DE PARCEIROS E CLIENTES */}
            <div className="border-b border-slate-200/70 pb-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Mídias & Vídeos dos Portais de Parceiros e Clientes</span>
                </h3>
                <p className="text-xs font-display text-slate-500 mt-0.5">
                  Vídeos de capacitação técnica e banners informativos exibidos dentro dos painéis internos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-display">
              {/* Parceiro Vídeo */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider block">
                  Vídeo de Onboarding (Portal do Parceiro)
                </label>
                <input
                  type="url"
                  value={settings.partnerPortalVideoUrl || ''}
                  onChange={(e) => handleChange('partnerPortalVideoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num text-slate-900 focus:border-slate-900 outline-none"
                />
                <p className="text-[10px] text-slate-500 font-sans">Vídeo de capacitação sobre emissão de licenças e carteira virtual</p>
              </div>

              {/* Parceiro Banner */}
              {renderImageField(
                'Banner Promocional / Avisos (Portal do Parceiro)',
                'partnerPortalBannerUrl',
                '/imagens/parceiros-kivora.webp',
                'Banner em destaque exibido no topo do painel do parceiro'
              )}

              {/* Cliente Vídeo */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider block">
                  Vídeo de Primeiros Passos (Portal do Cliente)
                </label>
                <input
                  type="url"
                  value={settings.clientPortalVideoUrl || ''}
                  onChange={(e) => handleChange('clientPortalVideoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num text-slate-900 focus:border-slate-900 outline-none"
                />
                <p className="text-[10px] text-slate-500 font-sans">Tutorial de ativação da licença e configuração inicial do software</p>
              </div>

              {/* Cliente Banner */}
              {renderImageField(
                'Banner Informativo (Portal do Cliente)',
                'clientPortalBannerUrl',
                '/imagens/pacote.webp',
                'Banner de suporte e novidades exibido no painel do cliente'
              )}
            </div>

            {/* SECÇÃO 3: VÍDEOS DO YOUTUBE NO SITE OFICIAL */}
            <div className="border-b border-slate-200/70 pb-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <span>Vídeos do YouTube no Site Oficial</span>
                </h3>
                <p className="text-xs font-display text-slate-500 mt-0.5">Configure links do YouTube (normais, encurtados ou shorts) exibidos com reprodução otimizada em alta definição</p>
              </div>
            </div>

            {/* Dica de formato YouTube */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-3">
              <Youtube className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1 font-display">
                <p className="font-semibold text-slate-900">Formatos de Links Suportados Automaticamente:</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pode colar links directos como <code className="font-mono-num font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">https://www.youtube.com/watch?v=XXXXXX</code>, links partilhados <code className="font-mono-num font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">https://youtu.be/XXXXXX</code>, shorts ou links de incorporação. O sistema converte automaticamente com modo de privacidade estrita.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-display">
              
              {/* 1. Vídeo da Homepage */}
              <div className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-display font-bold uppercase tracking-wider text-[11px] text-blue-700">
                      1. Página Inicial (Homepage)
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold px-2 py-0.5 rounded-md">
                      Secção Principal
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Link do YouTube</label>
                    <input
                      type="url"
                      value={settings.videoHomeUrl || ''}
                      onChange={(e) => handleChange('videoHomeUrl', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Título do Vídeo</label>
                    <input
                      type="text"
                      value={settings.videoHomeTitle || ''}
                      onChange={(e) => handleChange('videoHomeTitle', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-display font-semibold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Conheça o KIVORA SOFT em Ação"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Descrição / Subtítulo</label>
                    <input
                      type="text"
                      value={settings.videoHomeDesc || ''}
                      onChange={(e) => handleChange('videoHomeDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Demonstração rápida da interface do POS..."
                    />
                  </div>
                </div>
              </div>

              {/* 2. Vídeo dos Manuais de Apoio */}
              <div className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-display font-bold uppercase tracking-wider text-[11px] text-amber-700">
                      2. Central de Manuais & Tutoriais
                    </span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold px-2 py-0.5 rounded-md">
                      Área de Manuais
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Link do YouTube</label>
                    <input
                      type="url"
                      value={settings.videoManuaisUrl || ''}
                      onChange={(e) => handleChange('videoManuaisUrl', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Título do Tutorial</label>
                    <input
                      type="text"
                      value={settings.videoManuaisTitle || ''}
                      onChange={(e) => handleChange('videoManuaisTitle', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-display font-semibold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Guia Rápido: Operação de Caixa & Fecho Z"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Descrição / Dica</label>
                    <input
                      type="text"
                      value={settings.videoManuaisDesc || ''}
                      onChange={(e) => handleChange('videoManuaisDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Aprenda passo a passo como realizar a abertura..."
                    />
                  </div>
                </div>
              </div>

              {/* 3. Vídeo do Programa de Parceiros */}
              <div className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-display font-bold uppercase tracking-wider text-[11px] text-purple-700">
                      3. Programa de Parceiros
                    </span>
                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/60 font-semibold px-2 py-0.5 rounded-md">
                      Página de Parceiros
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Link do YouTube</label>
                    <input
                      type="url"
                      value={settings.videoParceirosUrl || ''}
                      onChange={(e) => handleChange('videoParceirosUrl', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Título do Vídeo de Parcerias</label>
                    <input
                      type="text"
                      value={settings.videoParceirosTitle || ''}
                      onChange={(e) => handleChange('videoParceirosTitle', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-display font-semibold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Programa Oficial de Parceiros & Revendedores"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Descrição</label>
                    <input
                      type="text"
                      value={settings.videoParceirosDesc || ''}
                      onChange={(e) => handleChange('videoParceirosDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Descubra como lucrar até 50% de margem com a revenda..."
                    />
                  </div>
                </div>
              </div>

              {/* 4. Vídeo do Guia AGT */}
              <div className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-display font-bold uppercase tracking-wider text-[11px] text-emerald-700">
                      4. Guia Oficial AGT (Decreto 71/25)
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold px-2 py-0.5 rounded-md">
                      Conformidade Fiscal
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Link do YouTube</label>
                    <input
                      type="url"
                      value={settings.videoAgtUrl || ''}
                      onChange={(e) => handleChange('videoAgtUrl', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Título</label>
                    <input
                      type="text"
                      value={settings.videoAgtTitle || ''}
                      onChange={(e) => handleChange('videoAgtTitle', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-display font-semibold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Exigências do Decreto 71/25 & Faturação AGT"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Descrição</label>
                    <input
                      type="text"
                      value={settings.videoAgtDesc || ''}
                      onChange={(e) => handleChange('videoAgtDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Entenda os regimes de IVA e a regra de anulação..."
                    />
                  </div>
                </div>
              </div>

              {/* 5. Vídeo de Hardware & POS */}
              <div className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-3.5 flex flex-col justify-between md:col-span-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-display font-bold uppercase tracking-wider text-[11px] text-slate-800">
                      5. Hardware & Equipamentos POS
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded-md">
                      Página de Hardware
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Link do YouTube</label>
                      <input
                        type="url"
                        value={settings.videoHardwareUrl || ''}
                        onChange={(e) => handleChange('videoHardwareUrl', e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Título</label>
                      <input
                        type="text"
                        value={settings.videoHardwareTitle || ''}
                        onChange={(e) => handleChange('videoHardwareTitle', e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 font-display font-semibold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                        placeholder="Instalação Rápida de Impressoras Térmicas 80mm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Descrição</label>
                      <input
                        type="text"
                        value={settings.videoHardwareDesc || ''}
                        onChange={(e) => handleChange('videoHardwareDesc', e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                        placeholder="Configuração plug-and-play de impressoras ESC/POS..."
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Vídeos YouTube</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: NOTIFICAÇÕES & WEBHOOK */}
        {activeTab === 'notificacoes' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4">
              <h3 className="text-base font-display font-bold text-slate-900">Notificações, Leads & Integrações Webhook</h3>
              <p className="text-xs font-display text-slate-500 mt-0.5">Configure os canais de recepção de agendamentos de demonstrações, candidaturas de parceiros e automação de marketing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-display">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>URL do Webhook Externo (Zapier / Make / n8n / CRM)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
                </label>
                <input
                  type="url"
                  value={settings.webhookUrl || ''}
                  onChange={(e) => handleChange('webhookUrl', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="https://webhook.site/sua-url-ou-zapier"
                />
                <p className="text-[11px] text-slate-400">Todos os pedidos de demonstração e candidaturas de parceiros podem ser enviados em JSON para este endpoint.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Email de Recepção de Leads (Demonstrações)</label>
                <input
                  type="email"
                  value={settings.notifyEmailLeads || ''}
                  onChange={(e) => handleChange('notifyEmailLeads', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="comercial@kivora.ao"
                />
                <p className="text-[11px] text-slate-400">Caixa de correio alertada quando um cliente solicita uma demonstração.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Email de Recepção de Candidaturas de Parceiros</label>
                <input
                  type="email"
                  value={settings.notifyEmailPartners || ''}
                  onChange={(e) => handleChange('notifyEmailPartners', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="parceiros@kivora.ao"
                />
                <p className="text-[11px] text-slate-400">Caixa de correio alertada quando um revendedor envia candidatura.</p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Mensagem Padrão de Abertura no WhatsApp</label>
                <input
                  type="text"
                  value={settings.whatsappDefaultMessage || ''}
                  onChange={(e) => handleChange('whatsappDefaultMessage', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Olá! Gostaria de agendar uma demonstração do KIVORA SOFT para a minha empresa."
                />
                <p className="text-[11px] text-slate-400">Texto pré-preenchido quando o visitante clica no botão de WhatsApp do site.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Notificações</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: AVISOS & COMUNICADOS */}
        {activeTab === 'comunicados' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4">
              <h3 className="text-base font-display font-bold text-slate-900">Barra de Avisos Globais & Banner de Cookies</h3>
              <p className="text-xs font-display text-slate-500 mt-0.5">Configure avisos de topo, comunicados de atualizações fiscais e consentimento de cookies</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-4 text-xs font-display">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Barra de Anúncio / Comunicado no Topo do Portal</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Exibe uma faixa de destaque no cabeçalho de todas as páginas públicas.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementBarEnabled || false}
                    onChange={(e) => handleChange('announcementBarEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-950"></div>
                </label>
              </div>

              {settings.announcementBarEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3 border-t border-slate-200/70">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Badge / Etiqueta</label>
                    <input
                      type="text"
                      value={settings.announcementBadge || ''}
                      onChange={(e) => handleChange('announcementBadge', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-display font-semibold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="DECRETO 71/25"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Texto da Mensagem</label>
                    <input
                      type="text"
                      value={settings.announcementText || ''}
                      onChange={(e) => handleChange('announcementText', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-display font-medium text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Conformidade integral com o Decreto Presidencial n.º 71/25 e novas regras fiscais da AGT 2026."
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Link de Destino ao Clicar (Rota ou URL)</label>
                    <input
                      type="text"
                      value={settings.announcementLink || ''}
                      onChange={(e) => handleChange('announcementLink', e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-mono-num text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="/guia-agt"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between text-xs font-display">
              <div>
                <h4 className="font-semibold text-slate-900">Banner de Política de Cookies & Privacidade</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Exibe a caixa de aviso de cookies no primeiro acesso do visitante.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cookieBannerEnabled !== false}
                  onChange={(e) => handleChange('cookieBannerEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-950"></div>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Avisos & Comunicados</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: MÉTRICAS & NÚMEROS */}
        {activeTab === 'metricas' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900">Estatísticas & Números de Impacto</h3>
                <p className="text-xs font-display text-slate-500 mt-0.5">Métricas exibidas com animação de contagem na Homepage e páginas oficiais</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-display">
              <div className="space-y-2 p-5 rounded-xl bg-slate-50/60 border border-slate-200/70">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Empresas & Lojas Ativas</span>
                </label>
                <input
                  type="number"
                  value={settings.statCompaniesCount ?? 850}
                  onChange={(e) => handleChange('statCompaniesCount', parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 font-mono-num font-bold text-base text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="850"
                />
                <p className="text-[11px] text-slate-500">Número de empresas faturando com o Kivora</p>
              </div>

              <div className="space-y-2 p-5 rounded-xl bg-slate-50/60 border border-slate-200/70">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Terminais LAN / Caixas Instalados</span>
                </label>
                <input
                  type="number"
                  value={settings.statTerminalsCount ?? 2400}
                  onChange={(e) => handleChange('statTerminalsCount', parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 font-mono-num font-bold text-base text-emerald-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="2400"
                />
                <p className="text-[11px] text-slate-500">Total de postos físicos em operação</p>
              </div>

              <div className="space-y-2 p-5 rounded-xl bg-slate-50/60 border border-slate-200/70">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Volume de Faturas Emitidas</span>
                </label>
                <input
                  type="text"
                  value={settings.statInvoicesCount || '+14.5M'}
                  onChange={(e) => handleChange('statInvoicesCount', e.target.value)}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 font-mono-num font-bold text-base text-amber-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="+14.5M"
                />
                <p className="text-[11px] text-slate-500">Faturas processadas com QR Code da AGT</p>
              </div>

              <div className="space-y-2 p-5 rounded-xl bg-slate-50/60 border border-slate-200/70">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                  <span>Disponibilidade Operacional (Uptime)</span>
                </label>
                <input
                  type="text"
                  value={settings.statUptimePercent || '99.98%'}
                  onChange={(e) => handleChange('statUptimePercent', e.target.value)}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 font-mono-num font-bold text-base text-blue-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="99.98%"
                />
                <p className="text-[11px] text-slate-500">Estabilidade sem interrupção de caixas</p>
              </div>

              <div className="space-y-2 p-5 rounded-xl bg-slate-50/60 border border-slate-200/70">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Províncias com Presença Ativa</span>
                </label>
                <input
                  type="number"
                  value={settings.statProvincesCount ?? 18}
                  onChange={(e) => handleChange('statProvincesCount', parseInt(e.target.value) || 18)}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 font-mono-num font-bold text-base text-indigo-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="18"
                />
                <p className="text-[11px] text-slate-500">Total de províncias de Angola atendidas</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Métricas</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: LOGÓTIPOS & MARCAS */}
        {activeTab === 'marcas' && (
          <div className="space-y-6">
            {/* Formulário de Adicionar Nova Marca */}
            <form onSubmit={handleAddBrand} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-5">
              <div className="border-b border-slate-200/70 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-900">Adicionar Empresa Parceira ou Cliente</h3>
                  <p className="text-xs font-display text-slate-500 mt-0.5">Exibido no carrossel da homepage e nas páginas de parceiros</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs font-display">
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Nome da Empresa</label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Ex: Supermercados Aliança"
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Tipo</label>
                  <select
                    value={newBrandType}
                    onChange={(e) => setNewBrandType(e.target.value as any)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="parceiro">Parceiro TI</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Setor</label>
                  <input
                    type="text"
                    value={newBrandSector}
                    onChange={(e) => setNewBrandSector(e.target.value)}
                    placeholder="Ex: Retalho"
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Província</label>
                  <input
                    type="text"
                    value={newBrandProvince}
                    onChange={(e) => setNewBrandProvince(e.target.value)}
                    placeholder="Ex: Luanda"
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-display">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">URL do Logótipo (Opcional — se vazio usa iniciais elegantes)</label>
                <input
                  type="url"
                  value={newBrandLogoUrl}
                  onChange={(e) => setNewBrandLogoUrl(e.target.value)}
                  placeholder="https://exemplo.ao/logo.png"
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num text-xs text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar à Lista</span>
                </button>
              </div>
            </form>

            {/* Lista Atual de Marcas */}
            <div className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
                <h3 className="text-base font-display font-bold text-slate-900">
                  Marcas Cadastradas <span className="font-mono-num text-sm text-slate-500 font-semibold">({(settings.partnerLogos || []).length})</span>
                </h3>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(settings.partnerLogos || []).map((brand) => (
                  <div
                    key={brand.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      brand.active ? 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300' : 'bg-slate-100/50 border-slate-200/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-800 flex items-center justify-center font-display font-bold text-xs shrink-0 overflow-hidden">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          brand.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 font-display">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-900 truncate block">{brand.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider shrink-0 border ${
                            brand.type === 'parceiro' ? 'bg-blue-50 text-blue-700 border-blue-200/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          }`}>
                            {brand.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {[brand.sector, brand.province].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleBrandActive(brand.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-display font-semibold transition-colors cursor-pointer border ${
                          brand.active ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60' : 'text-slate-600 bg-slate-100 border-slate-200'
                        }`}
                        title={brand.active ? 'Ativo (clique para ocultar)' : 'Oculto (clique para ativar)'}
                      >
                        {brand.active ? 'Ativo' : 'Oculto'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: INVESTIDORES & GOVERNANÇA */}
        {activeTab === 'investidores' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900">Relações com Investidores & Governança</h3>
                <p className="text-xs font-display text-slate-500 mt-0.5">Dados institucionais exibidos na página oficial de investidores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-display">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Título da Seção de Investidores</label>
                <input
                  type="text"
                  value={settings.investorInfo?.title || DEFAULT_INVESTOR_SETTINGS.title}
                  onChange={(e) => handleInvestorChange('title', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Crescimento Anual</label>
                <input
                  type="text"
                  value={settings.investorInfo?.annualGrowth || DEFAULT_INVESTOR_SETTINGS.annualGrowth}
                  onChange={(e) => handleInvestorChange('annualGrowth', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-emerald-700 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="+128% ao ano"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Entidade Legal</label>
                <input
                  type="text"
                  value={settings.investorInfo?.legalEntity || DEFAULT_INVESTOR_SETTINGS.legalEntity}
                  onChange={(e) => handleInvestorChange('legalEntity', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Capital Social</label>
                <input
                  type="text"
                  value={settings.investorInfo?.shareCapital || DEFAULT_INVESTOR_SETTINGS.shareCapital}
                  onChange={(e) => handleInvestorChange('shareCapital', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Auditoria & Certificação AGT</label>
                <input
                  type="text"
                  value={settings.investorInfo?.auditedBy || DEFAULT_INVESTOR_SETTINGS.auditedBy}
                  onChange={(e) => handleInvestorChange('auditedBy', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-emerald-700 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Email do Conselho de Administração</label>
                <input
                  type="email"
                  value={settings.investorInfo?.contactEmail || DEFAULT_INVESTOR_SETTINGS.contactEmail}
                  onChange={(e) => handleInvestorChange('contactEmail', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Resumo da Tese de Negócio</label>
                <textarea
                  rows={3}
                  value={settings.investorInfo?.summary || DEFAULT_INVESTOR_SETTINGS.summary}
                  onChange={(e) => handleInvestorChange('summary', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 text-xs font-display text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none leading-relaxed transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Dados de Investidores</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: 18 PROVÍNCIAS */}
        {activeTab === 'provincias' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900">Cobertura nas 18 Províncias de Angola</h3>
                <p className="text-xs font-display text-slate-500 mt-0.5">Configure clientes ativos e parceiros técnicos por região (/provincias)</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] self-start sm:self-auto"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Guardar Todas as Províncias</span>
              </button>
            </div>

            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-display font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Província</th>
                      <th className="py-3 px-4">Capital</th>
                      <th className="py-3 px-4">Clientes Ativos</th>
                      <th className="py-3 px-4">Parceiros Certificados</th>
                      <th className="py-3 px-4">Status de Atendimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-display">
                    {(settings.provincesCoverage || DEFAULT_PROVINCES).map((prov) => (
                      <tr key={prov.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{prov.name}</td>
                        <td className="py-2.5 px-4 text-slate-500">{prov.capital}</td>
                        <td className="py-2.5 px-4">
                          <input
                            type="number"
                            value={prov.activeClients}
                            onChange={(e) => handleProvinceChange(prov.id, 'activeClients', parseInt(e.target.value) || 0)}
                            className="w-24 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 font-mono-num font-bold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="number"
                            value={prov.certifiedPartners}
                            onChange={(e) => handleProvinceChange(prov.id, 'certifiedPartners', parseInt(e.target.value) || 0)}
                            className="w-24 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 font-mono-num font-semibold text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={prov.status}
                            onChange={(e) => handleProvinceChange(prov.id, 'status', e.target.value as any)}
                            className="bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 font-display font-semibold text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Em Expansão">Em Expansão</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Configurações das 18 Províncias</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: CONTACTOS & WHATSAPP */}
        {activeTab === 'contactos' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4">
              <h3 className="text-base font-display font-bold text-slate-900">Contactos Oficiais, Horários & Linhas de Atendimento</h3>
              <p className="text-xs font-display text-slate-500 mt-0.5">Configuração de números de WhatsApp, linhas de suporte, horários e emails de contacto do site</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-display">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Telefone / WhatsApp Principal</label>
                <input
                  type="text"
                  value={settings.phoneDisplay}
                  onChange={(e) => handleChange('phoneDisplay', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="+244 923 456 789"
                />
                <p className="text-[11px] text-slate-400">O link do WhatsApp gerado automaticamente será: <code className="font-mono-num text-slate-600 font-semibold">https://wa.me/{settings.phoneDisplay.replace(/\D/g, '')}</code></p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Linha Comercial / Telefone Secundário</label>
                <input
                  type="text"
                  value={settings.phoneCommercial || ''}
                  onChange={(e) => handleChange('phoneCommercial', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="+244 923 111 222"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Horário de Atendimento Principal</label>
                <input
                  type="text"
                  value={settings.supportHours || ''}
                  onChange={(e) => handleChange('supportHours', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Segunda a Sábado: 08h00 – 19h00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Horário de Plantão / Fins de Semana</label>
                <input
                  type="text"
                  value={settings.supportHoursSunday || ''}
                  onChange={(e) => handleChange('supportHoursSunday', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Domingos e Feriados: Plantão para Urgências"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Email Comercial / Vendas</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="comercial@kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Email de Suporte Técnico & Fiscal</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="suporte@kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Email de Parcerias & Revendedores</label>
                <input
                  type="email"
                  value={settings.partnerEmail || ''}
                  onChange={(e) => handleChange('partnerEmail', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="parceiros@kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Página do Instagram</label>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="https://instagram.com/kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Página do Facebook</label>
                <input
                  type="text"
                  value={settings.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="https://facebook.com/kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">LinkedIn Corporativo</label>
                <input
                  type="text"
                  value={settings.linkedinUrl || ''}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="https://linkedin.com/company/kivora"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Contactos</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: LINKS, GITHUB & DOWNLOAD */}
        {activeTab === 'links' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4">
              <h3 className="text-base font-display font-bold text-slate-900">Links Externos, Repositório GitHub & Setup Windows</h3>
              <p className="text-xs font-display text-slate-500 mt-0.5">Configure o link do GitHub e a URL direta para descarregar o instalador desktop (.exe)</p>
            </div>

            {/* Dica Informativa GitHub & Download */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700 space-y-1 font-display">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-slate-600" />
                <span>Compatibilidade Total com GitHub Releases & Arquivos Raw</span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pode colar links do GitHub (ex: <code className="font-mono-num font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">.../blob/main/setup.exe</code>), Google Drive ou VPS. O Kivora converte automaticamente URLs do GitHub Blob para <strong className="text-slate-900">download direto de ficheiro binário</strong> sem abrir a página HTML de código.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-display">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                    Link do Repositório no GitHub
                  </span>
                  {settings.githubUrl && (
                    <a
                      href={settings.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-800 hover:text-slate-950 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <span>Abrir Repositório</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </label>
                <input
                  type="text"
                  value={settings.githubUrl}
                  onChange={(e) => handleChange('githubUrl', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="https://github.com/marcosdc20/kivora-setup-vers-o"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    Link de Download Direto do Instalador (.exe / .msi)
                  </label>
                  {settings.downloadUrl && (
                    <a
                      href={getDirectDownloadUrl(settings.downloadUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-display font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition-all cursor-pointer"
                      title="Testar se o ficheiro .exe descarrega diretamente no navegador"
                    >
                      <Download className="w-3 h-3" />
                      <span>Testar Download Direto</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={settings.downloadUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange('downloadUrl', val);
                  }}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="https://github.com/marcosdc20/kivora-setup-vers-o/raw/main/KIVORA_1.1.0_x64-setup.exe"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>URL direta convertida: <code className="text-slate-600 font-mono-num font-semibold">{getDirectDownloadUrl(settings.downloadUrl) || 'Nenhuma'}</code></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Versão do Executável Windows</label>
                <input
                  type="text"
                  value={settings.releaseVersion}
                  onChange={(e) => handleChange('releaseVersion', e.target.value.replace(/^v+/i, ''))}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="1.1.0"
                />
                <span className="text-[11px] text-slate-400">Exibido no site como: v{settings.releaseVersion || '1.1.0'}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Tamanho do Arquivo (.exe)</label>
                <input
                  type="text"
                  value={settings.fileSize || ''}
                  onChange={(e) => handleChange('fileSize', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="78.4 MB"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Data de Lançamento da Versão</label>
                <input
                  type="text"
                  value={settings.releaseDate}
                  onChange={(e) => handleChange('releaseDate', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="19 de Agosto de 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Chave de Demonstração / Avaliação</label>
                <input
                  type="text"
                  value={settings.demoKey || ''}
                  onChange={(e) => handleChange('demoKey', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="KVRA-DEMO-2026-TRIAL"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Assinatura Digital SHA-256 (Checksum)</label>
                <input
                  type="text"
                  value={settings.sha256Checksum || ''}
                  onChange={(e) => handleChange('sha256Checksum', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num text-[11px] text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                />
              </div>

              <div className="md:col-span-2 pt-3 border-t border-slate-200/70">
                <h4 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Requisitos Mínimos do Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Sistema Operativo</label>
                    <input
                      type="text"
                      value={settings.minOs || ''}
                      onChange={(e) => handleChange('minOs', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-display text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Windows 10 / 11 (64-bit)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Memória RAM</label>
                    <input
                      type="text"
                      value={settings.minRam || ''}
                      onChange={(e) => handleChange('minRam', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-display text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="4 GB RAM (Recomendado 8 GB)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Espaço em Disco</label>
                    <input
                      type="text"
                      value={settings.minStorage || ''}
                      onChange={(e) => handleChange('minStorage', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-display text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="2 GB livres em SSD (+ base de dados)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Processador (CPU)</label>
                    <input
                      type="text"
                      value={settings.minCpu || ''}
                      onChange={(e) => handleChange('minCpu', e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-display text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Intel Core i3 / AMD Ryzen 3 ou superior"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2 pt-3 border-t border-slate-200/70">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Notas da Versão / Novidades (Changelog)</label>
                <textarea
                  rows={4}
                  value={settings.releaseNotes || ''}
                  onChange={(e) => handleChange('releaseNotes', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 text-xs font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none leading-relaxed transition-all placeholder:text-slate-400"
                  placeholder="• Motor de faturação certificado em conformidade com a AGT&#10;• Base de dados 100% local com funcionamento sem internet"
                />
                <span className="text-[11px] text-slate-400">Escreva um item por linha para formatar os tópicos no site.</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Links & Versão</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: CONTAS BANCÁRIAS (IBANs) */}
        {activeTab === 'bancos' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-700" />
                  <span>Coordenadas Bancárias Oficiais (2 Contas Configuráveis)</span>
                </h3>
                <p className="text-xs font-display text-slate-500 mt-0.5">
                  Configure os nomes dos bancos, números de conta, IBANs e titular exibidos no Portal do Parceiro, depósitos de carteira, faturas e candidaturas.
                </p>
              </div>
              <span className="text-[11px] font-display font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                Sincronização Ativa em 2 Vias
              </span>
            </div>

            {/* Titular e NIF */}
            <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/70 space-y-3.5">
              <span className="text-xs font-display font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Titular Oficial das Contas Bancárias</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-display">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Nome do Titular / Beneficiário *</label>
                  <input
                    type="text"
                    required
                    value={settings.ibanTitular || ''}
                    onChange={(e) => handleChange('ibanTitular', e.target.value)}
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="VISUAL SOFTWARE LIMITADA"
                  />
                  <p className="text-[11px] text-slate-400">Nome exibido como destinatário da transferência ou depósito.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">NIF da Empresa Titular</label>
                  <input
                    type="text"
                    value={settings.ibanTitularNif || ''}
                    onChange={(e) => handleChange('ibanTitularNif', e.target.value)}
                    className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="5002863944"
                  />
                  <p className="text-[11px] text-slate-400">Identificação fiscal da entidade emissora.</p>
                </div>
              </div>
            </div>

            {/* Contas 1 e 2 em Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-display">
              
              {/* CONTA 1 */}
              <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-display font-bold text-slate-900 uppercase text-xs">Conta Bancária 1 (Principal)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">Ativa</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Nome da Instituição Bancária 1 *</label>
                  <input
                    type="text"
                    required
                    value={settings.bank1Name || ''}
                    onChange={(e) => handleChange('bank1Name', e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ex: Banco BAI (Banco Angolano de Investimentos)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">IBAN da Conta 1 *</label>
                  <input
                    type="text"
                    required
                    value={settings.ibanBai || ''}
                    onChange={(e) => handleChange('ibanBai', e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="AO06 0040 0000 1234 5678 9012 3"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Número de Conta / Referência 1 (Opcional)</label>
                  <input
                    type="text"
                    value={settings.bank1Account || ''}
                    onChange={(e) => handleChange('bank1Account', e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-slate-800 font-mono-num text-xs focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="0040.0000.1234.5678.9012.3"
                  />
                </div>
              </div>

              {/* CONTA 2 */}
              <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="font-display font-bold text-slate-900 uppercase text-xs">Conta Bancária 2 (Alternativa)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">Ativa</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Nome da Instituição Bancária 2 *</label>
                  <input
                    type="text"
                    required
                    value={settings.bank2Name || ''}
                    onChange={(e) => handleChange('bank2Name', e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ex: Banco BFA (Banco de Fomento Angola)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">IBAN da Conta 2 *</label>
                  <input
                    type="text"
                    required
                    value={settings.ibanBfa || ''}
                    onChange={(e) => handleChange('ibanBfa', e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="AO06 0006 0000 9876 5432 1098 7"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Número de Conta / Referência 2 (Opcional)</label>
                  <input
                    type="text"
                    value={settings.bank2Account || ''}
                    onChange={(e) => handleChange('bank2Account', e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-slate-800 font-mono-num text-xs focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="0006.0000.9876.5432.1098.7"
                  />
                </div>
              </div>

            </div>

            {/* Live Preview Box */}
            <div className="p-5 bg-slate-950 text-white rounded-xl border border-slate-800 space-y-3 text-xs font-display">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Pré-visualização Oficial no Portal do Parceiro & Faturas
              </span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <span className="text-slate-300">
                  Titular: <strong className="text-white font-semibold">{settings.ibanTitular || 'VISUAL SOFTWARE LIMITADA'}</strong>
                </span>
                {settings.ibanTitularNif && (
                  <span className="text-slate-400 font-mono-num text-[11px]">
                    NIF: <strong className="text-white">{settings.ibanTitularNif}</strong>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono-num text-[11px]">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-emerald-400 font-semibold block text-[10px] font-display">
                    • {settings.bank1Name || 'Conta Bancária 1'}:
                  </span>
                  <span className="text-white font-bold">
                    {settings.ibanBai ? settings.ibanBai : <span className="text-slate-500 font-normal italic font-display text-xs">(Não configurada)</span>}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-blue-400 font-semibold block text-[10px] font-display">
                    • {settings.bank2Name || 'Conta Bancária 2'}:
                  </span>
                  <span className="text-white font-bold">
                    {settings.ibanBfa ? settings.ibanBfa : <span className="text-slate-500 font-normal italic font-display text-xs">(Não configurada)</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Ambas as Coordenadas Bancárias</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: AGT */}
        {activeTab === 'agt' && (
          <form onSubmit={handleSaveSettings} className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="border-b border-slate-200/70 pb-4">
              <h3 className="text-base font-display font-bold text-slate-900">Parâmetros de Validação Fiscal AGT</h3>
              <p className="text-xs font-display text-slate-500 mt-0.5">Certificado oficial e número de registo emitido pela Administração Geral Tributária</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-display">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Selo de Certificação AGT</label>
                <input
                  type="text"
                  value={settings.agtCertificate}
                  onChange={(e) => handleChange('agtCertificate', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Certificação AGT N.º FE/387/AGT/2026"
                />
                <p className="text-[11px] text-slate-400">Este texto é exibido no topo do portal do cliente e no rodapé do site.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Referência do Decreto Presidencial</label>
                <input
                  type="text"
                  value={settings.agtDecretoRef || ''}
                  onChange={(e) => handleChange('agtDecretoRef', e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-display font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Decreto Presidencial n.º 71/25"
                />
                <p className="text-[11px] text-slate-400">Marco regulatório exibido nas páginas fiscais e rodapé.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Dia Limite de Submissão do SAF-T AO</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={settings.saftSubmissionDeadlineDay ?? 15}
                  onChange={(e) => handleChange('saftSubmissionDeadlineDay', Number(e.target.value))}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 font-mono-num font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="15"
                />
                <p className="text-[11px] text-slate-400">Dia limite do mês subsequente para submissão do XML à AGT.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Parâmetros AGT</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 6: UPDATES OTA */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="surface-card p-6 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold font-display text-slate-900 tracking-tight">Atualizações de Executáveis Windows (OTA)</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Distribuição automatizada para postos de venda e servidores</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Rocket className="w-4 h-4" />
                <span>Publicar Nova Versão</span>
              </button>
            </div>

            <div className="surface-card rounded-2xl border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase font-semibold text-[10px] tracking-wider font-display">
                      <th className="p-4">Versão</th>
                      <th className="p-4">Canal</th>
                      <th className="p-4">Changelog</th>
                      <th className="p-4">Rollout</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {releases.map((rel) => (
                      <tr key={rel.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <span className="font-mono-num font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                            v{rel.version}
                          </span>
                          <p className="font-mono-num text-[10px] text-slate-400 mt-1">{rel.releaseDate}</p>
                        </td>
                        <td className="p-4 font-semibold text-slate-700 uppercase text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full border ${
                            rel.channel === 'stable' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                            rel.channel === 'beta' ? 'bg-purple-50 text-purple-700 border-purple-200/80' : 'bg-rose-50 text-rose-700 border-rose-200/80'
                          }`}>
                            {rel.channel}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs font-sans whitespace-pre-line text-[11px] leading-relaxed">
                          {rel.changelog}
                        </td>
                        <td className="p-4 font-mono-num font-semibold text-slate-800">{rel.rolloutPercentage}%</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            rel.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                            rel.status === 'testing' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                            'bg-rose-50 text-rose-700 border-rose-200/80'
                          }`}>
                            {rel.status === 'published' ? 'Em Produção' : rel.status === 'testing' ? 'Em Testes' : 'Rollback Efetuado'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {rel.status !== 'rollback' && (
                              <button
                                onClick={() => handleRollback(rel)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Rollback"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <a
                              href={rel.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Descarregar"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: BACKUPS NUVEM */}
        {activeTab === 'backups' && (
          <div className="surface-card rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold font-display text-slate-900 tracking-tight">Exportação de Cópias de Segurança (Backups)</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Transfira um instantâneo JSON completo das coleções do Firebase Firestore</p>
              </div>
              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? 'A Exportar...' : 'Descarregar Backup JSON'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-1">
                <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">Último Backup Realizado</p>
                <p className="font-mono-num font-semibold text-slate-800">{lastBackup || 'Nenhum backup recente nesta máquina'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-1">
                <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-display">Proteção dos Dados</p>
                <p className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sincronização Contínua no Firebase Firestore</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ZONA DE PERIGO & MASTER RESET */}
        {activeTab === 'zona-perigo' && (
          <div className="surface-card rounded-2xl border border-rose-200/80 p-6 sm:p-8 space-y-6 animate-fadeIn">
            
            {/* Header de Alerta Máximo */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-rose-950 via-slate-950 to-rose-950 text-white border border-rose-800/60 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold font-display text-white uppercase tracking-wider">
                      Zona de Perigo & Master Reset (SuperAdmin)
                    </h3>
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-full uppercase">
                      Acesso Restrito
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">
                    Permite limpar cirurgicamente dados de teste para iniciar a operação oficial do zero com segurança total.
                  </p>
                </div>
              </div>
            </div>

            {/* Quadro de Dados Protegidos (NUNCA SÃO APAGADOS) */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-semibold font-display text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dados do Núcleo do Sistema Preservados (100% Protegidos contra Limpeza)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-emerald-800 pt-1 font-sans">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Contas de Administrador (<code className="font-mono-num text-[10px]">users</code>)
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Configurações da Empresa & IBANs (<code className="font-mono-num text-[10px]">system_settings</code>)
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Políticas & Quotas de Parceiro (<code className="font-mono-num text-[10px]">settings</code>)
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Tabela Oficial de Preços de Atacado (<code className="font-mono-num text-[10px]">partner_pricing</code>)
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Logs de Auditoria Fiscal AGT (<code className="font-mono-num text-[10px]">audit_logs</code>)
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Backup Automático em JSON antes de apagar
                </div>
              </div>
            </div>

            {/* Relatório de Limpeza Concluída */}
            {purgeReport && (
              <div className="p-5 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <strong className="text-sm font-semibold font-display text-emerald-400">Master Reset Executado com Sucesso!</strong>
                  </div>
                  <span className="font-mono-num text-xs text-slate-400">Total Removido: {purgeReport.totalDeleted} documentos</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(purgeReport.deletedCounts).map(([name, count]) => (
                    <div key={name} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-display">{name}</span>
                      <strong className="font-mono-num text-white text-sm">{count} apagados</strong>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-emerald-300 font-mono-num pt-1">
                  📦 Cópia de segurança gerada: {purgeReport.backupFilename}
                </p>
              </div>
            )}

            {/* Formulário de Seleção e Confirmação */}
            <form onSubmit={handleExecuteMasterReset} className="space-y-6">
              
              {/* Seleção Granular de Coleções */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold font-display text-slate-900 text-xs uppercase tracking-wider">
                      Selecione os Dados Operacionais que Deseja Limpar:
                    </h4>
                    <button
                      type="button"
                      onClick={refreshLiveCounts}
                      disabled={loadingLiveCounts}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-display font-semibold bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      title="Atualizar contagem em tempo real do Firebase"
                    >
                      <RotateCcw className={`w-3 h-3 ${loadingLiveCounts ? 'animate-spin text-slate-900' : ''}`} />
                      <span>{loadingLiveCounts ? 'A verificar...' : 'Atualizar Contagens'}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllPurgeTargets}
                    className="text-xs text-slate-700 hover:text-slate-900 font-display font-semibold cursor-pointer self-start sm:self-auto"
                  >
                    {selectedPurgeTargets.length === PURGE_TARGETS.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PURGE_TARGETS.map((target) => {
                    const isChecked = selectedPurgeTargets.includes(target.id);
                    const count = liveCounts[target.id] ?? 0;
                    return (
                      <div
                        key={target.id}
                        onClick={() => handleTogglePurgeTarget(target.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-rose-50/60 border-rose-300 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200/70 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="mt-0.5 w-4 h-4 accent-rose-600 rounded cursor-pointer pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <strong className="text-xs font-semibold font-display text-slate-900 block">{target.name}</strong>
                              {count > 0 ? (
                                <span className="text-[10px] font-semibold font-mono-num text-rose-700 bg-rose-100/80 border border-rose-200 px-2 py-0.5 rounded-full">
                                  {count} no Firebase
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold font-mono-num text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  0 (Limpo)
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono-num text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/80 shrink-0">
                              /{target.collectionName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-sans">{target.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Protocolo de Confirmação & Segurança */}
              <div className="p-5 rounded-xl bg-rose-50/40 border border-rose-200/80 space-y-4 text-xs">
                <h4 className="font-semibold font-display text-rose-950 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Protocolo de Confirmação Obrigatório</span>
                </h4>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="font-semibold text-slate-700 block font-display text-[11px] uppercase tracking-wider">
                        1. Digite a frase de confirmação exata: <span className="font-mono-num text-rose-600 font-bold select-all">CONFIRMO LIMPAR DADOS KIVORA</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setPurgeConfirmationPhrase('CONFIRMO LIMPAR DADOS KIVORA')}
                        className="text-[10px] font-semibold text-rose-800 bg-rose-100/80 hover:bg-rose-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        ✓ Preencher Frase
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="CONFIRMO LIMPAR DADOS KIVORA"
                      value={purgeConfirmationPhrase}
                      onChange={(e) => setPurgeConfirmationPhrase(e.target.value)}
                      className="w-full bg-white border border-rose-300 rounded-xl px-4 py-2.5 font-mono-num font-semibold text-slate-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-600/10 outline-none uppercase transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="font-semibold text-slate-700 block font-display text-[11px] uppercase tracking-wider">
                        2. Palavra-passe de Administrador:
                      </label>
                      <span className="text-[10px] text-slate-500 font-sans">
                        (Palavra-passe pessoal de admin ou chave master)
                      </span>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={purgeAdminPassword}
                      onChange={(e) => setPurgeAdminPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200/80 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 rounded-xl px-4 py-2.5 font-display text-slate-900 outline-none transition-all"
                    />
                  </div>

                  <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={purgeConsentChecked}
                      onChange={(e) => setPurgeConsentChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-700 leading-relaxed font-sans">
                      Estou ciente de que esta ação apagará as <strong>{selectedPurgeTargets.length}</strong> coleções operacionais selecionadas para que o sistema possa ser utilizado do zero. Um arquivo de backup JSON será descarregado automaticamente no meu computador antes da exclusão.
                    </span>
                  </label>
                </div>

                {purgeError && (
                  <div className="p-3 bg-rose-100/80 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{purgeError}</span>
                  </div>
                )}

                {isPurging && (
                  <div className="p-4 bg-white rounded-xl border border-rose-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-2 font-display">
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        <span>{purgeProgressText}</span>
                      </span>
                      <span className="font-mono-num text-rose-600">{purgeProgressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${purgeProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isPurging || selectedPurgeTargets.length === 0 || !purgeConsentChecked || purgeConfirmationPhrase.trim() !== 'CONFIRMO LIMPAR DADOS KIVORA'}
                    className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-display font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    {isPurging ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A Executar Master Reset...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Executar Master Reset ({selectedPurgeTargets.length} Selecionadas)</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </form>

          </div>
        )}

      </div>

      {/* OTA Publish Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                  <Rocket className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold font-display text-slate-900 tracking-tight">Publicar Nova Versão OTA</h3>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishRelease} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 font-display text-[11px] uppercase tracking-wider">Versão (Sem 'v')</label>
                  <input
                    type="text"
                    required
                    placeholder="1.2.0"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 font-mono-num font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 font-display text-[11px] uppercase tracking-wider">Canal de Lançamento</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 font-display font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                  >
                    <option value="stable">Estável (Produção)</option>
                    <option value="beta">Beta (Testes)</option>
                    <option value="hotfix">Hotfix Crítico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 font-display text-[11px] uppercase tracking-wider">Percentagem de Rollout</label>
                  <span className="font-mono-num font-semibold text-slate-900 text-xs">{newRollout}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={newRollout}
                  onChange={(e) => setNewRollout(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 font-display text-[11px] uppercase tracking-wider">Changelog & Novidades</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva as correções fiscais ou melhorias do executável..."
                  value={newChangelog}
                  onChange={(e) => setNewChangelog(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 resize-none font-sans text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={newMandatory}
                  onChange={(e) => setNewMandatory(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 accent-slate-900"
                />
                <label htmlFor="mandatory" className="font-medium text-slate-700 font-sans text-xs">
                  Atualização Obrigatória (Bloqueia versões antigas)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-display font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-950 hover:bg-slate-800 text-white font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Release</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

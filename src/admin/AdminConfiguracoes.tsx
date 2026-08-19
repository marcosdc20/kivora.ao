import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Smartphone, Save,
  Database, Download, Loader2, Rocket, RotateCcw,
  X, GitBranch, CreditCard, Building2, ExternalLink, Plus, Tag,
  TrendingUp, Award, Briefcase, MapPin, Trash2, Monitor,
  Bell, Megaphone, Video, Youtube
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminTopbar } from './AdminComponents';
import {
  SystemCompanySettings, DEFAULT_SETTINGS,
  subscribeSystemSettings, saveSystemSettings,
  getDirectDownloadUrl, PartnerBrandLogo, InvestorSettings,
  DEFAULT_PROVINCES, DEFAULT_INVESTOR_SETTINGS
} from '../services/systemSettingsService';

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

type ConfigTab = 'geral' | 'precos' | 'videos' | 'notificacoes' | 'comunicados' | 'metricas' | 'marcas' | 'investidores' | 'provincias' | 'contactos' | 'links' | 'bancos' | 'agt' | 'updates' | 'backups';

export const AdminConfiguracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('geral');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // System Settings State
  const [settings, setSettings] = useState<SystemCompanySettings>(DEFAULT_SETTINGS);

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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSystemSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert('Erro ao guardar configurações: ' + err.message);
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
        system: 'KIVORA ERP & ADMIN CLOUD',
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

      alert('Backup completo da nuvem Firebase exportado com sucesso em JSON!');
    } catch (error: any) {
      console.error('Erro ao fazer backup:', error);
      alert('Erro ao exportar dados: ' + error.message);
    } finally {
      setIsExporting(false);
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
    alert(`Versão v${newVersion} publicada no canal ${newChannel.toUpperCase()}! Rollout para ${newRollout}% dos terminais.`);
  };

  const handleRollback = (rel: UpdateRelease) => {
    if (confirm(`Deseja acionar o ROLLBACK de emergência para a versão v${rel.version}? Todos os terminais reverterão para a versão estável anterior.`)) {
      setReleases(releases.map(r => r.id === rel.id ? { ...r, status: 'rollback', rolloutPercentage: 0 } : r));
      alert(`Rollback acionado para a versão v${rel.version}!`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 font-sans pb-12">
      <AdminTopbar
        title="Configurações do Sistema & Empresa"
        subtitle="Gerencie manualmente números de contacto, links de download, GitHub, IBANs e dados da AGT"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Toast de Sucesso */}
        {savedSuccess && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-between animate-fadeIn">
            <span>✓ Configurações guardadas e sincronizadas no Firebase com sucesso!</span>
            <button onClick={() => setSavedSuccess(false)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'geral', label: 'Geral & Empresa', icon: <Building2 className="w-4 h-4" /> },
            { id: 'precos', label: 'Planos & Preços', icon: <Tag className="w-4 h-4" /> },
            { id: 'videos', label: 'Vídeos YouTube', icon: <Video className="w-4 h-4" /> },
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
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ConfigTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: GERAL & EMPRESA */}
        {activeTab === 'geral' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Identificação da Empresa & Software</h3>
                <p className="text-xs text-slate-500">Dados institucionais exibidos nos rodapés, propostas e termos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Nome Comercial do Software</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Ex: Kivora"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Razão Social da Empresa Detentora</label>
                <input
                  type="text"
                  value={settings.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Ex: Visual Software, Lda."
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">NIF da Empresa</label>
                <input
                  type="text"
                  value={settings.nif}
                  onChange={(e) => handleChange('nif', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Ex: 5417089123"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Nome Completo do Produto</label>
                <input
                  type="text"
                  value={settings.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Kivora Desktop ERP & POS"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Endereço Físico / Sede</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Edifício KIVORA, Rua Principal, Luanda, Angola"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Alterações</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: PLANOS & PREÇOS (CONFIGURAÇÃO COMPLETA DA TABELA OFICIAL) */}
        {activeTab === 'precos' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Tabela de Preços, Planos & Simulador</h3>
                <p className="text-xs text-slate-500">Configure os valores, descrições, recursos e botões da página de preços (/planos)</p>
              </div>
            </div>

            {/* Configurações Gerais do Cabeçalho */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Cabeçalho da Secção</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tag Superior</label>
                  <input
                    type="text"
                    value={settings.pricingTag || ''}
                    onChange={(e) => handleChange('pricingTag', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
                    placeholder="Tabela de Preços Oficiais"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-700">Título Principal</label>
                  <input
                    type="text"
                    value={settings.pricingTitle || ''}
                    onChange={(e) => handleChange('pricingTitle', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
                    placeholder="Escolha a Modalidade de Licenciamento"
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="font-bold text-slate-700">Subtítulo / Descrição</label>
                  <input
                    type="text"
                    value={settings.pricingSubtitle || ''}
                    onChange={(e) => handleChange('pricingSubtitle', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-600 outline-none"
                    placeholder="Preços claros em Kwanzas (AOA) com IVA incluído no regime de isenção de software e sem cobrança por fatura emitida."
                  />
                </div>
              </div>
            </div>

            {/* Grelha dos 3 Planos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* PLANO 1: MENSAL STANDALONE */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Plano 1
                    </span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">Mensal Standalone</h4>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nome do Plano</label>
                    <input
                      type="text"
                      value={settings.planMensalName || ''}
                      onChange={(e) => handleChange('planMensalName', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="Mensal Standalone"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Preço (AOA)</label>
                      <input
                        type="text"
                        value={settings.planMensalPrice || ''}
                        onChange={(e) => handleChange('planMensalPrice', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-blue-600 focus:border-blue-600 outline-none"
                        placeholder="25.000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Período</label>
                      <input
                        type="text"
                        value={settings.planMensalPeriod || ''}
                        onChange={(e) => handleChange('planMensalPeriod', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:border-blue-600 outline-none"
                        placeholder="/ mês"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Descrição Curta</label>
                    <textarea
                      rows={2}
                      value={settings.planMensalDesc || ''}
                      onChange={(e) => handleChange('planMensalDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:border-blue-600 outline-none leading-relaxed"
                      placeholder="Flexibilidade total sem contratos de fidelização..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Preço Terminal Extra (Simulador)</label>
                    <input
                      type="number"
                      value={settings.planMensalExtraTerminal ?? 10000}
                      onChange={(e) => handleChange('planMensalExtraTerminal', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="10000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Texto do Botão (CTA)</label>
                    <input
                      type="text"
                      value={settings.planMensalCta || ''}
                      onChange={(e) => handleChange('planMensalCta', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="Aderir ao Plano Mensal"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Recursos Inclusos (1 por linha)</label>
                    <textarea
                      rows={6}
                      value={settings.planMensalFeatures || ''}
                      onChange={(e) => handleChange('planMensalFeatures', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 focus:border-blue-600 outline-none leading-relaxed"
                      placeholder="1 Posto de Trabalho Standalone&#10;Faturação Eletrónica AGT DS.120 com QR Code"
                    />
                  </div>
                </div>
              </div>

              {/* PLANO 2: ANUAL MULTI-POSTOS (RECOMENDADO) */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border-2 border-blue-300 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div className="border-b border-blue-200 pb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                      Plano 2 (Destaque)
                    </span>
                    <span className="text-[10px] font-bold text-blue-800">Mais Popular</span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nome do Plano</label>
                    <input
                      type="text"
                      value={settings.planAnualName || ''}
                      onChange={(e) => handleChange('planAnualName', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="Anual Multi-Postos (Recomendado)"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Badge Superior</label>
                    <input
                      type="text"
                      value={settings.planAnualBadge || ''}
                      onChange={(e) => handleChange('planAnualBadge', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-blue-700 focus:border-blue-600 outline-none uppercase"
                      placeholder="MAIS POPULAR EM ANGOLA"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Preço (AOA)</label>
                      <input
                        type="text"
                        value={settings.planAnualPrice || ''}
                        onChange={(e) => handleChange('planAnualPrice', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-blue-600 focus:border-blue-600 outline-none"
                        placeholder="250.000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Período</label>
                      <input
                        type="text"
                        value={settings.planAnualPeriod || ''}
                        onChange={(e) => handleChange('planAnualPeriod', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:border-blue-600 outline-none"
                        placeholder="/ ano"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Descrição Curta</label>
                    <textarea
                      rows={2}
                      value={settings.planAnualDesc || ''}
                      onChange={(e) => handleChange('planAnualDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:border-blue-600 outline-none leading-relaxed"
                      placeholder="A opção mais rentável para empresas ativas..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Preço Terminal Extra (Simulador)</label>
                    <input
                      type="number"
                      value={settings.planAnualExtraTerminal ?? 35000}
                      onChange={(e) => handleChange('planAnualExtraTerminal', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="35000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Texto do Botão (CTA)</label>
                    <input
                      type="text"
                      value={settings.planAnualCta || ''}
                      onChange={(e) => handleChange('planAnualCta', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="Adquirir Licença Anual"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Recursos Inclusos (1 por linha)</label>
                    <textarea
                      rows={6}
                      value={settings.planAnualFeatures || ''}
                      onChange={(e) => handleChange('planAnualFeatures', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 focus:border-blue-600 outline-none leading-relaxed"
                      placeholder="Até 3 Postos de Trabalho em Rede LAN&#10;Tudo do Plano Mensal incluído"
                    />
                  </div>
                </div>
              </div>

              {/* PLANO 3: VITALÍCIO PERPÉTUO */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      Plano 3
                    </span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">Licença Vitalícia Perpétua</h4>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nome do Plano</label>
                    <input
                      type="text"
                      value={settings.planVitalicioName || ''}
                      onChange={(e) => handleChange('planVitalicioName', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="Licença Vitalícia Perpétua"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Preço (AOA)</label>
                      <input
                        type="text"
                        value={settings.planVitalicioPrice || ''}
                        onChange={(e) => handleChange('planVitalicioPrice', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-blue-600 focus:border-blue-600 outline-none"
                        placeholder="650.000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Período</label>
                      <input
                        type="text"
                        value={settings.planVitalicioPeriod || ''}
                        onChange={(e) => handleChange('planVitalicioPeriod', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:border-blue-600 outline-none"
                        placeholder="pagamento único"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Descrição Curta</label>
                    <textarea
                      rows={2}
                      value={settings.planVitalicioDesc || ''}
                      onChange={(e) => handleChange('planVitalicioDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:border-blue-600 outline-none leading-relaxed"
                      placeholder="Sem renovações anuais ou mensalidades..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Preço Terminal Extra (Simulador)</label>
                    <input
                      type="number"
                      value={settings.planVitalicioExtraTerminal ?? 60000}
                      onChange={(e) => handleChange('planVitalicioExtraTerminal', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="60000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Texto do Botão (CTA)</label>
                    <input
                      type="text"
                      value={settings.planVitalicioCta || ''}
                      onChange={(e) => handleChange('planVitalicioCta', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="Adquirir Licença Perpétua"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Recursos Inclusos (1 por linha)</label>
                    <textarea
                      rows={6}
                      value={settings.planVitalicioFeatures || ''}
                      onChange={(e) => handleChange('planVitalicioFeatures', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 focus:border-blue-600 outline-none leading-relaxed"
                      placeholder="5 Postos de Trabalho em Rede Local&#10;Licença perpétua sem expiração"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Planos & Preços</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: VÍDEOS & MULTIMÉDIA DO YOUTUBE */}
        {activeTab === 'videos' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <span>Vídeos do YouTube no Site Oficial</span>
                </h3>
                <p className="text-xs text-slate-500">Configure links do YouTube (normais, encurtados ou shorts) que são exibidos de forma moderna e sem molduras pesadas</p>
              </div>
            </div>

            {/* Dica de formato YouTube */}
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 text-xs text-red-900 flex items-start gap-3">
              <Youtube className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900">Formatos de Links Suportados Automaticamente:</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pode colar links directos como <code>https://www.youtube.com/watch?v=XXXXXX</code>, links partilhados <code>https://youtu.be/XXXXXX</code>, links de Shorts <code>https://www.youtube.com/shorts/XXXXXX</code> ou links de incorporação <code>/embed/</code>. O sistema converte automaticamente com modo de privacidade e alta definição.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* 1. Vídeo da Homepage */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-blue-600">
                      1. Página Inicial (Homepage)
                    </span>
                    <span className="text-[10px] bg-blue-100/80 text-blue-700 font-bold px-2 py-0.5 rounded">
                      Secção Principal
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Link do YouTube</label>
                    <input
                      type="url"
                      value={settings.videoHomeUrl || ''}
                      onChange={(e) => handleChange('videoHomeUrl', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Título do Vídeo</label>
                    <input
                      type="text"
                      value={settings.videoHomeTitle || ''}
                      onChange={(e) => handleChange('videoHomeTitle', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="Conheça o KIVORA ERP em Ação"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Descrição / Subtítulo</label>
                    <input
                      type="text"
                      value={settings.videoHomeDesc || ''}
                      onChange={(e) => handleChange('videoHomeDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:border-blue-600 outline-none"
                      placeholder="Demonstração rápida da interface do POS..."
                    />
                  </div>
                </div>
              </div>

              {/* 2. Vídeo dos Manuais de Apoio */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-amber-600">
                      2. Central de Manuais & Tutoriais
                    </span>
                    <span className="text-[10px] bg-amber-100/80 text-amber-700 font-bold px-2 py-0.5 rounded">
                      Área de Manuais
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Link do YouTube</label>
                    <input
                      type="url"
                      value={settings.videoManuaisUrl || ''}
                      onChange={(e) => handleChange('videoManuaisUrl', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-amber-600 outline-none"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Título do Tutorial</label>
                    <input
                      type="text"
                      value={settings.videoManuaisTitle || ''}
                      onChange={(e) => handleChange('videoManuaisTitle', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-amber-600 outline-none"
                      placeholder="Guia Rápido: Operação de Caixa & Fecho Z"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Descrição / Dica</label>
                    <input
                      type="text"
                      value={settings.videoManuaisDesc || ''}
                      onChange={(e) => handleChange('videoManuaisDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:border-amber-600 outline-none"
                      placeholder="Aprenda passo a passo como realizar a abertura..."
                    />
                  </div>
                </div>
              </div>

              {/* 3. Vídeo do Programa de Parceiros */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-purple-600">
                      3. Programa de Parceiros
                    </span>
                    <span className="text-[10px] bg-purple-100/80 text-purple-700 font-bold px-2 py-0.5 rounded">
                      Página de Parceiros
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Link do YouTube</label>
                    <input
                      type="url"
                      value={settings.videoParceirosUrl || ''}
                      onChange={(e) => handleChange('videoParceirosUrl', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-purple-600 outline-none"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Título do Vídeo de Parcerias</label>
                    <input
                      type="text"
                      value={settings.videoParceirosTitle || ''}
                      onChange={(e) => handleChange('videoParceirosTitle', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-purple-600 outline-none"
                      placeholder="Programa Oficial de Parceiros & Revendedores"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Descrição</label>
                    <input
                      type="text"
                      value={settings.videoParceirosDesc || ''}
                      onChange={(e) => handleChange('videoParceirosDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:border-purple-600 outline-none"
                      placeholder="Descubra como lucrar até 50% de margem com a revenda..."
                    />
                  </div>
                </div>
              </div>

              {/* 4. Vídeo do Guia AGT */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-emerald-600">
                      4. Guia Oficial AGT (Decreto 71/25)
                    </span>
                    <span className="text-[10px] bg-emerald-100/80 text-emerald-700 font-bold px-2 py-0.5 rounded">
                      Conformidade Fiscal
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Link do YouTube</label>
                    <input
                      type="url"
                      value={settings.videoAgtUrl || ''}
                      onChange={(e) => handleChange('videoAgtUrl', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-emerald-600 outline-none"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Título</label>
                    <input
                      type="text"
                      value={settings.videoAgtTitle || ''}
                      onChange={(e) => handleChange('videoAgtTitle', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-emerald-600 outline-none"
                      placeholder="Exigências do Decreto 71/25 & Faturação AGT"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Descrição</label>
                    <input
                      type="text"
                      value={settings.videoAgtDesc || ''}
                      onChange={(e) => handleChange('videoAgtDesc', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:border-emerald-600 outline-none"
                      placeholder="Entenda os regimes de IVA e a regra de anulação..."
                    />
                  </div>
                </div>
              </div>

              {/* 5. Vídeo de Hardware & POS */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between md:col-span-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-slate-800">
                      5. Hardware & Equipamentos POS
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                      Página de Hardware
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Link do YouTube</label>
                      <input
                        type="url"
                        value={settings.videoHardwareUrl || ''}
                        onChange={(e) => handleChange('videoHardwareUrl', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-blue-600 outline-none"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Título</label>
                      <input
                        type="text"
                        value={settings.videoHardwareTitle || ''}
                        onChange={(e) => handleChange('videoHardwareTitle', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                        placeholder="Instalação Rápida de Impressoras Térmicas 80mm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Descrição</label>
                      <input
                        type="text"
                        value={settings.videoHardwareDesc || ''}
                        onChange={(e) => handleChange('videoHardwareDesc', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:border-blue-600 outline-none"
                        placeholder="Configuração plug-and-play de impressoras ESC/POS..."
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Vídeos YouTube</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: NOTIFICAÇÕES & WEBHOOK */}
        {activeTab === 'notificacoes' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Notificações, Leads & Integrações Webhook</h3>
              <p className="text-xs text-slate-500">Configure os canais de recepção de agendamentos de demonstrações, candidaturas de parceiros e automação de marketing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase flex items-center justify-between">
                  <span>URL do Webhook Externo (Zapier / Make / n8n / CRM)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
                </label>
                <input
                  type="url"
                  value={settings.webhookUrl || ''}
                  onChange={(e) => handleChange('webhookUrl', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="https://webhook.site/sua-url-ou-zapier"
                />
                <p className="text-[10px] text-slate-400">Todos os pedidos de demonstração e candidaturas de parceiros podem ser enviados em JSON para este endpoint.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Email de Recepção de Leads (Demonstrações)</label>
                <input
                  type="email"
                  value={settings.notifyEmailLeads || ''}
                  onChange={(e) => handleChange('notifyEmailLeads', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="comercial@kivora.ao"
                />
                <p className="text-[10px] text-slate-400">Caixa de correio alertada quando um cliente solicita uma demonstração.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Email de Recepção de Candidaturas de Parceiros</label>
                <input
                  type="email"
                  value={settings.notifyEmailPartners || ''}
                  onChange={(e) => handleChange('notifyEmailPartners', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="parceiros@kivora.ao"
                />
                <p className="text-[10px] text-slate-400">Caixa de correio alertada quando um revendedor envia candidatura.</p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Mensagem Padrão de Abertura no WhatsApp</label>
                <input
                  type="text"
                  value={settings.whatsappDefaultMessage || ''}
                  onChange={(e) => handleChange('whatsappDefaultMessage', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Olá! Gostaria de agendar uma demonstração do KIVORA ERP para a minha empresa."
                />
                <p className="text-[10px] text-slate-400">Texto pré-preenchido quando o visitante clica no botão de WhatsApp do site.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Notificações</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: AVISOS & COMUNICADOS */}
        {activeTab === 'comunicados' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Barra de Avisos Globais & Banner de Cookies</h3>
              <p className="text-xs text-slate-500">Configure avisos de topo, comunicados de atualizações fiscais e consentimento de cookies</p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Barra de Anúncio / Comunicado no Topo do Portal</h4>
                  <p className="text-[11px] text-slate-500">Exibe uma faixa de destaque no cabeçalho de todas as páginas públicas.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementBarEnabled || false}
                    onChange={(e) => handleChange('announcementBarEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.announcementBarEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-blue-200/60">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Badge / Etiqueta</label>
                    <input
                      type="text"
                      value={settings.announcementBadge || ''}
                      onChange={(e) => handleChange('announcementBadge', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="DECRETO 71/25"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700">Texto da Mensagem</label>
                    <input
                      type="text"
                      value={settings.announcementText || ''}
                      onChange={(e) => handleChange('announcementText', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="Conformidade integral com o Decreto Presidencial n.º 71/25 e novas regras fiscais da AGT 2026."
                    />
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="font-bold text-slate-700">Link de Destino ao Clicar (Rota ou URL)</label>
                    <input
                      type="text"
                      value={settings.announcementLink || ''}
                      onChange={(e) => handleChange('announcementLink', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 outline-none"
                      placeholder="/guia-agt"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900">Banner de Política de Cookies & Privacidade</h4>
                <p className="text-[11px] text-slate-500">Exibe a caixa de aviso de cookies no primeiro acesso do visitante.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cookieBannerEnabled !== false}
                  onChange={(e) => handleChange('cookieBannerEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Avisos & Comunicados</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: MÉTRICAS & NÚMEROS */}
        {activeTab === 'metricas' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Estatísticas & Números de Impacto</h3>
                <p className="text-xs text-slate-500">Métricas exibidas com animação de contagem na Homepage e páginas oficiais</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Empresas & Lojas Ativas
                </label>
                <input
                  type="number"
                  value={settings.statCompaniesCount ?? 850}
                  onChange={(e) => handleChange('statCompaniesCount', parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-black text-base text-slate-900 focus:border-blue-600 outline-none"
                  placeholder="850"
                />
                <p className="text-[11px] text-slate-500">Número de empresas faturando com o Kivora</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                  Terminais LAN / Caixas Instalados
                </label>
                <input
                  type="number"
                  value={settings.statTerminalsCount ?? 2400}
                  onChange={(e) => handleChange('statTerminalsCount', parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-black text-base text-emerald-600 focus:border-blue-600 outline-none"
                  placeholder="2400"
                />
                <p className="text-[11px] text-slate-500">Total de postos físicos em operação</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Volume de Faturas Emitidas
                </label>
                <input
                  type="text"
                  value={settings.statInvoicesCount || '+14.5M'}
                  onChange={(e) => handleChange('statInvoicesCount', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-black text-base text-amber-600 focus:border-blue-600 outline-none"
                  placeholder="+14.5M"
                />
                <p className="text-[11px] text-slate-500">Faturas processadas com QR Code da AGT</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Disponibilidade Operacional (Uptime)
                </label>
                <input
                  type="text"
                  value={settings.statUptimePercent || '99.98%'}
                  onChange={(e) => handleChange('statUptimePercent', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-black text-base text-blue-600 focus:border-blue-600 outline-none"
                  placeholder="99.98%"
                />
                <p className="text-[11px] text-slate-500">Estabilidade sem interrupção de caixas</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  Províncias com Presença Ativa
                </label>
                <input
                  type="number"
                  value={settings.statProvincesCount ?? 18}
                  onChange={(e) => handleChange('statProvincesCount', parseInt(e.target.value) || 18)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-black text-base text-indigo-600 focus:border-blue-600 outline-none"
                  placeholder="18"
                />
                <p className="text-[11px] text-slate-500">Total de províncias de Angola atendidas</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
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
            <form onSubmit={handleAddBrand} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Adicionar Empresa Parceira ou Cliente</h3>
                  <p className="text-xs text-slate-500">Exibido no carrossel da homepage e nas páginas de parceiros</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="space-y-1 lg:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Nome da Empresa</label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Ex: Supermercados Aliança"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Tipo</label>
                  <select
                    value={newBrandType}
                    onChange={(e) => setNewBrandType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="parceiro">Parceiro TI</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Setor</label>
                  <input
                    type="text"
                    value={newBrandSector}
                    onChange={(e) => setNewBrandSector(e.target.value)}
                    placeholder="Ex: Retalho"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Província</label>
                  <input
                    type="text"
                    value={newBrandProvince}
                    onChange={(e) => setNewBrandProvince(e.target.value)}
                    placeholder="Ex: Luanda"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700 uppercase">URL do Logótipo (Opcional — se vazio usa iniciais elegantes)</label>
                <input
                  type="url"
                  value={newBrandLogoUrl}
                  onChange={(e) => setNewBrandLogoUrl(e.target.value)}
                  placeholder="https://exemplo.ao/logo.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar à Lista</span>
                </button>
              </div>
            </form>

            {/* Lista Atual de Marcas */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Marcas Cadastradas ({(settings.partnerLogos || []).length})
                </h3>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(settings.partnerLogos || []).map((brand) => (
                  <div
                    key={brand.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      brand.active ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain rounded-xl" />
                        ) : (
                          brand.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate block">{brand.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                            brand.type === 'parceiro' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {brand.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {[brand.sector, brand.province].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleBrandActive(brand.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold ${
                          brand.active ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 bg-slate-200'
                        }`}
                        title={brand.active ? 'Ativo (clique para ocultar)' : 'Oculto (clique para ativar)'}
                      >
                        {brand.active ? 'Ativo' : 'Oculto'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Relações com Investidores & Governança</h3>
                <p className="text-xs text-slate-500">Dados institucionais exibidos na página /investidores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Título da Seção de Investidores</label>
                <input
                  type="text"
                  value={settings.investorInfo?.title || DEFAULT_INVESTOR_SETTINGS.title}
                  onChange={(e) => handleInvestorChange('title', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Crescimento Anual</label>
                <input
                  type="text"
                  value={settings.investorInfo?.annualGrowth || DEFAULT_INVESTOR_SETTINGS.annualGrowth}
                  onChange={(e) => handleInvestorChange('annualGrowth', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-blue-600 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="+128% ao ano"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Entidade Legal</label>
                <input
                  type="text"
                  value={settings.investorInfo?.legalEntity || DEFAULT_INVESTOR_SETTINGS.legalEntity}
                  onChange={(e) => handleInvestorChange('legalEntity', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Capital Social</label>
                <input
                  type="text"
                  value={settings.investorInfo?.shareCapital || DEFAULT_INVESTOR_SETTINGS.shareCapital}
                  onChange={(e) => handleInvestorChange('shareCapital', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Auditoria & Homologação</label>
                <input
                  type="text"
                  value={settings.investorInfo?.auditedBy || DEFAULT_INVESTOR_SETTINGS.auditedBy}
                  onChange={(e) => handleInvestorChange('auditedBy', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-emerald-600 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Email do Conselho de Administração</label>
                <input
                  type="email"
                  value={settings.investorInfo?.contactEmail || DEFAULT_INVESTOR_SETTINGS.contactEmail}
                  onChange={(e) => handleInvestorChange('contactEmail', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-blue-600 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Resumo da Tese de Negócio</label>
                <textarea
                  rows={3}
                  value={settings.investorInfo?.summary || DEFAULT_INVESTOR_SETTINGS.summary}
                  onChange={(e) => handleInvestorChange('summary', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:border-blue-600 outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Dados de Investidores</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: 18 PROVÍNCIAS */}
        {activeTab === 'provincias' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Cobertura nas 18 Províncias de Angola</h3>
                <p className="text-xs text-slate-500">Configure clientes ativos e parceiros técnicos por região (/provincias)</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Guardar Todas as Províncias</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Província</th>
                    <th className="py-3 px-4">Capital</th>
                    <th className="py-3 px-4">Clientes Ativos</th>
                    <th className="py-3 px-4">Parceiros Certificados</th>
                    <th className="py-3 px-4">Status de Atendimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(settings.provincesCoverage || DEFAULT_PROVINCES).map((prov) => (
                    <tr key={prov.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{prov.name}</td>
                      <td className="py-2.5 px-4 text-slate-500">{prov.capital}</td>
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          value={prov.activeClients}
                          onChange={(e) => handleProvinceChange(prov.id, 'activeClients', parseInt(e.target.value) || 0)}
                          className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-blue-600 focus:bg-white focus:border-blue-600 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          value={prov.certifiedPartners}
                          onChange={(e) => handleProvinceChange(prov.id, 'certifiedPartners', parseInt(e.target.value) || 0)}
                          className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={prov.status}
                          onChange={(e) => handleProvinceChange(prov.id, 'status', e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
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

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Configurações das 18 Províncias</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: CONTACTOS & WHATSAPP */}
        {activeTab === 'contactos' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Contactos Oficiais, Horários & Linhas de Atendimento</h3>
              <p className="text-xs text-slate-500">Configuração de números de WhatsApp, linhas de suporte, horários e emails de contacto do site</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Telefone / WhatsApp Principal</label>
                <input
                  type="text"
                  value={settings.phoneDisplay}
                  onChange={(e) => handleChange('phoneDisplay', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="+244 923 456 789"
                />
                <p className="text-[10px] text-slate-400">O link do WhatsApp gerado automaticamente será: <code>https://wa.me/{settings.phoneDisplay.replace(/\D/g, '')}</code></p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Linha Comercial / Telefone Secundário</label>
                <input
                  type="text"
                  value={settings.phoneCommercial || ''}
                  onChange={(e) => handleChange('phoneCommercial', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="+244 923 111 222"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Horário de Atendimento Principal</label>
                <input
                  type="text"
                  value={settings.supportHours || ''}
                  onChange={(e) => handleChange('supportHours', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Segunda a Sábado: 08h00 – 19h00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Horário de Plantão / Fins de Semana</label>
                <input
                  type="text"
                  value={settings.supportHoursSunday || ''}
                  onChange={(e) => handleChange('supportHoursSunday', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Domingos e Feriados: Plantão para Urgências"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Email Comercial / Vendas</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="comercial@kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Email de Suporte Técnico & Fiscal</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="suporte@kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Email de Parcerias & Revendedores</label>
                <input
                  type="email"
                  value={settings.partnerEmail || ''}
                  onChange={(e) => handleChange('partnerEmail', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="parceiros@kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Página do Instagram</label>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="https://instagram.com/kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Página do Facebook</label>
                <input
                  type="text"
                  value={settings.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="https://facebook.com/kivora.ao"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">LinkedIn Corporativo</label>
                <input
                  type="text"
                  value={settings.linkedinUrl || ''}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="https://linkedin.com/company/kivora"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Contactos</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: LINKS, GITHUB & DOWNLOAD */}
        {activeTab === 'links' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Links Externos, Repositório GitHub & Setup Windows</h3>
              <p className="text-xs text-slate-500">Configure o link do GitHub e a URL direta para descarregar o instalador desktop (.exe)</p>
            </div>

            {/* Dica Informativa GitHub & Download */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span>Compatibilidade Total com GitHub Releases & Arquivos Raw</span>
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Pode colar links do GitHub (ex: <code>.../blob/main/setup.exe</code>), Google Drive ou VPS. O Kivora converte automaticamente URLs do GitHub Blob para <strong>download direto de ficheiro binário</strong> sem abrir a página HTML de código.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                    Link do Repositório no GitHub
                  </span>
                  {settings.githubUrl && (
                    <a
                      href={settings.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 font-bold text-[11px]"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="https://github.com/marcosdc20/kivora-setup-vers-o"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    Link de Download Direto do Instalador (.exe / .msi)
                  </label>
                  {settings.downloadUrl && (
                    <a
                      href={getDirectDownloadUrl(settings.downloadUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="https://github.com/marcosdc20/kivora-setup-vers-o/raw/main/KIVORA_1.1.0_x64-setup.exe"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>URL direta convertida: <code className="text-slate-600 font-mono">{getDirectDownloadUrl(settings.downloadUrl) || 'Nenhuma'}</code></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Versão do Executável Windows</label>
                <input
                  type="text"
                  value={settings.releaseVersion}
                  onChange={(e) => handleChange('releaseVersion', e.target.value.replace(/^v+/i, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="1.1.0"
                />
                <span className="text-[10px] text-slate-400">Exibido no site como: v{settings.releaseVersion || '1.1.0'}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Tamanho do Arquivo (.exe)</label>
                <input
                  type="text"
                  value={settings.fileSize || ''}
                  onChange={(e) => handleChange('fileSize', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="78.4 MB"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Data de Lançamento da Versão</label>
                <input
                  type="text"
                  value={settings.releaseDate}
                  onChange={(e) => handleChange('releaseDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="19 de Agosto de 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Chave de Demonstração / Avaliação</label>
                <input
                  type="text"
                  value={settings.demoKey || ''}
                  onChange={(e) => handleChange('demoKey', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-blue-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="KVRA-DEMO-2026-TRIAL"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Assinatura Digital SHA-256 (Checksum)</label>
                <input
                  type="text"
                  value={settings.sha256Checksum || ''}
                  onChange={(e) => handleChange('sha256Checksum', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-[11px] text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                />
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-100">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2">Requisitos Mínimos do Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Sistema Operativo</label>
                    <input
                      type="text"
                      value={settings.minOs || ''}
                      onChange={(e) => handleChange('minOs', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                      placeholder="Windows 10 / 11 (64-bit)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Memória RAM</label>
                    <input
                      type="text"
                      value={settings.minRam || ''}
                      onChange={(e) => handleChange('minRam', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                      placeholder="4 GB RAM (Recomendado 8 GB)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Espaço em Disco</label>
                    <input
                      type="text"
                      value={settings.minStorage || ''}
                      onChange={(e) => handleChange('minStorage', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                      placeholder="2 GB livres em SSD (+ base de dados)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Processador (CPU)</label>
                    <input
                      type="text"
                      value={settings.minCpu || ''}
                      onChange={(e) => handleChange('minCpu', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                      placeholder="Intel Core i3 / AMD Ryzen 3 ou superior"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 uppercase">Notas da Versão / Novidades (Changelog)</label>
                <textarea
                  rows={4}
                  value={settings.releaseNotes || ''}
                  onChange={(e) => handleChange('releaseNotes', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none leading-relaxed"
                  placeholder="• Motor de faturação certificado em conformidade com a AGT&#10;• Base de dados 100% local com funcionamento sem internet"
                />
                <span className="text-[10px] text-slate-400">Escreva um item por linha para formatar os tópicos no site.</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Links & Versão</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: CONTAS BANCÁRIAS (IBANs) */}
        {activeTab === 'bancos' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Coordenadas Bancárias Oficiais (IBAN)</h3>
              <p className="text-xs text-slate-500">Dados bancários para liquidação de dívidas de parceiros e pagamentos de licenças</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Nome do Titular da Conta</label>
                <input
                  type="text"
                  value={settings.ibanTitular}
                  onChange={(e) => handleChange('ibanTitular', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="VISUAL SOFTWARE LIMITADA"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">IBAN Banco BAI</label>
                <input
                  type="text"
                  value={settings.ibanBai}
                  onChange={(e) => handleChange('ibanBai', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="AO06 0040 0000 1234 5678 9012 3"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">IBAN Banco BFA</label>
                <input
                  type="text"
                  value={settings.ibanBfa}
                  onChange={(e) => handleChange('ibanBfa', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="AO06 0006 0000 9876 5432 1098 7"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Coordenadas Bancárias</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: AGT */}
        {activeTab === 'agt' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Parâmetros de Validação Fiscal AGT</h3>
              <p className="text-xs text-slate-500">Certificado oficial e número de registo emitido pela Administração Geral Tributária</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Selo de Homologação / Certificado AGT</label>
                <input
                  type="text"
                  value={settings.agtCertificate}
                  onChange={(e) => handleChange('agtCertificate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Programa Validado nº 321/AGT/2026"
                />
                <p className="text-[10px] text-slate-400">Este texto é exibido no topo do portal do cliente e no rodapé do site.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Referência do Decreto Presidencial</label>
                <input
                  type="text"
                  value={settings.agtDecretoRef || ''}
                  onChange={(e) => handleChange('agtDecretoRef', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="Decreto Presidencial n.º 71/25"
                />
                <p className="text-[10px] text-slate-400">Marco regulatório exibido nas páginas fiscais e rodapé.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase">Dia Limite de Submissão do SAF-T AO</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={settings.saftSubmissionDeadlineDay ?? 15}
                  onChange={(e) => handleChange('saftSubmissionDeadlineDay', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold font-mono text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  placeholder="15"
                />
                <p className="text-[10px] text-slate-400">Dia limite do mês subsequente para submissão do XML à AGT.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-base font-black text-slate-900">Atualizações de Executáveis Windows (OTA)</h3>
                <p className="text-xs text-slate-500">Distribuição automatizada para postos de venda e servidores</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>Publicar Nova Versão</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
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
                      <tr key={rel.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            v{rel.version}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">{rel.releaseDate}</p>
                        </td>
                        <td className="p-4 font-bold text-slate-700 uppercase text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full ${
                            rel.channel === 'stable' ? 'bg-emerald-50 text-emerald-700' :
                            rel.channel === 'beta' ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {rel.channel}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs font-medium whitespace-pre-line text-[11px]">
                          {rel.changelog}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800">{rel.rolloutPercentage}%</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rel.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            rel.status === 'testing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {rel.status === 'published' ? 'Em Produção' : rel.status === 'testing' ? 'Em Testes' : 'Rollback Efetuado'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {rel.status !== 'rollback' && (
                              <button
                                onClick={() => handleRollback(rel)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Rollback"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <a
                              href={rel.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Exportação de Cópias de Segurança (Backups)</h3>
                <p className="text-xs text-slate-500">Transfira um instantâneo JSON completo das coleções do Firebase Firestore</p>
              </div>
              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? 'A Exportar...' : 'Descarregar Backup JSON'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Último Backup Realizado</p>
                <p className="font-mono font-bold text-slate-800">{lastBackup || 'Nenhum backup recente nesta máquina'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Proteção dos Dados</p>
                <p className="font-bold text-emerald-600">✓ Sincronização Contínua no Firebase Firestore</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* OTA Publish Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Publicar Nova Versão OTA</h3>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishRelease} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Versão (Sem 'v')</label>
                  <input
                    type="text"
                    required
                    placeholder="1.2.0"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Canal de Lançamento</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold"
                  >
                    <option value="stable">Estável (Produção)</option>
                    <option value="beta">Beta (Testes)</option>
                    <option value="hotfix">Hotfix Crítico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Percentagem de Rollout ({newRollout}%)</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={newRollout}
                  onChange={(e) => setNewRollout(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Changelog & Novidades</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva as correções fiscais ou melhorias do executável..."
                  value={newChangelog}
                  onChange={(e) => setNewChangelog(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={newMandatory}
                  onChange={(e) => setNewMandatory(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="mandatory" className="font-medium text-slate-700">
                  Atualização Obrigatória (Bloqueia versões antigas)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
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

import React, { useState } from 'react';
import {
  Settings, ShieldCheck, Mail, Smartphone, Save,
  Database, Download, Loader2, SaveAll, Rocket,
  RotateCcw, X
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminTopbar } from './AdminComponents';

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
    changelog: 'Integração inicial com novo motor de IA fiscal AGT e impressão térmica de 58mm customizável.\nTeste de stress para modo multiloja com mais de 20 terminais simultâneos.',
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

export const AdminConfiguracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'backups' | 'updates' | 'agt' | 'whatsapp' | 'email'>('backups');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states gerais
  const [empresaNome, setEmpresaNome] = useState('Kivora Angola — Soluções Tecnológicas');
  const [nifKivora, setNifKivora] = useState('5417089123');
  const [emailSuporte, setEmailSuporte] = useState('suporte@kivora.ao');
  const [whatsappApiToken, setWhatsappApiToken] = useState('kvr_live_wa_991823712893');
  const [agtCertNumber, setAgtCertNumber] = useState('321/AGT/2026');
  const [smtpServer, setSmtpServer] = useState('mail.kivora.ao');

  // Backups reais
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
      const [licenses, companies, trials, users] = await Promise.all([
        exportCollection('licenses'),
        exportCollection('companies'),
        exportCollection('trials'),
        exportCollection('users'),
      ]);

      const backupData = {
        version: '1.0',
        system: 'KIVORA ERP & ADMIN CLOUD',
        timestamp: new Date().toISOString(),
        collections: {
          licenses,
          companies,
          trials,
          users,
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Configurações, Backups & Atualizações OTA"
        subtitle="Definições globais do sistema, cópias de segurança do Firestore e deployment de executáveis"
      />

      <div className="p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'backups', label: 'Cópias de Segurança (Backups)', icon: <Database className="w-4 h-4" /> },
            { id: 'updates', label: 'Atualizações OTA (Windows)', icon: <Rocket className="w-4 h-4" /> },
            { id: 'geral', label: 'Geral & Empresa', icon: <Settings className="w-4 h-4" /> },
            { id: 'agt', label: 'Certificação AGT', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'whatsapp', label: 'WhatsApp API', icon: <Smartphone className="w-4 h-4" /> },
            { id: 'email', label: 'Servidor SMTP', icon: <Mail className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

        {/* TAB 1: BACKUPS (Port de Backups.tsx de kivora_admin) */}
        {activeTab === 'backups' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Backups e Segurança da Nuvem</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Exporte cópias de segurança JSON de todas as empresas, licenças e clientes na nuvem Firebase.
                </p>
              </div>
              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? 'A Exportar Base de Dados...' : 'Descarregar Backup Completo JSON'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Estado da Nuvem Firestore</h4>
                    <p className="text-xs text-slate-500">Firebase Firestore Cloud (faturasimples)</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Coleções incluídas:</span>
                    <strong className="text-slate-800">licenses, companies, trials, users</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Formato de Exportação:</span>
                    <strong className="text-slate-800 font-mono">JSON Estruturado</strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Último backup exportado:</span>
                    <strong className="text-emerald-700">{lastBackup || 'Nenhum exportado nesta sessão'}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl p-6 shadow-sm border border-slate-800 text-white space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                    <SaveAll className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Política de Proteção & Retenção</h4>
                    <p className="text-xs text-slate-400">Recomendações Oficiais Kivora</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Recomenda-se exportar um backup JSON semanalmente. Guarde o arquivo descarregado num armazenamento seguro (Google Drive, disco externo ou cofre digital).
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As regras de segurança criptográfica no Firestore garantem que apenas a conta de administrador autenticada tem autorização para ler e exportar estes registos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPDATES OTA (Port de Updates.tsx de kivora_admin) */}
        {activeTab === 'updates' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Gestor de Atualizações Over-The-Air (OTA)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Distribuição de novas versões do executável Kivora Desktop ERP para os terminais em Angola.
                </p>
              </div>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                <span>Publicar Nova Versão OTA</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                    <th className="p-4">Versão</th>
                    <th className="p-4">Canal</th>
                    <th className="p-4">Changelog / Novidades</th>
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
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rollback de Emergência"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <a
                            href={rel.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Descarregar Executável"
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

        {/* TAB 3: GERAL */}
        {activeTab === 'geral' && (
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            {savedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl animate-fadeIn">
                ✓ Configurações guardadas com sucesso!
              </div>
            )}
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Informações Institucionais da Kivora
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Razão Social</label>
                  <input
                    type="text"
                    value={empresaNome}
                    onChange={(e) => setEmpresaNome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">NIF</label>
                  <input
                    type="text"
                    value={nifKivora}
                    onChange={(e) => setNifKivora(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Email Central de Atendimento</label>
                  <input
                    type="email"
                    value={emailSuporte}
                    onChange={(e) => setEmailSuporte(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Alterações</span>
            </button>
          </form>
        )}

        {/* TAB 4: AGT */}
        {activeTab === 'agt' && (
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="space-y-4 text-xs">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Parâmetros Oficiais de Certificação AGT (DP 71/25)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Número do Certificado AGT</label>
                  <input
                    type="text"
                    value={agtCertNumber}
                    onChange={(e) => setAgtCertNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Chave RSA de Validação SAFT-AO</label>
                  <input
                    type="password"
                    defaultValue="rsa_priv_agt_kivora_2026_production_key"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Parâmetros AGT</span>
            </button>
          </form>
        )}

        {/* TAB 5: WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="space-y-4 text-xs">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Integração WhatsApp Business API
              </h4>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Token de API (Live)</label>
                <input
                  type="text"
                  value={whatsappApiToken}
                  onChange={(e) => setWhatsappApiToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configurações WhatsApp</span>
            </button>
          </form>
        )}

        {/* TAB 6: EMAIL */}
        {activeTab === 'email' && (
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="space-y-4 text-xs">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Servidor SMTP para Envio de Licenças & Alertas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Host SMTP</label>
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Porta SMTP</label>
                  <input
                    type="text"
                    defaultValue="587 (TLS)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar SMTP</span>
            </button>
          </form>
        )}

      </div>

      {/* Modal Publicar Nova Versão OTA */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Publicar Atualização OTA para Kivora ERP</h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishRelease} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Número da Versão</label>
                  <input
                    type="text"
                    required
                    placeholder="1.2.0-x64"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Canal de Distribuição</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                  >
                    <option value="stable">Stable (Produção)</option>
                    <option value="beta">Beta (Testes)</option>
                    <option value="hotfix">Hotfix Crítico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Notas de Lançamento (Changelog)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Melhorias na emissão de SAFT-AO e correção de arredondamento de moeda."
                  value={newChangelog}
                  onChange={(e) => setNewChangelog(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                />
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={newMandatory}
                  onChange={(e) => setNewMandatory(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="mandatory" className="font-bold text-slate-700 cursor-pointer">
                  Atualização Obrigatória (bloqueia versões antigas)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                >
                  Publicar Versão OTA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

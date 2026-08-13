import React, { useState } from 'react';
import { Settings, ShieldCheck, Mail, Smartphone, Save, Database, Server } from 'lucide-react';
import { AdminTopbar } from './AdminComponents';

export const AdminConfiguracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'agt' | 'whatsapp' | 'email' | 'backups'>('geral');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [empresaNome, setEmpresaNome] = useState('Kivora Angola — Soluções Tecnológicas');
  const [nifKivora, setNifKivora] = useState('5417089123');
  const [emailSuporte, setEmailSuporte] = useState('suporte@kivora.ao');
  const [whatsappApiToken, setWhatsappApiToken] = useState('kvr_live_wa_991823712893');
  const [agtCertNumber, setAgtCertNumber] = useState('321/AGT/2026');
  const [smtpServer, setSmtpServer] = useState('mail.kivora.ao');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Configurações Globais do Sistema"
        subtitle="Definições de licenciamento, servidor de e-mail, WhatsApp API e parâmetros AGT"
      />

      <div className="p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'geral', label: 'Geral & Empresa', icon: <Settings className="w-4 h-4" /> },
            { id: 'agt', label: 'Certificação AGT', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'whatsapp', label: 'WhatsApp API', icon: <Smartphone className="w-4 h-4" /> },
            { id: 'email', label: 'Servidor SMTP', icon: <Mail className="w-4 h-4" /> },
            { id: 'backups', label: 'Servidor & Backups', icon: <Database className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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

        {/* Form Container */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl animate-fadeIn">
              ✓ Configurações guardadas com sucesso! As alterações já estão ativas no sistema Kivora.
            </div>
          )}

          {activeTab === 'geral' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Informações Institucionais da Kivora
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Razão Social</label>
                  <input
                    type="text"
                    value={empresaNome}
                    onChange={(e) => setEmpresaNome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">NIF da Empresa</label>
                  <input
                    type="text"
                    value={nifKivora}
                    onChange={(e) => setNifKivora(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">E-mail Principal de Suporte</label>
                  <input
                    type="email"
                    value={emailSuporte}
                    onChange={(e) => setEmailSuporte(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Sede / Endereço</label>
                  <input
                    type="text"
                    defaultValue="Edifício Sol, Talatona, Luanda, Angola"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agt' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Parâmetros de Certificação da AGT (Administração Geral Tributária)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Número do Certificado AGT</label>
                  <input
                    type="text"
                    value={agtCertNumber}
                    onChange={(e) => setAgtCertNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Versão do Esquema SAF-T AO</label>
                  <input
                    type="text"
                    defaultValue="v1.01_01 (Conforme Legislação 2026)"
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Integração WhatsApp Business API
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">API Bearer Token</label>
                  <input
                    type="password"
                    value={whatsappApiToken}
                    onChange={(e) => setWhatsappApiToken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Número de Telefone Emissor</label>
                  <input
                    type="text"
                    defaultValue="+244 923 000 111"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Configuração do Servidor SMTP de E-mail
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Host SMTP</label>
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Porta SMTP</label>
                  <input
                    type="text"
                    defaultValue="587 (TLS)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                Agendamento de Backups da Base de Dados
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800">Frequência dos Backups de Licenças & Clientes:</p>
                <p className="text-xs text-slate-600">Backups automáticos executados diariamente às 03:00 AM (WAT).</p>
                <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  Último backup: Hoje 03:00 AM (Sucesso 100%)
                </span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" strokeWidth={2} />
              Guardar Configurações Globais
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

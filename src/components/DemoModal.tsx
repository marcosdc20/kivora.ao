import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Send, Building, Phone, Mail, User, ShieldCheck, MessageCircle, Loader2, Monitor } from 'lucide-react';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { triggerKivoraConfetti } from '../utils/confetti';

import welcomeImg from '../assets/kivora/jovem-empresario-dado-boas-vindas.png';

import { sendDemoLeadEmails } from '../services/siteEmailService';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModule?: string;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  initialModule = '',
}) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    nif: '',
    contactName: '',
    phone: '',
    email: '',
    businessSector: 'Comércio Geral / Retalho',
    storesCount: '1 Loja',
    interestedModule: initialModule || 'Kivora Gestão Comercial & POS',
    installationMode: 'Posto Único (Caixa Local)',
    notes: '',
    hp_field: '', // Honeypot field for bot trapping
  });

  useEffect(() => {
    if (initialModule) {
      setFormData((prev) => ({ ...prev, interestedModule: initialModule }));
    }
  }, [initialModule]);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Anti-spam honeypot verification
    if (formData.hp_field) {
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 400);
      return;
    }

    try {
      await addDoc(collection(db, 'leads_demonstracao'), {
        companyName: formData.companyName,
        nif: formData.nif,
        contactName: formData.contactName,
        phone: formData.phone,
        email: formData.email,
        businessSector: formData.businessSector,
        storesCount: formData.storesCount,
        interestedModule: formData.interestedModule,
        installationMode: formData.installationMode,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        created_at: Date.now(),
        status: 'pendente',
        source: 'site_modal_demonstracao',
      });

      // Disparar e-mails automáticos (confirmação ao cliente + alerta à equipa comercial)
      sendDemoLeadEmails(formData).catch((err) => {
        console.warn('Erro no envio de e-mails do lead demo:', err);
      });

      // Disparo opcional de webhook externo se configurado no Admin
      if (settings.webhookUrl && settings.webhookUrl.startsWith('http')) {
        fetch(settings.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'lead_demonstracao',
            timestamp: new Date().toISOString(),
            data: formData
          }),
          mode: 'no-cors'
        }).catch((e) => console.warn('Erro silencioso no Webhook:', e));
      }
    } catch (err) {
      console.warn('Erro ao gravar lead no Firebase:', err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      try {
        triggerKivoraConfetti();
      } catch {
        // ignore
      }
    }
  };

  const getWhatsAppLink = () => {
    const phoneRaw = settings.phoneRaw || (settings.phoneDisplay || '').replace(/\D/g, '') || '244923456789';
    const msg = `Olá Equipa ${settings.name}! Gostaria de agendar uma demonstração do ${settings.fullName}.%0A%0A*Empresa:* ${formData.companyName}%0A*Contacto:* ${formData.contactName} (${formData.phone})%0A*Email:* ${formData.email}%0A*Ramo:* ${formData.businessSector}%0A*Módulo:* ${formData.interestedModule}%0A*Modalidade:* ${formData.installationMode}${formData.notes ? `%0A*Notas:* ${formData.notes}` : ''}`;
    return `https://wa.me/${phoneRaw}?text=${msg}`;
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 relative animate-scaleUp">
        
        {/* Header - Limpo em Fundo Branco */}
        <div className="bg-white p-6 sm:p-8 text-slate-900 relative border-b border-slate-200">
          <button
            onClick={onClose}
            aria-label="Fechar janela de demonstração"
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0 hidden sm:block bg-slate-50">
              <img
                src={welcomeImg}
                alt="Consultor Kivora ERP"
                width="64"
                height="64"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-700 text-xs font-black uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Demonstração Oficial Kivora ERP</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-slate-950">
                Solicite uma Apresentação Personalizada
              </h3>
              <p className="text-slate-600 text-xs mt-1 max-w-lg leading-relaxed">
                Descubra como o KIVORA simplifica a Faturação AGT, Controlo de Stock e Gestão Financeira.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">
                  Pedido Enviado com Sucesso!
                </h4>
                <p className="text-slate-600 max-w-md mx-auto text-xs sm:text-sm leading-relaxed mt-2">
                  Obrigado pelo seu interesse no <strong>KIVORA ERP</strong>. A sua solicitação foi registada e um dos nossos consultores entrará em contacto muito em breve.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 max-w-md mx-auto space-y-1.5 text-left">
                <p className="font-bold text-xs text-slate-900 mb-1">Apoio Direto da {settings.company}:</p>
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-600" /> <span>{settings.phoneDisplay}</span></p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-600" /> <span>{settings.email}</span></p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Conversar no WhatsApp Agora</span>
                </a>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Campo Honeypot Invisível para Captura de Bots */}
              <input
                type="text"
                name="hp_field"
                id="demo_hp_field"
                value={formData.hp_field}
                onChange={(e) => setFormData({ ...formData, hp_field: e.target.value })}
                style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              
              {/* Linha 1: Empresa & NIF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="demo_companyName" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Nome da Empresa / Negócio *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="demo_companyName"
                      type="text"
                      required
                      placeholder="Ex: Comercial Luanda Lda"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="demo_nif" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    NIF da Empresa (Opcional)
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="demo_nif"
                      type="text"
                      placeholder="Ex: 5412345678"
                      value={formData.nif}
                      onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Linha 2: Responsável & Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="demo_contactName" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Seu Nome *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="demo_contactName"
                      type="text"
                      required
                      placeholder="Nome completo do responsável"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="demo_phone" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Telefone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="demo_phone"
                      type="tel"
                      required
                      placeholder="+244 9XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Linha 3: Email Corporativo & Ramo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="demo_email" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Email Corporativo *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="demo_email"
                      type="email"
                      required
                      placeholder="seuemail@empresa.ao"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="demo_businessSector" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Ramo de Atividade
                  </label>
                  <select
                    id="demo_businessSector"
                    value={formData.businessSector}
                    onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                  >
                    <option value="Comércio / Retalho">Comércio / Retalho / Loja</option>
                    <option value="Supermercado / Mercearia">Supermercado / Mercearia</option>
                    <option value="Restaurante / Bar / Hotelaria">Restaurante / Bar / Hotelaria</option>
                    <option value="Farmácia / Clínica">Farmácia / Clínica / Saúde</option>
                    <option value="Prestação de Serviços">Prestação de Serviços / Consultoria</option>
                    <option value="Indústria / Distribuição">Indústria / Distribuição / Grossista</option>
                    <option value="Outro">Outro Ramo</option>
                  </select>
                </div>
              </div>

              {/* Linha 4: Modalidade de Instalação */}
              <div className="space-y-1.5">
                <label htmlFor="demo_installationMode" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-600" />
                  <span>Modalidade de Instalação Preferida</span>
                </label>
                <select
                  id="demo_installationMode"
                  value={formData.installationMode}
                  onChange={(e) => setFormData({ ...formData, installationMode: e.target.value })}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                >
                  <option value="KIVORA Standalone (1 Posto Local)">KIVORA Standalone (Instalação Local / 1 Posto)</option>
                  <option value="KIVORA Rede Local LAN (Multi-Postos)">KIVORA Rede Local LAN (Múltiplos Postos / Servidor)</option>
                  <option value="Solução Personalizada / Grande Empresa">Solução Personalizada / Múltiplas Lojas</option>
                </select>
              </div>

              {/* Linha 5: Mensagem */}
              <div className="space-y-1.5">
                <label htmlFor="demo_notes" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Mensagem ou Requisitos Específicos (Opcional)
                </label>
                <textarea
                  id="demo_notes"
                  rows={2}
                  placeholder="Ex: Gostaria de saber mais sobre a integração com a AGT e migração de dados..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A registar pedido...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Pedido de Demonstração</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

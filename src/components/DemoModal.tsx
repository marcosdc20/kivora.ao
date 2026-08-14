import React, { useState } from 'react';
import { X, CheckCircle, Send, Building, Phone, Mail, User, ShieldCheck, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { KIVORA_INFO } from '../data/kivoraData';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

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
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    nif: '',
    contactName: '',
    phone: '',
    email: '',
    businessSector: 'Comércio / Retalho',
    storesCount: '1 Loja',
    interestedModule: initialModule || 'Faturação Eletrónica AGT + POS',
    installationMode: 'Kivora Cloud (Nuvem)',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'leads_demonstracao'), {
        ...formData,
        created_at: Date.now(),
        status: 'pendente',
        source: 'site_modal_demonstracao',
      });
    } catch (err) {
      console.warn('Erro ao gravar lead no Firebase:', err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const getWhatsAppLink = () => {
    const msg = `Olá Equipa Kivora! Gostaria de agendar uma demonstração do Kivora ERP.%0A%0A*Empresa:* ${formData.companyName}%0A*Contacto:* ${formData.contactName} (${formData.phone})%0A*Email:* ${formData.email}%0A*Ramo:* ${formData.businessSector}%0A*Módulo:* ${formData.interestedModule}%0A*Modalidade:* ${formData.installationMode}${formData.notes ? `%0A*Notas:* ${formData.notes}` : ''}`;
    return `https://wa.me/${KIVORA_INFO.phoneRaw}?text=${msg}`;
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 relative">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0B192C] via-[#1E40AF] to-[#2563EB] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Demonstração Gratuita Kivora ERP</span>
          </div>
          
          <h3 className="text-2xl font-black tracking-tight">
            Solicite uma Apresentação Personalizada
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            Descubra como o Kivora simplifica a Faturação AGT, Controlo de Stock e Gestão Financeira da sua empresa.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800">
                Pedido Enviado com Sucesso!
              </h4>
              <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                Obrigado pelo seu interesse no <strong>Kivora ERP</strong>. A sua solicitação foi registada na nossa base de dados e um dos nossos consultores fiscais entrará em contacto dentro de poucas horas.
              </p>
              
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-900 max-w-md mx-auto space-y-1 text-left">
                <p className="font-bold text-sm text-blue-950 mb-1">Acompanhamento e Apoio Direto:</p>
                <p>• <strong>Telefone:</strong> {KIVORA_INFO.phoneDisplay}</p>
                <p>• <strong>Email Comercial:</strong> {KIVORA_INFO.email}</p>
                <p>• <strong>Sede:</strong> {KIVORA_INFO.address}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Conversar no WhatsApp Agora</span>
                </a>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nome da Empresa / Negócio *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Comercial Luanda Lda"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIF da Empresa (Opcional)
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Ex: 5412345678"
                      value={formData.nif}
                      onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Seu Nome *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+244 9XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Corporativo *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="seuemail@empresa.ao"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ramo de Atividade
                  </label>
                  <select
                    value={formData.businessSector}
                    onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Modalidade de Instalação Preferida
                  </label>
                  <select
                    value={formData.installationMode}
                    onChange={(e) => setFormData({ ...formData, installationMode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="Kivora Cloud (Nuvem)">Kivora Cloud (Nuvem AGT)</option>
                    <option value="Kivora Desktop (Local / Disco)">Kivora Desktop (Local / Com Disco)</option>
                    <option value="Arquitetura Híbrida (Multiloja)">Arquitetura Híbrida (POS Local + Nuvem)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mensagem ou Requisitos Específicos (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Gostaria de saber mais sobre a integração com a AGT e migração de dados de outro sistema..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer"
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

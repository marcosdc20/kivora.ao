import React, { useState, useEffect } from 'react';
import { Send, Bell, Smartphone, Mail, Plus, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { ComunicadoAdmin } from './types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { sendSiteEmail } from '../services/siteEmailService';
import { generateBroadcastTemplate } from '../services/emailTemplatesSite';
import { notify, confirmDialog, alertDialog } from '../services/notificationService';

export const AdminComunicacao: React.FC = () => {
  const [comunicados, setComunicados] = useState<ComunicadoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNovo, setModalNovo] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [canal, setCanal] = useState<'sistema' | 'whatsapp' | 'email'>('sistema');
  const [destinatarios, setDestinatarios] = useState('Todas as Empresas Clientes');
  const [mensagem, setMensagem] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Sincronização em Tempo Real com Firestore (/announcements)
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'announcements'), (snapshot) => {
        const fireComs: ComunicadoAdmin[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fireComs.push({
            id: docSnap.id,
            titulo: d.titulo || 'Comunicado Oficial',
            canal: d.canal || 'sistema',
            destinatarios: d.destinatarios || 'Todas as Empresas',
            dataEnvio: d.dataEnvio || new Date().toISOString().split('T')[0],
            autor: d.autor || 'Administração Kivora',
            estado: d.estado || 'enviado',
            mensagem: d.mensagem || '',
          });
        });

        if (fireComs.length === 0) {
          fireComs.push({
            id: 'com-welcome',
            titulo: 'Canal de Notificações Kivora Ativado',
            canal: 'sistema',
            destinatarios: 'Todas as Empresas Clientes e Parceiros',
            dataEnvio: new Date().toISOString().split('T')[0],
            autor: 'Suporte Central',
            estado: 'enviado',
            mensagem: 'O canal de avisos e notificações push está pronto e sincronizado via Firebase.',
          });
        }

        setComunicados(fireComs);
        setLoading(false);
      }, (err) => {
        console.warn('Erro ao escutar announcements:', err);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      console.warn(e);
      setLoading(false);
    }
  }, []);

  const [previewTestEmail, setPreviewTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [recipientsCount, setRecipientsCount] = useState<{ clients: number; partners: number; all: number }>({ clients: 0, partners: 0, all: 0 });

  // Carregar contagem de emails reais no Firebase
  useEffect(() => {
    const fetchEmailsCount = async () => {
      try {
        const clientEmails = new Set<string>();
        const partnerEmails = new Set<string>();

        // 1. Licenças e Empresas
        const [licSnap, compSnap, partSnap, appSnap, userSnap] = await Promise.all([
          getDocs(collection(db, 'licenses')).catch(() => ({ forEach: () => {} })),
          getDocs(collection(db, 'companies')).catch(() => ({ forEach: () => {} })),
          getDocs(collection(db, 'partners')).catch(() => ({ forEach: () => {} })),
          getDocs(collection(db, 'partner_applications')).catch(() => ({ forEach: () => {} })),
          getDocs(collection(db, 'users')).catch(() => ({ forEach: () => {} }))
        ]);

        licSnap.forEach((d: any) => {
          const data = d.data();
          if (data.client_email && data.client_email.includes('@')) clientEmails.add(data.client_email.trim().toLowerCase());
        });

        compSnap.forEach((d: any) => {
          const data = d.data();
          if (data.email && data.email.includes('@')) clientEmails.add(data.email.trim().toLowerCase());
          if (data.responsavelEmail && data.responsavelEmail.includes('@')) clientEmails.add(data.responsavelEmail.trim().toLowerCase());
        });

        partSnap.forEach((d: any) => {
          const data = d.data();
          if (data.email && data.email.includes('@')) partnerEmails.add(data.email.trim().toLowerCase());
          if (data.contactEmail && data.contactEmail.includes('@')) partnerEmails.add(data.contactEmail.trim().toLowerCase());
        });

        appSnap.forEach((d: any) => {
          const data = d.data();
          if (data.email && data.email.includes('@')) partnerEmails.add(data.email.trim().toLowerCase());
        });

        userSnap.forEach((d: any) => {
          const data = d.data();
          if (data.email && data.email.includes('@')) {
            if (data.role === 'partner' || data.role === 'parceiro') partnerEmails.add(data.email.trim().toLowerCase());
            else if (data.role === 'client' || data.role === 'cliente') clientEmails.add(data.email.trim().toLowerCase());
          }
        });

        const allEmails = new Set([...clientEmails, ...partnerEmails]);
        setRecipientsCount({
          clients: clientEmails.size,
          partners: partnerEmails.size,
          all: allEmails.size
        });
      } catch (e) {
        console.warn('Erro ao carregar contagem de emails:', e);
      }
    };

    fetchEmailsCount();
  }, [modalNovo]);

  // Função para buscar lista de emails com base no grupo alvo selecionado
  const getResolvedEmails = async (targetGroup: string): Promise<string[]> => {
    const clientEmails = new Set<string>();
    const partnerEmails = new Set<string>();

    try {
      const [licSnap, compSnap, partSnap, appSnap, userSnap] = await Promise.all([
        getDocs(collection(db, 'licenses')).catch(() => ({ forEach: () => {} })),
        getDocs(collection(db, 'companies')).catch(() => ({ forEach: () => {} })),
        getDocs(collection(db, 'partners')).catch(() => ({ forEach: () => {} })),
        getDocs(collection(db, 'partner_applications')).catch(() => ({ forEach: () => {} })),
        getDocs(collection(db, 'users')).catch(() => ({ forEach: () => {} }))
      ]);

      licSnap.forEach((d: any) => {
        const data = d.data();
        if (data.client_email && data.client_email.includes('@')) clientEmails.add(data.client_email.trim().toLowerCase());
      });

      compSnap.forEach((d: any) => {
        const data = d.data();
        if (data.email && data.email.includes('@')) clientEmails.add(data.email.trim().toLowerCase());
        if (data.responsavelEmail && data.responsavelEmail.includes('@')) clientEmails.add(data.responsavelEmail.trim().toLowerCase());
      });

      partSnap.forEach((d: any) => {
        const data = d.data();
        if (data.email && data.email.includes('@')) partnerEmails.add(data.email.trim().toLowerCase());
        if (data.contactEmail && data.contactEmail.includes('@')) partnerEmails.add(data.contactEmail.trim().toLowerCase());
      });

      appSnap.forEach((d: any) => {
        const data = d.data();
        if (data.email && data.email.includes('@')) partnerEmails.add(data.email.trim().toLowerCase());
      });

      userSnap.forEach((d: any) => {
        const data = d.data();
        if (data.email && data.email.includes('@')) {
          if (data.role === 'partner' || data.role === 'parceiro') partnerEmails.add(data.email.trim().toLowerCase());
          else if (data.role === 'client' || data.role === 'cliente') clientEmails.add(data.email.trim().toLowerCase());
        }
      });
    } catch (e) {
      console.warn('Erro ao obter emails do Firestore:', e);
    }

    if (targetGroup.includes('Parceiros')) {
      return Array.from(partnerEmails);
    } else if (targetGroup.includes('Todas as Empresas') || targetGroup.includes('Clientes')) {
      return Array.from(clientEmails);
    } else {
      // Todos (Clientes + Parceiros)
      return Array.from(new Set([...clientEmails, ...partnerEmails]));
    }
  };

  const handleSendTestEmail = async () => {
    if (!previewTestEmail || !previewTestEmail.includes('@')) {
      notify.warning('Por favor insira um endereço de e-mail válido para o teste.');
      return;
    }
    if (!titulo || !mensagem) {
      notify.warning('Preencha o título e o conteúdo antes de enviar o teste.');
      return;
    }

    setSendingTest(true);
    try {
      const html = generateBroadcastTemplate({
        title: titulo,
        body: mensagem,
        senderTitle: 'Administração Geral KIVORA Cloud ERP'
      });

      const res = await sendSiteEmail({
        to: previewTestEmail.trim(),
        subject: `[TESTE - Comunicado KIVORA] ${titulo}`,
        html
      });

      if (res.success) {
        notify.success(`E-mail de teste enviado com sucesso para ${previewTestEmail}!`);
      } else {
        alertDialog({
          title: 'Falha no Teste',
          message: `Não foi possível enviar o e-mail de teste: ${res.error || 'Verifique as configurações de e-mail em Configurações.'}`,
          type: 'warning',
        });
      }
    } catch (err: any) {
      notify.error('Erro ao enviar e-mail de teste: ' + err.message);
    } finally {
      setSendingTest(false);
    }
  };

  const handleCriarComunicado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !mensagem) return;

    setSendingBroadcast(true);
    const cId = `com_${Date.now()}`;
    try {
      await setDoc(doc(db, 'announcements', cId), {
        titulo,
        canal,
        destinatarios,
        dataEnvio: new Date().toISOString().split('T')[0],
        autor: 'Administração Kivora',
        estado: 'enviado',
        mensagem,
        created_at: Date.now()
      }, { merge: true });

      // Se o canal for e-mail, dispara para destinatários
      let emailResultMsg = '';
      if (canal === 'email') {
        const uniqueEmails = await getResolvedEmails(destinatarios);

        if (uniqueEmails.length > 0) {
          const html = generateBroadcastTemplate({
            title: titulo,
            body: mensagem,
            senderTitle: 'Administração Geral KIVORA Cloud ERP'
          });

          const res = await sendSiteEmail({
            to: uniqueEmails,
            subject: `[Comunicado Oficial KIVORA] ${titulo}`,
            html,
          });

          if (res.success) {
            emailResultMsg = `\n\nE-mail disparado para ${uniqueEmails.length} destinatários cadastrados.`;
          } else {
            emailResultMsg = `\n\nAviso: O comunicado foi guardado no sistema, mas o envio de e-mails falhou (${res.error}). Verifique Configurações ➔ Serviço de E-mails.`;
          }
        } else {
          emailResultMsg = '\n\nAviso: Nenhum endereço de e-mail válido foi encontrado para o grupo selecionado.';
        }
      }

      setModalNovo(false);
      setTitulo('');
      setMensagem('');
      notify.success(`Comunicado "${titulo}" publicado com sucesso!${emailResultMsg}`);
    } catch (err: any) {
      notify.error('Erro ao enviar comunicado: ' + err.message);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleResendEmail = async (com: ComunicadoAdmin) => {
    const confirmSend = await confirmDialog({
      title: 'Disparo de E-mails',
      message: `Deseja disparar este comunicado por e-mail agora para "${com.destinatarios}"?`,
      confirmText: 'Disparar E-mails',
    });
    if (!confirmSend) return;

    setSendingBroadcast(true);
    try {
      const uniqueEmails = await getResolvedEmails(com.destinatarios);
      if (uniqueEmails.length === 0) {
        alertDialog({
          title: 'Destinatários Não Encontrados',
          message: 'Nenhum endereço de e-mail encontrado para o grupo selecionado.',
          type: 'warning',
        });
        return;
      }

      const html = generateBroadcastTemplate({
        title: com.titulo,
        body: com.mensagem,
        senderTitle: 'Administração Geral KIVORA Cloud ERP'
      });

      const res = await sendSiteEmail({
        to: uniqueEmails,
        subject: `[Comunicado Oficial KIVORA] ${com.titulo}`,
        html,
      });

      if (res.success) {
        await setDoc(doc(db, 'announcements', com.id), {
          canal: 'email',
          estado: 'enviado',
          lastEmailSentAt: new Date().toISOString()
        }, { merge: true });
        notify.success(`Comunicado disparado com sucesso por e-mail para ${uniqueEmails.length} destinatários!`);
      } else {
        alertDialog({
          title: 'Erro de Disparo',
          message: `Não foi possível enviar o e-mail: ${res.error || 'Verifique o serviço de e-mails em Configurações.'}`,
          type: 'warning',
        });
      }
    } catch (err: any) {
      notify.error('Erro ao disparar e-mail: ' + err.message);
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col font-sans pb-12">
      <AdminTopbar
        title="Central de Comunicação & Notificações"
        subtitle="Disparo de avisos globais, comunicados via WhatsApp e avisos do sistema"
        actions={
          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold font-display text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Novo Comunicado
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Comunicados Enviados"
            value={comunicados.length.toString()}
            icon={<Send className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-brand-50 text-brand-600"
            sub="Este mês"
          />
          <StatCard
            label="Taxa de Entrega WhatsApp"
            value="99.2%"
            icon={<Smartphone className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-emerald-50 text-emerald-600"
            sub="WhatsApp API Kivora"
            subColor="green"
          />
          <StatCard
            label="Empresas Alcançadas"
            value="1.067"
            icon={<Bell className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-amber-50 text-amber-600"
            sub="Notificações ativas"
          />
        </div>

        {/* History Table */}
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-sm font-display tracking-tight">Histórico de Transmissões</h3>
              <p className="text-slate-500 text-xs mt-0.5 font-sans">Avisos e comunicados disparados para a rede Kivora</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 font-sans">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
                <span>A carregar comunicados do Firebase...</span>
              </div>
            ) : comunicados.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-sans">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-700 font-display">Nenhum comunicado registado</p>
              </div>
            ) : (
              comunicados.map((com) => (
                <div key={com.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      {com.canal === 'whatsapp' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider font-display bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                          <Smartphone className="w-3 h-3 text-emerald-600" /> WhatsApp
                        </span>
                      )}
                      {com.canal === 'email' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider font-display bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-brand-200">
                          <Mail className="w-3 h-3 text-brand-600" /> E-mail
                        </span>
                      )}
                      {com.canal === 'sistema' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider font-display bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                          <Bell className="w-3 h-3 text-purple-600" /> Pop-up Sistema
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium font-mono-num">• {com.dataEnvio}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm font-display">{com.titulo}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 font-sans">{com.mensagem}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block font-display">Destinatários</span>
                      <span className="text-xs font-semibold text-slate-800 font-display">{com.destinatarios}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResendEmail(com)}
                        disabled={sendingBroadcast}
                        className="text-xs font-semibold font-display bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-lg border border-brand-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        title="Disparar este comunicado oficial por e-mail agora"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Disparar por E-mail</span>
                      </button>

                      {com.estado === 'enviado' ? (
                        <span className="text-xs font-semibold font-display bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Enviado
                        </span>
                      ) : (
                        <span className="text-xs font-semibold font-display bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Agendado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Comunicado */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <h3 className="text-lg font-black text-slate-950 font-display tracking-tight">Novo Comunicado</h3>

            <form onSubmit={handleCriarComunicado} className="space-y-4 font-sans">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase font-display">Título do Aviso</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Atualização Obrigatória v2026.08"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase font-display">Canal de Transmissão</label>
                  <select
                    value={canal}
                    onChange={(e) => setCanal(e.target.value as any)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-semibold font-display cursor-pointer"
                  >
                    <option value="email">E-mail em Massa (Oficial)</option>
                    <option value="sistema">Pop-up no Software / Portais</option>
                    <option value="whatsapp">WhatsApp Directo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase font-display">Grupo Alvo</label>
                  <select
                    value={destinatarios}
                    onChange={(e) => setDestinatarios(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-semibold font-display cursor-pointer"
                  >
                    <option value="Todas as Empresas Clientes">
                      Clientes ({recipientsCount.clients} e-mails)
                    </option>
                    <option value="Rede de Parceiros Angola">
                      Parceiros ({recipientsCount.partners} e-mails)
                    </option>
                    <option value="Todos (Clientes e Parceiros)">
                      Todos ({recipientsCount.all} e-mails)
                    </option>
                  </select>
                </div>
              </div>

              {canal === 'email' && (
                <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-brand-900 font-semibold font-display">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Mail className="w-4 h-4 text-brand-600" />
                      Disparo de E-mail com Template Oficial KIVORA
                    </span>
                    <span className="bg-brand-200/60 text-brand-800 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono-num">
                      {destinatarios.includes('Parceiros') && !destinatarios.includes('Todos')
                        ? `${recipientsCount.partners} destinatários`
                        : destinatarios.includes('Clientes') && !destinatarios.includes('Todos')
                        ? `${recipientsCount.clients} destinatários`
                        : `${recipientsCount.all} destinatários`}
                    </span>
                  </div>

                  <p className="text-[11px] text-brand-800 leading-relaxed font-sans">
                    O comunicado será emitido com o logótipo oficial, tipografia corporativa e remetente configurado em <strong>Configurações ➔ Serviço de E-mails</strong>.
                  </p>

                  {/* Envio de Teste Prévio */}
                  <div className="pt-2 border-t border-brand-200/60 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="email"
                      value={previewTestEmail}
                      onChange={(e) => setPreviewTestEmail(e.target.value)}
                      placeholder="seu-email@kivora.ao (para testar antes)"
                      className="w-full bg-white border border-brand-200 text-xs px-3 py-2 rounded-xl text-slate-800 focus:outline-none focus:border-brand-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={sendingTest}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold font-display bg-white hover:bg-brand-100 text-brand-700 border border-brand-300 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{sendingTest ? 'A Enviar...' : 'Enviar Teste'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase font-display">Conteúdo do Comunicado</label>
                <textarea
                  rows={5}
                  required
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Escreva aqui a mensagem oficial a ser comunicada..."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-medium resize-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold font-display text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold font-display bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-md shadow-brand-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {sendingBroadcast ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{sendingBroadcast ? 'A Disparar...' : 'Disparar Comunicado'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Send, Bell, Smartphone, Mail, Plus, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { ComunicadoAdmin } from './types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { sendSiteEmail } from '../services/siteEmailService';
import { generateBroadcastTemplate } from '../services/emailTemplatesSite';

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
            if (data.role === 'partner') partnerEmails.add(data.email.trim().toLowerCase());
            else if (data.role === 'client') clientEmails.add(data.email.trim().toLowerCase());
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
          if (data.role === 'partner') partnerEmails.add(data.email.trim().toLowerCase());
          else if (data.role === 'client') clientEmails.add(data.email.trim().toLowerCase());
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
      alert('Por favor insira um endereço de e-mail válido para o teste.');
      return;
    }
    if (!titulo || !mensagem) {
      alert('Preencha o título e o conteúdo antes de enviar o teste.');
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
        alert(`E-mail de teste enviado com sucesso para ${previewTestEmail}!`);
      } else {
        alert(`Não foi possível enviar o e-mail de teste: ${res.error || 'Verifique as configurações de e-mail.'}`);
      }
    } catch (err: any) {
      alert('Erro ao enviar e-mail de teste: ' + err.message);
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
      alert(`Comunicado "${titulo}" publicado com sucesso!${emailResultMsg}`);
    } catch (err: any) {
      alert('Erro ao enviar comunicado: ' + err.message);
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Central de Comunicação & Notificações"
        subtitle="Disparo de avisos globais, comunicados via WhatsApp e avisos do sistema"
        actions={
          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
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
            iconBg="bg-blue-50 text-blue-600"
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Histórico de Transmissões</h3>
              <p className="text-slate-500 text-xs mt-0.5">Avisos e comunicados disparados para a rede Kivora</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                <span>A carregar comunicados do Firebase...</span>
              </div>
            ) : comunicados.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-700">Nenhum comunicado registado</p>
              </div>
            ) : (
              comunicados.map((com) => (
                <div key={com.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      {com.canal === 'whatsapp' && (
                        <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                          <Smartphone className="w-3 h-3" /> WhatsApp
                        </span>
                      )}
                      {com.canal === 'email' && (
                        <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                          <Mail className="w-3 h-3" /> E-mail
                        </span>
                      )}
                      {com.canal === 'sistema' && (
                        <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                          <Bell className="w-3 h-3" /> Pop-up Sistema
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium">• {com.dataEnvio}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{com.titulo}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{com.mensagem}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Destinatários</span>
                      <span className="text-xs font-bold text-slate-800">{com.destinatarios}</span>
                    </div>
                    {com.estado === 'enviado' ? (
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Enviado
                      </span>
                    ) : (
                      <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Agendado
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Comunicado */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <h3 className="text-lg font-black text-slate-900">Novo Comunicado</h3>

            <form onSubmit={handleCriarComunicado} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Título do Aviso</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Atualização Obrigatória v2026.08"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Canal de Transmissão</label>
                  <select
                    value={canal}
                    onChange={(e) => setCanal(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="email">E-mail em Massa (Oficial)</option>
                    <option value="sistema">Pop-up no Software / Portais</option>
                    <option value="whatsapp">WhatsApp Directo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Grupo Alvo</label>
                  <select
                    value={destinatarios}
                    onChange={(e) => setDestinatarios(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
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
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Disparo de E-mail com Template Oficial KIVORA
                    </span>
                    <span className="bg-blue-200/60 text-blue-800 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                      {destinatarios.includes('Parceiros') && !destinatarios.includes('Todos')
                        ? `${recipientsCount.partners} destinatários`
                        : destinatarios.includes('Clientes') && !destinatarios.includes('Todos')
                        ? `${recipientsCount.clients} destinatários`
                        : `${recipientsCount.all} destinatários`}
                    </span>
                  </div>

                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    O comunicado será emitido com o logótipo oficial, tipografia corporativa e remetente configurado em <strong>Configurações ➔ Serviço de E-mails</strong>.
                  </p>

                  {/* Envio de Teste Prévio */}
                  <div className="pt-2 border-t border-blue-200/60 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="email"
                      value={previewTestEmail}
                      onChange={(e) => setPreviewTestEmail(e.target.value)}
                      placeholder="seu-email@kivora.ao (para testar antes)"
                      className="w-full bg-white border border-blue-200 text-xs px-3 py-2 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={sendingTest}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{sendingTest ? 'A Enviar...' : 'Enviar Teste'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Conteúdo do Comunicado</label>
                <textarea
                  rows={5}
                  required
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Escreva aqui a mensagem oficial a ser comunicada..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
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

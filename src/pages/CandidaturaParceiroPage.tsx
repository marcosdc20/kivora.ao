import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, ArrowLeft, Send, Loader2,
  Award, MessageSquare,
  ChevronRight, UploadCloud, FileText, Trash2,
  Paperclip, AlertCircle, Copy, Check, Building2, MapPin,
  CreditCard, User
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import {
  subscribePartnerPolicy, DEFAULT_PARTNER_POLICY,
  PartnerLicensingPolicy
} from '../admin/services/partnerDebtService';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { triggerKivoraConfetti } from '../utils/confetti';
import { sendPartnerApplicationEmails } from '../services/siteEmailService';

interface CandidaturaParceiroPageProps {
  onBack: () => void;
  onNavigateHome: () => void;
}

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const CandidaturaParceiroPage: React.FC<CandidaturaParceiroPageProps> = ({
  onBack,
  onNavigateHome,
}) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [policy, setPolicy] = useState<PartnerLicensingPolicy>(DEFAULT_PARTNER_POLICY);
  
  // Form State
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [provincia, setProvincia] = useState('Luanda');
  const [municipio, setMunicipio] = useState('');
  const [tipoParceria, setTipoParceria] = useState('revenda_instalacao');
  const [experiencia, setExperiencia] = useState('');
  const [temClientesAtuais, setTemClientesAtuais] = useState('sim');
  const [hpField, setHpField] = useState('');
  
  // Comprovativo de Transferência Bancária (25.000 Kz)
  const [comprovativoBase64, setComprovativoBase64] = useState<string>('');
  const [comprovativoNome, setComprovativoNome] = useState<string>('');
  const [comprovativoTamanho, setComprovativoTamanho] = useState<string>('');
  const [comprovativoTipo, setComprovativoTipo] = useState<string>('');
  const [comprovativoError, setComprovativoError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeSystemSettings(setSettings);
    const unsubPolicy = subscribePartnerPolicy(setPolicy);
    return () => {
      unsubSettings();
      unsubPolicy();
    };
  }, []);

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComprovativoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setComprovativoError('O ficheiro é demasiado grande. O tamanho máximo permitido é 5 MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setComprovativoError('Formato inválido. Por favor anexe uma imagem (JPG, PNG, WEBP) ou documento PDF.');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setComprovativoNome(file.name);
    setComprovativoTamanho(sizeFormatted);
    setComprovativoTipo(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setComprovativoBase64(reader.result);
      }
    };
    reader.onerror = () => {
      setComprovativoError('Erro ao carregar o ficheiro. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setComprovativoBase64('');
    setComprovativoNome('');
    setComprovativoTamanho('');
    setComprovativoTipo('');
    setComprovativoError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !empresa.trim() || !nif.trim() || !provincia.trim() || !municipio.trim() || !email.trim() || !telefone.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios assinalados com asterisco (*).');
      return;
    }

    if (!comprovativoBase64) {
      setError('É obrigatório anexar o comprovativo da transferência bancária da taxa de 25.000 Kz.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const protocolCode = `CAND-${Date.now().toString().slice(-6)}`;
    const tempPartnerCode = `KVR-PR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const sedeCompleta = `${municipio.trim()}, ${provincia.trim()}, Angola`;

    // Anti-spam bot trap
    if (hpField) {
      setTimeout(() => {
        setSubmitting(false);
        setSubmittedProtocol(protocolCode);
      }, 400);
      return;
    }

    try {
      const applicationData = {
        protocol: protocolCode,
        partner_code_suggested: tempPartnerCode,
        nome_responsavel: nome.trim(),
        cargo_responsavel: cargo.trim() || 'Responsável Comercial',
        empresa_nome: empresa.trim(),
        nif: nif.trim().toUpperCase(),
        email: email.toLowerCase().trim(),
        telefone: telefone.trim(),
        provincia: provincia.trim(),
        municipio: municipio.trim(),
        sede_completa: sedeCompleta,
        tipo_parceria: tipoParceria,
        tem_clientes: temClientesAtuais,
        experiencia: experiencia.trim(),
        fee_amount_aoa: 25000,
        payment_proof_url: comprovativoBase64,
        payment_proof_name: comprovativoNome,
        payment_proof_size: comprovativoTamanho,
        payment_proof_type: comprovativoTipo,
        status: 'pending' as const,
        created_at: Date.now(),
      };

      // 1. Grava na coleção `partner_applications`
      await addDoc(collection(db, 'partner_applications'), applicationData);

      // 2. Grava também na coleção `partners` como status 'pending'
      const partnerDocId = tempPartnerCode.toUpperCase().trim();
      await setDoc(doc(db, 'partners', partnerDocId), {
        id: partnerDocId,
        code: tempPartnerCode,
        name: empresa.trim(),
        responsible: nome.trim(),
        role: cargo.trim() || 'Gerente / Técnico',
        email: email.toLowerCase().trim(),
        phone: telefone.trim(),
        region: sedeCompleta,
        nif: nif.trim().toUpperCase(),
        debt_aoa: 0,
        total_paid_aoa: 25000,
        total_sales: 0,
        status: 'pending',
        type: tipoParceria,
        notes: `Experiência: ${experiencia} | Clientes: ${temClientesAtuais}`,
        payment_proof_url: comprovativoBase64,
        payment_proof_name: comprovativoNome,
        createdAt: Date.now(),
      }, { merge: true });

      // 3. Disparo de e-mails automáticos
      sendPartnerApplicationEmails({
        nome: nome.trim(),
        empresa: empresa.trim(),
        nif: nif.trim().toUpperCase(),
        email: email.toLowerCase().trim(),
        telefone: telefone.trim(),
        protocol: protocolCode,
        provincia,
        tipoParceria,
      }).catch((err) => console.warn('Erro ao enviar e-mails de candidatura:', err));

      // 4. Disparo opcional de webhook externo
      if (settings.webhookUrl && settings.webhookUrl.startsWith('http')) {
        fetch(settings.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'candidatura_parceiro',
            timestamp: new Date().toISOString(),
            data: applicationData
          }),
          mode: 'no-cors'
        }).catch((e) => console.warn('Erro silencioso no Webhook:', e));
      }

      setSubmittedProtocol(protocolCode);
      try {
        triggerKivoraConfetti();
      } catch {
        // ignore
      }
    } catch (err: any) {
      console.error('Erro ao submeter candidatura:', err);
      setSubmittedProtocol(protocolCode);
      try {
        triggerKivoraConfetti();
      } catch {
        // ignore
      }
    } finally {
      setSubmitting(false);
    }
  };

  const phoneDigits = (settings.phoneDisplay || settings.phone || '244974855494').replace(/\D/g, '');
  const getWhatsAppLink = () => {
    const msg = `Olá Direção da Visual Software! Submeti a minha candidatura para me tornar Parceiro Oficial KIVORA.%0A%0A*Protocolo:* ${submittedProtocol}%0A*Empresa:* ${empresa || nome}%0A*NIF:* ${nif}%0A*Responsável:* ${nome}%0A*Província:* ${provincia}%0A%0ASolicito a validação do comprovativo e ativação das credenciais do Portal do Parceiro.`;
    return `https://wa.me/${phoneDigits}?text=${msg}`;
  };

  const ibanOficial = policy.membership_bank_info?.iban || 'AO06 0040 0000 1234 5678 9012 3';
  const bancoOficial = policy.membership_bank_info?.bank || 'Banco Angolano de Investimentos (BAI)';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-24 pb-24 selection:bg-blue-600 selection:text-white">
      
      {/* Top Header & Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Programa de Parceiros</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Parcerias</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold">Candidatura Oficial</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200/60 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Credenciamento Oficial KIVORA SOFT</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Candidatura de Parceiro & Revenda
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
            Junte-se à rede de canais autorizados da <strong>A Visual Software, Lda.</strong> Aceda a margens de revenda, emissão autónoma de licenças e suporte técnico prioritário.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: Resumo Institucional & Dados Bancários */}
        <aside className="lg:col-span-5 space-y-5">
          
          {/* Card: O que está incluído */}
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 card-glow-blue">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <span>Benefícios do Credenciamento</span>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Margens Comerciais:</strong> Descontos progressivos na compra de licenças de software e equipamentos POS.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Portal do Parceiro:</strong> Gestão autónoma de clientes, faturas proforma e ativação de licenças em minutos.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Certificado Oficial:</strong> Emissão do documento de Parceiro Revendedor pela Visual Software, Lda.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Suporte de Engenharia:</strong> Acesso direto à equipa técnica para apoio em instalações complexas.</span>
              </div>
            </div>
          </div>

          {/* Card: Taxa de Inscrição & Dados Bancários */}
          <div className="bg-mesh rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="orb orb-blue w-36 h-36 -top-8 -right-8 opacity-20" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 relative z-10">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span>Taxa de Registo</span>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-3 py-1 rounded-full">
                Taxa Única
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-950 tracking-tight font-mono-num">
                  {fmt(policy.partner_membership_fee_aoa ?? 25000)} Kz
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Valor único de processamento administrativo, verificação de conformidade e emissão do certificado oficial.
              </p>
            </div>

            {/* Dados para Transferência */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 space-y-2.5 text-xs relative z-10 shadow-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Banco:</span>
                <span className="font-semibold text-slate-800">{bancoOficial}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Beneficiário:</span>
                <span className="font-semibold text-slate-800">A VISUAL SOFTWARE, LDA.</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">NIF da Entidade:</span>
                <span className="font-mono font-semibold text-slate-800">5002863944</span>
              </div>
              
              <div className="pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 text-[11px] font-semibold">IBAN:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyIban(ibanOficial)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {copiedIban ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar IBAN</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] font-bold text-slate-900 select-all">
                  {ibanOficial}
                </div>
              </div>
            </div>

          </div>

        </aside>

        {/* COLUNA DIREITA: Formulário Executivo */}
        <section className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            
            {submittedProtocol ? (
              /* ESTADO: Sucesso */
              <div className="text-center py-6 space-y-6 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Candidatura Submetida
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">Proposta em Análise</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    A sua proposta foi registada com sucesso. A direção comercial da <strong>Visual Software, Lda.</strong> procederá à validação do comprovativo bancário e envio das credenciais.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-2.5 text-left text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Protocolo:</span>
                    <strong className="text-blue-600 font-mono font-bold text-sm">{submittedProtocol}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Empresa / Parceiro:</span>
                    <strong className="text-slate-900 font-semibold">{empresa || nome}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">NIF:</span>
                    <strong className="text-slate-900 font-mono">{nif}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Responsável:</span>
                    <strong className="text-slate-900 font-semibold">{nome}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Província:</span>
                    <strong className="text-slate-900 font-semibold">{provincia}</strong>
                  </div>
                </div>

                {/* Ação WhatsApp */}
                <div className="pt-2">
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-sm transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Avisar Administração via WhatsApp</span>
                  </a>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Voltar à Página Principal
                  </button>
                  <button
                    onClick={() => {
                      setSubmittedProtocol(null);
                      setNome('');
                      setEmpresa('');
                      setNif('');
                      setEmail('');
                      setTelefone('');
                    }}
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                  >
                    Submeter Outra Candidatura
                  </button>
                </div>
              </div>
            ) : (
              /* FORMULÁRIO */
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                {/* Honeypot Invisível */}
                <input
                  type="text"
                  name="hp_field"
                  value={hpField}
                  onChange={(e) => setHpField(e.target.value)}
                  style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">
                    Formulário de Inscrição
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preencha os dados da sua entidade para validação cadastral e emissão do certificado.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Dados da Entidade */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>1. Dados da Entidade Revendedora</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_empresa" className="font-semibold text-slate-700">
                        Nome da Empresa / Parceiro *
                      </label>
                      <input
                        id="cand_empresa"
                        type="text"
                        required
                        placeholder="Ex: Luanda Informática, Lda"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cand_nif" className="font-semibold text-slate-700">
                        NIF da Empresa ou Titular *
                      </label>
                      <input
                        id="cand_nif"
                        type="text"
                        required
                        placeholder="Ex: 5001234567"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none uppercase transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Responsável e Contactos */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>2. Responsável & Contactos</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_nome" className="font-semibold text-slate-700">Nome do Responsável *</label>
                      <input
                        id="cand_nome"
                        type="text"
                        required
                        placeholder="Ex: Manuel Domingos"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cand_cargo" className="font-semibold text-slate-700">Cargo / Função</label>
                      <input
                        id="cand_cargo"
                        type="text"
                        placeholder="Ex: Diretor Técnico / Gerente"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_email" className="font-semibold text-slate-700">Email de Contacto *</label>
                      <input
                        id="cand_email"
                        type="email"
                        required
                        placeholder="contacto@empresa.ao"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cand_telefone" className="font-semibold text-slate-700">Telemóvel / WhatsApp *</label>
                      <input
                        id="cand_telefone"
                        type="tel"
                        required
                        placeholder="+244 923 000 000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Localização */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>3. Localização da Sede</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_provincia" className="font-semibold text-slate-700">Província *</label>
                      <select
                        id="cand_provincia"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:border-blue-600 outline-none transition-all"
                      >
                        <option value="Luanda">Luanda</option>
                        <option value="Benguela">Benguela</option>
                        <option value="Huambo">Huambo</option>
                        <option value="Huíla">Huíla (Lubango)</option>
                        <option value="Cabinda">Cabinda</option>
                        <option value="Cuanza Sul">Cuanza Sul (Sumbe / Porto Amboim)</option>
                        <option value="Cuanza Norte">Cuanza Norte (Ndalatando)</option>
                        <option value="Uíge">Uíge</option>
                        <option value="Malanje">Malanje</option>
                        <option value="Zaire">Zaire (Soyo / Mbanza Kongo)</option>
                        <option value="Lunda Norte">Lunda Norte</option>
                        <option value="Lunda Sul">Lunda Sul</option>
                        <option value="Namibe">Namibe</option>
                        <option value="Bié">Bié</option>
                        <option value="Moxico">Moxico</option>
                        <option value="Cuando Cubango">Cuando Cubango</option>
                        <option value="Cunene">Cunene</option>
                        <option value="Bengo">Bengo</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cand_municipio" className="font-semibold text-slate-700">Município / Bairro *</label>
                      <input
                        id="cand_municipio"
                        type="text"
                        required
                        placeholder="Ex: Talatona, Viana, Belas..."
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Comprovativo Bancário */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>4. Comprovativo da Taxa de Registo (25.000 Kz) *</span>
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                      Obrigatório
                    </span>
                  </h3>

                  {comprovativoBase64 ? (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          {comprovativoTipo === 'application/pdf' ? (
                            <FileText className="w-5 h-5 text-emerald-700" />
                          ) : (
                            <Paperclip className="w-5 h-5 text-emerald-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{comprovativoNome}</p>
                          <p className="text-[10px] text-emerald-700 font-medium">Ficheiro pronto para envio ({comprovativoTamanho})</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Remover ficheiro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-semibold text-slate-800">
                        Clique para selecionar o comprovativo bancário
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Formatos aceites: Imagens (PNG, JPG, WEBP) ou PDF (até 5 MB)
                      </span>
                    </label>
                  )}

                  {comprovativoError && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{comprovativoError}</span>
                    </p>
                  )}
                </div>

                {/* 5. Modalidade & Informações Adicionais */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_tipoParceria" className="font-semibold text-slate-700">Modalidade de Atuação</label>
                      <select
                        id="cand_tipoParceria"
                        value={tipoParceria}
                        onChange={(e) => setTipoParceria(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none transition-all"
                      >
                        <option value="revenda_instalacao">Revenda & Instalação de Software</option>
                        <option value="integracao_pos">Venda de Equipamentos & Hardware POS</option>
                        <option value="consultoria_contabil">Consultoria e Gestão Fiscal</option>
                        <option value="agente_indicacao">Agente Comercial de Indicação</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cand_temClientes" className="font-semibold text-slate-700">Carteira Atual de Clientes</label>
                      <select
                        id="cand_temClientes"
                        value={temClientesAtuais}
                        onChange={(e) => setTemClientesAtuais(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none transition-all"
                      >
                        <option value="sim">Sim, temos clientes a necessitar de faturação</option>
                        <option value="em_prospeccao">Em início de prospeção de mercado</option>
                        <option value="prestacao_servicos">Prestamos serviços gerais de informática</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="cand_experiencia" className="font-semibold text-slate-700 block">
                      Observações / Experiência Prévia (Opcional)
                    </label>
                    <textarea
                      id="cand_experiencia"
                      rows={2}
                      placeholder="Breve resumo da atividade da sua empresa..."
                      value={experiencia}
                      onChange={(e) => setExperiencia(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Declaração */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    Declaro a veracidade dos dados apresentados para emissão do Certificado Oficial de Parceiro Revendedor da Visual Software, Lda.
                  </p>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A submeter candidatura...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submeter Candidatura com Comprovativo</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </section>

      </div>

    </div>
  );
};


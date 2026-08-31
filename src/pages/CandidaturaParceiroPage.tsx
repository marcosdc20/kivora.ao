import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, ArrowLeft, Send, Loader2,
  Award, MessageSquare,
  ChevronRight, UploadCloud, FileText, Trash2,
  Paperclip, AlertCircle, Copy, Check, Building2, MapPin,
  CreditCard, User, Download, Eye, Info
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
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
import { PartnerProgramConditionsModal } from '../components/PartnerProgramConditionsModal';

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
  const [showConditionsModal, setShowConditionsModal] = useState(false);
  const [conditionsTab, setConditionsTab] = useState<'empresa' | 'singular' | 'comuns' | 'etapas'>('empresa');
  
  // Form State
  const [tipoCandidato, setTipoCandidato] = useState<'empresa' | 'singular'>('empresa');
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
  const [concordaTermos, setConcordaTermos] = useState(true);
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
        nome: nome.trim(),
        nome_responsavel: nome.trim(),
        responsible: nome.trim(),
        cargo: cargo.trim() || 'Responsável Comercial',
        cargo_responsavel: cargo.trim() || 'Responsável Comercial',
        empresa: empresa.trim(),
        empresa_nome: empresa.trim(),
        companyName: empresa.trim(),
        nif: nif.trim().toUpperCase(),
        email: email.toLowerCase().trim(),
        telefone: telefone.trim(),
        phone: telefone.trim(),
        provincia: provincia.trim(),
        municipio: municipio.trim(),
        region: sedeCompleta,
        sede_completa: sedeCompleta,
        tipo_parceria: tipoParceria,
        tipoParceria: tipoParceria,
        tem_clientes: temClientesAtuais,
        experiencia: experiencia.trim(),
        fee_amount_aoa: 25000,
        payment_proof_url: comprovativoBase64,
        payment_proof_name: comprovativoNome,
        payment_proof_size: comprovativoTamanho,
        payment_proof_type: comprovativoTipo,
        status: 'pending' as const,
        created_at: Date.now(),
        createdAt: Date.now(),
      };

      // 1. Grava na coleção principal de candidaturas `partner_applications`
      await addDoc(collection(db, 'partner_applications'), applicationData);

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

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = '/documentos/Regulamento_Programa_Parceiros_KIVORA.pdf';
    link.download = 'Regulamento_Programa_Parceiros_KIVORA.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-24 pb-24 selection:bg-blue-600 selection:text-white">
      
      {/* Top Header & Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-6">
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
            <span className="text-slate-900 font-semibold">Candidatura Oficial & Condições</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200/60 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Credenciamento Oficial KIVORA SOFT • Visual Software, Lda.</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Candidatura de Parceiro Revendedor
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Consulte as <strong>condições oficiais</strong>, descarregue o <strong>regulamento em PDF</strong> e submeta a sua candidatura para integrar a rede de canais autorizados da <strong>Visual Software, Lda.</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Condições em PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setShowConditionsModal(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Ver Regulamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONDIÇÕES & REGULAMENTO DA PARCERIA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Documentação & Requisitos Oficiais
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                Condições de Acesso ao Programa de Parceria
              </h2>
            </div>

            {/* Abas de Navegação de Requisitos */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setConditionsTab('empresa')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  conditionsTab === 'empresa'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Empresa (Colectiva)</span>
              </button>
              <button
                type="button"
                onClick={() => setConditionsTab('singular')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  conditionsTab === 'singular'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Pessoa Singular</span>
              </button>
              <button
                type="button"
                onClick={() => setConditionsTab('comuns')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  conditionsTab === 'comuns'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Requisitos Comuns</span>
              </button>
              <button
                type="button"
                onClick={() => setConditionsTab('etapas')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  conditionsTab === 'etapas'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>4 Etapas da Parceria</span>
              </button>
            </div>
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="text-xs sm:text-xs">
            {conditionsTab === 'empresa' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Documentos Exigidos se for Empresa (Pessoa Colectiva):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-slate-900 block">Certidão de Registo Comercial</strong>
                      <span className="text-slate-500 text-[11px]">Actualizada, emitida há menos de 180 dias.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-slate-900 block">Alvará Comercial Válido</strong>
                      <span className="text-slate-500 text-[11px]">Correspondente à actividade de comércio/prestação de serviços.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-slate-900 block">Cartão de Contribuinte / NIF</strong>
                      <span className="text-slate-500 text-[11px]">Documento fiscal de identificação da empresa.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0">4</span>
                    <div>
                      <strong className="text-slate-900 block">Pacto Social / Estatutos</strong>
                      <span className="text-slate-500 text-[11px]">Estatutos da sociedade publicados em Diário da República ou escritura.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0">5</span>
                    <div>
                      <strong className="text-slate-900 block">Cópia do BI do(s) Sócio(s)-Gerente(s)</strong>
                      <span className="text-slate-500 text-[11px]">Identificação do representante legal com poderes para vincular.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0">6</span>
                    <div>
                      <strong className="text-slate-900 block">Comprovativo de Morada da Sede</strong>
                      <span className="text-slate-500 text-[11px]">Contrato de arrendamento ou título de propriedade do espaço físico.</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/70 text-blue-950 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Enquadramento Legal (Decreto Presidencial n.º 172/23):</strong> Algumas actividades de baixo risco encontram-se isentas de Alvará Comercial prévio, bastando o cadastro comercial na plataforma do GUE — a exigência deste documento será confirmada caso a caso pela direção da Visual Software.
                  </p>
                </div>
              </div>
            )}

            {conditionsTab === 'singular' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Documentos Exigidos se for Pessoa Singular (a título individual):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <strong className="text-slate-900 block">1. Cópia do Bilhete de Identidade</strong>
                    <span className="text-slate-500 text-[11px]">BI válido em território angolano.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <strong className="text-slate-900 block">2. NIF Pessoal</strong>
                    <span className="text-slate-500 text-[11px]">Corresponde ao BI (ou cartão fiscal para estrangeiros).</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <strong className="text-slate-900 block">3. Atestado de Residência</strong>
                    <span className="text-slate-500 text-[11px]">Comprovativo de morada actualizado.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <strong className="text-slate-900 block">4. Licenciamento Individual</strong>
                    <span className="text-slate-500 text-[11px]">Alvará ou licença em nome individual (quando aplicável).</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <strong className="text-slate-900 block">5. Experiência Comprovada</strong>
                    <span className="text-slate-500 text-[11px]">CV ou declaração de experiência em TI/Vendas/Comercial.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <strong className="text-slate-900 block">6. 2 Fotografias Tipo Passe</strong>
                    <span className="text-slate-500 text-[11px]">Fotografias recentes para registo do credenciamento.</span>
                  </div>
                </div>
              </div>
            )}

            {conditionsTab === 'comuns' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Requisitos e Compromissos Comuns a Ambos os Casos:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <strong className="text-slate-900 font-bold text-xs block">Formação Inicial KIVORA</strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Disponibilidade para uma breve formação técnica e comercial sobre as funcionalidades do KIVORA SOFT e a operação no Portal do Parceiro.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <strong className="text-slate-900 font-bold text-xs block">Ética & Boa Representação</strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Compromisso rigoroso com a ética comercial, integridade fiscal perante a AGT e boa representação da marca junto dos clientes finais.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <strong className="text-slate-900 font-bold text-xs block">Contrato de Parceria</strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Aceitação e assinatura do Contrato Oficial de Parceria de Revenda estabelecido pela Visual Software, Lda.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {conditionsTab === 'etapas' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Como Funciona na Prática (O Processo em 4 Etapas):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-700">
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-1">
                    <span className="font-mono font-black text-blue-600 text-xs uppercase">Etapa 1</span>
                    <h4 className="font-bold text-slate-900 text-xs">Adesão & Taxa</h4>
                    <p className="text-slate-600 text-[11px]">
                      Preenche o formulário e efectua o pagamento único de adesão (25.000 Kz).
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-1">
                    <span className="font-mono font-black text-blue-600 text-xs uppercase">Etapa 2</span>
                    <h4 className="font-bold text-slate-900 text-xs">Assinatura de Contrato</h4>
                    <p className="text-slate-600 text-[11px]">
                      Assina o Contrato de Parceria de Revenda com a Visual Software formalizando a colaboração.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-1">
                    <span className="font-mono font-black text-blue-600 text-xs uppercase">Etapa 3</span>
                    <h4 className="font-bold text-slate-900 text-xs">Activação do Acesso</h4>
                    <p className="text-slate-600 text-[11px]">
                      Recebe as credenciais do Portal do Parceiro e o Comprovativo de Parceiro Credenciado.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-1">
                    <span className="font-mono font-black text-blue-600 text-xs uppercase">Etapa 4</span>
                    <h4 className="font-bold text-slate-900 text-xs">Emissão & Venda</h4>
                    <p className="text-slate-600 text-[11px]">
                      Emite licenças directamente no Portal para os seus clientes, lucrando com as margens de revenda.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Grid: Dados Bancários & Formulário */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: Benefícios & Dados Bancários */}
        <aside className="lg:col-span-5 space-y-5">
          
          {/* Card: O que ganha como Parceiro */}
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 card-glow-blue">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <span>O que ganha como Parceiro KIVORA</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Comprovativo Oficial:</strong> Certificado de Parceiro Revendedor Credenciado pela Visual Software.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Acesso Autónomo:</strong> Emissão imediata de licenças para os seus clientes 24h por dia no Portal.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Preços de Atacado:</strong> Margens lucrativas de revenda em software e hardware POS.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Suporte de Engenharia:</strong> Apoio técnico dedicado da equipa de desenvolvimento.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Material Promocional:</strong> Apoio comercial e kit de marketing oficial para divulgação.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cobertura Nacional:</strong> Liberdade total para atender clientes em qualquer província de Angola.</span>
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
                <span>Valor Único de Adesão</span>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-3 py-1 rounded-full">
                Taxa de Adesão
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-950 tracking-tight font-mono-num">
                  {fmt(policy.partner_membership_fee_aoa ?? 25000)} Kz
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pagamento único no acto de adesão. Dá acesso à activação da conta no Portal do Parceiro, emissão do Comprovativo Oficial de Credenciamento e pacote inicial de apoio comercial.
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
                  <span className="text-slate-500 text-[11px] font-semibold">IBAN Oficial:</span>
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

            <div className="pt-1">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Descarregar PDF das Condições Oficiais</span>
              </button>
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
                    Candidatura Submetida com Sucesso
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">Proposta em Análise</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    A sua proposta e o comprovativo de 25.000 Kz foram registados no sistema. A direção comercial da <strong>Visual Software, Lda.</strong> validará a documentação para emissão do seu Comprovativo e credenciais de acesso ao Portal do Parceiro.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-2.5 text-left text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Protocolo:</span>
                    <strong className="text-blue-600 font-mono font-bold text-sm">{submittedProtocol}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Entidade:</span>
                    <strong className="text-slate-900 font-semibold">{empresa || nome}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Tipo:</span>
                    <strong className="text-slate-900 font-semibold">
                      {tipoCandidato === 'empresa' ? 'Empresa (Pessoa Colectiva)' : 'Pessoa Singular'}
                    </strong>
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
                    Formulário de Inscrição Oficial
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preencha os dados abaixo e anexe o comprovativo da taxa única de adesão (25.000 Kz).
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 0. Tipo de Candidato */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 block">Tipo de Candidatura *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoCandidato('empresa')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        tipoCandidato === 'empresa'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className={`w-4 h-4 ${tipoCandidato === 'empresa' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="block text-xs font-bold">Empresa</span>
                        <span className="block text-[10px] text-slate-500">Pessoa Colectiva</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoCandidato('singular')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        tipoCandidato === 'singular'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <User className={`w-4 h-4 ${tipoCandidato === 'singular' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="block text-xs font-bold">Pessoa Singular</span>
                        <span className="block text-[10px] text-slate-500">Profissional Individual</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 1. Dados da Entidade */}
                <div className="space-y-4 pt-1">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>
                      {tipoCandidato === 'empresa' ? '1. Dados da Empresa' : '1. Dados do Profissional'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_empresa" className="font-semibold text-slate-700">
                        {tipoCandidato === 'empresa' ? 'Nome Comercial da Empresa *' : 'Nome Comercial ou Pessoal *'}
                      </label>
                      <input
                        id="cand_empresa"
                        type="text"
                        required
                        placeholder={tipoCandidato === 'empresa' ? 'Ex: Luanda Informática, Lda' : 'Ex: João Manuel / JM Solutions'}
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cand_nif" className="font-semibold text-slate-700">
                        {tipoCandidato === 'empresa' ? 'NIF da Empresa *' : 'NIF / Nº do Bilhete de Identidade *'}
                      </label>
                      <input
                        id="cand_nif"
                        type="text"
                        required
                        placeholder={tipoCandidato === 'empresa' ? 'Ex: 5001234567' : 'Ex: 004123456LA042'}
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
                    <span>2. Responsável & Contactos Directos</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_nome" className="font-semibold text-slate-700">Nome do Representante / Titular *</label>
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
                        placeholder={tipoCandidato === 'empresa' ? 'Ex: Sócio-Gerente / Diretor Comercial' : 'Ex: Técnico de TI / Consultor'}
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_email" className="font-semibold text-slate-700">Email Oficial de Contacto *</label>
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
                      <label htmlFor="cand_telefone" className="font-semibold text-slate-700">Telemóvel / WhatsApp Directo *</label>
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
                    <span>3. Localização & Sede</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_provincia" className="font-semibold text-slate-700">Província Principal *</label>
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
                      <label htmlFor="cand_municipio" className="font-semibold text-slate-700">Município / Bairro / Endereço *</label>
                      <input
                        id="cand_municipio"
                        type="text"
                        required
                        placeholder="Ex: Talatona, Viana, Belas, Maianga..."
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
                      <span>4. Comprovativo da Taxa de Adesão (25.000 Kz) *</span>
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
                        Clique para selecionar o comprovativo bancário da taxa de 25.000 Kz
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
                      Observações / Experiência Prévia em TI ou Vendas (Opcional)
                    </label>
                    <textarea
                      id="cand_experiencia"
                      rows={2}
                      placeholder="Breve resumo da sua experiência comercial ou técnica..."
                      value={experiencia}
                      onChange={(e) => setExperiencia(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Declaração e Termos de Parceria */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="concorda_termos"
                      type="checkbox"
                      checked={concordaTermos}
                      onChange={(e) => setConcordaTermos(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="concorda_termos" className="cursor-pointer select-none leading-relaxed">
                      Declaro a veracidade dos dados apresentados e aceito as <strong>Condições e Regulamento do Programa de Parceria da Visual Software, Lda.</strong>{' '}
                      <button
                        type="button"
                        onClick={() => setShowConditionsModal(true)}
                        className="text-blue-600 hover:text-blue-700 font-bold underline inline-flex items-center gap-0.5 ml-1"
                      >
                        (Consultar Regulamento Completo em PDF)
                      </button>
                    </label>
                  </div>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={submitting || !concordaTermos}
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

      {/* MODAL OFICIAL DE REGULAMENTO & CONDIÇÕES EM PDF */}
      {showConditionsModal && (
        <PartnerProgramConditionsModal onClose={() => setShowConditionsModal(false)} />
      )}

    </div>
  );
};



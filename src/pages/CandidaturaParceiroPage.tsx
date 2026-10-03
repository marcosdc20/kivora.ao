import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, ArrowLeft, Send, Loader2,
  Award, MessageSquare,
  ChevronRight, UploadCloud, FileText, Trash2,
  Paperclip, AlertCircle, Copy, Check, Building2, MapPin,
  CreditCard, User, Download, Eye
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
import { cleanFirestoreData } from '../lib/firestoreUtils';

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
  const [copiedIban, setCopiedIban] = useState<string | null>(null);

  useEffect(() => {
    const unsubSettings = subscribeSystemSettings(setSettings);
    const unsubPolicy = subscribePartnerPolicy(setPolicy);
    return () => {
      unsubSettings();
      unsubPolicy();
    };
  }, []);

  const handleCopyIban = (iban: string, bankKey: string) => {
    navigator.clipboard.writeText(iban.replace(/\s/g, ''));
    setCopiedIban(bankKey);
    setTimeout(() => setCopiedIban(null), 2000);
  };

  const compressImage = (file: File): Promise<{ base64: string; sizeFormatted: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const raw = e.target?.result as string;
            resolve({ base64: raw, sizeFormatted: `${Math.round(file.size / 1024)} KB` });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.7;
          let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          let approxBytes = Math.round((compressedBase64.length * 3) / 4);

          // Proteção Firestore 1MB: se exceder 350KB, recomprime a 0.5
          if (approxBytes > 350 * 1024) {
            quality = 0.5;
            compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            approxBytes = Math.round((compressedBase64.length * 3) / 4);
          }

          const sizeStr = approxBytes > 1024 * 1024
            ? `${(approxBytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(approxBytes / 1024)} KB`;

          resolve({ base64: compressedBase64, sizeFormatted: sizeStr });
        };
        img.onerror = () => reject(new Error('Erro ao processar imagem'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erro ao ler ficheiro'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setComprovativoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setComprovativoError('O ficheiro original é demasiado grande (> 10 MB).');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setComprovativoError('Formato inválido. Por favor anexe uma imagem (JPG, PNG, WEBP) ou documento PDF.');
      return;
    }

    if (file.type === 'application/pdf') {
      if (file.size > 400 * 1024) {
        setComprovativoError('O documento PDF selecionado excede 400 KB. Por favor comprima o PDF ou utilize uma foto/captura de ecrã do comprovativo.');
        return;
      }
      const sizeFormatted = `${Math.round(file.size / 1024)} KB`;
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
    } else {
      setComprovativoNome(file.name);
      setComprovativoTipo('image/jpeg');
      try {
        const { base64, sizeFormatted } = await compressImage(file);
        setComprovativoBase64(base64);
        setComprovativoTamanho(sizeFormatted);
      } catch {
        setComprovativoError('Erro ao processar imagem do comprovativo. Tente novamente.');
      }
    }
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
        name: empresa.trim() || nome.trim(),
        nome: nome.trim(),
        contact_name: nome.trim(),
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

      // 1. Grava na coleção principal de candidaturas `partner_applications` sanitizando valores undefined
      await addDoc(collection(db, 'partner_applications'), cleanFirestoreData(applicationData));

      // 2. Disparo de e-mails automáticos
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

      // 3. Disparo opcional de webhook externo
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
      console.error('Erro ao submeter candidatura no Firebase:', err);
      setError(
        'Não foi possível registar a candidatura no sistema. Por favor tente novamente ou contacte o suporte Kivora pelo WhatsApp oficial. Motivo: ' +
          (err?.message || 'Falha de comunicação')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const phoneDigits = (settings.phoneDisplay || settings.phone || '244974855494').replace(/\D/g, '');
  const getWhatsAppLink = () => {
    const msg = `Olá Direção da Visual Software! Submeti a minha candidatura para me tornar Parceiro Oficial KIVORA.%0A%0A*Protocolo:* ${submittedProtocol}%0A*Empresa:* ${empresa || nome}%0A*NIF:* ${nif}%0A*Responsável:* ${nome}%0A*Província:* ${provincia}%0A%0ASolicito a validação do comprovativo e ativação das credenciais do Portal do Parceiro.`;
    return `https://wa.me/${phoneDigits}?text=${msg}`;
  };

  const ibanOficial1 = policy.membership_bank_info?.iban || settings.ibanBai || '';
  const bancoOficial1 = policy.membership_bank_info?.bank || settings.bank1Name || 'Banco BAI';

  const ibanOficial2 = policy.membership_bank_info_2?.iban || settings.ibanBfa || '';
  const bancoOficial2 = policy.membership_bank_info_2?.bank || settings.bank2Name || 'Banco BFA';

  const hasBank1 = Boolean(ibanOficial1 && ibanOficial1.trim().length > 0);
  const hasBank2 = Boolean(ibanOficial2 && ibanOficial2.trim().length > 0);

  const titularOficial = policy.membership_bank_info?.beneficiary || settings.ibanTitular || 'VISUAL SOFTWARE LIMITADA';
  const nifOficial = settings.ibanTitularNif || settings.nif || '5002863944';

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
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#FF6500] bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs hover:border-orange-300 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF6500]" />
            <span>Voltar ao Programa de Parceiros</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Parcerias</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[#FF6500] font-bold">Candidatura Oficial & Condições</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/70 text-[#FF6500] px-3.5 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#FF6500]" />
              <span>Credenciamento Oficial KIVORA SOFT • Visual Software, Lda.</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
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
              className="inline-flex items-center gap-2 bg-[#FF6500] hover:bg-[#EB5B00] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md shadow-orange-500/25 transition-all cursor-pointer hover:shadow-orange-500/40 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Condições em PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setShowConditionsModal(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-full border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Ver Regulamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Benefícios/Dados Bancários & Formulário */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: Vantagens & Adesão Oficial */}
        <aside className="lg:col-span-5 space-y-6">
          
          {/* Card: Vantagens da Parceria */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 text-[#FF6500] flex items-center justify-center font-bold shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">Vantagens do Canal Autorizado</h3>
                <p className="text-[11px] text-slate-500">Benefícios directos da parceria KIVORA</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-slate-900">Margens até 40%:</strong> Preços de atacado altamente lucrativos em licenças de software e equipamentos POS.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-slate-900">Emissão Imediata 24/7:</strong> Autonomia total para ativar e gerir licenças dos seus clientes no Portal do Parceiro.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-slate-900">Suporte Técnico Direto:</strong> Apoio contínuo de engenharia para parametrizações, redes locais e regras fiscais AGT.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-slate-900">Certificado Oficial:</strong> Comprovativo de credenciamento oficial emitido pela Visual Software, Lda.</span>
              </div>
            </div>
          </div>

          {/* Card: Taxa de Adesão & Coordenadas Bancárias */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B1528] text-amber-400 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Taxa Única de Adesão</h3>
                  <span className="text-[11px] text-slate-500">Credenciamento & Ativação de Canal</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#FF6500] bg-orange-50 border border-orange-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Pagamento Único
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-950 tracking-tight font-mono-num">
                  {fmt(policy.partner_membership_fee_aoa ?? 25000)} Kz
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pagamento único de credenciamento. Inclui ativação de conta no Portal do Parceiro, kit promocional e certificado oficial de revendedor.
              </p>
            </div>

            {/* Coordenadas Bancárias */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-3 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Beneficiário:</span>
                <span className="font-bold text-slate-900 text-right">{titularOficial}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">NIF da Entidade:</span>
                <span className="font-mono font-bold text-slate-900">{nifOficial}</span>
              </div>

              {/* Banco 1 */}
              {hasBank1 && (
                <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{bancoOficial1}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyIban(ibanOficial1, 'bank1')}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF6500] hover:text-[#EB5B00] bg-white hover:bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full cursor-pointer transition-colors shadow-2xs"
                    >
                      {copiedIban === 'bank1' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar IBAN</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#0B1528] rounded-xl font-mono text-[11px] font-bold text-amber-400 select-all tracking-wider text-center shadow-inner">
                    {ibanOficial1}
                  </div>
                </div>
              )}

              {/* Banco 2 */}
              {hasBank2 && (
                <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{bancoOficial2}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyIban(ibanOficial2, 'bank2')}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF6500] hover:text-[#EB5B00] bg-white hover:bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full cursor-pointer transition-colors shadow-2xs"
                    >
                      {copiedIban === 'bank2' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar IBAN</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#0B1528] rounded-xl font-mono text-[11px] font-bold text-amber-400 select-all tracking-wider text-center shadow-inner">
                    {ibanOficial2}
                  </div>
                </div>
              )}

              {!hasBank1 && !hasBank2 && (
                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 italic">
                  Coordenadas bancárias a serem disponibilizadas pelo administrador.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center gap-2 bg-[#0B1528] hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-full transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6500]" />
              <span>Baixar Regulamento Completo (PDF)</span>
            </button>
          </div>

        </aside>

        {/* COLUNA DIREITA: Formulário Executivo */}
        <section className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            
            {submittedProtocol ? (
              /* ESTADO: Sucesso */
              <div className="text-center py-6 space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
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
                    <strong className="text-[#FF6500] font-mono font-bold text-sm">{submittedProtocol}</strong>
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
                    className="inline-flex items-center justify-center gap-2 w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-6 rounded-full shadow-sm transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Avisar Administração via WhatsApp</span>
                  </a>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto bg-[#0B1528] hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all cursor-pointer"
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
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-6 py-2.5 rounded-full border border-slate-200 transition-all cursor-pointer"
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
                  <h2 className="text-base font-extrabold text-slate-900">
                    Formulário de Inscrição Oficial
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preencha os dados abaixo e anexe o comprovativo da taxa única de adesão (25.000 Kz).
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 0. Tipo de Candidato */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 block text-xs">Tipo de Candidatura *</label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setTipoCandidato('empresa')}
                      className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                        tipoCandidato === 'empresa'
                          ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <Building2 className={`w-4 h-4 ${tipoCandidato === 'empresa' ? 'text-[#FF6500]' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <span className="block text-xs font-bold leading-tight">Empresa</span>
                        <span className="block text-[10px] text-slate-500 font-normal">Pessoa Colectiva</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoCandidato('singular')}
                      className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                        tipoCandidato === 'singular'
                          ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <User className={`w-4 h-4 ${tipoCandidato === 'singular' ? 'text-[#FF6500]' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <span className="block text-xs font-bold leading-tight">Pessoa Singular</span>
                        <span className="block text-[10px] text-slate-500 font-normal">Profissional Individual</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 1. Dados da Entidade */}
                <div className="space-y-4 pt-1">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#FF6500]" />
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-orange-500/10 outline-none uppercase transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Responsável e Contactos */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#FF6500]" />
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Localização */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF6500]" />
                    <span>3. Localização & Sede</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="cand_provincia" className="font-semibold text-slate-700">Província Principal *</label>
                      <select
                        id="cand_provincia"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:border-[#FF6500] outline-none transition-all"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Comprovativo Bancário */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FF6500]" />
                      <span>4. Comprovativo da Taxa de Adesão (25.000 Kz)</span>
                    </div>
                    <span className="text-[10px] text-[#FF6500] bg-orange-50 px-2.5 py-0.5 rounded-full font-bold border border-orange-200/60">
                      Opcional no Envio
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
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#FF6500] bg-slate-50 hover:bg-orange-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="w-8 h-8 text-[#FF6500] mb-2" />
                      <span className="text-xs font-bold text-slate-800">
                        Clique para anexar o comprovativo bancário (opcional)
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 max-w-sm">
                        Formatos aceites: Imagens (PNG, JPG, WEBP) ou PDF (até 400 KB). Pode anexar agora ou enviar posteriormente ao suporte comercial.
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-[#FF6500] outline-none transition-all"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-[#FF6500] outline-none transition-all"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-orange-500/10 outline-none transition-all resize-none"
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
                      className="mt-0.5 w-4 h-4 rounded text-[#FF6500] focus:ring-orange-500 border-slate-300 cursor-pointer accent-[#FF6500]"
                    />
                    <label htmlFor="concorda_termos" className="cursor-pointer select-none leading-relaxed">
                      Declaro a veracidade dos dados apresentados e aceito as <strong>Condições e Regulamento do Programa de Parceria da Visual Software, Lda.</strong>{' '}
                      <button
                        type="button"
                        onClick={() => setShowConditionsModal(true)}
                        className="text-[#FF6500] hover:text-[#EB5B00] font-bold underline inline-flex items-center gap-0.5 ml-1"
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
                  className="w-full bg-[#FF6500] hover:bg-[#EB5B00] disabled:opacity-50 text-white font-bold text-sm py-4 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all cursor-pointer"
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



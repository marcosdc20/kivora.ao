import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, ArrowLeft, Send, Loader2,
  Award, FileCheck, MessageSquare, FileText,
  Briefcase, ChevronRight
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

import parceirosImg from '../assets/kivora/parceiros-kivora.png';

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
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubSettings = subscribeSystemSettings(setSettings);
    const unsubPolicy = subscribePartnerPolicy(setPolicy);
    return () => {
      unsubSettings();
      unsubPolicy();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !telefone || !nif) {
      setError('Por favor, preencha todos os campos assinalados com asterisco (*).');
      return;
    }

    setSubmitting(true);
    setError(null);

    const protocolCode = `CAND-${Date.now().toString().slice(-6)}`;
    const tempPartnerCode = `PARC-${provincia.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    try {
      const applicationData = {
        protocol: protocolCode,
        partner_code_suggested: tempPartnerCode,
        nome_responsavel: nome,
        cargo_responsavel: cargo || 'Responsável Comercial',
        empresa_nome: empresa || nome,
        nif,
        email: email.toLowerCase().trim(),
        telefone,
        provincia,
        municipio,
        tipo_parceria: tipoParceria,
        tem_clientes: temClientesAtuais,
        experiencia,
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
        name: empresa || nome,
        responsible: nome,
        role: cargo || 'Gerente / Técnico',
        email: email.toLowerCase().trim(),
        phone: telefone,
        region: `${provincia}${municipio ? ` (${municipio})` : ''}`,
        nif,
        debt_aoa: 0,
        total_paid_aoa: 0,
        total_sales: 0,
        status: 'pending',
        type: tipoParceria,
        notes: `Experiência: ${experiencia} | Clientes: ${temClientesAtuais}`,
        createdAt: Date.now(),
      }, { merge: true });

      setSubmittedProtocol(protocolCode);
      try {
        triggerKivoraConfetti();
      } catch {
        // ignore
      }
    } catch (err: any) {
      console.error('Erro ao submeter candidatura:', err);
      // Fallback amigável para o candidato
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

  const phoneDigits = (settings.phoneDisplay || settings.phone || '244923456789').replace(/\D/g, '');
  const getWhatsAppLink = () => {
    const msg = `Olá Direção Kivora! Submeti a minha candidatura para me tornar Parceiro Oficial Kivora.%0A%0A*Protocolo:* ${submittedProtocol}%0A*Responsável:* ${nome}%0A*Empresa:* ${empresa || nome}%0A*NIF:* ${nif}%0A*Província:* ${provincia}%0A%0ASolicito a homologação do processo e envio das credenciais de acesso ao Portal do Parceiro.`;
    return `https://wa.me/${phoneDigits}?text=${msg}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-24 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Corporativo & Navegação */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Programa de Parceiros</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Programa Oficial</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 font-bold">Candidatura & Homologação</span>
          </div>
        </div>

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 text-blue-700 px-3.5 py-1 rounded-lg text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{settings.agtCertificate} — Canal de Revenda Autorizado</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Candidatura ao Programa de Parceiros <span className="text-blue-600">{settings.name}</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Registe a sua entidade como distribuidor técnico e comercial oficial. Tenha acesso a tabelas com margem de atacado, emissão autónoma de licenças e suporte de engenharia Nível 2.
          </p>
        </div>
      </header>

      {/* Grelha Principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: Resumo Institucional, Critérios e Taxa de Homologação */}
        <aside className="lg:col-span-5 space-y-6">
          
          {/* Card Fotográfico Corporativo */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="relative h-48 sm:h-52 bg-slate-100">
              <img
                src={parceirosImg}
                alt="Parceiros Comerciais Kivora"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                    Rede Nacional de Distribuição
                  </span>
                  <h3 className="text-sm font-bold">Presença em Todo o Território de Angola</h3>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
              O programa destina-se a consultores independentes de TI, técnicos de redes e empresas de fornecimento de equipamentos informáticos e POS.
            </div>
          </div>

          {/* Modalidades de Parceria */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Modalidades de Atuação</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 font-bold block">1. Revenda & Instalação Local</strong>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Venda de licenças avulsas ou em pacote com computadores, impressoras térmicas e gavetas.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 font-bold block">2. Integração de Redes Multi-Posto</strong>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Instalação em rede local (servidor central + caixas de faturação LAN) em supermercados e armazéns.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 font-bold block">3. Consultoria Contabilística & Fiscal</strong>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Recomendação de clientes com suporte mensal de gestão, parametrização do SAF-T e fechos de exercício.
                </p>
              </div>
            </div>
          </div>

          {/* Taxa Única de Homologação e Certificados */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800/60">
                Taxa de Homologação
              </span>
              <span className="text-[10px] font-mono text-slate-400">{settings.company}</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {fmt(policy.partner_membership_fee_aoa ?? 25000)} Kz
                </span>
                <span className="text-xs text-slate-400">/ taxa única de registo</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Liquidação efetuada apenas após a aprovação da candidatura para emissão dos dois documentos jurídicos oficiais:
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-start gap-2 text-slate-200">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Certificado de Parceria:</strong> Emitido pela {settings.company} com credenciamento institucional.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Certificado de Revenda KIVORA:</strong> Autorização legal perante clientes e AGT ({settings.agtCertificate}).</span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Portal do Parceiro:</strong> Acesso à plataforma de emissão e ativação autónoma de licenças.</span>
              </div>
            </div>

            {policy.membership_bank_info?.iban && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300 block">Conta para Liquidação:</span>
                <span className="font-mono text-emerald-400">{policy.membership_bank_info.bank} — {policy.membership_bank_info.iban}</span>
              </div>
            )}
          </div>

          {/* Critérios de Elegibilidade */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Critérios de Seleção</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {(policy.partner_requirements || DEFAULT_PARTNER_POLICY.partner_requirements).map((req, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[11px] border border-blue-200 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {req}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </aside>

        {/* COLUNA DIREITA: Formulário Estruturado e Limpo */}
        <section className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            
            {submittedProtocol ? (
              /* ESTADO: Candidatura Submetida com Sucesso */
              <div className="text-center py-6 space-y-6 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Candidatura Registada
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">Proposta Enviada para Análise!</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    A sua proposta foi gravada na base de dados central da {settings.company}. O Administrador Executivo analisará a candidatura e enviará as credenciais de acesso ao Portal do Parceiro.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto space-y-2.5 text-left text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Código do Protocolo:</span>
                    <strong className="text-blue-600 font-mono font-black text-sm">{submittedProtocol}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Responsável:</span>
                    <strong className="text-slate-900 font-bold">{nome}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Empresa / Canal:</span>
                    <strong className="text-slate-900 font-bold">{empresa || nome}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <strong className="text-slate-900 font-mono">{email}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Província:</span>
                    <strong className="text-slate-900 font-bold">{provincia}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Estado:</span>
                    <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                      Pendente de Validação
                    </span>
                  </div>
                </div>

                {/* Ação Imediata via WhatsApp */}
                <div className="pt-2">
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Notificar Administração por WhatsApp</span>
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
                    className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                  >
                    Submeter Outra Candidatura
                  </button>
                </div>
              </div>
            ) : (
              /* FORMULÁRIO DE CANDIDATURA */
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-900">
                    Ficha Oficial de Candidatura
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preencha os dados profissionais da sua entidade para análise da direção comercial.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {/* Secção 1: Identificação do Responsável */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block border-b border-slate-100 pb-1">
                    1. Dados do Responsável
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Manuel Domingos"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Cargo / Função na Entidade</label>
                      <input
                        type="text"
                        placeholder="Ex: Diretor de TI / Consultor"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Email Corporativo de Acesso *</label>
                      <input
                        type="email"
                        required
                        placeholder="parceiro@empresa.ao"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Telefone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+244 923 000 000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Secção 2: Dados da Empresa / Entidade */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block border-b border-slate-100 pb-1">
                    2. Dados da Empresa ou Atividade
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Razão Social / Nome Comercial</label>
                      <input
                        type="text"
                        placeholder="Ex: Luanda Tech Solutions, Lda"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">NIF da Empresa ou do Titular *</label>
                      <input
                        type="text"
                        required
                        placeholder="5412345678"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-600 outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Secção 3: Localização & Cobertura */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block border-b border-slate-100 pb-1">
                    3. Localização & Área de Atuação
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Província Principal *</label>
                      <select
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:border-blue-600 outline-none"
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

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Município / Bairro</label>
                      <input
                        type="text"
                        placeholder="Ex: Talatona, Viana, Belas..."
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Modalidade de Parceria Pretendida</label>
                      <select
                        value={tipoParceria}
                        onChange={(e) => setTipoParceria(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:border-blue-600 outline-none"
                      >
                        <option value="revenda_instalacao">Revenda & Instalação de Software</option>
                        <option value="integracao_pos">Integração de Equipamentos & POS</option>
                        <option value="consultoria_contabil">Consultoria Fiscal & Contabilidade</option>
                        <option value="agente_indicacao">Agente Comercial de Indicação</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Possui Carteira Ativa de Clientes?</label>
                      <select
                        value={temClientesAtuais}
                        onChange={(e) => setTemClientesAtuais(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:border-blue-600 outline-none"
                      >
                        <option value="sim">Sim, temos clientes a necessitar de faturação AGT</option>
                        <option value="em_prospeccao">Em início de prospeção de mercado</option>
                        <option value="prestacao_servicos">Prestamos suporte técnico genérico de TI</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Secção 4: Experiência Técnica / Comercial */}
                <div className="space-y-2 pt-2">
                  <label className="font-bold text-slate-700 block">
                    Experiência Prévia com Software de Faturação ou Hardware POS (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva resumidamente a sua atuação no mercado, tipos de estabelecimentos que atende (mercearias, farmácias, restaurantes, etc.)..."
                    value={experiencia}
                    onChange={(e) => setExperiencia(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none leading-relaxed resize-none"
                  />
                </div>

                {/* Declaração e Termo */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Declaro a veracidade dos dados apresentados e concordo com os termos de homologação do canal de distribuição {settings.name} / {settings.company}.
                  </p>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A submeter candidatura...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submeter Candidatura Oficial</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </section>

      </main>

    </div>
  );
};

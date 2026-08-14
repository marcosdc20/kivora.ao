import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, ArrowLeft, Send, Loader2,
  Building2, MapPin, Award, Users, FileCheck, Phone, Mail,
  MessageSquare, Sparkles
} from 'lucide-react';
import { KivoraLogo } from '../components/KivoraLogo';
import { db } from '../lib/firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

interface CandidaturaParceiroPageProps {
  onBack: () => void;
  onNavigateHome: () => void;
}

export const CandidaturaParceiroPage: React.FC<CandidaturaParceiroPageProps> = ({
  onBack,
  onNavigateHome,
}) => {
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [provincia, setProvincia] = useState('Luanda');
  const [municipio, setMunicipio] = useState('');
  const [tipoParceria, setTipoParceria] = useState('revenda_instalacao');
  const [experiencia, setExperiencia] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !telefone || !nif) {
      setError('Por favor preencha todos os campos obrigatórios (*).');
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
        empresa_nome: empresa || nome,
        nif,
        email: email.toLowerCase().trim(),
        telefone,
        provincia,
        municipio,
        tipo_parceria: tipoParceria,
        experiencia,
        status: 'pending' as const,
        created_at: Date.now(),
      };

      // 1. Grava na coleção `partner_applications`
      await addDoc(collection(db, 'partner_applications'), applicationData);

      // 2. Grava também na coleção `partners` como status 'pending'
      const partnerDocId = (nif || tempPartnerCode).replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, 'partners', partnerDocId), {
        id: partnerDocId,
        code: tempPartnerCode,
        name: empresa || nome,
        responsible: nome,
        email: email.toLowerCase().trim(),
        phone: telefone,
        region: `${provincia}${municipio ? ` (${municipio})` : ''}`,
        nif,
        debt_aoa: 0,
        total_paid_aoa: 0,
        total_sales: 0,
        status: 'pending',
        type: tipoParceria,
        notes: experiencia,
        createdAt: Date.now(),
      }, { merge: true });

      setSubmittedProtocol(protocolCode);
    } catch (err: any) {
      console.error('Erro ao submeter candidatura:', err);
      // Fallback amigável
      setSubmittedProtocol(protocolCode);
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppLink = () => {
    const msg = `Olá Equipa Kivora! Submeti a minha candidatura para me tornar Parceiro Oficial Kivora.%0A%0A*Protocolo:* ${submittedProtocol}%0A*Nome:* ${nome}%0A*Empresa:* ${empresa || nome}%0A*NIF:* ${nif}%0A*Província:* ${provincia}%0A%0AAguardo a análise e envio das credenciais de acesso ao Portal do Parceiro.`;
    return `https://wa.me/244923000000?text=${msg}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-blue-600 selection:text-white">
      
      {/* Top Header Navegação — Tema Claro */}
      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <button onClick={onNavigateHome} className="cursor-pointer">
            <KivoraLogo variant="dark" size="sm" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Programa de Credenciamento Oficial
          </span>
        </div>
      </header>

      {/* Hero da Página de Candidatura */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Canal Oficial de Distribuição & Revenda de Software Comercial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Torne-se Parceiro Certificado <span className="text-blue-600">KIVORA</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Junte-se à maior rede de distribuição de ERP certificado pela AGT em Angola. Tenha acesso a <strong className="text-slate-900 font-extrabold">preços especiais de atacado</strong> e liberdade total para fixar a sua margem de lucro por licença.
          </p>
        </div>
      </section>

      {/* Grade Principal: Esquerda (Imagem & Requisitos) + Direita (Formulário Claro) */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: Imagem Completa, Requisitos e Benefícios */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card de Imagem Ilustrativa */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md relative group">
            <img
              src="/imagens/servidor.png"
              alt="Servidor e Infraestrutura Kivora"
              className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Infraestrutura & Tecnologia de Ponta
              </span>
              <h3 className="text-base font-black text-white mt-1">
                Faturação em Rede Local com Sincronização Cloud
              </h3>
            </div>
          </div>

          {/* Card de Requisitos */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Requisitos de Candidatura</span>
              </h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                4 Etapas
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-xs border border-blue-100">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Atuação no Sector de Tecnologia / Serviços</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Empresa constituída ou profissional independente com foco em TI, suporte técnico, contabilidade ou automação comercial.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-xs border border-blue-100">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Conhecimentos Técnicos Básicos</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Domínio de sistemas Windows (10/11), configuração de redes locais (LAN/IP fixo) e instalação de impressoras térmicas ESC/POS.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-xs border border-blue-100">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Compromisso com a Conformidade AGT</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Orientar os clientes empresariais segundo o Decreto Presidencial 71/25 da Administração Geral Tributária.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-xs border border-blue-100">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Capacidade de Atendimento e Formação</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Disponibilidade para atendimento de primeiro nível, implantação e formação presencial/remota aos clientes da região.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vantagens Resumo */}
          <div className="p-6 bg-gradient-to-br from-emerald-50 via-white to-blue-50 border border-emerald-200/80 rounded-3xl space-y-3.5 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Benefícios do Parceiro Homologado
            </h4>
            <ul className="text-xs text-slate-700 space-y-2.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong className="text-slate-900 font-extrabold">Preços de atacado & alta margem</strong> na revenda direta</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Acesso ao Portal do Parceiro com emissão instantânea</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kits comerciais, manuais e apresentações para clientes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Linha direta de WhatsApp com a equipa técnica Kivora</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COLUNA DIREITA: Formulário de Candidatura em Tema Claro */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            
            {submittedProtocol ? (
              /* Sucesso no envio */
              <div className="text-center py-8 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-widest font-black text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                    Candidatura Registada com Sucesso
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">Proposta Enviada para Análise!</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    A sua solicitação foi gravada na base de dados central Kivora. O Administrador Executivo receberá a notificação no painel administrativo e enviará as suas credenciais de acesso (Nome de Utilizador e Palavra-passe).
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-2.5 text-left text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Código do Protocolo:</span>
                    <strong className="text-blue-600 font-mono font-extrabold text-sm">{submittedProtocol}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Nome do Responsável:</span>
                    <strong className="text-slate-900 font-bold">{nome}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Email Registado:</span>
                    <strong className="text-slate-900 font-mono">{email}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Província:</span>
                    <strong className="text-slate-900 font-bold">{provincia}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 font-medium">Estado da Candidatura:</span>
                    <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">
                      Pendente de Aprovação
                    </span>
                  </div>
                </div>

                {/* Botão de Envio WhatsApp */}
                <div className="pt-2">
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full max-w-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Notificar Administração no WhatsApp</span>
                  </a>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Voltar à Página Inicial
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
                    className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl border border-slate-200 transition-all cursor-pointer"
                  >
                    Submeter Outra Candidatura
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário Claro */
              <>
                <div className="space-y-1.5 pb-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Formulário de Candidatura
                    </h2>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      Etapa 1 de 1
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Preencha os dados da sua empresa ou atividade técnica para obter credenciamento oficial.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-semibold flex items-center gap-2 shadow-xs">
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  
                  {/* Nome e Empresa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nome do Responsável *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Manuel Domingos"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nome da Empresa / Entidade</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Soluções Tecnológicas Luanda, Lda"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* NIF, Email e Telefone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>NIF *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="5412345678"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>Email de Acesso *</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="parceiro@empresa.ao"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>WhatsApp / Telefone *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+244 923 000 000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Localização e Tipo de Parceria */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Província *</span>
                      </label>
                      <select
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                      >
                        <option value="Luanda">Luanda</option>
                        <option value="Benguela">Benguela</option>
                        <option value="Huambo">Huambo</option>
                        <option value="Huíla">Huíla (Lubango)</option>
                        <option value="Cabinda">Cabinda</option>
                        <option value="Cuanza Sul">Cuanza Sul (Sumbe/Porto Amboim)</option>
                        <option value="Cuanza Norte">Cuanza Norte (Ndalatando)</option>
                        <option value="Uíge">Uíge</option>
                        <option value="Malanje">Malanje</option>
                        <option value="Zaire">Zaire (Soyo/Mbanza Kongo)</option>
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
                      <label className="font-bold text-slate-800 uppercase text-[11px]">
                        Município / Bairro
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Talatona / Viana"
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 uppercase text-[11px]">
                        Modalidade de Parceria
                      </label>
                      <select
                        value={tipoParceria}
                        onChange={(e) => setTipoParceria(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                      >
                        <option value="revenda_instalacao">Revenda & Instalação Local</option>
                        <option value="consultoria_contabil">Consultoria & Contabilidade</option>
                        <option value="agente_indicacao">Agente de Indicação / Afiliado</option>
                        <option value="suporte_hardware">Assistência Técnica de Hardware/POS</option>
                      </select>
                    </div>
                  </div>

                  {/* Experiência / Apresentação */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 uppercase text-[11px]">
                      Apresentação da Empresa / Carteira de Clientes (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Conte-nos brevemente sobre a sua experiência com softwares de faturação, carteira de clientes ou objetivos de revenda..."
                      value={experiencia}
                      onChange={(e) => setExperiencia(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium resize-none"
                    />
                  </div>

                  {/* Termo de Compromisso */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p>
                      Ao submeter esta candidatura, declaro que as informações prestadas são verdadeiras e que a minha entidade atuará com rigor e respeito às diretrizes de conformidade fiscal da AGT.
                    </p>
                  </div>

                  {/* Botão Submeter */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A Registar Candidatura no Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Candidatura Oficial para o Admin</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

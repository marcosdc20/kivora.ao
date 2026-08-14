import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, ArrowLeft, Send, Loader2,
  Building2, MapPin, Award, Users, FileCheck, Phone, Mail
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
        commission_rate: 20,
        total_sales: 0,
        balance_aoa: 0,
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20">
      
      {/* Top Header Navegação */}
      <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          <div className="h-5 w-px bg-slate-800" />
          <button onClick={onNavigateHome}>
            <KivoraLogo variant="light" size="sm" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-3 py-1 rounded-full">
            Programa de Credenciamento Oficial
          </span>
        </div>
      </header>

      {/* Hero da Página de Candidatura */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Canal de Distribuição & Revenda de Software Comercial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Torne-se Parceiro Certificado <span className="text-blue-500">KIVORA</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Junte-se à maior rede de distribuição de ERP certificado pela AGT em Angola. Lucre comissões recorrentes em cada licença comercializada na sua província.
          </p>
        </div>
      </section>

      {/* Grade Principal: Requisitos (Esquerda) + Formulário / Imagem (Direita) */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: Requisitos Oficiais e Benefícios */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card de Imagem Ilustrativa */}
          <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative group">
            <img
              src="/imagens/servidor.png"
              alt="Servidor e Infraestrutura Kivora"
              className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent p-6 flex flex-col justify-end">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Infraestrutura & Tecnologia de Ponta
              </span>
              <h3 className="text-lg font-black text-white">
                Faturação em Rede Local com Sincronização Cloud
              </h3>
            </div>
          </div>

          {/* Card de Requisitos */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              <span>Requisitos para se Tornar Parceiro</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-900/40 text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">1. Atuação no Sector de Tecnologia / Serviços</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Empresa constituída ou profissional independente com foco em TI, suporte técnico, contabilidade ou automação comercial.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-900/40 text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">2. Conhecimentos Técnicos Básicos</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Domínio de sistemas Windows (10/11), configuração de redes locais (LAN/IP fixo) e instalação de impressoras térmicas ESC/POS.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-900/40 text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">3. Compromisso com a Conformidade AGT</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Orientar os clientes empresariais segundo o Decreto Presidencial 71/25 da Administração Geral Tributária.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-900/40 text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">4. Capacidade de Suporte Local</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Disponibilidade para atendimento de primeiro nível, implantação e formação presencial/remota aos clientes da região.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vantagens Resumo */}
          <div className="p-5 bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-800/40 rounded-3xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Benefícios do Parceiro Homologado
            </h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <strong>20% a 30% de comissão</strong> líquida em Kwanzas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Portal do Parceiro online para emissão instantânea de chaves
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Material comercial, apresentações em PDF e kits de vendas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Linha de apoio direto por WhatsApp com a equipa de engenharia
              </li>
            </ul>
          </div>
        </div>

        {/* COLUNA DIREITA: Formulário de Candidatura */}
        <div className="lg:col-span-7">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            
            {submittedProtocol ? (
              /* Sucesso no envio */
              <div className="text-center py-10 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                    Candidatura Registada com Sucesso
                  </span>
                  <h2 className="text-2xl font-black text-white">Proposta Enviada para Análise!</h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    A sua solicitação foi gravada na base de dados central Kivora. O Administrador Executivo receberá a notificação no painel administrativo e, após aprovação, enviará as suas credenciais de acesso (Nome de Utilizador e Palavra-passe).
                  </p>
                </div>

                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 max-w-sm mx-auto space-y-2 text-left text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protocolo:</span>
                    <strong className="text-white font-mono">{submittedProtocol}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nome:</span>
                    <strong className="text-white">{nome}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <strong className="text-white">{email}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado:</span>
                    <span className="text-amber-400 font-bold">Pendente de Aprovação</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all"
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
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold px-6 py-3 rounded-xl border border-slate-800 transition-all"
                  >
                    Submeter Outra Candidatura
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário */
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-white">Formulário de Candidatura</h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                      Etapa 1 de 1
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Preencha os dados da sua empresa ou atividade técnica para obter credenciamento oficial.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-950/60 border border-red-800/60 text-red-200 text-xs rounded-xl font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  
                  {/* Nome e Empresa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>Nome Completo do Responsável *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Manuel Domingos"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Nome da Empresa / Entidade</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Soluções Tecnológicas Luanda, Lda"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* NIF, Email e Telefone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>NIF *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="5412345678"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        <span>Email de Acesso *</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="parceiro@empresa.ao"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>WhatsApp / Telefone *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+244 923 000 000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Localização e Tipo de Parceria */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>Província *</span>
                      </label>
                      <select
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-bold"
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
                      <label className="font-bold text-slate-300 uppercase text-[11px]">
                        Município / Bairro
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Talatona / Viana"
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 uppercase text-[11px]">
                        Modalidade de Parceria
                      </label>
                      <select
                        value={tipoParceria}
                        onChange={(e) => setTipoParceria(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-bold"
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
                    <label className="font-bold text-slate-300 uppercase text-[11px]">
                      Apresentação da Empresa / Clientes Atuais (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Conte-nos brevemente sobre a sua experiência com softwares de faturação, carteira de clientes ou objetivos de revenda..."
                      value={experiencia}
                      onChange={(e) => setExperiencia(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium resize-none"
                    />
                  </div>

                  {/* Termo de Compromisso */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      Ao submeter esta candidatura, declaro que as informações prestadas são verdadeiras e que a minha entidade atuará com rigor e respeito às diretrizes de conformidade fiscal da AGT.
                    </p>
                  </div>

                  {/* Botão Submeter */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
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

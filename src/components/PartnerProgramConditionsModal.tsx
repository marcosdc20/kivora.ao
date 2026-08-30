import React from 'react';
import {
  FileText, Download, Printer, X, CheckCircle2,
  Building2, User, ShieldCheck, Mail, Phone, MapPin
} from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';

interface PartnerProgramConditionsModalProps {
  onClose: () => void;
}

export const PartnerProgramConditionsModal: React.FC<PartnerProgramConditionsModalProps> = ({
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible">
      <div className="modal-sheet bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] overflow-hidden animate-fadeIn print:border-none print:shadow-none print:rounded-none print:bg-transparent print:max-h-none print:overflow-visible print:w-full print:max-w-none">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 shrink-0 print:hidden text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Documento Oficial
                </span>
                <span className="text-xs text-slate-400 font-medium">Visual Software, Lda.</span>
              </div>
              <h3 className="font-black text-white text-base">Regulamento & Condições do Programa de Parceria</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable High-Resolution A4 Layout) */}
        <div className="p-6 sm:p-12 overflow-y-auto text-slate-900 font-sans space-y-8 bg-white print:p-0 print:overflow-visible">
          
          {/* ==================== PÁGINA 1 ==================== */}
          <div className="border border-slate-200 rounded-3xl p-6 sm:p-10 bg-slate-50/50 shadow-xs print:border-none print:p-0 print:shadow-none print:break-after-page">
            
            {/* Header com Logotipo Oficial e Título */}
            <div className="text-center space-y-3 pb-6 border-b border-slate-200">
              <div className="flex justify-center mb-2">
                <KivoraLogo variant="dark" size="lg" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                P R O G R A M A &nbsp; D E &nbsp; P A R C E R I A
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                Torne-se Parceiro Revendedor
              </h1>
              <p className="text-sm font-black text-blue-700 tracking-wider uppercase">
                KIVORA SOFT
              </p>
            </div>

            {/* Texto de Apresentação */}
            <div className="py-5 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              A <strong>Visual Software, Lda.</strong> está a expandir a rede de parceiros revendedores do <strong>KIVORA SOFT</strong> em todo o território angolano. Ao tornar-se Parceiro Revendedor, passa a representar oficialmente a marca junto dos seus clientes, com acesso directo à plataforma de emissão de licenças e ao suporte da equipa que desenvolve e certifica o software junto da AGT.
            </div>

            {/* O que ganha como Parceiro KIVORA */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>O que ganha como Parceiro KIVORA</span>
              </h2>
              <div className="grid grid-cols-1 gap-2 text-xs sm:text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Comprovativo oficial de Parceiro Revendedor Credenciado</strong>, emitido pela Visual Software;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Acesso próprio ao Portal do Parceiro</strong>, para emitir licenças directamente para os seus clientes;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Preços exclusivos de parceiro</strong> em todas as licenças que emitir;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Suporte técnico dedicado</strong> da equipa Visual Software para casos mais avançados;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Material de marketing e apoio comercial</strong> para divulgação do KIVORA SOFT;</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Liberdade para atender clientes</strong> em qualquer província de Angola.</span>
                </div>
              </div>
            </div>

            {/* Requisitos para se tornar Parceiro */}
            <div className="space-y-4 pt-5">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Requisitos para se tornar Parceiro</span>
              </h2>
              <p className="text-xs text-slate-600 italic">
                Os documentos abaixo servem para confirmar a idoneidade e a capacidade legal do candidato a Parceiro, sendo exigidos consoante se trate de uma empresa (pessoa colectiva) ou de um profissional a título individual (pessoa singular).
              </p>

              {/* Se for Empresa (Pessoa Colectiva) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2.5 shadow-xs">
                <h3 className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Se for Empresa (Pessoa Colectiva)</span>
                </h3>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Certidão de Registo Comercial actualizada (emitida há menos de 180 dias);</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Alvará Comercial válido, correspondente à actividade de comércio/prestação de serviços;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Cartão de Contribuinte / NIF da empresa;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Pacto Social / Estatutos da sociedade;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Cópia do Bilhete de Identidade do(s) sócio(s)-gerente(s) ou representante legal;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Comprovativo da morada da sede (contrato de arrendamento ou título de propriedade);</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Procuração, caso o processo seja tratado por um representante que não o sócio-gerente.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                  <strong>Nota:</strong> Nos termos do <em>Decreto Presidencial n.º 172/23</em>, algumas actividades de baixo risco encontram-se isentas de Alvará Comercial prévio, bastando o cadastro comercial na plataforma do GUE — a exigência deste documento será confirmada caso a caso.
                </div>
              </div>

              {/* Se for Pessoa Singular (Início) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2.5 shadow-xs">
                <h3 className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Se for Pessoa Singular (a título individual)</span>
                </h3>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Cópia do Bilhete de Identidade (BI) válido;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>NIF (para cidadãos nacionais corresponde ao número do BI; obrigatório em qualquer caso para estrangeiros);</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Comprovativo de residência actualizado;</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Rodapé Página 1 */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>Programa de Parceiros KIVORA SOFT</span>
              <span>Visual Software, Lda.</span>
              <span>Página 1 de 2</span>
            </div>
          </div>


          {/* ==================== PÁGINA 2 ==================== */}
          <div className="border border-slate-200 rounded-3xl p-6 sm:p-10 bg-slate-50/50 shadow-xs print:border-none print:p-0 print:shadow-none">
            
            {/* Continuação Pessoa Singular */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2.5 shadow-xs">
              <h3 className="text-xs font-black text-blue-900 uppercase flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Se for Pessoa Singular (Continuação)</span>
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Alvará Comercial ou Licenciamento de Comerciante em Nome Individual, quando aplicável à actividade;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Conhecimento ou experiência comprovada na área de informática/TI, vendas ou gestão comercial (CV ou declaração de experiência);</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Duas fotografias tipo passe recentes.</span>
                </div>
              </div>
            </div>

            {/* Comuns a ambos os casos */}
            <div className="bg-blue-50/70 rounded-2xl p-4 sm:p-5 border border-blue-200 space-y-2.5 mt-4">
              <h3 className="text-xs font-black text-blue-950 uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Comuns a ambos os casos</span>
              </h3>
              <div className="space-y-1.5 text-xs text-slate-800">
                <div className="flex items-start gap-2">
                  <span className="text-blue-700 font-bold">✓</span>
                  <span><strong>Disponibilidade</strong> para uma breve formação inicial sobre o KIVORA SOFT e o Portal do Parceiro;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-700 font-bold">✓</span>
                  <span><strong>Compromisso</strong> com a ética comercial e a boa representação da marca junto dos clientes;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-700 font-bold">✓</span>
                  <span><strong>Aceitação e assinatura</strong> do Contrato de Parceria de Revenda estabelecido pela Visual Software.</span>
                </div>
              </div>
            </div>

            {/* Valor de Adesão à Parceria */}
            <div className="pt-6 space-y-3">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Valor de Adesão à Parceria</span>
              </h2>

              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-2xl p-6 text-center space-y-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300">Valor Único de Adesão</p>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                  25.000 Kz
                </p>
                <p className="text-xs text-blue-200 font-medium">Pagamento único no acto de adesão</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Este valor dá acesso à activação da conta no Portal do Parceiro, à emissão do <strong>Comprovativo de Parceiro Revendedor Credenciado</strong> e ao pacote inicial de materiais de apoio comercial. <strong>Não inclui</strong> as licenças do KIVORA SOFT, que são pagas separadamente, à medida que forem emitidas pelo próprio Parceiro no Portal, ao preço de parceiro em vigor.
              </p>
            </div>

            {/* Como funciona na prática */}
            <div className="pt-6 space-y-3">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Como funciona na prática</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="font-mono font-black text-blue-600 text-sm">1. Adesão</span>
                  <p className="text-slate-600">
                    Preenche o formulário de interesse e efectua o pagamento do valor único de adesão (25.000 Kz).
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="font-mono font-black text-blue-600 text-sm">2. Assinatura do Contrato</span>
                  <p className="text-slate-600">
                    Assina o Contrato de Parceria de Revenda com a Visual Software, formalizando os termos da colaboração.
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="font-mono font-black text-blue-600 text-sm">3. Activação do Acesso</span>
                  <p className="text-slate-600">
                    Recebe as suas credenciais de acesso ao Portal do Parceiro e o Comprovativo de Parceiro Credenciado.
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="font-mono font-black text-blue-600 text-sm">4. Emissão e Venda</span>
                  <p className="text-slate-600">
                    Emite licenças directamente no Portal para os seus clientes, pagando à Visual Software o valor de parceiro por cada licença gerada.
                  </p>
                </div>
              </div>
            </div>

            {/* Como aderir & Contactos */}
            <div className="pt-6 space-y-3">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Como aderir</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Para iniciar o processo de adesão, preencha o formulário nesta página ou entre em contacto com a nossa equipa através dos canais abaixo. Teremos todo o gosto em esclarecer qualquer dúvida e acompanhar os primeiros passos da sua parceria com o <strong>KIVORA SOFT</strong>.
              </p>

              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="font-mono font-bold text-slate-200">geral@visualsoftware.ao</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono font-bold text-slate-200">+244 974 855 494</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-slate-300">Luanda, Angola</span>
                </div>
              </div>
            </div>

            {/* Rodapé Página 2 */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>Programa de Parceiros KIVORA SOFT</span>
              <span>Visual Software, Lda.</span>
              <span>Página 2 de 2</span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-xs text-slate-500 font-medium">
            Documento regulamentar para credenciamento oficial de parceiros e revendedores em Angola.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar / Imprimir PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

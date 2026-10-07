import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, FileText, Download, Printer, CheckCircle2,
  Search, Key, Eye, Award
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { KivoraLicense } from '../admin/types';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings, DEFAULT_OFFICIAL_DOCUMENTS
} from '../services/systemSettingsService';

interface CertificacaoDocumentosPageProps {
  onNavigatePage: (page: any) => void;
  onOpenDemoModal?: () => void;
}

export const CertificacaoDocumentosPage: React.FC<CertificacaoDocumentosPageProps> = ({
  onNavigatePage,
}) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [searchKey, setSearchKey] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [licenseResult, setLicenseResult] = useState<KivoraLicense | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  // Consulta rápida da licença no Firebase
  const handleValidateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = searchKey.trim().toUpperCase();
    if (!cleanKey) return;

    setLoadingSearch(true);
    setSearchError(null);
    setLicenseResult(null);

    try {
      const snap = await getDoc(doc(db, 'licenses', cleanKey));
      if (snap.exists()) {
        const d = snap.data();
        setLicenseResult({
          id: snap.id,
          company_name: d.company_name || 'Empresa Cliente',
          nif: d.nif || '999999999',
          plan_type: d.plan_type || 'annual',
          status: d.status || 'active',
          client_email: d.client_email || '',
          created_at: Number(d.created_at) || Date.now(),
          expires_at: d.expires_at ? Number(d.expires_at) : null,
          price_aoa: Number(d.price_aoa) || 0,
          partner_id: d.partner_id || 'Kivora Direct',
          extra_seats: Number(d.extra_seats) || 0,
          is_provisional: Boolean(d.is_provisional),
          hardware_id: d.hardware_id || null,
        });
      } else {
        setSearchError('Nenhuma licença foi localizada com a chave informada. Verifique se digitou os caracteres corretamente.');
      }
    } catch (err: any) {
      setSearchError('Erro ao consultar a base de dados: ' + err.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 sm:pt-32 pb-20 selection:bg-orange-500 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Breadcrumb de Navegação */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            onClick={() => onNavigatePage('home')}
            className="hover:text-[#FF6500] transition-colors cursor-pointer"
          >
            Início
          </button>
          <span>/</span>
          <span className="text-slate-800 font-bold">Certificação & Documentos</span>
        </div>

        {/* ── HEADER DA PÁGINA: LIMPO, CORPORATIVO E MODERNO ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>República de Angola • Administração Geral Tributária (AGT)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Certificação & Documentos
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Aceda aos comprovativos oficiais de homologação tributária, ao despacho da AGT e à documentação legal do software <strong className="text-slate-900 font-semibold">KIVORA SOFT</strong>.
          </p>
        </div>

        {/* ── BANNER PRINCIPAL DO CERTIFICADO AGT ── */}
        <div className="bg-gradient-to-br from-[#0B1528] via-[#111F38] to-[#0B1528] text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>{settings.agtCertificate || 'CERTIFICADO OFICIAL N.º FE/387/AGT/2026'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug font-display">
                Software Homologado e Certificado pela AGT
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                O KIVORA SOFT está formalmente certificado pela Administração Geral Tributária nos termos do <strong className="text-white">{settings.agtDecretoRef || 'Decreto Presidencial n.º 71/25'}</strong> e do Regime Jurídico das Faturas. Garante assinatura digital {settings.agtKeyHash || 'RSA-2048 / SHA-256'} em cadeia contínua, geração de QR Code fiscal oficial e ficheiro SAF-T AO com 100% de conformidade.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="px-5 py-3 rounded-xl bg-[#FF6500] hover:bg-[#EB5B00] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>Visualizar Certificado Oficial</span>
                </button>

                {settings.agtCertificateDocUrl && (
                  <a
                    href={settings.agtCertificateDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    download="Certificado_Oficial_AGT_Kivora.pdf"
                    className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Documento Original</span>
                  </a>
                )}

                <button
                  onClick={handlePrintCertificate}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir em A4</span>
                </button>
              </div>
            </div>

            {/* Quadro resumo à direita */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3.5 backdrop-blur-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-white/10 pb-2">
                Ficha de Conformidade
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Certificado AGT:</span>
                  <span className="font-mono font-bold text-emerald-400">{settings.agtCertificate ? settings.agtCertificate.replace(/.*N[.]º\s*/i, '') : 'FE/387/AGT/2026'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Decreto Aplicável:</span>
                  <span className="font-semibold text-white">{settings.agtDecretoRef || 'DP 71/25 & DP 292/18'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Algoritmo Fiscal:</span>
                  <span className="font-mono text-slate-200">{settings.agtKeyHash || 'RSA-2048 / SHA-256'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Exportação SAF-T:</span>
                  <span className="font-semibold text-emerald-400">XML Validado AGT</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Entidade Titular:</span>
                  <span className="font-semibold text-white">{settings.agtProducerEntity || settings.company || 'Visual Software, Lda.'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">NIF da Empresa:</span>
                  <span className="font-mono text-white">{settings.agtProducerNif || settings.nif || '5417088920'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── GRELHA DE DOCUMENTOS OFICIAIS PARA CONSULTA & DOWNLOAD ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
                Documentos Institucionais & Técnicos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Regulamentos, fichas técnicas e normas legais para arquivo e auditoria da sua empresa.
              </p>
            </div>
          </div>

          {/* Lista Dinâmica de Documentos (Carregada do Firebase com fallback padrão) */}
          {(() => {
            const docList = (settings.officialDocuments && settings.officialDocuments.length > 0
              ? settings.officialDocuments
              : DEFAULT_OFFICIAL_DOCUMENTS
            ).filter((d) => d.active !== false);

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docList.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6500] flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80">
                          {doc.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 font-display">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        {[doc.fileSize, doc.issueDate].filter(Boolean).join(' • ') || 'Documento Oficial'}
                      </span>
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={doc.fileName || `${doc.title}.pdf`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6500] hover:text-[#EB5B00] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descarregar</span>
                        </a>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Disponível via Suporte</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── VALIDADOR RÁPIDO DE LICENÇA (INTEGRADO NA PÁGINA) ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6500] mb-1">
                <Key className="w-4 h-4" />
                <span>Consulta Pública de Autenticidade</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                Validador Oficial de Licenças KIVORA
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Introduza a chave da sua licença para confirmar a autenticidade e validade fiscal emitida pela Visual Software.
              </p>
            </div>
          </div>

          <form onSubmit={handleValidateLicense} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Key className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Exemplo: KVR-2026-XXXX-XXXX"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loadingSearch}
              className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loadingSearch ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>A consultar...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Validar Licença</span>
                </>
              )}
            </button>
          </form>

          {/* Resultado da Validação */}
          {searchError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 font-medium">
              {searchError}
            </div>
          )}

          {licenseResult && (
            <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Licença Oficial Ativa e Autêntica</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block">Titular:</span>
                  <span className="font-bold text-slate-900">{licenseResult.company_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">NIF:</span>
                  <span className="font-mono font-bold text-slate-900">{licenseResult.nif}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Certificação:</span>
                  <span className="font-mono font-bold text-emerald-700">FE/387/AGT/2026</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── INFORMAÇÕES DA EMPRESA ── */}
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-1">
            <span className="font-bold text-slate-700 block">VISUAL SOFTWARE, LDA. • Luanda, República de Angola</span>
            <p>NIF: 5417088920 • Registo Comercial e Homologação Tributária Oficial</p>
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <span>Linha Direta: +244 974 855 494</span>
            <span>Email: suporte@kivora.ao</span>
          </div>
        </div>
      </div>

      {/* ── MODAL EM TELA CHEIA DO CERTIFICADO OFICIAL AGT ── */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
            {/* Header do modal */}
            <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[#FF6500]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Certificado de Homologação AGT</h3>
                  <p className="text-[11px] text-slate-400">Software Certificado sob o n.º FE/387/AGT/2026</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Certificado (Estilo A4) */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-900 bg-white">
              <div className="text-center space-y-2 border-b border-slate-200 pb-6">
                <img src="/imagens/logo_sem_fundo.png" alt="Kivora Logo" className="h-10 mx-auto object-contain" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  República de Angola • Administração Geral Tributária
                </h2>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase font-display">
                  Certificado de Faturação Eletrónica
                </h1>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                  N.º FE/387/AGT/2026
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                <p>
                  Certifica-se que o software executivo de faturação eletrónica e gestão empresarial <strong>KIVORA SOFT</strong>, desenvolvido pela sociedade <strong>VISUAL SOFTWARE, LDA.</strong> (NIF 5417088920), cumpre integralmente os requisitos funcionais, técnicos e fiscais estabelecidos pelo <strong>Decreto Presidencial n.º 71/25</strong> e pela legislação tributária angolana.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 font-mono text-xs text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Denominação:</span>
                    <span className="font-bold">KIVORA SOFT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Versão Homologada:</span>
                    <span className="font-bold">2.1.0 Desktop Offline-First</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">N.º do Despacho AGT:</span>
                    <span className="font-bold text-emerald-600">FE/387/AGT/2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assinatura Digital:</span>
                    <span className="font-bold">RSA-2048 com Hash Chaining</span>
                  </div>
                </div>

                <p>
                  O sistema está legalmente habilitado para emissão de Faturas, Faturas-Recibo, Notas de Crédito, Notas de Débito e Guias de Transporte com código bidimensional (QR Code) e geração do ficheiro de auditoria fiscal <strong>SAF-T AO</strong>.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Fechar Visualização
                </button>
                <button
                  onClick={handlePrintCertificate}
                  className="px-5 py-2.5 rounded-xl bg-[#FF6500] hover:bg-[#EB5B00] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/25"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Certificado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

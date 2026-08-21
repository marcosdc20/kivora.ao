import React, { useState, useEffect } from 'react';
import {
  Search, Key, Printer, ArrowLeft,
  CheckCircle2, Copy, ShieldCheck
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatLicenseDate, getPlanLabel } from '../admin/services/licenseService';
import type { KivoraLicense } from '../admin/types';

import desktopImg from '../assets/kivora/pc-descktop-kivora.png';

interface ValidarLicencaPageProps {
  onBackToHome: () => void;
}

export const ValidarLicencaPage: React.FC<ValidarLicencaPageProps> = ({ onBackToHome }) => {
  const [searchKey, setSearchKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [licenseData, setLicenseData] = useState<KivoraLicense | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Lê chave da URL se fornecida via ?k= ou ?key=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keyParam = params.get('k') || params.get('key');
    if (keyParam) {
      const clean = keyParam.trim().toUpperCase();
      setSearchKey(clean);
      performValidation(clean);
    }
  }, []);

  const performValidation = async (keyToValidate: string) => {
    const cleanKey = keyToValidate.trim().toUpperCase();
    if (!cleanKey) return;

    setLoading(true);
    setSearched(true);
    setErrorMessage(null);
    setLicenseData(null);

    try {
      const docRef = doc(db, 'licenses', cleanKey);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as any;
        setLicenseData({
          id: snap.id,
          client_email: data.client_email || '',
          company_name: data.company_name || 'Empresa Cliente',
          nif: data.nif || '999999999',
          plan_type: data.plan_type || 'annual',
          status: data.status || 'active',
          hardware_id: data.hardware_id || null,
          created_at: Number(data.created_at) || Date.now(),
          expires_at: data.expires_at ? Number(data.expires_at) : null,
          price_aoa: Number(data.price_aoa) || 0,
          partner_id: data.partner_id || 'Kivora Direct',
          extra_seats: Number(data.extra_seats) || 0,
          is_provisional: Boolean(data.is_provisional),
        });
      } else {
        setErrorMessage('Nenhuma licença foi encontrada com a chave informada.');
      }
    } catch (err: any) {
      setErrorMessage('Erro ao consultar a base de dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performValidation(searchKey);
  };

  const handleCopyKey = () => {
    if (!licenseData) return;
    navigator.clipboard.writeText(licenseData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isExpired = licenseData?.expires_at && licenseData.expires_at < Date.now();
  const isLicenseActive = licenseData && licenseData.status === 'active' && !isExpired;
  const validationUrl = licenseData ? `https://kivora.ao/#validar-licenca?k=${encodeURIComponent(licenseData.id)}` : 'https://kivora.ao';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(validationUrl)}&margin=0`;

  return (
    <div className="certificate-page-wrapper min-h-screen bg-slate-100 font-sans pt-24 sm:pt-28 pb-16 px-3 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Navigation — Oculto na Impressão */}
        <div className="print-hide flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Website</span>
          </button>

          <span className="text-xs text-slate-500 font-semibold">
            Consulta de Licenciamento
          </span>
        </div>

        {/* Search Box — Oculto na Impressão */}
        <div className="print-hide bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-2xl font-black text-slate-950">Validar Licença Kivora ERP</h1>
            <p className="text-xs text-slate-500 mt-1">
              Introduza a chave de ativação ou número de série para verificar a autenticidade fiscal e emitir o certificado oficial.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <div className="relative flex-1 flex items-center px-3">
              <Key className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                required
                placeholder="KVRA-XXXX-XXXX-XXXX"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value.toUpperCase())}
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchKey.trim()}
              className="btn-premium-primary disabled:opacity-50 text-xs sm:text-sm px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {loading ? <span className="animate-spin">⏳</span> : <Search className="w-4 h-4" />}
              <span>{loading ? 'A verificar...' : 'Verificar Licença'}</span>
            </button>
          </form>
        </div>

        {/* Estado Inicial: Explicação com Desktop */}
        {!searched && (
          <div className="print-hide card-premium rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                Segurança Anti-Fraude & AGT
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Validação de Licenças por Hardware Fingerprint
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                As licenças do KIVORA ERP são vinculadas com segurança aos computadores da sua empresa. Aqui pode consultar o estado fiscal, a validade e emitir o Certificado Oficial de Conformidade.
              </p>
            </div>
            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-[240px] aspect-[4/3] bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={desktopImg}
                  alt="Computador Desktop Kivora"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resultado: Erro */}
        {searched && !loading && errorMessage && (
          <div className="print-hide p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 text-center">
            <p className="font-bold">{errorMessage}</p>
            <p className="text-[11px] text-red-600 mt-1">Verifique o código introduzido ou contacte o suporte Kivora.</p>
          </div>
        )}

        {/* Barra de Ações Rápidas (Web View) */}
        {searched && !loading && licenseData && (
          <div className="print-hide flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Licença identificada com sucesso</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiada' : 'Copiar Chave'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================
            CERTIFICADO OFICIAL — DESIGN SÉRIO, LIMPO E CORPORATIVO (A4)
            ================================================================ */}
        {searched && !loading && licenseData && (
          <div className="printable-document certificate-document a4-document bg-white text-slate-900 w-full max-w-[800px] mx-auto p-10 sm:p-14 shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[1050px] print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-[265mm] font-sans">
            
            {/* Top Corporate Line — No fluxo do documento com margem inferior generosa */}
            <div className="w-full h-1.5 bg-slate-900 mb-6 print:mb-6 shrink-0" />

            <div className="space-y-6 sm:space-y-7 flex-1">
              {/* Cabeçalho do Certificado */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <img
                    src="/imagens/logo_sem_fundo.png"
                    alt="Kivora ERP"
                    className="h-10 w-auto object-contain mb-1.5"
                  />
                  <span className="font-black text-lg tracking-tight text-slate-950 block leading-tight">
                    Kivora Tecnologias, Lda.
                  </span>
                  <p className="text-[11px] text-slate-700 font-bold">
                    Software Certificado pela AGT n.º 384/AGT/2024 • Dec. Presidencial n.º 71/25
                  </p>
                  <p className="text-[10px] text-slate-500">
                    NIF: 5417088920 • Luanda, República de Angola
                  </p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code de Verificação"
                    className="w-16 h-16 border border-slate-300 p-1 rounded bg-white shadow-2xs"
                  />
                  <div className="text-[9px] text-slate-600 font-mono mt-1 font-bold">
                    <p>REG. KVRA-LIC-{licenseData.id.slice(-6).toUpperCase()}</p>
                    <p>Emissão: {formatLicenseDate(licenseData.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Título do Documento */}
              <div className="text-center space-y-1.5 pt-1">
                <span className="inline-block text-[10px] font-black uppercase text-blue-900 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full tracking-wider">
                  Certificação Oficial de Licenciamento & Conformidade Fiscal AGT
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
                  Certificado de Licenciamento de Software
                </h2>
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                  Kivora ERP • Sistema de Gestão Comercial e Facturação Certificada
                </p>
              </div>

              {/* Texto de Certificação */}
              <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p className="text-xs text-slate-600">
                  A <strong>Kivora Tecnologias, Lda.</strong> certifica para todos os efeitos legais e fiscais que a entidade:
                </p>
                <div className="bg-slate-50 border-y-2 border-slate-300 py-3.5 px-6">
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-wide">
                    {licenseData.company_name}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  Inscrita sob o NIF n.º <strong>{licenseData.nif}</strong>, é titular legítima da licença de uso do software <strong>Kivora ERP</strong>, devidamente registada no servidor central de licenciamento e autorizada para emissão de faturas e gestão de operações em conformidade com as normas tributárias em vigor na República de Angola.
                </p>
              </div>

              {/* Tabela Estruturada de Detalhes da Licença */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 font-black text-slate-800 uppercase text-[10px] tracking-wider">
                  Especificação Técnica e Fiscal da Licença
                </div>
                <table className="w-full text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 w-1/3 bg-slate-50/60">Entidade Licenciada:</td>
                      <td className="py-3 px-4 font-black text-slate-950">{licenseData.company_name}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">NIF do Contribuinte:</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{licenseData.nif}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Chave de Licença (Serial Key):</td>
                      <td className="py-3 px-4 font-mono font-black text-blue-700">{licenseData.id}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Produto & Versão:</td>
                      <td className="py-3 px-4 text-slate-900 font-bold">Kivora ERP v2.4 (Edição Comercial & Multi-posto)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Plano / Modalidade:</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{getPlanLabel(licenseData.plan_type)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Postos de Trabalho Autorizados:</td>
                      <td className="py-3 px-4 text-slate-900 font-bold">{1 + (licenseData.extra_seats || 0)} Posto(s) Autorizado(s) em Rede Local</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Validade da Licença:</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {licenseData.expires_at ? formatLicenseDate(licenseData.expires_at) : 'Licença Vitalícia (Sem Expiração)'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Estado da Licença:</td>
                      <td className="py-3 px-4 font-bold">
                        {isLicenseActive ? (
                          <span className="text-emerald-700">● VÁLIDA E ACTIVA NO SISTEMA CENTRAL</span>
                        ) : (
                          <span className="text-amber-700">● EXPIRADA</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Conformidade Fiscal AGT */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed text-justify space-y-1">
                <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
                  Conformidade Legal & Fiscal AGT:
                </p>
                <p>
                  O software Kivora ERP cumpre integralmente os requisitos de assinatura digital de faturas por chave criptográfica RSA-2048 e exportação do ficheiro SAF-T (AO), nos termos do Regime Jurídico das Facturas e do Decreto Presidencial n.º 71/25 da República de Angola.
                </p>
              </div>
            </div>

            {/* Rodapé e Assinatura */}
            <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] avoid-break mt-6">
              <div className="text-center sm:text-left space-y-0.5">
                <p className="font-black text-slate-950 text-xs">KIVORA TECNOLOGIAS, LDA.</p>
                <p className="text-slate-500 text-[10px]">Departamento de Licenciamento & Sistemas</p>
                <p className="text-slate-400 text-[9px]">Verificação online disponível em https://kivora.ao</p>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 space-y-1">
                <div className="w-48 border-b border-slate-600 pb-1 mb-1 mx-auto sm:ml-auto">
                  <p className="font-serif italic text-slate-800 text-xs font-bold">Direção Técnica Kivora</p>
                </div>
                <p className="font-black text-slate-950 text-[10px] uppercase">Direção Técnica & Engenharia</p>
                <p className="text-slate-400 text-[9px] font-mono">Assinatura Digital Autorizada</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

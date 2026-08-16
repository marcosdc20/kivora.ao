import React, { useState, useEffect } from 'react';
import {
  Search, Key, Printer, ArrowLeft,
  CheckCircle2, Copy
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatLicenseDate, getPlanLabel } from '../admin/services/licenseService';
import type { KivoraLicense } from '../admin/types';

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
        <div className="print-hide bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Validar Licença Kivora ERP</h1>
            <p className="text-xs text-slate-500 mt-1">
              Introduza a chave de ativação para verificar a autenticidade e emitir o certificado.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="KVRA-XXXX-XXXX-XXXX"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchKey.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {loading ? <span className="animate-spin">⏳</span> : <Search className="w-4 h-4" />}
              <span>{loading ? 'A verificar...' : 'Verificar'}</span>
            </button>
          </form>
        </div>

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
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiada' : 'Copiar Chave'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
          <div className="certificate-document bg-white text-slate-900 p-8 sm:p-12 border border-slate-300 shadow-xl space-y-8 print:border print:border-slate-400 print:p-8">
            
            {/* Cabeçalho do Certificado */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div className="space-y-1">
                <img
                  src="/imagens/logo_sem_fundo.png"
                  alt="Kivora ERP"
                  className="h-10 w-auto object-contain mb-2"
                />
                <p className="text-xs font-bold text-slate-900">Kivora Tecnologias, Lda.</p>
                <p className="text-[11px] text-slate-500">NIF: 5417088920 • Luanda, Angola</p>
                <p className="text-[11px] text-slate-500">Software Certificado pela AGT n.º 384/AGT/2024</p>
              </div>

              <div className="text-right space-y-2">
                <img
                  src={qrCodeUrl}
                  alt="QR Code de Verificação"
                  className="w-20 h-20 border border-slate-200 p-1 bg-white ml-auto"
                />
                <div className="text-[10px] text-slate-500 font-mono">
                  <p>Certificado: <strong className="text-slate-900">KVRA-{licenseData.id.slice(-6)}</strong></p>
                  <p>Emissão: {formatLicenseDate(licenseData.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Título do Documento */}
            <div className="text-center space-y-1 py-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 uppercase">
                Certificado de Licenciamento de Software
              </h2>
              <p className="text-xs text-slate-600">
                Kivora ERP • Sistema de Gestão Comercial e Facturação
              </p>
            </div>

            {/* Texto de Certificação */}
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              A <strong>Kivora Tecnologias, Lda.</strong> certifica que a entidade abaixo identificada é titular de uma licença legítima do software <strong>Kivora ERP</strong>, devidamente registada na nossa base de dados central e em conformidade com as normas fiscais e requisitos de faturação em vigor na República de Angola.
            </p>

            {/* Tabela Estruturada de Detalhes da Licença */}
            <div className="border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left divide-y divide-slate-200">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3">Entidade Licenciada:</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{licenseData.company_name}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-600">NIF do Contribuinte:</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{licenseData.nif}</td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-600">Chave de Licença (Serial Key):</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{licenseData.id}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-600">Produto & Versão:</td>
                    <td className="py-2.5 px-4 text-slate-800">Kivora ERP v2.4 (Edição Comercial)</td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-600">Plano / Modalidade:</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{getPlanLabel(licenseData.plan_type)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-600">Postos Autorizados:</td>
                    <td className="py-2.5 px-4 text-slate-800">{1 + (licenseData.extra_seats || 0)} Posto(s) de Trabalho (Rede Local)</td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-600">Validade da Licença:</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {licenseData.expires_at ? formatLicenseDate(licenseData.expires_at) : 'Licença Vitalícia (Sem Expiração)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-600">Estado da Licença:</td>
                    <td className="py-2.5 px-4 font-bold">
                      {isLicenseActive ? (
                        <span className="text-emerald-700">● VÁLIDA E ACTIVA</span>
                      ) : (
                        <span className="text-amber-700">● EXPIRADA</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Conformidade Fiscal AGT */}
            <div className="bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 leading-relaxed text-justify">
              <strong>Conformidade Legal & Fiscal:</strong> O software Kivora ERP cumpre integralmente os requisitos de assinatura digital de faturas (RSA-2048) e exportação do ficheiro SAF-T (AO), nos termos do Regime Jurídico das Facturas e do Decreto Presidencial n.º 71/25 da República de Angola.
            </div>

            {/* Rodapé e Assinatura */}
            <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-900">Kivora Tecnologias, Lda.</p>
                <p className="text-[10px] text-slate-500">Departamento de Licenciamento & Sistemas</p>
                <p className="text-[10px] text-slate-400">Verificação online disponível em https://kivora.ao</p>
              </div>

              <div className="text-right">
                <div className="w-48 border-b border-slate-400 pb-1 mb-1">
                  <p className="text-[11px] font-bold text-slate-900">Direção Técnica</p>
                </div>
                <p className="text-[10px] text-slate-400">Assinatura Digital Autorizada</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

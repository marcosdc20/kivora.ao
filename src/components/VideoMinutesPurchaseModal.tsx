import React, { useState } from 'react';
import {
  Video, Check, Sparkles,
  Wallet, Building2, Copy, ArrowRight,
  Zap, Clock, CheckCircle2, X
} from 'lucide-react';
import {
  VideoCallPackage,
  DEFAULT_VIDEO_PACKAGES,
  getCachedSystemSettings
} from '../services/systemSettingsService';
import {
  VideoSupportAccount,
  purchaseVideoMinutes
} from '../services/videoSupportService';

export interface VideoMinutesPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: VideoSupportAccount | null;
  onSuccess?: (updatedAccount: VideoSupportAccount) => void;
  entityType?: 'cliente' | 'parceiro';
  partnerWalletBalance?: number;
  onDebitPartnerWallet?: (amountAoa: number, description: string) => Promise<boolean>;
}

export const VideoMinutesPurchaseModal: React.FC<VideoMinutesPurchaseModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess,
  entityType = 'cliente',
  partnerWalletBalance = 0,
  onDebitPartnerWallet,
}) => {
  const settings = getCachedSystemSettings();
  const pricePerMin = settings.videoCallPricePerMinute ?? 300;
  const packages: VideoCallPackage[] = settings.videoCallPackages || DEFAULT_VIDEO_PACKAGES;

  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-30');
  const [customMinutes, setCustomMinutes] = useState<number>(45);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet_partner' | 'transferencia' | 'multicaixa_express'>(
    entityType === 'parceiro' && partnerWalletBalance >= 5000 ? 'wallet_partner' : 'transferencia'
  );
  const [refComprovativo, setRefComprovativo] = useState<string>('');
  const [copiedIban, setCopiedIban] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchasedSuccess, setPurchasedSuccess] = useState<boolean>(false);
  const [purchasedInfo, setPurchasedInfo] = useState<{ minutes: number; totalAoa: number } | null>(null);

  if (!isOpen) return null;

  // Cálculo de Minutos e Preços
  let minutesToBuy = 30;
  let discountPercent = 0;

  if (isCustom) {
    minutesToBuy = Math.max(10, customMinutes);
    if (minutesToBuy >= 120) discountPercent = 15;
    else if (minutesToBuy >= 60) discountPercent = 10;
    else if (minutesToBuy >= 30) discountPercent = 5;
  } else {
    const pkg = packages.find((p) => p.id === selectedPkgId) || packages[1] || { minutes: 30, discountPercent: 5 };
    minutesToBuy = pkg.minutes;
    discountPercent = pkg.discountPercent || 0;
  }

  const subtotalAoa = minutesToBuy * pricePerMin;
  const discountAoa = Math.round(subtotalAoa * (discountPercent / 100));
  const totalAoa = subtotalAoa - discountAoa;

  const fmt = (v: number) => new Intl.NumberFormat('pt-AO').format(v);

  const handleCopyIban = (iban: string, bank: string) => {
    navigator.clipboard.writeText(iban.replace(/\s/g, ''));
    setCopiedIban(bank);
    setTimeout(() => setCopiedIban(null), 2500);
  };

  const handleConfirmPurchase = async () => {
    if (!account) return;
    setIsProcessing(true);

    try {
      // Se parceiro pagar via carteira
      if (paymentMethod === 'wallet_partner' && onDebitPartnerWallet) {
        if (partnerWalletBalance < totalAoa) {
          alert(`Saldo insuficiente na sua carteira Kivora (Saldo: ${fmt(partnerWalletBalance)} Kz). Necessário: ${fmt(totalAoa)} Kz. Escolha Transferência Bancária.`);
          setIsProcessing(false);
          return;
        }

        const debited = await onDebitPartnerWallet(totalAoa, `Compra de ${minutesToBuy} minutos de Videochamada de Suporte`);
        if (!debited) {
          alert('Erro ao debitar da carteira. Tente outro método de pagamento.');
          setIsProcessing(false);
          return;
        }
      }

      const res = await purchaseVideoMinutes({
        entityId: account.id,
        entityName: account.entityName,
        entityType: entityType,
        minutes: minutesToBuy,
        amountAoa: totalAoa,
        paymentMethod: paymentMethod,
        reference: refComprovativo || `VC-${Math.floor(100000 + Math.random() * 900000)}`,
        email: account.email,
        nif: account.nif,
        notes: `Aquisição de pacote de ${minutesToBuy} minutos de videochamada de suporte.`,
      });

      if (res.success) {
        setPurchasedInfo({ minutes: minutesToBuy, totalAoa });
        setPurchasedSuccess(true);
        if (onSuccess) onSuccess(res.account);
      }
    } catch (err: any) {
      alert('Erro ao processar recarga: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto animate-scale-in">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">Recarregar Minutos de Vídeo</h3>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {pricePerMin} Kz / min
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assistência remota de alta definição com partilha de ecrã para POS & Base de Dados.
              </p>
            </div>
          </div>

          {/* Saldo Atual */}
          {account && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Saldo Atual de {account.entityName}:
              </span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {Math.floor((account.remainingSeconds || 0) / 60)} min {((account.remainingSeconds || 0) % 60)}s restantes
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {purchasedSuccess ? (
            /* Ecrã de Confirmação & Sucesso */
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">Recarga Concluída com Sucesso!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Foram creditados <strong className="text-emerald-600 font-bold">+{purchasedInfo?.minutes} minutos</strong> na sua conta. Já pode iniciar ou agendar a sua videochamada de assistência.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-sm mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between text-slate-600">
                  <span>Minutos Adicionados:</span>
                  <span className="font-bold text-slate-900">+{purchasedInfo?.minutes} min</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Valor Pago:</span>
                  <span className="font-bold text-slate-900 font-mono">{fmt(purchasedInfo?.totalAoa || 0)} Kz</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Novo Saldo Total:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {Math.floor((account?.remainingSeconds || 0) / 60)} minutos
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPurchasedSuccess(false);
                  onClose();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                Voltar à Central de Suporte
              </button>
            </div>
          ) : (
            <>
              {/* Seleção de Pacotes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Selecione o Pacote de Minutos</span>
                  </label>
                  <button
                    onClick={() => setIsCustom(!isCustom)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    {isCustom ? '← Ver Pacotes Padrão' : 'Personalizar Minutos →'}
                  </button>
                </div>

                {!isCustom ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {packages.map((pkg) => {
                      const isSelected = selectedPkgId === pkg.id;
                      const rawCost = pkg.minutes * pricePerMin;
                      const pkgCost = rawCost - Math.round(rawCost * ((pkg.discountPercent || 0) / 100));

                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPkgId(pkg.id)}
                          className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-sm'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80'
                          }`}
                        >
                          {pkg.popular && (
                            <span className="absolute -top-2 right-2 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                              Popular
                            </span>
                          )}
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-black text-slate-900">{pkg.minutes} min</span>
                              {pkg.discountPercent > 0 && (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded">
                                  -{pkg.discountPercent}%
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{pkg.label}</p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-200/60">
                            <span className="font-mono text-xs font-black text-blue-700">{fmt(pkgCost)} Kz</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Modo Personalizado com Slider */
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">Quantidade de Minutos:</span>
                      <span className="text-lg font-black text-blue-700 font-mono">{customMinutes} minutos</span>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="5"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>10 min</span>
                      <span>60 min (1h)</span>
                      <span>120 min (2h)</span>
                      <span>300 min (5h)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Resumo Financeiro */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs shadow-md">
                <div className="flex justify-between text-slate-400">
                  <span>Tempo Selecionado:</span>
                  <span className="text-white font-bold">{minutesToBuy} minutos</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tarifa Unitária:</span>
                  <span className="text-white font-mono">{pricePerMin} Kz / minuto</span>
                </div>
                {discountAoa > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Desconto por Volume (-{discountPercent}%):</span>
                    <span className="font-mono">-{fmt(discountAoa)} Kz</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-200">Total a Pagar:</span>
                  <span className="text-xl font-black text-blue-400 font-mono">{fmt(totalAoa)} Kz</span>
                </div>
              </div>

              {/* Método de Pagamento */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-900 block">Forma de Liquidação</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {entityType === 'parceiro' && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet_partner')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        paymentMethod === 'wallet_partner'
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">Saldo da Carteira</span>
                          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">IMEDIATO</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Saldo: {fmt(partnerWalletBalance)} Kz</p>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'transferencia'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">Transferência / IBAN</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">BFA / BAI com validação instantânea</p>
                    </div>
                  </button>
                </div>

                {/* Dados Bancários se Transferência */}
                {paymentMethod === 'transferencia' && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs animate-fade-in">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold text-slate-800">Titular:</span>
                      <span className="font-bold text-slate-900">{settings.ibanTitular}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 block">BANCO BAI:</span>
                        <span className="font-mono text-[11px] font-bold text-slate-800">{settings.ibanBai}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyIban(settings.ibanBai, 'BAI')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIban === 'BAI' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIban === 'BAI' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block">BANCO BFA:</span>
                        <span className="font-mono text-[11px] font-bold text-slate-800">{settings.ibanBfa}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyIban(settings.ibanBfa, 'BFA')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIban === 'BFA' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIban === 'BFA' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">
                        Referência / N.º do Comprovativo (Opcional):
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: TRF-982342 ou Nº de Operação"
                        value={refComprovativo}
                        onChange={(e) => setRefComprovativo(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botões Finais */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
                >
                  {isProcessing ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Confirmar & Creditar {minutesToBuy} min</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

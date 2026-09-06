/**
 * NotificationContainer.tsx
 * Componente global que renderiza:
 * 1. Toasts flutuantes (sucesso, erro, aviso, info) com animações suaves e auto-dismiss.
 * 2. Diálogo modal in-app para confirmações (confirmDialog) e alertas (alertDialog).
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  notify,
  ToastMessage,
  ToastType,
} from '../../services/notificationService';

interface DialogState {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant: 'primary' | 'danger' | 'warning' | 'emerald';
  resolve?: (value: boolean) => void;
}

export const NotificationContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    const unsubToasts = notify.subscribeToasts(setToasts);
    const unsubDialog = notify.subscribeDialog(setDialog);
    return () => {
      unsubToasts();
      unsubDialog();
    };
  }, []);

  // Fechar diálogo com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dialog?.isOpen) {
        if (dialog.type === 'confirm') {
          dialog.resolve?.(false);
        } else {
          dialog.resolve?.(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  const getToastClasses = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-white text-slate-900 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-500/30 bg-white text-slate-900 shadow-rose-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-white text-slate-900 shadow-amber-500/10';
      case 'info':
      default:
        return 'border-blue-500/30 bg-white text-slate-900 shadow-blue-500/10';
    }
  };

  return (
    <>
      {/* ─── TOASTS CONTAINER (Canto Superior Direito) ─── */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${getToastClasses(
              t.type
            )}`}
          >
            {getToastIcon(t.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {t.title}
              </h4>
              {t.message && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words whitespace-pre-line">
                  {t.message}
                </p>
              )}
            </div>
            <button
              onClick={() => notify.dismissToast(t.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ─── MODAL DE DIÁLOGO (CONFIRM & ALERT) ─── */}
      {dialog?.isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full p-6 sm:p-7 relative overflow-hidden transform animate-in zoom-in-95 duration-200"
          >
            {/* Barra superior decorativa */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                dialog.variant === 'danger'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : dialog.variant === 'warning'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : dialog.variant === 'emerald'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
            />

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  dialog.variant === 'danger'
                    ? 'bg-rose-50 text-rose-600'
                    : dialog.variant === 'warning'
                    ? 'bg-amber-50 text-amber-600'
                    : dialog.variant === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {dialog.variant === 'danger' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : dialog.variant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : dialog.variant === 'emerald' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-slate-950 tracking-tight leading-tight">
                  {dialog.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {dialog.message}
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              {dialog.type === 'confirm' && (
                <button
                  type="button"
                  onClick={() => dialog.resolve?.(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  {dialog.cancelText || 'Cancelar'}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={() => dialog.resolve?.(true)}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-md cursor-pointer ${
                  dialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : dialog.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : dialog.variant === 'emerald'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

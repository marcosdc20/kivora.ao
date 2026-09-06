/**
 * notificationService.ts
 * Sistema global de notificações in-app e caixas de diálogo modais
 * Substitui 100% o uso de window.alert() e window.confirm()
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'emerald';
}

export interface AlertDialogOptions {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  buttonText?: string;
}

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

type ToastListener = (toasts: ToastMessage[]) => void;
type DialogListener = (state: DialogState | null) => void;

class NotificationManager {
  private toasts: ToastMessage[] = [];
  private toastListeners: Set<ToastListener> = new Set();
  private dialogListener: DialogListener | null = null;

  // ─── TOASTS ───
  public subscribeToasts(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  private notifyToastListeners() {
    const copy = [...this.toasts];
    this.toastListeners.forEach((fn) => fn(copy));
  }

  public showToast(type: ToastType, title: string, message?: string, durationMs = 4000): string {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, durationMs };
    this.toasts = [toast, ...this.toasts].slice(0, 5); // Máximo 5 simultâneos
    this.notifyToastListeners();

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismissToast(id);
      }, durationMs);
    }

    return id;
  }

  public dismissToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notifyToastListeners();
  }

  public success(title: string, message?: string) {
    return this.showToast('success', title, message);
  }

  public error(title: string, message?: string) {
    return this.showToast('error', title, message, 6000);
  }

  public warning(title: string, message?: string) {
    return this.showToast('warning', title, message, 5000);
  }

  public info(title: string, message?: string) {
    return this.showToast('info', title, message);
  }

  // ─── MODAL DIALOGS (CONFIRM & ALERT) ───
  public subscribeDialog(listener: DialogListener): () => void {
    this.dialogListener = listener;
    return () => {
      this.dialogListener = null;
    };
  }

  public confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.dialogListener) {
        // Fallback defensivo caso o container ainda não esteja montado
        resolve(window.confirm(`${options.title}\n\n${options.message}`));
        return;
      }

      this.dialogListener({
        isOpen: true,
        type: 'confirm',
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        variant: options.variant || 'primary',
        resolve: (val: boolean) => {
          this.closeDialog();
          resolve(val);
        },
      });
    });
  }

  public alert(options: AlertDialogOptions): Promise<void> {
    return new Promise((resolve) => {
      if (!this.dialogListener) {
        window.alert(`${options.title}\n\n${options.message}`);
        resolve();
        return;
      }

      const variantMap: Record<string, 'primary' | 'danger' | 'warning' | 'emerald'> = {
        info: 'primary',
        warning: 'warning',
        error: 'danger',
        success: 'emerald',
      };

      this.dialogListener({
        isOpen: true,
        type: 'alert',
        title: options.title,
        message: options.message,
        confirmText: options.buttonText || 'Entendido',
        variant: variantMap[options.type || 'info'] || 'primary',
        resolve: () => {
          this.closeDialog();
          resolve();
        },
      });
    });
  }

  private closeDialog() {
    if (this.dialogListener) {
      this.dialogListener(null);
    }
  }
}

export const notify = new NotificationManager();

// Atalhos rápidos para manter compatibilidade com sintaxes limpas
export const showToast = (title: string, message?: string, type: ToastType = 'info') => {
  notify.showToast(type, title, message);
};

export const confirmDialog = (options: ConfirmDialogOptions) => notify.confirm(options);
export const alertDialog = (options: AlertDialogOptions) => notify.alert(options);

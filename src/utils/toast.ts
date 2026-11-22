export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function showToast(
  message: string,
  type: ToastType = 'info',
  duration: number = 3500
): string {
  const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const newToast: ToastItem = { id, type, message, duration };
  toasts = [...toasts, newToast];
  notify();

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export const toast = {
  success: (msg: string, duration?: number) => showToast(msg, 'success', duration),
  error: (msg: string, duration?: number) => showToast(msg, 'error', duration),
  warning: (msg: string, duration?: number) => showToast(msg, 'warning', duration),
  info: (msg: string, duration?: number) => showToast(msg, 'info', duration),
};

export function subscribeToasts(listener: ToastListener): () => void {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

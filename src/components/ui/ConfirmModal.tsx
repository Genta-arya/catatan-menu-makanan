import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, HelpCircle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onCancel]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[99999] w-screen h-screen h-[100dvh] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn select-none"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl border border-sage-200 space-y-4 animate-scaleUp"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                variant === 'danger'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : variant === 'warning'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-sage-100 text-sage-700 border border-sage-200'
              }`}
            >
              {variant === 'danger' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : variant === 'warning' ? (
                <HelpCircle className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sage-950 text-base sm:text-lg">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sage-700 text-sm leading-relaxed break-words">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-sage-300 hover:bg-sage-100 text-sage-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                : 'bg-sage-600 hover:bg-sage-700 shadow-sage-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { subscribeToasts, removeToast, type ToastItem } from '../../utils/toast';

export const ToastContainer: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((newToasts) => {
      setItems(newToasts);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2.5 w-[92vw] max-w-md pointer-events-none transition-all"
    >
      {items.map((item) => {
        let bgStyle = 'bg-sage-900/95 border-sage-700 text-white';
        let Icon = Info;
        let iconColor = 'text-sage-300';

        if (item.type === 'success') {
          bgStyle = 'bg-emerald-900/95 border-emerald-600/80 text-emerald-50';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (item.type === 'error') {
          bgStyle = 'bg-rose-950/95 border-rose-700/80 text-rose-50';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (item.type === 'warning') {
          bgStyle = 'bg-amber-950/95 border-amber-600/80 text-amber-50';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={item.id}
            className={`pointer-events-auto px-4 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md flex items-start justify-between gap-3 animate-fadeIn transition-all transform duration-200 ${bgStyle}`}
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <p className="text-xs sm:text-sm font-semibold leading-relaxed break-words">
                {item.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 shrink-0 transition-colors"
              title="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

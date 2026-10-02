import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  TrendingUp,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useNotification, ToastNotification, NotificationType } from '../context/NotificationContext';
import { useFinancial } from '../context/FinancialContext';

interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { lang, formatMoney } = useFinancial();
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration || 5000);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss countdown with pause-on-hover
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const totalDuration = toast.duration;
    const intervalMs = 50;

    const interval = setInterval(() => {
      if (!isPaused) {
        remainingTimeRef.current -= intervalMs;
        const pct = Math.max(0, (remainingTimeRef.current / totalDuration) * 100);
        setProgress(pct);

        if (remainingTimeRef.current <= 0) {
          clearInterval(interval);
          onDismiss(toast.id);
        }
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, isPaused, onDismiss]);

  const getStyleConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          borderClass: 'border-emerald-200 bg-white/95',
          accentBg: 'bg-emerald-500',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          progressClass: 'bg-emerald-500',
        };
      case 'error':
        return {
          borderClass: 'border-red-200 bg-white/95',
          accentBg: 'bg-red-500',
          badgeClass: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />,
          progressClass: 'bg-red-500',
        };
      case 'warning':
        return {
          borderClass: 'border-amber-200 bg-white/95',
          accentBg: 'bg-amber-500',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          progressClass: 'bg-amber-500',
        };
      case 'financial_alert':
        return {
          borderClass: 'border-[var(--navy)]/20 bg-white/95 shadow-md',
          accentBg: 'bg-[var(--navy)]',
          badgeClass: 'bg-[var(--navy)] text-[var(--yellow)] border-[var(--navy)]/30',
          icon: <TrendingUp className="w-5 h-5 text-[var(--navy)] shrink-0" />,
          progressClass: 'bg-[var(--navy)]',
        };
      case 'info':
      default:
        return {
          borderClass: 'border-blue-200 bg-white/95',
          accentBg: 'bg-blue-600',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          progressClass: 'bg-blue-600',
        };
    }
  };

  const config = getStyleConfig(toast.type);

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full max-w-sm rounded-[16px] border ${config.borderClass} shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 hover:shadow-xl`}
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="mt-0.5">{config.icon}</div>

          {/* Text Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[13.5px] font-bold text-[var(--navy)] leading-tight">
                {toast.title}
              </h4>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-[var(--muted)] hover:text-[var(--navy)] p-1 -mr-1 -mt-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                aria-label={lang === 'bn' ? 'মুছে ফেলুন' : 'Dismiss notification'}
                title={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="mt-1 text-[12.5px] text-[var(--muted)] leading-relaxed">
              {toast.message}
            </p>

            {/* Optional Financial Snapshot pill */}
            {toast.financialDetails && (
              <div className="mt-2 flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[11.5px]">
                {toast.financialDetails.amount !== undefined && (
                  <span className="font-bold text-[var(--navy)]">
                    {formatMoney(toast.financialDetails.amount)}
                  </span>
                )}
                {toast.financialDetails.category && (
                  <span className="text-[var(--muted)] truncate">
                    • {toast.financialDetails.category}
                  </span>
                )}
              </div>
            )}

            {/* Action button if present */}
            {toast.action && (
              <div className="mt-2.5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    onDismiss(toast.id);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-[10px] bg-[var(--navy)] text-white text-[11.5px] font-bold hover:bg-[var(--navy-2)] transition-colors cursor-pointer"
                >
                  <span>{toast.action.label}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--yellow)]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Dismiss Progress Bar (if timed) */}
      {toast.duration && toast.duration > 0 && (
        <div className="h-1 w-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${config.progressClass} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  const { toasts, dismissToast, clearAllToasts } = useNotification();
  const { lang } = useFinancial();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label={lang === 'bn' ? 'বিজ্ঞপ্তি বার্তা' : 'Notifications'}
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-[calc(100vw-2rem)] sm:max-w-md pointer-events-none"
    >
      {/* Clear all button if multiple toasts are visible */}
      {toasts.length > 1 && (
        <div className="flex justify-end pointer-events-auto pr-1">
          <button
            type="button"
            onClick={clearAllToasts}
            className="px-2.5 py-1 rounded-full bg-[var(--navy)]/80 text-white hover:bg-[var(--navy)] text-[11px] font-semibold backdrop-blur-md shadow-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{lang === 'bn' ? 'সব মুছুন' : 'Clear All'}</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* List of active toasts */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </aside>
  );
};

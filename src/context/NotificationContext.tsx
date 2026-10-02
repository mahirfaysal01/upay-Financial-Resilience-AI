import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'financial_alert';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface FinancialDetails {
  amount?: number;
  category?: string;
  account?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ToastNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // ms, default 5000, 0 = persistent
  action?: NotificationAction;
  financialDetails?: FinancialDetails;
  read?: boolean;
}

interface ShowToastOptions {
  duration?: number;
  action?: NotificationAction;
  financialDetails?: FinancialDetails;
}

interface NotificationContextType {
  toasts: ToastNotification[];
  history: ToastNotification[];
  unreadCount: number;
  showToast: (notification: Omit<ToastNotification, 'id' | 'timestamp' | 'read'>) => string;
  notifySuccess: (title: string, message: string, options?: ShowToastOptions) => string;
  notifyError: (title: string, message: string, options?: ShowToastOptions) => string;
  notifyWarning: (title: string, message: string, options?: ShowToastOptions) => string;
  notifyInfo: (title: string, message: string, options?: ShowToastOptions) => string;
  notifyFinancial: (title: string, message: string, options?: ShowToastOptions) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'upay_notification_history_v1';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [history, setHistory] = useState<ToastNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 30);
      }
    } catch {
      // fallback
    }
    // Default initial financial resilience notifications for demo experience
    return [
      {
        id: 'init_n_1',
        type: 'financial_alert',
        title: 'ক্যাশ-ফ্লো অ্যালার্ট (Cash-Flow Alert)',
        message: 'মাস শেষের নগদ উদ্বৃত্ত প্রত্যাশিত সীমার নিচে নামতে পারে। ঐচ্ছিক খরচ পর্যালোচনা করুন।',
        timestamp: Date.now() - 1000 * 60 * 25,
        read: false,
        financialDetails: { amount: 1250, category: 'Food & Dining', trend: 'down' },
      },
      {
        id: 'init_n_2',
        type: 'success',
        title: 'ফায়ারবেস ক্লাউড কানেকশন সক্রিয়',
        message: 'রিয়েল-টাইম ডাটাবেস upay-financial-resilience-ai এর সাথে সংযুক্ত।',
        timestamp: Date.now() - 1000 * 60 * 120,
        read: true,
      },
    ];
  });

  // Sync history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
    } catch {
      // ignore
    }
  }, [history]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setHistory((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const showToast = useCallback(
    (notification: Omit<ToastNotification, 'id' | 'timestamp' | 'read'>): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newToast: ToastNotification = {
        ...notification,
        id,
        timestamp: Date.now(),
        duration: notification.duration !== undefined ? notification.duration : 5000,
        read: false,
      };

      // Add to active toasts (max 4 on screen at once to avoid layout clutter)
      setToasts((prev) => [newToast, ...prev.slice(0, 3)]);

      // Add to notification center history (max 30)
      setHistory((prev) => [newToast, ...prev.filter((h) => h.id !== id)].slice(0, 30));

      return id;
    },
    []
  );

  const notifySuccess = useCallback(
    (title: string, message: string, options?: ShowToastOptions) => {
      return showToast({
        type: 'success',
        title,
        message,
        duration: options?.duration ?? 4500,
        action: options?.action,
        financialDetails: options?.financialDetails,
      });
    },
    [showToast]
  );

  const notifyError = useCallback(
    (title: string, message: string, options?: ShowToastOptions) => {
      return showToast({
        type: 'error',
        title,
        message,
        duration: options?.duration ?? 6500,
        action: options?.action,
        financialDetails: options?.financialDetails,
      });
    },
    [showToast]
  );

  const notifyWarning = useCallback(
    (title: string, message: string, options?: ShowToastOptions) => {
      return showToast({
        type: 'warning',
        title,
        message,
        duration: options?.duration ?? 5500,
        action: options?.action,
        financialDetails: options?.financialDetails,
      });
    },
    [showToast]
  );

  const notifyInfo = useCallback(
    (title: string, message: string, options?: ShowToastOptions) => {
      return showToast({
        type: 'info',
        title,
        message,
        duration: options?.duration ?? 4500,
        action: options?.action,
        financialDetails: options?.financialDetails,
      });
    },
    [showToast]
  );

  const notifyFinancial = useCallback(
    (title: string, message: string, options?: ShowToastOptions) => {
      return showToast({
        type: 'financial_alert',
        title,
        message,
        duration: options?.duration ?? 6000,
        action: options?.action,
        financialDetails: options?.financialDetails,
      });
    },
    [showToast]
  );

  const unreadCount = history.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        history,
        unreadCount,
        showToast,
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo,
        notifyFinancial,
        dismissToast,
        clearAllToasts,
        markAllAsRead,
        clearHistory,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

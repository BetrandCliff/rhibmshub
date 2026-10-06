'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  title: string;
  message: string;
  type: ToastType;
};

export function showToast(title: string, message: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: { title, message, type },
    }),
  );
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title: string;
        message: string;
        type: ToastType;
      }>;
      const { title, message, type } = customEvent.detail ?? {};

      if (!title || !message) return;

      const id = Date.now() + Math.random();
      const nextToast = { id, title, message, type: type ?? 'info' };

      setToasts((current) => [...current, nextToast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4200);
    };

    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  return (
    <div className="toast-layer" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
          <div className="toast-icon" aria-hidden="true">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}
          </div>
          <div className="toast-content">
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

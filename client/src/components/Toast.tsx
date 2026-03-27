import { useState, useEffect, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let addToastFn: ((msg: string, type?: ToastItem['type']) => void) | null = null;

export function useToast() {
  return {
    toast: (msg: string, type: ToastItem['type'] = 'success') => {
      if (addToastFn) addToastFn(msg, type);
    },
  };
}

function ToastMsg({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), 3500);
    return () => clearTimeout(t);
  }, [item.id, onRemove]);

  const colors = { success: '#00C4A0', error: '#EF4444', info: '#3B82F6' };
  const icons  = { success: '✓',       error: '✕',       info: 'i' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: 'var(--terra)',
      border: `1px solid ${colors[item.type]}40`,
      borderLeft: `3px solid ${colors[item.type]}`,
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
      animation: 'fadeUp .3s ease both',
      maxWidth: 320,
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: '50%',
        background: colors[item.type],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, color: '#0A0A0A', flexShrink: 0,
      }}>
        {icons[item.type]}
      </span>
      <span style={{ fontSize: 13, color: 'var(--creme)', lineHeight: 1.4 }}>{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        style={{ fontSize: 18, color: 'var(--creme-50)', cursor: 'pointer', marginLeft: 'auto', lineHeight: 1, background: 'none', border: 'none', padding: 0 }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = (msg, type = 'success') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message: msg, type }]);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => <ToastMsg key={t.id} item={t} onRemove={remove} />)}
    </div>
  );
}

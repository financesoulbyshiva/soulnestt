import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message, type = 'success') => {
      const id = ++nextId;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast: push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lift glass-modal text-sm font-medium ${
              t.type === 'error'
                ? 'border-red-200 text-danger'
                : t.type === 'warning'
                  ? 'border-amber-200 text-warning'
                  : 'border-emerald-200 text-success'
            }`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                t.type === 'error' ? 'bg-danger' : t.type === 'warning' ? 'bg-warning' : 'bg-success'
              }`}
            />
            <span className="text-ink">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-auto text-ink-3 hover:text-ink"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

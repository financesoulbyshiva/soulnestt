import { useEffect } from 'react';

export default function Drawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-modal">
        <div className="flex items-center justify-between border-b border-surface-2 px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-2 text-ink-2 hover:bg-surface-1"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

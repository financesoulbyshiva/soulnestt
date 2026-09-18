export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-3" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" aria-hidden />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function EmptyState({ icon = '🪺', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-surface-2 bg-surface px-6 py-14 text-center">
      <span className="gradient-brand flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" aria-hidden>
        {icon}
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {message && <p className="max-w-sm text-sm text-ink-2">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50/50 px-6 py-12 text-center" role="alert">
      <span className="text-2xl" aria-hidden>⚠️</span>
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}

export default function Input({ label, error, hint, className = '', id, ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label && <span className="mb-1.5 block text-xs font-semibold tracking-[0.02em] text-ink-2">{label}</span>}
      <input
        id={inputId}
        className={`w-full rounded-lg border-[1.5px] bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-[3px] ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/15'
            : 'border-surface-2 focus:border-primary focus:ring-primary/15'
        }`}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs font-medium text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-3">{hint}</span>
      ) : null}
    </label>
  );
}

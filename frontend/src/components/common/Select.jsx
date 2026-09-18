export default function Select({ label, error, options = [], placeholder, className = '', id, ...props }) {
  const selectId = id || props.name;
  return (
    <label className={`block ${className}`} htmlFor={selectId}>
      {label && <span className="mb-1.5 block text-xs font-semibold tracking-[0.02em] text-ink-2">{label}</span>}
      <select
        id={selectId}
        className={`w-full rounded-lg border-[1.5px] bg-surface px-4 py-3 text-sm text-ink focus:outline-none focus:ring-[3px] ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/15'
            : 'border-surface-2 focus:border-primary focus:ring-primary/15'
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}

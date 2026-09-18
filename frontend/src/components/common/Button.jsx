export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-[0.02em] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 hover:shadow-lift',
    secondary: 'bg-secondary-soft text-secondary border border-violet-200 hover:bg-violet-100',
    ghost: 'bg-transparent text-ink-2 hover:bg-surface-1',
    danger: 'bg-danger text-white hover:bg-red-600',
    outline: 'bg-surface text-ink-2 border border-surface-2 hover:bg-surface-1',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
    </button>
  );
}

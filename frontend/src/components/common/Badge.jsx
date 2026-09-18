const KINDS = {
  pg: 'bg-blue-50 text-primary border-blue-200',
  flat: 'bg-slate-50 text-slate-700 border-slate-300',
  shared: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  room: 'bg-blue-50 text-primary border-blue-200',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  tenant: 'bg-blue-100 text-blue-800 border-transparent',
  owner: 'bg-indigo-50 text-indigo-700 border-transparent',
  admin: 'bg-ink text-canvas border-transparent',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined: 'bg-red-50 text-red-700 border-red-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  rented: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
  neutral: 'bg-surface-1 text-ink-2 border-surface-2',
  violet: 'bg-secondary-soft text-secondary border-violet-200',
};

export default function Badge({ kind = 'neutral', icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.03em] ${KINDS[kind] || KINDS.neutral} ${className}`}
    >
      {icon && <span aria-hidden className="text-[12px] leading-none">{icon}</span>}
      {children}
    </span>
  );
}

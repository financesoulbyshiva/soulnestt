export default function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl border border-surface-2 bg-surface p-1 shadow-card">
      {tabs.map((t) => {
        const selected = active === t.value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.value)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold tracking-[0.02em] transition-colors ${
              selected ? 'bg-primary text-white' : 'text-ink-2 hover:bg-surface-1'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  selected ? 'bg-white/20 text-white' : 'bg-surface-1 text-ink-3'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

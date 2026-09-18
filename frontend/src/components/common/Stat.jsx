import Card from './Card.jsx';

export default function Stat({ icon, label, value, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-soft text-primary',
    violet: 'bg-secondary-soft text-secondary',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-600',
  };
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${tones[tone]}`} aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block text-2xl font-bold tracking-[-0.02em] text-ink">{value}</span>
        <span className="block text-xs font-semibold tracking-[0.02em] text-ink-3">{label}</span>
      </span>
    </Card>
  );
}

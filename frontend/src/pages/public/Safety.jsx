import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const PILLARS = [
  { icon: '🪪', title: 'Identity & document verification', text: 'Govt-ID checks for tenants, ownership documents for owners, and human review of every flagged listing.' },
  { icon: '🏠', title: 'Safety-scored spaces', text: 'Listings carry safety signals: verified locks, gated community, female-friendly house rules, warden presence.' },
  { icon: '🚩', title: 'Report & resolve', text: 'One-tap reporting on any listing or profile. Our moderation team reviews every report and acts.' },
  { icon: '🔒', title: 'Privacy by default', text: 'Phone numbers stay hidden until both sides connect. No data selling, no spam calls, ever.' },
];

export default function Safety() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="max-w-2xl">
        <Badge kind="verified" icon="🛡">Safety first, always</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.02em] text-ink">
          Moving to a new city shouldn&apos;t feel like a <span className="text-gradient-brand">leap of faith</span>.
        </h1>
        <p className="mt-5 text-base leading-7 text-ink-2">
          Safety is not a feature at SoulNestt — it&apos;s the foundation. Every layer of the platform, from
          verification to moderation, is built so that students and families can trust what they see.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <Card key={p.title} hover className="p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl" aria-hidden>{p.icon}</span>
            <h2 className="mt-4 text-lg font-semibold text-ink">{p.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">{p.text}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-12 border-emerald-200 bg-emerald-50/60 p-8">
        <h2 className="text-lg font-semibold text-emerald-900">Our safety promise</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-emerald-900/90 sm:grid-cols-2">
          <li>✓ Every owner verified before publishing</li>
          <li>✓ Every report reviewed by a human moderator</li>
          <li>✓ Verified badges only after document checks</li>
          <li>✓ Instant takedown of fraudulent listings</li>
        </ul>
      </Card>
    </div>
  );
}

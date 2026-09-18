import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const VALUES = [
  { icon: '🪺', title: 'Belonging', text: 'A home is people, not walls. We design for the moment you click with a flatmate.' },
  { icon: '🔍', title: 'Transparency', text: 'Verified listings, honest photos, clear house rules. What you see is what you get.' },
  { icon: '🇮🇳', title: 'Indian-first', text: 'Built for PGs, shared flats and hostel life in metro India — not copied from abroad.' },
];

export default function About() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="max-w-3xl">
        <Badge kind="violet" icon="✦">Our story</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.02em] text-ink">
          We&apos;re rebuilding the <span className="text-gradient-brand">home-finding</span> experience for young India.
        </h1>
        <p className="mt-6 text-base leading-7 text-ink-2">
          Every year, millions of students and professionals move to a new city full of hope — and spend their first
          weeks anxious, overpaying brokers, and settling for spaces that never feel like home. SoulNestt exists to
          change that: a discovery ecosystem where verification is rigorous, community is real, and every listing
          respects the person behind the search.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {VALUES.map((v) => (
          <Card key={v.title} hover className="p-6">
            <span className="gradient-brand flex h-12 w-12 items-center justify-center rounded-xl text-xl" aria-hidden>{v.icon}</span>
            <h2 className="mt-4 text-lg font-semibold text-ink">{v.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">{v.text}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-12 grid gap-8 p-8 md:grid-cols-3">
        {[
          ['18–29', 'students & young professionals we serve'],
          ['5', 'metro hubs: Bengaluru, Pune, Gurugram, Delhi NCR, Mumbai'],
          ['0', 'brokerage. Ever. Direct owner-to-tenant connection'],
        ].map(([n, t]) => (
          <div key={t}>
            <p className="text-gradient-brand text-4xl font-extrabold">{n}</p>
            <p className="mt-2 text-sm text-ink-2">{t}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const PILLARS = [
  { icon: '🛡️', title: 'Verified first', text: 'Every owner, listing and student credential passes human + document verification before it reaches you.' },
  { icon: '🧭', title: 'Fit over filters', text: 'Match on lifestyle — food, sleep schedule, cleanliness — not just budget and locality.' },
  { icon: '🤝', title: 'Zero brokerage', text: 'Talk directly to owners and flatmates. No middlemen, no hidden fees, no surprises.' },
];

const STEPS = [
  { n: '01', title: 'Create your soul profile', text: 'Tell us how you live — budget, locality, food and sleep habits.' },
  { n: '02', title: 'Discover verified spaces', text: 'Browse PGs, flats and rooms with safety scores and lifestyle tags.' },
  { n: '03', title: 'Connect & move in', text: 'Enquire, schedule a visit and settle into a space that feels like yours.' },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-10">
          <div>
            <Badge kind="violet" icon="✦">India&apos;s co-living discovery home</Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.02em] text-ink md:text-5xl lg:text-6xl">
              Find a room. Find a roommate. <span className="text-gradient-brand">Find your space.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-2">
              SoulNestt connects students and young professionals with verified PGs, flats and roommates in
              Bengaluru, Pune, Gurugram, Delhi NCR and Mumbai — safely, transparently, without brokerage.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth/tenant"><Button size="lg">I need a space</Button></Link>
              <Link to="/auth/owner"><Button size="lg" variant="secondary">I have a space</Button></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge kind="verified" icon="✓">Student Verified</Badge>
              <Badge kind="pg" icon="⌂">Verified PG</Badge>
              <Badge kind="shared" icon="♀">Female-only flats</Badge>
            </div>
          </div>
          <div className="relative">
            <div className="gradient-brand absolute -inset-6 rounded-[2rem] opacity-10 blur-2xl" aria-hidden />
            <Card className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=70"
                alt="Bright, friendly shared apartment living room"
                className="h-72 w-full object-cover md:h-96"
              />
              <div className="glass absolute left-4 top-4 flex gap-2 rounded-full px-3 py-1.5">
                <Badge kind="verified" icon="✓">Background-checked</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-semibold text-ink">Sunlit 2BHK · Koramangala</p>
                  <p className="text-xs text-ink-2">4 min walk to metro · Wi-Fi · Food included</p>
                </div>
                <Badge kind="violet">3 flatmates</Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-surface-2 bg-surface">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-10">
          {PILLARS.map((p) => (
            <Card key={p.title} hover className="p-6">
              <span className="gradient-brand flex h-12 w-12 items-center justify-center rounded-xl text-xl" aria-hidden>{p.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-2">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10">
        <h2 className="text-center text-3xl font-bold tracking-[-0.02em] text-ink">How SoulNestt works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-xl border border-surface-2 bg-surface p-6 shadow-card">
              <span className="text-gradient-brand text-3xl font-extrabold">{s.n}</span>
              <h3 className="mt-3 text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-2">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/how-it-works"><Button variant="outline">Learn more</Button></Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="gradient-brand rounded-2xl px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold tracking-[-0.01em] sm:text-3xl">Your nest is waiting.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/85">
            Join thousands of students and young professionals who found their space — and their people — on SoulNestt.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/auth"><Button size="lg" className="bg-white text-primary hover:bg-slate-100">Get started free</Button></Link>
            <Link to="/safety"><Button size="lg" variant="ghost" className="text-white hover:bg-white/10">Our safety promise</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}

import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';

const TENANT_STEPS = [
  ['Create your soul profile', 'Sign up as a tenant and tell us how you live: budget range, preferred localities, food, sleep and cleanliness habits.'],
  ['Discover & shortlist', 'Search verified PGs, flats and rooms by city, locality and lifestyle. Save the spaces that feel right.'],
  ['Enquire & connect', 'Send an enquiry straight to the owner. Chat-free, spam-free — one clear request, one clear answer.'],
  ['Visit & move in', 'Schedule a visit, verify the space in person, and move into a home that matches your rhythm.'],
];

const OWNER_STEPS = [
  ['List your space', 'Add your PG, flat or room with photos, amenities and house rules. Save as draft until it is perfect.'],
  ['Get verified', 'Submit ownership documents. Verified listings get the trust badge tenants look for.'],
  ['Publish & manage', 'Go live in one tap. Pause anytime when slots fill, edit details, archive old listings.'],
  ['Respond to enquiries', 'Accept or decline tenant enquiries from a single inbox. No calls from strangers.'],
];

function Steps({ title, badge, steps }) {
  return (
    <Card className="p-6 sm:p-8">
      <Badge kind={badge.kind} icon={badge.icon}>{badge.label}</Badge>
      <h2 className="mt-4 text-2xl font-bold tracking-[-0.01em] text-ink">{title}</h2>
      <ol className="mt-6 space-y-5">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-4">
            <span className="gradient-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">{t}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-2">{d}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-[-0.02em] text-ink">How it works</h1>
        <p className="mt-4 text-base leading-7 text-ink-2">
          Two sides, one nest. Whether you&apos;re hunting for a room or filling one, SoulNestt keeps it verified,
          transparent and human.
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Steps title="For tenants" badge={{ kind: 'tenant', icon: '✓', label: 'TENANT' }} steps={TENANT_STEPS} />
        <Steps title="For owners" badge={{ kind: 'owner', icon: '⌂', label: 'OWNER' }} steps={OWNER_STEPS} />
      </div>
      <div className="mt-10 text-center">
        <Link to="/auth"><Button size="lg">Choose your role & start</Button></Link>
      </div>
    </div>
  );
}

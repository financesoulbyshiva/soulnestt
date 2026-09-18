import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';

const ROLES = [
  {
    to: '/auth/tenant',
    kind: 'tenant',
    icon: '🎒',
    title: 'I need a space',
    text: 'Students & professionals searching for PGs, flats and roommates.',
    cta: 'Continue as Tenant',
  },
  {
    to: '/auth/owner',
    kind: 'owner',
    icon: '🏠',
    title: 'I have a space',
    text: 'Owners & co-living operators listing verified rooms and flats.',
    cta: 'Continue as Owner',
  },
  {
    to: '/auth/admin',
    kind: 'admin',
    icon: '🛡️',
    title: 'Platform admin',
    text: 'Moderation, verification and trust & safety operations.',
    cta: 'Admin login',
  },
];

export default function RoleSelection() {
  return (
    <AuthShell
      title="Welcome to SoulNestt"
      subtitle="Find a room. Find a roommate. Find your space."
      footer={<Link to="/" className="font-semibold text-primary hover:underline">← Back to home</Link>}
    >
      <div className="space-y-3">
        {ROLES.map((r) => (
          <Link key={r.to} to={r.to}>
            <Card hover className="flex items-center gap-4 p-4">
              <span className="gradient-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl" aria-hidden>
                {r.icon}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{r.title}</span>
                  <Badge kind={r.kind}>{r.kind.toUpperCase()}</Badge>
                </span>
                <span className="mt-1 block text-xs leading-5 text-ink-2">{r.text}</span>
              </span>
              <span className="text-ink-3" aria-hidden>→</span>
            </Card>
          </Link>
        ))}
      </div>
    </AuthShell>
  );
}

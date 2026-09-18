import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/safety', label: 'Safety' },
  { to: '/contact', label: 'Contact' },
];

export function Logo({ className = 'h-10' }) {
  return (
    <span className={`inline-flex items-center rounded-lg bg-night px-2.5 py-1.5 ${className}`}>
      <img src="/assets/soulnestt-logo.png" alt="SoulNestt" className="h-full w-auto object-contain" style={{ maxHeight: 34 }} />
    </span>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const homeFor = user ? (user.role === 'TENANT' ? '/tenant' : user.role === 'OWNER' ? '/owner' : '/admin') : null;

  return (
    <header className="sticky top-0 z-40 border-b border-surface-2 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link to={homeFor || '/'} aria-label="SoulNestt home">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold tracking-[0.02em] ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-ink-2 hover:bg-surface-1'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <Button onClick={() => (window.location.href = homeFor)}>Open Dashboard</Button>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link to="/auth/tenant">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg border border-surface-2 text-ink-2 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <nav className="border-t border-surface-2 bg-surface px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-primary-soft text-primary' : 'text-ink-2'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 flex gap-2 border-t border-surface-2 pt-3">
            {user ? (
              <Button className="flex-1" onClick={() => (window.location.href = homeFor)}>Open Dashboard</Button>
            ) : (
              <>
                <Link to="/auth" className="flex-1"><Button variant="outline" className="w-full">Sign in</Button></Link>
                <Link to="/auth/tenant" className="flex-1"><Button className="w-full">Get Started</Button></Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

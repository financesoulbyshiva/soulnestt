import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../common/Badge.jsx';
import { Logo } from './Navbar.jsx';

const NAV = {
  TENANT: [
    { to: '/tenant', label: 'Dashboard' },
    { to: '/discover', label: 'Discover' },
    { to: '/profile', label: 'Profile' },
  ],
  OWNER: [
    { to: '/owner', label: 'Dashboard' },
    { to: '/owner/spaces', label: 'My Spaces' },
    { to: '/profile', label: 'Profile' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
  ],
};

export default function PlatformNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user?.role] || [];

  return (
    <header className="sticky top-0 z-40 border-b border-surface-2 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link to={links[0]?.to || '/'} aria-label="SoulNestt home">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
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

        <div className="ml-auto flex items-center gap-2">
          <Badge kind={user?.role?.toLowerCase()}>{user?.role}</Badge>
          <span className="hidden text-sm font-semibold text-ink sm:block">{user?.name}</span>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="rounded-lg border border-surface-2 px-3 py-2 text-sm font-semibold text-ink-2 hover:bg-surface-1"
          >
            Logout
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-surface-2 px-4 py-2 md:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                isActive ? 'bg-primary-soft text-primary' : 'text-ink-2'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

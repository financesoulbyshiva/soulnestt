import { Logo } from '../layout/Navbar.jsx';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center justify-center py-6">
        <Logo className="h-11" />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <h1 className="text-center text-2xl font-bold tracking-[-0.01em] text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-center text-sm text-ink-2">{subtitle}</p>}
          <div className="mt-8 rounded-2xl border border-surface-2 bg-surface p-6 shadow-card sm:p-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink-2">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

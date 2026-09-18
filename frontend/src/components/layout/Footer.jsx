import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-night text-slate-300">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-10">
        <div>
          <img src="/assets/soulnestt-logo.png" alt="SoulNestt" className="h-16 w-auto rounded-lg" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
            Find a room. Find a roommate. Find your space. Verified co-living discovery for students and young
            professionals across India.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/about">About</Link></li>
            <li><Link className="hover:text-white" to="/how-it-works">How It Works</Link></li>
            <li><Link className="hover:text-white" to="/safety">Safety</Link></li>
            <li><Link className="hover:text-white" to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Join SoulNestt</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/auth/tenant">I need a space</Link></li>
            <li><Link className="hover:text-white" to="/auth/owner">I have a space</Link></li>
            <li><Link className="hover:text-white" to="/auth/admin">Admin login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SoulNestt. Made with care in India.
      </div>
    </footer>
  );
}

import { Outlet } from 'react-router-dom';
import PlatformNavbar from '../components/layout/PlatformNavbar.jsx';

export default function PlatformLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <PlatformNavbar />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}

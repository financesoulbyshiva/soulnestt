import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import PlatformLayout from '../layouts/PlatformLayout.jsx';
import { ProtectedRoute, RoleRoute, GuestRoute } from './guards.jsx';

import Home from '../pages/public/Home.jsx';
import About from '../pages/public/About.jsx';
import HowItWorks from '../pages/public/HowItWorks.jsx';
import Safety from '../pages/public/Safety.jsx';
import Contact from '../pages/public/Contact.jsx';

import RoleSelection from '../pages/auth/RoleSelection.jsx';
import RoleAuth from '../pages/auth/RoleAuth.jsx';
import AdminLogin from '../pages/auth/AdminLogin.jsx';

import TenantDashboard from '../pages/platform/TenantDashboard.jsx';
import OwnerDashboard from '../pages/platform/OwnerDashboard.jsx';
import AdminDashboard from '../pages/platform/AdminDashboard.jsx';
import Profile from '../pages/platform/Profile.jsx';
import OwnerSpaces from '../pages/platform/OwnerSpaces.jsx';
import Discover from '../pages/platform/Discover.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1-5 · Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* 6-9 · Auth */}
      <Route
        path="/auth"
        element={
          <GuestRoute>
            <RoleSelection />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/tenant"
        element={
          <GuestRoute>
            <RoleAuth role="TENANT" />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/owner"
        element={
          <GuestRoute>
            <RoleAuth role="OWNER" />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/admin"
        element={
          <GuestRoute>
            <AdminLogin />
          </GuestRoute>
        }
      />

      {/* 10-15 · Platform */}
      <Route
        element={
          <ProtectedRoute>
            <PlatformLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/tenant"
          element={
            <RoleRoute roles={['TENANT']}>
              <TenantDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <RoleRoute roles={['TENANT']}>
              <Discover />
            </RoleRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <RoleRoute roles={['OWNER']}>
              <OwnerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/spaces"
          element={
            <RoleRoute roles={['OWNER']}>
              <OwnerSpaces />
            </RoleRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleRoute roles={['ADMIN']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

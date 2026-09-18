import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loading } from '../components/common/States.jsx';

const roleHome = (role) => (role === 'TENANT' ? '/tenant' : role === 'OWNER' ? '/owner' : '/admin');

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Checking your session…" />;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  return children;
}

export function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading label="Checking your session…" />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading label="Checking your session…" />;
  if (user) return <Navigate to={roleHome(user.role)} replace />;
  return children;
}

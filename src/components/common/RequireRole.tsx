import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import type { Role } from '../../types';

/** Only lets the matching kind of account through; everyone else is sent to the right login page. */
export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: 320 }}><Loader2 className="spin" color="#B84922" /></div>;
  }
  if (!user) {
    return <Navigate to={role === 'caterer' ? '/partner-login' : '/login'} replace state={{ from: location.pathname }} />;
  }
  if (user.role !== role) {
    return <Navigate to={user.role === 'caterer' ? '/dashboard' : '/caterers'} replace />;
  }
  return <>{children}</>;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, initialized } = useAuth();

  // Show loading state while checking auth
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="text-center py-8 px-12">
            <div className="text-xl font-semibold">Loading...</div>
          </div>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

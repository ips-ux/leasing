import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui';

interface NavLinkItemProps {
  to: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const NavLinkItem = ({ to, children, disabled = false }: NavLinkItemProps) => {
  if (disabled) {
    return (
      <div className="px-4 py-3 text-neuro-muted cursor-not-allowed border-l-4 border-transparent">
        {children}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-3 border-l-4 transition-all duration-200 font-medium ${isActive
          ? 'border-neuro-lavender bg-neuro-lavender/20 text-neuro-primary'
          : 'border-transparent hover:bg-white/20 hover:border-neuro-blue/40 text-neuro-secondary'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export const Sidebar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <aside
      className="w-64 h-screen flex flex-col sticky top-0"
      style={{
        borderRight: '1px solid rgba(255, 255, 255, 0.4)'
      }}
    >
      {/* Header/Logo */}
      <div className="p-6 border-b border-white/20">
        <h1 className="text-2xl font-semibold text-neuro-primary">Leasing Assist</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1">
          <NavLinkItem to="/dashboard">Dashboard</NavLinkItem>
          <NavLinkItem to="/applicants">Applicants</NavLinkItem>
          <NavLinkItem to="/inquiries">Inquiries</NavLinkItem>
          <NavLinkItem to="/reports">Reports</NavLinkItem>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 rounded-full bg-neuro-base shadow-neuro-pressed">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neuro-lavender shadow-neuro-flat">
              <span className="text-lg font-semibold text-neuro-primary">
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate text-sm text-neuro-primary">
              {user?.displayName || 'User'}
            </div>
            <div className="text-xs text-neuro-secondary truncate">
              {user?.email}
            </div>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={handleSignOut}
          className="w-full text-sm"
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

import { useState } from 'react';
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
      <div className="px-4 py-3 text-black/40 cursor-not-allowed border-l-4 border-transparent">
        {children}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-3 border-l-4 transition-all duration-100 font-semibold ${isActive
          ? 'border-lavender bg-lavender/20 text-black'
          : 'border-transparent hover:bg-black/5 hover:border-black/20 text-black/70'
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
    <aside className="w-64 bg-white/30 backdrop-blur-sm border-r-[3px] border-black/20 h-screen flex flex-col sticky top-0">
      {/* Header/Logo */}
      <div className="p-6 border-b-[3px] border-black/20">
        <h1 className="text-2xl font-bold">Leasing Assist</h1>
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
      <div className="p-4 border-t-[3px] border-black/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 border-[3px] border-black bg-lavender">
            <span className="text-lg font-bold">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate text-sm">
              {user?.displayName || 'User'}
            </div>
            <div className="text-xs text-black/60 truncate">
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

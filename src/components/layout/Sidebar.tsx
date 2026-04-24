import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faUsers,
  faComments,
  faCalendarDays,
  faChartBar,
  faHouseChimney,
  faParking,
  faEnvelopeOpenText,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useAuth } from '../../hooks/useAuth';
import { Button, FancyButton, UserSettingsPopover, ChangePasswordModal } from '../ui';
import { changePassword } from '../../firebase/auth';
import { useState, useRef } from 'react';

interface NavLinkItemProps {
  to: string;
  icon: IconDefinition;
  children: React.ReactNode;
  disabled?: boolean;
}

const NavLinkItem = ({ to, icon, children, disabled = false }: NavLinkItemProps) => {
  if (disabled) {
    return (
      <div className="px-5 py-3 text-sidebar-muted cursor-not-allowed rounded-xl mx-2 flex items-center gap-3">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 shrink-0" />
        <span>{children}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-5 py-3 rounded-xl transition-all duration-200 font-medium mx-2 gap-3 ${isActive
          ? 'bg-sidebar-surface text-white shadow-inner-light'
          : 'text-sidebar-muted hover:text-white hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`sidebar-radio-input ${isActive ? 'active' : ''}`} />
          <FontAwesomeIcon icon={icon} className="w-4 h-4 shrink-0" />
          <span>{children}</span>
        </>
      )}
    </NavLink>
  );
};

export const Sidebar = () => {
  const { user, signOut } = useAuth();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    signOut();
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    await changePassword(currentPassword, newPassword);
  };

  return (
    <aside
      className="hidden md:flex w-72 h-screen flex-col sticky top-0 bg-sidebar-bg text-sidebar-text shadow-xl z-50"
    >
      {/* Header/Logo */}
      <div className="p-8 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Property Master Book</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-2">
        <NavLinkItem to="/dashboard"  icon={faGauge}>Dashboard</NavLinkItem>
        <NavLinkItem to="/applicants" icon={faUsers}>Applicants</NavLinkItem>
        <NavLinkItem to="/inquiries"  icon={faComments}>Inquiries</NavLinkItem>
        <NavLinkItem to="/scheduler"  icon={faCalendarDays}>Scheduler</NavLinkItem>
        <NavLinkItem to="/rentables"  icon={faParking}>Rentable Items</NavLinkItem>
        <NavLinkItem to="/scripts"    icon={faEnvelopeOpenText}>Email Scripts</NavLinkItem>
        <NavLinkItem to="/welcome-home" icon={faHouseChimney} disabled>Welcome Home</NavLinkItem>
      </nav>

      {/* Bottom-pinned nav items */}
      <div className="px-4 pb-2 space-y-2">
        <NavLinkItem to="/reports" icon={faChartBar}>Reports</NavLinkItem>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-bg">
        <div className="neu-dark p-4 mb-4 flex items-center gap-3 relative">
          <div ref={avatarRef} className="relative">
            <FancyButton
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className="p-1 rounded-full hover:bg-sidebar-surface transition-colors"
              isActive={isPopoverOpen}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-sidebar-surface to-black shadow-inner border border-sidebar-border">
                <span className="text-sm font-bold text-white">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            </FancyButton>

            <UserSettingsPopover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
              onChangePassword={() => setIsPasswordModalOpen(true)}
              anchorRef={avatarRef}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate text-sm text-white/90">
              {user?.Agent_Name || 'User'}
            </div>
            <div className="text-xs text-sidebar-muted truncate">
              {user?.email}
            </div>
          </div>
        </div>

        <Button
          variant="danger-dark"
          onClick={handleSignOut}
          className="w-full text-sm py-3 rounded-xl border border-red-900/30"
        >
          Sign Out
        </Button>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </aside>
  );
};

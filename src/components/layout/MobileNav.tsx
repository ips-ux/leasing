import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faUsers,
  faComments,
  faCalendarDays,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChangePasswordModal } from '../ui';
import { changePassword } from '../../firebase/auth';

interface MobileNavItem {
  to: string;
  icon: typeof faGauge;
  label: string;
}

const navItems: MobileNavItem[] = [
  { to: '/dashboard',  icon: faGauge,       label: 'Dashboard'  },
  { to: '/applicants', icon: faUsers,        label: 'Applicants' },
  { to: '/inquiries',  icon: faComments,     label: 'Inquiries'  },
  { to: '/scheduler',  icon: faCalendarDays, label: 'Scheduler'  },
];

export const MobileNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isUserMenuOpen]);

  return (
    <>
      <nav className="mobile-nav-bar md:hidden">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `mobile-nav-item${isActive ? ' mobile-nav-item--active' : ''}`
            }
          >
            <FontAwesomeIcon icon={icon} />
          </NavLink>
        ))}

        {/* Reports — pinned before user */}
        <NavLink
          to="/reports"
          title="Reports"
          className={({ isActive }) =>
            `mobile-nav-item${isActive ? ' mobile-nav-item--active' : ''}`
          }
        >
          <FontAwesomeIcon icon={faChartBar} />
        </NavLink>

        {/* User button */}
        <div ref={userMenuRef} className="mobile-nav-item mobile-nav-user-wrap">
          <button
            className="mobile-nav-avatar-btn"
            title={user?.displayName || user?.email || 'User'}
            aria-label="User menu"
            onClick={() => setIsUserMenuOpen(v => !v)}
          >
            <span className="mobile-nav-avatar">
              {user?.displayName?.[0]?.toUpperCase() ||
               user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="mobile-user-dropdown">
              <div className="mobile-user-dropdown-header">
                <div className="mobile-user-dropdown-name">
                  {user?.Agent_Name || user?.displayName || 'User'}
                </div>
                <div className="mobile-user-dropdown-email">{user?.email}</div>
              </div>
              <button
                className="mobile-user-dropdown-item"
                onClick={() => { navigate('/templates'); setIsUserMenuOpen(false); }}
              >
                Email Templates
              </button>
              <button
                className="mobile-user-dropdown-item"
                onClick={() => { setIsPasswordModalOpen(true); setIsUserMenuOpen(false); }}
              >
                Change Password
              </button>
              <button
                className="mobile-user-dropdown-item mobile-user-dropdown-item--danger"
                onClick={() => { signOut(); setIsUserMenuOpen(false); }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </>
  );

  async function handleChangePassword(currentPassword: string, newPassword: string) {
    await changePassword(currentPassword, newPassword);
  }
};

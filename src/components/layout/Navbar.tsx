import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="backdrop-blur-xl max-w-7xl margin-auto border-4 border-black/20 sticky top-1 z-30 mx-4"
      style={{ background: 'rgba(180, 212, 255, 0.15)', margin: '0 auto' }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold font-sans">Leasing Assist</h1>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-100 ${isActive
                    ? 'text-black border-b-3 border-lavender pb-1'
                    : 'text-black/60 hover:text-black'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/applicants"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-100 ${isActive
                    ? 'text-black border-b-3 border-lavender pb-1'
                    : 'text-black/60 hover:text-black'
                  }`
                }
              >
                Applicants
              </NavLink>
              <NavLink
                to="/inquiries"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-100 ${isActive
                    ? 'text-black border-b-3 border-lavender pb-1'
                    : 'text-black/60 hover:text-black'
                  }`
                }
              >
                Inquiries
              </NavLink>
              <span className="text-sm font-semibold text-black/30 cursor-not-allowed">
                Activity Log
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-black/60">
              {user?.displayName || user?.email}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-10 h-10 border-3 border-black bg-lavender hover:bg-lavender/80 transition-all duration-100 active:scale-95"
                aria-label="User menu"
              >
                <span className="text-lg font-bold">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </button>

              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white border-3 border-black shadow-brutal z-50">
                    <div className="p-4 border-b-3 border-black">
                      <div className="font-semibold truncate">{user?.displayName || 'User'}</div>
                      <div className="text-sm text-black/60 truncate">{user?.email}</div>
                    </div>

                    <div className="p-2">
                      <Button
                        variant="danger"
                        onClick={handleSignOut}
                        className="w-full justify-start text-left"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

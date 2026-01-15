import { NavLink } from 'react-router-dom';

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
        `block px-4 py-3 border-l-4 transition-all duration-100 ${
          isActive
            ? 'border-lavender bg-lavender/10 font-semibold'
            : 'border-transparent hover:bg-black/5 hover:border-black/20'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r-3 border-black min-h-[calc(100vh-4rem)]">
      <nav className="py-4">
        <div className="space-y-1">
          <NavLinkItem to="/dashboard">Dashboard</NavLinkItem>
          <NavLinkItem to="/applicants">Applicants</NavLinkItem>
          <NavLinkItem to="/inquiries">Inquiries</NavLinkItem>
          <NavLinkItem to="/activity" disabled>Activity Log</NavLinkItem>
        </div>

        <div className="mt-8 px-4">
          <div className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-2">
            Coming Soon
          </div>
          <div className="text-sm text-black/60 space-y-1">
            <div>• Activity Tracking</div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

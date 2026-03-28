import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ContentContainer } from './ContentContainer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-main">
      {/* Left Sidebar — desktop only */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-x-hidden flex flex-col">
        {/* Top icon bar — mobile only */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        <ContentContainer>
          {children}
        </ContentContainer>
      </main>
    </div>
  );
};

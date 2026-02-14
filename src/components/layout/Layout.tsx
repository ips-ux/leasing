import { Sidebar } from './Sidebar';
import { ContentContainer } from './ContentContainer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex bg-main">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-x-hidden">
        <ContentContainer>
          {children}
        </ContentContainer>
      </main>
    </div>
  );
};

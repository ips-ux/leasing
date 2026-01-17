import { Sidebar } from './Sidebar';
import { GradientBackground } from '../ui';
import { ContentContainer } from './ContentContainer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <GradientBackground />
      <div className="min-h-screen flex">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1">
          <ContentContainer>
            {children}
          </ContentContainer>
        </main>
      </div>
    </>
  );
};

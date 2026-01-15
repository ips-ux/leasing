import { Navbar } from './Navbar';
import { GradientBackground } from '../ui';
import { ContentContainer } from './ContentContainer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <GradientBackground />
      <div className="min-h-screen">
        <Navbar />
        <main className="p-8">
          <ContentContainer>
            {children}
          </ContentContainer>
        </main>
      </div>
    </>
  );
};

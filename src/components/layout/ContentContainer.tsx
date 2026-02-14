import type { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export const ContentContainer = ({ children, className = '' }: ContentContainerProps) => {
  return (
    <div className={`w-full max-w-7xl mx-auto p-8 ${className}`}>
      {children}
    </div>
  );
};

import type { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export const ContentContainer = ({ children, className = '' }: ContentContainerProps) => {
  return (
    <div className="min-h-screen flex items-start justify-center">
      <div
        className={`w-full min-h-screen p-4 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

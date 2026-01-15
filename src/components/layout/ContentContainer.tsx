import type { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export const ContentContainer = ({ children, className = '' }: ContentContainerProps) => {
  return (
    <div className="min-h-screen p-8 flex items-start justify-center">
      <div
        className={`w-full max-w-7xl p-8 backdrop-blur-xl border-4 border-black/20 ${className}`}
        style={{
          background: 'rgba(180, 212, 255, 0.15)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

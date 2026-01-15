import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'high' | 'medium' | 'low' | 'success' | 'info';
  className?: string;
}

export const Badge = ({ children, variant = 'info', className = '' }: BadgeProps) => {
  const variantClasses = {
    high: 'bg-peach animate-pulse-urgent',
    medium: 'bg-soft-yellow',
    low: 'bg-pale-blue opacity-80',
    success: 'bg-mint',
    info: 'bg-lavender'
  };

  return (
    <span className={`inline-block font-mono font-bold text-xs px-3 py-1 border-2 border-black ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

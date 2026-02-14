import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'high' | 'medium' | 'low' | 'success' | 'info';
  className?: string;
}

export const Badge = ({ children, variant = 'info', className = '' }: BadgeProps) => {
  const variantClasses = {
    high: 'bg-error/10 text-error border border-error/20',
    medium: 'bg-warning/10 text-warning border border-warning/20',
    low: 'bg-secondary/10 text-secondary border border-secondary/20',
    success: 'bg-success/10 text-success border border-success/20',
    info: 'bg-accent/10 text-accent border border-accent/20'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'high' | 'medium' | 'low' | 'success' | 'info';
  className?: string;
}

export const Badge = ({ children, variant = 'info', className = '' }: BadgeProps) => {
  const variantClasses = {
    high: 'bg-neuro-peach text-neuro-primary animate-pulse-urgent',
    medium: 'bg-neuro-yellow text-neuro-primary',
    low: 'bg-neuro-blue text-neuro-secondary opacity-90',
    success: 'bg-neuro-mint text-neuro-primary',
    info: 'bg-neuro-lavender text-neuro-primary'
  };

  return (
    <span className={`inline-block font-mono font-bold text-xs px-3 py-1 rounded-neuro-sm shadow-neuro-pressed ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

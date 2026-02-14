import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  priority?: 'high' | 'medium' | 'low' | null;
  onClick?: () => void;
  hoverable?: boolean;
  disableHoverAnimation?: boolean;
}

export const Card = ({
  children,
  className = '',
  priority = null,
  onClick,
  hoverable = false,
  disableHoverAnimation = false
}: CardProps) => {
  const priorityClasses = {
    high: 'border-l-4 border-error',
    medium: 'border-l-4 border-warning',
    low: 'border-l-4 border-tertiary'
  };

  const priorityClass = priority ? priorityClasses[priority] : '';
  const hoverClass = (hoverable || onClick) ? 'cursor-pointer' : '';

  return (
    <motion.div
      className={`neu-flat p-5 bg-surface ${priorityClass} ${hoverClass} ${className}`}
      onClick={onClick}
      whileHover={(!disableHoverAnimation && (hoverable || onClick)) ? { y: -4, boxShadow: '8px 8px 16px #D1D9E6, -8px -8px 16px #FFFFFF' } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

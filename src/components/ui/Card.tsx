import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  priority?: 'high' | 'medium' | 'low' | null;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card = ({
  children,
  className = '',
  priority = null,
  onClick,
  hoverable = false
}: CardProps) => {
  const priorityClasses = {
    high: 'border-l-4 border-neuro-peach',
    medium: 'border-l-4 border-neuro-yellow',
    low: 'border-l-4 border-neuro-element-dark'
  };

  const priorityClass = priority ? priorityClasses[priority] : '';
  const hoverClass = (hoverable || onClick) ? 'hover:shadow-neuro-raised cursor-pointer transition-all duration-300' : '';

  return (
    <motion.div
      className={`rounded-neuro-lg shadow-neuro-flat p-5 ${priorityClass} ${hoverClass} ${className}`}
      onClick={onClick}
      whileHover={hoverable || onClick ? { y: -2 } : undefined}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
};

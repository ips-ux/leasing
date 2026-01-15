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
    high: 'border-peach animate-pulse-glow',
    medium: 'border-soft-yellow',
    low: 'border-pale-blue opacity-80'
  };

  const priorityClass = priority ? priorityClasses[priority] : 'border-black';
  const hoverClass = (hoverable || onClick) ? 'hover:shadow-brutal hover:bg-white/25 cursor-pointer transition-all duration-200' : '';

  return (
    <motion.div
      className={`bg-white/15 backdrop-blur-md border-[3px] ${priorityClass} p-5 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

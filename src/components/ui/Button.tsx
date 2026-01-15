import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  variant = 'primary',
  children,
  isLoading = false,
  disabled,
  className = '',
  onClick,
  type = 'button'
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-lavender',
    secondary: 'bg-pale-blue',
    danger: 'bg-peach'
  };

  return (
    <motion.button
      type={type}
      className={`font-bold px-6 py-3 border-[3px] border-black shadow-brutal hover:shadow-brutal-hover active:shadow-brutal-active disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ x: -2, y: -2 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      {isLoading ? (
        <motion.div
          className="inline-block w-5 h-5 border-[3px] border-black border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
};

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
    primary: 'bg-neuro-lavender text-neuro-primary',
    secondary: 'bg-neuro-blue text-neuro-primary',
    danger: 'bg-neuro-peach text-neuro-primary'
  };

  return (
    <motion.button
      type={type}
      className={`font-semibold px-6 py-3 rounded-neuro-md btn-neuro disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={{
        boxShadow: disabled ? 'none' : undefined
      }}
    >
      {isLoading ? (
        <motion.div
          className="inline-block w-5 h-5 border-[3px] border-neuro-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
};

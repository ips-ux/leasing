import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-dark';
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary: 'neu-action bg-surface text-primary hover:text-accent',
    secondary: 'neu-flat hover:neu-pressed text-secondary',
    danger: 'neu-flat hover:neu-pressed text-error bg-red-50/50',
    'danger-dark': 'neu-dark-action text-red-400 hover:text-red-300 hover:bg-red-900/20'
  };

  return (
    <motion.button
      className={`font-medium px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      {...props as HTMLMotionProps<"button">}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="font-medium text-sm text-secondary ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`neu-pressed px-4 py-3 bg-main text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${error ? 'ring-2 ring-error/50' : ''} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-error text-sm font-medium ml-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

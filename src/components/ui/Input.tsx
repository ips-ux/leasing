import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const errorClass = error ? 'border-peach' : '';

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="font-sans font-semibold text-sm">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-4 py-2 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans focus:outline-none focus:ring-4 focus:ring-lavender/40 disabled:opacity-50 disabled:cursor-not-allowed ${errorClass} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-peach text-sm font-sans">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

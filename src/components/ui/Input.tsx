import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const errorClass = error ? 'bg-neuro-peach/30' : '';
    const errorShadow = error ? '0 0 0 2px rgba(245, 198, 198, 0.4)' : '';

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="font-sans font-medium text-sm text-neuro-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-4 py-2 rounded-neuro-md shadow-neuro-pressed bg-white/50 font-sans text-neuro-primary placeholder:text-neuro-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${errorClass} ${className}`}
          style={{
            boxShadow: error ? errorShadow : undefined
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 197, 249, 0.3)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.boxShadow = '';
            }
          }}
          {...props}
        />
        {error && (
          <span className="text-neuro-primary text-sm font-sans opacity-80">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

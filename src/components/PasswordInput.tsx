import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string | null;
  hint?: string;
  showIcon?: boolean;
  rightAction?: React.ReactNode;
  containerClassName?: string;
}

/**
 * Reusable PasswordInput with accessible show/hide password toggle.
 *
 * Requirements fulfilled:
 * - Show/hide eye icon inside the password input
 * - Clicking the icon toggles between `type="password"` and `type="text"`
 * - Button type="button" prevents form submission or clearing entered password
 * - Accessible labels ("Show password" and "Hide password") and ARIA attributes
 * - Preserves password validation, autocomplete, keyboard navigation and styling
 * - Hidden by default
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      hint,
      showIcon = true,
      rightAction,
      containerClassName = '',
      className = '',
      id,
      name,
      value,
      onChange,
      placeholder = '••••••••',
      required = false,
      minLength,
      autoComplete = 'current-password',
      disabled = false,
      ...restProps
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const inputId = id || (name ? `input-${name}` : undefined);

    const toggleVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible((prev) => !prev);
    };

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {(label || rightAction) && (
          <div className="flex items-center justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
            {label ? (
              <label htmlFor={inputId} className="block cursor-pointer">
                {label} {required && <span className="text-rose-500">*</span>}
              </label>
            ) : (
              <span />
            )}
            {rightAction}
          </div>
        )}

        <div className="relative">
          {showIcon && (
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}

          <input
            {...restProps}
            ref={ref}
            id={inputId}
            name={name}
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            minLength={minLength}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={`w-full py-2.5 rounded-lg border text-sm transition-colors text-stone-900 dark:text-white bg-white dark:bg-stone-800 disabled:bg-stone-100 dark:disabled:bg-stone-900 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
              showIcon ? 'pl-10' : 'pl-3.5'
            } pr-11 ${
              error
                ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                : 'border-stone-300 dark:border-stone-700'
            } ${className}`}
          />

          <button
            type="button"
            onClick={toggleVisibility}
            disabled={disabled}
            tabIndex={0}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isVisible}
            title={isVisible ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {isVisible ? 'Hide password' : 'Show password'}
            </span>
          </button>
        </div>

        {error && (
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

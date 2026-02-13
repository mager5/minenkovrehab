import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    const togglePassword = () => setShowPassword(!showPassword);

    const showTooltip =
      error &&
      type === 'email' &&
      typeof props.value === 'string' &&
      props.value.length > 0 &&
      !props.value.includes('@');

    return (
      <div className='w-full space-y-1'>
        {label && (
          <label
            htmlFor={props.id}
            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700'
          >
            {label}
          </label>
        )}
        <div className='relative'>
          <input
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {/* Custom Stylish Tooltip for Email Validation */}
          {showTooltip && (
            <div className='absolute z-10 left-0 top-full mt-2 w-full max-w-[280px] sm:max-w-xs animate-in fade-in slide-in-from-top-2'>
              <div className='relative bg-white border border-gray-200 text-gray-800 text-xs rounded-lg shadow-xl p-3 flex items-start gap-3'>
                {/* Arrow */}
                <div className='absolute -top-1.5 left-4 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 transform'></div>

                {/* Icon */}
                <div className='shrink-0 text-orange-500 mt-0.5'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      fillRule='evenodd'
                      d='M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className='flex-1'>
                  <p className='font-semibold mb-1'>
                    Пожалуйста, укажите символ '@'
                  </p>
                  <p className='text-gray-500'>
                    В адресе '{props.value}' отсутствует символ '@'.
                  </p>
                </div>
              </div>
            </div>
          )}
          {isPassword && (
            <button
              type='button'
              onClick={togglePassword}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
              <span className='sr-only'>
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </button>
          )}
        </div>
        {error && !showTooltip && (
          <p className='text-sm text-red-500 animate-in slide-in-from-top-1 fade-in'>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className='text-sm text-gray-500'>{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

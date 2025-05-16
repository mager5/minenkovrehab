import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  external?: boolean;
}

export function Button({
  children,
  onClick,
  href,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  external = false,
}: ButtonProps) {
  // Базовые классы
  const baseClasses = 'font-medium rounded-md transition-all focus:outline-none';
  
  // Классы для вариантов
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-white hover:bg-gray-100 text-primary border border-gray-200',
    accent: 'bg-accent hover:bg-accent-dark text-white',
    outline: 'bg-transparent hover:bg-primary/10 text-primary border border-primary',
  };
  
  // Классы для размеров
  const sizeClasses = {
    sm: 'text-sm px-4 py-2',
    md: 'px-6 py-3',
    lg: 'text-lg px-8 py-4',
  };
  
  // Собираем все классы вместе
  const allClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg'}
    ${className}
  `;
  
  // Если компонент должен быть ссылкой
  if (href) {
    const linkProps = external 
      ? { 
          href, 
          target: "_blank", 
          rel: "noopener noreferrer" 
        } 
      : { href };
    
    return (
      <Link
        className={allClasses}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }
  
  // В противном случае - обычная кнопка
  return (
    <button
      type={type}
      className={allClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
} 
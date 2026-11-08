'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { Transition } from '@headlessui/react';

interface AuthPopoverProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export default function AuthPopover({
  isMobile = false,
  isOpen: controlledIsOpen,
  onToggle,
  onClose,
}: AuthPopoverProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isOpen = isMobile ? !!controlledIsOpen : internalIsOpen;

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isMobile && onClose) onClose();
        else setInternalIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isMobile, onClose]);

  // Focus trap for mobile
  useEffect(() => {
    if (isMobile && isOpen && popoverRef.current) {
      const focusableElements = popoverRef.current.querySelectorAll(
        'a, button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isMobile, isOpen]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setInternalIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => {
      setInternalIsOpen(false);
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Снимаем фокус с текущего элемента (иконки) для удаления обводки
    if (
      typeof document !== 'undefined' &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }

    if (isMobile && onToggle) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className='relative z-50'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={popoverRef}
    >
      <Link
        href='/login'
        onClick={handleClick}
        className={
          isMobile
            ? `w-12 h-12 rounded-full bg-sky flex items-center justify-center text-navy ds-focus ${isOpen ? 'ring-2 ring-brand' : ''}`
            : `inline-flex items-center gap-1.5 min-h-[44px] px-2 rounded-full font-semibold text-[16px] text-brand hover:text-navy no-underline ds-focus`
        }
        aria-expanded={isOpen}
        aria-haspopup='true'
        aria-label={isMobile ? 'Войти' : undefined}
        role='button'
      >
        <User className='w-5 h-5' aria-hidden='true' />
        {!isMobile && <span>Войти</span>}
      </Link>

      <Transition
        as={Fragment}
        show={isOpen}
        enter='transition ease-out duration-200'
        enterFrom='opacity-0 translate-y-1'
        enterTo='opacity-100 translate-y-0'
        leave='transition ease-in duration-150'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-1'
      >
        <div
          className={`${
            isMobile
              ? 'fixed left-4 right-4 top-[5rem] w-auto'
              : 'absolute right-0 mt-2 w-80'
          } origin-top-right pt-2 z-50`}
        >
          <div className='bg-white rounded-[24px] shadow-pop p-6 relative'>
            {/* Triangle pointer - hide on mobile as positioning changes */}
            {!isMobile && (
              <div className='absolute -top-2 right-8 w-4 h-4 bg-white transform rotate-45'></div>
            )}

            <p className='text-[16px] text-muted mb-5 leading-relaxed relative z-10'>
              Войдите, чтобы получить доступ к вашим программам и материалам.
            </p>

            <div className='flex flex-col gap-3 relative z-10'>
              <Link
                href='/login'
                className='ds-btn ds-btn-primary ds-btn-md ds-btn-block'
                onClick={() => isMobile && onClose && onClose()}
              >
                Войти или зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

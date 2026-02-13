'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Transition } from '@headlessui/react';

export default function AuthPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // delay to allow moving to popover
  };

  return (
    <div
      className='relative z-50'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href='/login'
        className={`
          flex items-center justify-center text-primary text-sm font-medium py-1.5 px-3 
          border border-primary rounded-md hover:bg-primary hover:text-white 
          transition-all duration-300 transform active:scale-95 
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isOpen ? 'bg-primary text-white' : ''}
        `}
      >
        <LogIn className='w-4 h-4 mr-1.5' />
        <span>Войти</span>
      </Link>

      <Transition
        show={isOpen}
        enter='transition ease-out duration-200'
        enterFrom='opacity-0 translate-y-1'
        enterTo='opacity-100 translate-y-0'
        leave='transition ease-in duration-150'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-1'
      >
        <div className='absolute right-0 mt-2 w-80 origin-top-right pt-2'>
          <div className='bg-white rounded-xl shadow-xl ring-1 ring-black/5 p-6 border border-gray-100 relative'>
            {/* Triangle pointer */}
            <div className='absolute -top-2 right-8 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45'></div>

            <p className='text-sm text-gray-600 mb-6 leading-relaxed relative z-10'>
              Войдите, чтобы получить доступ к персональным программам
              реабилитации, отслеживать прогресс и смотреть видеокурсы.
            </p>

            <div className='flex flex-col gap-3 relative z-10'>
              <Link
                href='/login'
                className='flex items-center justify-center w-full bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm text-sm'
              >
                Войти или зарегистрироваться
              </Link>

              <Link
                href='/dashboard'
                className='flex items-center justify-center w-full bg-blue-50 text-primary px-4 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors text-sm'
              >
                Личный кабинет
              </Link>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

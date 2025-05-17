'use client';

/**
 * Компонент Header - основная навигация сайта
 * Перенесен в shared из layout в рамках рефакторинга
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Отслеживание скролла для изменения стиля хедера
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Функция проверки активной ссылки
  const isActiveLink = (href: string) => {
    // Базовое сравнение пути с href
    if (href === '/' && pathname === '/') return true;
    
    // Для других страниц проверяем, начинается ли текущий путь с href
    if (href !== '/' && pathname?.startsWith(href)) return true;
    
    return false;
  };

  // Для предотвращения скролла при открытом меню
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Закрытие меню при изменении пути
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Логотип */}
          <Link href="/" className="flex items-center">
            <div className="relative overflow-hidden">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold select-none">МВ</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-primary font-bold text-xl">Миненков</div>
              <div className="text-accent text-sm">Вадим</div>
            </div>
          </Link>

          {/* Десктоп меню */}
          <nav className="hidden lg:flex items-center space-x-8">
            <NavLink href="/" active={isActiveLink('/')}>
              Главная
            </NavLink>
            <NavLink href="/about" active={isActiveLink('/about')}>
              Обо мне
            </NavLink>
            <NavLink href="/products" active={isActiveLink('/products')}>
              Услуги
            </NavLink>
            <NavLink href="/contacts" active={isActiveLink('/contacts')}>
              Контакты
            </NavLink>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/contacts"
                className="bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-md font-medium transition-colors duration-300"
              >
                Записаться
              </Link>
            </motion.div>
          </nav>

          {/* Мобильная кнопка меню */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-primary-dark hover:bg-gray-100 focus:outline-none transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
          >
            <span className="sr-only">Открыть меню</span>
            <svg
              className={`h-6 w-6 ${menuOpen ? 'hidden' : 'block'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              className={`h-6 w-6 ${menuOpen ? 'block' : 'hidden'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 top-[72px] bg-white z-40"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ 
              duration: 0.3,
              ease: [0, 0.71, 0.2, 1.01]
            }}
          >
            <div className="p-4 pt-8 h-full flex flex-col">
              <nav className="flex flex-col space-y-6 mb-8">
                <MobileNavLink
                  href="/"
                  active={isActiveLink('/')}
                  onClick={() => setMenuOpen(false)}
                >
                  Главная
                </MobileNavLink>
                <MobileNavLink
                  href="/about"
                  active={isActiveLink('/about')}
                  onClick={() => setMenuOpen(false)}
                >
                  Обо мне
                </MobileNavLink>
                <MobileNavLink
                  href="/products"
                  active={isActiveLink('/products')}
                  onClick={() => setMenuOpen(false)}
                >
                  Услуги
                </MobileNavLink>
                <MobileNavLink
                  href="/contacts"
                  active={isActiveLink('/contacts')}
                  onClick={() => setMenuOpen(false)}
                >
                  Контакты
                </MobileNavLink>
              </nav>
              
              <div className="mt-auto">
                <Link 
                  href="/contacts"
                  className="w-full bg-accent hover:bg-accent-dark text-white px-5 py-3 rounded-md font-medium transition-colors duration-300 flex items-center justify-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Записаться на консультацию
                </Link>
                
                <div className="mt-8 text-gray-600 text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <a href="https://t.me/minenkovrehab" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.218-.495.218l.18-2.51 4.563-4.125c.198-.176-.043-.265-.31-.09l-5.645 3.56-2.426-.755c-.577-.14-.615-.577.12-.858l9.455-3.645c.485-.175.915.25.725.835z"></path>
                      </svg>
                    </a>
                    <a href="https://www.youtube.com/@minenkovrehab" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                      </svg>
                    </a>
                    <a href="https://instagram.com/minenkovrehab" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  </div>
                  <p className="text-sm">+7 928 328-70-52</p>
                  <p className="text-sm mt-1">Пн-Сб: 10:00-19:00</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Компонент ссылки навигации для десктопа
interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`relative text-base font-medium transition-colors duration-300 ${
        active ? 'text-primary' : 'text-gray-600 hover:text-primary'
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute inset-x-0 bottom-[-5px] h-0.5 bg-accent"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}

// Компонент ссылки навигации для мобильного меню
interface MobileNavLinkProps {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function MobileNavLink({ href, active, onClick, children }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`text-xl font-medium transition-colors duration-300 ${
        active ? 'text-accent' : 'text-gray-700 hover:text-accent'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
} 
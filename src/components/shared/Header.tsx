'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import BookingModal from './BookingModal';
import { socialLinks, headerContacts, navigationItems } from '@/data/content';
import { SafeIcon } from '@/components/ui/SafeIcon';
import { User as UserIcon, LogOut, Settings, ArrowLeft } from 'lucide-react';
import { Transition } from '@headlessui/react';
import AuthPopover from './AuthPopover';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Данные для выпадающего меню услуг
const servicesDropdownItems = [
  {
    href: '/products/consultation',
    label: 'Онлайн-консультация',
    description: 'Индивидуальный разбор вашей ситуации',
  },
  {
    href: '/products/express-consultation',
    label: 'Экспресс онлайн-консультация',
    description: 'Быстрая консультация для разбора конкретного вопроса',
  },
  {
    href: '/products/formula-movement',
    label: 'Программа "Формула Движения"',
    description: 'Авторская программа тренировок для всего тела',
  },
  {
    href: '/products/personal-program',
    label: 'Восстановительная программа',
    description: 'Пошаговый алгоритм после операций',
  },
  {
    href: '/products/online-training',
    label: 'Онлайн-тренировки',
    description: 'Персональные тренировки в режиме реального времени',
  },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMobileAuthOpen, setIsMobileAuthOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isAuthPage = ['/login', '/register', '/auth', '/signin'].some(route =>
    pathname?.startsWith(route)
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
      if (_event === 'SIGNED_OUT') {
        setUser(null);
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    router.refresh();
  };

  // Отслеживание скролла для изменения внешнего вида хедера
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Добавляем обработчик события скролла
    window.addEventListener('scroll', handleScroll);

    // Очистка обработчика при размонтировании компонента
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Закрытие меню при клике на ссылку
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsMobileServicesOpen(false);
  };

  // Открытие модального окна записи
  const openBookingModal = () => {
    setIsBookingModalOpen(true);
    setIsMenuOpen(false); // Закрываем мобильное меню
  };

  // Обработчик для клавиатурной навигации
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Закрытие меню с помощью клавиши Escape
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMenuOpen) {
          setIsMenuOpen(false);
          setIsMobileServicesOpen(false);
        }
        if (isMobileAuthOpen) {
          setIsMobileAuthOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMenuOpen, isMobileAuthOpen]);

  // Хелперы для переключения меню и авторизации
  const toggleMobileMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      setIsMobileAuthOpen(false);
    }
  };

  const toggleMobileAuth = () => {
    if (isMobileAuthOpen) {
      setIsMobileAuthOpen(false);
    } else {
      setIsMobileAuthOpen(true);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Предотвращение скролла при открытом мобильном меню */}
      {(isMenuOpen || isMobileAuthOpen) && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}

      {/* Backdrop */}
      <Transition
        show={isMenuOpen || isMobileAuthOpen}
        enter='transition-opacity duration-300'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='transition-opacity duration-300'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div
          className='fixed inset-0 bg-black/50 z-40 backdrop-blur-sm'
          onClick={() => {
            setIsMenuOpen(false);
            setIsMobileAuthOpen(false);
          }}
          aria-hidden='true'
        />
      </Transition>

      {/* Верхняя инфо-панель */}
      <div
        className={`hidden lg:block bg-primary text-white py-2 transition-all duration-500 ease-in-out ${isScrolled ? 'transform -translate-y-full opacity-0 h-0 overflow-hidden' : 'transform translate-y-0 opacity-100'}`}
        role='complementary'
        aria-label='Контактная информация'
      >
        <div className='container mx-auto px-4 lg:px-8'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              <p className='text-sm font-medium' style={{ color: '#ffffff' }}>
                Следите за мной:
              </p>
              <div className='flex space-x-3'>
                {socialLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-white hover:text-accent transition-all duration-300 transform hover:scale-110'
                    aria-label={link.label}
                    onKeyDown={e =>
                      handleKeyDown(e, () => window.open(link.url, '_blank'))
                    }
                  >
                    <SafeIcon name={link.name} className='w-5 h-5' />
                  </a>
                ))}
              </div>
            </div>

            <div className='flex items-center space-x-6'>
              <div className='flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                  focusable='false'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  />
                </svg>
                <a
                  href={`tel:${headerContacts.phone.replace(/[^+\d]/g, '')}`}
                  className='text-white hover:text-accent-light transition-colors'
                  aria-label={`Позвонить по телефону ${headerContacts.phone}`}
                  onKeyDown={e =>
                    handleKeyDown(
                      e,
                      () =>
                        (window.location.href = `tel:${headerContacts.phone.replace(/[^+\d]/g, '')}`)
                    )
                  }
                >
                  <span className='hidden md:inline'>
                    {headerContacts.phone}
                  </span>
                </a>
              </div>
              <div className='flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                  focusable='false'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span className='text-sm font-medium'>
                  {headerContacts.workingHours}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основная навигация - липкая часть */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 bg-white transition-all duration-500 ease-in-out ${isScrolled ? 'shadow-lg py-3' : 'shadow-sm py-4'}`}
        role='banner'
      >
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center'>
            {/* Логотип и название */}
            <Link
              href='/'
              className='flex items-center space-x-2'
              aria-label='Миненков Вадим - На главную'
            >
              <Image
                src='/images/logo.png'
                alt='Логотип Миненков Вадим'
                width={40}
                height={40}
                className='w-8 h-8 md:w-10 md:h-10'
              />
              <span className='text-xl md:text-2xl font-bold text-primary transition-transform duration-300'>
                Миненков<span className='text-accent'> Вадим</span>
              </span>
            </Link>

            {/* Десктопное меню */}
            <nav
              className='hidden [&>*]:text-nowrap [@media(min-width:840px)]:flex space-x-1 lg:space-x-2'
              aria-label='Основная навигация'
            >
              {navigationItems.map(item => {
                // Специальная обработка для пункта "Услуги"
                if (item.href === '/products') {
                  return (
                    <div
                      key={item.href}
                      className='relative'
                      onMouseEnter={() => setIsServicesDropdownOpen(true)}
                      onMouseLeave={() => setIsServicesDropdownOpen(false)}
                    >
                      <Link
                        href={item.href}
                        className={`px-2 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3 whitespace-nowrap flex items-center ${pathname === item.href || (pathname && pathname.startsWith('/products/')) ? 'text-primary font-semibold after:w-2/3' : 'text-gray-800'}`}
                        aria-current={
                          pathname === item.href ? 'page' : undefined
                        }
                      >
                        {item.label}
                        <svg
                          className={`ml-1 h-4 w-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </Link>

                      {/* Выпадающее меню услуг */}
                      <div
                        className={`absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 transition-all duration-300 z-50 ${isServicesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                      >
                        <div className='py-2'>
                          {servicesDropdownItems.map((service, _) => (
                            <Link
                              key={service.href}
                              href={service.href}
                              className='block px-4 py-3 hover:bg-gray-50 transition-colors duration-200 group'
                              aria-label={`${service.label}: ${service.description}`}
                            >
                              <div className='font-medium text-gray-900 group-hover:text-primary transition-colors duration-200'>
                                {service.label}
                              </div>
                              <div
                                className='text-sm text-gray-500 mt-1'
                                style={{
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                }}
                                title={service.description}
                              >
                                {service.description}
                              </div>
                            </Link>
                          ))}
                          <div className='border-t border-gray-100 mt-2 pt-2'>
                            <Link
                              href='/products'
                              className='block px-4 py-2 text-sm font-medium text-primary hover:bg-gray-50 transition-colors duration-200'
                              aria-label='Посмотреть все услуги и программы'
                            >
                              Все услуги →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Обычные пункты меню
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3 whitespace-nowrap ${pathname === item.href ? 'text-primary font-semibold after:w-2/3' : 'text-gray-800'}`}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    aria-label={
                      item.label === 'Главная'
                        ? 'Перейти на главную страницу'
                        : item.label === 'Обо мне'
                          ? 'Узнать больше о специалисте'
                          : item.label === 'Услуги'
                            ? 'Посмотреть услуги и программы'
                            : item.label === 'Контакты'
                              ? 'Связаться со специалистом'
                              : `Перейти в раздел ${item.label}`
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Кнопки действий (Desktop) */}
            <div className='flex items-center space-x-2 lg:space-x-3'>
              {!isAuthLoading && (
                <>
                  {user ? (
                    <div
                      className='relative hidden [@media(min-width:840px)]:block'
                      onMouseEnter={() => setIsProfileDropdownOpen(true)}
                      onMouseLeave={() => setIsProfileDropdownOpen(false)}
                    >
                      <button
                        className='flex items-center space-x-2 text-primary hover:text-primary-dark font-medium transition-colors focus:outline-none py-2'
                        aria-label='Меню профиля'
                        aria-expanded={isProfileDropdownOpen}
                      >
                        <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-colors'>
                          <UserIcon className='w-5 h-5 text-primary' />
                        </div>
                        <span className='hidden xl:inline text-sm font-medium'>
                          {user.email?.split('@')[0]}
                        </span>
                      </button>

                      {/* Dropdown */}
                      <div
                        className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 transition-all duration-300 z-50 overflow-hidden ${
                          isProfileDropdownOpen
                            ? 'opacity-100 visible translate-y-0'
                            : 'opacity-0 invisible -translate-y-2'
                        }`}
                      >
                        <div className='py-1'>
                          <div className='px-4 py-3 border-b border-gray-100 bg-gray-50/50'>
                            <p className='text-xs text-gray-500 mb-0.5'>
                              Вы вошли как
                            </p>
                            <p
                              className='text-sm font-medium text-gray-900 truncate'
                              title={user.email}
                            >
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href='/dashboard'
                            className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors'
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Settings className='w-4 h-4 mr-2.5' />
                            Личный кабинет
                          </Link>
                          <button
                            onClick={handleLogout}
                            className='flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left'
                          >
                            <LogOut className='w-4 h-4 mr-2.5' />
                            Выйти
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    !isAuthPage &&
                    !pathname?.startsWith('/dashboard') && (
                      <div className='hidden [@media(min-width:840px)]:block'>
                        <AuthPopover />
                      </div>
                    )
                  )}
                </>
              )}

              {/* Кнопка записи */}
              <button
                onClick={openBookingModal}
                className='hidden [@media(min-width:840px)]:block bg-accent hover:bg-accent-dark text-white font-semibold text-sm lg:text-base px-3 lg:px-5 py-3 rounded-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                aria-label='Записаться на консультацию'
                aria-haspopup='dialog'
              >
                Записаться
              </button>
            </div>

            {/* Мобильное меню (бургер) */}
            <div className='flex items-center gap-1 [@media(min-width:840px)]:hidden'>
              {!isAuthLoading &&
                !user &&
                !isAuthPage &&
                !pathname?.startsWith('/dashboard') && (
                  <div className='mr-1'>
                    <AuthPopover
                      isMobile={true}
                      isOpen={isMobileAuthOpen}
                      onToggle={toggleMobileAuth}
                      onClose={() => setIsMobileAuthOpen(false)}
                    />
                  </div>
                )}

              {user && !isAuthPage && (
                <Link
                  href='/dashboard'
                  className='mr-2 p-2 text-primary hover:text-primary-dark transition-colors'
                  aria-label='Личный кабинет'
                >
                  <UserIcon className='w-6 h-6' />
                </Link>
              )}

              {isAuthPage ? (
                <button
                  type='button'
                  className='text-gray-800 hover:text-primary focus:outline-none transition-all duration-300 p-2 rounded-md'
                  onClick={handleBack}
                  aria-label='Вернуться назад'
                >
                  <ArrowLeft className='h-6 w-6' />
                </button>
              ) : (
                <button
                  type='button'
                  className='text-gray-800 hover:text-primary focus:outline-none transition-all duration-300 p-2 rounded-md'
                  onClick={toggleMobileMenu}
                  aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                  aria-expanded={isMenuOpen}
                  aria-controls='mobile-menu'
                >
                  <svg
                    className='h-6 w-6 transition-transform duration-300 ease-in-out'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    style={{
                      transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0)',
                    }}
                    aria-hidden='true'
                    focusable='false'
                  >
                    {isMenuOpen ? (
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    ) : (
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 6h16M4 12h16M4 18h16'
                      />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Мобильное меню (выпадающее) */}
          <div
            id='mobile-menu'
            className={`[@media(min-width:840px)]:hidden transition-all duration-500 ease-in-out overflow-hidden ${
              isMenuOpen
                ? 'max-h-[500px] opacity-100 mt-4 pb-4 border-t pt-4'
                : 'max-h-0 opacity-0 mt-0 pb-0 border-t border-transparent'
            }`}
            aria-hidden={!isMenuOpen}
            role='navigation'
            aria-label='Мобильная навигация'
          >
            <div className='flex flex-col space-y-4'>
              {navigationItems.map(item => {
                if (item.label === 'Услуги') {
                  return (
                    <div key={item.href} className='flex flex-col'>
                      <div className='flex items-center justify-between'>
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none flex-1 ${pathname === item.href ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                          aria-current={
                            pathname === item.href ? 'page' : undefined
                          }
                          aria-label='Посмотреть услуги и программы'
                        >
                          {item.label}
                        </Link>
                        <button
                          onClick={() =>
                            setIsMobileServicesOpen(!isMobileServicesOpen)
                          }
                          className='ml-2 p-1 hover:text-primary transition-all duration-300 focus:outline-none'
                          aria-expanded={isMobileServicesOpen}
                          aria-haspopup='true'
                          aria-label='Развернуть меню услуг'
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`}
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 9l-7 7-7-7'
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Подменю услуг для мобильной версии */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}
                      >
                        <div className='pl-4 space-y-2'>
                          {servicesDropdownItems.map(service => (
                            <Link
                              key={service.href}
                              href={service.href}
                              onClick={closeMenu}
                              className='block py-2 text-sm text-gray-600 hover:text-primary transition-colors duration-200 border-l-2 border-transparent hover:border-primary pl-2'
                              aria-label={`${service.label}: ${service.description}`}
                            >
                              <div className='font-medium'>{service.label}</div>
                              <div
                                className='text-xs text-gray-500 mt-1'
                                style={{
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                }}
                                title={service.description}
                              >
                                {service.description}
                              </div>
                            </Link>
                          ))}
                          <Link
                            href='/products'
                            onClick={closeMenu}
                            className='block py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200 border-l-2 border-transparent hover:border-primary pl-2'
                            aria-label='Посмотреть все услуги и программы'
                          >
                            Все услуги →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none md:focus:ring-2 md:focus:ring-primary md:focus:ring-offset-2 md:focus:rounded-sm ${pathname === item.href ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    aria-label={
                      item.label === 'Главная'
                        ? 'Перейти на главную страницу'
                        : item.label === 'Обо мне'
                          ? 'Узнать больше о специалисте'
                          : item.label === 'Услуги'
                            ? 'Посмотреть услуги и программы'
                            : item.label === 'Контакты'
                              ? 'Связаться со специалистом'
                              : `Перейти в раздел ${item.label}`
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Дополнительные ссылки на услуги для лучшей видимости */}
              <Link
                href='/'
                className='text-white hover:text-accent transition-colors'
                aria-label='Перейти на главную страницу'
              >
                Главная
              </Link>
              <Link
                href='/about'
                className='text-white hover:text-accent transition-colors'
                aria-label='Узнать больше о специалисте'
              >
                Обо мне
              </Link>
              <Link
                href='/products'
                className='text-white hover:text-accent transition-colors'
                aria-label='Посмотреть услуги и программы'
              >
                Услуги
              </Link>
              <Link
                href='/contacts'
                className='text-white hover:text-accent transition-colors'
                aria-label='Связаться со специалистом'
              >
                Контакты
              </Link>
              <Link
                href='/products/personal-program'
                onClick={closeMenu}
                className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none md:focus:ring-2 md:focus:ring-primary md:focus:ring-offset-2 md:focus:rounded-sm ${pathname === '/products/personal-program' ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                aria-current={
                  pathname === '/products/personal-program' ? 'page' : undefined
                }
              >
                Восстановительная программа
              </Link>

              <Link
                href='/products/online-training'
                onClick={closeMenu}
                className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none md:focus:ring-2 md:focus:ring-primary md:focus:ring-offset-2 md:focus:rounded-sm ${pathname === '/products/online-training' ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                aria-current={
                  pathname === '/products/online-training' ? 'page' : undefined
                }
              >
                Онлайн тренировки
              </Link>
              {user ? (
                <>
                  <div className='flex items-center px-2 py-2 border-t border-gray-100 mt-2'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mr-3 shrink-0'>
                      <UserIcon className='w-6 h-6 text-primary' />
                    </div>
                    <div className='overflow-hidden'>
                      <p className='text-xs text-gray-500'>Вы вошли как</p>
                      <p
                        className='text-sm font-medium text-gray-900 truncate'
                        title={user.email}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href='/dashboard'
                    onClick={closeMenu}
                    className='flex items-center justify-center text-primary font-medium py-3 border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  >
                    <Settings className='w-5 h-5 mr-2' />
                    <span>Личный кабинет</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className='flex items-center justify-center text-red-600 font-medium py-3 border-2 border-red-200 rounded-md hover:bg-red-50 transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2'
                  >
                    <LogOut className='w-5 h-5 mr-2' />
                    <span>Выйти</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openBookingModal}
                    className='bg-accent text-white px-4 py-3 rounded-md font-semibold hover:bg-accent-dark transition-all duration-300 transform active:scale-95 text-center shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 mt-4'
                    aria-label='Записаться на консультацию'
                    aria-haspopup='dialog'
                  >
                    Записаться
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Модальное окно для записи */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
}

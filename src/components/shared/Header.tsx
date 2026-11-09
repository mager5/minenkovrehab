'use client';

import { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import BookingModal from './BookingModal';
import { socialLinks, headerContacts, navigationItems } from '@/data/content';
import { SafeIcon } from '@/components/ui/SafeIcon';
import {
  User as UserIcon,
  ArrowLeft,
  X,
  ChevronDown,
  Mail,
  Phone,
} from 'lucide-react';
import { Icon } from '@/components/ds/Icon';
import { formatPhone } from '@/components/ds/Layout';
import { Transition } from '@headlessui/react';
import AuthPopover from './AuthPopover';
import { getRailwayApiBaseUrl } from '@/lib/api-base';
import { authPost } from '@/lib/auth-client';
// import { createClient } from '@/lib/supabase/client';
// import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

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
    label: 'Программа «Формула Движения»',
    description: 'Авторская программа тренировок для всего тела',
  },
  {
    href: '/products/rehab-programs',
    label: 'Восстановительные программы',
    description: 'Пошаговые программы после травм и операций',
  },
  {
    href: '/products/meniscus-resection',
    label: 'Восстановление после резекции мениска',
    description: 'Пошаговая программа с видео упражнений',
  },
  {
    href: '/products/online-training',
    label: 'Онлайн-тренировки',
    description: 'Персональные тренировки в режиме реального времени',
  },
];

type AuthUser = {
  id: string;
  email: string | null;
  full_name: string | null;
};

// Старый локальный helper (заменён на @/lib/api-base):
// function getRailwayApiBaseUrl() {
//   if (typeof window !== 'undefined') {
//     const hostname = window.location.hostname;
//     if (hostname === 'localhost' || hostname === '127.0.0.1') {
//       return '';
//     }
//   }
//   return (
//     process.env.NEXT_PUBLIC_RAILWAY_API_URL ||
//     'https://minenkovrehab-production-15cc.up.railway.app'
//   );
// }

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMobileAuthOpen, setIsMobileAuthOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  // const supabase = createClient();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const lastAuthFetchAtRef = useRef<number>(0);
  const authFetchInFlightRef = useRef(false);

  const refreshUser = useCallback(async (silent?: boolean) => {
    const now = Date.now();
    const THROTTLE_MS = 2000;
    if (authFetchInFlightRef.current) return;
    if (now - lastAuthFetchAtRef.current < THROTTLE_MS) return;
    lastAuthFetchAtRef.current = now;

    if (!silent) {
      setIsAuthLoading(true);
    }

    try {
      authFetchInFlightRef.current = true;
      const response = await fetch(
        `${getRailwayApiBaseUrl()}/api/auth/session`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (response.status === 429) {
        return;
      }
      if (response.status === 401) {
        setUser(null);
        return;
      }

      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success && payload?.data?.user?.id) {
        setUser(payload.data.user);
      } else {
        setUser(null);
      }
    } catch {
      // Запрос прерван (переход на другую страницу) или сеть недоступна — считаем, что гость, без ошибки в консоли.
      setUser(null);
    } finally {
      authFetchInFlightRef.current = false;
      if (!silent) {
        setIsAuthLoading(false);
      }
    }
  }, []);

  // Блокировка touchmove для iOS и управление фокусом
  // useEffect(() => {
  //   if (isMenuOpen) {
  //     const timer = setTimeout(() => {
  //       closeButtonRef.current?.focus();
  //     }, 50);
  //
  //     const preventDefault = (e: TouchEvent) => {
  //       const target = e.target as HTMLElement;
  //       const scrollable = target.closest('.overflow-y-auto');
  //
  //       if (!scrollable) {
  //         e.preventDefault();
  //       }
  //     };
  //
  //     document.addEventListener('touchmove', preventDefault, {
  //       passive: false,
  //     });
  //
  //     return () => {
  //       document.removeEventListener('touchmove', preventDefault);
  //       clearTimeout(timer);
  //     };
  //   }
  // }, [isMenuOpen]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const preventDefault = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const scrollable = target.closest('.overflow-y-auto');

      if (!scrollable) {
        e.preventDefault();
      }
    };

    if (isMenuOpen) {
      timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      document.addEventListener('touchmove', preventDefault, {
        passive: false,
      });
    }

    return () => {
      if (isMenuOpen) {
        document.removeEventListener('touchmove', preventDefault);
        if (timer) {
          clearTimeout(timer);
        }
      }
    };
  }, [isMenuOpen]);

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
    refreshUser();

    // const {
    //   data: { subscription },
    // } = supabase.auth.onAuthStateChange(
    //   (_event: AuthChangeEvent, session: Session | null) => {
    //     setUser(session?.user ?? null);
    //     setIsAuthLoading(false);
    //     if (_event === 'SIGNED_OUT') {
    //       setUser(null);
    //       router.refresh();
    //     }
    //   }
    // );
    //
    // return () => {
    //   subscription.unsubscribe();
    // };
  }, [refreshUser]);

  useEffect(() => {
    refreshUser(true);
  }, [pathname, refreshUser]);

  useEffect(() => {
    const handleAuthChanged = () => {
      refreshUser(true);
    };

    window.addEventListener('mr-auth-changed', handleAuthChanged);
    return () => {
      window.removeEventListener('mr-auth-changed', handleAuthChanged);
    };
  }, [refreshUser]);

  const handleLogout = async () => {
    // await supabase.auth.signOut();
    const response = await authPost('/api/auth/logout');
    if (!response.ok) return;
    setUser(null);
    setIsProfileDropdownOpen(false);
    setIsMobileProfileOpen(false);
    setIsMenuOpen(false);
    // if (typeof window !== 'undefined') {
    //   window.dispatchEvent(new Event('mr-auth-changed'));
    // }
    router.push('/login');
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

  // Меню «Личный кабинет» (десктоп): закрытие по клику вне и по Esc
  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isProfileDropdownOpen]);

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
        if (isMobileProfileOpen) {
          setIsMobileProfileOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMenuOpen, isMobileAuthOpen, isMobileProfileOpen]);

  // Хелперы для переключения меню и авторизации
  const toggleMobileMenu = () => {
    // Снимаем фокус с активного элемента при клике
    if (
      typeof document !== 'undefined' &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }

    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      setIsMobileAuthOpen(false);
      setIsMobileProfileOpen(false);
    }
  };

  const toggleMobileAuth = () => {
    if (isMobileAuthOpen) {
      setIsMobileAuthOpen(false);
    } else {
      setIsMobileAuthOpen(true);
      setIsMenuOpen(false);
      setIsMobileProfileOpen(false);
    }
  };

  const toggleMobileProfile = () => {
    // Снимаем фокус с активного элемента при клике
    if (
      typeof document !== 'undefined' &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }

    if (isMobileProfileOpen) {
      setIsMobileProfileOpen(false);
    } else {
      setIsMobileProfileOpen(true);
      setIsMenuOpen(false);
      setIsMobileAuthOpen(false);
    }
  };

  const phoneHref = `tel:${headerContacts.phone.replace(/[^+\d]/g, '')}`;
  const phoneLabel = formatPhone(headerContacts.phone);
  const hoursLabel = headerContacts.workingHours.replace(/-/g, '–');
  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || !!pathname?.startsWith(`${href}/`);
  const navLinkClass = (active: boolean) =>
    `inline-flex items-center gap-1 min-h-[44px] px-4 rounded-full no-underline whitespace-nowrap transition-colors ${
      active
        ? 'bg-sky text-navy'
        : 'text-ink hover:bg-[#F3F7FA] hover:text-navy'
    }`;
  const showGuestAuth =
    !isAuthLoading &&
    !user &&
    !isAuthPage &&
    !pathname?.startsWith('/dashboard');

  return (
    <>
      {/* Предотвращение скролла при открытом мобильном меню */}
      {(isMenuOpen || isMobileAuthOpen || isMobileProfileOpen) && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}

      {/* Backdrop */}
      <Transition
        show={isMenuOpen || isMobileAuthOpen || isMobileProfileOpen}
        as={Fragment}
        enter='transition-opacity duration-300 ease-in-out'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='transition-opacity duration-300 ease-in-out'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div
          className='fixed inset-0 bg-[rgba(13,60,99,0.45)] z-40 backdrop-blur-sm will-change-[opacity]'
          onClick={() => {
            setIsMenuOpen(false);
            setIsMobileAuthOpen(false);
            setIsMobileProfileOpen(false);
          }}
          aria-hidden='true'
        />
      </Transition>

      {/* Верхняя строка: часы, телефон, вход (только десктоп) */}
      <div
        className='hidden min-[1100px]:block ds-wrap pt-3'
        role='complementary'
        aria-label='Контактная информация'
      >
        <div className='flex justify-end items-center gap-6 flex-wrap px-3 text-[16px]'>
          <span className='text-muted'>{hoursLabel}</span>
          <a
            href={phoneHref}
            className='font-bold text-navy no-underline text-[17px] hover:text-brand min-h-[44px] inline-flex items-center'
            aria-label={`Позвонить по телефону ${phoneLabel}`}
          >
            {phoneLabel}
          </a>
          <div className='min-w-[72px] flex justify-end'>
            {isAuthLoading ? (
              <span className='invisible'>Войти</span>
            ) : user ? (
              <div className='relative' ref={profileRef}>
                <button
                  type='button'
                  className='inline-flex items-center gap-2 min-h-[44px] font-bold text-brand hover:text-navy bg-transparent border-0 cursor-pointer ds-focus rounded-full px-2 font-[inherit] text-[16px]'
                  aria-haspopup='menu'
                  aria-expanded={isProfileDropdownOpen}
                  aria-controls='profile-menu'
                  onClick={() => setIsProfileDropdownOpen(v => !v)}
                >
                  <span className='w-8 h-8 rounded-full bg-sky flex items-center justify-center'>
                    <UserIcon className='w-[18px] h-[18px] text-brand' />
                  </span>
                  Личный кабинет
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    aria-hidden='true'
                  />
                </button>
                <div
                  id='profile-menu'
                  className={`absolute top-full right-0 mt-1 w-72 bg-white rounded-[20px] shadow-pop z-[60] overflow-hidden transition-all duration-200 ${
                    isProfileDropdownOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                  <ProfileMenuItems
                    email={user.email}
                    onNavigate={() => setIsProfileDropdownOpen(false)}
                    onLogout={handleLogout}
                  />
                </div>
              </div>
            ) : !isAuthPage && !pathname?.startsWith('/dashboard') ? (
              <AuthPopover />
            ) : null}
          </div>
        </div>
      </div>

      {/* Основная навигация — «таблетка», липкая */}
      <header
        className='sticky top-0 z-50 pt-3 min-[1100px]:pt-3'
        role='banner'
      >
        <div className='ds-wrap'>
          <div
            className={`mr-hdr-pill flex items-center justify-between gap-4 bg-white rounded-full py-2 pr-2 pl-[18px] min-[1100px]:py-3 min-[1100px]:pr-3 min-[1100px]:pl-7 transition-shadow duration-300 ${
              isScrolled
                ? 'shadow-[0_12px_32px_rgba(13,60,99,0.14)]'
                : 'shadow-[0_8px_24px_rgba(13,60,99,0.06)]'
            }`}
          >
            {/* Логотип */}
            <Link
              href='/'
              className='mr-hdr-logo flex items-center gap-2.5 no-underline font-extrabold text-[16px] min-[1100px]:text-[19px] text-navy hover:text-navy min-h-[44px] shrink-0'
              aria-label='Миненков Вадим - На главную'
            >
              <Image
                src='/images/logo-80.png'
                alt=''
                width={40}
                height={40}
                className='w-7 h-7 min-[1100px]:w-9 min-[1100px]:h-9'
                priority
              />
              <span>Миненков Вадим</span>
            </Link>

            {/* Десктопное меню */}
            <nav
              className='hidden min-[1100px]:flex flex-1 justify-center gap-1.5 text-[17px] font-semibold'
              aria-label='Основная навигация'
            >
              {navigationItems.map(item => {
                if (item.href === '/products') {
                  return (
                    <div
                      key={item.href}
                      className='relative'
                      onMouseEnter={() => setIsServicesDropdownOpen(true)}
                      onMouseLeave={() => setIsServicesDropdownOpen(false)}
                      onFocus={() => setIsServicesDropdownOpen(true)}
                      onBlur={e => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node))
                          setIsServicesDropdownOpen(false);
                      }}
                    >
                      <Link
                        href={item.href}
                        className={navLinkClass(isActive(item.href))}
                        aria-current={
                          pathname === item.href ? 'page' : undefined
                        }
                        aria-haspopup='true'
                        aria-expanded={isServicesDropdownOpen}
                      >
                        {item.label}
                        <Icon
                          name='chev-down'
                          size={18}
                          strokeWidth={2.4}
                          className={`transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </Link>

                      {/* Выпадающее меню услуг */}
                      <div
                        className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[340px] z-50 transition-all duration-200 ${
                          isServicesDropdownOpen
                            ? 'opacity-100 visible'
                            : 'opacity-0 invisible'
                        }`}
                      >
                        <div className='bg-white rounded-[24px] shadow-pop p-2'>
                          {servicesDropdownItems.map(service => (
                            <Link
                              key={service.href}
                              href={service.href}
                              className='block px-4 py-3 rounded-2xl no-underline hover:bg-sky group'
                              aria-label={`${service.label}: ${service.description}`}
                            >
                              <span className='block font-bold text-[16px] text-navy'>
                                {service.label}
                              </span>
                              <span
                                className='block text-[15px] font-medium text-muted mt-0.5 truncate'
                                title={service.description}
                              >
                                {service.description}
                              </span>
                            </Link>
                          ))}
                          <Link
                            href='/products'
                            className='flex items-center gap-1.5 min-h-[44px] px-4 mt-1 rounded-2xl text-[16px] font-bold text-brand no-underline hover:bg-sky'
                            aria-label='Посмотреть все услуги и программы'
                          >
                            Все услуги
                            <Icon
                              name='chev-right'
                              size={16}
                              strokeWidth={2.4}
                            />
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
                    className={navLinkClass(isActive(item.href))}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Кнопка записи (десктоп) */}
            <button
              type='button'
              onClick={openBookingModal}
              className='hidden min-[1100px]:inline-flex ds-btn ds-btn-primary min-h-[52px] px-[26px] text-[17px] shrink-0'
              style={{ boxShadow: 'none' }}
              aria-label='Записаться на консультацию'
              aria-haspopup='dialog'
            >
              Записаться
            </button>

            {/* Мобильные действия */}
            <div className='mr-hdr-actions flex items-center gap-2 min-[1100px]:hidden'>
              {showGuestAuth && (
                <AuthPopover
                  isMobile={true}
                  isOpen={isMobileAuthOpen}
                  onToggle={toggleMobileAuth}
                  onClose={() => setIsMobileAuthOpen(false)}
                />
              )}

              {user && !isAuthPage && (
                <div className='relative'>
                  <button
                    type='button'
                    className='w-12 h-12 rounded-full bg-sky flex items-center justify-center border-0 cursor-pointer ds-focus'
                    aria-label='Личный кабинет: открыть меню'
                    aria-expanded={isMobileProfileOpen}
                    aria-controls='mobile-profile-menu'
                    onClick={toggleMobileProfile}
                  >
                    <UserIcon className='w-5 h-5 text-navy' />
                  </button>

                  {/* Мобильное выпадающее меню профиля */}
                  <div
                    id='mobile-profile-menu'
                    className={`fixed left-4 right-4 mt-2 bg-white rounded-[24px] shadow-pop overflow-hidden z-50 transition-all duration-300 origin-top-right ${
                      isMobileProfileOpen
                        ? 'opacity-100 visible translate-y-0 scale-100'
                        : 'opacity-0 invisible -translate-y-4 scale-95'
                    }`}
                    style={{ top: '80px', willChange: 'transform, opacity' }}
                  >
                    <ProfileMenuItems
                      email={user.email}
                      large
                      onNavigate={() => setIsMobileProfileOpen(false)}
                      onLogout={handleLogout}
                    />
                  </div>
                </div>
              )}

              {isAuthPage ? (
                <button
                  type='button'
                  className='w-12 h-12 rounded-full bg-sky flex items-center justify-center border-0 cursor-pointer ds-focus'
                  onClick={handleBack}
                  aria-label='Вернуться назад'
                >
                  <ArrowLeft className='h-5 w-5 text-navy' />
                </button>
              ) : (
                <>
                  <a
                    href={phoneHref}
                    aria-label={`Позвонить по телефону ${phoneLabel}`}
                    className='w-12 h-12 rounded-full bg-sky flex items-center justify-center ds-focus'
                  >
                    <Icon
                      name='phone'
                      size={20}
                      strokeWidth={2}
                      color='var(--c-navy)'
                    />
                  </a>
                  <button
                    type='button'
                    className='w-12 h-12 rounded-full bg-brand flex items-center justify-center border-0 cursor-pointer ds-focus'
                    onClick={toggleMobileMenu}
                    aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                    aria-expanded={isMenuOpen}
                    aria-controls='mobile-menu'
                  >
                    <Icon
                      name={isMenuOpen ? 'close' : 'menu'}
                      size={22}
                      strokeWidth={2.2}
                      color='#fff'
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню (Drawer) */}
      <Transition show={isMenuOpen} as={Fragment}>
        <div
          id='mobile-menu'
          className='fixed inset-0 z-50 min-[1100px]:hidden'
          aria-modal='true'
          role='dialog'
          aria-label='Меню'
        >
          <Transition.Child
            as={Fragment}
            enter='transition-opacity duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity duration-300'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div
              className='fixed inset-0 bg-[rgba(13,60,99,0.45)] backdrop-blur-sm'
              onClick={closeMenu}
              aria-hidden='true'
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter='transition transform duration-300 ease-in-out'
            enterFrom='translate-x-full'
            enterTo='translate-x-0'
            leave='transition transform duration-300 ease-in-out'
            leaveFrom='translate-x-0'
            leaveTo='translate-x-full'
          >
            <div className='ds relative ml-auto flex flex-col w-full max-w-[440px] h-full bg-canvas overflow-hidden'>
              {/* Шапка меню */}
              <div className='flex items-center justify-between px-4 pt-3.5 pb-3'>
                <div className='flex flex-1 items-center justify-between bg-white rounded-full py-2 pr-2 pl-[18px] shadow-[0_8px_24px_rgba(13,60,99,0.06)]'>
                  <Link
                    href='/'
                    className='flex items-center gap-2 no-underline font-extrabold text-[16px] text-navy min-h-[44px]'
                    onClick={closeMenu}
                  >
                    <Image
                      src='/images/logo-80.png'
                      alt=''
                      width={28}
                      height={28}
                      className='w-7 h-7'
                    />
                    Миненков Вадим
                  </Link>
                  <button
                    ref={closeButtonRef}
                    type='button'
                    onClick={closeMenu}
                    className='w-12 h-12 rounded-full bg-sky flex items-center justify-center border-0 cursor-pointer ds-focus'
                    aria-label='Закрыть меню'
                  >
                    <X className='w-6 h-6 text-navy' />
                  </button>
                </div>
              </div>

              {/* Содержимое */}
              <div className='flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2 flex flex-col gap-4'>
                {user && (
                  <div className='ds-card p-2'>
                    <p className='m-0 px-3 pt-2 text-[15px] font-extrabold text-navy'>
                      Личный кабинет
                    </p>
                    <ProfileMenuItems
                      email={user.email}
                      large
                      onNavigate={closeMenu}
                      onLogout={handleLogout}
                    />
                  </div>
                )}

                <nav
                  className='ds-card p-2 flex flex-col'
                  aria-label='Мобильная навигация'
                >
                  {navigationItems.map(item => {
                    if (item.label === 'Услуги') {
                      return (
                        <div key={item.label}>
                          <button
                            type='button'
                            onClick={() =>
                              setIsMobileServicesOpen(!isMobileServicesOpen)
                            }
                            className={`flex items-center justify-between w-full min-h-[52px] px-4 rounded-2xl text-[19px] font-bold border-0 cursor-pointer font-[inherit] text-left ${
                              isActive('/products')
                                ? 'bg-sky text-navy'
                                : 'bg-transparent text-ink'
                            }`}
                            aria-expanded={isMobileServicesOpen}
                          >
                            <span>{item.label}</span>
                            <ChevronDown
                              className={`w-5 h-5 transition-transform duration-300 text-brand ${isMobileServicesOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isMobileServicesOpen
                                ? 'max-h-[800px] opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className='flex flex-col py-1 pl-3'>
                              {servicesDropdownItems.map(service => (
                                <Link
                                  key={service.href}
                                  href={service.href}
                                  onClick={closeMenu}
                                  tabIndex={isMobileServicesOpen ? 0 : -1}
                                  className='flex items-center min-h-[48px] px-4 rounded-xl text-[17px] font-semibold text-muted no-underline hover:bg-sky hover:text-navy'
                                >
                                  {service.label}
                                </Link>
                              ))}
                              <Link
                                href='/products'
                                onClick={closeMenu}
                                tabIndex={isMobileServicesOpen ? 0 : -1}
                                className='flex items-center gap-1.5 min-h-[48px] px-4 rounded-xl text-[17px] font-bold text-brand no-underline hover:bg-sky'
                              >
                                Все услуги
                                <Icon
                                  name='chev-right'
                                  size={16}
                                  strokeWidth={2.4}
                                />
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
                        className={`flex items-center min-h-[52px] px-4 rounded-2xl text-[19px] font-bold no-underline ${
                          isActive(item.href)
                            ? 'bg-sky text-navy'
                            : 'text-ink hover:bg-[#F3F7FA]'
                        }`}
                        aria-current={
                          pathname === item.href ? 'page' : undefined
                        }
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className='ds-card p-5 flex flex-col gap-4'>
                  <a
                    href={phoneHref}
                    className='flex items-center gap-3.5 no-underline text-navy'
                  >
                    <span className='ds-ibox w-11 h-11 rounded-[14px] bg-sky'>
                      <Phone className='w-5 h-5 text-brand' />
                    </span>
                    <span className='leading-tight'>
                      <span className='block text-[15px] text-muted'>
                        Телефон · {hoursLabel}
                      </span>
                      <span className='font-extrabold text-[19px]'>
                        {phoneLabel}
                      </span>
                    </span>
                  </a>
                  <a
                    href={`mailto:${headerContacts.email}`}
                    className='flex items-center gap-3.5 no-underline text-navy'
                  >
                    <span className='ds-ibox w-11 h-11 rounded-[14px] bg-sky'>
                      <Mail className='w-5 h-5 text-brand' />
                    </span>
                    <span className='leading-tight'>
                      <span className='block text-[15px] text-muted'>
                        Email
                      </span>
                      <span className='font-bold text-[17px] break-all'>
                        {headerContacts.email}
                      </span>
                    </span>
                  </a>
                  <div className='flex flex-wrap gap-1'>
                    {socialLinks.map(link => (
                      <a
                        key={link.name}
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='w-11 h-11 rounded-full flex items-center justify-center text-navy hover:bg-sky'
                        aria-label={link.label}
                      >
                        <SafeIcon name={link.name} className='w-6 h-6' />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Кнопка записи */}
              <div className='px-4 pb-5 pt-3 bg-canvas'>
                <button
                  type='button'
                  onClick={openBookingModal}
                  className='ds-btn ds-btn-primary ds-btn-lg ds-btn-block'
                >
                  Записаться на приём
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Модальное окно для записи */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
}

/** Пункты меню «Личный кабинет»: email, «Мои программы», «Сменить пароль», «Выйти». */
function ProfileMenuItems({
  email,
  large = false,
  onNavigate,
  onLogout,
}: {
  email: string | null;
  large?: boolean;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const item = `flex items-center gap-3 ${large ? 'min-h-[48px] text-[17px]' : 'min-h-[44px] text-[16px]'} px-4 rounded-xl no-underline font-[inherit] ds-focus`;
  return (
    <div className='p-2'>
      <div className='px-4 py-3'>
        <p className='text-[15px] text-muted m-0'>Вы вошли как</p>
        <p
          className='text-[16px] font-bold text-ink truncate m-0'
          title={email ?? undefined}
        >
          {email}
        </p>
      </div>
      <Link
        href='/dashboard'
        onClick={onNavigate}
        className={`${item} text-ink hover:bg-sky hover:text-navy`}
      >
        <Icon name='book' size={20} />
        Мои программы
      </Link>
      <Link
        href='/forgot-password'
        onClick={onNavigate}
        className={`${item} text-ink hover:bg-sky hover:text-navy`}
      >
        <Icon name='key' size={20} />
        Сменить пароль
      </Link>
      <button
        type='button'
        onClick={onLogout}
        className={`${item} w-full text-danger-ink bg-transparent border-0 cursor-pointer hover:bg-[#FBEDEC] text-left`}
      >
        <Icon name='logout' size={20} />
        Выйти
      </button>
    </div>
  );
}

'use client';

// Подвал (одинаковый на всех страницах): о специалисте, соцсети, услуги, навигация, контакты,
// реквизиты ИП и юридические ссылки. Кнопка «Настройки cookie» открывает окно согласия (cookie-consent).
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { openCookieSettings } from '@/lib/cookie-consent';
import { socialLinks } from '@/data/content';
import { CONTACTS } from '@/lib/seo';
import { formatPhone } from '@/components/ds/Layout';

const services = [
  { href: '/products/consultation', label: 'Онлайн-консультация' },
  {
    href: '/products/formula-movement',
    label: 'Программа тренировок «Формула Движения»',
  },
  { href: '/products/rehab-programs', label: 'Восстановительные программы' },
  {
    href: '/products/meniscus-resection',
    label: 'Восстановление после резекции мениска',
  },
  { href: '/products/online-training', label: 'Онлайн-тренировки' },
];

const nav = [
  { href: '/', label: 'Главная' },
  { href: '/about', label: 'Обо мне' },
  { href: '/products', label: 'Услуги' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/contacts', label: 'Контакты' },
];

const linkCls =
  'text-[#DCE9F4] no-underline hover:text-white hover:underline underline-offset-4 inline-flex items-center min-h-[44px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white focus-visible:outline-offset-2 rounded';

// Компонент кнопки "Наверх"
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className='fixed bottom-8 right-8 z-50 max-[768px]:hidden'>
      {isVisible && (
        <button
          onClick={scrollToTop}
          onKeyDown={handleKeyDown}
          className='bg-brand hover:bg-navy text-white p-3 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30'
          aria-label='Прокрутить наверх'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
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
              d='M5 10l7-7m0 0l7 7m-7-7v18'
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// Основной компонент футера
export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2026); // Значение по умолчанию

  useEffect(() => {
    // Устанавливаем текущий год только на клиенте
    setCurrentYear(new Date().getFullYear());
  }, []);

  const hours = CONTACTS.workingHours.replace(/-/g, '–');

  return (
    <footer
      className='mt-12 dsk:mt-24 bg-navy text-[#DCE9F4]'
      role='contentinfo'
      aria-label='Подвал сайта'
    >
      <div className='ds-wrap pt-12 dsk:pt-16 pb-8 dsk:pb-9'>
        <div className='grid gap-9 dsk:gap-10 grid-cols-1 sm:grid-cols-2 dsk:grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,3fr)] text-[17px] leading-[1.6]'>
          <div>
            <p className='m-0 mb-3.5 font-extrabold text-[20px] text-white'>
              Миненков Вадим
            </p>
            <p className='m-0'>
              Профессиональный подход к тренировочному процессу с учетом
              индивидуальных особенностей. Помогаю восстановить подвижность,
              снизить дискомфорт и вернуть телу уверенность в движении.
            </p>
            <ul className='flex flex-wrap gap-x-4 gap-y-1 mt-4 list-none p-0 m-0'>
              {socialLinks.map(link => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`${linkCls} text-white min-h-[44px]`}
                  >
                    {link.label === 'RuTube' ? 'Rutube' : link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label='Услуги'>
            <p className='m-0 mb-2 font-extrabold text-white'>Услуги</p>
            <ul className='list-none p-0 m-0 flex flex-col'>
              {services.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label='Навигация по сайту'>
            <p className='m-0 mb-2 font-extrabold text-white'>Навигация</p>
            <ul className='list-none p-0 m-0 flex flex-col'>
              {nav.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className='m-0 mb-2 font-extrabold text-white'>Контакты</p>
            <ul className='list-none p-0 m-0 flex flex-col'>
              <li>
                <a
                  href={`tel:${CONTACTS.phoneE164}`}
                  className={linkCls}
                  aria-label={`Позвонить по телефону ${formatPhone(CONTACTS.phoneE164)}`}
                >
                  {formatPhone(CONTACTS.phoneE164)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACTS.email}`}
                  className={`${linkCls} break-all`}
                >
                  {CONTACTS.email}
                </a>
              </li>
              <li className='min-h-[44px] flex items-center'>{hours}</li>
            </ul>
          </div>
        </div>

        <div className='mt-10 dsk:mt-12 pt-5 border-t border-[#2A5880] flex flex-col dsk:flex-row dsk:justify-between gap-4 dsk:gap-5 text-[15px] text-[#B9CFE2]'>
          <div>
            © {currentYear} ИП Миненков Вадим Леонидович. Все права защищены.
            <br />
            ИНН {CONTACTS.inn}, ОГРНИП {CONTACTS.ogrnip}
          </div>
          <ul
            className='flex flex-wrap gap-x-[18px] list-none p-0 m-0'
            aria-label='Документы'
          >
            <li>
              <Link href='/policy' className={linkCls}>
                Политика конфиденциальности
              </Link>
            </li>
            <li>
              <Link
                href='/consent'
                className={linkCls}
                aria-label='Согласие на обработку персональных данных'
              >
                Согласие
              </Link>
            </li>
            <li>
              <Link href='/offer' className={linkCls}>
                Договор-оферта
              </Link>
            </li>
            <li>
              <button
                type='button'
                onClick={openCookieSettings}
                className={`${linkCls} bg-transparent border-0 p-0 cursor-pointer font-[inherit] text-[15px]`}
              >
                Настройки cookie
              </button>
            </li>
          </ul>
        </div>
      </div>
      <ScrollToTop />
    </footer>
  );
}

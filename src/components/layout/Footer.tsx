'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Компонент с информацией о компании
const AboutColumn = () => {
  // Обработчик для клавиатурной навигации
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
      <h3 className="text-xl font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-14 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]">Миненков <span className="text-accent">Вадим</span></h3>
      <p className="text-white mb-4 font-semibold" style={{color: '#d1f3ea'}}>
      Профессиональный подход к тренировочному процессу с учетом индивидуальных особенностей. Помогаю восстановить подвижность, снизить дискомфорт и вернуть телу уверенность в движении.
      </p>
      <div className="flex space-x-4 mt-6">
        <a 
          href="https://t.me/MV_Rehab" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:rounded-full p-1" 
          aria-label="Telegram канал"
          onKeyDown={(e) => handleKeyDown(e, () => window.open('https://t.me/MV_Rehab', '_blank'))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </a>
        <a 
          href="https://youtube.com/@mv_rehab" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:rounded-full p-1" 
          aria-label="YouTube канал"
          onKeyDown={(e) => handleKeyDown(e, () => window.open('https://youtube.com/@mv_rehab', '_blank'))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
          </svg>
        </a>
        <a 
          href="https://dzen.ru/id/646ca9d1fc7bc51b6ac77784" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:rounded-full p-1" 
          aria-label="Дзен канал"
          onKeyDown={(e) => handleKeyDown(e, () => window.open('https://dzen.ru/id/646ca9d1fc7bc51b6ac77784', '_blank'))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 129 129" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M128.389 62.7804C128.389 62.1406 127.869 61.6108 127.229 61.5808C104.266 60.7111 90.2906 57.782 80.5136 48.0051C70.7167 38.2081 67.7976 24.2225 66.9279 1.20969C66.9079 0.569886 66.3781 0.0500488 65.7283 0.0500488H63.0491C62.4093 0.0500488 61.8795 0.569886 61.8495 1.20969C60.9797 24.2125 58.0607 38.2081 48.2637 48.0051C38.4768 57.792 24.5111 60.7111 1.54831 61.5808C0.908509 61.6008 0.388672 62.1306 0.388672 62.7804V65.4596C0.388672 66.0994 0.908509 66.6292 1.54831 66.6592C24.5111 67.529 38.4868 70.458 48.2637 80.235C58.0407 90.0119 60.9597 103.958 61.8395 126.88C61.8595 127.52 62.3893 128.04 63.0391 128.04H65.7283C66.3681 128.04 66.8979 127.52 66.9279 126.88C67.8076 103.958 70.7267 90.0119 80.5036 80.235C90.2906 70.448 104.256 67.529 127.219 66.6592C127.859 66.6392 128.379 66.1094 128.379 65.4596V62.7804H128.389Z" />
          </svg>
        </a>
        <a 
          href="https://rutube.ru/channel/38070887" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:rounded-full p-1" 
          aria-label="Rutube канал"
          onKeyDown={(e) => handleKeyDown(e, () => window.open('https://rutube.ru/channel/38070887', '_blank'))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 132 132" fill="currentColor" aria-hidden="true" focusable="false">
            <g clipPath="url(#clip0_519_footer)">
              <path d="M81.5361 62.9865H42.5386V47.5547H81.5361C83.814 47.5547 85.3979 47.9518 86.1928 48.6451C86.9877 49.3385 87.4801 50.6245 87.4801 52.5031V58.0441C87.4801 60.0234 86.9877 61.3094 86.1928 62.0028C85.3979 62.6961 83.814 62.9925 81.5361 62.9925V62.9865ZM84.2115 33.0059H26V99H42.5386V77.5294H73.0177L87.4801 99H106L90.0546 77.4287C95.9333 76.5575 98.573 74.7559 100.75 71.7869C102.927 68.8179 104.019 64.071 104.019 57.7359V52.7876C104.019 49.0303 103.621 46.0613 102.927 43.7857C102.233 41.51 101.047 39.5307 99.362 37.7528C97.5824 36.0698 95.6011 34.8845 93.2223 34.0904C90.8435 33.3971 87.8716 33 84.2115 33V33.0059Z" />
              <path d="M198 3.05176e-05C198 36.4508 168.451 66.0001 132 66.0001C124.589 66.0001 117.464 64.7786 110.814 62.5261C110.956 60.9577 111.019 59.3541 111.019 57.7359V52.7876C111.019 48.586 110.58 44.8824 109.623 41.7436C108.59 38.3588 106.82 35.4458 104.443 32.938L104.311 32.7988L104.172 32.667C101.64 30.2721 98.7694 28.5625 95.4389 27.4506L95.3108 27.4079L95.1812 27.3701C92.0109 26.446 88.3508 26 84.2115 26H77.2115V26.0059H71.3211C67.8964 18.0257 66 9.23434 66 3.05176e-05C66 -36.4508 95.5492 -66 132 -66C168.451 -66 198 -36.4508 198 3.05176e-05Z" />
            </g>
            <defs>
              <clipPath id="clip0_519_footer">
                <rect width="132" height="132" rx="66" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </a>
        <a 
          href="https://vk.com/minenkov_rehab" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:rounded-full p-1" 
          aria-label="VK группа"
          onKeyDown={(e) => handleKeyDown(e, () => window.open('https://vk.com/minenkov_rehab', '_blank'))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.091h-1.367c-.518 0-.677-.217-1.6-1.14-.825-.776-1.177-.88-1.38-.88-.283 0-.365.073-.365.427v1.039c0 .3-.095.48-.9.48-1.333 0-2.805-.807-3.846-2.307C7.614 11.886 7.077 10.145 7.077 9.843c0-.17.073-.316.427-.316h1.367c.32 0 .44.145.563.486.613 1.785 1.636 3.348 2.056 3.348.156 0 .23-.073.23-.47v-1.81c-.05-.897-.523-1.058-.523-1.403 0-.17.145-.34.374-.34h2.15c.29 0 .4.145.4.486v2.442c0 .265.117.352.19.352.155 0 .288-.097.577-.386.893-1.004 1.53-2.55 1.53-2.55.085-.182.24-.352.575-.352h1.368c.41 0 .502.207.41.487-.17.524-1.806 3.132-1.806 3.132-.145.242-.2.35 0 .621.145.206.652.627.985 1.004.62.694 1.1 1.277 1.225 1.676.145.41-.073.622-.486.622z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

// Компонент с услугами
const ServicesColumn = () => (
  <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
    <h3 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-10 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]" id="services-heading">Услуги</h3>
    <ul className="space-y-3" role="menu" aria-labelledby="services-heading">
      <li role="menuitem">
        <Link 
          href="/products" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Онлайн-консультации"
        >
          Онлайн-консультации
        </Link>
      </li>
      <li role="menuitem">
        <Link 
          href="/products" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Клуб «ФОРМУЛА ДВИЖЕНИЯ»"
        >
          Клуб «ФОРМУЛА ДВИЖЕНИЯ»
        </Link>
      </li>
      <li role="menuitem">
        <Link 
          href="/products" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Реабилитационные протоколы"
        >
          Реабилитационные протоколы
        </Link>
      </li>
    </ul>
  </div>
);

// Компонент с навигацией
const NavigationColumn = () => (
  <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
    <h3 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-10 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]" id="navigation-heading">Навигация</h3>
    <ul className="space-y-3" role="menu" aria-labelledby="navigation-heading">
      <li role="menuitem">
        <Link 
          href="/" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Главная страница"
        >
          Главная
        </Link>
      </li>
      <li role="menuitem">
        <Link 
          href="/about" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Страница обо мне"
        >
          Обо мне
        </Link>
      </li>
      <li role="menuitem">
        <Link 
          href="/products" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Страница услуг"
        >
          Услуги
        </Link>
      </li>
      <li role="menuitem">
        <Link 
          href="/reviews" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Страница отзывов"
        >
          Отзывы
        </Link>
      </li>
      <li role="menuitem">
        <Link 
          href="/contacts" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Страница контактов"
        >
          Контакты
        </Link>
      </li>
    </ul>
  </div>
);

// Компонент с контактами
const ContactsColumn = () => {
  // Обработчик для клавиатурной навигации
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
      <h3 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-10 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]" id="contacts-heading">Контакты</h3>
      <ul className="space-y-4" aria-labelledby="contacts-heading">
        <li className="flex items-start hover:translate-x-1 transition-all duration-300">
          <svg className="w-5 h-5 mt-0.5 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span className="text-white font-semibold" style={{color: '#d1f3ea'}}>Онлайн-консультации</span>
        </li>
        <li className="flex items-start hover:translate-x-1 transition-all duration-300">
          <svg className="w-5 h-5 mt-0.5 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
          <a 
            href="tel:+79283287052"
            className="text-white hover:text-accent-light transition-colors"
            aria-label="Позвонить по телефону +7 928 328-70-52"
          >
            <span>+7 928 328-70-52</span>
          </a>
        </li>
        <li className="flex items-start hover:translate-x-1 transition-all duration-300">
          <svg className="w-5 h-5 mt-0.5 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <a 
            href="mailto:minenkov.rehab@yandex.ru" 
            className="text-white hover:text-accent transition-all duration-300 font-semibold focus:outline-none focus:underline" 
            style={{color: '#d1f3ea'}} 
            aria-label="Написать на email minenkov.rehab@yandex.ru"
            onKeyDown={(e) => handleKeyDown(e, () => window.location.href = 'mailto:minenkov.rehab@yandex.ru')}
          >
            minenkov.rehab@yandex.ru
          </a>
        </li>
        <li className="flex items-start hover:translate-x-1 transition-all duration-300">
          <svg className="w-5 h-5 mt-0.5 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div className="text-white font-semibold" style={{color: '#d1f3ea'}}>
            <p style={{color: '#d1f3ea'}}>Пн - Пт: 10:00 - 19:00</p>
            <p style={{color: '#d1f3ea'}}>Сб: 10:00 - 15:00</p>
            <p style={{color: '#d1f3ea'}}>Вс: Выходной</p>
          </div>
        </li>
      </ul>
    </div>
  );
};

// Компонент с копирайтом и ссылками внизу
const FooterBottom = ({ currentYear }: { currentYear: number }) => (
  <div className="bg-primary-dark py-4 border-t border-primary/30">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-white text-center md:text-left font-semibold" style={{color: '#d1f3ea'}}>
          © {currentYear} Миненков Вадим. Все права защищены.
        </p>
        <div className="mt-4 md:mt-0 flex flex-wrap justify-center md:justify-end">
          <ul className="flex flex-wrap justify-center space-x-3 sm:space-x-6" role="menu" aria-label="Дополнительная информация">
            <li className="mt-2 sm:mt-0" role="menuitem">
              <Link 
                href="/policy" 
                className="text-white hover:text-accent transition-all duration-300 text-sm font-semibold focus:outline-none focus:underline" 
                style={{color: '#d1f3ea'}} 
                aria-label="Политика конфиденциальности"
              >
                Политика конфиденциальности
              </Link>
            </li>
            <li className="mt-2 sm:mt-0" role="menuitem">
              <Link 
                href="/terms" 
                className="text-white hover:text-accent transition-all duration-300 text-sm font-semibold focus:outline-none focus:underline" 
                style={{color: '#d1f3ea'}} 
                aria-label="Договор-оферта"
              >
                Договор-оферта
              </Link>
            </li>
            <li className="mt-2 sm:mt-0" role="menuitem">
              <Link 
                href="/requisites" 
                className="text-white hover:text-accent transition-all duration-300 text-sm font-semibold focus:outline-none focus:underline" 
                style={{color: '#d1f3ea'}} 
                aria-label="Реквизиты"
              >
                Реквизиты
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// Анимированный скролл-апп кнопка
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Обработка нажатия клавиш для кнопки прокрутки
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      className={`fixed bottom-6 right-6 p-3 rounded-full bg-accent text-white shadow-lg z-50 transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Прокрутить наверх"
      tabIndex={isVisible ? 0 : -1}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};

// Основной компонент футера
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white relative" role="contentinfo" aria-label="Подвал сайта">
      {/* Верхняя волнистая граница */}
      <div className="absolute top-0 left-0 right-0 h-12 overflow-hidden" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-12 transform rotate-180">
          <path fill="#F9FAFC" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" />
          <path fill="#F9FAFC" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" />
          <path fill="#F9FAFC" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
        </svg>
      </div>

      {/* Основная часть футера */}
      <div className="py-16 md:py-20 bg-primary mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <AboutColumn />
            <ServicesColumn />
            <NavigationColumn />
            <ContactsColumn />
          </div>
        </div>
      </div>
      <FooterBottom currentYear={currentYear} />
      <ScrollToTop />
    </footer>
  );
} 
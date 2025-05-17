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
        Профессиональная физическая реабилитация с индивидуальным подходом к каждому пациенту. Работаю с болями в спине, шее, суставах и помогаю восстановиться после травм.
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-6.593-3.891L12 12.517l-5.407-4.408A6.004 6.004 0 0 1 12 5.999a6.004 6.004 0 0 1 5.407 2.11zM18 12c0 .701-.12 1.374-.341 2L12 9.483l-5.659 4.517A5.968 5.968 0 0 1 6 12c0-.701.12-1.374.341-2L12 14.517l5.659-4.517c.221.626.341 1.299.341 2zm-1.593 3.891L12 11.483l-4.407 3.526A6.004 6.004 0 0 0 12 18.001a6.004 6.004 0 0 0 4.407-2.11z"/>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 12.028L9.504 16.56a.432.432 0 0 1-.624-.384V7.824c0-.336.36-.552.672-.384l8.064 4.344a.432.432 0 0 1-.048.244z"/>
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
          aria-label="Онлайн-ведение"
        >
          Онлайн-ведение
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
      <li role="menuitem">
        <Link 
          href="/products" 
          className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group focus:outline-none focus:underline" 
          style={{color: '#d1f3ea'}} 
          aria-label="Курсы и вебинары"
        >
          Курсы и вебинары
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
      </ul>
    </div>
  );
};

const FooterBottom = ({ currentYear }: { currentYear: number }) => (
  <div className="mt-12 pt-8 pb-6 border-t border-gray-700 text-center">
    <p className="text-white font-semibold" style={{color: '#d1f3ea'}}>
      &copy; {currentYear} Миненков Вадим. Все права защищены.
    </p>
    <p className="text-sm text-gray-400 mt-2">
      ИП Миненков Вадим Игоревич, ОГРНИП 321265100028630, ИНН 262306707682
    </p>
    <div className="mt-4">
      <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-accent transition-all duration-300 mx-2 focus:outline-none focus:underline">Политика конфиденциальности</Link>
      <span className="text-gray-600">|</span>
      <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-accent transition-all duration-300 mx-2 focus:outline-none focus:underline">Пользовательское соглашение</Link>
      <span className="text-gray-600">|</span>
      <Link href="/cookie-policy" className="text-sm text-gray-400 hover:text-accent transition-all duration-300 mx-2 focus:outline-none focus:underline">Политика Cookies</Link>
    </div>
  </div>
);

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
      behavior: 'smooth'
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
    <div className="fixed bottom-5 right-5 z-50">
      {isVisible && 
        <button 
          onClick={scrollToTop} 
          onKeyDown={handleKeyDown}
          className="p-3 rounded-full bg-accent text-white shadow-lg hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition-all duration-300 transform hover:scale-110"
          aria-label="Вернуться наверх"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      }
    </div>
  );
};

// Тип для стилей декоративного элемента
interface DecorativeElementStyle {
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  animationDuration?: string;
  animationDelay?: string;
}

// Компонент для одного декоративного элемента
const DecorativeElement = ({ index }: { index: number }) => {
  const [style, setStyle] = useState<DecorativeElementStyle>({});

  useEffect(() => {
    setStyle({
      width: `${Math.random() * 100 + 50}px`,
      height: `${Math.random() * 100 + 50}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
    });
  }, []); // Пустой массив зависимостей гарантирует, что эффект выполнится один раз после монтирования

  // Не рендерим элемент, пока стили не сгенерированы на клиенте
  if (!style.width) {
    return null;
  }

  return (
    <div
      className="absolute bg-accent rounded-full animate-pulse"
      style={style}
    />
  );
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-8 px-4 sm:px-6 lg:px-8 shadow-inner relative overflow-hidden">
      {/* Декоративные элементы */}
      {isClient && ( // Рендерим декоративные элементы только на клиенте
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          {[...Array(5)].map((_, i) => (
            <DecorativeElement key={i} index={i} />
          ))}
        </div>
      )}

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
        <AboutColumn />
        <ServicesColumn />
        <NavigationColumn />
        <ContactsColumn />
      </div>
      <FooterBottom currentYear={currentYear} />
      <ScrollToTop />
    </footer>
  );
} 
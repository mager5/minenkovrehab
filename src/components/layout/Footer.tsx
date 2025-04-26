'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Компонент с информацией о компании
const AboutColumn = () => (
  <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
    <h3 className="text-xl font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-14 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]">Миненков<span className="text-accent">Rehab</span></h3>
    <p className="text-white mb-4 font-semibold" style={{color: '#d1f3ea'}}>
      Профессиональная физическая реабилитация с индивидуальным подходом к каждому пациенту. Работаю с болями в спине, шее, суставах и помогаю восстановиться после травм.
    </p>
    <div className="flex space-x-4 mt-6">
      <a href="#" className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" aria-label="Facebook" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
      </a>
      <a href="#" className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" aria-label="Instagram" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://t.me/MV_Rehab" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" aria-label="Telegram канал">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 0c-6.626 0-12 5.372-12 12 0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12zm3.224 17.871c.188.133.43.166.646.085.215-.082.374-.232.442-.438.437-1.277.88-3.52.88-3.52.04-.165.018-.311-.071-.446-.088-.132-.233-.22-.43-.244-.268-.033-1-.244-1.415-.365-.305-.088-.385-.26-.34-.414.045-.152.173-.309.384-.452.212-.144.582-.202 1.11-.302.161-.033.255-.143.295-.304.041-.16.02-.304-.059-.442-.078-.142-.221-.234-.423-.276l-1.28-.275c-.162-.035-.325.005-.442.108-.118.103-.185.142-.365.238-.115.061-.29.043-.33-.151l-.07-.59c-.075-.326-.314-.452-.542-.494-.227-.042-.469-.033-.705.123l-3.067 2.039c-.09.059-.151.135-.188.23-.036.096-.047.2-.022.3.024.099.075.191.156.267.08.076.178.128.288.154l1.124.263c.265.062.375.291.465.648.09.357.215.729.381 1.082.166.354.342.612.567.801.114.096.237.175.37.236s.272.103.417.116c.147.013.296-.004.438-.051.142-.046.276-.119.39-.216.032-.027.062-.055.088-.085.026-.029.047-.061.07-.096.021-.035.039-.072.056-.11.016-.039.033-.079.049-.12l.15-.424c.05-.148.229-.22.229-.22s.609.21.968.328z"/></svg>
      </a>
      <a href="https://youtube.com/@mv_rehab" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" aria-label="YouTube канал">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
        </svg>
      </a>
    </div>
  </div>
);

// Компонент с услугами
const ServicesColumn = () => (
  <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
    <h3 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-10 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]">Услуги</h3>
    <ul className="space-y-3" role="menu">
      <li role="menuitem">
        <Link href="/products" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Онлайн-консультации">
          Онлайн-консультации
        </Link>
      </li>
      <li role="menuitem">
        <Link href="/products" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Онлайн-ведение">
          Онлайн-ведение
        </Link>
      </li>
      <li role="menuitem">
        <Link href="/products" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Клуб «ФОРМУЛА ДВИЖЕНИЯ»">
          Клуб «ФОРМУЛА ДВИЖЕНИЯ»
        </Link>
      </li>
      <li role="menuitem">
        <Link href="/products" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Реабилитационные протоколы">
          Реабилитационные протоколы
        </Link>
      </li>
      <li role="menuitem">
        <Link href="/products" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Курсы и вебинары">
          Курсы и вебинары
        </Link>
      </li>
    </ul>
  </div>
);

// Компонент с навигацией
const NavigationColumn = () => (
  <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
    <h3 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-10 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]">Навигация</h3>
    <ul className="space-y-3" role="menu">
      <li role="menuitem">
        <Link href="/" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Главная страница">
          Главная
        </Link>
      </li>
      <li role="menuitem">
        <Link href="/about" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Страница обо мне">
          Обо мне
        </Link>
      </li>
      <li role="menuitem">
        <Link href="/products" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Страница услуг">
          Услуги
        </Link>
      </li>
      <li role="menuitem">
        <Link href="/reviews" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Страница отзывов">
          Отзывы
        </Link>
      </li>
      <li role="menuitem">
        <Link href="/contacts" className="text-white hover:text-accent transition-all duration-300 flex items-center font-semibold group" style={{color: '#d1f3ea'}} aria-label="Страница контактов">
          Контакты
        </Link>
      </li>
    </ul>
  </div>
);

// Компонент с контактами
const ContactsColumn = () => (
  <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
    <h3 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-10 after:h-0.5 after:bg-accent after:left-0 after:bottom-[-10px]">Контакты</h3>
    <ul className="space-y-4">
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
        <a href="tel:+79615854288" className="text-white hover:text-accent transition-all duration-300 font-semibold" style={{color: '#d1f3ea'}} aria-label="Позвонить по телефону +7 (961) 585-42-88">+7 (961) 585-42-88</a>
      </li>
      <li className="flex items-start hover:translate-x-1 transition-all duration-300">
        <svg className="w-5 h-5 mt-0.5 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
        <a href="mailto:minenkov.rehab@gmail.com" className="text-white hover:text-accent transition-all duration-300 font-semibold" style={{color: '#d1f3ea'}} aria-label="Написать на email minenkov.rehab@gmail.com">minenkov.rehab@gmail.com</a>
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

// Компонент с копирайтом и ссылками внизу
const FooterBottom = ({ currentYear }: { currentYear: number }) => (
  <div className="bg-primary-dark py-4 border-t border-primary/30">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-white text-center md:text-left font-semibold" style={{color: '#d1f3ea'}}>
          © {currentYear} МиненковRehab. Все права защищены.
        </p>
        <div className="mt-4 md:mt-0 flex flex-wrap justify-center md:justify-end">
          <ul className="flex flex-wrap justify-center space-x-3 sm:space-x-6" role="menu">
            <li className="mt-2 sm:mt-0" role="menuitem">
              <Link href="/policy" className="text-white hover:text-accent transition-all duration-300 text-sm font-semibold" style={{color: '#d1f3ea'}} aria-label="Политика конфиденциальности">
                Политика конфиденциальности
              </Link>
            </li>
            <li className="mt-2 sm:mt-0" role="menuitem">
              <Link href="/terms" className="text-white hover:text-accent transition-all duration-300 text-sm font-semibold" style={{color: '#d1f3ea'}} aria-label="Договор-оферта">
                Договор-оферта
              </Link>
            </li>
            <li className="mt-2 sm:mt-0" role="menuitem">
              <Link href="/requisites" className="text-white hover:text-accent transition-all duration-300 text-sm font-semibold" style={{color: '#d1f3ea'}} aria-label="Реквизиты">
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

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 p-3 rounded-full bg-accent text-white shadow-lg z-50 transition-all duration-500 cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Прокрутить наверх"
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
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import BookingModal from '../BookingModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const pathname = usePathname();

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
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Верхняя инфо-панель */}
      <div className={`hidden lg:block bg-primary text-white py-2 transition-all duration-500 ease-in-out ${isScrolled ? 'transform -translate-y-full opacity-0 h-0 overflow-hidden' : 'transform translate-y-0 opacity-100'}`} role="complementary" aria-label="Контактная информация">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
              <p className="text-sm font-medium" style={{color: '#ffffff'}}>Следите за мной:</p>
              <div className="flex space-x-3">
                <a 
                  href="https://t.me/MV_Rehab" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" 
                  aria-label="Telegram канал"
                  onKeyDown={(e) => handleKeyDown(e, () => window.open('https://t.me/MV_Rehab', '_blank'))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style={{fill: '#ffffff'}} aria-hidden="true" focusable="false">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a 
                  href="https://youtube.com/@mv_rehab" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" 
                  aria-label="YouTube канал"
                  onKeyDown={(e) => handleKeyDown(e, () => window.open('https://youtube.com/@mv_rehab', '_blank'))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffffff" viewBox="0 0 16 16" style={{fill: '#ffffff'}} aria-hidden="true" focusable="false">
                    <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
                  </svg>
                </a>
                <a 
                  href="https://dzen.ru/id/646ca9d1fc7bc51b6ac77784" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" 
                  aria-label="Дзен канал"
                  onKeyDown={(e) => handleKeyDown(e, () => window.open('https://dzen.ru/id/646ca9d1fc7bc51b6ac77784', '_blank'))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style={{fill: '#ffffff'}} aria-hidden="true" focusable="false">
                    <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-6.593-3.891L12 12.517l-5.407-4.408A6.004 6.004 0 0 1 12 5.999a6.004 6.004 0 0 1 5.407 2.11zM18 12c0 .701-.12 1.374-.341 2L12 9.483l-5.659 4.517A5.968 5.968 0 0 1 6 12c0-.701.12-1.374.341-2L12 14.517l5.659-4.517c.221.626.341 1.299.341 2zm-1.593 3.891L12 11.483l-4.407 3.526A6.004 6.004 0 0 0 12 18.001a6.004 6.004 0 0 0 4.407-2.11z"/>
                  </svg>
                </a>
                <a 
                  href="https://rutube.ru/channel/38070887" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" 
                  aria-label="Rutube канал"
                  onKeyDown={(e) => handleKeyDown(e, () => window.open('https://rutube.ru/channel/38070887', '_blank'))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style={{fill: '#ffffff'}} aria-hidden="true" focusable="false">
                    <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 12.028L9.504 16.56a.432.432 0 0 1-.624-.384V7.824c0-.336.36-.552.672-.384l8.064 4.344a.432.432 0 0 1-.048.244z"/>
                  </svg>
                </a>
                <a 
                  href="https://vk.com/minenkov_rehab" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-accent transition-all duration-300 transform hover:scale-110" 
                  aria-label="VK группа"
                  onKeyDown={(e) => handleKeyDown(e, () => window.open('https://vk.com/minenkov_rehab', '_blank'))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style={{fill: '#ffffff'}} aria-hidden="true" focusable="false">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.091h-1.367c-.518 0-.677-.217-1.6-1.14-.825-.776-1.177-.88-1.38-.88-.283 0-.365.073-.365.427v1.039c0 .3-.095.48-.9.48-1.333 0-2.805-.807-3.846-2.307C7.614 11.886 7.077 10.145 7.077 9.843c0-.17.073-.316.427-.316h1.367c.32 0 .44.145.563.486.613 1.785 1.636 3.348 2.056 3.348.156 0 .23-.073.23-.47v-1.81c-.05-.897-.523-1.058-.523-1.403 0-.17.145-.34.374-.34h2.15c.29 0 .4.145.4.486v2.442c0 .265.117.352.19.352.155 0 .288-.097.577-.386.893-1.004 1.53-2.55 1.53-2.55.085-.182.24-.352.575-.352h1.368c.41 0 .502.207.41.487-.17.524-1.806 3.132-1.806 3.132-.145.242-.2.35 0 .621.145.206.652.627.985 1.004.62.694 1.1 1.277 1.225 1.676.145.41-.073.622-.486.622z"/>
                  </svg>
                </a>
              </div>
            </div>
          
          <div className="flex items-center space-x-6">
              <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
                <a
                  href="tel:+79283287052"
                  className="text-white hover:text-accent-light transition-colors"
                  aria-label="Позвонить по телефону +7 928 328-70-52"
                  onKeyDown={(e) => handleKeyDown(e, () => window.location.href = 'tel:+79283287052')}
                >
                  <span className="hidden md:inline">+7 928 328-70-52</span>
                </a>
            </div>
              <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Пн-Сб: 10:00-19:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      {/* Основная навигация - липкая часть */}
      <header className={`sticky top-0 left-0 right-0 z-50 bg-white transition-all duration-500 ease-in-out ${isScrolled ? 'shadow-lg py-3' : 'shadow-sm py-4'}`} role="banner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Логотип и название */}
            <Link 
              href="/" 
              className="flex items-center space-x-2" 
              aria-label="Миненков Вадим - На главную"
            >
              <Image 
                src="/images/logo.png" 
                alt="Логотип Миненков Вадим" 
                width={40} 
                height={40}
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <span className="text-xl md:text-2xl font-bold text-primary transition-transform duration-300">Миненков<span className="text-accent"> Вадим</span></span>
            </Link>

            {/* Десктопное меню */}
            <nav className="hidden [&>*]:text-nowrap [@media(min-width:840px)]:flex space-x-1 lg:space-x-2" aria-label="Основная навигация">
              <Link 
                href="/" 
                className={`px-2 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3 whitespace-nowrap ${pathname === '/' ? 'text-primary font-semibold after:w-2/3' : 'text-gray-800'}`}
                aria-current={pathname === '/' ? 'page' : undefined}
              >
                Главная
              </Link>
              <Link 
                href="/about" 
                className={`px-2 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3 whitespace-nowrap ${pathname === '/about' ? 'text-primary font-semibold after:w-2/3' : 'text-gray-800'}`}
                aria-current={pathname === '/about' ? 'page' : undefined}
              >
                Обо мне
              </Link>
              <Link 
                href="/products" 
                className={`px-2 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3 whitespace-nowrap ${pathname === '/products' ? 'text-primary font-semibold after:w-2/3' : 'text-gray-800'}`}
                aria-current={pathname === '/products' ? 'page' : undefined}
              >
                Услуги
              </Link>
              <Link 
                href="/reviews" 
                className={`px-2 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3 whitespace-nowrap ${pathname === '/reviews' ? 'text-primary font-semibold after:w-2/3' : 'text-gray-800'}`}
                aria-current={pathname === '/reviews' ? 'page' : undefined}
              >
                Отзывы
              </Link>
              <Link 
                href="/contacts" 
                className={`px-2 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3 whitespace-nowrap ${pathname === '/contacts' ? 'text-primary font-semibold after:w-2/3' : 'text-gray-800'}`}
                aria-current={pathname === '/contacts' ? 'page' : undefined}
              >
                Контакты
              </Link>
            </nav>

            {/* Кнопка записи */}
            <div className="hidden [@media(min-width:840px)]:block">
              <button 
                onClick={openBookingModal}
                className="bg-accent hover:bg-accent-dark text-white font-semibold text-sm lg:text-base px-3 lg:px-5 py-2 rounded-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                aria-label="Записаться на консультацию"
                aria-haspopup="dialog"
              >
                Записаться
              </button>
            </div>

            {/* Мобильное меню (бургер) */}
            <div className="[@media(min-width:840px)]:hidden">
              <button
                type="button"
                className="text-gray-800 hover:text-primary focus:outline-none transition-all duration-300 p-2 rounded-md"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg
                  className="h-6 w-6 transition-transform duration-300 ease-in-out"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0)',
                  }}
                  aria-hidden="true"
                  focusable="false"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Мобильное меню (выпадающее) */}
          <div 
            id="mobile-menu"
            className={`[@media(min-width:840px)]:hidden transition-all duration-500 ease-in-out overflow-hidden ${
              isMenuOpen ? 'max-h-[400px] opacity-100 mt-4 pb-4 border-t pt-4' : 'max-h-0 opacity-0 mt-0 pb-0 border-t border-transparent'
            }`}
            aria-hidden={!isMenuOpen}
            role="navigation"
            aria-label="Мобильная навигация"
          >
              <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                onClick={closeMenu}
                className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none md:focus:ring-2 md:focus:ring-primary md:focus:ring-offset-2 md:focus:rounded-sm ${pathname === '/' ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                aria-current={pathname === '/' ? 'page' : undefined}
              >
                  Главная
                </Link>
              <Link 
                href="/about" 
                onClick={closeMenu}
                className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none md:focus:ring-2 md:focus:ring-primary md:focus:ring-offset-2 md:focus:rounded-sm ${pathname === '/about' ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                aria-current={pathname === '/about' ? 'page' : undefined}
              >
                  Обо мне
                </Link>
              <Link 
                href="/products" 
                onClick={closeMenu}
                className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none md:focus:ring-2 md:focus:ring-primary md:focus:ring-offset-2 md:focus:rounded-sm ${pathname === '/products' ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                aria-current={pathname === '/products' ? 'page' : undefined}
              >
                  Услуги
                </Link>
              <Link 
                href="/reviews" 
                onClick={closeMenu}
                className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none md:focus:ring-2 md:focus:ring-primary md:focus:ring-offset-2 md:focus:rounded-sm ${pathname === '/reviews' ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                aria-current={pathname === '/reviews' ? 'page' : undefined}
              >
                  Отзывы
                </Link>
              <Link 
                href="/contacts" 
                onClick={closeMenu}
                className={`font-medium hover:text-primary transition-all duration-300 border-l-2 border-transparent hover:border-primary focus:outline-none md:focus:ring-2 md:focus:ring-primary md:focus:ring-offset-2 md:focus:rounded-sm ${pathname === '/contacts' ? 'text-primary font-semibold border-primary' : 'text-gray-800'}`}
                aria-current={pathname === '/contacts' ? 'page' : undefined}
              >
                  Контакты
                </Link>
              <button 
                onClick={openBookingModal}
                className="bg-accent text-white px-4 py-3 rounded-md font-semibold hover:bg-accent-dark transition-all duration-300 transform active:scale-95 text-center shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                aria-label="Записаться на консультацию"
                aria-haspopup="dialog"
              >
                  Записаться
              </button>
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
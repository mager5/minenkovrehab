'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ClubPage() {
  const [activeTab, setActiveTab] = useState('rutube');
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [playingVideos, setPlayingVideos] = useState<{[key: string]: boolean}>({});
  const heroRef = useRef(null);
  
  const toggleVideo = (videoId: string) => {
    setPlayingVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  // Эффект параллакса для героя
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroContentY = useTransform(heroScroll, [0, 1], [0, -60]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0.2]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.95]);

  // Часто задаваемые вопросы
  const faqItems = [
    {
      question: "Что такое клуб «ФОРМУЛА ДВИЖЕНИЯ»?",
      answer: "Это закрытое сообщество для тех, кто заботится о своём здоровье, хочет улучшить подвижность суставов и избавиться от болей. В клубе вы получаете доступ к эксклюзивным материалам, видеоурокам и консультациям."
    },
    {
      question: "Какие материалы доступны в клубе?",
      answer: "В клубе вы найдёте видеоуроки с упражнениями для различных частей тела, обучающие материалы по анатомии, рекомендации по восстановлению после травм, записи вебинаров и прямых эфиров."
    },
    {
      question: "Как часто добавляются новые материалы?",
      answer: "Новые материалы добавляются еженедельно. Это могут быть новые комплексы упражнений, разборы частых проблем, ответы на вопросы участников клуба."
    },
    {
      question: "Подходит ли клуб новичкам?",
      answer: "Да, клуб подходит людям с любым уровнем подготовки. Все упражнения имеют различные варианты выполнения, которые можно адаптировать под свой уровень."
    },
    {
      question: "Как получить доступ к клубу?",
      answer: "Для получения доступа к клубу необходимо оформить подписку. Свяжитесь со мной через телеграм или по телефону, и я расскажу о текущих условиях вступления."
    }
  ];

  const toggleQuestion = (index: number) => {
    if (activeQuestion === index) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(index);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero (Главный экран) */}
      <section className="relative w-full pt-32 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-br from-primary/90 via-primary/80 to-accent/70">
        <div className="absolute inset-0 w-full h-full -z-10">
          <div className="absolute inset-0 bg-[url('/images/about/hero-bg.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        </div>
        <div className="container mx-auto px-4 flex flex-col items-center text-center z-10">
          <h1 className="text-2xl md:text-6xl font-bold text-white mb-6 max-w-3xl">Вы хотите чувствовать себя энергично, легко и свободно в своём теле?</h1>
          <p className="text-base md:text-2xl text-white/90 mb-8 max-w-2xl">Преодолейте усталость, дискомфорт в спине и суставах вместе с «Формулой Движения»</p>
          <a href="#join" className="inline-block bg-accent text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-full text-base md:text-lg shadow-lg hover:bg-accent-dark transition">Присоединиться сейчас</a>
        </div>
      </section>

      {/* Проблема и решение */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">Что вас сдерживает?</h2>
        <p className="text-base md:text-lg text-gray-700 text-center mb-8 max-w-2xl mx-auto">Постоянная усталость, дискомфорт в спине и суставах мешают жить на полную.</p>
        <h3 className="text-lg md:text-2xl font-bold text-accent mb-4 text-center">Наш ответ – «Формула Движения»</h3>
        <p className="text-base md:text-lg text-gray-700 text-center max-w-2xl mx-auto">Это не просто тренировки – это система, которая мягко и эффективно приводит ваше тело в тонус, а главное, делает движение привычкой, от которой невозможно отказаться!</p>
      </section>

      {/* Преимущества программы */}
      <section className="bg-blue-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 md:mb-10 text-center">Что вас ждёт в «Формуле Движения»?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl">⭐️</span>
              <div>
                <h4 className="font-bold text-base md:text-lg mb-1">Продуманные тренировки</h4>
                <p className="text-gray-700 text-sm">Укрепляем спину, улучшаем осанку, развиваем гибкость, заботимся о суставах и избавляемся от зажимов. Все программы подходят даже 50+.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl">⏰</span>
              <div>
                <h4 className="font-bold text-base md:text-lg mb-1">Оптимальный ритм</h4>
                <p className="text-gray-700 text-sm">25–30 минут, 3 раза в неделю (пн, ср, пт). Начало в 7:00 (МСК), но все занятия остаются в записи.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl">✅</span>
              <div>
                <h4 className="font-bold text-base md:text-lg mb-1">Идеально для любого уровня</h4>
                <p className="text-gray-700 text-sm">Комфортно новичкам и прогрессивно опытным: двигаемся от простого к сложному.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl">👍</span>
              <div>
                <h4 className="font-bold text-base md:text-lg mb-1">Минимальный инвентарь</h4>
                <p className="text-gray-700 text-sm">На старте нужен только коврик, дальше постепенно добавляем оборудование.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl">✍️</span>
              <div>
                <h4 className="font-bold text-base md:text-lg mb-1">Поддержка 24/7</h4>
                <p className="text-gray-700 text-sm">Тёплое сообщество, ответы на вопросы и мощная мотивация.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl">☀️</span>
              <div>
                <h4 className="font-bold text-base md:text-lg mb-1">Где угодно</h4>
                <p className="text-gray-700 text-sm">Дома, в отпуске, на даче или даже на работе!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Для кого подходит */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Кому подойдёт клуб?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-2 md:gap-3"><span className="text-xl md:text-2xl">✅</span> <span className="text-base md:text-lg">Если вы хотите начать, но не знаете, с чего.</span></div>
          <div className="flex items-start gap-2 md:gap-3"><span className="text-xl md:text-2xl">✅</span> <span className="text-base md:text-lg">Если сложно найти мотивацию и систему.</span></div>
          <div className="flex items-start gap-2 md:gap-3"><span className="text-xl md:text-2xl">✅</span> <span className="text-base md:text-lg">Если есть ограничения, но есть желание двигаться.</span></div>
          <div className="flex items-start gap-2 md:gap-3"><span className="text-xl md:text-2xl">✅</span> <span className="text-base md:text-lg">Если нужны простые, но эффективные упражнения.</span></div>
        </div>
      </section>

      {/* Лёгкий подход */}
      <section className="bg-blue-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">Наш принцип</h2>
          <p className="text-base md:text-lg text-gray-700 text-center mb-6 max-w-2xl mx-auto">Формула Движения – это не про изнуряющие тренировки, а про комфортное и безопасное движение к здоровью!</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm md:text-base text-gray-700">
            <div className="flex items-center gap-1 md:gap-2"><span className="text-lg md:text-xl">☀️</span> Лёгкие, но эффективные упражнения</div>
            <div className="flex items-center gap-1 md:gap-2"><span className="text-lg md:text-xl">➡️</span> Мягкий подход без перегрузок</div>
            <div className="flex items-center gap-1 md:gap-2"><span className="text-lg md:text-xl">✳️</span> Подходит для любого возраста и уровня подготовки</div>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Как присоединиться</h2>
        <ol className="list-decimal list-inside text-base md:text-lg text-gray-700 max-w-2xl mx-auto mb-4 space-y-2">
          <li>Оставьте заявку на сайте.</li>
          <li>Получите доступ к личному кабинету.</li>
          <li>Начните заниматься по расписанию или в записи.</li>
        </ol>
        <p className="text-center text-gray-500 text-sm md:text-base">Все занятия остаются в записи – тренируйтесь, когда удобно!</p>
      </section>

      {/* Стоимость */}
      <section className="bg-blue-50 py-12 md:py-16" id="join">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Стоимость абонемента</h2>
          <p className="text-base md:text-lg text-gray-700 mb-6">Всего 2950 ₽/мес. Это дешевле, чем тренер в зале, и удобнее, чем ездить на тренировки!</p>
          <a href="#" className="inline-block bg-accent text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-full text-base md:text-lg shadow-lg hover:bg-accent-dark transition">Оформить абонемент</a>
        </div>
      </section>

      {/* Отзывы (опционально) */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 md:mb-10 text-center">Отзывы участников</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Здесь можно добавить карточки отзывов с фото, именем и текстом */}
        </div>
      </section>

      {/* Новый стиль жизни */}
      <section className="bg-blue-50 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Это не просто тренировки</h2>
          <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto">©️Это не просто тренировки – это новый стиль жизни, доступный каждому, независимо от возраста и физических возможностей.</p>
        </div>
      </section>

      {/* Финальный CTA */}
      <section className="container mx-auto px-4 py-12 md:py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Готовы изменить жизнь?</h2>
        <p className="text-base md:text-lg text-gray-700 mb-8">Присоединяйтесь к «Формуле Движения» и начните двигаться легко уже сегодня!</p>
        <a href="#join" className="inline-block bg-accent text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-full text-base md:text-lg shadow-lg hover:bg-accent-dark transition">Начать сейчас</a>
      </section>

      {/* --- Кнопки переключения видео --- */}
      <div className="container mx-auto px-4 py-6 md:py-8 flex flex-wrap justify-center gap-3 md:gap-4">
        <button
          className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 transform text-base md:text-lg ${activeTab === 'rutube' ? 'bg-accent text-white scale-105 shadow-lg' : 'bg-white/90 text-primary hover:scale-105 hover:bg-white hover:shadow-md'}`}
          onClick={() => setActiveTab('rutube')}
        >
          Rutube
        </button>
        <button
          className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 transform text-base md:text-lg ${activeTab === 'youtube' ? 'bg-accent text-white scale-105 shadow-lg' : 'bg-white/90 text-primary hover:scale-105 hover:bg-white hover:shadow-md'}`}
          onClick={() => setActiveTab('youtube')}
        >
          YouTube
        </button>
        <button
          className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 transform text-base md:text-lg ${activeTab === 'dzen' ? 'bg-accent text-white scale-105 shadow-lg' : 'bg-white/90 text-primary hover:scale-105 hover:bg-white hover:shadow-md'}`}
          onClick={() => setActiveTab('dzen')}
        >
          Дзен
        </button>
      </div>
      {/* --- Конец блока кнопок --- */}

      {/* Секция с видео и вкладками */}
      <div className="container mx-auto px-4 py-12">
        {/* Удалён блок 'Библиотека знаний' */}
        {/* Сетка видео с Rutube */}
        <div className={`mb-16 ${activeTab === 'rutube' ? 'block' : 'hidden'}`}>
          <motion.div 
            className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-primary flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 132 132" fill="currentColor" className="mr-3 text-accent">
                <g clipPath="url(#clip0_519_1976)">
                  <path d="M81.5361 62.9865H42.5386V47.5547H81.5361C83.814 47.5547 85.3979 47.9518 86.1928 48.6451C86.9877 49.3385 87.4801 50.6245 87.4801 52.5031V58.0441C87.4801 60.0234 86.9877 61.3094 86.1928 62.0028C85.3979 62.6961 83.814 62.9925 81.5361 62.9925V62.9865ZM84.2115 33.0059H26V99H42.5386V77.5294H73.0177L87.4801 99H106L90.0546 77.4287C95.9333 76.5575 98.573 74.7559 100.75 71.7869C102.927 68.8179 104.019 64.071 104.019 57.7359V52.7876C104.019 49.0303 103.621 46.0613 102.927 43.7857C102.233 41.51 101.047 39.5307 99.362 37.7528C97.5824 36.0698 95.6011 34.8845 93.2223 34.0904C90.8435 33.3971 87.8716 33 84.2115 33V33.0059Z" />
                  <path d="M198 3.05176e-05C198 36.4508 168.451 66.0001 132 66.0001C124.589 66.0001 117.464 64.7786 110.814 62.5261C110.956 60.9577 111.019 59.3541 111.019 57.7359V52.7876C111.019 48.586 110.58 44.8824 109.623 41.7436C108.59 38.3588 106.82 35.4458 104.443 32.938L104.311 32.7988L104.172 32.667C101.64 30.2721 98.7694 28.5625 95.4389 27.4506L95.3108 27.4079L95.1812 27.3701C92.0109 26.446 88.3508 26 84.2115 26H77.2115V26.0059H71.3211C67.8964 18.0257 66 9.23434 66 3.05176e-05C66 -36.4508 95.5492 -66 132 -66C168.451 -66 198 -36.4508 198 3.05176e-05Z" />
                </g>
                <defs>
                  <clipPath id="clip0_519_1976">
                    <rect width="132" height="132" rx="66" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              Видео с Rutube
            </h2>
            <a 
              href="https://rutube.ru/channel/38070887/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-accent hover:text-accent-dark font-medium transition-colors"
            >
              <span>Смотреть все видео</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Видео 1 */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['cbf66d8c6f758e1e26018fd7d421fe57'] ? (
                    <iframe 
                      src="https://rutube.ru/play/embed/cbf66d8c6f758e1e26018fd7d421fe57?autoplay=1" 
                      title="РЕЗЕКЦИЯ МЕНИСКА"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0" 
                      allow="clipboard-write; autoplay" 
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="https://rutube.ru/api/video/cbf66d8c6f758e1e26018fd7d421fe57/thumbnail/?redirect=1"
                        alt="РЕЗЕКЦИЯ МЕНИСКА | Когда можно ходить?" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('cbf66d8c6f758e1e26018fd7d421fe57')}
                        className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#0063A5" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">РЕЗЕКЦИЯ МЕНИСКА | Когда можно ходить? Нужны ли костыли?</h3>
                <p className="text-sm text-gray-600 mb-3">В этом видео разберёмся, когда можно полноценно нагружать ногу, нужны ли костыли после резекции мениска и какие упражнения помогут быстрее восстановить нормальную походку.</p>
                <a 
                  href="https://rutube.ru/video/cbf66d8c6f758e1e26018fd7d421fe57/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-sm transition-colors"
                >
                  <span>Смотреть на Rutube</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Видео 2 */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['ef5fa39e15b6f52c5efa497157fa39fa'] ? (
                    <iframe 
                      src="https://rutube.ru/play/embed/ef5fa39e15b6f52c5efa497157fa39fa?autoplay=1" 
                      title="Бег после удаления мениска"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0" 
                      allow="clipboard-write; autoplay" 
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="https://rutube.ru/api/video/ef5fa39e15b6f52c5efa497157fa39fa/thumbnail/?redirect=1"
                        alt="Бег после удаления мениска" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('ef5fa39e15b6f52c5efa497157fa39fa')}
                        className="absolute inset-0 bg-accent/20 group-hover:bg-accent/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#19bd90" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Бег после удаления мениска: Когда можно вернуться?</h3>
                <p className="text-sm text-gray-600 mb-3">В этом видео вы узнаете, когда и как безопасно возобновить тренировки после операции на колене, этапы реабилитации и упражнения для подготовки к бегу.</p>
                <a 
                  href="https://rutube.ru/video/ef5fa39e15b6f52c5efa497157fa39fa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-sm transition-colors"
                >
                  <span>Смотреть на Rutube</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Видео 3 */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['b41575e06676477334fd16b38a228eea'] ? (
                    <iframe 
                      src="https://rutube.ru/play/embed/b41575e06676477334fd16b38a228eea?autoplay=1" 
                      title="Как правильно разрабатывать колено"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0" 
                      allow="clipboard-write; autoplay" 
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="https://rutube.ru/api/video/b41575e06676477334fd16b38a228eea/thumbnail/?redirect=1"
                        alt="Как правильно разрабатывать колено" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('b41575e06676477334fd16b38a228eea')}
                        className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#19bd90" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Упражнение для снятия напряжения в шее</h3>
                <p className="text-sm text-gray-600 mb-3">Если у вас часто болит шея из-за долгой работы за компьютером или стресса, попробуйте это простое, но эффективное упражнение. Двигайтесь плавно, без резких движений.</p>
                <a 
                  href="https://rutube.ru/channel/38070887/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-sm transition-colors"
                >
                  <span>Смотреть на Rutube</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Сетка видео с YouTube */}
        <div className={`mb-16 ${activeTab === 'youtube' ? 'block' : 'hidden'}`}>
          <motion.div 
            className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-primary flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" className="mr-3 text-red-500">
                <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
              </svg>
              Видео с YouTube
            </h2>
            <a 
              href="https://www.youtube.com/@mv_rehab"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-accent hover:text-accent-dark font-medium transition-colors"
            >
              <span>Смотреть все видео</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Видео 1 для YouTube */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['rd01ROUBUvc'] ? (
                    <iframe 
                      src="https://www.youtube.com/embed/rd01ROUBUvc?si=xnI1DWLx2tywsM6W&autoplay=1" 
                      title="Укрепление нижних конечностей"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="https://img.youtube.com/vi/rd01ROUBUvc/hqdefault.jpg"
                        alt="Укрепление нижних конечностей" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('rd01ROUBUvc')}
                        className="absolute inset-0 bg-red-500/20 group-hover:bg-red-500/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ff0000" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Укрепление нижних конечностей</h3>
                <p className="text-sm text-gray-600 mb-3">Подробный комплекс упражнений для укрепления мышц ног и восстановления после травм. Эффективная методика для улучшения устойчивости и силы.</p>
                <a 
                  href="https://www.youtube.com/watch?v=rd01ROUBUvc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-sm transition-colors"
                >
                  <span>Смотреть на YouTube</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Видео 2 для YouTube */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['L0X2-EpdfjA'] ? (
                    <iframe 
                      src="https://www.youtube.com/embed/L0X2-EpdfjA?si=HJhcRyt4UdkW0TBQ&autoplay=1" 
                      title="Мобильность суставов"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="https://img.youtube.com/vi/L0X2-EpdfjA/hqdefault.jpg"
                        alt="Мобильность суставов" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('L0X2-EpdfjA')}
                        className="absolute inset-0 bg-red-500/20 group-hover:bg-red-500/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ff0000" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Мобильность суставов</h3>
                <p className="text-sm text-gray-600 mb-3">Специальный комплекс упражнений для улучшения подвижности всех суставов. Техники для эффективной разработки и поддержания здоровья опорно-двигательного аппарата.</p>
                <a 
                  href="https://www.youtube.com/watch?v=L0X2-EpdfjA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-sm transition-colors"
                >
                  <span>Смотреть на YouTube</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Видео 3 для YouTube */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['yvxElCLNz5E'] ? (
                    <iframe 
                      src="https://www.youtube.com/embed/yvxElCLNz5E?si=NeCsZlUIfuUMnZAf&autoplay=1" 
                      title="Упражнения для здоровой спины"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="https://img.youtube.com/vi/yvxElCLNz5E/hqdefault.jpg"
                        alt="Упражнения для здоровой спины" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('yvxElCLNz5E')}
                        className="absolute inset-0 bg-red-500/20 group-hover:bg-red-500/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ff0000" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Упражнения для здоровой спины</h3>
                <p className="text-sm text-gray-600 mb-3">Комплекс эффективных упражнений для профилактики и лечения проблем с позвоночником. Техники для снятия напряжения и укрепления мышц спины.</p>
                <a 
                  href="https://www.youtube.com/watch?v=yvxElCLNz5E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-sm transition-colors"
                >
                  <span>Смотреть на YouTube</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Сетка видео с Дзен */}
        <div className={`mb-16 ${activeTab === 'dzen' ? 'block' : 'hidden'}`}>
          <motion.div 
            className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-primary flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 129 129" fill="currentColor" className="mr-3 text-accent">
                <path d="M128.389 62.7804C128.389 62.1406 127.869 61.6108 127.229 61.5808C104.266 60.7111 90.2906 57.782 80.5136 48.0051C70.7167 38.2081 67.7976 24.2225 66.9279 1.20969C66.9079 0.569886 66.3781 0.0500488 65.7283 0.0500488H63.0491C62.4093 0.0500488 61.8795 0.569886 61.8495 1.20969C60.9797 24.2125 58.0607 38.2081 48.2637 48.0051C38.4768 57.792 24.5111 60.7111 1.54831 61.5808C0.908509 61.6008 0.388672 62.1306 0.388672 62.7804V65.4596C0.388672 66.0994 0.908509 66.6292 1.54831 66.6592C24.5111 67.529 38.4868 70.458 48.2637 80.235C58.0407 90.0119 60.9597 103.958 61.8395 126.88C61.8595 127.52 62.3893 128.04 63.0391 128.04H65.7283C66.3681 128.04 66.8979 127.52 66.9279 126.88C67.8076 103.958 70.7267 90.0119 80.5036 80.235C90.2906 70.448 104.256 67.529 127.219 66.6592C127.859 66.6392 128.379 66.1094 128.379 65.4596V62.7804H128.389Z" />
              </svg>
              Видео с Дзен
            </h2>
            <a 
              href="https://dzen.ru/id/646ca9d1fc7bc51b6ac77784"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-accent hover:text-accent-dark font-medium transition-colors"
            >
              <span>Смотреть все видео</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
          
          {/* Карточки с вертикальными видео */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Видео 1 для Дзен */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[177.78%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['vF5gHw2bFkTE'] ? (
                    <iframe 
                      src="https://dzen.ru/embed/vF5gHw2bFkTE?from_block=partner&from=zen&mute=0&autoplay=1&tv=0" 
                      title="РЕЗЕКЦИЯ МЕНИСКА | Когда можно ходить? Нужны ли костыли?"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0"
                      scrolling="no"
                      allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="/images/club/dzen-preview-1.jpg"
                        alt="РЕЗЕКЦИЯ МЕНИСКА | Когда можно ходить? Нужны ли костыли?" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('vF5gHw2bFkTE')}
                        className="absolute inset-0 bg-yellow-500/20 group-hover:bg-yellow-500/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#fbbf24" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">РЕЗЕКЦИЯ МЕНИСКА | Когда можно ходить? Нужны ли костыли?</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">В этом видео разберёмся, когда можно полноценно нагружать ногу, нужны ли костыли после резекции мениска и какие упражнения помогут быстрее восстановить нормальную походку.</p>
                <a 
                  href="https://dzen.ru/video/watch/67e64077bf5d123f06eaff24"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-xs transition-colors"
                >
                  <span>Смотреть на Дзен</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Видео 2 для Дзен */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[177.78%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['v4WbtwSiIg3A'] ? (
                    <iframe 
                      src="https://dzen.ru/embed/v4WbtwSiIg3A?from_block=partner&from=zen&mute=0&autoplay=1&tv=0" 
                      title="Бег после удаления мениска: Когда можно вернуться?"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0"
                      scrolling="no"
                      allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="/images/club/dzen-preview-2.jpg"
                        alt="Бег после удаления мениска: Когда можно вернуться?" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('v4WbtwSiIg3A')}
                        className="absolute inset-0 bg-yellow-500/20 group-hover:bg-yellow-500/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#fbbf24" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">Бег после удаления мениска: Когда можно вернуться?</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">В этом видео вы узнаете, когда и как безопасно возобновить тренировки после операции на колене, этапы реабилитации и упражнения для подготовки к бегу.</p>
                <a 
                  href="https://dzen.ru/video/watch/67c2a4e868fdde17122bfc54"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-xs transition-colors"
                >
                  <span>Смотреть на Дзен</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Видео 3 для Дзен */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[177.78%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['vDK7AGlo3oXY'] ? (
                    <iframe 
                      src="https://dzen.ru/embed/vDK7AGlo3oXY?from_block=partner&from=zen&mute=0&autoplay=1&tv=0" 
                      title="Как правильно разрабатывать колено"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0"
                      scrolling="no"
                      allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="/images/club/dzen-preview-3.jpg"
                        alt="Как правильно разрабатывать колено" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('vDK7AGlo3oXY')}
                        className="absolute inset-0 bg-yellow-500/20 group-hover:bg-yellow-500/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#fbbf24" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">Как правильно разрабатывать колено</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">Комплекс упражнений для правильного восстановления подвижности коленного сустава после операции или травмы. Основные принципы и техники восстановления функциональности колена.</p>
                <a 
                  href="https://dzen.ru/video/watch/67b053f8cc23306a7270cb39"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-xs transition-colors"
                >
                  <span>Смотреть на Дзен</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Видео 4 для Дзен - Офисная разминка */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="relative pb-[177.78%] h-0 overflow-hidden bg-gray-100">
                  {playingVideos['vOfisRazminka'] ? (
                    <iframe 
                      src="https://dzen.ru/embed/vOfisRazminka?from_block=partner&from=zen&mute=0&autoplay=1&tv=0" 
                      title="Офисная разминка"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      frameBorder="0"
                      scrolling="no"
                      allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image 
                        src="/images/club/dzen-preview-4.jpg"
                        alt="Офисная разминка" 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <button 
                        onClick={() => toggleVideo('vOfisRazminka')}
                        className="absolute inset-0 bg-yellow-500/20 group-hover:bg-yellow-500/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#fbbf24" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">Офисная разминка</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">Комплекс простых и эффективных упражнений для офисных работников. Помогает снять напряжение в шее и спине после долгого сидения за компьютером.</p>
                <a 
                  href="https://dzen.ru/id/646ca9d1fc7bc51b6ac77784"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-accent-dark font-medium text-xs transition-colors"
                >
                  <span>Смотреть на Дзен</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* FAQ */}
        <motion.div 
          className="mb-16" 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-8 text-center flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Часто задаваемые вопросы
            </h2>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
              {/* Декоративный элемент */}
              <div className="absolute -z-10 top-0 right-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-2xl transform translate-x-1/4 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full filter blur-2xl transform -translate-x-1/4 translate-y-1/2"></div>
              </div>
              
              <div className="p-1">
                {faqItems.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="border-b border-gray-100 last:border-b-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <button 
                      onClick={() => toggleQuestion(index)}
                      className="w-full px-6 py-4 text-left focus:outline-none flex justify-between items-center group"
                      aria-expanded={activeQuestion === index}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{item.question}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeQuestion === index ? 'bg-accent/10 rotate-180' : 'bg-gray-100'}`}>
                        <svg 
                          className={`w-5 h-5 ${activeQuestion === index ? 'text-accent' : 'text-gray-500'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </button>
                    <div 
                      id={`faq-answer-${index}`}
                      className={`overflow-hidden transition-all duration-300 ${
                        activeQuestion === index 
                          ? 'max-h-96 opacity-100 pb-6' 
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <motion.p 
                        className="px-6 text-gray-600 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: activeQuestion === index ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
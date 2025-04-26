import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero секция с фоном и текстом */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        <div className="absolute inset-0 opacity-15">
          <Image 
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1920&h=1080&auto=format&fit=crop" 
            alt="Физическая реабилитация" 
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{color: '#d1f3ea'}}>
                Физическая Реабилитация и Восстановление
              </h1>
              <p className="text-lg opacity-95 mb-8 font-medium" style={{color: '#d1f3ea'}}>
                Индивидуальный подход к реабилитации после травм и заболеваний. Профессиональная помощь в восстановлении движения и устранении боли.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/about"
                  className="btn bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-md font-medium transition-all"
                >
                  Узнать больше
                </Link>
                <Link 
                  href="/contacts"
                  className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition-all"
                >
                  Записаться
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-lg bg-accent/30 blur-md"></div>
                <Image 
                  src="/images/about/minenkov-main.jpg" 
                  alt="Миненков Вадим - физический реабилитолог" 
                  width={500}
                  height={500}
                  className="rounded-lg shadow-xl mx-auto relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Блок с преимуществами */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-6 lg:space-x-8">
            {/* Преимущество 1 */}
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow flex border border-gray-100 md:w-1/3">
              <div className="mr-4">
                <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">Экспертная Реабилитация</h3>
                <p className="text-dark">
                  Опыт работы более 8 лет с различными травмами и заболеваниями опорно-двигательного аппарата.
                </p>
              </div>
            </div>
            
            {/* Преимущество 2 */}
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow flex border border-gray-100 md:w-1/3">
              <div className="mr-4">
                <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">Индивидуальный Подход</h3>
                <p className="text-dark">
                  Программы реабилитации разрабатываются с учетом ваших особенностей, целей и образа жизни.
                </p>
              </div>
            </div>
            
            {/* Преимущество 3 */}
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow flex border border-gray-100 md:w-1/3">
              <div className="mr-4">
                <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">Удобный Формат</h3>
                <p className="text-dark">
                  Онлайн-консультации и программы позволяют получить помощь независимо от вашего местоположения.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* О нас и счетчики */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-base uppercase tracking-wider">О НАС</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3">
              Мы Предоставляем Качественную<br />Реабилитационную Помощь
            </h2>
            <div className="h-1 w-20 bg-accent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&h=600&auto=format&fit=crop" 
                  alt="Реабилитационный процесс" 
                  width={600}
                  height={450}
                  className="rounded-lg"
                />
                <div className="absolute top-0 right-0 bg-accent text-white font-bold py-2 px-4 rounded-bl-lg">
                  8+ лет опыта
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-dark text-lg mb-6">
                Существует множество вариаций травм и заболеваний, которые требуют профессионального подхода к реабилитации. Моя задача — помочь вам вернуться к полноценной жизни без боли и ограничений с помощью научно обоснованных методик и индивидуального подхода.
              </p>
              
              <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="flex items-center text-xl font-semibold text-primary mb-3">
                  <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center text-accent mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Доступные цены
                </h3>
                <p className="text-dark">
                  Качественная и профессиональная реабилитация по разумным ценам, с возможностью выбора формата работы под ваш бюджет.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="flex items-center text-xl font-semibold text-primary mb-3">
                  <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center text-accent mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  Проверенные методики
                </h3>
                <p className="text-dark">
                  Все рекомендации и программы основаны на современных научных данных и подтвержденных практикой методиках.
                </p>
              </div>
            </div>
          </div>
          
          {/* Статистика */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <p className="text-accent font-semibold">Довольных клиентов</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-accent font-semibold">Проведенных консультаций</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-accent font-semibold">Онлайн-программ</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">8+</div>
              <p className="text-accent font-semibold">Лет опыта</p>
            </div>
          </div>
        </div>
      </section>

      {/* Наши услуги */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-base uppercase tracking-wider">УСЛУГИ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3">
              Что Мы <span className="text-accent">Предлагаем</span> Для Наших<br />Клиентов
            </h2>
            <div className="h-1 w-20 bg-accent mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Услуга 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
              <div className="relative h-52">
                <Image 
                  src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?q=80&w=600&h=400&auto=format&fit=crop" 
                  alt="Онлайн-консультации" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <span className="font-semibold text-accent-light">Консультации</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-3">Онлайн-консультации</h3>
                <p className="text-dark mb-4">
                  Детальный анализ вашей проблемы, рекомендации и план действий в удобном онлайн-формате.
                </p>
                <Link 
                  href="/products" 
                  className="inline-block text-accent hover:text-accent-dark transition-colors font-medium"
                >
                  Подробнее
                </Link>
              </div>
            </div>
            
            {/* Услуга 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
              <div className="relative h-52">
                <Image 
                  src="/images/services/individual-programs.svg" 
                  alt="Индивидуальные программы" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <span className="font-semibold text-accent-light">Программы</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-3">Индивидуальные программы</h3>
                <p className="text-dark mb-4">
                  Персональные программы реабилитации и восстановления с учетом ваших особенностей и целей.
                </p>
                <Link 
                  href="/products" 
                  className="inline-block text-accent hover:text-accent-dark transition-colors font-medium"
                >
                  Подробнее
                </Link>
              </div>
            </div>
            
            {/* Услуга 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
              <div className="relative h-52">
                <Image 
                  src="/images/services/movement-analysis.svg"
                  alt="Анализ движения" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <span className="font-semibold text-accent-light">Анализ</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-3">Анализ движения</h3>
                <p className="text-dark mb-4">
                  Детальная оценка биомеханики вашего движения для выявления и исправления проблемных зон.
                </p>
                <Link 
                  href="/products" 
                  className="inline-block text-accent hover:text-accent-dark transition-colors font-medium"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Когда вам нужна помощь */}
      <section className="py-20 bg-primary/95 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8 leading-tight" style={{color: '#d1f3ea'}}>
                Когда Вам Нужна<br/>Реабилитационная Помощь?<br />
                <span className="text-accent-light">Я Всегда Рядом</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start bg-primary-dark/50 p-4 rounded-lg" style={{backgroundColor: 'rgba(209, 243, 234, 0.2)'}}>
                  <div className="bg-accent/20 p-2 rounded-lg mr-4" style={{backgroundColor: 'rgba(209, 243, 234, 0.3)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="#d1f3ea">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2" style={{color: '#d1f3ea'}}>Боли в спине и шее</h3>
                    <p className="text-white/90" style={{color: '#d1f3ea'}}>
                      Профессиональная помощь при острых и хронических болях в спине, шее и суставах.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start bg-primary-dark/50 p-4 rounded-lg" style={{backgroundColor: 'rgba(209, 243, 234, 0.2)'}}>
                  <div className="bg-accent/20 p-2 rounded-lg mr-4" style={{backgroundColor: 'rgba(209, 243, 234, 0.3)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="#d1f3ea">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2" style={{color: '#d1f3ea'}}>После травм и операций</h3>
                    <p className="text-white/90" style={{color: '#d1f3ea'}}>
                      Восстановление подвижности и функций после травм, переломов и хирургических вмешательств.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start bg-primary-dark/50 p-4 rounded-lg" style={{backgroundColor: 'rgba(209, 243, 234, 0.2)'}}>
                  <div className="bg-accent/20 p-2 rounded-lg mr-4" style={{backgroundColor: 'rgba(209, 243, 234, 0.3)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="#d1f3ea">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2" style={{color: '#d1f3ea'}}>Нарушения осанки</h3>
                    <p className="text-white/90" style={{color: '#d1f3ea'}}>
                      Коррекция осанки, устранение мышечного дисбаланса и улучшение биомеханики движений.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start bg-primary-dark/50 p-4 rounded-lg" style={{backgroundColor: 'rgba(209, 243, 234, 0.2)'}}>
                  <div className="bg-accent/20 p-2 rounded-lg mr-4" style={{backgroundColor: 'rgba(209, 243, 234, 0.3)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="#d1f3ea">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2" style={{color: '#d1f3ea'}}>Спортивные травмы</h3>
                    <p className="text-white/90" style={{color: '#d1f3ea'}}>
                      Восстановление после спортивных травм и разработка программ профилактики повторных повреждений.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-accent/20 blur"></div>
              <Image 
                src="https://images.unsplash.com/photo-1551292831-023188e78222?q=80&w=600&h=800&auto=format&fit=crop" 
                alt="Физическая реабилитация" 
                width={600}
                height={700}
                className="rounded-lg shadow-xl relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Готовы начать работу над своим здоровьем?
          </h2>
          <p className="text-lg text-dark mb-8 max-w-3xl mx-auto">
            Выберите подходящий формат работы и начните путь к восстановлению и здоровью
            уже сегодня. Я помогу вам достичь ваших целей.
          </p>
          <Link 
            href="/contacts"
            className="btn bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-md font-medium transition-all"
          >
            Записаться на консультацию
          </Link>
        </div>
      </section>
    </div>
  );
}

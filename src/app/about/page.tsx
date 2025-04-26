import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О нас | Физическая реабилитация | Миненков Вадим',
  description: 'Профессиональная физическая реабилитация с опытом более 8 лет. Индивидуальный подход к каждому пациенту, научно обоснованные методики.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero секция */}
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        <div className="absolute inset-0 opacity-15">
          <Image 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1920&h=800&auto=format&fit=crop" 
            alt="О реабилитологе" 
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            О <span className="text-accent-light">Специалисте</span>
          </h1>
          <p className="text-lg text-white opacity-95 mb-8 max-w-2xl mx-auto font-medium">
            Профессиональный подход к физической реабилитации с научно обоснованными методиками и индивидуальным подходом.
          </p>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 mb-10">
              <h2 className="text-3xl font-bold text-primary mb-6">Опыт и компетенции</h2>
              
              <p className="text-dark text-lg mb-4">
                <span className="font-semibold text-primary">Опыт работы более 8 лет</span> с различными травмами и заболеваниями опорно-двигательного аппарата.
              </p>
              
              <p className="text-dark text-lg mb-6">
                Программы реабилитации разрабатываются с учетом ваших особенностей, целей и образа жизни.
              </p>
              
              <div className="border-l-4 border-accent pl-6 my-8">
                <p className="text-dark text-lg italic">
                  Существует множество вариаций травм и заболеваний, которые требуют профессионального подхода к реабилитации. Моя задача — помочь вам вернуться к полноценной жизни без боли и ограничений с помощью научно обоснованных методик и индивидуального подхода.
                </p>
              </div>
              
              <p className="text-dark text-lg mb-4">
                Качественная и профессиональная реабилитация по разумным ценам, с возможностью выбора формата работы под ваш бюджет.
              </p>
              
              <p className="text-dark text-lg mb-6">
                Детальный анализ вашей проблемы, рекомендации и план действий в удобном онлайн-формате.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg my-8">
                <p className="text-lg text-dark font-medium">
                  Выберите подходящий формат работы и начните путь к восстановлению и здоровью уже сегодня. Я помогу вам достичь ваших целей.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-3xl font-bold text-primary mb-6">Доступные услуги</h2>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-accent-light rounded-full p-1 mt-1 mr-3">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Онлайн-консультации</h3>
                    <p className="text-dark">Детальный анализ вашей проблемы, функциональное тестирование и разработка стратегии восстановления.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-accent-light rounded-full p-1 mt-1 mr-3">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Программы реабилитации</h3>
                    <p className="text-dark">Индивидуальные программы с учетом ваших особенностей, направленные на достижение конкретных результатов.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-accent-light rounded-full p-1 mt-1 mr-3">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Личные тренировки</h3>
                    <p className="text-dark">Персональные тренировки под руководством специалиста с контролем техники выполнения.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-accent-light rounded-full p-1 mt-1 mr-3">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Анализ движения</h3>
                    <p className="text-dark">Детальный анализ биомеханики движений для выявления причин боли и дискомфорта.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-accent-light rounded-full p-1 mt-1 mr-3">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Курсы и вебинары</h3>
                    <p className="text-dark">Образовательные материалы для самостоятельной работы над своим здоровьем.</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-10 text-center">
                <Link 
                  href="/products" 
                  className="inline-block bg-primary hover:bg-primary-dark text-white py-3 px-8 rounded-md transition-colors"
                >
                  Посмотреть все услуги
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA секция */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Готовы начать свой путь к восстановлению?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-3xl mx-auto">
            Выберите подходящий формат работы и запишитесь на консультацию прямо сейчас.
            Я помогу вам вернуться к жизни без боли и ограничений.
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
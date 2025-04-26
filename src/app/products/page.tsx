import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Услуги физической реабилитации | Миненков Вадим',
  description: 'Полный спектр услуг по физической реабилитации: онлайн-консультации, индивидуальные программы, анализ движения и очные консультации.',
};

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero секция */}
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
        <div className="absolute inset-0 opacity-15">
          <Image 
            src="https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1920&h=800&auto=format&fit=crop" 
            alt="Услуги физической реабилитации" 
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Услуги <span className="text-accent-light">Физической</span> Реабилитации
          </h1>
          <p className="text-lg text-white opacity-95 mb-8 max-w-2xl mx-auto font-medium">
            Полный спектр услуг для восстановления вашего здоровья и возвращения к полноценной жизни без боли и ограничений.
          </p>
        </div>
      </section>

      {/* Основные услуги */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-base uppercase tracking-wider">НАШИ УСЛУГИ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3">
              Выберите Подходящий <span className="text-accent">Формат</span> Работы
            </h2>
            <div className="h-1 w-20 bg-accent mx-auto"></div>
          </div>

          <div className="flex flex-col space-y-8 md:space-y-8 lg:space-y-8">
            {/* Услуга 1 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <Image 
                    src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?q=80&w=600&h=800&auto=format&fit=crop" 
                    alt="Онлайн-консультация" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-full mb-3">
                    4 000 ₽
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">Онлайн-консультация</h3>
                  <p className="text-dark mb-4">
                    Индивидуальная онлайн-консультация по видеосвязи включает ознакомление с вашими исследованиями, 
                    сбор анамнеза и проведение функциональных тестов для оценки вашего состояния.
                  </p>
                  <div className="mb-5 space-y-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Длительность: 45-60 минут</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Определение стратегии и тактики тренировок</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Модуляция имеющейся активности</span>
                    </div>
                  </div>
                  <Link 
                    href="/contacts" 
                    className="inline-block bg-white hover:bg-gray-100 text-accent border border-accent py-2 px-6 rounded-md transition-colors"
                  >
                    Записаться
                  </Link>
                </div>
              </div>
            </div>

            {/* Услуга 2 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <Image 
                    src="/images/services/individual-programs.svg" 
                    alt="Онлайн-ведение" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-full mb-3">
                    20 000 ₽
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">Онлайн-ведение (1 месяц)</h3>
                  <p className="text-dark mb-4">
                    Месячное сопровождение с индивидуальным комплексом упражнений в видео формате с подробными инструкциями 
                    и постоянной поддержкой на каждом этапе реабилитации.
                  </p>
                  <div className="mb-5 space-y-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Индивидуальный комплекс упражнений</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Еженедельный созвон для корректировок</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Постоянная обратная связь</span>
                    </div>
                  </div>
                  <Link 
                    href="/contacts" 
                    className="inline-block bg-white hover:bg-gray-100 text-accent border border-accent py-2 px-6 rounded-md transition-colors"
                  >
                    Заказать
                  </Link>
                </div>
              </div>
            </div>

            {/* Услуга 3 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <Image 
                    src="/images/services/movement-analysis.svg" 
                    alt="Клуб ФОРМУЛА ДВИЖЕНИЯ" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-full mb-3">
                    2 950 ₽
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">Клуб &quot;ФОРМУЛА ДВИЖЕНИЯ&quot;</h3>
                  <p className="text-dark mb-4">
                    Закрытая группа в Телеграм для людей, кто хочет начинать правильно двигаться с учетом 
                    увеличения здоровья, делать это плавно и максимально бюджетно.
                  </p>
                  <div className="mb-5 space-y-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>3 разминки в неделю по 30 минут</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Доступ на 1 месяц</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Для профилактики и поддержания здоровья</span>
                    </div>
                  </div>
                  <Link 
                    href="/contacts" 
                    className="inline-block bg-white hover:bg-gray-100 text-accent border border-accent py-2 px-6 rounded-md transition-colors"
                  >
                    Присоединиться
                  </Link>
                </div>
              </div>
            </div>

            {/* Услуга 4 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <Image 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&h=800&auto=format&fit=crop" 
                    alt="Протокол реабилитации коленного сустава" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="inline-block px-3 py-1 bg-accent-light text-accent text-sm font-semibold rounded-full mb-3">
                    7 000 ₽
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">Протокол реабилитации коленного сустава</h3>
                  <p className="text-dark mb-4">
                    Подробная инструкция для самостоятельной реабилитации после резекции мениска, от первого дня 
                    после операции до возвращения к беговой активности.
                  </p>
                  <div className="mb-5 space-y-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>15 страниц подробных инструкций</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Видео тестовых упражнений</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Бессрочный доступ</span>
                    </div>
                  </div>
                  <Link 
                    href="/contacts" 
                    className="inline-block bg-white hover:bg-gray-100 text-accent border border-accent py-2 px-6 rounded-md transition-colors"
                  >
                    Приобрести
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Как проходит работа */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-base uppercase tracking-wider">ПРОЦЕСС</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3">
              Как Проходит <span className="text-accent">Работа</span> со Мной
            </h2>
            <div className="h-1 w-20 bg-accent mx-auto"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {/* Шаг 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
              <div className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8">
                1
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 mt-2">Первичная консультация</h3>
              <p className="text-dark">
                Подробное обсуждение вашей проблемы, анализ истории заболеваний, травм и образа жизни.
                Определение целей и ожиданий от работы.
              </p>
            </div>

            {/* Шаг 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
              <div className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8">
                2
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 mt-2">Диагностика и анализ</h3>
              <p className="text-dark">
                Оценка вашего состояния, выявление проблемных зон и причин дискомфорта.
                Анализ движения и биомеханики для точного диагноза.
              </p>
            </div>

            {/* Шаг 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
              <div className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8">
                3
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 mt-2">Составление плана</h3>
              <p className="text-dark">
                Разработка индивидуального плана реабилитации с учетом ваших особенностей,
                целей и возможностей для регулярных занятий.
              </p>
            </div>

            {/* Шаг 4 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
              <div className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8">
                4
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 mt-2">Реализация программы</h3>
              <p className="text-dark">
                Выполнение упражнений программы с подробными видео-инструкциями.
                Регулярная самостоятельная работа и отслеживание прогресса.
              </p>
            </div>

            {/* Шаг 5 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
              <div className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8">
                5
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 mt-2">Корректировка и поддержка</h3>
              <p className="text-dark">
                Регулярная обратная связь, корректировка программы при необходимости.
                Поддержка во время всего процесса реабилитации.
              </p>
            </div>

            {/* Шаг 6 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
              <div className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full text-xl font-bold absolute -top-6 left-8">
                6
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 mt-2">Закрепление результата</h3>
              <p className="text-dark">
                Оценка достигнутых результатов, рекомендации для поддержания
                эффекта и профилактики повторных проблем.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ секция */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-base uppercase tracking-wider">ВОПРОСЫ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-3">
              Часто Задаваемые <span className="text-accent">Вопросы</span>
            </h2>
            <div className="h-1 w-20 bg-accent mx-auto"></div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-3">Как проходит онлайн-консультация?</h3>
              <p className="text-dark">
                Онлайн-консультация проводится через Zoom или Skype. Заранее вы получаете анкету для заполнения, чтобы я мог подготовиться к встрече. Во время консультации мы обсуждаем вашу ситуацию, я провожу функциональное тестирование через видео и даю рекомендации. После консультации вы получаете запись сессии и первые рекомендации по упражнениям.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-3">Можно ли решить мою проблему онлайн?</h3>
              <p className="text-dark">
                Большинство проблем с опорно-двигательным аппаратом можно успешно решать в онлайн-формате. Современные технологии позволяют проводить детальный анализ движения и разрабатывать эффективные программы реабилитации дистанционно. При необходимости, я подскажу, когда стоит обратиться за очной помощью к специалистам в вашем городе.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-3">Сколько времени займет реабилитация?</h3>
              <p className="text-dark">
                Сроки реабилитации индивидуальны и зависят от характера проблемы, ее давности, вашей регулярности в выполнении рекомендаций и индивидуальных особенностей организма. Обычно первые улучшения становятся заметны через 2-4 недели регулярных занятий. Полное восстановление может занять от нескольких недель до нескольких месяцев.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-3">С какими проблемами вы работаете?</h3>
              <p className="text-dark">
                Я работаю с широким спектром проблем: боли в спине, шее, суставах; восстановление после травм и операций; нарушения осанки; спортивные травмы; синдромы мышечных перегрузок; подготовка к соревнованиям и восстановление после них. Если у вас есть сомнения, подходит ли ваша ситуация для работы со мной, просто напишите мне, и я отвечу на ваши вопросы.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-3">Нужно ли мне специальное оборудование?</h3>
              <p className="text-dark">
                Для большинства программ реабилитации специальное оборудование не требуется. Все упражнения разрабатываются с учетом доступных вам ресурсов. В базовой комплектации достаточно иметь коврик для упражнений и, возможно, эластичные ленты. Если какое-то оборудование необходимо, мы обсудим это в процессе консультации.
              </p>
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
            className="btn bg-white hover:bg-gray-100 text-accent border border-accent px-8 py-3 rounded-md font-medium transition-all"
          >
            Записаться на консультацию
          </Link>
        </div>
      </section>
    </div>
  );
} 
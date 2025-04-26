import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Отзывы | Миненков Rehab - Физическая реабилитация и лечебная физкультура',
  description: 'Ознакомьтесь с отзывами клиентов о методиках реабилитации, индивидуальном подходе и результатах лечения в центре Миненков Rehab.',
};

// Тип отзыва
interface Review {
  id: number;
  name: string;
  problem: string;
  text: string;
  date: string;
  rating?: number;
}

// Демо-данные отзывов
const reviews: Review[] = [
  {
    id: 1,
    name: 'Анна К.',
    problem: 'Восстановление после травмы колена',
    text: 'Вадим — настоящий профессионал своего дела. После разрыва ПКС я прошла курс реабилитации, и уже через 3 месяца смогла вернуться к обычной жизни. Индивидуальный подход и внимание к деталям — то, что меня впечатлило больше всего.',
    date: '15 марта 2023',
    rating: 5,
  },
  {
    id: 2,
    name: 'Дмитрий С.',
    problem: 'Хроническая боль в пояснице',
    text: 'Долгие годы страдал от болей в спине. После 8 занятий с Вадимом почувствовал значительное облегчение. Особенно ценно, что он не только работает с симптомами, но и находит первопричину проблемы.',
    date: '28 апреля 2023',
    rating: 5,
  },
  {
    id: 3,
    name: 'Елена В.',
    problem: 'Реабилитация после инсульта',
    text: 'Когда мой отец перенес инсульт, мы были в отчаянии. Вадим составил индивидуальную программу реабилитации, и прогресс превзошел все ожидания. Особенно ценны были рекомендации по домашним упражнениям.',
    date: '10 января 2023',
    rating: 5,
  },
  {
    id: 4,
    name: 'Сергей М.',
    problem: 'Коррекция осанки',
    text: 'Профессиональный спортсмен, и правильная осанка критически важна для моих результатов. Работа с Вадимом помогла не только исправить проблемы с осанкой, но и улучшить показатели в моем виде спорта.',
    date: '17 июня 2023',
    rating: 5,
  },
  {
    id: 5,
    name: 'Ольга П.',
    problem: 'Реабилитация после эндопротезирования',
    text: 'После операции по замене тазобедренного сустава была очень напугана. Вадим помог мне не только физически восстановиться, но и вернуть уверенность в своих движениях. Благодаря его методике я вернулась к полноценной жизни намного быстрее, чем ожидалось.',
    date: '23 мая 2023',
    rating: 5,
  },
  {
    id: 6,
    name: 'Александр К.',
    problem: 'Вертеброгенная цервикалгия',
    text: 'Шейные головные боли мучили меня годами. Перепробовал множество методов лечения без особого успеха. Вадим предложил комплексный подход, который дал результаты уже после третьего сеанса. Сейчас боли полностью ушли, а я научился правильно заботиться о своем теле.',
    date: '9 февраля 2023',
    rating: 5,
  },
];

// Функция для рендеринга звездочек рейтинга
const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      // Заполненная звезда для полного рейтинга
      stars.push(
        <svg 
          key={i} 
          className="w-5 h-5 text-[#B5D334]" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    } else {
      // Пустая звезда для недостающего рейтинга
      stars.push(
        <svg 
          key={i} 
          className="w-5 h-5 text-gray-300" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
  }
  return <div className="flex">{stars}</div>;
};

export default function ReviewsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero секция */}
      <section className="relative w-full h-[60vh] min-h-[400px] bg-[#3A7CA5] overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/images/services/reviews-hero.svg" 
            alt="Отзывы клиентов"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3A7CA5]/80 via-[#3A7CA5]/50 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Отзывы наших клиентов</h1>
          <p className="max-w-2xl text-xl text-white mb-8">
            Узнайте, как индивидуальные программы реабилитации помогли сотням людей вернуться к полноценной жизни.
          </p>
        </div>
      </section>

      {/* Секция с отзывами */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div 
              key={review.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#3A7CA5] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  {review.name.charAt(0)}
                </div>
                <div>
                    <h3 className="font-semibold text-xl text-[#333333]">{review.name}</h3>
                    <p className="text-sm text-[#333333]/70">{review.problem}</p>
                  </div>
                </div>
                
                {review.rating && (
                  <div className="mb-4">
                    {renderStars(review.rating)}
              </div>
                )}
              
                <p className="text-[#333333] mb-4">&quot;{review.text}&quot;</p>
              
                <div className="text-sm text-[#333333]/50 italic">
                {review.date}
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Секция со статистикой */}
      <section className="py-16 bg-[#3A7CA5] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-[#E0F2F8]">Довольных клиентов</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">98%</div>
              <p className="text-[#E0F2F8]">Положительных отзывов</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">4.9</div>
              <p className="text-[#E0F2F8]">Средний рейтинг</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">72%</div>
              <p className="text-[#E0F2F8]">Клиентов по рекомендации</p>
            </div>
          </div>
        </div>
      </section>

      {/* Секция "Поделитесь своей историей" */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-[#333333]">Поделитесь своей историей</h2>
          <p className="max-w-2xl mx-auto text-lg text-[#333333] mb-10">
            Ваш отзыв поможет другим людям принять важное решение о своем здоровье 
            и вдохновит их начать путь к восстановлению.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link 
              href="https://t.me/vadim_minenkov" 
            target="_blank" 
              className="inline-flex items-center justify-center px-6 py-3 bg-[#3A7CA5] text-white font-medium rounded-lg hover:bg-[#3A7CA5]/90 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.1 14.9l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z" />
              </svg>
              Написать в Telegram
            </Link>
            <Link 
              href="mailto:vadim@minenkovrehab.ru"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#E0F2F8] text-[#333333] font-medium rounded-lg hover:bg-[#E0F2F8]/80 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Отправить по email
            </Link>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="py-16 bg-gradient-to-r from-[#3A7CA5] to-[#3A7CA5]/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Начните свой путь к восстановлению сегодня</h2>
          <p className="max-w-2xl mx-auto text-xl mb-8">
            Присоединяйтесь к сотням довольных клиентов и сделайте первый шаг к здоровой, активной жизни.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center px-8 py-4 bg-[#B5D334] text-white font-bold rounded-lg hover:bg-[#B5D334]/90 transition-colors"
          >
            Записаться на консультацию
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
} 
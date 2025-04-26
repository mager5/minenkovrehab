'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Типы продуктов
interface Product {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string[];
  price: number;
  image: string;
}

// Демо-данные продуктов
const products: Product[] = [
  {
    id: 'consultation',
    title: 'Онлайн-консультация',
    shortDescription: 'Персональная 60-минутная консультация по видеосвязи с детальным анализом вашей ситуации и рекомендациями.',
    fullDescription: [
      'Комплексная 60-минутная консультация в формате видеосвязи.',
      'Детальный анализ вашей ситуации, текущих симптомов и ограничений.',
      'Выявление возможных причин проблемы и факторов, усугубляющих состояние.',
      'Разработка индивидуальных рекомендаций и стратегии восстановления.',
      'Ответы на все вопросы по вашему состоянию и реабилитации.',
      'Предварительно вам необходимо заполнить анкету о состоянии здоровья и прислать имеющиеся медицинские документы.',
    ],
    price: 3000,
    image: '/images/products/consultation.jpg',
  },
  {
    id: 'protocol-back',
    title: 'Протокол: Здоровая спина',
    shortDescription: 'Готовый протокол упражнений для лечения и профилактики болей в спине с видео-инструкциями.',
    fullDescription: [
      'Комплексный протокол упражнений, специально разработанный для лечения и профилактики болей в спине.',
      'Подробные видео-инструкции с объяснением техники выполнения каждого упражнения.',
      'Прогрессия нагрузки - от простых к более сложным упражнениям.',
      'Рекомендации по частоте и продолжительности тренировок.',
      'Доступ к материалам в течение 6 месяцев.',
      'Подходит для людей с хроническими болями в спине, после реабилитационного периода.',
    ],
    price: 2500,
    image: '/images/products/back-protocol.jpg',
  },
  {
    id: 'protocol-neck',
    title: 'Протокол: Шея без напряжения',
    shortDescription: 'Комплекс упражнений для снятия напряжения и болей в шейном отделе с подробными инструкциями.',
    fullDescription: [
      'Специализированный комплекс упражнений для снятия напряжения и болей в шейном отделе.',
      'Видео-инструкции с подробным объяснением техники выполнения.',
      'Рекомендации по эргономике рабочего места и повседневной активности.',
      'Техники самомассажа и релаксации для шейно-воротниковой зоны.',
      'Доступ к материалам в течение 6 месяцев.',
      'Идеально подходит для офисных работников и людей, испытывающих регулярные нагрузки на шейный отдел.',
    ],
    price: 2000,
    image: '/images/products/neck-protocol.jpg',
  },
  {
    id: 'personal-program',
    title: 'Индивидуальная программа',
    shortDescription: 'Персональная программа реабилитации на 4 недели с еженедельной корректировкой и поддержкой.',
    fullDescription: [
      'Полностью индивидуальная программа реабилитации, рассчитанная на 4 недели.',
      'Предварительная консультация для оценки вашего состояния и целей.',
      'Еженедельная корректировка программы в зависимости от вашего прогресса.',
      'Подробные видео-инструкции к каждому упражнению.',
      'Неограниченная поддержка через Telegram в течение месяца.',
      'Итоговая консультация с рекомендациями для дальнейшей самостоятельной работы.',
    ],
    price: 8000,
    image: '/images/products/personal-program.jpg',
  },
  {
    id: 'online-support',
    title: 'Онлайн-сопровождение (1 месяц)',
    shortDescription: 'Ежедневная поддержка и корректировка программы через Telegram в течение 30 дней.',
    fullDescription: [
      'Ежедневная поддержка через Telegram в течение 30 дней.',
      'Ответы на вопросы и консультации по выполнению упражнений.',
      'Корректировка программы в зависимости от вашего прогресса и ощущений.',
      'Видео-разборы техники выполнения упражнений по запросу.',
      'Мотивационная поддержка и контроль выполнения программы.',
      'Возможность продления сопровождения на следующий месяц со скидкой 20%.',
    ],
    price: 5000,
    image: '/images/products/online-support.jpg',
  },
];

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' });

  // Находим продукт по ID из URL
  const product = products.find(p => p.id === id);

  // Если продукт не найден, переадресуем на страницу со всеми продуктами
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-primary mb-4">Продукт не найден</h1>
        <p className="mb-6">Запрашиваемый продукт не существует или был удален.</p>
        <Link 
          href="/products"
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Вернуться к списку продуктов
        </Link>
      </div>
    );
  }

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  // Имитация процесса оплаты
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentProcessing(true);

    // Имитация API запроса на оплату
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Навигация */}
        <div className="mb-8">
          <Link href="/products" className="text-primary hover:underline">
            ← Вернуться к продуктам
          </Link>
        </div>

        {/* Содержимое страницы */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {paymentSuccess ? (
            <div className="text-center py-12">
              <div className="text-accent text-6xl mb-6 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">Спасибо за покупку!</h2>
              <p className="text-lg mb-8">
                Напишите мне в Telegram для получения материалов и инструкций:
              </p>
              <a 
                href="https://t.me/MV_Rehab" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                @MV_Rehab
              </a>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row">
              {/* Информация о продукте */}
              <div className="lg:w-2/3 lg:pr-8">
                <h1 className="text-3xl font-bold text-primary mb-4">{product.title}</h1>
                <div className="h-48 bg-secondary mb-6 relative flex items-center justify-center rounded-lg">
                  {/* Заглушка для изображения продукта */}
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary font-bold rounded-lg">
                    {product.title}
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-dark mb-4">Описание</h2>
                  <p className="text-dark mb-4">{product.shortDescription}</p>
                  <ul className="list-disc pl-5 space-y-2">
                    {product.fullDescription.map((item, index) => (
                      <li key={index} className="text-dark">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Форма оплаты */}
              <div className="lg:w-1/3 mt-8 lg:mt-0">
                <div className="bg-secondary p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-primary mb-4">Оформить заказ</h2>
                  <div className="text-2xl font-bold text-accent mb-6">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>

                  <form onSubmit={handlePayment}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-dark mb-2">Ваше имя</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactInfo.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-dark mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label htmlFor="phone" className="block text-dark mb-2">Телефон</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={contactInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className={`w-full py-3 rounded-md transition-colors ${
                        isPaymentProcessing 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-accent text-white hover:bg-accent/90'
                      }`}
                      disabled={isPaymentProcessing}
                    >
                      {isPaymentProcessing ? 'Обработка платежа...' : 'Оплатить'}
                    </button>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Нажимая кнопку, вы соглашаетесь с условиями <Link href="/terms" className="text-primary hover:underline">оферты</Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
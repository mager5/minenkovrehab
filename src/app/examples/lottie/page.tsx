'use client';

import React, { useState, useEffect } from 'react';
import LottieAnimation from '@/components/animations/LottieAnimation';
import Link from 'next/link';

// Создаем интерфейс для анимаций
interface AnimationExample {
  id: number;
  title: string;
  description: string;
  jsonData?: object;
}

// Создаем простые заглушки для демонстрации
const placeholderAnimation1 = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 400,
  h: 400,
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [50, 50], e: [100, 100] }, { t: 30, s: [100, 100], e: [50, 50] }, { t: 60, s: [50, 50] }] }
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          d: 1,
          nm: "Ellipse Path 1",
          mn: "ADBE Vector Shape - Ellipse"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.33, 0.45, 0.85, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill 1",
          mn: "ADBE Vector Graphic - Fill"
        }
      ]
    }
  ]
};

const placeholderAnimation2 = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 400,
  h: 400,
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Square",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [45] }, { t: 30, s: [45], e: [0] }, { t: 60, s: [0] }] },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [80, 80], e: [120, 120] }, { t: 30, s: [120, 120], e: [80, 80] }, { t: 60, s: [80, 80] }] }
      },
      shapes: [
        {
          ty: "rc",
          d: 1,
          s: { a: 0, k: [100, 100] },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 0 },
          nm: "Rectangle Path 1",
          mn: "ADBE Vector Shape - Rect"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.85, 0.33, 0.45, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill 1",
          mn: "ADBE Vector Graphic - Fill"
        }
      ]
    }
  ]
};

const placeholderAnimation3 = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 400,
  h: 400,
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Wave",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [200, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 1,
                k: [
                  {
                    i: { x: 0.833, y: 0.833 },
                    o: { x: 0.167, y: 0.167 },
                    t: 0,
                    s: [
                      { i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                       o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                       v: [[-100, 0], [-50, 30], [0, -30], [50, 30], [100, 0]]
                      }
                    ]
                  },
                  {
                    i: { x: 0.833, y: 0.833 },
                    o: { x: 0.167, y: 0.167 },
                    t: 30,
                    s: [
                      { i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                       o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                       v: [[-100, 0], [-50, -30], [0, 30], [50, -30], [100, 0]]
                      }
                    ]
                  },
                  {
                    i: { x: 0.833, y: 0.833 },
                    o: { x: 0.167, y: 0.167 },
                    t: 60,
                    s: [
                      { i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                       o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                       v: [[-100, 0], [-50, 30], [0, -30], [50, 30], [100, 0]]
                      }
                    ]
                  }
                ]
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group"
            },
            {
              ty: "st",
              c: { a: 0, k: [0.33, 0.65, 0.45, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 10 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: "Stroke 1",
              mn: "ADBE Vector Graphic - Stroke"
            }
          ],
          nm: "Shape 1",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group"
        }
      ]
    }
  ]
};

export default function LottieExamplesPage() {
  // Список примеров анимаций
  const animations: AnimationExample[] = [
    {
      id: 1,
      title: 'Физиотерапия',
      description: 'Анимация процесса физиотерапии для иллюстрации услуг',
      jsonData: placeholderAnimation1
    },
    {
      id: 2,
      title: 'Реабилитационные упражнения',
      description: 'Анимация упражнений для домашней реабилитации',
      jsonData: placeholderAnimation2
    },
    {
      id: 3,
      title: 'Анализ движения',
      description: 'Иллюстрация анализа движений для диагностики',
      jsonData: placeholderAnimation3
    }
  ];

  // Состояние для хранения JSON-данных анимаций
  const [animationData, setAnimationData] = useState<AnimationExample[]>([]);
  const [loading, setLoading] = useState(true);
  // Добавляем проверку на клиентском рендеринге
  const [isClient, setIsClient] = useState(false);

  // Устанавливаем флаг клиентского рендеринга при монтировании компонента
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Загружаем анимации при монтировании компонента
  useEffect(() => {
    // Загружаем анимации только на клиенте
    if (!isClient) return;
    
    // Используем локальные заглушки вместо загрузки с сервера
    setAnimationData(animations);
    setLoading(false);
  }, [isClient]);

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">Lottie Анимации</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Примеры использования векторных Lottie-анимаций для создания интерактивных и эффектных элементов интерфейса
          </p>
          <div className="h-1 w-20 bg-accent mx-auto mt-6"></div>
        </div>

        {!isClient || loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-xl text-primary">Загрузка анимаций...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {animationData.map((animation) => (
              <div 
                key={animation.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-4 h-64 bg-gray-100">
                  {animation.jsonData ? (
                    <LottieAnimation 
                      animationData={animation.jsonData}
                      loop={true}
                      autoplay={false}
                      playOnHover={true}
                      className="h-full"
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">Анимация не загрузилась</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{animation.title}</h3>
                  <p className="text-gray-700 mb-4">{animation.description}</p>
                  
                  <div className="flex space-x-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Hover</span> для проигрывания
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-primary mb-8">
            Преимущества использования Lottie-анимаций
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-primary mb-3">Легкий вес</h3>
              <p className="text-gray-700">
                JSON-файлы анимаций намного меньше по размеру, чем видео или GIF, что ускоряет загрузку страниц
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-primary mb-3">Интерактивность</h3>
              <p className="text-gray-700">
                Возможность управлять воспроизведением, скоростью и другими параметрами анимации через JavaScript
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-primary mb-3">Масштабируемость</h3>
              <p className="text-gray-700">
                Векторные анимации сохраняют качество при любом размере экрана и разрешении
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Link 
            href="/examples"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Вернуться к примерам
          </Link>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useCallback } from 'react';
import { HeyGenAvatar, AvatarControls, AvatarVideo } from '@/components/heygen';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, MessageCircle, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function AvatarPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    'd3eaed1ea1dd4766952e2fdbeb6bd0d4'
  );
  const [selectedVoice, setSelectedVoice] = useState(
    'bae2d9c6057d4c85a9ac8b4b76a9e874'
  );

  const handleSessionStart = useCallback(() => {
    setIsSessionActive(true);
  }, []);

  const handleSessionEnd = useCallback(() => {
    setIsSessionActive(false);
  }, []);

  const handleAvatarChange = useCallback((avatarId: string) => {
    setSelectedAvatar(avatarId);
  }, []);

  const handleVoiceChange = useCallback((voiceId: string) => {
    setSelectedVoice(voiceId);
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50'>
      {/* Заголовок */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-4'>
              <Link href='/'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='w-4 h-4' />
                  Назад
                </Button>
              </Link>
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>
                  AI Консультант
                </h1>
                <p className='text-sm text-gray-500'>
                  Виртуальный специалист по реабилитации
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Link href='/products/online-consultation'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2'
                >
                  <Calendar className='w-4 h-4' />
                  Записаться к врачу
                </Button>
              </Link>
              <Link href='/contacts'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2'
                >
                  <MessageCircle className='w-4 h-4' />
                  Контакты
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Основная область с аватаром */}
          <div className='lg:col-span-3'>
            <HeyGenAvatar
              avatarId={selectedAvatar}
              voiceId={selectedVoice}
              onSessionStart={handleSessionStart}
              onSessionEnd={handleSessionEnd}
              className='w-full'
            />
          </div>

          {/* Боковая панель с настройками */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Настройки аватара */}
            <AvatarControls
              onAvatarChange={handleAvatarChange}
              onVoiceChange={handleVoiceChange}
              className='w-full'
            />

            {/* Информационная карточка */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>О консультанте</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='text-sm text-gray-600'>
                  <p className='mb-2'>
                    Виртуальный AI-консультант обучен на базе знаний Центра
                    Миненкова и может помочь с:
                  </p>
                  <ul className='space-y-1 text-xs'>
                    <li>• Вопросами о реабилитации</li>
                    <li>• Информацией о услугах</li>
                    <li>• Рекомендациями по упражнениям</li>
                    <li>• Записью на консультацию</li>
                  </ul>
                </div>

                <div className='pt-3 border-t'>
                  <p className='text-xs text-gray-500'>
                    <strong>Важно:</strong> AI-консультант не заменяет
                    профессиональную медицинскую помощь. Для точной диагностики
                    обратитесь к специалисту.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Link href='/products/online-consultation' className='block'>
                  <Button className='w-full justify-start' variant='outline'>
                    <Phone className='w-4 h-4 mr-2' />
                    Записаться на консультацию
                  </Button>
                </Link>

                <Link href='/products' className='block'>
                  <Button className='w-full justify-start' variant='outline'>
                    <MessageCircle className='w-4 h-4 mr-2' />
                    Посмотреть услуги
                  </Button>
                </Link>

                <Link href='/about' className='block'>
                  <Button className='w-full justify-start' variant='outline'>
                    <MessageCircle className='w-4 h-4 mr-2' />О центре
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Статус сессии */}
            {isSessionActive && (
              <Card className='border-green-200 bg-green-50'>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-2 text-green-700'>
                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                    <span className='text-sm font-medium'>Сессия активна</span>
                  </div>
                  <p className='text-xs text-green-600 mt-1'>
                    Консультант готов отвечать на ваши вопросы
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <MessageCircle className='w-6 h-6 text-blue-600' />
                </div>
                <h3 className='font-semibold mb-2'>Круглосуточно</h3>
                <p className='text-sm text-gray-600'>
                  AI-консультант доступен 24/7 для ответов на ваши вопросы
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Phone className='w-6 h-6 text-green-600' />
                </div>
                <h3 className='font-semibold mb-2'>Персонализация</h3>
                <p className='text-sm text-gray-600'>
                  Получите рекомендации, адаптированные под ваши потребности
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Calendar className='w-6 h-6 text-purple-600' />
                </div>
                <h3 className='font-semibold mb-2'>Запись к врачу</h3>
                <p className='text-sm text-gray-600'>
                  Легко записывайтесь на консультацию к реальным специалистам
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
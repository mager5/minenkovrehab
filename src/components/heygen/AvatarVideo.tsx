'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface AvatarVideoProps {
  stream?: MediaStream;
  isLoading?: boolean;
  isConnected?: boolean;
  onFullscreen?: () => void;
  className?: string;
}

export default function AvatarVideo({
  stream,
  isLoading = false,
  isConnected = false,
  onFullscreen,
  className = '',
}: AvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Обновление видео потока
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(error => {
          console.error('Error playing video:', error);
          setVideoError(true);
        });
      };
      setVideoError(false);
    }
  }, [stream]);

  // Обработка полноэкранного режима
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    onFullscreen?.();
  };

  // Перезапуск видео
  const restartVideo = () => {
    if (videoRef.current && stream) {
      videoRef.current.load();
      videoRef.current.play().catch(error => {
        console.error('Error restarting video:', error);
      });
      setVideoError(false);
    }
  };

  // Слушатель изменения полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const renderPlaceholder = () => {
    if (isLoading) {
      return (
        <div className='flex flex-col items-center justify-center h-full text-gray-500'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4'></div>
          <p className='text-lg font-medium'>Загрузка аватара...</p>
          <p className='text-sm'>Подождите, идет подключение</p>
        </div>
      );
    }

    if (videoError) {
      return (
        <div className='flex flex-col items-center justify-center h-full text-gray-500'>
          <div className='text-red-500 mb-4'>
            <svg
              className='w-16 h-16'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <p className='text-lg font-medium mb-2'>Ошибка воспроизведения</p>
          <Button onClick={restartVideo} variant='outline' size='sm'>
            <RotateCcw className='w-4 h-4 mr-2' />
            Попробовать снова
          </Button>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div className='flex flex-col items-center justify-center h-full text-gray-500'>
          <div className='w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4'>
            <svg
              className='w-12 h-12 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </div>
          <p className='text-lg font-medium mb-2'>AI Консультант</p>
          <p className='text-sm text-center max-w-xs'>
            Нажмите &quot;Начать консультацию&quot; для подключения к
            виртуальному специалисту
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className='relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200'>
        {/* Видео */}
        {stream && !videoError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={false}
            className='w-full h-full object-cover'
            onError={() => setVideoError(true)}
          />
        ) : (
          renderPlaceholder()
        )}

        {/* Индикатор подключения */}
        {isConnected && (
          <div className='absolute top-4 left-4'>
            <div className='flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm'>
              <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
              Подключено
            </div>
          </div>
        )}

        {/* Кнопки управления */}
        {stream && !videoError && (
          <div className='absolute top-4 right-4 flex gap-2'>
            <Button
              variant='secondary'
              size='sm'
              onClick={toggleFullscreen}
              className='bg-black/20 hover:bg-black/40 text-white border-0'
            >
              {isFullscreen ? (
                <Minimize2 className='w-4 h-4' />
              ) : (
                <Maximize2 className='w-4 h-4' />
              )}
            </Button>
          </div>
        )}

        {/* Градиент снизу для лучшей читаемости */}
        {stream && !videoError && (
          <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none' />
        )}
      </div>

      {/* Информация о статусе */}
      {isConnected && stream && !videoError && (
        <div className='absolute bottom-4 left-4 right-4'>
          <div className='bg-black/50 text-white px-3 py-2 rounded text-sm backdrop-blur-sm'>
            <p className='font-medium'>Готов к общению</p>
            <p className='text-xs opacity-80'>
              Задайте ваш вопрос в поле ниже или используйте голосовой ввод
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

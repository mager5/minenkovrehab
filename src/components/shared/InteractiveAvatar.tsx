'use client';

import { useEffect, useRef, useState } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
} from '@heygen/streaming-avatar';

/**
 * Компонент Interactive Avatar от HeyGen
 * Использует современный SDK для интерактивного общения с AI аватаром
 */
export default function InteractiveAvatar() {
  const [streamingAvatar, setStreamingAvatar] =
    useState<StreamingAvatar | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Токен доступа (в реальном проекте должен быть получен с сервера)
  const ACCESS_TOKEN =
    'MWI0YzBhMjExYTRlNDBjM2E1YzU1NTVjNjhiYmY5MjUtMTc1MjI3MDU0NQ==';

  // Инициализация аватара
  const initializeAvatar = async () => {
    if (isSessionActive || isLoading) return;

    setIsLoading(true);

    try {
      const avatar = new StreamingAvatar({ token: ACCESS_TOKEN });

      // Настройка событий
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('Avatar started talking');
      });

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('Avatar stopped talking');
      });

      avatar.on(StreamingEvents.STREAM_READY, event => {
        console.log('Stream ready:', event);
        if (videoRef.current && event.detail.stream) {
          videoRef.current.srcObject = event.detail.stream;
          mediaStreamRef.current = event.detail.stream;
        }
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setIsSessionActive(false);
        setIsExpanded(false);
      });

      // Создание сессии
      const sessionInfo = await avatar.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: 'd3eaed1ea1dd476695e2fdbeb6bd0d4', // ID аватара из старого виджета
        knowledgeId: 'effb97816c314abaae7c8e667363d07', // ID базы знаний из старого виджета
        voice: {
          voiceId: 'default',
          rate: 1.0,
        },
        language: 'ru',
        activityIdleTimeout: 300, // 5 минут
      });

      console.log('Session created:', sessionInfo);
      setStreamingAvatar(avatar);
      setIsSessionActive(true);
      setIsExpanded(true);
    } catch (error) {
      console.error('Failed to initialize avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Остановка сессии
  const stopSession = async () => {
    if (streamingAvatar && isSessionActive) {
      try {
        await streamingAvatar.stopAvatar();
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        setStreamingAvatar(null);
        setIsSessionActive(false);
        setIsExpanded(false);
      } catch (error) {
        console.error('Failed to stop session:', error);
      }
    }
  };

  // Отправка текстового сообщения
  const sendMessage = async () => {
    if (streamingAvatar && inputText.trim()) {
      try {
        await streamingAvatar.speak({
          text: inputText.trim(),
          task_type: TaskType.TALK,
        });
        setInputText('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  // Переключение голосового чата
  const toggleVoiceChat = async () => {
    if (!streamingAvatar) return;

    try {
      if (isListening) {
        await streamingAvatar.closeVoiceChat();
        setIsListening(false);
      } else {
        await avatar.startVoiceChat({});
        setIsListening(true);
      }
    } catch (error) {
      console.error('Failed to toggle voice chat:', error);
    }
  };

  // Показать виджет через 3 секунды после загрузки
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <>
      {/* Основной виджет */}
      <div
        className={`
          fixed z-[9999] transition-all duration-300 ease-in-out
          ${
            isExpanded
              ? 'right-4 bottom-4 w-96 h-80 md:w-[500px] md:h-96 rounded-xl border-2'
              : 'right-5 bottom-5 w-16 h-16 rounded-full border-2 cursor-pointer hover:scale-110'
          }
          ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
          border-[#2baa7e] bg-white shadow-lg shadow-[#2baa7e]/30
          ${!isExpanded && !isSessionActive ? 'animate-pulse' : ''}
        `}
        onClick={!isExpanded ? initializeAvatar : undefined}
      >
        {!isExpanded ? (
          // Компактный вид - кнопка запуска
          <div className='w-full h-full bg-gradient-to-br from-[#2baa7e] to-[#1e8b5c] rounded-full flex items-center justify-center'>
            {isLoading ? (
              <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin' />
            ) : (
              <svg
                className='w-8 h-8 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4L5 20l.94-5.66a8.003 8.003 0 010-8.68L5 4l1 4a8.013 8.013 0 017-4c4.418 0 8 3.582 8 8z'
                />
              </svg>
            )}
          </div>
        ) : (
          // Развернутый вид - интерфейс чата
          <div className='w-full h-full flex flex-col'>
            {/* Заголовок */}
            <div className='flex items-center justify-between p-3 border-b border-gray-200'>
              <h3 className='font-semibold text-gray-800'>AI Ассистент</h3>
              <button
                onClick={stopSession}
                className='text-gray-500 hover:text-gray-700 transition-colors'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            {/* Видео аватара */}
            <div className='flex-1 bg-gray-100 relative'>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className='w-full h-full object-cover'
              />
              {!isSessionActive && (
                <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
                  <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-[#2baa7e] border-t-transparent rounded-full animate-spin mx-auto mb-2' />
                    <p className='text-sm text-gray-600'>
                      Подключение к аватару...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Панель управления */}
            {isSessionActive && (
              <div className='p-3 border-t border-gray-200'>
                {/* Текстовый ввод */}
                <div className='flex gap-2 mb-2'>
                  <input
                    type='text'
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder='Введите сообщение...'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2baa7e] focus:border-transparent'
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim()}
                    className='px-4 py-2 bg-[#2baa7e] text-white rounded-lg text-sm font-medium hover:bg-[#1e8b5c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    Отправить
                  </button>
                </div>

                {/* Кнопка голосового чата */}
                <button
                  onClick={toggleVoiceChat}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isListening
                    ? '🔴 Остановить голосовой чат'
                    : '🎤 Начать голосовой чат'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

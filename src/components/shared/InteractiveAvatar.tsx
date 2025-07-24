'use client';

import { useEffect, useRef, useState } from 'react';
// Dynamic import will be used in useEffect

/**
 * Компонент Interactive Avatar от HeyGen
 * Использует современный SDK для интерактивного общения с AI аватаром
 */
export default function InteractiveAvatar() {
  const [streamingAvatar, setStreamingAvatar] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [StreamingAvatarClass, setStreamingAvatarClass] = useState<any>(null);
  const [constants, setConstants] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Получение токена с сервера
  const getAccessToken = async () => {
    try {
      const response = await fetch('/api/heygen/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarId: process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || 'd3eaed1ea1dd4766952e2fdbeb6bd0d4',
          voiceId: process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID || 'bae2d9c6057d4c85a9ac8b4b76a9e874'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      
      // Проверяем что data не null и не undefined
      if (!data) {
        console.error('Token response is null or undefined:', data);
        throw new Error('Token response is null or undefined');
      }
      
      // Проверяем наличие токена в ответе
      if (!data.token) {
        console.error('Token not found in response:', data);
        throw new Error('Token not found in API response');
      }
      
      return data.token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  // Получение списка доступных аватаров
  const getAvailableAvatars = async () => {
    try {
      const response = await fetch('/api/heygen/avatars');
      if (!response.ok) {
        throw new Error('Failed to fetch avatars');
      }
      const data = await response.json();
      return data.avatars || [];
    } catch (error) {
      console.error('Error fetching avatars:', error);
      // Возвращаем список известных рабочих аватаров как fallback
      return [
        { avatar_id: 'Tyler-insuit-20220721', pose_name: 'Tyler' },
        { avatar_id: 'Anna_public_3_20240108', pose_name: 'Anna' },
        { avatar_id: 'Kristin_public_3_20240108', pose_name: 'Kristin' }
      ];
    }
  };

  // Инициализация аватара
  const initializeAvatar = async () => {
    if (isSessionActive || isLoading) return;

    setIsLoading(true);

    try {
      // Динамический импорт HeyGen SDK
      let currentStreamingAvatarClass = StreamingAvatarClass;
      let currentConstants = constants;
      
      if (!currentStreamingAvatarClass) {
        const { default: StreamingAvatar, StreamingEvents, AvatarQuality, VoiceEmotion, TaskType, TaskMode } = await import('@heygen/streaming-avatar');
        currentStreamingAvatarClass = StreamingAvatar;
        currentConstants = { StreamingEvents, AvatarQuality, VoiceEmotion, TaskType, TaskMode };
        setStreamingAvatarClass(currentStreamingAvatarClass);
        setConstants(currentConstants);
      }

      // Получаем список доступных аватаров
      const availableAvatars = await getAvailableAvatars();
      console.log('📋 Available avatars:', availableAvatars);
      
      // Выбираем первый доступный аватар
      const selectedAvatar = availableAvatars[0];
      if (!selectedAvatar) {
        throw new Error('No avatars available');
      }
      
      console.log('🎭 Selected avatar:', selectedAvatar);

      // Получаем токен с сервера
      const accessToken = await getAccessToken();
      
      // Проверяем валидность токена
      if (!accessToken || accessToken === null || accessToken === undefined || accessToken === '') {
        console.error('Invalid access token received:', accessToken);
        throw new Error('Failed to get valid access token');
      }
      
      console.log('Creating avatar with access token:', accessToken);
      
      // Создаем экземпляр StreamingAvatar с токеном
      const avatar = new currentStreamingAvatarClass({
        token: accessToken,
        debug: true, // 💡 включаем лог всех запросов
      });

      // Настройка событий
      avatar.on(currentConstants.StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('Avatar started talking');
      });

      avatar.on(currentConstants.StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('Avatar stopped talking');
      });

      avatar.on(currentConstants.StreamingEvents.STREAM_READY, (event: any) => {
        console.log('Stream ready:', event);
        if (videoRef.current && event.detail.stream) {
          videoRef.current.srcObject = event.detail.stream;
          mediaStreamRef.current = event.detail.stream;
        }
      });

      avatar.on(currentConstants.StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setIsSessionActive(false);
        setIsExpanded(false);
      });

      // 🔧 МИНИМАЛЬНАЯ ВЕРСИЯ для изоляции проблемы
      console.log('👉 Sending to createStartAvatar:', {
        avatarName: 'd3eaed1ea1dd4766952e2fdbeb6bd0d4',
        voiceId: 'bae2d9c6057d4c85a9ac8b4b76a9e874'
      });
      
      // ✅ Используем первый доступный аватар из списка
      const sessionInfo = await avatar.createStartAvatar({
        avatarName: selectedAvatar.avatar_id,
        quality: currentConstants.AvatarQuality.Low
      });

      console.log('✅ Session created successfully:', sessionInfo);
      setStreamingAvatar(avatar);
      setIsSessionActive(true);
      setIsExpanded(true);
    } catch (error: any) {
      console.error('❌ Failed to initialize avatar:', error);
      
      // 💡 ДИАГНОСТИКА: Детальный анализ ошибки
      if (error?.response) {
        console.error('📊 Response status:', error.response.status);
        console.error('📊 Response headers:', error.response.headers);
        
        // Пытаемся получить тело ответа
        try {
          const responseBody = await error.response.json();
          console.error('📊 Response body:', responseBody);
          
          if (responseBody?.message) {
            console.error('💬 API Error message:', responseBody.message);
          }
        } catch (jsonError) {
          console.error('📊 Could not parse response body as JSON:', jsonError);
          console.error('📊 Raw response:', error.response);
        }
      }
      
      // Проверяем специфичные ошибки
      if (error?.message?.includes('400')) {
        console.error('🚨 HTTP 400 Error - возможные причины:');
        console.error('  - Неверный avatar_id или voice_id');
        console.error('  - Несовместимость голоса с аватаром');
        console.error('  - Проблемы с токеном или правами доступа');
      }
      
      console.error('🔍 Full error object:', JSON.stringify(error, null, 2));
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
    if (streamingAvatar && inputText.trim() && constants) {
      try {
        await streamingAvatar.speak({
          text: inputText.trim(),
          task_type: constants.TaskType.TALK,
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
        await streamingAvatar.startVoiceChat({});
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

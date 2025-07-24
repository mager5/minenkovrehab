'use client';

import { useEffect, useRef, useState } from 'react';

export default function Avatar2Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamingAvatar, setStreamingAvatar] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

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
  const startSession = async () => {
    if (isSessionActive || isLoading) return;

    setIsLoading(true);

    try {
      // Динамический импорт HeyGen SDK
      const { default: StreamingAvatar, StreamingEvents, AvatarQuality, VoiceEmotion, TaskType, TaskMode } = await import('@heygen/streaming-avatar');

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

      // Создаем экземпляр StreamingAvatar
      const avatar = new StreamingAvatar({
        token: accessToken,
      });
      
      console.log('🔑 Создан StreamingAvatar с токеном:', accessToken.substring(0, 20) + '...');

      // Настройка событий
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('Avatar started talking');
      });

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('Avatar stopped talking');
      });

      avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
        console.log('Stream ready:', event);
        if (videoRef.current && event.detail.stream) {
          videoRef.current.srcObject = event.detail.stream;
          videoRef.current.play();
        }
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setIsSessionActive(false);
      });

      // 🔧 ИСПОЛЬЗУЕМ ПЕРВЫЙ ДОСТУПНЫЙ АВАТАР из API (как в рабочем примере)
      console.log('👉 Sending to createStartAvatar:', {
        avatarName: selectedAvatar.avatar_id,
        quality: 'Low'
      });
      
      // ✅ Используем первый доступный аватар из списка
      const sessionInfo = await avatar.createStartAvatar({
        avatarName: selectedAvatar.avatar_id,
        quality: AvatarQuality.Low
      });

      console.log('✅ Session created successfully:', sessionInfo);
      setStreamingAvatar(avatar);
      setIsSessionActive(true);
      
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
      alert('Ошибка при запуске аватара: ' + (error?.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  // Остановка сессии
  const stopSession = async () => {
    if (streamingAvatar && isSessionActive) {
      try {
        await streamingAvatar.stopAvatar();
        setStreamingAvatar(null);
        setIsSessionActive(false);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      } catch (error) {
        console.error('Error stopping session:', error);
      }
    }
  };

  // Отправка текста аватару
  const sendMessage = async () => {
    if (!streamingAvatar || !inputText.trim()) return;

    try {
      await streamingAvatar.speak({ text: inputText });
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Переключение режима прослушивания
  const toggleListening = async () => {
    if (!streamingAvatar) return;

    try {
      if (isListening) {
        await streamingAvatar.stopListening();
      } else {
        await streamingAvatar.startListening();
      }
      setIsListening(!isListening);
    } catch (error) {
      console.error('Error toggling listening:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          HeyGen Avatar Demo - Автовыбор аватара
        </h1>
        
        {/* Видео контейнер */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={false}
            />
          </div>
          
          {/* Статус */}
          <div className="text-center mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isSessionActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isLoading ? 'Загрузка...' : isSessionActive ? 'Активна' : 'Не активна'}
            </span>
          </div>

          {/* Кнопки управления */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={startSession}
              disabled={isSessionActive || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Запуск...' : 'Запустить'}
            </button>
            
            <button
              onClick={stopSession}
              disabled={!isSessionActive}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Остановить
            </button>
            
            <button
              onClick={toggleListening}
              disabled={!isSessionActive}
              className={`px-6 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isListening ? 'Остановить прослушивание' : 'Начать прослушивание'}
            </button>
          </div>
        </div>

        {/* Панель ввода текста */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Отправить сообщение</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Введите текст для аватара..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isSessionActive}
            />
            
            <button
              onClick={sendMessage}
              disabled={!isSessionActive || !inputText.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Нажмите "Запустить" чтобы начать сессию с аватаром Анна
          </p>
        </div>
      </div>
    </div>
  );
}
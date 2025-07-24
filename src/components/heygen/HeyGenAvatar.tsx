'use client';

import { useEffect, useRef, useState } from 'react';

// Интерфейс для пропсов компонента
interface HeyGenAvatarProps {
  avatarId?: string;
  voiceId?: string;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  className?: string;
}

export default function HeyGenAvatar({ 
  avatarId, 
  voiceId, 
  onSessionStart, 
  onSessionEnd, 
  className 
}: HeyGenAvatarProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>('');

  // ❗️ ВАЖНО: Используем Vite приложение вместо проблемного Next.js компонента
  const viteAppUrl = 'http://localhost:3001';



  useEffect(() => {
    // Уведомляем родительский компонент о начале сессии
    if (onSessionStart) {
      onSessionStart();
    }

    // Обработчик загрузки iframe
    const handleIframeLoad = () => {
      setIsLoaded(true);
      setError('');
      console.log('✅ Vite приложение с HeyGen аватаром загружено');
    };

    // Обработчик ошибки загрузки
    const handleIframeError = () => {
      setError('Не удалось загрузить AI консультанта. Проверьте, что Vite сервер запущен на порту 3001.');
      console.error('❌ Ошибка загрузки Vite приложения');
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);

      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
        if (onSessionEnd) {
          onSessionEnd();
        }
      };
    }
  }, [onSessionStart, onSessionEnd]);

  if (error) {
    return (
      <div className={`w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg ${className || ''}`}>
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">⚠️</div>
          <h3 className="font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-96 relative ${className || ''}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Загрузка AI консультанта...</p>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={viteAppUrl}
        className="w-full h-full rounded-lg border-0"
        title="HeyGen AI Avatar"
        allow="camera; microphone; autoplay; encrypted-media"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        style={{ display: isLoaded ? 'block' : 'none' }}
      />
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';

// Типы для HeyGen SDK
interface StreamingAvatarConfig {
  token: string;
  video: HTMLVideoElement;
  debug?: boolean;
}

interface AvatarConfig {
  avatarName: string;
  quality: any; // AvatarQuality enum from HeyGen SDK
  voice: {
    voiceId: string;
    rate: number;
  };
  language: string;
}

interface SpeakConfig {
  text: string;
  task_type: string;
}

export default function HeyGenAvatar() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamingAvatar, setStreamingAvatar] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('Disconnected');
  const [message, setMessage] = useState<string>('Привет! Как дела?');

  // Конфигурация из переменных окружения
  const avatarId = import.meta.env.VITE_HEYGEN_AVATAR_ID || 'd3eaed1ea1dd4766952e2fdbeb6bd0d4';
  const voiceId = import.meta.env.VITE_HEYGEN_VOICE_ID || 'bae2d9c6057d4c85a9ac8b4b76a9e874';
  
  // Функция для получения токена напрямую от HeyGen API
  const getHeyGenToken = async (): Promise<string> => {
    // В реальном приложении API ключ должен быть на бэкенде!
    // Это только для демонстрации в Vite
    const apiKey = import.meta.env.VITE_HEYGEN_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_HEYGEN_API_KEY не настроен в .env файле');
    }
    
    try {
      console.log('🔑 Получение токена HeyGen...');
      
      const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ HeyGen API Error:', data);
        throw new Error(`HeyGen API Error (${response.status}): ${data.message || 'Unknown error'}`);
      }
      
      if (!data.data || !data.data.token) {
        throw new Error('Токен не найден в ответе API');
      }
      
      console.log('✅ Токен получен успешно');
      return data.data.token;
    } catch (error: any) {
      console.error('❌ Ошибка получения токена HeyGen:', error);
      throw new Error(`Не удалось получить токен HeyGen: ${error.message}`);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setStatus('Connecting...');
        setError('');
        
        // Получаем токен
        const token = await getHeyGenToken();
        
        if (!token) {
          throw new Error('Не удалось получить токен HeyGen. Проверьте API ключ.');
        }
        
        // Проверяем video element
        if (!videoRef.current) {
          console.error('Video element not ready');
          return;
        }

        console.log('Initializing HeyGen Avatar...');
        console.log('Avatar ID:', avatarId);
        console.log('Voice ID:', voiceId);

        // Динамический импорт HeyGen SDK
        const { default: StreamingAvatar, StreamingEvents, AvatarQuality, TaskType } = await import('@heygen/streaming-avatar');

        // Создаем StreamingAvatar
        const avatar = new StreamingAvatar({
          token,
          video: videoRef.current,
          debug: true,
        } as StreamingAvatarConfig);

        // Настройка событий
        avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
          console.log('✅ Stream ready:', event);
          setStatus('Connected');
          if (videoRef.current && event.detail.stream) {
            videoRef.current.srcObject = event.detail.stream;
          }
        });

        avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
          console.log('⚠️ Stream disconnected');
          setIsConnected(false);
          setStatus('Disconnected');
        });

        avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
          console.log('🗣️ Avatar started talking');
          setRecording(true);
        });

        avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
          console.log('🤐 Avatar stopped talking');
          setRecording(false);
        });

        // Конфигурация аватара
        const avatarConfig: AvatarConfig = {
          avatarName: avatarId,
          quality: AvatarQuality.Low,
          voice: {
            voiceId: voiceId,
            rate: 1.0,
          },
          language: 'ru'
        };
        
        console.log('Creating avatar with config:', avatarConfig);
        
        // Создаем и запускаем аватар
        await avatar.createStartAvatar(avatarConfig);
        console.log('✅ Avatar created successfully!');
        
        setStreamingAvatar(avatar);
        setIsConnected(true);
        setStatus('Connected');
        
      } catch (error: any) {
        console.error('🚨 Error creating avatar:', error);
        setError(error.message || 'Ошибка при создании аватара');
        setStatus('Error');
      }
    };

    init();

    return () => {
      if (streamingAvatar) {
        streamingAvatar.stop();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!streamingAvatar || !message.trim()) return;
    
    try {
      setRecording(true);
      
      // Импортируем константы для использования в методе speak
      const { TaskType } = await import('@heygen/streaming-avatar');
      
      await streamingAvatar.speak({
        text: message,
        task_type: TaskType.TALK
      } as SpeakConfig);
      
      console.log('✅ Message sent:', message);
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      setError(error.message || 'Ошибка при отправке сообщения');
    }
  };

  const handleStop = async () => {
    if (!streamingAvatar) return;
    
    try {
      await streamingAvatar.interrupt();
      setRecording(false);
      console.log('✅ Avatar interrupted');
    } catch (error: any) {
      console.error('❌ Failed to interrupt avatar:', error);
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'Connected': return 'status connected';
      case 'Connecting...': return 'status connecting';
      case 'Error': return 'status disconnected';
      default: return 'status disconnected';
    }
  };

  return (
    <div className="container">
      <div className="avatar-container">
        <h1>HeyGen Avatar - Vite Version</h1>
        
        <div className={getStatusClass()}>
          Статус: {status}
        </div>
        
        {error && (
          <div className="error">
            Ошибка: {error}
          </div>
        )}
        
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
          />
        </div>
        
        <div className="controls">
          <div className="input-group">
            <label htmlFor="message">Сообщение для аватара:</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите текст для произношения..."
              disabled={!isConnected}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSend}
              disabled={!isConnected || recording || !message.trim()}
              className="button"
            >
              {recording ? 'Говорит...' : 'Отправить'}
            </button>
            
            {recording && (
              <button
                onClick={handleStop}
                className="button danger"
              >
                Остановить
              </button>
            )}
          </div>
        </div>
        
        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '20px' }}>
          <p><strong>Примечание:</strong> Для работы требуется настроить API ключ HeyGen в коде.</p>
          <p>В production версии API ключ должен быть на бэкенде, а не в клиентском коде!</p>
        </div>
      </div>
    </div>
  );
}
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Bot } from 'lucide-react';

const HeyGenWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Стили для виджета */}
      <style jsx>{`
        .heygen-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2baa7e 0%, #1e8b5c 100%);
          border: none;
          box-shadow: 0 4px 12px rgba(43, 170, 126, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .widget-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(43, 170, 126, 0.4);
        }

        .widget-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          width: 320px;
          margin-bottom: 10px;
          overflow: hidden;
          transform: translateY(10px);
          opacity: 0;
          animation: slideUp 0.3s ease forwards;
        }

        .widget-header {
          background: linear-gradient(135deg, #2baa7e 0%, #1e8b5c 100%);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .widget-content {
          padding: 20px;
        }

        .widget-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .widget-description {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .widget-cta {
          background: linear-gradient(135deg, #2baa7e 0%, #1e8b5c 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .widget-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(43, 170, 126, 0.3);
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        @keyframes pulse {
          0% {
            box-shadow:
              0 4px 12px rgba(43, 170, 126, 0.3),
              0 0 0 0 rgba(43, 170, 126, 0.7);
          }
          70% {
            box-shadow:
              0 4px 12px rgba(43, 170, 126, 0.3),
              0 0 0 10px rgba(43, 170, 126, 0);
          }
          100% {
            box-shadow:
              0 4px 12px rgba(43, 170, 126, 0.3),
              0 0 0 0 rgba(43, 170, 126, 0);
          }
        }

        @keyframes slideUp {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .heygen-widget {
            bottom: 15px;
            right: 15px;
          }

          .widget-card {
            width: calc(100vw - 30px);
            max-width: 300px;
          }

          .widget-button {
            width: 50px;
            height: 50px;
          }

          .widget-description {
            font-size: 16px;
            line-height: 1.5;
          }

          .widget-cta {
            font-size: 16px;
          }
        }
      `}</style>

      <div className='heygen-widget'>
        {/* Карточка виджета */}
        {!isMinimized && (
          <div className='widget-card'>
            <div className='widget-header'>
              <h3 className='widget-title'>
                <Bot size={20} />
                AI Консультант
              </h3>
              <button
                className='close-button'
                onClick={() => setIsMinimized(true)}
                aria-label='Свернуть'
              >
                <X size={16} />
              </button>
            </div>
            <div className='widget-content'>
              <p className='widget-description'>
                Получите персональную консультацию от AI-специалиста по
                реабилитации. Доступен 24/7 для ответов на ваши вопросы.
              </p>
              <Link href='/avatar' className='widget-cta'>
                Начать консультацию
              </Link>
            </div>
          </div>
        )}

        {/* Кнопка виджета */}
        <button
          className='widget-button'
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={
            isMinimized ? 'Открыть AI консультанта' : 'Свернуть AI консультанта'
          }
        >
          {isMinimized ? (
            <MessageCircle size={24} color='white' />
          ) : (
            <X size={24} color='white' />
          )}
        </button>
      </div>
    </>
  );
};

/* 
СТАРЫЙ КОД IFRAME ВИДЖЕТА ЗАКОММЕНТИРОВАН
Заменен на новый SDK-based компонент с улучшенным UX
Старый код сохранен для справки:

const HeyGenWidget: React.FC = () => {
  useEffect(() => {
    if (document.getElementById('heygen-widget-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'heygen-widget-script';
    script.innerHTML = `
      !function(window){
        // ... весь старый код iframe виджета ...
      }(globalThis);
    `;

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('heygen-widget-script');
      const existingWidget = document.getElementById('heygen-streaming-embed');

      if (existingScript) {
        existingScript.remove();
      }

      if (existingWidget) {
        existingWidget.remove();
      }
    };
  }, []);

  return null;
};
*/

export default HeyGenWidget;

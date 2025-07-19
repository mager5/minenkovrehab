'use client';
import React, { useEffect } from 'react';

const HeyGenWidget: React.FC = () => {
  // Восстановленный оригинальный iframe виджет HeyGen
  useEffect(() => {
    // Проверяем, не загружен ли уже скрипт
    if (document.getElementById('heygen-widget-script')) {
      return;
    }

    // Создаем и добавляем скрипт HeyGen
    const script = document.createElement('script');
    script.id = 'heygen-widget-script';
    script.innerHTML = `
      !function(window){
        const host="https://labs.heygen.com",
        url=host+"/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJkM2VhZWQxZWExZGQ0NzY2OTUyZTJmZGJl%0D%0AYjZiZDBkNCIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3Yz%0D%0AL2QzZWFlZDFlYTFkZDQ3NjY5NTJlMmZkYmViNmJkMGQ0L2Z1bGwvMi4yL3ByZXZpZXdfdGFyZ2V0%0D%0ALndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImVm%0D%0AZmI5NzgxNmMzMTRhYmFhZTdjOGU2NjczNjM3ZDA3IiwidXNlcm5hbWUiOiIxYjRjMGEyMTFhNGU0%0D%0AMGMzYTVjNTU1NWM2OGJiZjkyNSJ9&inIFrame=1",
        clientWidth=document.body.clientWidth,
        wrapDiv=document.createElement("div");
        
        wrapDiv.id="heygen-streaming-embed";
        
        const container=document.createElement("div");
        container.id="heygen-streaming-container";
        
        const stylesheet=document.createElement("style");
        stylesheet.innerHTML=\`
          #heygen-streaming-embed {
            z-index: 9999;
            position: fixed;
            right: 20px;
            bottom: 20px;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            border: 3px solid #2baa7e;
            box-shadow: 0px 8px 24px 0px rgba(43, 170, 126, 0.3), 0 0 15px rgba(43, 170, 126, 0.5);
            transition: all linear 0.1s;
            overflow: hidden;
            background: linear-gradient(135deg, #2baa7e 0%, #1e8b5c 100%);
            opacity: 0;
            visibility: hidden;
          }
          
          #heygen-streaming-embed.show {
            opacity: 1;
            visibility: visible;
          }
          
          #heygen-streaming-embed.expand {
            \${clientWidth<540?"height: 266px; width: 96%; right: 2%; transform: none;":"height: 366px; width: calc(366px * 16 / 9); right: 20px;"}
            border: 3px solid #2baa7e;
            border-radius: 12px;
            box-shadow: 0px 12px 32px 0px rgba(43, 170, 126, 0.4), 0 0 20px rgba(43, 170, 126, 0.6);
            background: #ffffff;
          }
          
          #heygen-streaming-container {
            width: 100%;
            height: 100%;
          }
          
          #heygen-streaming-container iframe {
            width: 100%;
            height: 100%;
            border: 0;
            border-radius: inherit;
          }
          
          /* Анимация пульсации для привлечения внимания */
          #heygen-streaming-embed:not(.expand)::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2baa7e, #1e8b5c);
            animation: pulse-ring 2s infinite;
            z-index: -1;
          }
          
          @keyframes pulse-ring {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1.1);
              opacity: 0;
            }
          }
          
          /* Принудительное переопределение цветов HeyGen виджета */
          #heygen-streaming-embed iframe,
          #heygen-streaming-embed iframe body,
          #heygen-streaming-embed iframe [class*="button"],
          #heygen-streaming-embed iframe [class*="btn"],
          #heygen-streaming-embed iframe button {
            background-color: #2baa7e !important;
            background: #2baa7e !important;
            border-color: #2baa7e !important;
          }
          
          #heygen-streaming-embed iframe [style*="background"],
          #heygen-streaming-embed iframe [style*="border"] {
            background-color: #2baa7e !important;
            background: linear-gradient(135deg, #2baa7e 0%, #1e8b5c 100%) !important;
            border-color: #2baa7e !important;
          }
          
          /* Адаптивность для мобильных устройств */
          @media (max-width: 640px) {
            #heygen-streaming-embed {
              right: 15px;
              bottom: 15px;
              width: 160px;
              height: 160px;
            }
            
            #heygen-streaming-embed.expand {
              height: 240px;
              width: 94%;
              right: 3%;
              bottom: 15px;
            }
          }
        \`;
        
        const iframe=document.createElement("iframe");
        iframe.allowFullscreen=false;
        iframe.title="AI Ассистент Миненков Rehab";
        iframe.role="dialog";
        iframe.allow="microphone";
        iframe.src=url;
        
        let visible=false,initial=false;
        
        window.addEventListener("message",(e=>{
          if(e.origin===host&&e.data&&e.data.type&&"streaming-embed"===e.data.type){
            if("init"===e.data.action){
              initial=true;
              wrapDiv.classList.toggle("show",initial);
            } else if("show"===e.data.action){
              visible=true;
              wrapDiv.classList.toggle("expand",visible);
            } else if("hide"===e.data.action){
              visible=false;
              wrapDiv.classList.toggle("expand",visible);
            }
          }
        }));
        
        container.appendChild(iframe);
        wrapDiv.appendChild(stylesheet);
        wrapDiv.appendChild(container);
        document.body.appendChild(wrapDiv);
        
        // Принудительное изменение цветов внутри iframe
        const forceGreenColors = () => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
              // Добавляем стили принудительно
              const forceStyle = iframeDoc.createElement('style');
              forceStyle.innerHTML = \`
                * {
                  --primary-color: #2baa7e !important;
                  --button-color: #2baa7e !important;
                  --accent-color: #2baa7e !important;
                }
                button, .button, [class*="button"], [class*="btn"] {
                  background-color: #2baa7e !important;
                  background: #2baa7e !important;
                  border-color: #2baa7e !important;
                }
                [style*="background"], [style*="border"] {
                  background-color: #2baa7e !important;
                  border-color: #2baa7e !important;
                }
              \`;
              iframeDoc.head.appendChild(forceStyle);
              
              // Принудительно изменяем все элементы с синими цветами
              const elements = iframeDoc.querySelectorAll('*');
              elements.forEach(el => {
                const style = window.getComputedStyle ? iframeDoc.defaultView.getComputedStyle(el) : el.currentStyle;
                if (style && (style.backgroundColor.includes('rgb(0, 99, 165)') || style.backgroundColor.includes('#0063A5'))) {
                  el.style.backgroundColor = '#2baa7e';
                }
                if (style && (style.borderColor.includes('rgb(0, 99, 165)') || style.borderColor.includes('#0063A5'))) {
                  el.style.borderColor = '#2baa7e';
                }
              });
            }
          } catch (e) {
            // Игнорируем ошибки CORS
          }
        };
        
        // Пытаемся изменить цвета после загрузки iframe
        iframe.onload = () => {
          setTimeout(forceGreenColors, 1000);
          setTimeout(forceGreenColors, 3000);
          setTimeout(forceGreenColors, 5000);
        };
        
        // Наблюдаем за изменениями в iframe
        const observer = new MutationObserver(() => {
          forceGreenColors();
        });
        
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc && iframeDoc.body) {
              observer.observe(iframeDoc.body, { childList: true, subtree: true });
            }
          } catch (e) {
            // Игнорируем ошибки CORS
          }
        }, 2000);
      }(globalThis);
    `;

    document.head.appendChild(script);

    // Cleanup функция для удаления скрипта при размонтировании компонента
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

  return null; // Компонент не рендерит ничего в React, виджет добавляется через DOM
};

export default HeyGenWidget;

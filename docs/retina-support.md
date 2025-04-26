# Поддержка Retina экранов в проекте

В данном проекте реализована комплексная поддержка Retina экранов для улучшения качества изображений на устройствах с высокой плотностью пикселей (DPI).

## Содержание

1. [Использование компонента RetinaImage](#использование-компонента-retinaimage)
2. [Утилиты для работы с Retina изображениями](#утилиты-для-работы-с-retina-изображениями)
3. [Хуки для Retina дисплеев](#хуки-для-retina-дисплеев)
4. [HOC withRetina](#hoc-withretina)
5. [CSS-классы для Retina](#css-классы-для-retina)
6. [Tailwind конфигурация](#tailwind-конфигурация)
7. [Разделение серверных и клиентских компонентов](#разделение-серверных-и-клиентских-компонентов)

## Использование компонента RetinaImage

Компонент `RetinaImage` автоматически определяет тип дисплея и загружает соответствующее изображение:

```jsx
import RetinaImage from '@/components/RetinaImage';

// Базовое использование
<RetinaImage 
  src="/images/normal.jpg"
  retinaImg="/images/example@2x.jpg"
  alt="Описание изображения"
  width={400}
  height={300}
/>

// С дополнительными классами
<RetinaImage 
  src="/images/normal.jpg"
  retinaImg="/images/example@2x.jpg"
  alt="Описание изображения"
  width={400}
  height={300}
  className="rounded-lg shadow-md"
/>
```

> **Примечание:** `RetinaImage` - это клиентский компонент, поэтому он должен использоваться внутри компонентов с директивой "use client" или в клиентских файлах.

## Утилиты для работы с Retina изображениями

### Клиентские утилиты

В файле `src/utils/imageUtils.ts` доступны следующие клиентские функции:

```typescript
// Преобразует путь к изображению для получения Retina версии (@2x)
const retinaImagePath = getRetinaImagePath('/images/example.jpg');
// Результат: '/images/example@2x.jpg'

// Проверяет, является ли текущий дисплей Retina
const isRetina = isRetinaDisplay();

// Получает стили для фонового изображения с поддержкой Retina
const styles = getRetinaBackgroundStyles('/images/bg.jpg', '/images/bg@2x.jpg');
```

### Серверные утилиты

В файле `src/utils/imageUtils.server.ts` доступны функции, которые можно использовать на сервере:

```typescript
// Преобразует путь к изображению для получения Retina версии (@2x)
import { getRetinaImagePath } from '@/utils/imageUtils.server';

const retinaImagePath = getRetinaImagePath('/images/example.jpg');
// Результат: '/images/example@2x.jpg'
```

## Хуки для Retina дисплеев

В файле `src/hooks/useRetina.ts` доступны следующие хуки (только для клиентских компонентов):

```jsx
import { useRetina, useRetinaImage } from '@/hooks/useRetina';

// В компоненте:
const MyComponent = () => {
  // Проверяем, является ли дисплей Retina
  const isRetina = useRetina();
  
  // Получаем соответствующее изображение в зависимости от типа дисплея
  const imageSrc = useRetinaImage('/images/normal.jpg', '/images/retina@2x.jpg');
  
  return (
    <div>
      <p>Ваш дисплей {isRetina ? 'поддерживает' : 'не поддерживает'} Retina.</p>
      <img src={imageSrc} alt="Оптимизированное изображение" />
    </div>
  );
};
```

## HOC withRetina

Для расширенной поддержки Retina вы можете использовать HOC `withRetina` из `src/components/withRetina.tsx` (только для клиентских компонентов):

```jsx
import { withRetina } from '@/components/withRetina';

// Создаем компонент с поддержкой Retina
const RetinaBackgroundImage = withRetina(
  ({ src, alt, ...props }) => (
    <div 
      style={{ backgroundImage: `url(${src})` }}
      aria-label={alt}
      {...props} 
    />
  ),
  { 
    // Преобразование src для Retina (добавление @2x)
    src: (normalSrc) => {
      if (typeof normalSrc === 'string') {
        return normalSrc.replace(/\.(png|jpg|jpeg|gif)$/, '@2x.$1');
      }
      return normalSrc;
    }
  }
);

// Использование
<RetinaBackgroundImage 
  src="/images/banner.jpg" 
  alt="Баннер" 
  className="w-full h-64" 
/>
```

## CSS-классы для Retina

В глобальных стилях (`src/app/globals.css`) доступны следующие CSS-классы:

- `.img-retina` - Оптимизирует качество растровых изображений
- `.bg-img` - Базовые стили для фоновых изображений
- `.bg-retina` - Оптимизированные фоновые изображения для Retina дисплеев
- `.retina-ready` - Контейнер для изображений с GPU-акселерацией на Retina дисплеях

```html
<!-- Пример использования -->
<div class="retina-ready">
  <img src="/images/example@2x.jpg" alt="Пример" class="img-retina" />
</div>

<div class="bg-retina" style="background-image: url('/images/background@2x.jpg')"></div>
```

## Tailwind конфигурация

В `tailwind.config.js` добавлен медиа-запрос для Retina дисплеев:

```javascript
// Использование в Tailwind
screens: {
  // ... другие брейкпоинты
  'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
}
```

Пример использования в компонентах:

```jsx
// Стили только для Retina дисплеев
<div className="retina:shadow-lg retina:bg-primary-light">
  Этот блок будет иметь тень и фон только на Retina дисплеях
</div>
```

## Разделение серверных и клиентских компонентов

В Next.js 13+ все файлы страниц (`page.tsx`) по умолчанию являются серверными компонентами. Для использования клиентских функций (хуков, обработчиков событий) необходимо:

1. Добавить директиву `"use client"` в начало файла компонента:

```jsx
"use client";

import { useState } from 'react';
// ...остальной код компонента
```

2. Для смешанного использования разделите логику на серверные и клиентские компоненты:

```jsx
// Серверный компонент (page.tsx)
import ClientComponent from './client-component';
import { serverSideFunction } from '@/utils/server-utils';

export default function Page() {
  // Серверная логика
  const data = serverSideFunction();
  
  return (
    <div>
      <h1>Серверный заголовок</h1>
      <ClientComponent serverData={data} />
    </div>
  );
}

// client-component.tsx
"use client";

import { useState, useEffect } from 'react';

export default function ClientComponent({ serverData }) {
  // Клиентская логика с хуками
  const [state, setState] = useState();
  
  useEffect(() => {
    // Клиентский код
  }, []);
  
  return <div>Клиентский компонент</div>;
}
```

## Пример страницы

Посмотреть пример работы с Retina дисплеями можно на странице `/examples/retina`.

---

Для получения дополнительной информации о работе с изображениями в Next.js обратитесь к [официальной документации Next.js по оптимизации изображений](https://nextjs.org/docs/basic-features/image-optimization). 
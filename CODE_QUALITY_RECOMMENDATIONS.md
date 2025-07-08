# 📈 Рекомендации по улучшению качества и поддерживаемости кода

## 🎯 Общие принципы

### 1. Разделение ответственности (Separation of Concerns)
- ✅ **Выполнено**: API логика отделена от UI компонентов
- 🔄 **Рекомендация**: Вынести логику оплаты в отдельный хук `usePayment`

### 2. Конфигурация через переменные окружения
- ❌ **Проблема**: Хардкод URL API в коде
- ✅ **Решение**: Использовать `NEXT_PUBLIC_RAILWAY_API_URL`

### 3. Типизация данных
- ✅ **Выполнено**: TypeScript используется
- 🔄 **Рекомендация**: Добавить типы для API ответов

## 🔧 Конкретные улучшения

### 1. Создание кастомного хука для оплаты

**Файл:** `src/hooks/usePayment.ts`

```typescript
import { useState } from 'react';

interface PaymentData {
  amount: number;
  description: string;
  email: string;
  phone: string;
}

interface PaymentResponse {
  success: boolean;
  data?: {
    paymentUrl: string;
  };
  error?: string;
}

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (data: PaymentData): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_API_URL || 
        'https://minenkovrehab-production-15cc.up.railway.app';

      const response = await fetch(`${apiUrl}/api/robokassa/generate-payment-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания платежа');
      }

      const result: PaymentResponse = await response.json();

      if (result.success && result.data?.paymentUrl) {
        // Очистка URL от проблемных символов (для совместимости)
        const cleanUrl = result.data.paymentUrl.replace(/%27/g, '');
        return cleanUrl;
      } else {
        throw new Error('Не удалось получить ссылку для оплаты');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPayment,
    isLoading,
    error
  };
};
```

### 2. Обновление компонента ProductClient

**Файл:** `src/app/products/[id]/client.tsx`

```typescript
'use client';

import Link from 'next/link';
import { Product } from '../data';
import { motion } from 'framer-motion';
import { usePayment } from '@/hooks/usePayment';
import { useState } from 'react';

// ... анимации остаются без изменений

export default function ProductClient({ product }: { product: Product }) {
  const { createPayment, isLoading, error } = usePayment();
  const [email, setEmail] = useState('customer@example.com');
  const [phone, setPhone] = useState('+79001234567');

  const handlePayment = async () => {
    console.log('🔄 Создание платежа для продукта:', product.title);
    
    const paymentUrl = await createPayment({
      amount: product.price,
      description: product.title,
      email,
      phone
    });

    if (paymentUrl) {
      console.log('✅ Платежная ссылка получена:', paymentUrl);
      window.location.href = paymentUrl;
    } else {
      console.error('❌ Ошибка при создании платежа:', error);
      alert(`Произошла ошибка при создании платежа: ${error}`);
    }
  };

  // ... остальной код компонента
}
```

### 3. Добавление переменных окружения

**Файл:** `.env.local`

```env
NEXT_PUBLIC_RAILWAY_API_URL=https://minenkovrehab-production-15cc.up.railway.app
```

### 4. Создание типов для API

**Файл:** `src/types/api.ts`

```typescript
export interface PaymentRequest {
  amount: number;
  description: string;
  email: string;
  phone: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    paymentUrl: string;
    invoiceId?: string;
  };
  error?: string;
  details?: string[];
}

export interface ApiError {
  error: string;
  details?: string[];
  code?: number;
}
```

### 5. Добавление валидации

**Файл:** `src/utils/validation.ts`

```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+7\d{10}$/;
  return phoneRegex.test(phone);
};

export const validatePaymentData = (data: {
  amount: number;
  description: string;
  email: string;
  phone: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.amount <= 0) {
    errors.push('Сумма должна быть больше 0');
  }

  if (!data.description.trim()) {
    errors.push('Описание не может быть пустым');
  }

  if (!validateEmail(data.email)) {
    errors.push('Некорректный формат email');
  }

  if (!validatePhone(data.phone)) {
    errors.push('Некорректный формат телефона');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### 6. Улучшение обработки ошибок

**Файл:** `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Произошла ошибка
          </h2>
          <p className="text-red-600">
            Что-то пошло не так. Пожалуйста, обновите страницу или попробуйте позже.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 7. Добавление логирования

**Файл:** `src/utils/logger.ts`

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'debug':
        console.debug(prefix, message, data);
        break;
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();
```

## 🧪 Тестирование

### 1. Unit тесты для хука usePayment

**Файл:** `src/hooks/__tests__/usePayment.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { usePayment } from '../usePayment';

// Mock fetch
global.fetch = jest.fn();

describe('usePayment', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should create payment successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        paymentUrl: 'https://test-payment-url.com'
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => usePayment());

    let paymentUrl: string | null = null;
    await act(async () => {
      paymentUrl = await result.current.createPayment({
        amount: 1000,
        description: 'Test payment',
        email: 'test@example.com',
        phone: '+79001234567'
      });
    });

    expect(paymentUrl).toBe('https://test-payment-url.com');
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' })
    });

    const { result } = renderHook(() => usePayment());

    let paymentUrl: string | null = null;
    await act(async () => {
      paymentUrl = await result.current.createPayment({
        amount: 1000,
        description: 'Test payment',
        email: 'test@example.com',
        phone: '+79001234567'
      });
    });

    expect(paymentUrl).toBeNull();
    expect(result.current.error).toBe('API Error');
  });
});
```

### 2. E2E тесты с Playwright

**Файл:** `tests/payment.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('payment flow', async ({ page }) => {
  await page.goto('/products/1');
  
  // Проверяем наличие кнопки оплаты
  const paymentButton = page.locator('button:has-text("Купить онлайн")');
  await expect(paymentButton).toBeVisible();
  
  // Мокаем API ответ
  await page.route('**/api/robokassa/generate-payment-url', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          paymentUrl: 'https://auth.robokassa.ru/test-payment'
        }
      })
    });
  });
  
  // Кликаем на кнопку оплаты
  await paymentButton.click();
  
  // Проверяем редирект
  await expect(page).toHaveURL(/robokassa/);
});
```

## 📊 Метрики качества кода

### 1. Покрытие тестами
- **Цель**: >80% покрытие кода
- **Инструменты**: Jest, React Testing Library, Playwright

### 2. Статический анализ
- **ESLint**: Проверка стиля кода
- **TypeScript**: Статическая типизация
- **Prettier**: Форматирование кода

### 3. Производительность
- **Lighthouse**: Аудит производительности
- **Bundle Analyzer**: Анализ размера бандла

## 🔄 План внедрения

### Этап 1: Основные улучшения (1-2 дня)
1. ✅ Создание хука `usePayment`
2. ✅ Добавление переменных окружения
3. ✅ Улучшение обработки ошибок

### Этап 2: Расширенная функциональность (2-3 дня)
1. ✅ Добавление валидации
2. ✅ Создание типов для API
3. ✅ Добавление логирования

### Этап 3: Тестирование (2-3 дня)
1. ✅ Unit тесты
2. ✅ Integration тесты
3. ✅ E2E тесты

### Этап 4: Мониторинг и оптимизация (1-2 дня)
1. ✅ Настройка метрик
2. ✅ Оптимизация производительности
3. ✅ Документация

## 📝 Заключение

Данные рекомендации помогут:
- 🔧 **Улучшить поддерживаемость** кода
- 🐛 **Снизить количество багов**
- 🚀 **Ускорить разработку** новых функций
- 📊 **Повысить качество** пользовательского опыта
- 🔒 **Увеличить надежность** системы

---

*Дата создания: $(date)*
*Статус: Готово к внедрению*
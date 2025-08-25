# 🧾 Руководство по интеграции фискализации (Receipt) в Robokassa

## 📋 Обзор

Данное руководство описывает, как использовать обновленную функцию `generatePaymentLink` для генерации ссылок оплаты с параметром `Receipt` для фискализации услуг в соответствии с требованиями 54-ФЗ.

## ✅ Что было реализовано

1. **Функция `createReceiptParameter`** - создает URL-кодированный JSON параметр Receipt
2. **Обновленная `generatePaymentLink`** - поддерживает параметр `receipt` для фискализации
3. **Корректный расчет подписи** - включает Receipt в строку для подписи SignatureValue
4. **Автоматическое URL-кодирование** - корректная обработка русских символов

## 🚀 Использование

### Базовый пример для экспресс онлайн-консультации

```javascript
const { generatePaymentLink } = require('./robokassa-payment-generator');

// Генерация ссылки с фискализацией
const result = generatePaymentLink({
  amount: 1500,
  description: 'Консультация',
  receipt: {
    serviceName: 'Экспресс онлайн-консультация'
  }
});

console.log('Ссылка для оплаты:', result.paymentUrl);
```

### Пример сгенерированной ссылки

```
https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=1500&invoiceID=319734965&Description=%D0%9A%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8F&Receipt=%7B%22sno%22%3A%22osn%22%2C%22items%22%3A%5B%7B%22name%22%3A%22%D0%9A%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8F%20%D0%BD%D0%B5%D0%B2%D1%80%D0%BE%D0%BB%D0%BE%D0%B3%D0%B0%22%2C%22quantity%22%3A1%2C%22sum%22%3A1500%2C%22payment_method%22%3A%22full_payment%22%2C%22payment_object%22%3A%22service%22%2C%22tax%22%3A%22vat20%22%7D%5D%7D&SignatureValue=2E05E70653F7B9E4F6194999AEAAE580&IsTest=1
```

## 📄 Структура параметра Receipt

Параметр Receipt содержит следующую структуру JSON:

```json
{
  "sno": "osn",
  "items": [
    {
      "name": "Консультация специалиста",
      "quantity": 1,
      "sum": 1500,
      "payment_method": "full_payment",
      "payment_object": "service",
      "tax": "vat20"
    }
  ]
}
```

### Описание полей:

- **sno**: `"osn"` - система налогообложения (основная)
- **name**: название услуги
- **quantity**: `1` - количество (всегда 1 для услуг)
- **sum**: сумма услуги в рублях
- **payment_method**: `"full_payment"` - способ расчета (полный расчет)
- **payment_object**: `"service"` - предмет расчета (услуга)
- **tax**: `"vat20"` - налоговая ставка (НДС 20%)

## 🔧 API функций

### `generatePaymentLink(params)`

**Параметры:**
- `amount` (number) - сумма платежа в рублях
- `description` (string) - описание платежа
- `receipt` (object, опционально) - объект для фискализации
  - `serviceName` (string) - название услуги для фискализации

**Возвращает:**
- `paymentUrl` (string) - готовая ссылка для оплаты
- `signature` (string) - подпись SignatureValue
- `signatureString` (string) - строка для расчета подписи
- `isTest` (boolean) - флаг тестового режима

### `createReceiptParameter(item)`

**Параметры:**
- `name` (string) - название услуги
- `sum` (number) - сумма услуги

**Возвращает:**
- URL-кодированный JSON строку параметра Receipt

## 🧪 Тестирование

Для тестирования используйте файл `test-receipt-payment.js`:

```bash
node test-receipt-payment.js
```

## 📝 Примеры для других услуг

### Онлайн-консультация

```javascript
const result = generatePaymentLink({
  amount: 2000,
  description: 'Онлайн-консультация',
  receipt: {
    serviceName: 'Онлайн-консультация'
  }
});
```

### Экспресс консультация

```javascript
const result = generatePaymentLink({
  amount: 1000,
  description: 'Экспресс консультация',
  receipt: {
    serviceName: 'Экспресс онлайн-консультация'
  }
});
```

## ⚠️ Важные замечания

1. **Подпись SignatureValue** автоматически пересчитывается с учетом параметра Receipt
2. **URL-кодирование** применяется автоматически для корректной передачи русских символов
3. **Тестовый режим** определяется автоматически на основе конфигурации
4. **Совместимость** - функция работает как с параметром `receipt`, так и без него

## 🔄 Следующие шаги

После успешного тестирования на одной услуге можно:

1. Интегрировать фискализацию во все остальные услуги
2. Обновить формы оплаты на сайте
3. Протестировать в продакшене
4. Настроить мониторинг успешности платежей

## 📞 Поддержка

При возникновении вопросов обращайтесь к документации Robokassa или используйте тестовый скрипт для отладки.
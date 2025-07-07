# 🔗 Генерация ссылок оплаты Robokassa

## ✅ Правильный формат ссылки

Ссылка должна иметь следующий формат:
```
https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950&invoiceID=558823218&Description=Абонемент+клуба+формула+движения&SignatureValue=43EAEDDB803E7DE3CF5F4A05C4EBBBB4&IsTest=1
```

## 🚀 Быстрая генерация ссылки

### Способ 1: Готовый генератор
```bash
node robokassa-payment-generator.js
```

### Способ 2: Через Railway API
```bash
curl -X POST https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2950,
    "description": "Абонемент клуба формула движения",
    "email": "client@example.com",
    "phone": "+79001234567"
  }'
```

## 📋 Обязательные параметры

| Параметр | Значение | Описание |
|----------|----------|----------|
| `MerchantLogin` | `Minenkov-2` | ID магазина в Robokassa |
| `OutSum` | `2950` | Сумма платежа в рублях |
| `invoiceID` | `558823218` | Уникальный номер счета |
| `Description` | `Абонемент клуба формула движения` | Описание платежа |
| `SignatureValue` | `43EAEDDB803E7DE3CF5F4A05C4EBBBB4` | MD5 подпись |
| `IsTest` | `1` | Тестовый режим (1 = тест, 0 = продакшн) |

## 🔐 Генерация подписи

Подпись генерируется по формуле:
```
MD5(MerchantLogin:OutSum:InvoiceID:Password1)
```

Для тестового режима:
```
MD5("Minenkov-2:2950:558823218:Eld5Xljk2GBN4D6TJo3N")
```

## 🧪 Тестирование

1. **Локальная генерация**: `node robokassa-payment-generator.js`
2. **Railway API**: `node generate-correct-payment-link.js`
3. **Прямая проверка**: Откройте сгенерированную ссылку в браузере

## ⚠️ Важные замечания

- **Тестовый режим**: Сейчас используется `IsTest=1`
- **Безопасность**: Пароли хранятся в environment variables
- **Уникальность**: Каждая ссылка должна иметь уникальный `invoiceID`
- **Кодировка**: Описание автоматически кодируется для URL

## 🔄 Переключение в продакшн

Для продакшна измените:
1. `IsTest=0`
2. Используйте продакшн пароли вместо тестовых
3. Обновите environment variables на Railway

## 📞 Поддержка

Если ссылка не работает, проверьте:
1. Правильность всех параметров
2. Корректность подписи
3. Настройки в личном кабинете Robokassa
4. Environment variables на Railway
# План подключения эквайринга T-банка (Тинькофф) через JS-виджет

- [ ] **1. Получение реквизитов**
    - Получить тестовые/боевые данные:
        - `data-terminal`
        - `data-password`
        - `merchant_id`
        - `sbp_merchant_id`
    - Ознакомиться с [документацией по JS-виджету](https://www.tinkoff.ru/kassa/dev/payments/quickstart/).

- [ ] **2. Подключение скрипта виджета**
    - Вставить скрипт в `<head>` нужной страницы через компонент `next/head`:
      ```jsx
      <Head>
        <script src="https://securepay.tinkoff.ru/html/pay-widget.js"></script>
      </Head>
      ```

- [ ] **3. Добавление кнопки оплаты**
    - Разместить кнопку с нужными data-атрибутами:
      ```jsx
      <button
        id="tbank-pay"
        data-terminal="ВАШ_TERMINAL"
        data-password="ВАШ_PASSWORD"
        data-order-id={`ORD-${Date.now()}`}
        data-amount="295000"
        data-currency="643"
        data-sbp-merchant-id="ВАШ_SBP_MERCHANT_ID"
        data-success-url="https://ваш-домен.ru/payment/success"
        data-fail-url="https://ваш-домен.ru/payment/fail"
      >
        Оформить абонемент
      </button>
      ```

- [x] **4. Инициализация виджета на клиенте**
    - В компоненте React добавить инициализацию виджета:
      ```js
      useEffect(() => {
        if (typeof window !== 'undefined' && window.TinkoffPay) {
          new window.TinkoffPay.Button('#tbank-pay');
        }
      }, []);
      ```
    - Для TypeScript добавить типизацию:
      ```ts
      // global.d.ts
      interface Window {
        TinkoffPay?: any;
      }
      ```

- [x] **5. Создание страниц успеха и ошибки**
    - Создать страницы:
        - `/payment/success` — сообщение об успешной оплате
        - `/payment/fail` — сообщение об ошибке оплаты

- [ ] **6. Тестирование**
    - Проверить открытие формы оплаты, успешную и неуспешную оплату, редиректы.
    - Убедиться, что суммы, order-id и адреса success/fail корректны.

- [ ] **7. Переход на боевые реквизиты**
    - После тестирования заменить тестовые данные на боевые.
    - Проверить работу на продакшене.

- [ ] **8. Документация**
    - [Быстрый старт: JS-виджет](https://www.tinkoff.ru/kassa/dev/payments/quickstart/)
    - [FAQ и поддержка](https://www.tinkoff.ru/kassa/dev/) 
const axios = require('axios');

// Создание реальной платежной ссылки для абонемента
async function createSubscriptionPayment() {
  try {
    const paymentData = {
      amount: 5000, // 5 000 ₽ за абонемент
      description: 'Оплата абонемента в центр реабилитации Миненкова',
      email: 'client@example.com', // Email клиента
    };

    console.log('Создание платежной ссылки для абонемента...');
    console.log('Параметры платежа:', paymentData);

    const response = await axios.post(
      'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url',
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    // Извлекаем данные из ответа (сервер возвращает {success: true, data: {...}})
    const responseData = response.data;
    const data = responseData.data || responseData; // Поддержка обоих форматов

    console.log('\n=== ПЛАТЕЖНАЯ ССЫЛКА ДЛЯ АБОНЕМЕНТА ===');
    console.log('Ссылка для оплаты:', data.paymentUrl);
    console.log('ID счета:', data.invoiceId);
    console.log('Сумма:', data.amount, 'руб.');
    console.log('Описание:', data.description);
    console.log('Тестовый режим:', data.testMode ? 'ДА' : 'НЕТ');

    console.log('\n🔗 ГОТОВАЯ ССЫЛКА ДЛЯ ОПЛАТЫ АБОНЕМЕНТА:');
    console.log(data.paymentUrl);
    console.log('\n✅ Ссылка готова к использованию!');
    console.log('💰 Сумма к оплате: ' + data.amount + ' рублей');
    console.log('📧 Email клиента: client@example.com');

    // Проверяем успешность операции
    if (!responseData.success) {
      console.error('❌ Ошибка от сервера:', responseData.error);
      throw new Error(responseData.error || 'Неизвестная ошибка сервера');
    }

    return response.data;
  } catch (error) {
    console.error('Ошибка при создании платежной ссылки:', error.message);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
    }
    throw error;
  }
}

// Запуск создания платежной ссылки
createSubscriptionPayment()
  .then(() => {
    console.log('\nПлатежная ссылка успешно создана!');
  })
  .catch(error => {
    console.error('Не удалось создать платежную ссылку:', error.message);
    process.exit(1);
  });

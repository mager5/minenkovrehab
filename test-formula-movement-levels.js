// Используем встроенный fetch в Node.js 18+

// Тестирование фискализации для всех 4 уровней программы "Формула движения"
async function testFormulaMovementLevels() {
  console.log(
    '🧪 Тестирование фискализации для всех уровней программы "Формула движения"\n'
  );

  const baseUrl = 'http://localhost:3002/api/robokassa/generate-payment-url';
  const testData = {
    amount: 6000,
    email: 'test@example.com',
    phone: '+79001234567',
  };

  const levels = [
    {
      level: 1,
      description: "Программа тренировок 'Формула Движения'",
    },
    {
      level: 2,
      description: "Программа тренировок 'Формула Движения'",
    },
    {
      level: 3,
      description: "Программа тренировок 'Формула Движения'",
    },
    {
      level: 4,
      description: "Программа тренировок 'Формула Движения'",
    },
  ];

  for (const levelData of levels) {
    try {
      console.log(`\n📋 Тестирование ${levelData.level}-го уровня...`);
      console.log(`📝 Описание: ${levelData.description}`);

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testData,
          description: levelData.description,
          level: levelData.level,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Ошибка для ${levelData.level}-го уровня:`, errorText);
        continue;
      }

      const result = await response.json();

      if (result.success) {
        console.log(
          `✅ ${levelData.level}-й уровень: Платежная ссылка создана успешно`
        );
        console.log(`🔗 URL: ${result.data.paymentUrl}`);
        console.log(`📄 InvoiceId: ${result.data.invoiceId}`);
        console.log(`💰 Сумма: ${result.data.amount} ₽`);
        console.log(`📋 Описание: ${result.data.description}`);

        // Проверяем, что в URL содержится правильное описание для фискализации
        if (
          result.data.paymentUrl.includes(
            encodeURIComponent(levelData.description)
          )
        ) {
          console.log(
            `✅ Фискализация: Описание корректно передано в платежную ссылку`
          );
        } else {
          console.log(
            `⚠️ Фискализация: Возможно, описание не передано корректно`
          );
        }
      } else {
        console.error(
          `❌ ${levelData.level}-й уровень: Ошибка создания платежа:`,
          result.error
        );
      }
    } catch (error) {
      console.error(
        `❌ ${levelData.level}-й уровень: Исключение:`,
        error.message
      );
    }
  }

  console.log('\n🏁 Тестирование завершено');
}

// Запуск тестов
testFormulaMovementLevels().catch(console.error);

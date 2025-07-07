const { generateInvoiceId } = require('./utils/signature');

console.log('🧪 Тестирование функции generateInvoiceId');
console.log('=' .repeat(50));

for (let i = 0; i < 5; i++) {
  const invoiceId = generateInvoiceId();
  console.log(`Тест ${i + 1}: ${invoiceId} (тип: ${typeof invoiceId})`);
  
  // Проверяем, что это число в допустимом диапазоне
  if (typeof invoiceId === 'number' && invoiceId >= 1 && invoiceId <= 2147483647) {
    console.log('✅ Корректный числовой InvId');
  } else {
    console.log('❌ Некорректный InvId');
  }
  console.log('');
}

console.log('🏁 Тестирование завершено');
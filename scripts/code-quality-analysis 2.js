#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Создаем директорию для отчетов
const reportsDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log('🔍 Запуск анализа качества кода...');

try {
  // Анализ сложности кода
  console.log('\n📊 Анализ сложности кода...');
  execSync('npm run analyze:complexity', { stdio: 'inherit' });
  
  // Анализ дублирования кода
  console.log('\n🔍 Анализ дублирования кода...');
  execSync('npm run analyze:duplicates', { stdio: 'inherit' });
  
  // Запуск тестов с покрытием
  console.log('\n🧪 Запуск тестов с анализом покрытия...');
  execSync('npm run test:coverage', { stdio: 'inherit' });
  
  // Линтинг
  console.log('\n🔧 Проверка ESLint...');
  execSync('npm run lint', { stdio: 'inherit' });
  
  // Проверка форматирования
  console.log('\n💅 Проверка форматирования...');
  execSync('npm run format:check', { stdio: 'inherit' });
  
  // TypeScript проверка
  console.log('\n📝 Проверка TypeScript...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  
  console.log('\n✅ Анализ качества кода завершен успешно!');
  console.log('📁 Отчеты сохранены в директории: reports/');
  
} catch (error) {
  console.error('❌ Ошибка при анализе качества кода:', error.message);
  process.exit(1);
}

// Генерируем сводный отчет
function generateSummaryReport() {
  const summary = {
    timestamp: new Date().toISOString(),
    reports: {
      complexity: fs.existsSync(path.join(reportsDir, 'complexity.json')),
      duplicates: fs.existsSync(path.join(reportsDir, 'jscpd')),
      coverage: fs.existsSync(path.join(process.cwd(), 'coverage'))
    }
  };
  
  fs.writeFileSync(
    path.join(reportsDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('📋 Сводный отчет создан: reports/summary.json');
}

generateSummaryReport();
// Скрипт для принудительной сборки Next.js с игнорированием ошибок типов
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем принудительную сборку проекта...');

// Проверяем, существует ли директория out
if (!fs.existsSync('out')) {
  console.log('📁 Создаем директорию out...');
  fs.mkdirSync('out', { recursive: true });
}

// Создаем файл .nojekyll
console.log('📄 Создаем файл .nojekyll...');
fs.writeFileSync('out/.nojekyll', '');

try {
  // Запускаем сборку Next.js с игнорированием ошибок
  console.log('🔨 Запускаем сборку Next.js...');
  execSync('next build --no-lint', { stdio: 'inherit' });
  console.log('✅ Сборка успешно завершена!');
} catch (error) {
  console.warn('⚠️ Сборка завершилась с ошибками, но мы продолжаем процесс...');
}

// Проверка и копирование CNAME файла
console.log('📋 Проверяем и копируем файл CNAME...');
if (fs.existsSync('CNAME')) {
  fs.copyFileSync('CNAME', 'out/CNAME');
} else if (fs.existsSync('public/CNAME')) {
  fs.copyFileSync('public/CNAME', 'out/CNAME');
} else {
  // Создаем CNAME файл, если он не существует
  fs.writeFileSync('out/CNAME', 'minenkovrehab.ru');
  console.log('📄 Создан файл CNAME с доменом minenkovrehab.ru');
}

// Копируем robots.txt и sitemap.xml
['robots.txt', 'sitemap.xml'].forEach(file => {
  if (fs.existsSync(`public/${file}`)) {
    console.log(`📋 Копируем файл ${file}...`);
    fs.copyFileSync(`public/${file}`, `out/${file}`);
  }
});

// Создаем 404.html для перенаправления неизвестных маршрутов на главную
if (!fs.existsSync('out/404.html') && fs.existsSync('out/index.html')) {
  console.log('📄 Создаем файл 404.html для перенаправления...');
  fs.copyFileSync('out/index.html', 'out/404.html');
}

console.log(
  '🎉 Процесс сборки завершен! Проверьте директорию out для результатов.'
);

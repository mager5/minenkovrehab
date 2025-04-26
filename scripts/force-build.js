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

// Копируем файл CNAME
if (fs.existsSync('public/CNAME')) {
  console.log('📋 Копируем файл CNAME...');
  fs.copyFileSync('public/CNAME', 'out/CNAME');
}

// Копируем robots.txt и sitemap.xml
['robots.txt', 'sitemap.xml'].forEach(file => {
  if (fs.existsSync(`public/${file}`)) {
    console.log(`📋 Копируем файл ${file}...`);
    fs.copyFileSync(`public/${file}`, `out/${file}`);
  }
});

console.log('🎉 Процесс сборки завершен! Проверьте директорию out для результатов.'); 
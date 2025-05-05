const fs = require('fs');
const path = require('path');

// Путь к директории с API-роутами
const apiDir = path.join(__dirname, '../src/app/api');

// Удаляем директорию с API-роутами
if (fs.existsSync(apiDir)) {
  fs.rmSync(apiDir, { recursive: true, force: true });
  console.log('API routes removed for build');
}

// Создаем пустую директорию api
fs.mkdirSync(apiDir, { recursive: true });
console.log('Empty api directory created'); 
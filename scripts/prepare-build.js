const fs = require('fs');
const path = require('path');

// Путь к директории с API-роутами
const apiDir = path.join(__dirname, '../src/app/api');

// Временно переименовываем директорию с API-роутами
if (fs.existsSync(apiDir)) {
  fs.renameSync(apiDir, `${apiDir}.bak`);
  console.log('API routes temporarily disabled for build');
}

// Функция для восстановления API-роутов после сборки
process.on('exit', () => {
  if (fs.existsSync(`${apiDir}.bak`)) {
    fs.renameSync(`${apiDir}.bak`, apiDir);
    console.log('API routes restored');
  }
}); 
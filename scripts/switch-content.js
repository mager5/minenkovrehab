#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');

// Файлы для переключения
const FILES_TO_SWITCH = [
  'home.json',
  'about.json', 
  'products.json'
];

// Функция для создания резервной копии
function createBackup(filename) {
  const sourcePath = path.join(CONTENT_DIR, filename);
  const backupPath = path.join(CONTENT_DIR, `${filename}.backup`);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, backupPath);
    console.log(`✅ Создана резервная копия: ${filename}.backup`);
  }
}

// Функция для переключения на банковский режим
function switchToBankMode() {
  console.log('🏦 Переключение на банковский режим...\n');
  
  FILES_TO_SWITCH.forEach(filename => {
    const originalPath = path.join(CONTENT_DIR, filename);
    const bankPath = path.join(CONTENT_DIR, `${filename.replace('.json', '-bank.json')}`);
    
    if (fs.existsSync(bankPath)) {
      // Создаем резервную копию оригинала
      createBackup(filename);
      
      // Заменяем на банковскую версию
      fs.copyFileSync(bankPath, originalPath);
      console.log(`🔄 ${filename} → банковская версия`);
    } else {
      console.log(`⚠️  Банковская версия не найдена: ${bankPath}`);
    }
  });
  
  console.log('\n✅ Переключение на банковский режим завершено!');
  console.log('📝 Оригинальные файлы сохранены с расширением .backup');
}

// Функция для переключения на оригинальный режим
function switchToOriginalMode() {
  console.log('🏥 Переключение на оригинальный режим...\n');
  
  FILES_TO_SWITCH.forEach(filename => {
    const originalPath = path.join(CONTENT_DIR, filename);
    const backupPath = path.join(CONTENT_DIR, `${filename}.backup`);
    
    if (fs.existsSync(backupPath)) {
      // Восстанавливаем из резервной копии
      fs.copyFileSync(backupPath, originalPath);
      console.log(`🔄 ${filename} ← восстановлен из резервной копии`);
      
      // Удаляем резервную копию
      fs.unlinkSync(backupPath);
      console.log(`🗑️  Удалена резервная копия: ${filename}.backup`);
    } else {
      console.log(`⚠️  Резервная копия не найдена: ${backupPath}`);
    }
  });
  
  console.log('\n✅ Переключение на оригинальный режим завершено!');
}

// Функция для показа текущего режима
function showCurrentMode() {
  console.log('📊 Текущий режим контента:\n');
  
  FILES_TO_SWITCH.forEach(filename => {
    const originalPath = path.join(CONTENT_DIR, filename);
    const backupPath = path.join(CONTENT_DIR, `${filename}.backup`);
    
    if (fs.existsSync(backupPath)) {
      console.log(`🏦 ${filename} - БАНКОВСКИЙ РЕЖИМ`);
    } else {
      console.log(`🏥 ${filename} - ОРИГИНАЛЬНЫЙ РЕЖИМ`);
    }
  });
}

// Основная логика
const mode = process.argv[2];

switch (mode) {
  case 'bank':
    switchToBankMode();
    break;
  case 'original':
    switchToOriginalMode();
    break;
  case 'status':
    showCurrentMode();
    break;
  default:
    console.log(`
🔄 Переключатель контента сайта

Использование:
  node scripts/switch-content.js bank      - переключить на банковский режим
  node scripts/switch-content.js original - переключить на оригинальный режим  
  node scripts/switch-content.js status   - показать текущий режим

Описание:
  📋 bank     - заменяет медицинские термины на нейтральные
  📋 original - восстанавливает оригинальный медицинский контент
  📋 status   - показывает какой режим сейчас активен

Примеры:
  npm run content:bank      # переключить на банковский режим
  npm run content:original  # вернуть оригинальный контент
  npm run content:status    # проверить текущий режим
`);
    break;
} 
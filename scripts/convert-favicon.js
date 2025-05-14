// Скрипт для конвертации SVG фавикона в разные форматы
// В реальном проекте вам потребуется установить следующие пакеты:
// npm install --save-dev sharp fs-extra

/**
 * Для корректной работы этого скрипта установите:
 * npm install --save-dev sharp fs-extra
 * 
 * Затем выполните скрипт с помощью Node.js:
 * node scripts/convert-favicon.js
 */

/*
const fs = require('fs-extra');
const sharp = require('sharp');
const path = require('path');

const SOURCE_SVG = path.join(__dirname, '../public/favicons/favicon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/favicons');

// Создаём директорию, если она не существует
fs.ensureDirSync(OUTPUT_DIR);

// Функция для создания фавиконок разных размеров
async function generateFavicons() {
  try {
    // Прочитаем исходный SVG
    const svgBuffer = await fs.readFile(SOURCE_SVG);
    
    // Размеры для различных фавиконов
    const sizes = [16, 32, 48, 57, 60, 72, 76, 96, 114, 120, 144, 152, 180, 192, 512];
    
    // Создадим фавиконы различных размеров
    for (const size of sizes) {
      const filename = size === 16 ? 'favicon-16x16.png' :
                       size === 32 ? 'favicon-32x32.png' :
                       size === 180 ? 'apple-touch-icon.png' :
                       size === 192 ? 'android-chrome-192x192.png' :
                       size === 512 ? 'android-chrome-512x512.png' :
                       `favicon-${size}x${size}.png`;
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(OUTPUT_DIR, filename));
      
      console.log(`Generated ${filename}`);
    }
    
    // Создадим специальную иконку для Microsoft
    await sharp(svgBuffer)
      .resize(150, 150)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'mstile-150x150.png'));
    
    console.log('Generated all favicons successfully');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

// Запускаем генерацию
generateFavicons();
*/

console.log('Этот скрипт является заглушкой. В реальном проекте используйте Node.js с sharp и fs-extra для конвертации SVG в PNG/ICO файлы.'); 
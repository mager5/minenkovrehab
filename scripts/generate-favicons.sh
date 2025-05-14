#!/bin/bash

# Скрипт для генерации фавиконов из SVG-файла
# Требует установленного ImageMagick:
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick
# Windows: скачайте с https://imagemagick.org/script/download.php

# Пути к файлам
SOURCE_SVG="../public/favicons/favicon.svg"
OUTPUT_DIR="../public/favicons"

# Создаем директорию, если ее нет
mkdir -p $OUTPUT_DIR

# Функция для генерации PNG из SVG
generate_png() {
  local size=$1
  local output_file=$2
  
  echo "Generating $output_file..."
  # Команда для конвертации SVG в PNG
  convert -background none -size ${size}x${size} $SOURCE_SVG $OUTPUT_DIR/$output_file
}

# Генерируем различные размеры иконок
generate_png "16x16" "favicon-16x16.png"
generate_png "32x32" "favicon-32x32.png"
generate_png "180x180" "apple-touch-icon.png"
generate_png "192x192" "android-chrome-192x192.png"
generate_png "512x512" "android-chrome-512x512.png"
generate_png "150x150" "mstile-150x150.png"

# Создаем ICO файл (включает несколько размеров)
echo "Generating favicon.ico..."
convert -background none $SOURCE_SVG -define icon:auto-resize=16,32,48,64 $OUTPUT_DIR/favicon.ico

echo "All favicons generated successfully!" 
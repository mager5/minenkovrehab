@echo off
:: Скрипт для генерации фавиконов из SVG-файла для Windows
:: Требует установленного ImageMagick (https://imagemagick.org/script/download.php)

:: Пути к файлам
set SOURCE_SVG=..\public\favicons\favicon.svg
set OUTPUT_DIR=..\public\favicons

:: Создаем директорию, если ее нет
if not exist %OUTPUT_DIR% mkdir %OUTPUT_DIR%

echo Generating favicons...

:: Генерируем различные размеры иконок
magick convert -background none -size 16x16 %SOURCE_SVG% %OUTPUT_DIR%\favicon-16x16.png
magick convert -background none -size 32x32 %SOURCE_SVG% %OUTPUT_DIR%\favicon-32x32.png
magick convert -background none -size 180x180 %SOURCE_SVG% %OUTPUT_DIR%\apple-touch-icon.png
magick convert -background none -size 192x192 %SOURCE_SVG% %OUTPUT_DIR%\android-chrome-192x192.png
magick convert -background none -size 512x512 %SOURCE_SVG% %OUTPUT_DIR%\android-chrome-512x512.png
magick convert -background none -size 150x150 %SOURCE_SVG% %OUTPUT_DIR%\mstile-150x150.png

:: Создаем ICO файл (включает несколько размеров)
magick convert -background none %SOURCE_SVG% -define icon:auto-resize=16,32,48,64 %OUTPUT_DIR%\favicon.ico

echo All favicons generated successfully!
pause 
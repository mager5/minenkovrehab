# План улучшений сайта МиненковРехаб

## 0. Срочные исправления

### Проблема с отображением изображений
- [x] Заменить недоступные изображения с Unsplash (ошибки 404)
- [ ] Добавить локальные изображения вместо внешних ссылок
- [x] Создать резервные заглушки для случаев, когда изображения не загружаются
- [ ] Оптимизировать процесс загрузки изображений

#### Выполненные исправления:
1. Созданы SVG-заглушки для отсутствующих изображений:
   - /public/images/services/individual-programs.svg
   - /public/images/services/movement-analysis.svg
2. Заменены ссылки на недоступные изображения в файлах:
   - src/app/page.tsx
   - src/app/products/page.tsx

## 1. Форма обратной связи (ContactForm)

### Реализация отправки данных
- [ ] Создать API-endpoint для обработки данных формы
- [ ] Настроить отправку данных через fetch или axios
- [ ] Добавить обработку ошибок и успешных ответов от сервера
- [ ] Реализовать сохранение данных в базе данных или отправку на email

### Валидация полей формы
- [ ] Валидация имени (минимальная длина, только буквы)
- [ ] Валидация email (формат, обязательное поле)
- [ ] Валидация телефона (формат российского номера)
- [ ] Валидация сообщения (минимальная длина, максимальная длина)
- [ ] Добавить визуальную индикацию ошибок валидации

### Защита от спама
- [ ] Интегрировать Google reCAPTCHA v3 (невидимая)
- [ ] Добавить проверку reCAPTCHA на сервере
- [ ] Реализовать ограничение на количество запросов с одного IP-адреса

## 2. Общие улучшения сайта

### Оптимизация производительности
- [ ] Оптимизировать размеры изображений
- [ ] Настроить ленивую загрузку изображений
- [ ] Минимизировать CSS и JavaScript
- [ ] Внедрить кэширование статических ресурсов

### Улучшение доступности (a11y)
- [ ] Добавить атрибуты aria для улучшения доступности
- [ ] Улучшить контрастность текста
- [ ] Обеспечить корректную навигацию с клавиатуры
- [ ] Добавить альтернативные тексты ко всем изображениям

### SEO-оптимизация
- [ ] Проверить и улучшить метаданные всех страниц
- [ ] Создать sitemap.xml
- [ ] Создать robots.txt
- [ ] Добавить структурированные данные (schema.org)

### Улучшение мобильной версии
- [ ] Проверить и улучшить отзывчивый дизайн на всех страницах
- [ ] Оптимизировать скорость загрузки для мобильных устройств
- [ ] Улучшить интерактивные элементы для тач-устройств

## 3. Модальное окно записи (BookingModal)

### Улучшение функциональности
- [ ] Реализовать реальную отправку данных из формы записи
- [ ] Добавить проверку доступных слотов времени
- [ ] Интегрировать с календарём Google/Яндекс

### Улучшение UX/UI
- [ ] Добавить шаги для упрощения процесса записи
- [ ] Улучшить визуальный выбор времени
- [ ] Добавить подтверждение записи на email/телефон

## 4. Аналитика и отслеживание

- [ ] Интегрировать Яндекс.Метрику
- [ ] Настроить Google Analytics
- [ ] Добавить отслеживание конверсий
- [ ] Настроить отслеживание событий (клики на кнопки записи, отправка форм)

## 5. Тестирование

- [ ] Провести юзабилити-тестирование
- [ ] Тестирование производительности (PageSpeed Insights)
- [ ] Тестирование совместимости с различными браузерами
- [ ] Тестирование адаптивности на разных устройствах 
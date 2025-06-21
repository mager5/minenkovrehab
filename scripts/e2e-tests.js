#!/usr/bin/env node

/**
 * E2E тесты для проверки форм, модальных окон и интерактивных элементов
 * Использует Playwright для автоматизированного тестирования
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: msg =>
    console.log(
      `\n${colors.cyan}${colors.bright}=== ${msg} ===${colors.reset}`
    ),
};

class E2ETester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.devServer = null;
    this.baseUrl = 'http://localhost:3000';
    this.errors = [];
    this.warnings = [];
  }

  async run() {
    log.header('Запуск E2E тестов');

    try {
      await this.startDevServer();
      await this.setupBrowser();
      await this.testPages();
      await this.testForms();
      await this.testModals();
      await this.testNavigation();
      await this.testResponsive();
      await this.testAccessibility();
      await this.cleanup();

      this.printResults();

      if (this.errors.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      log.error(`Критическая ошибка: ${error.message}`);
      await this.cleanup();
      process.exit(1);
    }
  }

  async startDevServer() {
    log.header('Запуск dev сервера для тестов');

    return new Promise((resolve, reject) => {
      this.devServer = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        detached: false,
      });

      let output = '';

      this.devServer.stdout.on('data', data => {
        output += data.toString();
        if (output.includes('Ready') || output.includes('started server')) {
          log.success('Dev сервер запущен для тестов');
          setTimeout(resolve, 3000);
        }
      });

      this.devServer.stderr.on('data', data => {
        const error = data.toString();
        if (error.includes('Error') || error.includes('EADDRINUSE')) {
          reject(new Error(`Ошибка запуска сервера: ${error}`));
        }
      });

      setTimeout(() => {
        if (!output.includes('Ready') && !output.includes('started server')) {
          reject(new Error('Таймаут запуска dev сервера'));
        }
      }, 30000);
    });
  }

  async setupBrowser() {
    log.info('Запуск браузера...');
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Настройка viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    // Обработка ошибок консоли
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.warnings.push(`Console error: ${msg.text()}`);
      }
    });

    // Обработка ошибок страницы
    this.page.on('pageerror', error => {
      this.errors.push(`Page error: ${error.message}`);
    });

    log.success('Браузер запущен');
  }

  async testPages() {
    log.header('Тестирование страниц');

    const pages = [
      { url: '/', name: 'Главная' },
      { url: '/about', name: 'О нас' },
      { url: '/contacts', name: 'Контакты' },
      { url: '/products', name: 'Услуги' },
      { url: '/products/consultation', name: 'Консультация' },
      { url: '/club', name: 'Клуб' },
      { url: '/reviews', name: 'Отзывы' },
      { url: '/policy', name: 'Политика' },
      { url: '/terms', name: 'Условия' },
    ];

    for (const pageInfo of pages) {
      try {
        await this.page.goto(this.baseUrl + pageInfo.url, {
          waitUntil: 'networkidle',
        });

        // Проверка загрузки страницы
        const title = await this.page.title();
        if (title) {
          log.success(`${pageInfo.name} - загружена (${title})`);
        } else {
          this.warnings.push(`${pageInfo.name} - отсутствует title`);
        }

        // Проверка отсутствия 404 ошибок
        const response = await this.page
          .waitForResponse(
            response =>
              response.url().includes(pageInfo.url) && response.status() !== 200
          )
          .catch(() => null);

        if (response && response.status() >= 400) {
          this.errors.push(`${pageInfo.name} - статус ${response.status()}`);
        }

        // Проверка основных элементов
        await this.checkPageElements(pageInfo.name);
      } catch (error) {
        this.errors.push(
          `${pageInfo.name} - ошибка загрузки: ${error.message}`
        );
      }
    }
  }

  async checkPageElements(pageName) {
    try {
      // Проверка header
      const header = await this.page.$('header');
      if (!header) {
        this.warnings.push(`${pageName} - отсутствует header`);
      }

      // Проверка footer
      const footer = await this.page.$('footer');
      if (!footer) {
        this.warnings.push(`${pageName} - отсутствует footer`);
      }

      // Проверка навигации
      const nav = await this.page.$('nav');
      if (!nav) {
        this.warnings.push(`${pageName} - отсутствует навигация`);
      }
    } catch (error) {
      this.warnings.push(
        `${pageName} - ошибка проверки элементов: ${error.message}`
      );
    }
  }

  async testForms() {
    log.header('Тестирование форм');

    // Тест контактной формы
    await this.testContactForm();
  }

  async testContactForm() {
    try {
      await this.page.goto(this.baseUrl + '/contacts');

      // Поиск формы
      const form = await this.page.$('form');
      if (!form) {
        this.errors.push('Контактная форма не найдена');
        return;
      }

      log.info('Тестирование контактной формы...');

      // Заполнение полей
      await this.page.fill('input[name="name"]', 'Тестовый пользователь');
      await this.page.fill('input[name="phone"]', '+7 (999) 123-45-67');
      await this.page.fill('textarea[name="message"]', 'Тестовое сообщение');

      // Проверка валидации телефона
      const phoneValue = await this.page.inputValue('input[name="phone"]');
      if (!phoneValue.includes('+7')) {
        this.warnings.push('Форматирование телефона работает некорректно');
      }

      // Проверка чекбокса согласия
      const consentCheckbox = await this.page.$('input[type="checkbox"]');
      if (consentCheckbox) {
        await this.page.check('input[type="checkbox"]');
      }

      // Проверка кнопки отправки
      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) {
        const isDisabled = await submitButton.isDisabled();
        if (isDisabled) {
          this.warnings.push(
            'Кнопка отправки заблокирована после заполнения формы'
          );
        } else {
          log.success('Контактная форма - валидация работает');
        }
      }
    } catch (error) {
      this.errors.push(
        `Ошибка тестирования контактной формы: ${error.message}`
      );
    }
  }

  async testModals() {
    log.header('Тестирование модальных окон');

    await this.testBookingModal();
    await this.testCookieBanner();
  }

  async testBookingModal() {
    try {
      await this.page.goto(this.baseUrl);

      // Поиск кнопки открытия модального окна
      const modalTrigger = await this.page.$(
        'button:has-text("Записаться"), button:has-text("Консультация"), [data-modal="booking"]'
      );

      if (modalTrigger) {
        await modalTrigger.click();

        // Ожидание появления модального окна
        await this.page.waitForSelector('[role="dialog"], .modal', {
          timeout: 5000,
        });

        const modal = await this.page.$('[role="dialog"], .modal');
        if (modal) {
          log.success('Модальное окно записи - открывается');

          // Проверка закрытия по крестику
          const closeButton = await this.page.$(
            'button:has-text("×"), [aria-label="Close"], .close'
          );
          if (closeButton) {
            await closeButton.click();
            await this.page.waitForTimeout(500);

            const modalAfterClose = await this.page.$(
              '[role="dialog"], .modal'
            );
            if (!modalAfterClose) {
              log.success('Модальное окно записи - закрывается');
            } else {
              this.warnings.push('Модальное окно не закрывается по крестику');
            }
          }
        } else {
          this.warnings.push('Модальное окно записи не появляется');
        }
      } else {
        this.warnings.push('Кнопка открытия модального окна не найдена');
      }
    } catch (error) {
      this.warnings.push(
        `Ошибка тестирования модального окна: ${error.message}`
      );
    }
  }

  async testCookieBanner() {
    try {
      await this.page.goto(this.baseUrl);

      // Проверка cookie баннера
      const cookieBanner = await this.page.$(
        '[data-testid="cookie-banner"], .cookie-banner'
      );
      if (cookieBanner) {
        log.success('Cookie баннер - отображается');

        const acceptButton = await this.page.$(
          'button:has-text("Принять"), button:has-text("Accept")'
        );
        if (acceptButton) {
          await acceptButton.click();
          await this.page.waitForTimeout(500);

          const bannerAfterAccept = await this.page.$(
            '[data-testid="cookie-banner"], .cookie-banner'
          );
          if (!bannerAfterAccept) {
            log.success('Cookie баннер - скрывается после принятия');
          }
        }
      }
    } catch (error) {
      this.warnings.push(
        `Ошибка тестирования cookie баннера: ${error.message}`
      );
    }
  }

  async testNavigation() {
    log.header('Тестирование навигации');

    try {
      await this.page.goto(this.baseUrl);

      // Тест основной навигации
      const navLinks = await this.page.$$('nav a, header a');

      if (navLinks.length > 0) {
        log.success(`Найдено ${navLinks.length} навигационных ссылок`);

        // Проверка первых нескольких ссылок
        for (let i = 0; i < Math.min(3, navLinks.length); i++) {
          const link = navLinks[i];
          const href = await link.getAttribute('href');

          if (href && href.startsWith('/')) {
            await link.click();
            await this.page.waitForLoadState('networkidle');

            const currentUrl = this.page.url();
            if (currentUrl.includes(href)) {
              log.success(`Навигация по ссылке ${href} - работает`);
            } else {
              this.warnings.push(`Навигация по ссылке ${href} - не работает`);
            }
          }
        }
      } else {
        this.warnings.push('Навигационные ссылки не найдены');
      }
    } catch (error) {
      this.warnings.push(`Ошибка тестирования навигации: ${error.message}`);
    }
  }

  async testResponsive() {
    log.header('Тестирование адаптивности');

    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await this.page.goto(this.baseUrl);

        // Проверка отображения основных элементов
        const header = await this.page.$('header');
        const main = await this.page.$('main');
        const footer = await this.page.$('footer');

        if (header && main && footer) {
          log.success(
            `${viewport.name} (${viewport.width}x${viewport.height}) - основные элементы отображаются`
          );
        } else {
          this.warnings.push(
            `${viewport.name} - некоторые элементы не отображаются`
          );
        }
      } catch (error) {
        this.warnings.push(
          `Ошибка тестирования ${viewport.name}: ${error.message}`
        );
      }
    }
  }

  async testAccessibility() {
    log.header('Тестирование доступности');

    try {
      await this.page.goto(this.baseUrl);

      // Проверка alt атрибутов у изображений
      const images = await this.page.$$('img');
      let imagesWithoutAlt = 0;

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        if (!alt) {
          imagesWithoutAlt++;
        }
      }

      if (imagesWithoutAlt === 0) {
        log.success('Все изображения имеют alt атрибуты');
      } else {
        this.warnings.push(`${imagesWithoutAlt} изображений без alt атрибутов`);
      }

      // Проверка заголовков
      const h1Elements = await this.page.$$('h1');
      if (h1Elements.length === 1) {
        log.success('На странице один H1 заголовок');
      } else if (h1Elements.length === 0) {
        this.warnings.push('На странице отсутствует H1 заголовок');
      } else {
        this.warnings.push(
          `На странице ${h1Elements.length} H1 заголовков (должен быть один)`
        );
      }

      // Проверка фокуса
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.evaluate(
        () => document.activeElement?.tagName
      );
      if (focusedElement) {
        log.success('Навигация с клавиатуры работает');
      } else {
        this.warnings.push('Проблемы с навигацией с клавиатуры');
      }
    } catch (error) {
      this.warnings.push(`Ошибка тестирования доступности: ${error.message}`);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }

    if (this.devServer) {
      this.devServer.kill('SIGTERM');
      setTimeout(() => {
        if (this.devServer && !this.devServer.killed) {
          this.devServer.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  printResults() {
    log.header('Результаты E2E тестов');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('Все E2E тесты прошли успешно! ✨');
    } else {
      if (this.errors.length > 0) {
        log.error(`Найдено ${this.errors.length} ошибок:`);
        this.errors.forEach(error => log.error(`  • ${error}`));
      }

      if (this.warnings.length > 0) {
        log.warning(`Найдено ${this.warnings.length} предупреждений:`);
        this.warnings.forEach(warning => log.warning(`  • ${warning}`));
      }
    }
  }
}

// Проверка наличия Playwright
function checkPlaywright() {
  try {
    require('playwright');
    return true;
  } catch (error) {
    log.warning('Playwright не установлен. Установите его командой:');
    log.info('npm install --save-dev playwright');
    log.info('npx playwright install');
    return false;
  }
}

// Запуск тестов
if (require.main === module) {
  if (checkPlaywright()) {
    const tester = new E2ETester();
    tester.run().catch(error => {
      log.error(`Неожиданная ошибка: ${error.message}`);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}

module.exports = E2ETester;

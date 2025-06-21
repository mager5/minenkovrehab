#!/usr/bin/env node

/**
 * Комплексный скрипт для проверки всех функций сайта перед коммитом
 * Проверяет сборку, страницы, API, формы, E2E тесты и другие компоненты
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

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

// Конфигурация проверок
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  pages: [
    '/',
    '/about',
    '/contacts',
    '/products',
    '/products/consultation',
    '/products/movement-analysis',
    '/club',
    '/reviews',
    '/policy',
    '/terms',
    '/requisites',
  ],
  apiEndpoints: ['/api/content-about'],
  forms: [
    {
      name: 'ContactForm',
      selector: 'form[data-testid="contact-form"]',
      fields: ['name', 'phone', 'message'],
      submitButton: 'button[type="submit"]',
    },
  ],
  modals: ['BookingModal', 'PaymentModal'],
};

class PreCommitChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.devServer = null;
    this.runE2E =
      process.argv.includes('--e2e') || process.argv.includes('--full');
    this.skipBuild = process.argv.includes('--skip-build');
    this.verbose =
      process.argv.includes('--verbose') || process.argv.includes('-v');
  }

  async run() {
    log.header('Запуск комплексной проверки перед коммитом');

    this.printOptions();

    try {
      await this.checkEnvironment();
      await this.runLinting();

      if (!this.skipBuild) {
        await this.checkBuild();
      }

      await this.startDevServer();
      await this.checkPages();
      await this.checkApiEndpoints();
      await this.checkStaticAssets();
      await this.checkSEO();
      await this.checkForms();

      if (this.runE2E) {
        await this.runE2ETests();
      }

      await this.stopDevServer();

      this.printSummary();

      if (this.errors.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      log.error(`Критическая ошибка: ${error.message}`);
      await this.stopDevServer();
      process.exit(1);
    }
  }

  printOptions() {
    if (this.verbose) {
      log.info('Опции запуска:');
      log.info(`  E2E тесты: ${this.runE2E ? 'включены' : 'отключены'}`);
      log.info(`  Сборка: ${this.skipBuild ? 'пропущена' : 'включена'}`);
      log.info(`  Подробный вывод: ${this.verbose ? 'включен' : 'отключен'}`);
      console.log('');
    }
  }

  async checkEnvironment() {
    log.header('Проверка окружения');

    // Проверка Node.js версии
    const nodeVersion = process.version;
    log.info(`Node.js версия: ${nodeVersion}`);

    // Проверка package.json
    if (!fs.existsSync('package.json')) {
      this.errors.push('package.json не найден');
      return;
    }

    // Проверка node_modules
    if (!fs.existsSync('node_modules')) {
      log.warning('node_modules не найден, устанавливаем зависимости...');
      try {
        execSync('npm install', { stdio: 'inherit' });
      } catch (error) {
        this.errors.push('Ошибка установки зависимостей');
        return;
      }
    }

    log.success('Окружение проверено');
  }

  async runLinting() {
    log.header('Проверка линтинга');

    try {
      const result = execSync('npm run lint', {
        stdio: 'pipe',
        encoding: 'utf8',
      });
      log.success('Линтинг прошел успешно');
      if (this.verbose && result) {
        console.log(result);
      }
    } catch (error) {
      this.errors.push('Ошибки линтинга найдены');
      log.error('Запустите "npm run lint" для просмотра ошибок');
      if (this.verbose) {
        console.log(error.stdout || error.message);
      }
    }
  }

  async checkBuild() {
    log.header('Проверка сборки');

    try {
      log.info('Запуск сборки...');
      execSync('npm run build', { stdio: 'inherit' });
      log.success('Сборка прошла успешно');

      // Проверка размера бандла
      const buildDir = '.next';
      if (fs.existsSync(buildDir)) {
        const stats = this.getBuildStats(buildDir);
        log.info(`Размер сборки: ${stats.size}`);

        if (stats.sizeBytes > 50 * 1024 * 1024) {
          // 50MB
          this.warnings.push('Размер сборки превышает 50MB');
        }
      }
    } catch (error) {
      this.errors.push('Ошибка сборки');
      log.error('Сборка завершилась с ошибкой');
    }
  }

  getBuildStats(buildDir) {
    let totalSize = 0;

    const calculateSize = dir => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          calculateSize(filePath);
        } else {
          totalSize += stat.size;
        }
      });
    };

    calculateSize(buildDir);

    return {
      sizeBytes: totalSize,
      size: this.formatBytes(totalSize),
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async startDevServer() {
    log.header('Запуск dev сервера');

    return new Promise((resolve, reject) => {
      this.devServer = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        detached: false,
      });

      let output = '';

      this.devServer.stdout.on('data', data => {
        output += data.toString();
        if (output.includes('Ready') || output.includes('started server')) {
          log.success('Dev сервер запущен');
          // Ждем немного для полной инициализации
          setTimeout(resolve, 3000);
        }
      });

      this.devServer.stderr.on('data', data => {
        const error = data.toString();
        if (error.includes('Error') || error.includes('EADDRINUSE')) {
          reject(new Error(`Ошибка запуска сервера: ${error}`));
        }
      });

      // Таймаут для запуска сервера
      setTimeout(() => {
        if (!output.includes('Ready') && !output.includes('started server')) {
          reject(new Error('Таймаут запуска dev сервера'));
        }
      }, config.timeout);
    });
  }

  async stopDevServer() {
    if (this.devServer) {
      log.info('Остановка dev сервера...');
      this.devServer.kill('SIGTERM');

      // Принудительное завершение через 5 секунд
      setTimeout(() => {
        if (this.devServer && !this.devServer.killed) {
          this.devServer.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  async checkPages() {
    log.header('Проверка страниц');

    for (const page of config.pages) {
      try {
        const response = await this.makeRequest(config.baseUrl + page);

        if (response.statusCode === 200) {
          log.success(`${page} - OK`);

          // Проверка базового содержимого
          if (
            response.body.includes('<html') &&
            response.body.includes('</html>')
          ) {
            // Проверка мета-тегов
            if (!response.body.includes('<title>')) {
              this.warnings.push(`${page} - отсутствует тег title`);
            }
            if (!response.body.includes('description')) {
              this.warnings.push(`${page} - отсутствует мета description`);
            }
          } else {
            this.warnings.push(`${page} - некорректная HTML структура`);
          }
        } else {
          this.errors.push(`${page} - статус ${response.statusCode}`);
        }
      } catch (error) {
        this.errors.push(`${page} - ошибка: ${error.message}`);
      }
    }
  }

  async checkApiEndpoints() {
    log.header('Проверка API эндпоинтов');

    for (const endpoint of config.apiEndpoints) {
      try {
        const response = await this.makeRequest(config.baseUrl + endpoint);

        if (response.statusCode === 200) {
          log.success(`${endpoint} - OK`);

          // Проверка JSON ответа
          try {
            JSON.parse(response.body);
          } catch {
            this.warnings.push(`${endpoint} - ответ не является валидным JSON`);
          }
        } else {
          this.errors.push(`${endpoint} - статус ${response.statusCode}`);
        }
      } catch (error) {
        this.errors.push(`${endpoint} - ошибка: ${error.message}`);
      }
    }
  }

  async checkStaticAssets() {
    log.header('Проверка статических ресурсов');

    const assets = [
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
      '/images/logo.svg',
      '/images/og-image.jpg',
    ];

    for (const asset of assets) {
      try {
        const response = await this.makeRequest(config.baseUrl + asset);

        if (response.statusCode === 200) {
          log.success(`${asset} - OK`);
        } else {
          this.warnings.push(`${asset} - статус ${response.statusCode}`);
        }
      } catch (error) {
        this.warnings.push(`${asset} - недоступен: ${error.message}`);
      }
    }
  }

  async checkSEO() {
    log.header('Проверка SEO элементов');

    const pages = [
      { url: '/', name: 'Главная' },
      { url: '/about', name: 'О нас' },
      { url: '/contacts', name: 'Контакты' },
      { url: '/products', name: 'Услуги' },
    ];

    for (const page of pages) {
      try {
        const response = await this.makeRequest(config.baseUrl + page.url);

        if (response.statusCode === 200) {
          const html = response.body;

          // Проверка title
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1].trim()) {
            if (this.verbose) {
              log.success(
                `${page.name} - title найден: "${titleMatch[1].trim()}"`
              );
            } else {
              log.success(`${page.name} - title найден`);
            }
          } else {
            this.warnings.push(`${page.name} - отсутствует или пустой title`);
          }

          // Проверка meta description
          const descMatch = html.match(
            /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i
          );
          if (descMatch && descMatch[1].trim()) {
            log.success(`${page.name} - meta description найден`);
          } else {
            this.warnings.push(`${page.name} - отсутствует meta description`);
          }

          // Проверка H1
          const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          if (h1Match && h1Match[1].trim()) {
            if (this.verbose) {
              log.success(`${page.name} - H1 найден: "${h1Match[1].trim()}"`);
            } else {
              log.success(`${page.name} - H1 найден`);
            }
          } else {
            this.warnings.push(`${page.name} - отсутствует H1`);
          }

          // Проверка Open Graph
          const ogTitleMatch = html.match(
            /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i
          );
          const ogDescMatch = html.match(
            /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i
          );

          if (ogTitleMatch && ogDescMatch) {
            log.success(`${page.name} - Open Graph теги найдены`);
          } else {
            this.warnings.push(`${page.name} - неполные Open Graph теги`);
          }
        } else {
          this.errors.push(
            `${page.name} - недоступна (статус ${response.statusCode})`
          );
        }
      } catch (error) {
        this.errors.push(
          `${page.name} - ошибка проверки SEO: ${error.message}`
        );
      }
    }
  }

  async checkForms() {
    log.header('Проверка форм и интерактивных элементов');

    try {
      // Проверка контактной формы
      const contactResponse = await this.makeRequest(
        config.baseUrl + '/contacts'
      );
      if (contactResponse.statusCode === 200) {
        const html = contactResponse.body;

        // Проверка наличия формы
        if (
          html.includes('<form') &&
          html.includes('name="name"') &&
          html.includes('name="phone"')
        ) {
          log.success('Контактная форма - структура найдена');
        } else {
          this.warnings.push('Контактная форма - неполная структура');
        }

        // Проверка валидации
        if (html.includes('required') || html.includes('pattern')) {
          log.success('Контактная форма - валидация настроена');
        } else {
          this.warnings.push('Контактная форма - отсутствует валидация');
        }
      }

      // Проверка главной страницы на наличие модальных окон
      const homeResponse = await this.makeRequest(config.baseUrl);
      if (homeResponse.statusCode === 200) {
        const html = homeResponse.body;

        if (
          html.includes('modal') ||
          html.includes('dialog') ||
          html.includes('popup')
        ) {
          log.success('Модальные окна - найдены в разметке');
        } else {
          this.warnings.push('Модальные окна - не найдены в разметке');
        }
      }
    } catch (error) {
      this.warnings.push(`Ошибка проверки форм: ${error.message}`);
    }
  }

  async runE2ETests() {
    log.header('Запуск E2E тестов');

    return new Promise(resolve => {
      const e2eScript = path.join(__dirname, 'e2e-tests.js');

      if (!fs.existsSync(e2eScript)) {
        this.warnings.push('E2E тесты - скрипт не найден');
        resolve();
        return;
      }

      const e2eProcess = spawn('node', [e2eScript], {
        stdio: this.verbose ? 'inherit' : 'pipe',
      });

      let output = '';

      if (!this.verbose) {
        e2eProcess.stdout.on('data', data => {
          output += data.toString();
        });

        e2eProcess.stderr.on('data', data => {
          output += data.toString();
        });
      }

      e2eProcess.on('close', code => {
        if (code === 0) {
          log.success('E2E тесты - все прошли успешно');
        } else {
          this.errors.push('E2E тесты - обнаружены ошибки');
          if (!this.verbose && output) {
            console.log('\nВывод E2E тестов:');
            console.log(output);
          }
        }
        resolve();
      });

      e2eProcess.on('error', error => {
        this.warnings.push(`E2E тесты - ошибка запуска: ${error.message}`);
        resolve();
      });
    });
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      const req = protocol.get(url, res => {
        let body = '';

        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Таймаут запроса'));
      });
    });
  }

  printSummary() {
    log.header('Результаты комплексной проверки');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('🎉 Все проверки прошли успешно! Готово к коммиту. ✨');
      if (this.runE2E) {
        log.success('✅ Включая E2E тесты - сайт полностью функционален!');
      }
    } else {
      if (this.errors.length > 0) {
        log.error(`Найдено ${this.errors.length} критических ошибок:`);
        this.errors.forEach(error => log.error(`  • ${error}`));
        console.log('');
        log.error('❌ Коммит заблокирован. Исправьте ошибки перед коммитом.');
      }

      if (this.warnings.length > 0) {
        log.warning(`Найдено ${this.warnings.length} предупреждений:`);
        this.warnings.forEach(warning => log.warning(`  • ${warning}`));

        if (this.errors.length === 0) {
          console.log('');
          log.warning(
            '⚠️  Коммит возможен, но рекомендуется исправить предупреждения.'
          );
        }
      }
    }

    // Статистика
    console.log('');
    log.info('📊 Статистика проверки:');
    log.info(`  • Критические ошибки: ${this.errors.length}`);
    log.info(`  • Предупреждения: ${this.warnings.length}`);
    log.info(`  • E2E тесты: ${this.runE2E ? 'выполнены' : 'пропущены'}`);
    log.info(`  • Сборка: ${this.skipBuild ? 'пропущена' : 'выполнена'}`);
  }
}

// Показать справку
function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}Скрипт комплексной проверки сайта перед коммитом${colors.reset}
`);
  console.log('Использование:');
  console.log('  node scripts/pre-commit-check.js [опции]\n');
  console.log('Опции:');
  console.log(
    '  --e2e, --full      Запустить полные E2E тесты (требует Playwright)'
  );
  console.log('  --skip-build       Пропустить этап сборки проекта');
  console.log('  --verbose, -v      Подробный вывод');
  console.log('  --help, -h         Показать эту справку\n');
  console.log('Примеры:');
  console.log('  npm run check                    # Базовая проверка');
  console.log('  npm run check:full               # Полная проверка с E2E');
  console.log('  node scripts/pre-commit-check.js --e2e --verbose');
  console.log('');
}

// Запуск проверки
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const checker = new PreCommitChecker();
  checker.run().catch(error => {
    console.error('Неожиданная ошибка:', error);
    process.exit(1);
  });
}

module.exports = PreCommitChecker;

# Быстрый старт: Улучшения качества кода

## 🚀 Немедленные действия (можно выполнить прямо сейчас)

### 1. Настройка Prettier

#### Установка
```bash
npm install --save-dev prettier
```

#### Создать .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### Создать .prettierignore
```
node_modules
.next
out
build
dist
*.min.js
*.min.css
package-lock.json
yarn.lock
```

#### Добавить скрипты в package.json
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### 2. Улучшение ESLint конфигурации

#### Установка дополнительных плагинов
```bash
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import eslint-plugin-unused-imports
```

#### Обновить .eslintrc.json
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "plugins": [
    "@typescript-eslint",
    "unused-imports"
  ],
  "rules": {
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        "vars": "all",
        "varsIgnorePattern": "^_",
        "args": "after-used",
        "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always"
      }
    ]
  },
  "settings": {
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

### 3. Настройка Husky и lint-staged

#### Установка
```bash
npm install --save-dev husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
```

#### Создать pre-commit hook
```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

#### Добавить в package.json
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

### 4. Базовая настройка тестирования

#### Установка Jest и Testing Library
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

#### Создать jest.config.js
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './'
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}

module.exports = createJestConfig(customJestConfig)
```

#### Создать jest.setup.js
```javascript
import '@testing-library/jest-dom'
```

#### Добавить скрипты тестирования
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 5. Улучшение TypeScript конфигурации

#### Обновить tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 📝 Создание базовых тестов

### Тест для validation.ts
```typescript
// src/lib/__tests__/validation.test.ts
import {
  validateEmail,
  validatePhone,
  validateName,
  sanitizeInput
} from '../validation'

describe('Validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phone', () => {
      expect(validatePhone('+7 (999) 123-45-67')).toBe(true)
    })

    it('should reject invalid phone', () => {
      expect(validatePhone('123')).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeInput(input)
      expect(result).not.toContain('<script>')
    })
  })
})
```

### Тест для компонента
```typescript
// src/components/__tests__/SafeIcon.test.tsx
import { render } from '@testing-library/react'
import { SafeIcon } from '../ui/SafeIcon'

describe('SafeIcon', () => {
  it('renders without crashing', () => {
    render(<SafeIcon name="home" />)
  })

  it('applies correct className', () => {
    const { container } = render(
      <SafeIcon name="home" className="test-class" />
    )
    expect(container.firstChild).toHaveClass('test-class')
  })
})
```

## 🔧 Скрипты для автоматизации

### Создать scripts/code-quality-check.js
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process')

const commands = [
  'npm run lint',
  'npm run format:check',
  'npm run test',
  'npm run build'
]

console.log('🔍 Запуск проверки качества кода...\n')

for (const command of commands) {
  try {
    console.log(`▶️ Выполняется: ${command}`)
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${command} - успешно\n`)
  } catch (error) {
    console.error(`❌ ${command} - ошибка`)
    process.exit(1)
  }
}

console.log('🎉 Все проверки пройдены успешно!')
```

### Обновить package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "quality-check": "node scripts/code-quality-check.js",
    "prepare": "husky install"
  }
}
```

## 📊 GitHub Actions для CI/CD

### Создать .github/workflows/quality-check.yml
```yaml
name: Code Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run ESLint
      run: npm run lint
    
    - name: Check Prettier formatting
      run: npm run format:check
    
    - name: Type check
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Build project
      run: npm run build
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## 🎯 Первые шаги (выполнить в порядке приоритета)

### Высокий приоритет (сегодня)
1. [ ] Установить и настроить Prettier
2. [ ] Обновить ESLint конфигурацию
3. [ ] Запустить `npm run format` для форматирования всего кода
4. [ ] Исправить все ESLint ошибки

### Средний приоритет (эта неделя)
1. [ ] Настроить Husky и lint-staged
2. [ ] Добавить базовые тесты
3. [ ] Обновить TypeScript конфигурацию
4. [ ] Создать GitHub Actions workflow

### Низкий приоритет (следующая неделя)
1. [ ] Добавить больше тестов
2. [ ] Настроить coverage reporting
3. [ ] Создать документацию
4. [ ] Оптимизировать build процесс

## 🚨 Важные команды для проверки

```bash
# Проверить качество кода
npm run quality-check

# Исправить автоматически исправимые проблемы
npm run lint:fix
npm run format

# Запустить тесты
npm run test:coverage

# Проверить типы
npm run type-check
```

---

**Начните с высокого приоритета и постепенно внедряйте остальные улучшения!**
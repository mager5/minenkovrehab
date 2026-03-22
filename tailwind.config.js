/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        'primary': '#0063A5', // синий (основной)
        'primary-dark': '#004D85', // темный синий
        'primary-light': '#E6F2F9', // светло-синий
        'secondary': '#E6F2F9', // голубой (фоновые блоки)
        light: '#F9FAFC', // светлый фон
        dark: '#333333', // основной текст
        'accent': '#2baa7e', // акценты (цены, кнопки) - зелёный
        'accent-light': '#D1F3EA', // светлый акцент
        'accent-dark': '#0E9673', // темный акцент
        'gray-50': '#F9FAFB',
        'gray-100': '#F3F4F6',
        'gray-200': '#E5E7EB',
        'gray-300': '#D1D5DB',
      },
      boxShadow: {
        card: '0 4px 15px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.1)',
        glow: '0 0 15px rgba(43, 170, 126, 0.5)',
        'glow-primary': '0 0 15px rgba(0, 99, 165, 0.5)',
      },
      dropShadow: {
        'glow': '0 0 8px rgba(43, 170, 126, 0.6)',
        'glow-white': '0 0 8px rgba(255, 255, 255, 0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontSize: {
        xs: ['var(--fs-xs)', { lineHeight: 'var(--lh-xs)' }],
        sm: ['var(--fs-sm)', { lineHeight: 'var(--lh-sm)' }],
        base: ['var(--fs-base)', { lineHeight: 'var(--lh-base)' }],
        lg: ['var(--fs-lg)', { lineHeight: 'var(--lh-lg)' }],
        xl: ['var(--fs-xl)', { lineHeight: 'var(--lh-xl)' }],
        '2xl': ['var(--fs-2xl)', { lineHeight: 'var(--lh-2xl)' }],
        '3xl': ['var(--fs-3xl)', { lineHeight: 'var(--lh-3xl)' }],
        '4xl': ['var(--fs-4xl)', { lineHeight: 'var(--lh-4xl)' }],
        '5xl': ['var(--fs-5xl)', { lineHeight: 'var(--lh-5xl)' }],
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        pulse: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

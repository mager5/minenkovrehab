'use client';

import { useState } from 'react';

type Settings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    telegram: string;
    whatsapp: string;
    vk: string;
  };
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Миненков Вадим | Физический реабилитолог',
    siteDescription: 'Профессиональный подход к физической реабилитации людей среднего и старшего возраста с травмами, операциями и дегенеративными изменениями.',
    contactEmail: 'minenkov.rehab@yandex.ru',
    contactPhone: '+7 (999) 123-45-67',
    address: 'г. Москва, ул. Примерная, д. 123',
    socialLinks: {
      telegram: 'https://t.me/minenkovrehab',
      whatsapp: 'https://wa.me/79991234567',
      vk: 'https://vk.com/minenkovrehab',
    },
  });

  const handleSave = () => {
    // Здесь будет сохранение настроек на сервере
    alert('Настройки сохранены!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Настройки сайта</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Основные настройки */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Основные настройки</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Название сайта
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Описание сайта
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Контактная информация */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Контактная информация</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Адрес
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Социальные сети */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Социальные сети</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Telegram
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.telegram}
                  onChange={(e) => setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, telegram: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.whatsapp}
                  onChange={(e) => setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, whatsapp: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  ВКонтакте
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.vk}
                  onChange={(e) => setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, vk: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Кнопка сохранения */}
          <div className="pt-6">
            <button
              onClick={handleSave}
              className="w-full bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md transition-colors duration-300"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  social: {
    instagram: string;
    telegram: string;
    whatsapp: string;
  };
}

export default function ContactsContentAdmin() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    email: '',
    address: '',
    social: {
      instagram: '',
      telegram: '',
      whatsapp: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/content-contacts')
      .then(res => res.json())
      .then(data => {
        setContactInfo(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: keyof ContactInfo['social'], value: string) => {
    setContactInfo(prev => ({
      ...prev,
      social: { ...prev.social, [platform]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/content-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo),
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление контактами</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <div>
            <label className="text-sm font-medium mb-1">Телефон</label>
            <input
              type="text"
              value={contactInfo.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1">Адрес</label>
            <textarea
              value={contactInfo.address}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Социальные сети</h2>
            
            <div>
              <label className="text-sm font-medium mb-1">Instagram</label>
              <input
                type="text"
                value={contactInfo.social.instagram}
                onChange={e => handleSocialChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1">Telegram</label>
              <input
                type="text"
                value={contactInfo.social.telegram}
                onChange={e => handleSocialChange('telegram', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="text"
                value={contactInfo.social.whatsapp}
                onChange={e => handleSocialChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>

          {success && <div className="text-green-600 text-center">Изменения сохранены!</div>}
          {error && <div className="text-red-600 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
} 
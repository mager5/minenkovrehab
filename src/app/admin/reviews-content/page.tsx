'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui';

interface Review {
  id: string;
  name: string;
  text: string;
  image: string;
}

export default function ReviewsContentAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/content-reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setLoading(false);
      });
  }, []);

  const handleReviewChange = (index: number, field: keyof Review, value: string) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    setReviews(newReviews);
  };

  const handleImageUpload = (index: number, path: string) => {
    handleReviewChange(index, 'image', path);
  };

  const addReview = () => {
    setReviews([...reviews, {
      id: Date.now().toString(),
      name: '',
      text: '',
      image: ''
    }]);
  };

  const removeReview = (index: number) => {
    setReviews(reviews.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/content-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews }),
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление отзывами</h1>

        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Отзыв #{index + 1}</h2>
                <button
                  onClick={() => removeReview(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Удалить
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя</label>
                  <input
                    type="text"
                    value={review.name}
                    onChange={e => handleReviewChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Текст отзыва</label>
                  <textarea
                    value={review.text}
                    onChange={e => handleReviewChange(index, 'text', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Фотография</label>
                  <ImageUpload
                    currentImage={review.image}
                    onUpload={(path) => handleImageUpload(index, path)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addReview}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors duration-300"
          >
            Добавить отзыв
          </button>

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
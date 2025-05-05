'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';

interface Review {
  id: string;
  name: string;
  text: string;
  photo: string;
  rating: number;
}

export default function ReviewsContentAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading reviews:', error);
        setError('Failed to load reviews');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete review');
      setReviews(prev => prev.filter(review => review.id !== id));
    } catch (error: unknown) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reviews Management</h1>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Review</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Enter reviewer's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Text</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Enter review text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select className="w-full p-2 border rounded">
                <option value="">Select rating</option>
                <option value="1">1 star</option>
                <option value="2">2 stars</option>
                <option value="3">3 stars</option>
                <option value="4">4 stars</option>
                <option value="5">5 stars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo</label>
              <ImageUpload
                onUpload={() => {
                  // Handle photo upload
                }}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Add Review
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Reviews List</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {review.photo && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={review.photo}
                          alt={review.name}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{review.name}</h3>
                          <div className="flex text-yellow-400 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-gray-300'}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-gray-600 mt-2">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 
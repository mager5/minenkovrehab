'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';

interface ImageItem {
  url: string;
  folder: string;
}

export default function ImagesAdmin() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        setImages(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading images:', error);
        setError('Failed to load images');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (url: string) => {
    try {
      const res = await fetch('/api/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Failed to delete image');
      setImages(prev => prev.filter(img => img.url !== url));
    } catch (error: unknown) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Image Management</h1>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <ImageUpload
            onUpload={url => {
              setImages(prev => [...prev, { url, folder: 'uploads' }]);
            }}
          />
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
          {images.length === 0 ? (
            <p className="text-gray-500">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-32">
                    <Image
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                    <button
                      onClick={() => handleDelete(image.url)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-1 text-sm text-gray-500 truncate">{image.folder}</div>
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
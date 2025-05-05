'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';
import { ProductsContent, Service } from '@/types/content';

export default function ProductsContentAdmin() {
  const [content, setContent] = useState<ProductsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/content-products')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading content:', error);
        setError('Failed to load content');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!content) return;
    
    try {
      const res = await fetch('/api/content-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error('Failed to save content');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: unknown) {
      console.error('Error saving content:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading || !content) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Products Content</h1>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">General Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={content.title}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  title: e.target.value
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={content.description}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  description: e.target.value
                } : null)}
                rows={3}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Background Image</label>
              <div className="flex items-center gap-4">
                {content.heroBg && (
                  <div className="relative w-32 h-32">
                    <Image
                      src={content.heroBg}
                      alt="Hero background"
                      fill
                      className="object-cover rounded"
                    />
                    <button
                      onClick={() => setContent(prev => prev ? {
                        ...prev,
                        heroBg: ''
                      } : null)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                )}
                <ImageUpload
                  onUpload={url => setContent(prev => prev ? {
                    ...prev,
                    heroBg: url
                  } : null)}
                  currentImage={content.heroBg}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <div className="space-y-6">
            {content.services.map((service: Service, index: number) => (
              <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service {index + 1} Title</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={e => {
                        const newServices = [...content.services];
                        newServices[index] = { ...service, title: e.target.value };
                        setContent(prev => prev ? { ...prev, services: newServices } : null);
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Service {index + 1} Description</label>
                    <textarea
                      value={service.description}
                      onChange={e => {
                        const newServices = [...content.services];
                        newServices[index] = { ...service, description: e.target.value };
                        setContent(prev => prev ? { ...prev, services: newServices } : null);
                      }}
                      rows={3}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Service {index + 1} Price</label>
                    <input
                      type="text"
                      value={service.price}
                      onChange={e => {
                        const newServices = [...content.services];
                        newServices[index] = { ...service, price: e.target.value };
                        setContent(prev => prev ? { ...prev, services: newServices } : null);
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Service {index + 1} Image</label>
                    <div className="flex items-center gap-4">
                      {service.image && (
                        <div className="relative w-32 h-32">
                          <Image
                            src={service.image}
                            alt={`Service ${index + 1}`}
                            fill
                            className="object-cover rounded"
                          />
                          <button
                            onClick={() => {
                              const newServices = [...content.services];
                              newServices[index] = { ...service, image: '' };
                              setContent(prev => prev ? { ...prev, services: newServices } : null);
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <ImageUpload
                        onUpload={url => {
                          const newServices = [...content.services];
                          newServices[index] = { ...service, image: url };
                          setContent(prev => prev ? { ...prev, services: newServices } : null);
                        }}
                        currentImage={service.image}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newService: Service = {
                  title: '',
                  description: '',
                  image: '',
                  price: ''
                };
                setContent(prev => prev ? {
                  ...prev,
                  services: [...prev.services, newService]
                } : null);
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Add Service
            </button>
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Save Changes
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded">
            Changes saved successfully!
          </div>
        )}
      </div>
    </div>
  );
} 
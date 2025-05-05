'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';

// Временный тип для материалов (позже заменим на реальный)
type Material = {
  id: string;
  title: string;
  description: string;
  image: string;
  file: string;
};

export default function MaterialsAdmin() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        setMaterials(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading materials:', error);
        setError('Failed to load materials');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/materials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete material');
      setMaterials(prev => prev.filter(material => material.id !== id));
    } catch (error: unknown) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Materials Management</h1>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Material</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Enter material title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Enter material description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <ImageUpload
                onUpload={() => {
                  // Handle image upload
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File</label>
              <input
                type="file"
                className="w-full p-2 border rounded"
                accept=".pdf,.doc,.docx"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Add Material
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Uploaded Materials</h2>
          {materials.length === 0 ? (
            <p className="text-gray-500">No materials uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {materials.map(material => (
                <div key={material.id} className="border rounded-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={material.image}
                      alt={material.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{material.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <a
                        href={material.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
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
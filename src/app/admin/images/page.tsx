'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type Image = {
  id: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
};

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    // Здесь будет реальная загрузка на сервер
    // Пока просто эмулируем загрузку
    const newImages = acceptedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    setImages(prev => [...prev, ...newImages]);
    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleDeleteImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Изображения</h1>

        {/* Область загрузки */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300
            ${isDragActive ? 'border-accent bg-accent-light' : 'border-gray-300 hover:border-accent'}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <p className="text-gray-600">Загрузка...</p>
          ) : isDragActive ? (
            <p className="text-accent">Отпустите файлы здесь...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Перетащите изображения сюда или нажмите для выбора
              </p>
              <p className="text-sm text-gray-500">
                Поддерживаемые форматы: PNG, JPG, JPEG, GIF, WEBP (до 5MB)
              </p>
            </div>
          )}
        </div>

        {/* Список изображений */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                <p className="text-xs text-gray-500">
                  {new Date(image.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
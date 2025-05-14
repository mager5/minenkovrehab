'use client';

import { useState, useCallback } from 'react';

interface ImageUploadProps {
  onUpload: (path: string) => void;
  currentImage?: string;
  folder?: string;
}

export default function ImageUpload({ onUpload, currentImage, folder }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, загрузите изображение');
      return;
    }

    await uploadFile(file);
  }, [onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  }, [onUpload]);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }

      const data = await response.json();
      onUpload(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    } finally {
      setIsUploading(false);
    }
  };

  // Вычисляем, что показывать в превью
  const previewImage = url && /^https?:\/\//.test(url) ? url : currentImage;

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        {isUploading ? (
          <div className="text-gray-500">Загрузка...</div>
        ) : (
          <div className="text-gray-500">
            Перетащите изображение сюда или кликните для выбора
          </div>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Вставьте ссылку на изображение (URL)"
          className="w-full px-3 py-2 border rounded-md"
          value={url}
          onChange={e => {
            setUrl(e.target.value);
            // onUpload не вызываем, чтобы не портить данные при ошибочном вводе
          }}
          onBlur={() => {
            if (url && /^https?:\/\//.test(url)) {
              onUpload(url);
            }
          }}
        />
        <div className="text-xs text-gray-400 mt-1">Можно вставить ссылку на изображение с Unsplash или другого сайта</div>
      </div>

      {previewImage && (
        <div className="mt-4">
          <img
            src={previewImage}
            alt="Текущее изображение"
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
} 
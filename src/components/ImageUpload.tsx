'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
}

export default function ImageUpload({ onUpload, currentImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, загрузите изображение');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }

      const data = await response.json();
      setPreviewImage(data.url);
      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  }, [uploadFile]);

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-accent bg-accent-light' : 'border-gray-300 hover:border-accent'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        <div className="text-gray-600">
          <p>Перетащите изображение сюда или кликните для выбора</p>
          <p className="text-sm text-gray-500 mt-1">Поддерживаются форматы: JPG, PNG, GIF</p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {previewImage && (
        <div className="relative w-full h-48 mt-4">
          <Image
            src={previewImage}
            alt="Preview"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
} 
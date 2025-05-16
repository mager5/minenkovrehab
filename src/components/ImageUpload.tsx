import React, { useCallback } from 'react';

interface ImageUploadProps {
  onUpload: (path: string) => void;
  currentImage?: string;
  folder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, currentImage, folder = 'hero' }) => {
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки');
      }

      const data = await response.json();
      onUpload(data.path);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Не удалось загрузить изображение');
    }
  }, [onUpload, folder]);

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleUpload}
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition">
        Загрузить изображение
      </div>
    </div>
  );
};

export default ImageUpload; 
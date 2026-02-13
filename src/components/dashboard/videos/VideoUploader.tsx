'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import {
  Loader2,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileVideo,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/auth/Input';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  onUploadComplete?: () => void;
}

export function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) {
        // 500MB limit
        setError('Файл слишком большой. Максимальный размер: 500MB');
        return;
      }
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      setError(null);
      setSuccess(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Вы должны быть авторизованы для загрузки видео');
      setUploading(false);
      return;
    }

    // Sanitize filename to avoid issues
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      // 1. Upload file to Storage
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Insert metadata into database
      const { error: dbError } = await supabase.from('videos').insert({
        user_id: user.id,
        title: title,
        description: description,
        file_path: filePath,
        size: file.size,
        mime_type: file.type,
      });

      if (dbError) {
        // Cleanup storage if db insert fails
        await supabase.storage.from('videos').remove([filePath]);
        throw dbError;
      }

      setSuccess(true);
      setFile(null);
      setTitle('');
      setDescription('');
      if (onUploadComplete) onUploadComplete();

      // Dispatch global event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('video-uploaded'));
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Ошибка при загрузке видео');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
      <h3 className='text-lg font-semibold mb-4 text-gray-900'>
        Загрузка нового видео
      </h3>

      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[200px]',
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <input {...getInputProps()} />
          <div className='bg-indigo-100 p-3 rounded-full mb-3'>
            <Upload className='h-6 w-6 text-indigo-600' />
          </div>
          <p className='text-base font-medium text-gray-700 mb-1'>
            {isDragActive ? 'Отпустите файл здесь' : 'Перетащите видео сюда'}
          </p>
          <p className='text-sm text-gray-500 mb-2'>
            или кликните для выбора файла
          </p>
          <p className='text-xs text-gray-400'>MP4, WebM, Ogg до 500MB</p>
        </div>
      ) : (
        <div className='space-y-4 animate-in fade-in zoom-in-95 duration-200'>
          <div className='flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100'>
            <div className='flex items-center space-x-3 truncate'>
              <div className='bg-indigo-100 p-2 rounded flex-shrink-0'>
                <FileVideo className='h-5 w-5 text-indigo-600' />
              </div>
              <div className='truncate'>
                <p className='text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs'>
                  {file.name}
                </p>
                <p className='text-xs text-gray-500'>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setError(null);
              }}
              className='text-gray-400 hover:text-red-500 transition-colors p-1'
              disabled={uploading}
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          <Input
            label='Название'
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={uploading}
            placeholder='Введите название видео'
          />

          <div className='space-y-1'>
            <label className='text-sm font-medium text-gray-700'>
              Описание
            </label>
            <textarea
              className='w-full min-h-[80px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all'
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={uploading}
              placeholder='Добавьте описание (необязательно)'
            />
          </div>

          {error && (
            <div className='flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-md text-sm'>
              <AlertCircle className='h-5 w-5 flex-shrink-0 mt-0.5' />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className='flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md text-sm'>
              <CheckCircle className='h-5 w-5' />
              <span>Видео успешно загружено!</span>
            </div>
          )}

          <div className='flex gap-3 pt-2'>
            <Button
              variant='outline'
              onClick={() => setFile(null)}
              disabled={uploading}
              className='w-full'
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !title.trim()}
              className='w-full'
            >
              {uploading ? (
                <div className='flex items-center justify-center space-x-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Загрузка...</span>
                </div>
              ) : (
                'Загрузить видео'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

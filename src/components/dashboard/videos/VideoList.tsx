'use client';

import { useEffect, useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import {
  Loader2,
  Trash2,
  Search,
  Play,
  FileVideo,
  Eye,
  Edit2,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Video {
  id: string;
  title: string;
  description: string;
  file_path: string;
  created_at: string;
  size: number;
  views: number;
  mime_type: string;
}

export function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    videoId: string | null;
    filePath: string | null;
  }>({
    isOpen: false,
    videoId: null,
    filePath: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit description state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/videos', { credentials: 'include' });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Auth session missing!');
      }

      const list = (payload.data?.videos as Video[]) || [];
      const thumbs =
        (payload.data?.thumbnailsById as Record<string, string>) || {};

      setVideos(list);
      setThumbnails(thumbs);
    } catch (error) {
      setVideos([]);
      setThumbnails({});
      setError(
        error instanceof Error ? error.message : 'Не удалось загрузить видео.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();

    const handleVideoUploaded = () => {
      fetchVideos();
    };

    window.addEventListener('video-uploaded', handleVideoUploaded);
    return () =>
      window.removeEventListener('video-uploaded', handleVideoUploaded);
  }, []);

  const handleDeleteClick = (
    id: string,
    filePath: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, videoId: id, filePath });
  };

  const confirmDelete = async () => {
    const { videoId, filePath } = deleteModal;
    if (!videoId || !filePath) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/videos/${encodeURIComponent(videoId)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Ошибка при удалении');
      }

      setVideos(videos.filter(v => v.id !== videoId));
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
        setVideoUrl(null);
      }
      setDeleteModal({ isOpen: false, videoId: null, filePath: null });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(video.id);
    setEditDescription(video.description || '');
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditDescription('');
  };

  const saveDescription = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingId) return;

    if (editDescription.length > 500) {
      alert('Описание не может превышать 500 символов');
      return;
    }

    // Basic sanitization: check for dangerous characters if strict mode is requested
    // "запрет на специальные символы" - interpreting as allowing standard text, punctuation, and emojis
    // Regex allowing: Letters (any lang), numbers, whitespace, standard punctuation, emojis
    // This is a loose interpretation. If "special characters" means ONLY letters/numbers, it would be stricter.
    // I'll go with a safe set: alphanumeric, spaces, basic punctuation.
    // Explicitly excluding < > { } to prevent HTML/JS injection vibes, though React escapes by default.
    const dangerousChars = /[<>{}]/;
    if (dangerousChars.test(editDescription)) {
      alert('Описание содержит запрещенные символы (<, >, {, })');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/videos/${encodeURIComponent(editingId)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ description: editDescription }),
        }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Ошибка при обновлении описания');
      }

      setVideos(
        videos.map(v =>
          v.id === editingId ? { ...v, description: editDescription } : v
        )
      );
      if (selectedVideo?.id === editingId) {
        setSelectedVideo({ ...selectedVideo, description: editDescription });
      }
      setEditingId(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении описания'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlay = async (video: Video) => {
    // If we are editing this video, don't play it when clicking the container
    if (editingId === video.id) return;

    setLoadingUrl(true);

    // Update local state immediately for better UX
    const updatedVideo = { ...video, views: (video.views || 0) + 1 };
    setVideos(prevVideos =>
      prevVideos.map(v => (v.id === video.id ? updatedVideo : v))
    );
    setSelectedVideo(updatedVideo);

    try {
      await fetch(`/api/videos/${encodeURIComponent(video.id)}/views`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => null);

      const response = await fetch(
        `/api/videos/signed-url?path=${encodeURIComponent(video.file_path)}`,
        { credentials: 'include' }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message || 'Не удалось получить ссылку на видео'
        );
      }
      setVideoUrl(payload.data.signedUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Не удалось получить ссылку на видео'
      );
    }
    setLoadingUrl(false);
  };

  const filteredVideos = videos.filter(
    video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className='flex justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin text-indigo-600' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 rounded-xl border border-gray-200 bg-white'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='h-5 w-5 text-red-600 mt-0.5' />
          <p className='text-sm text-gray-700 leading-relaxed'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title='Удаление видео'
        message='Вы действительно хотите удалить это видео? Это действие нельзя отменить.'
        confirmText='Удалить'
        cancelText='Отмена'
        isLoading={isDeleting}
        variant='danger'
      />

      <div className='flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
        <h2 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
          <FileVideo className='h-5 w-5 text-indigo-600' />
          Моя галерея
          <span className='text-sm font-normal text-gray-500 ml-2'>
            ({videos.length})
          </span>
        </h2>
        <div className='relative w-full sm:w-64'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Поиск видео...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors'
          />
        </div>
      </div>

      {selectedVideo && videoUrl && (
        <div className='bg-black rounded-lg overflow-hidden shadow-2xl mb-8 ring-1 ring-gray-900/10'>
          <div className='p-4 bg-gray-900 text-white flex justify-between items-center border-b border-gray-800'>
            <div>
              <h3 className='font-medium text-lg'>{selectedVideo.title}</h3>
              <p className='text-sm text-gray-400 flex items-center gap-3'>
                <span>
                  {new Date(selectedVideo.created_at).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>{formatSize(selectedVideo.size)}</span>
                <span>•</span>
                <span className='flex items-center text-gray-300'>
                  <Eye className='h-3 w-3 mr-1' />
                  {selectedVideo.views || 0}
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedVideo(null);
                setVideoUrl(null);
              }}
              className='p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white'
            >
              <span className='sr-only'>Закрыть</span>
              <X className='w-6 h-6' />
            </button>
          </div>
          <VideoPlayer src={videoUrl} type={selectedVideo.mime_type} />
          {selectedVideo.description && (
            <div className='p-6 bg-white border-t border-gray-100'>
              <h4 className='text-sm font-medium text-gray-900 mb-1'>
                Описание
              </h4>
              <p className='text-gray-600 leading-relaxed'>
                {selectedVideo.description}
              </p>
            </div>
          )}
        </div>
      )}

      {filteredVideos.length === 0 ? (
        <div className='text-center py-16 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
          <FileVideo className='h-12 w-12 mx-auto text-gray-400 mb-3' />
          <p className='text-lg font-medium text-gray-900'>Видео не найдены</p>
          <p className='text-sm text-gray-500'>
            Загрузите новое видео или измените параметры поиска
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className='group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col'
            >
              <div
                className='aspect-video bg-gray-100 relative cursor-pointer overflow-hidden group'
                onClick={() => handlePlay(video)}
              >
                {thumbnails[video.id] && (
                  <video
                    src={thumbnails[video.id] + '#t=0.1'}
                    className='absolute inset-0 w-full h-full object-cover'
                    preload='metadata'
                    muted
                    playsInline
                  />
                )}

                <div className='absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300' />

                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm z-10'>
                    <Play className='h-6 w-6 text-indigo-600 ml-1' />
                  </div>
                </div>

                <div className='absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                  {formatSize(video.size)}
                </div>
              </div>

              <div className='p-4 flex-1 flex flex-col'>
                <div className='flex justify-between items-start mb-2'>
                  <h4
                    className='font-medium text-gray-900 truncate flex-1 pr-2'
                    title={video.title}
                  >
                    {video.title}
                  </h4>
                  <button
                    onClick={e =>
                      handleDeleteClick(video.id, video.file_path, e)
                    }
                    className='text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors'
                    title='Удалить'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>

                {editingId === video.id ? (
                  <div
                    className='flex-1 mb-3'
                    onClick={e => e.stopPropagation()}
                  >
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className='w-full text-sm border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]'
                      placeholder='Введите описание...'
                      maxLength={500}
                    />
                    <div className='flex justify-end gap-2 mt-2'>
                      <button
                        onClick={cancelEdit}
                        className='p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded'
                        disabled={isSaving}
                        title='Отмена'
                      >
                        <X className='h-4 w-4' />
                      </button>
                      <button
                        onClick={saveDescription}
                        className='p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded'
                        disabled={isSaving}
                        title='Сохранить'
                      >
                        {isSaving ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Save className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='flex-1 mb-3 group/desc relative'>
                    <div className='flex gap-2'>
                      <p className='text-sm text-gray-500 line-clamp-2 flex-1'>
                        {video.description || 'Нет описания'}
                      </p>
                      <button
                        onClick={e => startEdit(video, e)}
                        className='opacity-0 group-hover/desc:opacity-100 text-gray-400 hover:text-indigo-600 p-0.5 transition-all'
                        title='Редактировать описание'
                      >
                        <Edit2 className='h-3 w-3' />
                      </button>
                    </div>
                  </div>
                )}

                <div className='pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between items-center'>
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  <div className='flex items-center space-x-3'>
                    <span className='flex items-center'>
                      <Eye className='h-3 w-3 mr-1' />
                      {video.views || 0}
                    </span>
                    <span>MP4</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

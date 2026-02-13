'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VideoPlayer } from './VideoPlayer';
import { Loader2, Trash2, Search, Play, FileVideo, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  const supabase = createClient();

  const fetchVideos = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setVideos(data);

      // Generate signed URLs for thumbnails
      const paths = data.map(v => v.file_path);
      if (paths.length > 0) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from('videos')
          .createSignedUrls(paths, 3600);

        if (signedData) {
          const newThumbnails: Record<string, string> = {};
          signedData.forEach(item => {
            if (item.path && item.signedUrl) {
              // Find video with this path to get ID (assuming paths are unique)
              const video = data.find(v => v.file_path === item.path);
              if (video) {
                newThumbnails[video.id] = item.signedUrl;
              }
            }
          });
          setThumbnails(newThumbnails);
        }
      }
    }
    setLoading(false);
  };

  // Expose fetchVideos to parent via ref or context if needed, but for now simple polling or re-fetch trigger is fine.
  // We can add a refresh button or auto-refresh after upload.
  // Actually, I'll export a refresh function or use a context, but simpler: pass a key to re-mount.
  // For now, I will just listen to a custom event or just let the user refresh.
  // Better: Export a method? No, keep it simple.

  // To update list after upload, we can use a shared context or just lift state up.
  // But since VideoUploader and VideoList are likely siblings, I should probably wrap them in a page component that manages the list state?
  // Or just trigger a refresh. I'll stick to local state and add a window event listener for 'video-uploaded' for simplicity.

  useEffect(() => {
    fetchVideos();

    const handleVideoUploaded = () => {
      fetchVideos();
    };

    window.addEventListener('video-uploaded', handleVideoUploaded);
    return () =>
      window.removeEventListener('video-uploaded', handleVideoUploaded);
  }, []);

  const handleDelete = async (
    id: string,
    filePath: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!confirm('Вы уверены, что хотите удалить это видео?')) return;

    const { error: storageError } = await supabase.storage
      .from('videos')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting file:', storageError);
      alert('Ошибка при удалении файла: ' + storageError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error deleting record:', dbError);
      alert('Ошибка при удалении записи');
      return;
    }

    setVideos(videos.filter(v => v.id !== id));
    if (selectedVideo?.id === id) {
      setSelectedVideo(null);
      setVideoUrl(null);
    }
  };

  const handlePlay = async (video: Video) => {
    setLoadingUrl(true);

    // Update local state immediately for better UX
    const updatedVideo = { ...video, views: (video.views || 0) + 1 };
    setVideos(prevVideos =>
      prevVideos.map(v => (v.id === video.id ? updatedVideo : v))
    );
    setSelectedVideo(updatedVideo);

    // Call RPC to update DB
    const { error: rpcError } = await supabase.rpc('increment_video_view', {
      video_id: video.id,
    });

    if (rpcError) {
      console.error('Error incrementing views:', rpcError);
    }

    // Try to get signed URL
    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUrl(video.file_path, 3600); // 1 hour

    if (error || !data) {
      console.error('Error creating signed url:', error);
      // Fallback to public URL if bucket is public (just in case)
      const { data: publicData } = supabase.storage
        .from('videos')
        .getPublicUrl(video.file_path);

      if (publicData) {
        setVideoUrl(publicData.publicUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Не удалось получить ссылку на видео');
      }
    } else {
      setVideoUrl(data.signedUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className='space-y-6'>
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
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                ></path>
              </svg>
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

                {/* Duration could go here if we had it */}
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
                    onClick={e => handleDelete(video.id, video.file_path, e)}
                    className='text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors'
                    title='Удалить'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>

                <p className='text-sm text-gray-500 line-clamp-2 mb-3 flex-1'>
                  {video.description || 'Нет описания'}
                </p>

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

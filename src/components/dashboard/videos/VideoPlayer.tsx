'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  type?: string;
}

export function VideoPlayer({
  src,
  poster,
  type = 'video/mp4',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isAccessible, setIsAccessible] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if video is accessible
    if (src) {
      fetch(src, { method: 'HEAD' })
        .then(res => {
          if (res.ok) {
            setIsAccessible(true);
          } else {
            setIsAccessible(false);
            // setError(`Ошибка доступа к файлу (${res.status}). Возможно, истекла ссылка или нет прав.`);
          }
        })
        .catch(() => {
          // Network error or CORS
          setIsAccessible(false);
          // Don't set error here immediately, let video element handle it if it fails
        });
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      let errorMessage = 'Ошибка воспроизведения видео.';

      if (videoElement.error) {
        switch (videoElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Загрузка видео прервана.';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Ошибка сети при загрузке видео.';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage =
              'Видео повреждено или формат не поддерживается браузером.';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage =
              'Формат видео не поддерживается или файл недоступен.';
            break;
          default:
            errorMessage = `Неизвестная ошибка: ${videoElement.error.message}`;
        }
      }
      setError(errorMessage);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('error', handleError);

    // Reset error when src changes
    setError(null);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('error', handleError);
    };
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time =
      (parseFloat(e.target.value) / 100) * (videoRef.current?.duration || 0);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className='relative w-full bg-black rounded-lg overflow-hidden group aspect-video'
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {error && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-900/90 z-20 p-4 text-center'>
          <div className='max-w-md'>
            <p className='text-red-500 font-medium mb-2'>
              Ошибка воспроизведения
            </p>
            <p className='text-white text-sm mb-4'>{error}</p>
            <p className='text-gray-400 text-xs'>
              Попробуйте обновить страницу или скачать файл.
            </p>
            <a
              href={src}
              download
              target='_blank'
              className='mt-4 inline-block px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors'
            >
              Скачать файл
            </a>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className='w-full h-full object-contain'
        onClick={togglePlay}
        playsInline
      >
        Your browser does not support the video tag.
      </video>

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress Bar */}
        <input
          type='range'
          min='0'
          max='100'
          value={progress}
          onChange={handleSeek}
          className='w-full h-1 mb-4 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all'
        />

        <div className='flex items-center justify-between text-white'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={togglePlay}
              className='hover:text-indigo-400 transition-colors'
            >
              {isPlaying ? (
                <Pause className='h-6 w-6' />
              ) : (
                <Play className='h-6 w-6' />
              )}
            </button>

            <div className='flex items-center space-x-2 group/volume'>
              <button
                onClick={toggleMute}
                className='hover:text-indigo-400 transition-colors'
              >
                {isMuted ? (
                  <VolumeX className='h-5 w-5' />
                ) : (
                  <Volume2 className='h-5 w-5' />
                )}
              </button>
              <input
                type='range'
                min='0'
                max='1'
                step='0.1'
                value={volume}
                onChange={handleVolumeChange}
                className='w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 opacity-0 group-hover/volume:opacity-100 transition-opacity'
              />
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <button
              onClick={toggleFullscreen}
              className='hover:text-indigo-400 transition-colors'
            >
              {isFullscreen ? (
                <Minimize className='h-5 w-5' />
              ) : (
                <Maximize className='h-5 w-5' />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

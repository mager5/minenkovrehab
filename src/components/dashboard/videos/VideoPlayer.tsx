'use client';

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveApiMediaUrl } from '@/lib/api-base';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  type?: string;
  /** Автозапуск после готовности (браузер может потребовать muted) */
  autoPlay?: boolean;
}

/** Относительные /api/...hls/... на GitHub Pages таймаутятся — всегда на api.minenkovrehab.ru */
function toPlayableSrc(src: string): string {
  return resolveApiMediaUrl(src) || src;
}

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ src, poster, type = 'video/mp4', autoPlay = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const suppressOverlayClickRef = useRef(false);
    const suppressVideoClickRef = useRef(false);
    const autoPlayAttemptedRef = useRef(false);
    const [resolvedSrc, setResolvedSrc] = useState(src);
    const blobUrlRef = useRef<string | null>(null);
    const blobFallbackAttemptedRef = useRef(false);
    const hlsRef = useRef<Hls | null>(null);
    const [useHlsJs, setUseHlsJs] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    // Автоплей чаще проходит в muted — звук включается кнопкой
    const [isMuted, setIsMuted] = useState(autoPlay);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [isLoading, setIsLoading] = useState(Boolean(src));
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [isAccessible, setIsAccessible] = useState<boolean | null>(null);

    useEffect(() => {
      // Старый вариант: setResolvedSrc(src) — относительный HLS открывался с minenkovrehab.ru
      setResolvedSrc(toPlayableSrc(src));
      blobFallbackAttemptedRef.current = false;
      autoPlayAttemptedRef.current = false;
      setUseHlsJs(false);
      setError(null);
      setIsLoading(Boolean(src));
      setIsPlaying(false);
      if (autoPlay) {
        setIsMuted(true);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    }, [src, autoPlay]);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
          if (!isPlaying) {
            videoRef.current.play().catch(() => {});
          }
        }
      },
      play: () => {
        videoRef.current?.play().catch(() => {});
      },
      pause: () => {
        videoRef.current?.pause();
      },
    }));

    useEffect(() => {
      // Check if video is accessible
      if (src) {
        // Пропускаем HEAD запрос, так как он вызывает ошибку "querystring must have required property 'token'"
        // для подписанных URL Supabase, если токен передан в query params.
        // Просто считаем, что видео доступно, и позволяем HTML5 video обработать ошибку загрузки.
        setIsAccessible(true);
      }
    }, [src]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const updateProgress = () => {
        if (video.duration) {
          setProgress((video.currentTime / video.duration) * 100);
          setCurrentTime(video.currentTime);
        }
      };

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsLoading(false);
      };

      const tryAutoplay = async () => {
        if (!autoPlay || autoPlayAttemptedRef.current || !video) return;
        autoPlayAttemptedRef.current = true;
        setShowControls(true);
        try {
          video.muted = false;
          setIsMuted(false);
          await video.play();
        } catch {
          try {
            video.muted = true;
            setIsMuted(true);
            await video.play();
          } catch {
            autoPlayAttemptedRef.current = false;
          }
        }
      };

      const handleLoadStart = () => setIsLoading(true);
      const handleWaiting = () => setIsLoading(true);
      const handleCanPlay = () => {
        setIsLoading(false);
        void tryAutoplay();
      };
      const handlePlaying = () => {
        setIsLoading(false);
      };
      const handlePlay = () => {
        setIsPlaying(true);
      };
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      // presentation-video/hls/master без .m3u8 в URL тоже HLS
      const isHls =
        type.toLowerCase().includes('mpegurl') ||
        /\.m3u8(\?|#|$)/i.test(String(src)) ||
        /\/hls\/(master|playlist)(\?|#|$)/i.test(String(src));

      if (isHls) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        const playableSrc = toPlayableSrc(src);

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          setUseHlsJs(false);
          setResolvedSrc(playableSrc);
        } else if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            backBufferLength: 90,
            xhrSetup: (xhr, url) => {
              try {
                // База — URL манифеста (api), не страница сайта (GitHub Pages)
                const resolved = new URL(url, playableSrc);
                const isMeniscusHlsApi = /\/api\/courses\/meniscus\/hls\//.test(
                  resolved.pathname
                );
                xhr.withCredentials = isMeniscusHlsApi;
              } catch {
                xhr.withCredentials = false;
              }
            },
          });
          hlsRef.current = hls;
          setUseHlsJs(true);
          hls.loadSource(playableSrc);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            void tryAutoplay();
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data?.fatal) return;
            if (hlsRef.current) {
              hlsRef.current.destroy();
              hlsRef.current = null;
            }
            setIsLoading(false);
            setError('Ошибка загрузки HLS видео.');
          });
        } else {
          setUseHlsJs(false);
          setError('HLS видео не поддерживается браузером.');
        }
      } else {
        setUseHlsJs(false);
      }

      const handleError = async (e: Event) => {
        setIsLoading(false);
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

        if (
          videoElement.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED &&
          !blobFallbackAttemptedRef.current &&
          resolvedSrc === src &&
          /^https?:\/\//i.test(src) &&
          !isHls
        ) {
          blobFallbackAttemptedRef.current = true;
          setIsLoading(true);

          try {
            const response = await fetch(src);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            blobUrlRef.current = objectUrl;
            setResolvedSrc(objectUrl);
            setError(null);
            return;
          } catch (_e) {
            setIsLoading(false);
          }
        }

        setError(errorMessage);
      };

      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);

      // Reset error when src changes
      setError(null);

      return () => {
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        setUseHlsJs(false);
      };
    }, [src, resolvedSrc, type, autoPlay]);

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => {
        document.removeEventListener(
          'fullscreenchange',
          handleFullscreenChange
        );
      };
    }, []);

    useEffect(() => {
      const video = videoRef.current as any;
      if (!video) return;
      const onBegin = () => setIsFullscreen(true);
      const onEnd = () => setIsFullscreen(false);
      video.addEventListener?.('webkitbeginfullscreen', onBegin);
      video.addEventListener?.('webkitendfullscreen', onEnd);
      return () => {
        video.removeEventListener?.('webkitbeginfullscreen', onBegin);
        video.removeEventListener?.('webkitendfullscreen', onEnd);
      };
    }, []);

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const startPlayback = async () => {
      const video = videoRef.current;
      if (!video) return;

      setShowControls(true);
      setError(null);

      try {
        await video.play();
      } catch {
        setIsLoading(false);
      }
    };

    const togglePlay = () => {
      const video = videoRef.current;
      if (!video) return;

      if (isPlaying) {
        video.pause();
        return;
      }

      void startPlayback();
    };

    const handleOverlayPlayAction = (
      event:
        | React.MouseEvent<HTMLButtonElement>
        | React.PointerEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();
      suppressVideoClickRef.current = true;
      window.setTimeout(() => {
        suppressVideoClickRef.current = false;
      }, 300);
      void startPlayback();
    };

    const handleOverlayPlayPointerUp = (
      event: React.PointerEvent<HTMLButtonElement>
    ) => {
      if (event.pointerType === 'mouse') return;
      suppressOverlayClickRef.current = true;
      handleOverlayPlayAction(event);
      window.setTimeout(() => {
        suppressOverlayClickRef.current = false;
      }, 300);
    };

    const handleOverlayPlayClick = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      if (suppressOverlayClickRef.current) return;
      handleOverlayPlayAction(event);
    };

    const handleVideoClick = () => {
      if (suppressVideoClickRef.current) return;
      togglePlay();
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
      const container = containerRef.current;
      const video = videoRef.current as any;
      if (!container || !video) return;

      if (!document.fullscreenElement) {
        if (typeof video.requestFullscreen === 'function') {
          video.requestFullscreen().catch(() => {});
          setIsFullscreen(true);
          return;
        }
        if (typeof video.webkitEnterFullscreen === 'function') {
          video.webkitEnterFullscreen();
          setIsFullscreen(true);
          return;
        }
        if (typeof container.requestFullscreen === 'function') {
          container.requestFullscreen().catch(() => {});
          setIsFullscreen(true);
          return;
        }
        return;
      }

      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
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

    const handleTouchStart = () => {
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
        onTouchStart={handleTouchStart}
      >
        {error && (
          <div className='absolute inset-0 flex items-center justify-center bg-gray-900/90 z-30 p-4 text-center'>
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

        {/* Loader */}
        {isLoading && !error && (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 z-10 pointer-events-none'>
            <Loader2 className='h-12 w-12 text-white animate-spin' />
            <p className='text-sm font-medium text-white/90'>
              Загрузка видео…
            </p>
          </div>
        )}

        <video
          ref={videoRef}
          src={useHlsJs ? undefined : resolvedSrc}
          poster={poster}
          className='w-full h-full object-contain'
          onClick={handleVideoClick}
          playsInline
          muted={isMuted}
          preload={autoPlay ? 'auto' : 'metadata'}
        >
          Your browser does not support the video tag.
        </video>

        {/* Play Button Overlay */}
        {!isPlaying && !error && !isLoading && (
          <div className='absolute inset-0 flex items-center justify-center z-20'>
            <button
              type='button'
              onClick={handleOverlayPlayClick}
              onPointerUp={handleOverlayPlayPointerUp}
              className='w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 backdrop-blur-sm active:scale-95 hover:scale-110 touch-manipulation'
              aria-label='Воспроизвести видео'
            >
              <Play className='h-8 w-8 text-indigo-600 ml-1' />
            </button>
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 transition-opacity duration-300 z-20',
            showControls
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          )}
        >
          <div className='flex justify-between items-center mb-2'>
            <div className='text-xs font-medium font-mono text-gray-300 min-w-[80px]'>
              <span>{formatTime(currentTime)}</span>
              <span className='mx-1 text-gray-500'>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

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
);

VideoPlayer.displayName = 'VideoPlayer';

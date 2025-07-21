'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Send, Phone, PhoneOff } from 'lucide-react';

interface HeyGenAvatarProps {
  avatarId?: string;
  voiceId?: string;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  className?: string;
}

export default function HeyGenAvatar({
  avatarId,
  voiceId,
  onSessionStart,
  onSessionEnd,
  className = '',
}: HeyGenAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>('');
  const [avatarId_internal, setAvatarId] = useState<string>(avatarId || '');
  const [voiceId_internal, setVoiceId] = useState<string>(voiceId || '');
  const [data, setData] = useState<any>();
  const [text, setText] = useState<string>('');
  const [initialized, setInitialized] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Инициализация аватара
  const initializeAvatar = useCallback(async () => {
    if (avatar.current) {
      return;
    }

    try {
      const newAvatar = new StreamingAvatar({
        token: '', // Будет установлен при создании сессии
      });

      // Обработчики событий
      newAvatar.on(StreamingEvents.AVATAR_START_TALKING, e => {
        console.log('Avatar started talking', e);
      });

      newAvatar.on(StreamingEvents.AVATAR_STOP_TALKING, e => {
        console.log('Avatar stopped talking', e);
      });

      newAvatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setIsConnected(false);
        endSession();
      });

      newAvatar.on(StreamingEvents.STREAM_READY, event => {
        console.log('Stream ready:', event.detail);
        setStream(event.detail);
        setIsConnected(true);
      });

      newAvatar.on(StreamingEvents.USER_START, event => {
        console.log('User started talking:', event);
      });

      newAvatar.on(StreamingEvents.USER_STOP, event => {
        console.log('User stopped talking:', event);
      });

      avatar.current = newAvatar;
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing avatar:', error);
      setDebug(`Initialization error: ${error}`);
    }
  }, []);

  // Создание сессии
  const createSession = useCallback(async () => {
    setIsLoadingSession(true);
    setDebug('Creating session...');

    try {
      // Получение токена
      const tokenResponse = await fetch('/api/heygen/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarId: avatarId_internal,
          voiceId: voiceId_internal,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get token');
      }

      const tokenData = await tokenResponse.json();

      if (!avatar.current) {
        await initializeAvatar();
      }

      if (avatar.current) {
        await avatar.current.createStartAvatar(
          {
            quality: AvatarQuality.High,
            avatarName: avatarId_internal,
            knowledgeId: knowledgeId,
            voice: {
              voiceId: voiceId_internal,
              rate: 1.0,
              emotion: VoiceEmotion.EXCITED,
            },
            language: 'ru',
          },
          tokenData.token
        );

        setData(tokenData);
        onSessionStart?.();
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setDebug(`Session creation error: ${error}`);
    } finally {
      setIsLoadingSession(false);
    }
  }, [
    avatarId_internal,
    voiceId_internal,
    knowledgeId,
    initializeAvatar,
    onSessionStart,
  ]);

  // Завершение сессии
  const endSession = useCallback(async () => {
    if (!avatar.current) {
      return;
    }

    try {
      await avatar.current.stopAvatar();
      setStream(undefined);
      setIsConnected(false);
      onSessionEnd?.();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [onSessionEnd]);

  // Отправка текста аватару
  const handleSpeak = useCallback(async () => {
    if (!avatar.current || !text.trim()) {
      return;
    }

    setIsLoadingRepeat(true);
    try {
      await avatar.current.speak({
        text: text,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
      setText('');
    } catch (error) {
      console.error('Error speaking:', error);
      setDebug(`Speaking error: ${error}`);
    } finally {
      setIsLoadingRepeat(false);
    }
  }, [text]);

  // Запуск записи голоса
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = event => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        // Здесь можно добавить обработку аудио (например, отправку на сервер для распознавания речи)
        console.log('Audio recorded:', audioBlob);
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  // Остановка записи голоса
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  }, [recording]);

  // Обновление видео потока
  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug('Playing');
      };
    }
  }, [stream]);

  // Инициализация при монтировании
  useEffect(() => {
    initializeAvatar();

    return () => {
      if (avatar.current) {
        avatar.current.stopAvatar();
      }
    };
  }, [initializeAvatar]);

  return (
    <div className={`heygen-avatar-container ${className}`}>
      <Card className='w-full max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>AI Консультант</span>
            <div className='flex gap-2'>
              {isConnected ? (
                <Button
                  onClick={endSession}
                  variant='destructive'
                  size='sm'
                  className='flex items-center gap-2'
                >
                  <PhoneOff className='w-4 h-4' />
                  Завершить
                </Button>
              ) : (
                <Button
                  onClick={createSession}
                  disabled={isLoadingSession}
                  size='sm'
                  className='flex items-center gap-2'
                >
                  <Phone className='w-4 h-4' />
                  {isLoadingSession ? 'Подключение...' : 'Начать консультацию'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Видео аватара */}
          <div className='relative aspect-video bg-gray-100 rounded-lg overflow-hidden'>
            {stream ? (
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='flex items-center justify-center h-full text-gray-500'>
                {isLoadingSession
                  ? 'Загрузка аватара...'
                  : 'Нажмите "Начать консультацию" для подключения'}
              </div>
            )}
          </div>

          {/* Панель управления */}
          {isConnected && (
            <div className='space-y-4'>
              {/* Текстовый ввод */}
              <div className='flex gap-2'>
                <Input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder='Введите ваш вопрос...'
                  onKeyPress={e => e.key === 'Enter' && handleSpeak()}
                  className='flex-1'
                />
                <Button
                  onClick={handleSpeak}
                  disabled={isLoadingRepeat || !text.trim()}
                  className='flex items-center gap-2'
                >
                  <Send className='w-4 h-4' />
                  {isLoadingRepeat ? 'Отправка...' : 'Отправить'}
                </Button>
              </div>

              {/* Голосовой ввод */}
              <div className='flex justify-center'>
                <Button
                  onClick={recording ? stopRecording : startRecording}
                  variant={recording ? 'destructive' : 'outline'}
                  className='flex items-center gap-2'
                >
                  {recording ? (
                    <>
                      <MicOff className='w-4 h-4' />
                      Остановить запись
                    </>
                  ) : (
                    <>
                      <Mic className='w-4 h-4' />
                      Говорить
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Отладочная информация */}
          {debug && (
            <div className='text-sm text-gray-600 bg-gray-50 p-2 rounded'>
              {debug}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Volume2, VolumeX } from 'lucide-react';

interface AvatarControlsProps {
  onAvatarChange?: (avatarId: string) => void;
  onVoiceChange?: (voiceId: string) => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

// Предустановленные аватары и голоса
const AVATARS = [
  { id: 'anna_public_3_20240108', name: 'Анна - Консультант' },
  { id: 'josh_lite3_20230714', name: 'Джош - Специалист' },
  { id: 'susan_public_2_20240328', name: 'Сьюзан - Эксперт' },
];

const VOICES = [
  { id: 'bae2d9c6057d4c85a9ac8b4b76a9e874', name: 'Русский женский голос' },
  { id: '2d5b0e6cf36f4a3bb6d5b8c4f2a1e9d8', name: 'Русский мужской голос' },
  { id: 'f4a3b2c1d5e6789012345678901234ab', name: 'Английский женский голос' },
];

export default function AvatarControls({
  onAvatarChange,
  onVoiceChange,
  onVolumeChange,
  className = '',
}: AvatarControlsProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleAvatarChange = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    onAvatarChange?.(avatarId);
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    onVoiceChange?.(voiceId);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    onVolumeChange?.(isMuted ? 0 : newVolume);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onVolumeChange?.(newMuted ? 0 : volume);
  };

  return (
    <div className={`avatar-controls ${className}`}>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center justify-between text-lg'>
            <span>Настройки аватара</span>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowSettings(!showSettings)}
              className='p-2'
            >
              <Settings className='w-4 h-4' />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Быстрые настройки */}
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Громкость</span>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleMute}
                className='p-2'
              >
                {isMuted ? (
                  <VolumeX className='w-4 h-4' />
                ) : (
                  <Volume2 className='w-4 h-4' />
                )}
              </Button>
              <Input
                type='range'
                min='0'
                max='100'
                value={volume}
                onChange={e => handleVolumeChange(Number(e.target.value))}
                className='w-20'
                disabled={isMuted}
              />
              <span className='text-sm text-gray-500 w-8'>
                {isMuted ? '0' : volume}%
              </span>
            </div>
          </div>

          {/* Расширенные настройки */}
          {showSettings && (
            <div className='space-y-4 pt-4 border-t'>
              {/* Выбор аватара */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Аватар</label>
                <Select
                  value={selectedAvatar}
                  onValueChange={handleAvatarChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите аватара' />
                  </SelectTrigger>
                  <SelectContent>
                    {AVATARS.map(avatar => (
                      <SelectItem key={avatar.id} value={avatar.id}>
                        {avatar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Выбор голоса */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Голос</label>
                <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите голос' />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Информация */}
              <div className='text-xs text-gray-500 bg-gray-50 p-3 rounded'>
                <p className='font-medium mb-1'>Советы по использованию:</p>
                <ul className='space-y-1'>
                  <li>• Говорите четко и не слишком быстро</li>
                  <li>• Используйте простые предложения</li>
                  <li>• Дождитесь окончания ответа аватара</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

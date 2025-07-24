import React from 'react';
import { Metadata } from 'next';
import { default as AvatarPage } from './AvatarPage';

export const metadata: Metadata = {
  title: 'AI Консультант | Центр Миненкова',
  description:
    'Получите персональную консультацию от AI-специалиста по реабилитации и восстановлению здоровья',
  keywords:
    'AI консультант, виртуальный врач, реабилитация, консультация онлайн',
};

export default function Avatar() {
  return <AvatarPage />;
}
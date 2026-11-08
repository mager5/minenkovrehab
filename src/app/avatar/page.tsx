import React from 'react';
import { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';
import { default as AvatarPage } from './AvatarPage';

export const metadata: Metadata = privateMetadata('AI-консультант | Вадим Миненков');

export default function Avatar() {
  return <AvatarPage />;
}

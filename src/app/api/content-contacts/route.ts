export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'content-contacts.json');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      // Если файла нет — возвращаем дефолтные значения
      return NextResponse.json({
        title: 'Контакты',
        description: 'Свяжитесь с нами',
        email: '',
        phone: '',
        address: '',
        social: {
          instagram: '',
          facebook: '',
          telegram: ''
        }
      });
    }
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    if (!data) {
      return NextResponse.json({
        phone: '+7 (999) 123-45-67',
        email: 'info@example.com',
        address: 'г. Москва, ул. Примерная, д. 1',
        social: {
          instagram: 'https://instagram.com/example',
          telegram: 'https://t.me/example',
          whatsapp: 'https://wa.me/79991234567'
        }
      });
    }
    return NextResponse.json(JSON.parse(data));
  } catch (error: unknown) {
    console.error('Error reading content:', error);
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newContent = await req.json();
    fs.writeFileSync(DATA_PATH, JSON.stringify(newContent, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error writing content:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 
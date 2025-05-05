export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'content-contacts.json');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      // Если файла нет — возвращаем дефолтные значения
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
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка чтения контактов' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newContent = await req.json();
    await fs.writeFile(DATA_PATH, JSON.stringify(newContent, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
} 
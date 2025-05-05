export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'content-about.json');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json({
        title: 'О нас',
        description: 'Информация о нас',
        experience: '',
        priceTitle: '',
        priceDescription: '',
        methodsTitle: '',
        methodsDescription: '',
        bg: ''
      });
    }

    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    const content = JSON.parse(data);
    return NextResponse.json(content);
  } catch (error: unknown) {
    console.error('Error reading content:', error);
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const content = await request.json();
    fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error writing content:', error);
    return NextResponse.json({ error: 'Failed to write content' }, { status: 500 });
  }
} 
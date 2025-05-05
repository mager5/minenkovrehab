export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'content-products.json');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json({
        title: 'Продукты',
        description: 'Наши продукты и услуги',
        products: []
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
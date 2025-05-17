export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'content-home.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const content = JSON.parse(data);
    if (!content.hero) content.hero = {};
    if (!('bg' in content.hero)) content.hero.bg = '';
    if (!content.about) content.about = {};
    if (!('bg' in content.about)) content.about.bg = '';
    return NextResponse.json(content);
  } catch (e) {
    return NextResponse.json({ error: 'Не удалось прочитать контент' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newContent = await req.json();
    await fs.writeFile(DATA_PATH, JSON.stringify(newContent, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
} 
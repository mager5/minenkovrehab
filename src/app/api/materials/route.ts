import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

const DATA_PATH = path.join(process.cwd(), 'materials.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const materials = JSON.parse(data);
    return NextResponse.json(materials);
  } catch (e) {
    // Если файла нет — возвращаем пустой массив
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const newMaterial = await req.json();
    let materials = [];
    try {
      const data = await fs.readFile(DATA_PATH, 'utf-8');
      materials = JSON.parse(data);
    } catch {}
    materials.push(newMaterial);
    await fs.writeFile(DATA_PATH, JSON.stringify(materials, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
} 
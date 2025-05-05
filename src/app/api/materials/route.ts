import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

const DATA_PATH = path.join(process.cwd(), 'materials.json');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json([]);
    }

    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error: unknown) {
    console.error('Error reading materials:', error);
    return NextResponse.json({ error: 'Failed to read materials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newMaterial = await req.json();
    let materials = [];
    try {
      const data = fs.readFileSync(DATA_PATH, 'utf-8');
      materials = JSON.parse(data);
    } catch {
      // File doesn't exist or is empty, start with empty array
      materials = [];
    }
    materials.push(newMaterial);
    fs.writeFileSync(DATA_PATH, JSON.stringify(materials, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error writing materials:', error);
    return NextResponse.json({ error: 'Failed to write materials' }, { status: 500 });
  }
} 
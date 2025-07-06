import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), 'content');
    const filePath = path.join(contentDir, 'home.json');
    
    console.log(`Loading home content from: ${filePath}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading home content:', error);
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
} 
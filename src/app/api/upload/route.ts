import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем директорию, если её нет
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder || '');
    await fs.mkdir(uploadDir, { recursive: true });

    // Генерируем уникальное имя файла
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name}`;
    const filepath = path.join(uploadDir, filename);

    // Сохраняем файл
    await fs.writeFile(filepath, buffer);

    // Возвращаем путь к файлу
    return NextResponse.json({ 
      success: true, 
      path: `/uploads/${folder ? `${folder}/` : ''}${filename}` 
    });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
  }
} 
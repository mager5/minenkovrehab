export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'content-home.json');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json({
        hero: {
          title: 'Физическая реабилитация',
          description: 'Профессиональная помощь в восстановлении здоровья и физической формы',
          bg: ''
        },
        about: {
          title: 'Обо мне',
          description: 'Опытный специалист по физической реабилитации',
          experience: '10+ лет опыта',
          priceTitle: 'Стоимость услуг',
          priceDescription: 'Индивидуальный подход к ценообразованию',
          methodsTitle: 'Методы работы',
          methodsDescription: 'Современные методики реабилитации',
          bg: ''
        },
        advantages: [
          {
            title: 'Экспертная Реабилитация',
            description: 'Профессиональный подход к восстановлению здоровья'
          },
          {
            title: 'Индивидуальный Подход',
            description: 'Персональные программы для каждого клиента'
          },
          {
            title: 'Удобный Формат',
            description: 'Гибкий график и комфортные условия'
          }
        ],
        stats: {
          satisfiedClients: 100,
          satisfiedClientsLabel: 'Довольных клиентов',
          consultations: 500,
          consultationsLabel: 'Проведенных консультаций',
          onlinePrograms: 50,
          onlineProgramsLabel: 'Онлайн-программ',
          experience: 10,
          experienceLabel: 'Лет опыта'
        },
        services: {
          title: 'Наши услуги',
          consultations: {
            title: 'Онлайн-консультации',
            description: 'Профессиональные консультации по вопросам реабилитации'
          },
          programs: {
            title: 'Индивидуальные программы',
            description: 'Разработка персональных программ восстановления'
          },
          analysis: {
            title: 'Анализ движения',
            description: 'Детальная оценка биомеханики движения'
          }
        },
        help: {
          title: 'Когда вам нужна помощь',
          subtitle: 'Мы готовы помочь',
          items: [
            {
              title: 'После травм',
              description: 'Восстановление после травм и операций'
            },
            {
              title: 'При хронических болях',
              description: 'Устранение хронических болей в спине и суставах'
            },
            {
              title: 'Для профилактики',
              description: 'Предотвращение проблем с опорно-двигательным аппаратом'
            }
          ]
        },
        cta: {
          title: 'Готовы начать восстановление?',
          description: 'Запишитесь на консультацию и получите индивидуальную программу восстановления',
          buttonText: 'Записаться на консультацию'
        }
      });
    }

    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    const content = JSON.parse(data);
    if (!('bg' in content.hero)) content.hero.bg = '';
    if (!('bg' in content.about)) content.about.bg = '';
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error reading content:', error);
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const content = await request.json();
    fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing content:', error);
    return NextResponse.json({ error: 'Failed to write content' }, { status: 500 });
  }
} 
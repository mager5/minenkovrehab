import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Проверяем наличие всех необходимых полей
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Необходимо заполнить все поля' },
        { status: 400 }
      );
    }

    // Настройка транспорта для отправки почты
    // Примечание: для продакшена нужно будет использовать реальные данные SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Boolean(process.env.EMAIL_SECURE) || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Настройка содержимого письма
    const mailOptions = {
      from: `"Сайт MinenkovRehab" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL || 'minenkov.rehab@yandex.ru',
      subject: `Новое сообщение от ${name}`,
      text: `Имя: ${name}\nEmail: ${email}\nСообщение: ${message}`,
      html: `
        <h2>Новое сообщение с формы контактов</h2>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Сообщение:</strong></p>
        <p>${message}</p>
      `,
    };

    // Отправка письма
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Сообщение успешно отправлено' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при отправке сообщения' },
      { status: 500 }
    );
  }
} 
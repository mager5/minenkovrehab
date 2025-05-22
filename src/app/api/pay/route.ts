export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';

function getToken(payload: Record<string, any>, password: string) {
  // Собираем только корневые поля, кроме Token, Receipt, DATA
  const tokenFields: Record<string, string> = {};
  for (const key of Object.keys(payload)) {
    if (!['Token', 'Receipt', 'DATA'].includes(key) && payload[key] !== undefined && payload[key] !== null) {
      tokenFields[key] = String(payload[key]).trim();
    }
  }
  // Добавляем пароль как отдельное поле
  tokenFields['Password'] = password;
  // Сортируем ключи по алфавиту
  const sortedKeys = Object.keys(tokenFields).sort();
  // Конкатенируем значения в одну строку
  let str = '';
  for (const key of sortedKeys) {
    str += tokenFields[key];
  }
  str = str.trim();
  console.log('TOKEN_STRING:', str);
  // Явно используем SHA-256 для генерации токена (UTF-8)
  const token = crypto.createHash('sha256').update(str, 'utf8').digest('hex');
  console.log('TOKEN_HASH (SHA-256):', token);
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const { email, phone, amount } = await req.json();
    if (!email || !phone || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const terminalKey = '1747487918046';
    const password = 'vj61KRU*m4C6nIlt';
    const orderId = 'ORD-' + Date.now();
    const description = 'Абонемент';
    // Временно фиксируем сумму для теста
    const amountKopecks = 10 * 100; // 10 рублей
    // Формируем payload с обязательным Receipt
    const receipt = {
      Email: email,
      Phone: phone,
      Taxation: 'usn_income',
      Items: [
        {
          Name: 'Абонемент',
          Price: amountKopecks,
          Quantity: 1,
          Amount: amountKopecks,
          Tax: 'none',
        },
      ],
    };
    const payload: Record<string, any> = {
      TerminalKey: terminalKey,
      Amount: amountKopecks,
      OrderId: orderId,
      Description: description,
      Receipt: receipt, // обязательно!
    };
    // Генерируем Token строго по документации
    payload.Token = getToken(payload, password);
    // Логируем финальный payload
    console.log('PAYLOAD_TO_BANK:', JSON.stringify(payload));
    const response = await axios.post('https://securepay.tinkoff.ru/v2/Init', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return NextResponse.json(response.data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.response?.data || err.toString() }, { status: 500 });
  }
} 
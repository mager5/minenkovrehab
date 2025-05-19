export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, amount } = await req.json();
    if (!email || !phone || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const receipt = {
      Email: email,
      Phone: phone,
      Taxation: 'osn',
      Items: [
        {
          Name: 'Абонемент',
          Price: amount * 100,
          Quantity: 1,
          Amount: amount * 100,
          Tax: 'none',
        },
      ],
    };
    const payload = {
      TerminalKey: '1747487918005DEMO',
      Amount: amount * 100,
      OrderId: 'ORD-' + Date.now(),
      Description: 'Абонемент',
      Receipt: receipt,
    };
    const response = await axios.post('https://securepay.tinkoff.ru/v2/Init', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return NextResponse.json(response.data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.response?.data || err.toString() }, { status: 500 });
  }
} 
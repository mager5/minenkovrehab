import { NextRequest, NextResponse } from 'next/server';
import { checkRobokassaSignature } from '@/lib/robokassa';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const outSum = formData.get('OutSum') as string;
    const invId = formData.get('InvId') as string;
    const signatureValue = formData.get('SignatureValue') as string;

    // Получаем custom параметры (Shp_)
    // Robokassa передает их как есть, но Next.js FormData может требовать итерации
    const shpParams: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (key.startsWith('Shp_')) {
        shpParams[key] = value as string;
      }
    });

    console.log('Robokassa Webhook:', {
      outSum,
      invId,
      signatureValue,
      shpParams,
    });

    if (!checkRobokassaSignature(outSum, invId, signatureValue, shpParams)) {
      console.error('Invalid signature');
      return new NextResponse('Bad signature', { status: 400 });
    }

    // Логика обработки успешной оплаты
    const supabase = createAdminClient();

    // 1. Обновляем статус покупки
    const { error: purchaseError } = await supabase
      .from('purchases')
      .update({ status: 'active', robokassa_invoice_id: invId })
      .match({ robokassa_invoice_id: invId }); // Это пример, логику нужно уточнить под процесс создания заказа

    // ВАЖНО: В текущей реализации мы еще не создавали запись purchase ДО оплаты.
    // Обычно flow такой:
    // 1. Клиент нажимает "Купить" -> создается запись в purchases со статусом 'pending'
    // 2. Клиент переходит в Robokassa
    // 3. Robokassa вызывает этот webhook -> мы обновляем статус на 'active'

    // Если у нас нет предварительной записи, нам нужно понимать, что именно купил пользователь.
    // Обычно это передается через Shp_ параметры (например Shp_ProductId, Shp_UserId).

    // Давайте пока просто вернем OK, чтобы Robokassa знала, что мы получили запрос.
    // Реальную бизнес-логику добавим, когда настроим создание заказа.

    return new NextResponse(`OK${invId}`, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

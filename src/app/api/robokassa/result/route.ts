import { NextRequest, NextResponse } from 'next/server';
import { checkRobokassaSignature } from '@/lib/robokassa';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { PURCHASE_CREDENTIALS_TEMPLATE } from '@/lib/email-templates';

// Helper to generate a strong password
function generatePassword(length = 12): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    const randomIndex = Math.floor(Math.random() * n);
    retVal += charset.charAt(randomIndex);
  }
  return retVal;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const outSum = formData.get('OutSum') as string;
    const invId = formData.get('InvId') as string;
    const signatureValue = formData.get('SignatureValue') as string;

    // Пытаемся получить email из стандартного поля или пользовательского параметра
    const email =
      (formData.get('Email') as string) ||
      (formData.get('Shp_Email') as string);

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
      email,
    });

    if (!checkRobokassaSignature(outSum, invId, signatureValue, shpParams)) {
      console.error('Invalid signature');
      return new NextResponse('Bad signature', { status: 400 });
    }

    // Логика обработки успешной оплаты
    const supabase = createAdminClient();

    // 1. Обновляем статус покупки (если запись существует)
    const { error: purchaseError } = await supabase
      .from('purchases')
      .update({ status: 'active', robokassa_invoice_id: invId })
      .match({ robokassa_invoice_id: invId });

    if (purchaseError) {
      // Не блокируем выполнение, если просто не нашли запись (возможно, она создается асинхронно или не была создана)
      console.log('Purchase update info:', purchaseError.message);
    }

    // 2. Создание пользователя и отправка письма с доступами
    if (email) {
      // Генерируем пароль
      const password = generatePassword();

      // Создаем пользователя через Admin API (обходит подтверждение почты, если email_confirm: true)
      const { data: userData, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: 'Покупатель', // Можно расширить, если передавать имя в Shp_Name
          },
        });

      let shouldSendEmail = false;

      if (!createError && userData.user) {
        console.log('User created successfully:', userData.user.id);
        shouldSendEmail = true;
      } else {
        console.log(
          'User creation skipped (likely exists):',
          createError?.message
        );
        // Для тестов: отправляем письмо даже если пользователь существует
        // В продакшене здесь должна быть другая логика (например, "Курс добавлен в ваш аккаунт")
        // shouldSendEmail = true; // Раскомментируйте для тестирования на существующем пользователе
      }

      // Временный лог для тестирования (чтобы видеть пароль в консоли)
      console.log('TEST CREDENTIALS:', { email, password });

      // Отправка письма с доступами через Resend SDK
      if (shouldSendEmail && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);

          // Подставляем данные в шаблон
          // Используем глобальную замену для надежности
          const htmlContent = PURCHASE_CREDENTIALS_TEMPLATE.replace(
            /{{ \.Email }}/g,
            email
          ).replace(/{{ \.Password }}/g, password);

          const data = await resend.emails.send({
            from: 'Вадим Миненков | Реабилитация <onboarding@resend.dev>',
            to: email,
            subject: 'Доступ к курсу открыт! Ваши данные для входа',
            html: htmlContent,
          });

          console.log('Email sent:', data);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      } else {
        if (!process.env.RESEND_API_KEY) {
          console.warn('RESEND_API_KEY is missing, skipping email sending');
        }
      }
    } else {
      console.warn('No email provided in payment notification');
    }

    return new NextResponse(`OK${invId}`, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

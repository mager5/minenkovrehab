import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { PURCHASE_CREDENTIALS_TEMPLATE } from '@/lib/email-templates';
import { generatePassword, signMagicToken } from '@/lib/auth/magic-link';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const name = (body.name as string | undefined)?.trim();
    const phone = (body.phone as string | undefined)?.trim();

    if (!email) {
      return NextResponse.json(
        { message: 'Email обязателен' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Некорректный формат email' },
        { status: 400 }
      );
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { message: 'Не настроен доступ к Supabase (SERVICE ROLE KEY)' },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();

    const password = generatePassword();

    let emailSent = false;
    let emailError: string | null = null;

    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name || 'Покупатель',
          phone,
        },
      });

    if (createError) {
      const message = (createError.message || '').toLowerCase();
      if (
        message.includes('already registered') ||
        message.includes('already been registered') ||
        message.includes('user already exists') ||
        message.includes('duplicate key') ||
        message.includes('violates unique constraint') ||
        message.includes('already exists') ||
        (message.includes('already') && message.includes('registered'))
      ) {
        // Пытаемся найти пользователя по email и сбросить ему пароль на новый
        try {
          // Перебираем страницы пользователей (до 10 страниц по 200 записей)
          let foundUser:
            | Awaited<
                ReturnType<typeof supabase.auth.admin.listUsers>
              >['data']['users'][number]
            | null = null;
          const PER_PAGE = 200;
          for (let page = 1; page <= 10; page++) {
            const { data: list, error: listErr } =
              await supabase.auth.admin.listUsers({
                page,
                perPage: PER_PAGE,
              });
            if (listErr) break;
            const hit =
              list?.users?.find(
                u => u.email?.toLowerCase() === email.toLowerCase()
              ) || null;
            if (hit) {
              foundUser = hit;
              break;
            }
            if (!list || list.users.length < PER_PAGE) {
              break; // больше страниц нет
            }
          }

          if (foundUser?.id) {
            // Сбрасываем пароль существующему пользователю на новый
            const newPassword = password; // используем уже сгенерированный
            await supabase.auth.admin.updateUserById(foundUser.id, {
              password: newPassword,
            });

            // Формируем magic-link под наш механизм (вход по email+паролю)
            const siteUrl = (() => {
              try {
                const origin = new URL(req.url).origin;
                return (
                  origin ||
                  process.env.NEXT_PUBLIC_SITE_URL ||
                  'https://minenkovrehab.ru'
                );
              } catch {
                return (
                  process.env.NEXT_PUBLIC_SITE_URL || 'https://minenkovrehab.ru'
                );
              }
            })();
            // Старый вариант: без fallback, падали при отсутствии AUTH_LINK_SECRET
            // const token = signMagicToken({ email, password: newPassword });
            // const magicLink = `${siteUrl}/api/auth/magic-link?token=${encodeURIComponent(
            //   token
            // )}`;

            let magicLink = `${siteUrl}/login`;
            try {
              const token = signMagicToken({
                email,
                password: newPassword,
              });
              magicLink = `${siteUrl}/api/auth/magic-link?token=${encodeURIComponent(
                token
              )}`;
            } catch (e) {
              console.error('Magic link generation error (reset):', e);
            }

            // Письмо через Resend
            if (process.env.RESEND_API_KEY) {
              try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const htmlContent = PURCHASE_CREDENTIALS_TEMPLATE.replace(
                  /{{ \.Email }}/g,
                  email
                )
                  .replace(/{{ \.Password }}/g, newPassword)
                  .replace(/https:\/\/minenkovrehab\.ru\/login/g, magicLink);

                const sendResult = await resend.emails.send({
                  from: 'Вадим Миненков | Реабилитация <onboarding@resend.dev>',
                  to: email,
                  subject: 'Доступ к курсу обновлён',
                  html: htmlContent,
                });

                // Базовая проверка статуса отправки
                if (sendResult?.error) {
                  emailError =
                    'Resend вернул ошибку при отправке письма (reset).';
                  console.error(
                    'Error sending email via Resend (exists-reset):',
                    sendResult.error
                  );
                } else {
                  emailSent = true;
                }
              } catch (e) {
                emailError =
                  'Исключение при попытке отправить письмо через Resend (reset).';
                console.error(
                  'Error sending email via Resend (exists-reset):',
                  e
                );
              }
            } else {
              emailError =
                'RESEND_API_KEY не настроен, письмо с доступом не отправлено (reset).';
              console.warn('RESEND_API_KEY is missing, skipping email sending');
            }

            return NextResponse.json(
              {
                status: 'reset',
                message:
                  'Пользователь уже существовал. Мы обновили пароль и отправили доступ на указанный email.',
                emailSent,
                emailError,
              },
              { status: 200 }
            );
          }
        } catch (e) {
          console.error('Exists-handling failed:', e);
          // Если что-то пошло не так, возвращаем стандартный ответ "exists"
          return NextResponse.json(
            {
              status: 'exists',
              message:
                'Пользователь с таким email уже зарегистрирован. Используйте форму входа.',
            },
            { status: 200 }
          );
        }

        // Если не нашли пользователя — возвращаем exists с инструкцией
        return NextResponse.json(
          {
            status: 'exists',
            message:
              'Пользователь с таким email уже зарегистрирован. Используйте форму входа.',
            emailSent,
            emailError:
              emailError ||
              'Мы не смогли автоматически отправить письмо. Попробуйте войти через форму авторизации.',
          },
          { status: 200 }
        );
      }

      console.error('Admin createUser error:', createError);
      return NextResponse.json(
        {
          message: `Не удалось создать пользователя: ${createError.message || 'неизвестная ошибка'}`,
        },
        { status: 500 }
      );
    }

    if (!userData || !userData.user) {
      return NextResponse.json(
        { message: 'Не удалось создать пользователя' },
        { status: 500 }
      );
    }

    const siteUrl = (() => {
      try {
        const origin = new URL(req.url).origin;
        return (
          origin ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          'https://minenkovrehab.ru'
        );
      } catch {
        return process.env.NEXT_PUBLIC_SITE_URL || 'https://minenkovrehab.ru';
      }
    })();
    // Старый вариант: всегда требуем AUTH_LINK_SECRET и падаем, если он не настроен
    // const token = signMagicToken({ email, password });
    // const magicLink = `${siteUrl}/api/auth/magic-link?token=${encodeURIComponent(
    //   token
    // )}`;

    // Новый вариант: пытаемся сгенерировать magic-link, но если секрет не настроен,
    // не падаем с 500, а просто используем стандартную страницу логина.
    let magicLink = `${siteUrl}/login`;
    try {
      const token = signMagicToken({ email, password });
      magicLink = `${siteUrl}/api/auth/magic-link?token=${encodeURIComponent(
        token
      )}`;
    } catch (e) {
      console.error('Magic link generation error (create):', e);
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const htmlContent = PURCHASE_CREDENTIALS_TEMPLATE.replace(
          /{{ \.Email }}/g,
          email
        )
          .replace(/{{ \.Password }}/g, password)
          .replace(/https:\/\/minenkovrehab\.ru\/login/g, magicLink);

        const sendResult = await resend.emails.send({
          from: 'Вадим Миненков | Реабилитация <onboarding@resend.dev>',
          to: email,
          subject: 'Доступ к курсу открыт! Ваши данные для входа',
          html: htmlContent,
        });

        if (sendResult?.error) {
          emailError =
            'Resend вернул ошибку при отправке письма (create). Подробности в логах сервера.';
          console.error('Error sending email via Resend:', sendResult.error);
        } else {
          emailSent = true;
        }
      } catch (e) {
        emailError =
          'Исключение при попытке отправить письмо через Resend (create).';
        console.error('Error sending email via Resend:', e);
      }
    } else {
      emailError =
        'RESEND_API_KEY не настроен, письмо с доступом не отправлено (create).';
      console.warn('RESEND_API_KEY is missing, skipping email sending');
    }

    return NextResponse.json(
      {
        status: 'created',
        message:
          'Личный кабинет создан. Проверьте указанный email для получения доступа.',
        emailSent,
        emailError,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mock payment complete error:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

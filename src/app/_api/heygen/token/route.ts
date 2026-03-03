import { NextRequest, NextResponse } from 'next/server';

// Явно указываем что роут должен быть динамическим только если не статический экспорт
export const dynamic =
  process.env.GITHUB_ACTIONS && process.env.NODE_ENV === 'production'
    ? undefined
    : 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Делаем парсинг JSON опциональным, так как новый код может отправлять пустое тело
    let avatarId, voiceId;
    try {
      const body = await request.json();
      avatarId = body.avatarId;
      voiceId = body.voiceId;
    } catch (e) {
      // Если тело запроса пустое или невалидное, используем значения по умолчанию
      avatarId = undefined;
      voiceId = undefined;
    }

    const apiKey = process.env.HEYGEN_API_KEY;

    if (!apiKey) {
      console.error('HeyGen API key not configured');
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      );
    }

    // Генерация токена для HeyGen Streaming Avatar
    const response = await fetch(
      'https://api.heygen.com/v1/streaming.create_token',
      {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_id: avatarId || process.env.HEYGEN_AVATAR_ID,
          voice_id: voiceId || process.env.HEYGEN_VOICE_ID,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('HeyGen API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create HeyGen token' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Логируем ответ от HeyGen API для диагностики
    console.log('HeyGen API response:', JSON.stringify(data, null, 2));

    // Проверяем структуру ответа
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format from HeyGen API');
      return NextResponse.json(
        { error: 'Invalid response format from HeyGen API' },
        { status: 500 }
      );
    }

    // HeyGen API возвращает данные в структуре { data: { token: ... } }
    // Нормализуем ответ для клиента, который ожидает { data: { token: ... } }
    // Добавляем дополнительную проверку на null для data
    const token =
      (data && data.data && data.data.token) ||
      (data && data.access_token) ||
      (data && data.token);

    // Проверяем что токен действительно получен
    if (!token || token === null || token === undefined || token === '') {
      console.error('No valid token received from HeyGen API:', data);
      return NextResponse.json(
        { error: 'No valid token received from HeyGen API' },
        { status: 500 }
      );
    }

    // Возвращаем токен в простой структуре, как ожидает фронтенд (исправлено)
    const normalizedResponse = {
      token: token,
    };

    console.log('Sending normalized response:', normalizedResponse);
    return NextResponse.json(normalizedResponse);
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

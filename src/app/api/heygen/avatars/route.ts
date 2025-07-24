import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      );
    }

    // Получаем список аватаров от HeyGen
    const response = await fetch(
      'https://api.heygen.com/v1/streaming/avatar.list',
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('HeyGen API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `HeyGen API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Фильтруем только публичные аватары
    const publicAvatars =
      data.data?.filter((avatar: any) => avatar.is_public) || [];

    return NextResponse.json({
      success: true,
      avatars: publicAvatars,
      total: publicAvatars.length,
    });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatars' },
      { status: 500 }
    );
  }
}

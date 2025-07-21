import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { avatarId, voiceId } = await request.json();

    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, text } = await request.json();

    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      );
    }

    let endpoint = '';
    let body = {};

    switch (action) {
      case 'start':
        endpoint = 'https://api.heygen.com/v1/streaming.start';
        body = {
          session_id: sessionId,
        };
        break;

      case 'speak':
        endpoint = 'https://api.heygen.com/v1/streaming.task';
        body = {
          session_id: sessionId,
          text: text,
          task_type: 'talk',
        };
        break;

      case 'stop':
        endpoint = 'https://api.heygen.com/v1/streaming.stop';
        body = {
          session_id: sessionId,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`HeyGen API error (${action}):`, errorData);
      return NextResponse.json(
        { error: `Failed to ${action} session` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Session management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

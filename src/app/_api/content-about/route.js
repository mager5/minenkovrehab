// API endpoint for about content

export function GET() {
  return new Response(
    JSON.stringify({ message: 'API endpoint available', data: {} }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

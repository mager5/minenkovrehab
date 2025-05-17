// Заглушка для маршрута API, которая возвращает пустые данные
// Это нужно только для сборки статического сайта

export function GET() {
  return new Response(JSON.stringify({ error: "API disabled" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
} 
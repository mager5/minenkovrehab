import { ImageResponse } from 'next/og';

export const alt = 'Контакты Миненков Вадим Реабилитация';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Добавляем статический режим для экспорта
export const dynamic = 'force-static';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>Контакты | Миненков Вадим</div>
      </div>
    ),
  );
} 
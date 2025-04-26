"use client";

import { isRetinaDisplay } from '@/utils/imageUtils';

export default function RetinaStatus() {
  return (
    <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-6">
      <p className="font-medium">
        {`Ваш дисплей ${isRetinaDisplay() ? 'поддерживает' : 'не поддерживает'} Retina разрешение.`}
      </p>
      <p className="text-sm mt-2">
        Примечание: Это определяется на стороне клиента при рендеринге страницы.
      </p>
    </div>
  );
} 
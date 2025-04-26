import RetinaImage from '@/components/RetinaImage';
import { getRetinaImagePath } from '@/utils/imageUtils.server';
import RetinaStatus from './retina-status';

export default function RetinaExamplePage() {
  // В реальном проекте эти изображения должны существовать
  const normalImagePath = '/images/example.jpg';
  const retinaImagePath = getRetinaImagePath(normalImagePath); // Теперь используем серверную функцию

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Пример работы с Retina дисплеями</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Компонент RetinaImage</h2>
        <p className="mb-4">
          Этот компонент автоматически определяет тип дисплея и загружает соответствующее изображение:
        </p>
        
        <div className="mb-6 p-4 bg-gray-100 rounded">
          {/* Используем RetinaImage в клиенте */}
          <RetinaImage 
            src={normalImagePath}
            retinaImg={retinaImagePath}
            alt="Пример изображения"
            width={400}
            height={300}
            className="rounded-lg"
          />
        </div>
        
        <RetinaStatus />
        
        <h3 className="text-lg font-semibold mb-2">Как использовать:</h3>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto mb-4">
          {`import RetinaImage from '@/components/RetinaImage';
          
// Базовое использование
<RetinaImage 
  src="/images/normal.jpg"
  retinaImg="/images/retina@2x.jpg"
  alt="Alt text"
  width={400}
  height={300}
/>

// С дополнительными классами
<RetinaImage 
  src="/images/normal.jpg"
  retinaImg="/images/retina@2x.jpg"
  alt="Alt text"
  width={400}
  height={300}
  className="rounded-lg shadow-md"
/>`}
        </pre>
      </div>
    </div>
  );
} 
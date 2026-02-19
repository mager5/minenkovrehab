import { VideoUploader } from '@/components/dashboard/videos/VideoUploader';
import { VideoList } from '@/components/dashboard/videos/VideoList';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Мои видео | Личный кабинет',
  description: 'Управление видеоматериалами',
};

export default async function VideosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center'>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
            Видеогалерея
          </h1>
        </div>
      </header>
      <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-1'>
            <div className='sticky top-6 space-y-6'>
              <div className='bg-indigo-50 border border-indigo-100 rounded-lg p-4'>
                <h3 className='font-semibold text-indigo-900 mb-2'>
                  О видеогалерее
                </h3>
                <p className='text-sm text-indigo-700'>
                  Здесь вы можете загружать свои видеоматериалы (например,
                  выполнение упражнений) для отслеживания прогресса.
                  Поддерживаются форматы MP4, WebM, OGG. Максимальный размер
                  файла — 500 МБ.
                </p>
              </div>
              <VideoUploader />
            </div>
          </div>

          <div className='lg:col-span-2'>
            <VideoList />
          </div>
        </div>
      </main>
    </div>
  );
}

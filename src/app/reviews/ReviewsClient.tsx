// Страница отзывов. Тексты отзывов — в src/data/content.ts (reviewsContent, TODO: подтвердить владельцу).
import { PageHead, ButtonLink, CtaPanel, Icon } from '@/components/ds';
import { reviewsContent } from '@/data/content';

export default function ReviewsClient() {
  return (
    <div className='ds'>
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Отзывы' }]}
        title='Отзывы моих клиентов'
        lead='Истории людей, которые вернулись к полноценной, физически активной жизни.'
      />

      <section className='ds-wrap ds-sec'>
        <h2 className='sr-only'>Отзывы</h2>
        <div className='grid gap-4 dsk:gap-6 sm:grid-cols-2 dsk:grid-cols-3'>
          {reviewsContent.map((r, i) => (
            <figure
              key={r.name}
              className='ds-card m-0 p-6 dsk:p-8 flex flex-col gap-5'
            >
              <figcaption className='flex gap-3.5 items-center'>
                <span
                  aria-hidden='true'
                  className={`flex-none w-[52px] h-[52px] rounded-full font-extrabold text-[20px] flex items-center justify-center ${
                    i % 2 ? 'bg-sky text-navy' : 'bg-mint text-mint-ink'
                  }`}
                >
                  {r.name[0]}
                </span>
                <span className='leading-[1.35]'>
                  <strong className='block text-[18px] font-extrabold text-navy'>
                    {r.name}
                  </strong>
                  <span className='text-[15px] text-muted'>{r.problem}</span>
                </span>
              </figcaption>
              <blockquote className='m-0 text-[17px] dsk:text-[18px] flex-1'>
                «{r.text}»
              </blockquote>
              <p className='m-0 text-[15px] text-[#5F6B77]'>{r.date}</p>
            </figure>
          ))}
        </div>
      </section>

      <section className='ds-wrap ds-sec'>
        <div className='ds-card grid gap-6 dsk:gap-8 dsk:grid-cols-[minmax(0,1fr)_auto] items-center p-6 dsk:p-12'>
          <div>
            <h2 className='ds-h2 ds-h2-sm'>Поделитесь своей историей</h2>
            <p className='mt-3 mb-0 text-[17px] dsk:text-[19px] text-muted'>
              Ваш отзыв поможет другим людям принять важное решение о своем
              здоровье и вдохновит их начать путь к восстановлению.
            </p>
          </div>
          <div className='flex flex-col dsk:flex-row gap-3'>
            <ButtonLink href='https://t.me/MV_Rehab' size='md'>
              <Icon name='send' size={20} strokeWidth={2} />
              Написать в Telegram
            </ButtonLink>
            <ButtonLink
              href='mailto:minenkov.rehab@yandex.ru'
              variant='tertiary'
              size='md'
            >
              <Icon name='mail' size={20} strokeWidth={2} />
              Отправить по email
            </ButtonLink>
          </div>
        </div>
      </section>

      <CtaPanel />
    </div>
  );
}

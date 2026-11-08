'use client';

import Link from 'next/link';
import { authPost } from '@/lib/auth-client';
import { useGuestEmailDialog } from '@/components/shared/GuestEmailDialog';
import { formatPrice, Product } from '../data';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { VideoPlayer } from '@/components/dashboard/videos/VideoPlayer';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  PageHead,
  Badge,
  ButtonLink,
  Checkbox,
  CutoutCard,
  Plaque,
  ServiceCard,
  SectionHead,
  Faq,
  Icon,
  IconBox,
  CheckList,
  type Crumb,
} from '@/components/ds';
import {
  productPageContent,
  moreCards,
  type ProgramPageContent,
  type ServicePageContent,
} from '@/data/content';
import {
  getCatalogItemById,
  productPath,
  REHAB_PROGRAMS_PATH,
} from '../catalog';
import {
  PAYMENTS_DISABLED,
  PAYMENTS_DISABLED_MESSAGE,
  getRobokassaPaymentUrl,
  resolveApiMediaUrl,
} from '@/lib/api-base';

// Старый локальный helper (заменён на @/lib/api-base):
// function getRailwayApiBaseUrl() { ... }

function getPresentationVideoEndpoint() {
  return '/api/courses/products/presentation-video';
}

/* ===================== Оформление (редизайн): презентационные компоненты ===================== */

function splitPrice(label: string) {
  const i = label.indexOf(' / ');
  return i === -1
    ? { price: label, unit: '' }
    : { price: label.slice(0, i), unit: label.slice(i + 1) };
}

function Spinner() {
  return (
    <svg
      className='animate-spin h-5 w-5'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      aria-hidden='true'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      ></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      ></path>
    </svg>
  );
}

const NotMedical = () => (
  <p className='m-0 flex items-center gap-2.5 px-3.5 py-3 rounded-[14px] bg-sky text-[15px] font-semibold text-navy'>
    <Icon name='info' size={18} color='var(--c-blue)' />
    Не является медицинской услугой
  </p>
);

/**
 * Карточка покупки: цена, согласия, «Купить онлайн», «Связаться в Telegram».
 * Состояние и обработчики приходят из ProductClient — поведение прежнее, изменён только вид.
 */
function BuyCard({
  heading,
  priceLabel,
  consentId,
  offerId,
  consentName,
  offerName,
  consent,
  offer,
  onConsent,
  onOffer,
  consentError,
  offerError,
  processing,
  onPay,
  onTelegram,
  payAria,
  children,
  as: Tag = 'aside',
  className = '',
  headingLevel = 2,
}: {
  heading: string;
  priceLabel: string;
  consentId: string;
  offerId: string;
  consentName: string;
  offerName: string;
  consent: boolean;
  offer: boolean;
  onConsent: (checked: boolean) => void;
  onOffer: (checked: boolean) => void;
  consentError: boolean;
  offerError: boolean;
  processing: boolean;
  onPay: () => void;
  /** Не используется: Telegram доступен без согласий. */
  onTelegram?: (e: React.MouseEvent) => void;
  payAria: string;
  children?: React.ReactNode;
  as?: 'aside' | 'article';
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const { price, unit } = splitPrice(priceLabel);
  const H = `h${headingLevel}` as 'h2';
  // «Купить онлайн» активна всегда: без согласий — ошибки у чекбоксов (их ставит onPay) и прокрутка к первому неотмеченному.
  const pay = () => {
    if (!consent || !offer) focusCheckbox(!consent ? consentId : offerId);
    onPay();
  };
  return (
    <Tag className={`ds-card p-6 dsk:p-8 flex flex-col gap-4 ${className}`}>
      <div>
        <H className='m-0 text-[16px] font-bold text-muted'>{heading}</H>
        <p className='m-0 mt-1 flex items-baseline gap-2.5 flex-wrap'>
          <span className='text-[34px] dsk:text-[40px] font-extrabold text-navy leading-[1.1]'>
            {price}
          </span>
          {unit ? (
            <span className='text-[17px] dsk:text-[18px] text-muted'>
              {unit}
            </span>
          ) : null}
        </p>
      </div>
      <NotMedical />
      <Checkbox
        id={consentId}
        name={consentName}
        checked={consent}
        onChange={e => onConsent(e.target.checked)}
        error={
          consentError && !consent
            ? 'Пожалуйста, отметьте согласие на обработку персональных данных для продолжения'
            : undefined
        }
      >
        Я даю{' '}
        <Link href='/consent' target='_blank' rel='noopener noreferrer'>
          согласие на обработку персональных данных
        </Link>{' '}
        в соответствии с{' '}
        <Link href='/policy' target='_blank' rel='noopener noreferrer'>
          политикой конфиденциальности
        </Link>
      </Checkbox>
      <Checkbox
        id={offerId}
        name={offerName}
        checked={offer}
        onChange={e => onOffer(e.target.checked)}
        error={
          offerError && !offer
            ? 'Пожалуйста, согласитесь с условиями договора оферты для продолжения'
            : undefined
        }
      >
        Я согласен с условиями{' '}
        <a href='/offer' target='_blank' rel='noopener noreferrer'>
          договора оферты
        </a>
      </Checkbox>
      <button
        type='button'
        onClick={pay}
        disabled={processing}
        aria-label={payAria}
        className='ds-btn ds-btn-lg ds-btn-primary ds-btn-block'
      >
        {processing ? (
          <>
            <Spinner />
            <span>Обработка...</span>
          </>
        ) : (
          'Купить онлайн'
        )}
      </button>
      <Link
        href='https://t.me/MV_Rehab'
        target='_blank'
        rel='noopener noreferrer'
        className='ds-btn ds-btn-md ds-btn-outline ds-btn-block'
      >
        <Icon name='send' size={20} strokeWidth={2} />
        Связаться в Telegram
      </Link>
      {children}
    </Tag>
  );
}

/** Прокрутка к чекбоксу согласия и фокус на нём. */
function focusCheckbox(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.closest('label')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.focus({ preventScroll: true });
}

function MobilePriceBar({ priceLabel, onBuy }: { priceLabel: string; onBuy: () => void }) {
  const { price, unit } = splitPrice(priceLabel);
  return (
    <section className='ds-wrap dsk:hidden pt-4' aria-label='Стоимость'>
      <div className='ds-card flex items-center justify-between gap-3 py-4 px-[18px]'>
        <span className='leading-[1.3]'>
          <strong className='block text-[24px] font-extrabold text-navy'>
            {price}
          </strong>
          {unit ? <span className='text-[15px] text-muted'>{unit}</span> : null}
        </span>
        <button
          type='button'
          onClick={onBuy}
          className='ds-btn ds-btn-primary min-h-[52px] px-6 text-[17px] font-extrabold'
        >
          Купить
        </button>
      </div>
    </section>
  );
}

function ContactBox() {
  return (
    <div className='ds-card p-6 flex flex-col gap-2'>
      <p className='m-0 font-extrabold text-navy'>
        Связаться по вопросам программы
      </p>
      <a
        href='mailto:minenkov.rehab@yandex.ru'
        className='flex items-center gap-2.5 text-[16px] text-brand hover:text-navy min-h-[44px] break-all'
      >
        <Icon name='mail' size={20} strokeWidth={2} color='var(--c-blue)' />
        minenkov.rehab@yandex.ru
      </a>
      <a
        href='https://t.me/MV_Rehab'
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-2.5 text-[16px] text-brand hover:text-navy min-h-[44px]'
      >
        <Icon name='send' size={20} strokeWidth={2} color='var(--c-blue)' />
        t.me/MV_Rehab
      </a>
    </div>
  );
}

function MoreSection({ title, ids }: { title: string; ids: string[] }) {
  const cards = ids
    .map(id => moreCards[id])
    .filter((c): c is NonNullable<typeof c> => !!c);
  if (!cards.length) return null;
  return (
    <section className='ds-wrap ds-sec' aria-labelledby='more-title'>
      <SectionHead
        id='more-title'
        title={title}
        right={
          <ButtonLink
            href='/products'
            variant='secondary'
            size='md'
            className='self-start'
          >
            Все услуги
          </ButtonLink>
        }
      />
      {/* Телефон: горизонтальная карусель со snap; десктоп: сетка из трёх карточек */}
      <div className='flex dsk:grid dsk:grid-cols-3 gap-4 dsk:gap-6 overflow-x-auto dsk:overflow-visible snap-x snap-mandatory -mx-4 px-4 dsk:mx-0 dsk:px-0 pb-3 dsk:pb-0 ds-hscroll'>
        {cards.map(c => (
          <div key={c.href} className='flex-[0_0_84%] dsk:flex-auto snap-start'>
            <ServiceCard
              title={c.title}
              text={c.text}
              price={c.price}
              unit={c.unit}
              href={c.href}
              {...(c.featured ? { featured: true } : {})}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Stages({
  title,
  text,
  stages,
}: {
  title: string;
  text: string;
  stages: string[];
}) {
  const n = stages.length;
  return (
    <div className='ds-card p-6 dsk:p-10'>
      <h2 className='ds-h2 ds-h2-sm'>{title}</h2>
      <p className='mt-3 mb-7 text-muted'>{text}</p>
      <div className='relative'>
        <div
          aria-hidden='true'
          className='hidden dsk:block absolute top-[25px] h-[3px] bg-[#BFD3E4] rounded-sm'
          style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
        />
        <ol
          className={`relative list-none m-0 p-0 grid gap-x-4 gap-y-6 grid-cols-2 ds-stages-${n}`}
          style={{ ['--n' as string]: n } as React.CSSProperties}
        >
          {stages.map((l, i) => {
            const strong = i === 0 || i === n - 1;
            return (
              <li
                key={i}
                className='flex flex-col items-center text-center gap-3'
              >
                <span
                  className='relative z-[1] w-[52px] h-[52px] rounded-full font-extrabold text-[20px] flex items-center justify-center'
                  style={{
                    background: strong ? 'var(--c-blue)' : '#fff',
                    color: strong ? '#fff' : 'var(--c-blue)',
                    boxShadow: 'inset 0 0 0 3px var(--c-blue)',
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className='text-[16px] leading-[1.35]'
                  style={{
                    fontWeight: strong ? 700 : 600,
                    color: strong ? 'var(--c-navy)' : 'var(--c-muted)',
                  }}
                >
                  {l}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <style>{`@media (min-width: 901px){.ds-stages-${n}{grid-template-columns:repeat(${n},minmax(0,1fr))}}`}</style>
    </div>
  );
}

function Includes({ c }: { c: ProgramPageContent }) {
  const [showAll, setShowAll] = useState(false);
  let counter = 0;
  const total = c.includes.reduce((a, g) => a + (g.items?.length ?? 0), 0);
  return (
    <div className='ds-card p-6 dsk:p-10'>
      <h2 className='ds-h2 ds-h2-sm'>{c.includesTitle}</h2>
      {c.includes.map(g => (
        <div key={g.title} className='flex gap-4 items-start mt-7'>
          <IconBox name={g.icon} tone='sky' className='hidden sm:flex' />
          <div className='min-w-0 flex-1'>
            <h3 className='ds-h3' style={{ fontSize: 21 }}>
              {g.title}
            </h3>
            {g.text ? (
              <p className='mt-1 mb-4 text-[17px] text-muted'>{g.text}</p>
            ) : (
              <div className='h-3' />
            )}
            {g.items?.length ? (
              <ul className='list-none m-0 p-0 grid gap-x-6 gap-y-3 dsk:grid-cols-2 text-[17px]'>
                {g.items.map(t => {
                  const k = counter++;
                  return (
                    <li
                      key={t}
                      className={`${k >= 5 && !showAll ? 'hidden dsk:flex' : 'flex'} gap-3 items-start`}
                    >
                      <span
                        aria-hidden='true'
                        className='flex-none w-[26px] h-[26px] rounded-full bg-mint flex items-center justify-center mt-[2px]'
                      >
                        <Icon
                          name='check'
                          size={14}
                          strokeWidth={3.2}
                          color='var(--c-mint-ink)'
                        />
                      </span>
                      <span>{t}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      ))}
      {total > 5 ? (
        <button
          type='button'
          className='dsk:hidden ds-btn ds-btn-sm ds-btn-tertiary mt-4'
          aria-expanded={showAll}
          onClick={() => setShowAll(v => !v)}
        >
          {showAll ? 'Свернуть' : `Показать все ${total} пунктов`}
        </button>
      ) : null}
      {c.extras.length ? (
        <div className='grid gap-4 dsk:grid-cols-2 mt-7'>
          {c.extras.map(x => (
            <div
              key={x.text}
              className='flex gap-4 items-start p-5 dsk:p-[22px] rounded-[20px] bg-canvas'
            >
              <IconBox
                name={x.icon}
                tone='sky'
                size={48}
                radius={14}
                iconSize={22}
              />
              <p className='m-0 text-[17px] font-semibold text-ink'>{x.text}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Клиентский компонент для страницы продукта
export default function ProductClient({ product }: { product: Product }) {
  const guestEmailDialog = useGuestEmailDialog();
  // Состояние для чекбоксов согласия
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isOfferChecked, setIsOfferChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [showOfferError, setShowOfferError] = useState(false);
  // Состояние для показа всех уровней программы «Формула Движения»
  const [showAllLevels, setShowAllLevels] = useState(false);
  // Состояние для чекбоксов согласия для каждого уровня
  const [isConsentCheckedLevel2, setIsConsentCheckedLevel2] = useState(false);
  const [isOfferCheckedLevel2, setIsOfferCheckedLevel2] = useState(false);
  const [showConsentErrorLevel2, setShowConsentErrorLevel2] = useState(false);
  const [showOfferErrorLevel2, setShowOfferErrorLevel2] = useState(false);
  const [isConsentCheckedLevel3, setIsConsentCheckedLevel3] = useState(false);
  const [isOfferCheckedLevel3, setIsOfferCheckedLevel3] = useState(false);
  const [showConsentErrorLevel3, setShowConsentErrorLevel3] = useState(false);
  const [showOfferErrorLevel3, setShowOfferErrorLevel3] = useState(false);
  const [isConsentCheckedLevel4, setIsConsentCheckedLevel4] = useState(false);
  const [isOfferCheckedLevel4, setIsOfferCheckedLevel4] = useState(false);
  const [showConsentErrorLevel4, setShowConsentErrorLevel4] = useState(false);
  const [showOfferErrorLevel4, setShowOfferErrorLevel4] = useState(false);
  const [presentationVideoUrl, setPresentationVideoUrl] = useState<
    string | null
  >(null);
  // Сразу true для personal-program, иначе на первом кадре «недоступно» / пустой блок
  const [isPresentationVideoLoading, setIsPresentationVideoLoading] = useState(
    () => product.id === 'personal-program'
  );

  // Состояния для анимации оплаты для каждого уровня
  const [isPaymentProcessingLevel1, setIsPaymentProcessingLevel1] =
    useState(false);
  const [isPaymentProcessingLevel2, setIsPaymentProcessingLevel2] =
    useState(false);
  const [isPaymentProcessingLevel3, setIsPaymentProcessingLevel3] =
    useState(false);
  const [isPaymentProcessingLevel4, setIsPaymentProcessingLevel4] =
    useState(false);

  // Состояния для экспресс-консультации
  const [isLoading, setIsLoading] = useState(false);
  // const [customerEmail, setCustomerEmail] = useState('');
  // const [customerPhone, setCustomerPhone] = useState('');

  // Сброс состояний обработки при возврате пользователя на страницу
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Сбрасываем все состояния обработки при возврате на страницу
        setIsPaymentProcessingLevel1(false);
        setIsPaymentProcessingLevel2(false);
        setIsPaymentProcessingLevel3(false);
        setIsPaymentProcessingLevel4(false);
        setIsLoading(false);
        console.log('🔄 Состояния обработки сброшены при возврате на страницу');
      }
    };

    const handleFocus = () => {
      // Дополнительный сброс при фокусе на окне
      setIsPaymentProcessingLevel1(false);
      setIsPaymentProcessingLevel2(false);
      setIsPaymentProcessingLevel3(false);
      setIsPaymentProcessingLevel4(false);
      setIsLoading(false);
      console.log('🔄 Состояния обработки сброшены при фокусе на окне');
    };

    // Добавляем обработчики событий
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Очистка обработчиков при размонтировании компонента
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (product.id !== 'personal-program') return;

    let isCancelled = false;

    const loadPresentationVideo = async () => {
      try {
        setIsPresentationVideoLoading(true);
        const response = await fetch(getPresentationVideoEndpoint());
        const payload = await response.json().catch(() => null);
        const nextUrl =
          payload?.data?.embedUrl ||
          payload?.data?.hlsMasterUrl ||
          payload?.data?.url ||
          payload?.data?.signedUrl ||
          payload?.data?.publicUrl;

        if (!response.ok || !payload?.success || !nextUrl) {
          throw new Error(
            payload?.message || 'Не удалось загрузить видео презентации'
          );
        }

        if (!isCancelled) {
          // Старый вариант: setPresentationVideoUrl(nextUrl)
          setPresentationVideoUrl(resolveApiMediaUrl(nextUrl));
        }
      } catch {
        if (!isCancelled) {
          setPresentationVideoUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setIsPresentationVideoLoading(false);
        }
      }
    };

    loadPresentationVideo();

    return () => {
      isCancelled = true;
    };
  }, [product.id]);

  // useEffect(() => {
  //   try {
  //     const savedEmail = localStorage.getItem('mr_checkout_email') || '';
  //     const savedPhone = localStorage.getItem('mr_checkout_phone') || '';
  //     if (savedEmail) setCustomerEmail(savedEmail);
  //     if (savedPhone) setCustomerPhone(savedPhone);
  //   } catch {}
  // }, []);

  // Проверка согласия перед действием
  const checkConsent = () => {
    let hasError = false;

    if (!isConsentChecked) {
      setShowConsentError(true);
      hasError = true;
    } else {
      setShowConsentError(false);
    }

    if (!isOfferChecked) {
      setShowOfferError(true);
      hasError = true;
    } else {
      setShowOfferError(false);
    }

    return !hasError;
  };

  // Обработчики для кнопок оплаты для каждого уровня
  const handlePaymentLevel1 = async () => {
    if (!checkConsent()) {
      return;
    }
    await handlePayment(1);
  };

  const handlePaymentLevel2 = async () => {
    if (!isConsentCheckedLevel2 || !isOfferCheckedLevel2) {
      if (!isConsentCheckedLevel2) {
        setShowConsentErrorLevel2(true);
      }
      if (!isOfferCheckedLevel2) {
        setShowOfferErrorLevel2(true);
      }
      return;
    }
    await handlePayment(2);
  };

  const handlePaymentLevel3 = async () => {
    if (!isConsentCheckedLevel3 || !isOfferCheckedLevel3) {
      if (!isConsentCheckedLevel3) {
        setShowConsentErrorLevel3(true);
      }
      if (!isOfferCheckedLevel3) {
        setShowOfferErrorLevel3(true);
      }
      return;
    }
    await handlePayment(3);
  };

  const handlePaymentLevel4 = async () => {
    if (!isConsentCheckedLevel4 || !isOfferCheckedLevel4) {
      if (!isConsentCheckedLevel4) {
        setShowConsentErrorLevel4(true);
      }
      if (!isOfferCheckedLevel4) {
        setShowOfferErrorLevel4(true);
      }
      return;
    }
    await handlePayment(4);
  };

  // Функция для определения типа платежа (для фискализации)
  const getPaymentMethod = (productId: string) => {
    // 100% предоплата для консультаций и онлайн-тренировок
    if (
      ['consultation', 'express-consultation', 'online-training'].includes(
        productId
      )
    ) {
      return 'full_prepayment';
    }
    // Полный расчет для программ восстановления и Формулы Движения
    // (formula-movement, personal-program - Резекция мениска, rehabilitation-protocols)
    return 'full_payment';
  };

  // Функция создания платежа через Railway API
  const handlePayment = async (level: number) => {
    if (PAYMENTS_DISABLED) {
      alert(PAYMENTS_DISABLED_MESSAGE);
      return;
    }
    try {
      console.log('🔄 Создание платежа для продукта:', product.title);
      console.log('🔄 Уровень:', level);

      /*
      const isEmailRequiredForAccess = ![
        'consultation',
        'express-consultation',
        'online-training',
      ].includes(product.id);

      let email = customerEmail.trim();

      // Старый вариант (оставлен для истории): всегда требовали email и блокировали оплату услуг
      // if (!email && typeof window !== 'undefined') {
      //   const promptedEmail =
      //     window.prompt(
      //       'Укажите email, на который отправить доступ к курсу:',
      //       ''
      //     ) || '';
      //   email = promptedEmail.trim();
      //   if (email) {
      //     setCustomerEmail(email);
      //     try {
      //       localStorage.setItem('mr_checkout_email', email);
      //     } catch {}
      //   }
      // }
      //
      // email = email.toLowerCase();
      // const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      // if (!email || !emailRegex.test(email)) {
      //   throw new Error('Укажите корректный email для получения доступа');
      // }

      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (isEmailRequiredForAccess) {
        if (!email && typeof window !== 'undefined') {
          const promptedEmail =
            window.prompt(
              'Укажите email, на который отправить доступ к курсу:',
              ''
            ) || '';
          email = promptedEmail.trim();
          if (email) {
            setCustomerEmail(email);
            try {
              localStorage.setItem('mr_checkout_email', email);
            } catch {}
          }
        }

        email = email.toLowerCase();
        if (!email || !emailRegex.test(email)) {
          throw new Error('Укажите корректный email для получения доступа');
        }
      } else {
        // Для услуг (консультации/тренировки) email необязателен:
        // если введен и корректен — передаем; если пустой/некорректный — не блокируем оплату.
        if (email) {
          const normalized = email.toLowerCase();
          if (emailRegex.test(normalized)) {
            email = normalized;
          } else {
            email = '';
          }
        }
      }

      const phone = customerPhone.trim();
      // Старый вариант (оставлен для истории): спрашивали телефон через window.prompt
      // if (!phone && typeof window !== 'undefined') {
      //   const promptedPhone =
      //     window.prompt('Телефон (необязательно):', '') || '';
      //   phone = promptedPhone.trim();
      //   if (phone) {
      //     setCustomerPhone(phone);
      //     try {
      //       localStorage.setItem('mr_checkout_phone', phone);
      //     } catch {}
      //   }
      // }
      */

      switch (level) {
        case 1:
          setIsPaymentProcessingLevel1(true);
          break;
        case 2:
          setIsPaymentProcessingLevel2(true);
          break;
        case 3:
          setIsPaymentProcessingLevel3(true);
          break;
        case 4:
          setIsPaymentProcessingLevel4(true);
          break;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Старый хардкод Railway:
      // const apiUrl =
      //   process.env.NODE_ENV === 'production'
      //     ? 'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url'
      //     : '/api/robokassa/generate-payment-url';
      // Согласие с офертой и обработкой данных подтверждается галочками перед кнопкой оплаты.
      const apiUrl = getRobokassaPaymentUrl();

      // Без входа покупка тоже возможна: спрашиваем email, на который придёт доступ.
      let guestEmail: string | undefined;
      // Гость определяется через /api/auth/session (200 и user: null вместо 401 — без ошибки в консоли).
      const me = await fetch('/api/auth/session', {
        credentials: 'same-origin',
        cache: 'no-store',
      }).catch(() => null);
      const sessionUser = me?.ok
        ? (await me.json().catch(() => null))?.data?.user
        : undefined;
      if (!me || (me.ok && !sessionUser)) {
        const email = await guestEmailDialog.ask();
        if (!email) {
          setIsPaymentProcessingLevel1(false);
          setIsPaymentProcessingLevel2(false);
          setIsPaymentProcessingLevel3(false);
          setIsPaymentProcessingLevel4(false);
          return;
        }
        guestEmail = email;
      }
      const response = await authPost(apiUrl, {
        productId: product.id,
        level,
        agreement: true,
        ...(guestEmail ? { email: guestEmail } : {}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Ошибка создания платежа: ${response.status} ${response.statusText} ${errorText}`
        );
      }

      const result = await response.json();

      if (result.success && result.data?.paymentUrl) {
        // Убираем лишние символы из URL, если они есть
        const cleanUrl = result.data.paymentUrl.replace(/%27/g, '');
        window.location.href = cleanUrl;
      } else {
        throw new Error('Не удалось получить ссылку для оплаты');
      }
    } catch (error) {
      console.error('Ошибка оплаты:', error);

      // Сбрасываем состояние загрузки
      switch (level) {
        case 1:
          setIsPaymentProcessingLevel1(false);
          break;
        case 2:
          setIsPaymentProcessingLevel2(false);
          break;
        case 3:
          setIsPaymentProcessingLevel3(false);
          break;
        case 4:
          setIsPaymentProcessingLevel4(false);
          break;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(
        `Произошла ошибка при создании платежа: ${errorMessage}\n\nПопробуйте еще раз или обратитесь в поддержку.`
      );
    }
  };


  /* ---------- Данные для оформления ---------- */
  const catalogItem = getCatalogItemById(product.id);
  const content = productPageContent[product.id];
  const isProgram = content?.template === 'program';
  const programContent = isProgram ? (content as ProgramPageContent) : null;
  const serviceContent =
    content?.template === 'service' ? (content as ServicePageContent) : null;
  const mainPriceLabel =
    product.id === 'formula-movement'
      ? formatPrice('formula-movement', 6000)
      : formatPrice(product.id, product.price);
  const lead = catalogItem?.description || product.shortDescription;
  const crumbs: Crumb[] =
    catalogItem?.kind === 'program'
      ? [
          { label: 'Главная', href: '/' },
          { label: 'Услуги', href: '/products' },
          { label: 'Восстановительные программы', href: REHAB_PROGRAMS_PATH },
          { label: catalogItem.title },
        ]
      : [
          { label: 'Главная', href: '/' },
          { label: 'Услуги', href: '/products' },
          { label: catalogItem?.title ?? product.title },
        ];
  void productPath;

  const mainBuyCard = (
    <BuyCard
      heading={product.id === 'formula-movement' ? '1-й уровень' : 'Стоимость'}
      priceLabel={mainPriceLabel}
      consentId='consent-checkbox'
      offerId='offer-checkbox'
      consentName='consent'
      offerName='offer'
      consent={isConsentChecked}
      offer={isOfferChecked}
      onConsent={checked => {
        setIsConsentChecked(checked);
        if (checked) setShowConsentError(false);
      }}
      onOffer={checked => {
        setIsOfferChecked(checked);
        if (checked) setShowOfferError(false);
      }}
      consentError={showConsentError}
      offerError={showOfferError}
      processing={isPaymentProcessingLevel1}
      onPay={handlePaymentLevel1}
      payAria={`Купить онлайн: ${product.title}`}
    >
      {product.id === 'formula-movement' ? (
        <button
          type='button'
          onClick={() => setShowAllLevels(!showAllLevels)}
          className='ds-btn ds-btn-md ds-btn-tertiary ds-btn-block'
          aria-expanded={showAllLevels}
          aria-controls='formula-levels'
        >
          {showAllLevels ? 'Свернуть' : 'Показать все уровни'}
        </button>
      ) : null}
    </BuyCard>
  );

  /* ---------- Правая колонка шапки ---------- */
  let headRight: React.ReactNode = null;
  if (product.id === 'personal-program') {
    headRight = (
      <div>
        <h2 className='sr-only'>Презентация программы</h2>
        <div className='rounded-[24px] dsk:rounded-[28px] overflow-hidden shadow-[0_24px_48px_rgba(13,60,99,.18)] bg-navy'>
          {isPresentationVideoLoading ? (
            <div
              className='relative w-full aspect-video'
              style={{
                background: 'linear-gradient(160deg, #16639E 0%, #0D3C63 100%)',
              }}
              role='status'
              aria-live='polite'
              aria-label='Загрузка видео презентации'
            >
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white'>
                <Loader2 className='h-10 w-10 animate-spin' aria-hidden />
                <p className='m-0 text-[16px] font-semibold'>Загрузка видео…</p>
                <p className='m-0 text-[15px] opacity-80 max-w-xs'>
                  Подготавливаем презентацию программы, это может занять
                  несколько секунд
                </p>
              </div>
            </div>
          ) : presentationVideoUrl &&
            presentationVideoUrl.startsWith('https://kinescope.io/embed/') ? (
            <iframe
              title='Презентация программы'
              src={presentationVideoUrl}
              referrerPolicy='no-referrer'
              allow='autoplay; fullscreen; encrypted-media; picture-in-picture'
              allowFullScreen
              className='aspect-video w-full border-0 block'
            />
          ) : presentationVideoUrl ? (
            <VideoPlayer
              src={presentationVideoUrl}
              type='application/vnd.apple.mpegurl'
              poster='/images/products/personal-program-poster.jpg'
            />
          ) : (
            <div
              className='w-full aspect-video flex flex-col items-center justify-center gap-3 px-6 text-center text-white'
              style={{
                background: 'linear-gradient(160deg, #16639E 0%, #0D3C63 100%)',
              }}
            >
              <Icon name='play' size={34} color='#fff' />
              <p className='m-0 text-[16px] font-semibold'>
                Видео презентации временно недоступно.
              </p>
            </div>
          )}
        </div>
        <p className='m-0 mt-3 text-[16px] font-bold text-navy'>
          Презентация программы
        </p>
      </div>
    );
  } else if (programContent && product.image) {
    headRight = (
      <Image
        src={product.image}
        alt={product.title}
        width={1600}
        height={873}
        priority
        sizes='(max-width: 900px) 100vw, 460px'
        className='ds-photo aspect-[16/11] h-auto shadow-[0_24px_48px_rgba(13,60,99,.14)]'
      />
    );
  } else if (serviceContent) {
    headRight = (
      <CutoutCard
        h={500}
        cardH={380}
        hM={380}
        cardHM={280}
        priority
        plaque={
          <Plaque
            title={serviceContent.plaque.title}
            sub={serviceContent.plaque.sub}
            className='left-[-8px] bottom-4 dsk:left-[-24px] dsk:bottom-7'
          />
        }
      />
    );
  }

  const headExtra = programContent ? (
    <div className='flex flex-wrap gap-2.5 mt-6'>
      <Badge>{programContent.tag}</Badge>
      <Badge tone='navy'>{programContent.access}</Badge>
    </div>
  ) : serviceContent ? (
    <div className='grid gap-3 sm:grid-cols-3 mt-7'>
      {serviceContent.facts.map(f => (
        <div
          key={f.text}
          className='flex items-center gap-3 p-3.5 rounded-[18px] bg-white'
        >
          <IconBox
            name={f.icon}
            tone='sky'
            size={40}
            radius={12}
            iconSize={20}
          />
          <span className='text-[16px] font-bold leading-[1.3] text-navy'>
            {f.text}
          </span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <>
      {guestEmailDialog.dialog}
      <div className='ds'>
        <PageHead
          crumbs={crumbs}
          title={product.title}
          lead={lead}
          right={headRight}
          extra={headExtra}
        />
        <MobilePriceBar
          priceLabel={mainPriceLabel}
          onBuy={() => {
            // Без согласий — ошибки и прокрутка к карточке покупки; с согласиями — оплата (1-й уровень у «Формулы»).
            if (!isConsentChecked || !isOfferChecked) {
              checkConsent();
              focusCheckbox(!isConsentChecked ? 'consent-checkbox' : 'offer-checkbox');
              return;
            }
            void handlePaymentLevel1();
          }}
        />

        <section className='ds-wrap ds-sec'>
          <div className='grid gap-6 dsk:gap-8 dsk:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] items-start'>
            <div className='flex flex-col gap-5 dsk:gap-6 min-w-0'>
              {/* ---------- Программа ---------- */}
              {programContent ? (
                <>
                  {programContent.important ? (
                    <div
                      className='flex gap-4 p-5 dsk:px-7 dsk:py-6 rounded-[24px] bg-warn-bg'
                      style={{ boxShadow: 'inset 0 0 0 1px #F3DDB0' }}
                    >
                      <IconBox
                        name='alert'
                        tone='warn'
                        size={44}
                        radius={14}
                        iconSize={22}
                      />
                      <div>
                        <h2 className='m-0 mb-1.5 text-[19px] font-extrabold text-[#5C3900]'>
                          Важно
                        </h2>
                        <p className='m-0 text-[17px] text-[#4A3A1A]'>
                          {programContent.important}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <div className='ds-card p-6 dsk:p-10'>
                    <h2 className='ds-h2 ds-h2-sm'>О программе</h2>
                    <div className='ds-prose mt-4'>
                      {programContent.about.map(t => (
                        <p key={t}>{t}</p>
                      ))}
                    </div>
                  </div>
                  <StagesWrap c={programContent} />
                  <Includes c={programContent} />
                  <div>
                    <h2 className='ds-h2 ds-h2-sm mb-5'>Частые вопросы</h2>
                    <Faq
                      idPrefix={`faq-${product.id}`}
                      items={programContent.faq.map(f => ({
                        q: f.q,
                        a: f.html ? (
                          <p
                            className='m-0'
                            dangerouslySetInnerHTML={{ __html: f.a }}
                          />
                        ) : (
                          <p className='m-0'>{f.a}</p>
                        ),
                      }))}
                    />
                  </div>
                </>
              ) : null}

              {/* ---------- Услуга ---------- */}
              {serviceContent
                ? serviceContent.sections.map(sec => (
                    <div key={sec.title} className='ds-card p-6 dsk:p-10'>
                      <h2 className='ds-h2 ds-h2-sm'>{sec.title}</h2>
                      {sec.kind === 'text' ? (
                        <div className='ds-prose mt-4'>
                          {sec.paragraphs.map(t => (
                            <p key={t}>{t}</p>
                          ))}
                        </div>
                      ) : sec.kind === 'list' ? (
                        <ul className='list-none mt-6 mb-0 p-0 grid gap-3 dsk:grid-cols-2'>
                          {sec.items.map(t => (
                            <li
                              key={t}
                              className='flex gap-3.5 items-start p-5 rounded-[20px] bg-canvas'
                            >
                              <IconBox
                                name='check'
                                size={36}
                                radius={12}
                                iconSize={18}
                              />
                              <span className='text-[17px] font-semibold'>
                                {t}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className='grid gap-5 dsk:grid-cols-2 mt-6'>
                          {sec.items.map(it => (
                            <div
                              key={it.text}
                              className='flex gap-4 items-start'
                            >
                              <IconBox name={it.icon} tone='sky' />
                              <p className='m-0 text-[17px]'>{it.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                : null}

              {/* Онлайн-консультация: ссылка на экспресс-консультацию (покупается только на своей странице) */}
              {product.id === 'consultation' ? (
                <div
                  className='ds-card p-6 dsk:px-8 dsk:py-7 flex flex-col gap-5'
                  style={{ background: 'var(--g-featured)' }}
                >
                  <div className='flex flex-col dsk:flex-row dsk:items-center gap-4 dsk:gap-5'>
                    <IconBox name='clock' />
                    <div className='flex-1'>
                      <h2 className='m-0 text-[21px] font-extrabold text-navy'>
                        Нужен короткий разбор одного вопроса?
                      </h2>
                      <p className='mt-1 mb-0 text-[17px] text-muted'>
                        <Link
                          href='/products/express-consultation'
                          className='ds-link'
                        >
                          Экспресс онлайн-консультация
                        </Link>{' '}
                        — 20 минут, 4 000 ₽
                      </p>
                    </div>
                    <Link
                      href='/products/express-consultation'
                      className='ds-btn ds-btn-md ds-btn-tertiary'
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              ) : null}

              {/* Запасной вариант для продуктов без структурированного контента */}
              {!content ? (
                <div className='ds-card p-6 dsk:p-10'>
                  {product.id === 'rehabilitation-protocols' && (
                    <div className='mb-6'>
                      <h2 className='ds-h3 mb-4'>Этапы реабилитации</h2>
                      <ImageCarousel
                        images={[
                          {
                            src: '/images/products/IMAGE 2025-07-22 23:23:43.jpg',
                            alt: 'Этап 1: Острый период (0-2 недели)',
                            title: 'Острый период',
                          },
                          {
                            src: '/images/products/IMAGE 2025-07-22 23:23:54.jpg',
                            alt: 'Этап 2: Подострый период (2-6 недель)',
                            title: 'Подострый период',
                          },
                          {
                            src: '/images/products/IMAGE 2025-07-22 23:24:03.jpg',
                            alt: 'Этап 3: Функциональное восстановление (6-12 недель)',
                            title: 'Функциональное восстановление',
                          },
                          {
                            src: '/images/products/IMAGE 2025-07-22 23:24:15.jpg',
                            alt: 'Этап 4: Возвращение к спорту (12+ недель)',
                            title: 'Возвращение к спорту',
                          },
                        ]}
                      />
                    </div>
                  )}
                  <h2 className='ds-h2 ds-h2-sm'>Описание</h2>
                  {product.shortDescription ? (
                    <p className='mt-4 mb-4'>{product.shortDescription}</p>
                  ) : null}
                  <CheckList className='mt-4' items={product.fullDescription} />
                </div>
              ) : null}
            </div>

            <div
              id='buy'
              className='flex flex-col gap-4 scroll-mt-28 dsk:sticky dsk:top-[104px]'
            >
              {mainBuyCard}
              {programContent ? <ContactBox /> : null}
            </div>
          </div>
        </section>

        {/* «Формула Движения»: уровни 2–4 */}
        {product.id === 'formula-movement' && showAllLevels && (
          <section
            id='formula-levels'
            className='ds-wrap ds-sec'
            aria-labelledby='levels-title'
          >
            <SectionHead
              id='levels-title'
              title='Следующие уровни'
              sub='Каждый уровень — 2 месяца, 9 тренировок по 30 минут'
            />
            <div className='grid gap-4 dsk:gap-6 dsk:grid-cols-3 items-start'>
              <BuyCard
                as='article'
                headingLevel={3}
                heading='2-й уровень'
                priceLabel='6 000 ₽'
                consentId='consent-level-2-checkbox'
                offerId='offer-level-2-checkbox'
                consentName='consent-level-2'
                offerName='offer-level-2'
                consent={isConsentCheckedLevel2}
                offer={isOfferCheckedLevel2}
                onConsent={checked => {
                  setIsConsentCheckedLevel2(checked);
                  if (checked) setShowConsentErrorLevel2(false);
                }}
                onOffer={checked => {
                  setIsOfferCheckedLevel2(checked);
                  if (checked) setShowOfferErrorLevel2(false);
                }}
                consentError={showConsentErrorLevel2}
                offerError={showOfferErrorLevel2}
                processing={isPaymentProcessingLevel2}
                onPay={handlePaymentLevel2}
                payAria='Купить онлайн уровень 2 программы «Формула Движения»'
              />
              <BuyCard
                as='article'
                headingLevel={3}
                heading='3-й уровень'
                priceLabel='6 000 ₽'
                consentId='consent-level-3-checkbox'
                offerId='offer-level-3-checkbox'
                consentName='consent-level-3'
                offerName='offer-level-3'
                consent={isConsentCheckedLevel3}
                offer={isOfferCheckedLevel3}
                onConsent={checked => {
                  setIsConsentCheckedLevel3(checked);
                  if (checked) setShowConsentErrorLevel3(false);
                }}
                onOffer={checked => {
                  setIsOfferCheckedLevel3(checked);
                  if (checked) setShowOfferErrorLevel3(false);
                }}
                consentError={showConsentErrorLevel3}
                offerError={showOfferErrorLevel3}
                processing={isPaymentProcessingLevel3}
                onPay={handlePaymentLevel3}
                payAria='Купить онлайн уровень 3 программы «Формула Движения»'
              />
              <BuyCard
                as='article'
                headingLevel={3}
                heading='4-й уровень'
                priceLabel='6 000 ₽'
                consentId='consent-level-4-checkbox'
                offerId='offer-level-4-checkbox'
                consentName='consent-level-4'
                offerName='offer-level-4'
                consent={isConsentCheckedLevel4}
                offer={isOfferCheckedLevel4}
                onConsent={checked => {
                  setIsConsentCheckedLevel4(checked);
                  if (checked) setShowConsentErrorLevel4(false);
                }}
                onOffer={checked => {
                  setIsOfferCheckedLevel4(checked);
                  if (checked) setShowOfferErrorLevel4(false);
                }}
                consentError={showConsentErrorLevel4}
                offerError={showOfferErrorLevel4}
                processing={isPaymentProcessingLevel4}
                onPay={handlePaymentLevel4}
                payAria='Купить онлайн уровень 4 программы «Формула Движения»'
              />
            </div>
          </section>
        )}

        {content ? (
          <MoreSection
            title={isProgram ? 'Ещё программы' : 'Ещё услуги'}
            ids={content.more}
          />
        ) : null}
      </div>
    </>
  );
}

function StagesWrap({ c }: { c: ProgramPageContent }) {
  return <Stages title={c.stagesTitle} text={c.stagesText} stages={c.stages} />;
}

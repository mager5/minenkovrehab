'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Maximize2,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import './ai-preview-widget.css';

type Device = 'desktop' | 'tablet' | 'phone';
type Size = { width: number; height: number };
const limits = { width: [280, 3840], height: [320, 2160] } as const;
const presets: Record<Device, Size[]> = {
  phone: [
    { width: 414, height: 896 },
    { width: 360, height: 800 },
    { width: 384, height: 832 },
    { width: 390, height: 844 },
    { width: 393, height: 873 },
  ],
  tablet: [
    { width: 768, height: 1024 },
    { width: 800, height: 1280 },
    { width: 820, height: 1180 },
    { width: 810, height: 1080 },
  ],
  desktop: [
    { width: 1920, height: 1080 },
    { width: 1536, height: 864 },
    { width: 1366, height: 768 },
    { width: 1280, height: 720 },
    { width: 2560, height: 1440 },
    { width: 1440, height: 900 },
  ],
};
const defaults: Record<Device, Size> = {
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1536, height: 864 },
};
const devices = [
  { id: 'desktop', name: 'Компьютер', Icon: Monitor },
  { id: 'tablet', name: 'Планшет', Icon: Tablet },
  { id: 'phone', name: 'Телефон', Icon: Smartphone },
] as const;
const sizeKey = (size: Size) => `${size.width}x${size.height}`;
const bounded = (value: number, axis: keyof Size) =>
  Math.min(limits[axis][1], Math.max(limits[axis][0], Math.round(value)));
function draftValue(draft: string, axis: keyof Size, fallback: number) {
  const value = Number(draft);
  return draft.trim() && Number.isFinite(value)
    ? bounded(value, axis)
    : fallback;
}

/** A true iframe viewport. Scaling changes its display size, never its media queries. */
export default function AiPreviewWidget() {
  const enabled = process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1';
  const [previewOpen, setPreviewOpen] = useState(false);
  const [device, setDevice] = useState<Device>('desktop');
  const [size, setSize] = useState<Size>(defaults.desktop);
  const [preset, setPreset] = useState(sizeKey(defaults.desktop));
  const [widthDraft, setWidthDraft] = useState(String(defaults.desktop.width));
  const [heightDraft, setHeightDraft] = useState(
    String(defaults.desktop.height)
  );
  const [fit, setFit] = useState(true);
  const [available, setAvailable] = useState<Size>({ width: 0, height: 0 });
  const hostButtons = useRef<Partial<Record<Device, HTMLButtonElement | null>>>(
    {}
  );
  const focusDevice = useRef<Device>('desktop');
  const closeButton = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const detachFrameKeyboard = useRef<(() => void) | null>(null);
  const returnFocus = useRef(false);

  const close = useCallback(() => {
    returnFocus.current = true;
    setPreviewOpen(false);
  }, []);

  useEffect(() => {
    if (!previewOpen) {
      if (returnFocus.current) {
        hostButtons.current[focusDevice.current]?.focus();
        returnFocus.current = false;
      }
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key === 'Tab') {
        const controls = Array.from(
          overlay.current?.querySelectorAll<HTMLElement>(
            'button,input,select,iframe'
          ) || []
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keydown);
      detachFrameKeyboard.current?.();
      detachFrameKeyboard.current = null;
    };
  }, [previewOpen, close]);

  useLayoutEffect(() => {
    if (!previewOpen || !stage.current) return;
    const measure = () => {
      const bounds = stage.current?.getBoundingClientRect();
      // 24px gutters and the frame's 1px border on each side.
      const next = {
        width: Math.max(1, (bounds?.width || window.innerWidth) - 50),
        height: Math.max(1, (bounds?.height || window.innerHeight - 120) - 50),
      };
      setAvailable(previous =>
        previous.width === next.width && previous.height === next.height
          ? previous
          : next
      );
    };
    // The preview canvas must be measured before its first visible frame is painted.
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [previewOpen]);

  if (!enabled || typeof document === 'undefined') return null;

  function replaceSize(next: Size, nextPreset = 'custom') {
    setSize(next);
    setWidthDraft(String(next.width));
    setHeightDraft(String(next.height));
    setPreset(nextPreset);
  }
  function chooseDevice(next: Device) {
    focusDevice.current = next;
    if (!previewOpen || next !== device)
      replaceSize(defaults[next], sizeKey(defaults[next]));
    setDevice(next);
    setFit(true);
    setPreviewOpen(true);
  }
  function choosePreset(value: string) {
    const next = presets[device].find(
      candidate => sizeKey(candidate) === value
    );
    if (next) replaceSize(next, value);
    else setPreset('custom');
  }
  function changeDraft(axis: keyof Size, value: string) {
    if (axis === 'width') setWidthDraft(value);
    else setHeightDraft(value);
    setPreset('custom');
    const number = Number(value);
    // Preserve partial typing; clamp only on blur rather than replacing the first digit.
    if (
      value.trim() &&
      Number.isFinite(number) &&
      number >= limits[axis][0] &&
      number <= limits[axis][1]
    )
      setSize(previous => ({ ...previous, [axis]: Math.round(number) }));
  }
  function commitDraft(axis: keyof Size) {
    const value = draftValue(
      axis === 'width' ? widthDraft : heightDraft,
      axis,
      size[axis]
    );
    setSize(previous => ({ ...previous, [axis]: value }));
    if (axis === 'width') setWidthDraft(String(value));
    else setHeightDraft(String(value));
  }
  function rotate() {
    const width = draftValue(widthDraft, 'width', size.width);
    const height = draftValue(heightDraft, 'height', size.height);
    replaceSize({
      width: bounded(height, 'width'),
      height: bounded(width, 'height'),
    });
  }
  function frameLoaded(event: React.SyntheticEvent<HTMLIFrameElement>) {
    detachFrameKeyboard.current?.();
    const frameDocument = event.currentTarget.contentDocument;
    if (!frameDocument) return;
    const escape = (keyboard: KeyboardEvent) => {
      if (keyboard.key === 'Escape') {
        keyboard.preventDefault();
        close();
      }
    };
    frameDocument.addEventListener('keydown', escape);
    detachFrameKeyboard.current = () =>
      frameDocument.removeEventListener('keydown', escape);
  }

  const scale =
    fit && available.width > 0 && available.height > 0
      ? Math.min(
          1,
          available.width / size.width,
          available.height / size.height
        )
      : 1;
  const tabs = (host: boolean) =>
    devices.map(({ id, name, Icon }) => (
      <button
        key={id}
        ref={
          host
            ? node => {
                hostButtons.current[id] = node;
              }
            : undefined
        }
        type='button'
        aria-pressed={host ? id === 'desktop' : device === id}
        onClick={() => chooseDevice(id)}
      >
        <Icon size={15} aria-hidden='true' />
        {name}
      </button>
    ));

  if (!previewOpen)
    return createPortal(
      <section
        data-ai-editor
        className='ai-preview-widget'
        aria-label='Устройство для просмотра главной'
      >
        {tabs(true)}
      </section>,
      document.body
    );

  return createPortal(
    <div
      ref={overlay}
      data-ai-editor
      className='ai-preview-overlay'
      role='dialog'
      aria-modal='true'
      aria-labelledby='ai-preview-title'
    >
      <header className='ai-preview-header'>
        <strong id='ai-preview-title'>Предпросмотр</strong>
        <div
          className='ai-preview-tabs'
          role='group'
          aria-label='Устройство предпросмотра'
        >
          {tabs(false)}
        </div>
        <select
          className='ai-preview-presets'
          aria-label='Предустановленный размер'
          value={preset}
          onChange={event => choosePreset(event.target.value)}
        >
          {presets[device].map(candidate => (
            <option key={sizeKey(candidate)} value={sizeKey(candidate)}>
              {candidate.width} × {candidate.height}
            </option>
          ))}
          <option value='custom'>Свой размер</option>
        </select>
        <div
          className='ai-preview-size'
          role='group'
          aria-label='Размер экрана в пикселях'
        >
          <input
            type='number'
            aria-label='Ширина, px'
            title='Ширина, px'
            min={280}
            max={3840}
            step={1}
            value={widthDraft}
            onChange={event => changeDraft('width', event.target.value)}
            onBlur={() => commitDraft('width')}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <span aria-hidden='true'>×</span>
          <input
            type='number'
            aria-label='Высота, px'
            title='Высота, px'
            min={320}
            max={2160}
            step={1}
            value={heightDraft}
            onChange={event => changeDraft('height', event.target.value)}
            onBlur={() => commitDraft('height')}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <span>px</span>
        </div>
        <button
          type='button'
          className='ai-preview-rotate'
          aria-label='Повернуть экран'
          title='Поменять ширину и высоту'
          onClick={rotate}
        >
          <RotateCw size={15} />
        </button>
        <div
          className='ai-preview-zoom'
          role='group'
          aria-label='Масштаб предпросмотра'
        >
          <button type='button' aria-pressed={fit} onClick={() => setFit(true)}>
            <Maximize2 size={14} aria-hidden='true' />
            Вписать · {Math.round(scale * 100)}%
          </button>
          <button
            type='button'
            aria-pressed={!fit}
            onClick={() => setFit(false)}
          >
            100%
          </button>
        </div>
        <button
          ref={closeButton}
          type='button'
          className='ai-preview-close'
          onClick={close}
        >
          <X size={16} aria-hidden='true' />
          Закрыть предпросмотр
        </button>
      </header>
      <div ref={stage} className='ai-preview-stage'>
        <div className='ai-preview-stage-inner'>
          <div
            className='ai-preview-frame-canvas'
            style={{ width: size.width * scale, height: size.height * scale }}
          >
            <iframe
              className='ai-preview-frame'
              src='/?ai-preview=phone'
              width={size.width}
              height={size.height}
              style={{
                width: size.width,
                height: size.height,
                transform: `scale(${scale})`,
              }}
              title='Главная страница — предпросмотр'
              onLoad={frameLoaded}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

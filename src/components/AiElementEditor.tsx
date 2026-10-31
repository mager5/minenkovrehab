'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Mic, Square, MousePointer2, Undo2, X, ChevronUp } from 'lucide-react';
import {
  applyOverrides,
  editableRootSelector,
  describeElement,
  hitTarget,
  parentTarget,
  resolveTarget,
  targetBounds,
} from '@/lib/element-editor-dom';
import {
  targetSchema,
  type EditTarget,
  type ElementOverride,
} from '@/lib/element-editor-schema';
import './ai-element-editor.css';

export default function AiElementEditor() {
  const enabled = process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1';
  const [ready, setReady] = useState(false);
  const [slots, setSlots] = useState<Element[]>([]);
  const [picking, setPicking] = useState(false);
  const [hover, setHover] = useState<EditTarget | null>(null);
  const [box, setBox] = useState<DOMRect | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [selected, setSelected] = useState<EditTarget | null>(null);
  const [overrides, setOverrides] = useState<ElementOverride[]>([]);
  const [revision, setRevision] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [settings, setSettings] = useState(false);
  const [key, setKey] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState(
    'Нажмите «Выделить элемент» в шапке, наведите курсор и добавьте элемент в чат.'
  );
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const alive = useRef(true);
  const voiceRequest = useRef<AbortController | null>(null);
  const blocked = busy || recording || recognizing;
  useEffect(() => {
    let cancelled = false;
    if (enabled)
      fetch('/api/ai-test')
        .then(r => r.json())
        .then(data => {
          if (cancelled) return;
          try {
            const draft = JSON.parse(
              sessionStorage.getItem('ai-element-draft') || 'null'
            );
            if (draft) {
              const target = targetSchema.safeParse(draft.selected);
              if (target.success) setSelected(target.data);
              if (typeof draft.message === 'string')
                setMessage(draft.message.slice(0, 2000));
            }
          } catch {
            /* An unavailable browser store must not block the editor. */
          }
          setReady(true);
          setSlots(
            Array.from(document.querySelectorAll('[data-ai-picker-slot]'))
          );
          setConfigured(Boolean(data.configured));
          setOverrides(data.overrides || []);
          setRevision(data.revision || '');
          setCanUndo(Boolean(data.canUndo));
        })
        .catch(() => {
          if (!cancelled)
            setReply(
              'Не удалось загрузить локальный редактор. Обновите страницу.'
            );
        });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        'ai-element-draft',
        JSON.stringify({ selected, message })
      );
    } catch {
      /* The draft can still be used without browser storage. */
    }
  }, [ready, selected, message]);

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => {
      fetch('/api/ai-test')
        .then(r => r.json())
        .then(data => {
          if (alive.current) setConfigured(Boolean(data.configured));
        })
        .catch(() => {});
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ready) return;
    let restore = () => {};
    let scheduled = 0;
    const apply = () => {
      observer?.disconnect();
      restore();
      restore = applyOverrides(overrides);
      observer?.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    };
    const observer = new MutationObserver(records => {
      const relevant = records.some(record => {
        const element =
          record.target instanceof Element
            ? record.target
            : record.target.parentElement;
        return (
          element &&
          !element.closest('[data-ai-editor]') &&
          (element.closest(editableRootSelector) ||
            Array.from(record.addedNodes).some(
              node =>
                node instanceof Element &&
                (node.matches(editableRootSelector) ||
                  node.querySelector(editableRootSelector))
            ))
        );
      });
      if (relevant && !scheduled)
        scheduled = requestAnimationFrame(() => {
          scheduled = 0;
          apply();
        });
    });
    apply();
    return () => {
      observer.disconnect();
      if (scheduled) cancelAnimationFrame(scheduled);
      restore();
    };
  }, [enabled, ready, overrides]);

  useEffect(() => {
    if (!picking) return;
    let pending: ReturnType<typeof setTimeout> | null = null;
    const move = (event: PointerEvent) => {
      if (pending) clearTimeout(pending);
      if ((event.target as Element)?.closest('[data-ai-editor]') || frozen)
        return;
      const target = hitTarget(event.clientX, event.clientY);
      pending = setTimeout(() => {
        setHover(target);
        setBox(target ? targetBounds(target) : null);
      }, 65);
    };
    const down = (event: PointerEvent) => {
      if ((event.target as Element)?.closest('[data-ai-editor]')) return;
      event.preventDefault();
      event.stopPropagation();
      const target = hitTarget(event.clientX, event.clientY);
      setHover(target);
      setBox(target ? targetBounds(target) : null);
      setFrozen(true);
    };
    const click = (event: MouseEvent) => {
      if (!(event.target as Element)?.closest('[data-ai-editor]')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPicking(false);
        setHover(null);
        setBox(null);
        setFrozen(false);
      }
    };
    document.addEventListener('pointermove', move, true);
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('click', click, true);
    document.addEventListener('keydown', keydown, true);
    return () => {
      if (pending) clearTimeout(pending);
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('click', click, true);
      document.removeEventListener('keydown', keydown, true);
    };
  }, [picking, frozen]);
  useEffect(() => {
    if (!hover || !picking) return;
    const update = () => setBox(targetBounds(hover));
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [hover, picking]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      voiceRequest.current?.abort();
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current) {
        recorder.current.onstop = null;
        if (recorder.current.state === 'recording') recorder.current.stop();
      }
      stream.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  if (!enabled || !ready) return null;
  function togglePicker() {
    setPicking(value => !value);
    setHover(null);
    setBox(null);
    setFrozen(false);
    setCollapsed(false);
  }
  function addToChat() {
    if (!hover) return;
    setSelected(hover);
    setPicking(false);
    setHover(null);
    setBox(null);
    setFrozen(false);
    setCollapsed(false);
    setReply('Элемент добавлен. Опишите, что нужно изменить именно в нём.');
    requestAnimationFrame(() => textarea.current?.focus());
  }
  function chooseParent() {
    if (!hover) return;
    const parent = parentTarget(hover);
    if (parent) {
      setHover(parent);
      setBox(targetBounds(parent));
      setFrozen(true);
    }
  }
  async function send(action: string) {
    if (action === 'chat' && !configured) {
      setSettings(true);
      setReply(
        'AI не подключён: после перезапуска сервера ключ нужно подключить снова. Выбор элемента и команда сохранены.'
      );
      return;
    }
    if (action === 'chat' && !selected) {
      setReply('Сначала добавьте элемент в чат.');
      return;
    }
    setBusy(true);
    try {
      let target = selected;
      if (action === 'chat' && selected) {
        const node = resolveTarget(selected);
        // Dropdown entries may unmount when the pointer moves into the chat.
        // Keep the explicit selection and apply its saved override on reopening.
        target = node ? describeElement(node) || selected : selected;
      }
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'configure'
            ? { action, key }
            : { action, target, message, revision }
        ),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === 'missing_key') {
          setConfigured(false);
          setSettings(true);
        }
        throw Error(data.error || 'Не удалось применить изменение.');
      }
      if (action === 'configure') {
        setConfigured(true);
        setSettings(false);
        setKey('');
        setReply('AI подключён. Выберите элемент и опишите правку.');
      } else {
        setOverrides(data.overrides);
        setRevision(data.revision);
        setCanUndo(Boolean(data.canUndo));
        setReply(data.reply);
        if (action === 'chat') setMessage('');
      }
    } catch (error) {
      setReply(error instanceof Error ? error.message : 'Ошибка соединения.');
    } finally {
      setBusy(false);
    }
  }
  async function startVoice() {
    if (!configured) {
      setSettings(true);
      setReply('Для голосового ввода подключите API-ключ.');
      return;
    }
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setReply(
        'Этот браузер не поддерживает запись. Откройте локальный тест в Chrome или используйте системную диктовку.'
      );
      return;
    }
    try {
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) {
        input.getTracks().forEach(track => track.stop());
        return;
      }
      stream.current = input;
      const mime = [
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ].find(type => MediaRecorder.isTypeSupported(type));
      const instance = new MediaRecorder(
        input,
        mime ? { mimeType: mime } : undefined
      );
      recorder.current = instance;
      const chunks: Blob[] = [];
      let size = 0;
      instance.ondataavailable = event => {
        if (event.data.size) {
          chunks.push(event.data);
          size += event.data.size;
          if (size > 5 * 1024 * 1024 && instance.state === 'recording')
            instance.stop();
        }
      };
      instance.onstop = async () => {
        input.getTracks().forEach(track => track.stop());
        stream.current = null;
        recorder.current = null;
        if (timer.current) clearTimeout(timer.current);
        if (!alive.current) return;
        setRecording(false);
        const audio = new Blob(chunks, { type: instance.mimeType });
        if (audio.size < 100 || audio.size > 5 * 1024 * 1024) {
          setReply('Запись пустая или слишком длинная. Попробуйте короче.');
          return;
        }
        setRecognizing(true);
        setReply('Распознаю речь…');
        try {
          const controller = new AbortController();
          voiceRequest.current = controller;
          const response = await fetch('/api/ai-test/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': audio.type },
            body: audio,
            signal: controller.signal,
          });
          const data = await response.json();
          if (!response.ok)
            throw Error(data.error || 'Не удалось распознать речь.');
          if (!alive.current) return;
          setMessage(previous =>
            ((previous ? previous + ' ' : '') + data.text).slice(0, 2000)
          );
          setReply(
            'Речь добавлена в поле. Проверьте текст и нажмите «Применить к элементу».'
          );
          textarea.current?.focus();
        } catch (error) {
          if (!alive.current) return;
          setReply(
            error instanceof Error ? error.message : 'Ошибка распознавания.'
          );
        } finally {
          if (alive.current) setRecognizing(false);
        }
      };
      instance.onerror = () => {
        instance.onstop = null;
        if (instance.state === 'recording') instance.stop();
        if (timer.current) clearTimeout(timer.current);
        input.getTracks().forEach(track => track.stop());
        stream.current = null;
        recorder.current = null;
        setRecording(false);
        setReply('Не удалось записать звук. Проверьте микрофон.');
      };
      instance.start(250);
      setRecording(true);
      setReply('Говорите. Нажмите квадрат, чтобы закончить запись.');
      timer.current = setTimeout(() => {
        if (instance.state === 'recording') instance.stop();
      }, 60000);
    } catch (error) {
      stream.current?.getTracks().forEach(track => track.stop());
      if (!alive.current) return;
      setReply(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Браузер не разрешил микрофон. Разрешите доступ для локального теста или введите текст.'
          : 'Микрофон недоступен. Проверьте подключение и разрешения.'
      );
    }
  }
  function voice() {
    if (recording) {
      if (recorder.current?.state === 'recording') recorder.current.stop();
    } else void startVoice();
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void send('chat');
  }
  const selectButton = (
    <button
      data-ai-editor
      type='button'
      aria-label={picking ? 'Завершить выбор' : 'Выделить элемент'}
      className={`ai-pick-header ${picking ? 'ai-active' : ''}`}
      onClick={togglePicker}
      aria-pressed={picking}
    >
      <MousePointer2 size={15} />
      <span>{picking ? 'Завершить выбор' : 'Выделить элемент'}</span>
    </button>
  );
  const toolbar =
    hover && box && picking ? (
      <div
        data-ai-editor
        className='ai-pick-tooltip'
        style={{
          left: Math.max(8, Math.min(box.left, window.innerWidth - 310)),
          top: Math.max(8, Math.min(box.bottom + 5, window.innerHeight - 78)),
        }}
      >
        <span>
          {hover.kind === 'text'
            ? 'Текст'
            : hover.tag === 'img'
              ? 'Картинка'
              : hover.tag === 'a' || hover.tag === 'button'
                ? 'Кнопка / ссылка'
                : `Контейнер ${hover.tag}`}
        </span>
        <div>
          <button onClick={addToChat}>Добавить в чат</button>
          <button
            onClick={chooseParent}
            title='Выбрать кнопку или контейнер целиком'
          >
            <ChevronUp size={14} />
            Родитель
          </button>
          <button
            onClick={() => {
              setFrozen(false);
              setHover(null);
              setBox(null);
            }}
            aria-label='Продолжить выбор'
          >
            <X size={14} />
          </button>
        </div>
      </div>
    ) : null;
  return (
    <>
      {slots.map((slot, index) =>
        createPortal(selectButton, slot, String(index))
      )}
      {picking &&
        box &&
        createPortal(
          <div
            data-ai-editor
            className='ai-pick-outline'
            style={{
              left: box.left - 2,
              top: box.top - 2,
              width: box.width + 4,
              height: box.height + 4,
            }}
          />,
          document.body
        )}
      {toolbar && createPortal(toolbar, document.body)}
      {createPortal(
        <aside
          data-ai-editor
          aria-label='Редактор выбранного элемента'
          className={`ai-element-panel ${collapsed ? 'ai-element-collapsed' : ''}`}
        >
          {collapsed ? (
            <button onClick={() => setCollapsed(false)}>
              Открыть редактор элемента
            </button>
          ) : (
            <>
              <div className='ai-element-panel-head'>
                <strong>Редактор элемента</strong>
                <button
                  onClick={() => setCollapsed(true)}
                  aria-label='Свернуть редактор'
                >
                  −
                </button>
              </div>
              <p className='ai-element-meta'>
                Тестовая копия · {configured ? 'AI подключён' : 'подключите AI'}
              </p>
              {selected ? (
                <div className='ai-element-selected'>
                  <span>
                    {selected.kind === 'text'
                      ? 'Текст'
                      : selected.tag === 'img'
                        ? 'Картинка'
                        : `Элемент ${selected.tag}`}{' '}
                    · {selected.label.slice(0, 100)}
                  </span>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label='Убрать выбранный элемент'
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button className='ai-element-select' onClick={togglePicker}>
                  <MousePointer2 size={15} />
                  Выделить элемент
                </button>
              )}
              <p role='status' aria-live='polite' className='ai-element-reply'>
                {busy ? 'Применяю правку…' : reply}
              </p>
              {!configured && (
                <p className='ai-element-meta'>
                  AI не подключён. Подключите ключ ниже; выбранный элемент и
                  команда сохранятся.
                </p>
              )}
              <form onSubmit={submit}>
                <label htmlFor='ai-element-message'>
                  Что изменить в выбранном элементе?
                </label>
                <textarea
                  ref={textarea}
                  id='ai-element-message'
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  disabled={blocked}
                  placeholder='Например: сделай фон кнопки синим, текст оставь белым'
                />
                <div className='ai-element-send'>
                  <button type='submit' disabled={blocked || !message.trim()}>
                    {!configured
                      ? 'Подключить AI для применения'
                      : !selected
                        ? 'Выбрать элемент для применения'
                        : 'Применить к элементу'}
                  </button>
                  <button
                    type='button'
                    className={recording ? 'ai-voice-recording' : ''}
                    onClick={voice}
                    disabled={busy || recognizing}
                    aria-label={
                      recording ? 'Остановить запись' : 'Голосовой ввод'
                    }
                    title={
                      recording ? 'Завершить запись' : 'Продиктовать правку'
                    }
                  >
                    {recording ? <Square size={19} /> : <Mic size={19} />}
                  </button>
                </div>
              </form>
              <p className='ai-element-disclosure'>
                В OpenAI отправляются выбранный элемент и команда. При голосовом
                вводе — также запись. Распознанный текст можно проверить перед
                применением.
              </p>
              <div className='ai-element-actions'>
                <button
                  disabled={blocked || !canUndo}
                  onClick={() => void send('undo')}
                >
                  <Undo2 size={13} />
                  Отменить
                </button>
                <button
                  disabled={blocked}
                  onClick={() => setSettings(!settings)}
                >
                  {configured ? 'Настроить AI' : 'Подключить AI'}
                </button>
              </div>
              {settings && (
                <form
                  className='ai-element-key'
                  onSubmit={event => {
                    event.preventDefault();
                    void send('configure');
                  }}
                >
                  <label htmlFor='ai-element-key'>OpenAI API-ключ</label>
                  <input
                    id='ai-element-key'
                    type='password'
                    autoComplete='off'
                    value={key}
                    onChange={event => setKey(event.target.value)}
                  />
                  <small>Ключ хранится в памяти локального сервера.</small>
                  <button disabled={blocked || !key}>Подключить</button>
                </form>
              )}
            </>
          )}
        </aside>,
        document.body
      )}
    </>
  );
}

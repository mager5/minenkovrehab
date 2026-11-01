'use client';
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FormEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Mic,
  Square,
  MousePointer2,
  Undo2,
  X,
  ChevronUp,
  Check,
} from 'lucide-react';
import {
  applyOverrides,
  editableRootSelector,
  describeElement,
  hitTarget,
  inlineTextTarget,
  parentTarget,
  resolveTarget,
  targetBounds,
} from '@/lib/element-editor-dom';
import {
  targetSchema,
  targetKey,
  type EditTarget,
  type ElementOverride,
} from '@/lib/element-editor-schema';
import './ai-element-editor.css';
import AiBlockReorder from './AiBlockReorder';
import AiPreviewWidget from './AiPreviewWidget';
import AiElementInspector, { type EditorResult } from './AiElementInspector';
import {
  setLayoutOrders,
  setLayoutHidden,
  setLayoutCopies,
  withLayoutVisibilityRestored,
} from '@/lib/ai-layout-store';

export default function AiElementEditor() {
  const enabled = process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1';
  const previewOnly =
    typeof window !== 'undefined' &&
    (window.self !== window.top ||
      new URLSearchParams(window.location.search).has('ai-preview'));
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
  const [actions, setActions] = useState<{ step: number; label: string }[]>([]);
  const [configured, setConfigured] = useState(false);
  const [settings, setSettings] = useState(false);
  const [key, setKey] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState(
    'Нажмите «Выделить элемент» в шапке, наведите курсор и добавьте элемент в чат.'
  );
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [inlineEdit, setInlineEdit] = useState<EditTarget | null>(null);
  const [textDraft, setTextDraft] = useState('');
  const [textError, setTextError] = useState('');
  const inlineSession = useRef<{
    node: HTMLElement;
    restore: () => void;
  } | null>(null);
  const [inlineVersion, setInlineVersion] = useState(0);
  const [inlineControls, setInlineControls] = useState<Element | null>(null);
  const [recording, setRecording] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const alive = useRef(true);
  const voiceRequest = useRef<AbortController | null>(null);
  const blocked = busy || recording || recognizing;
  const finishText = useCallback(() => {
    const session = inlineSession.current;
    session?.restore();
    inlineSession.current = null;
    setInlineEdit(null);
    setInlineControls(null);
    setTextError('');
    setInlineVersion(value => value + 1);
    session?.node.focus();
  }, []);

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
          if (data.configurationError) setReply(data.configurationError);
          setOverrides(data.overrides || []);
          setRevision(data.revision || '');
          setCanUndo(Boolean(data.canUndo));
          setActions(data.actions || []);
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
    if (!ready || previewOnly) return;
    try {
      sessionStorage.setItem(
        'ai-element-draft',
        JSON.stringify({ selected, message })
      );
    } catch {
      /* The draft can still be used without browser storage. */
    }
  }, [ready, selected, message, previewOnly]);

  useEffect(() => {
    if (!previewOnly) return;
    document.documentElement.setAttribute('data-ai-preview', '');
    return () => document.documentElement.removeAttribute('data-ai-preview');
  }, [previewOnly]);

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
    setLayoutCopies(
      Object.fromEntries(
        overrides.flatMap(item =>
          item.layout ? [[item.layout.group, item.layout.copies || []]] : []
        )
      )
    );
    setLayoutOrders(
      Object.fromEntries(
        overrides.flatMap(item =>
          item.layout ? [[item.layout.group, item.layout.order]] : []
        )
      )
    );
    setLayoutHidden(
      Object.fromEntries(
        overrides.flatMap(item =>
          item.layout ? [[item.layout.group, item.layout.hidden || []]] : []
        )
      )
    );
  }, [enabled, ready, overrides]);
  useEffect(
    () => () => {
      setLayoutCopies({});
      setLayoutOrders({});
      setLayoutHidden({});
    },
    []
  );

  useEffect(() => {
    if (!enabled || !ready) return;
    let restore = () => {};
    let scheduled = 0;
    const apply = () => {
      observer?.disconnect();
      restore = withLayoutVisibilityRestored(() => {
        restore();
        return applyOverrides(overrides);
      });
      observer?.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    };
    const observer = new MutationObserver(records => {
      if (inlineSession.current) {
        if (!inlineSession.current.node.isConnected) finishText();
        return;
      }
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
      withLayoutVisibilityRestored(restore);
    };
  }, [enabled, ready, overrides, inlineVersion, finishText]);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setSelected(previous => {
        if (!previous) return previous;
        const node = resolveTarget(previous);
        return node ? describeElement(node) || previous : previous;
      })
    );
    return () => cancelAnimationFrame(frame);
  }, [overrides]);

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

  useEffect(() => {
    if (!enabled || !ready || picking || blocked || previewOnly) return;
    const open = (event: Event) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element || element.closest('[data-ai-editor]')) return;
      if (inlineSession.current) {
        if (event instanceof KeyboardEvent) {
          if (event.key === 'Escape') {
            event.preventDefault();
            finishText();
          }
          return;
        }
        // Keep caret clicks inside the current caption; other captions can take over.
        if (inlineSession.current.node.contains(element)) {
          if (element.closest('a,button')) event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key))
        return;
      const picture = element.closest('img');
      const section = element.closest('section');
      const background =
        !picture &&
        section &&
        getComputedStyle(section).backgroundImage !== 'none' &&
        !inlineTextTarget(element)
          ? section
          : null;
      if (picture || background) {
        const target = describeElement(picture || background!);
        if (target) {
          if (inlineSession.current) finishText();
          event.preventDefault();
          event.stopPropagation();
          setSelected(target);
          setCollapsed(false);
          setReply(
            'Изображение выбрано. Нажмите «Заменить изображение» в редакторе.'
          );
        }
        return;
      }
      const target = inlineTextTarget(
        element,
        event instanceof MouseEvent ? event.clientX : undefined,
        event instanceof MouseEvent ? event.clientY : undefined
      );
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const text = resolveTarget(target);
      if (inlineSession.current) {
        // Clicking the same button's padding must not discard its draft.
        if (text && inlineSession.current.node.contains(text)) return;
        finishText();
      }
      setInlineEdit(target);
      setTextDraft(text instanceof Text ? text.data : target.label);
      setTextError('');
    };
    document.addEventListener('click', open, true);
    document.addEventListener('keydown', open, true);
    return () => {
      document.removeEventListener('click', open, true);
      document.removeEventListener('keydown', open, true);
    };
  }, [enabled, ready, picking, blocked, finishText, previewOnly]);
  useEffect(() => {
    if (!inlineEdit) return;
    const text = resolveTarget(inlineEdit);
    if (!(text instanceof Text) || !text.parentElement) return;
    const original = text.data;
    const parent = text.parentElement;
    const slot = document.createElement('div');
    slot.setAttribute('data-ai-editor', '');
    slot.className = 'ai-inline-control-slot';
    document.body.appendChild(slot);
    const node = document.createElement('span');
    node.setAttribute('data-ai-generated', 'inline-editor');
    node.setAttribute('data-ai-inline-editing', '');
    parent.insertBefore(node, text);
    node.appendChild(text);
    const button = parent.closest('a,button');
    const position = () => {
      const bounds = (button || node).getBoundingClientRect();
      const panel = slot.getBoundingClientRect();
      slot.style.left = `${Math.max(8, Math.min(bounds.left, window.innerWidth - panel.width - 8))}px`;
      const top =
        button && bounds.bottom + panel.height + 16 < window.innerHeight
          ? bounds.bottom + 8
          : bounds.top >= panel.height + 16
            ? bounds.top - panel.height - 8
            : bounds.bottom + 8;
      slot.style.top = `${Math.max(8, Math.min(top, window.innerHeight - panel.height - 8))}px`;
    };
    const input = () => {
      setTextDraft(node.innerText || node.textContent || '');
      position();
    };
    const observer = new ResizeObserver(position);
    observer.observe(slot);
    observer.observe(node);
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    const frame = requestAnimationFrame(position);
    const keydown = (event: KeyboardEvent) => {
      if (node.contentEditable === 'false') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        finishText();
      }
    };
    node.contentEditable = 'plaintext-only';
    node.setAttribute('role', 'textbox');
    node.setAttribute('aria-label', 'Редактируемый текст');
    node.tabIndex = 0;
    node.addEventListener('input', input);
    node.addEventListener('keydown', keydown);
    const session = {
      node,
      restore: () => {
        node.removeEventListener('input', input);
        node.removeEventListener('keydown', keydown);
        observer.disconnect();
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', position, true);
        window.removeEventListener('resize', position);
        text.data = original;
        node.replaceWith(text);
        slot.remove();
      },
    };
    // Publish the portal destination created in the DOM for this editing session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInlineControls(slot);
    inlineSession.current = session;
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return () => {
      if (inlineSession.current === session) {
        session.restore();
        inlineSession.current = null;
      }
    };
  }, [inlineEdit, finishText]);
  useEffect(() => {
    if (inlineSession.current)
      inlineSession.current.node.contentEditable = busy
        ? 'false'
        : 'plaintext-only';
  }, [busy, inlineEdit]);

  if (!enabled || !ready || previewOnly) return null;
  function closeText() {
    if (!busy) finishText();
  }
  async function saveText(event: FormEvent) {
    event.preventDefault();
    if (!inlineEdit || blocked) return;
    setBusy(true);
    setTextError('');
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'text',
          page: '/',
          target: inlineEdit,
          text: textDraft,
          revision,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || 'Не удалось сохранить текст.');
      finishText();
      setOverrides(data.overrides);
      setRevision(data.revision);
      setCanUndo(Boolean(data.canUndo));
      setActions(data.actions || []);
      setReply(data.reply);
    } catch (error) {
      setTextError(
        error instanceof Error ? error.message : 'Ошибка соединения.'
      );
    } finally {
      setBusy(false);
    }
  }
  function togglePicker() {
    if (inlineEdit) return;
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
  function acceptEdit(data: EditorResult) {
    setOverrides(data.overrides);
    setRevision(data.revision);
    setCanUndo(Boolean(data.canUndo));
    setActions(data.actions || []);
    if (data.reply) setReply(data.reply);
  }
  async function copyBlock(target: EditTarget, group: string, index: number) {
    if (blocked || inlineEdit || picking) return;
    setBusy(true);
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate-block',
          page: '/',
          target,
          group,
          index,
          revision,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || 'Не удалось дублировать блок.');
      acceptEdit(data);
    } catch (error) {
      setReply(error instanceof Error ? error.message : 'Ошибка соединения.');
    } finally {
      setBusy(false);
    }
  }
  async function moveBlocks(
    target: EditTarget,
    group: string,
    order: number[]
  ) {
    if (blocked || inlineEdit || picking) return;
    setBusy(true);
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          page: '/',
          target,
          group,
          order,
          revision,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || 'Не удалось переставить блоки.');
      setOverrides(data.overrides);
      setRevision(data.revision);
      setCanUndo(Boolean(data.canUndo));
      setActions(data.actions || []);
      setReply(data.reply);
    } catch (error) {
      setReply(error instanceof Error ? error.message : 'Ошибка соединения.');
    } finally {
      setBusy(false);
    }
  }
  async function removeBlock(target: EditTarget, group: string, index: number) {
    if (blocked || inlineEdit || picking) return;
    setBusy(true);
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-block',
          page: '/',
          confirmed: true,
          target,
          group,
          index,
          revision,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Не удалось удалить блок.');
      setOverrides(data.overrides);
      setRevision(data.revision);
      setCanUndo(Boolean(data.canUndo));
      setActions(data.actions || []);
      setReply(data.reply);
    } catch (error) {
      setReply(error instanceof Error ? error.message : 'Ошибка соединения.');
    } finally {
      setBusy(false);
    }
  }
  async function send(action: string) {
    if (inlineEdit) {
      setReply('Сначала сохраните текст или отмените правку.');
      return;
    }
    if (action === 'chat' && !configured) {
      setSettings(true);
      setReply(
        'Подключите AI один раз. Ключ сохранится в Связке ключей macOS и будет доступен после перезапуска. Выбор элемента и команда сохранены.'
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
        setReply(
          'AI подключён. Ключ сохранён в Связке ключей macOS; повторный ввод после перезапуска не нужен.'
        );
      } else {
        setOverrides(data.overrides);
        setRevision(data.revision);
        setCanUndo(Boolean(data.canUndo));
        setActions(data.actions || []);
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
      <AiPreviewWidget />
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
      {inlineEdit &&
        inlineControls &&
        createPortal(
          <form
            data-ai-editor
            className='ai-inline-controls'
            onSubmit={saveText}
            onKeyDown={event => {
              if (event.key === 'Escape') closeText();
            }}
          >
            <button
              type='submit'
              className='ai-inline-save'
              disabled={busy || !textDraft.trim() || textDraft.length > 2000}
            >
              <Check size={14} aria-hidden='true' />
              {busy ? 'Сохраняю…' : 'Сохранить'}
            </button>
            <button
              type='button'
              className='ai-inline-cancel'
              onClick={closeText}
              disabled={busy}
              aria-label='Отмена'
              title='Отменить изменения (Esc)'
            >
              <X size={16} aria-hidden='true' />
            </button>
            {textDraft.length >= 1800 && (
              <span className='ai-inline-count' aria-live='polite'>
                {textDraft.length <= 2000
                  ? `Осталось ${2000 - textDraft.length}`
                  : `${textDraft.length - 2000} сверх лимита`}
              </span>
            )}
            {textError && <p role='alert'>{textError}</p>}
          </form>,
          inlineControls
        )}

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
              <AiElementInspector
                key={`${selected ? targetKey(selected) : 'none'}:${revision}`}
                selected={selected}
                revision={revision}
                disabled={blocked || Boolean(inlineEdit) || picking}
                onBusy={setBusy}
                onSaved={acceptEdit}
                onError={setReply}
              />
              <AiBlockReorder
                disabled={blocked || Boolean(inlineEdit) || picking}
                onMove={moveBlocks}
                onDelete={removeBlock}
                onDuplicate={copyBlock}
                onNotice={setReply}
              />
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
              {actions.length > 0 && (
                <details className='ai-action-history'>
                  <summary>История действий · {actions.length}</summary>
                  <p>
                    Последние 20 действий. «Отменить» возвращает предыдущий шаг.
                  </p>
                  <ol>
                    {actions.map(action => (
                      <li key={action.step}>
                        <span>{action.step}</span>
                        {action.label}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
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
                  <small>
                    Ключ сохраняется в Связке ключей macOS на этом компьютере. В
                    Git и браузере его нет.
                  </small>
                  <button disabled={blocked || !key}>
                    Сохранить и подключить
                  </button>
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

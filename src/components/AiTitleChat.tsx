'use client';
import { useEffect, useState, type FormEvent } from 'react';
import type { HomePage } from '@/lib/home-editor-schema';

type Message = { role: 'user' | 'assistant'; text: string };
const panelStyle = {
  position: 'fixed',
  right: 16,
  bottom: 16,
  width: 'min(410px, calc(100vw - 32px))',
  padding: 20,
  background: 'white',
  color: '#15382f',
  borderRadius: 18,
  boxShadow: '0 8px 50px #0004',
  zIndex: 1000,
} as const;

export default function AiTitleChat({
  onPageChange,
}: {
  onPageChange: (_page: HomePage) => void;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Что изменить на главной? Могу редактировать тексты, кнопки, фотографии, цвета, размеры, отступы и блоки. Например: «Добавь FAQ после услуг». Предыдущее изменение можно отменить.',
    },
  ]);
  const [key, setKey] = useState('');
  const [configured, setConfigured] = useState(false);
  const [settings, setSettings] = useState(false);
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [revision, setRevision] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const enabled = process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1';
  useEffect(() => {
    if (historyReady) {
      try {
        sessionStorage.setItem(
          'ai-home-editor-history',
          JSON.stringify({ messages, draft: message })
        );
      } catch {}
    }
  }, [historyReady, messages, message]);
  useEffect(() => {
    let cancelled = false;
    if (enabled)
      fetch('/api/ai-test')
        .then(r => r.json())
        .then(data => {
          if (cancelled) return;
          try {
            const saved = JSON.parse(
              sessionStorage.getItem('ai-home-editor-history') || 'null'
            );
            if (
              saved &&
              Array.isArray(saved.messages) &&
              saved.messages.every(
                (item: Message) =>
                  ['user', 'assistant'].includes(item.role) &&
                  typeof item.text === 'string'
              )
            )
              setMessages(saved.messages.slice(-16));
            if (typeof saved?.draft === 'string')
              setMessage(saved.draft.slice(0, 3000));
          } catch {}
          setHistoryReady(true);
          setConfigured(Boolean(data.configured));
          setRevision(data.revision || '');
          setCanUndo(Boolean(data.canUndo));
          if (data.page) onPageChange(data.page);
        })
        .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled, onPageChange]);
  if (!enabled) return null;

  function reply(text: string) {
    setMessages(previous =>
      [...previous, { role: 'assistant' as const, text }].slice(-16)
    );
  }
  async function send(action: string) {
    setBusy(true);
    if (action === 'chat')
      setMessages(previous =>
        [...previous, { role: 'user' as const, text: message }].slice(-16)
      );
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'configure'
            ? { action, key }
            : {
                action,
                message,
                revision,
                history: messages
                  .slice(-8)
                  .map(item => ({ ...item, text: item.text.slice(0, 1200) })),
              }
        ),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || 'Не удалось выполнить команду.');
      if (data.page) onPageChange(data.page);
      if (data.revision) setRevision(data.revision);
      if (typeof data.canUndo === 'boolean') setCanUndo(data.canUndo);
      if (action === 'configure') {
        setKey('');
        setConfigured(true);
        setSettings(false);
        reply('AI подключён. Опишите изменение главной страницы.');
      } else {
        reply(data.reply);
        if (action === 'chat') setMessage('');
      }
    } catch (error) {
      reply(error instanceof Error ? error.message : 'Ошибка соединения.');
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void send('chat');
  }
  if (collapsed)
    return (
      <aside
        aria-label='AI-эксперимент'
        style={{ ...panelStyle, width: 'auto', padding: '12px 20px' }}
      >
        <button onClick={() => setCollapsed(false)}>
          Открыть редактор главной {busy ? '· выполняю…' : ''}
        </button>
      </aside>
    );
  return (
    <aside aria-label='AI-эксперимент' style={panelStyle}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}
      >
        <strong style={{ fontSize: 20 }}>Редактор главной</strong>
        <button
          onClick={() => setCollapsed(true)}
          aria-label='Свернуть редактор'
        >
          −
        </button>
      </div>
      <p style={{ fontSize: 13, margin: '6px 0 12px' }}>
        Тестовая копия · {configured ? 'AI подключён' : 'AI ещё не подключён'}
      </p>
      <div
        aria-label='История редактора'
        style={{
          maxHeight: 'min(260px, 30vh)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 8,
          marginBottom: 12,
        }}
      >
        {[...messages].reverse().map((item, index) => (
          <p
            key={index}
            style={{
              padding: 11,
              background: item.role === 'user' ? '#e5edf9' : '#eef8f4',
              borderRadius: 10,
              fontSize: 14,
              whiteSpace: 'pre-wrap',
            }}
          >
            <strong>{item.role === 'user' ? 'Вы' : 'AI'}</strong>
            <br />
            {item.text}
          </p>
        ))}
      </div>
      <p
        role='status'
        aria-live='polite'
        style={{ fontSize: 13, marginBottom: busy ? 10 : 0 }}
      >
        {busy ? 'Изменяю главную…' : ''}
      </p>
      <form onSubmit={submit}>
        <label htmlFor='ai-message'>Что изменить на главной?</label>
        <textarea
          id='ai-message'
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={3000}
          rows={3}
          disabled={busy || !historyReady}
          placeholder='Сделай первый экран светлым и добавь кнопку «Выбрать программу»'
          style={{
            width: '100%',
            padding: 10,
            border: '1px solid #adc9bd',
            borderRadius: 8,
            margin: '5px 0 8px',
          }}
        />
        <p
          style={{
            fontSize: 11,
            lineHeight: 1.4,
            marginBottom: 10,
            color: '#526c61',
          }}
        >
          При отправке команды тексты и настройки главной, включая её контакты,
          передаются в OpenAI для подготовки изменения.
        </p>
        <button
          disabled={busy || !message.trim() || !configured || !revision}
          type='submit'
          style={{
            padding: '10px 18px',
            background: '#087d60',
            color: 'white',
            borderRadius: 8,
            opacity: configured ? 1 : 0.5,
          }}
        >
          Изменить главную
        </button>
      </form>
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          fontSize: 13,
          marginTop: 12,
        }}
      >
        <button
          disabled={busy || !canUndo}
          onClick={() => void send('undo')}
          style={{ opacity: canUndo ? 1 : 0.4 }}
        >
          Отменить последнее
        </button>
        <button disabled={busy} onClick={() => setSettings(!settings)}>
          {configured ? 'Настроить AI' : 'Подключить AI'}
        </button>
        <button disabled={busy || !revision} onClick={() => void send('demo')}>
          Проверить без AI
        </button>
      </div>
      {settings && (
        <form
          onSubmit={event => {
            event.preventDefault();
            void send('configure');
          }}
          style={{ marginTop: 12 }}
        >
          <label htmlFor='ai-key'>OpenAI API-ключ</label>
          <input
            id='ai-key'
            type='password'
            autoComplete='off'
            value={key}
            onChange={e => setKey(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #adc9bd',
              padding: 8,
              borderRadius: 8,
              margin: '5px 0',
            }}
          />
          <small>
            Ключ хранится только в памяти локального сервера до его перезапуска.
          </small>
          <button
            disabled={busy || !key}
            type='submit'
            style={{ display: 'block', marginTop: 8 }}
          >
            Подключить
          </button>
        </form>
      )}
    </aside>
  );
}

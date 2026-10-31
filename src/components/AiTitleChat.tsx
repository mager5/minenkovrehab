'use client';
import { useEffect, useState, type FormEvent } from 'react';

export default function AiTitleChat({
  onTitleChange,
}: {
  onTitleChange: (_title: string) => void;
}) {
  const [message, setMessage] = useState(
    'Поменяй заголовок на «Движение к здоровью начинается здесь»'
  );
  const [reply, setReply] = useState(
    'Напишите, как изменить заголовок главной страницы.'
  );
  const [key, setKey] = useState('');
  const [configured, setConfigured] = useState(false);
  const [settings, setSettings] = useState(false);
  const [busy, setBusy] = useState(false);
  const enabled = process.env.NEXT_PUBLIC_AI_TEST_ENABLED === '1';
  useEffect(() => {
    if (enabled)
      fetch('/api/ai-test')
        .then(r => r.json())
        .then(data => setConfigured(Boolean(data.configured)))
        .catch(() => {});
  }, [enabled]);
  if (!enabled) return null;

  async function send(action: string) {
    setBusy(true);
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'configure' ? { action, key } : { action, message }
        ),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || 'Не удалось выполнить команду.');
      if (typeof data.title === 'string') onTitleChange(data.title);
      if (action === 'configure') {
        setKey('');
        setConfigured(true);
        setSettings(false);
        setReply('AI подключён. Теперь отправьте команду.');
      } else setReply(data.reply);
    } catch (error) {
      setReply(error instanceof Error ? error.message : 'Ошибка соединения.');
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void send('chat');
  }
  return (
    <aside
      aria-label='AI-эксперимент'
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        width: 'min(390px, calc(100vw - 32px))',
        padding: 20,
        background: 'white',
        color: '#15382f',
        borderRadius: 18,
        boxShadow: '0 8px 50px #0004',
        zIndex: 1000,
      }}
    >
      <strong style={{ display: 'block', fontSize: 20 }}>
        Редактор заголовка
      </strong>
      <p style={{ fontSize: 13, margin: '6px 0 12px' }}>
        Тестовая копия · {configured ? 'AI подключён' : 'AI ещё не подключён'}
      </p>
      <p
        role='status'
        aria-live='polite'
        style={{
          padding: 12,
          background: '#eef8f4',
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        {busy ? 'Выполняю…' : reply}
      </p>
      <form onSubmit={submit}>
        <label htmlFor='ai-message'>Команда для AI</label>
        <textarea
          id='ai-message'
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={1000}
          rows={3}
          disabled={busy}
          style={{
            width: '100%',
            padding: 10,
            border: '1px solid #adc9bd',
            borderRadius: 8,
            margin: '5px 0 8px',
          }}
        />
        <button
          disabled={busy || !message.trim() || !configured}
          type='submit'
          style={{
            padding: '10px 18px',
            background: '#087d60',
            color: 'white',
            borderRadius: 8,
            opacity: configured ? 1 : 0.5,
          }}
        >
          Изменить через AI
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
        <button disabled={busy} onClick={() => setSettings(!settings)}>
          Подключить AI
        </button>
        <button disabled={busy} onClick={() => void send('demo')}>
          Проверить без AI
        </button>
        <button disabled={busy} onClick={() => void send('reset')}>
          Вернуть заголовок
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

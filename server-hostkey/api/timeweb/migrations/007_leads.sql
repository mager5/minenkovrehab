-- Заявки с форм сайта (главная, /contacts, модалка «Записаться») и очередь уведомлений о них (почта, Telegram).
-- Заявка сохраняется всегда; уведомления отправляет worker, сбой доставки не теряет заявку.
CREATE TABLE rehab.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('home','contacts','modal')),
  site text NOT NULL DEFAULT 'prod' CHECK (site IN ('prod','test')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  phone text NOT NULL CHECK (phone ~ '^\+7[0-9]{10}$'),
  service text CHECK (service IS NULL OR char_length(service) <= 200),
  message text CHECK (message IS NULL OR char_length(message) <= 2000),
  page text CHECK (page IS NULL OR char_length(page) <= 300),
  ip_hash text
);
CREATE INDEX leads_ip_recent ON rehab.leads (ip_hash, created_at);
CREATE TABLE rehab.lead_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES rehab.leads(id),
  channel text NOT NULL CHECK (channel IN ('mail','telegram')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  last_error text,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, channel)
);
GRANT SELECT, INSERT ON rehab.leads TO rehab_payment;
GRANT INSERT ON rehab.lead_outbox TO rehab_payment;
GRANT SELECT ON rehab.leads TO rehab_worker;
GRANT SELECT, UPDATE ON rehab.lead_outbox TO rehab_worker;

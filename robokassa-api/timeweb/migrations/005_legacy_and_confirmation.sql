BEGIN;
ALTER TABLE rehab.purchases ADD COLUMN source text NOT NULL DEFAULT 'payment';
ALTER TABLE rehab.purchases ADD CONSTRAINT legacy_grant_requires_no_order CHECK(source <> 'legacy migration' OR (mode IS NULL AND order_id IS NULL));
CREATE TABLE rehab.email_confirmations (
 token_hash text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES rehab.users(id),
 expires_at timestamptz NOT NULL,
 used_at timestamptz
);
CREATE TABLE rehab.confirmation_mail_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 recipient text NOT NULL,
 confirmation_hash text NOT NULL REFERENCES rehab.email_confirmations(token_hash),
 ciphertext text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')),
 attempts integer NOT NULL DEFAULT 0,
 available_at timestamptz NOT NULL DEFAULT now(),
 last_error text,
 provider_message_id text
);
REVOKE ALL ON ALL TABLES IN SCHEMA rehab FROM PUBLIC;
COMMIT;

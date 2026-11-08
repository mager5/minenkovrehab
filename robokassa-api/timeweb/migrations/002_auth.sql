BEGIN;
CREATE TABLE rehab.csrf_challenges (
  token_hash text PRIMARY KEY,
  session_hash text,
  expires_at timestamptz NOT NULL
);
CREATE TABLE rehab.auth_limits (
  key_hash text PRIMARY KEY,
  attempts integer NOT NULL,
  reset_at timestamptz NOT NULL
);
CREATE TABLE rehab.password_resets (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES rehab.users(id),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE TABLE rehab.auth_mail_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  reset_hash text NOT NULL REFERENCES rehab.password_resets(token_hash),
  ciphertext text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent')),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  last_error text
);
ALTER TABLE rehab.orders ADD COLUMN terms_version text;
REVOKE ALL ON ALL TABLES IN SCHEMA rehab FROM PUBLIC;
COMMIT;

BEGIN;
-- NULL is deliberately unclassified: access predicates require an explicit mode.
ALTER TABLE rehab.purchases ALTER COLUMN mode DROP NOT NULL;
ALTER TABLE rehab.purchases ADD CONSTRAINT purchases_order_requires_mode CHECK(order_id IS NULL OR mode IS NOT NULL);
ALTER TABLE rehab.users ADD COLUMN legacy_attributes jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE rehab.identities (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES rehab.users(id),
 provider text NOT NULL,
 provider_id text NOT NULL,
 identity_data jsonb NOT NULL,
 created_at timestamptz,
 updated_at timestamptz,
 last_sign_in_at timestamptz,
 UNIQUE(provider, provider_id)
);
CREATE TABLE rehab.import_runs (
 id integer PRIMARY KEY CHECK(id=1),
 completed_at timestamptz NOT NULL DEFAULT now(),
 summary jsonb NOT NULL
);
REVOKE ALL ON ALL TABLES IN SCHEMA rehab FROM PUBLIC;
COMMIT;

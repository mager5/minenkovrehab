BEGIN;
ALTER TABLE rehab.mail_outbox DROP CONSTRAINT mail_outbox_status_check;
ALTER TABLE rehab.mail_outbox ADD CONSTRAINT mail_outbox_status_check CHECK(status IN ('pending','sent','failed'));
ALTER TABLE rehab.auth_mail_outbox DROP CONSTRAINT auth_mail_outbox_status_check;
ALTER TABLE rehab.auth_mail_outbox ADD CONSTRAINT auth_mail_outbox_status_check CHECK(status IN ('pending','sent','failed'));
ALTER TABLE rehab.mail_outbox ADD COLUMN provider_message_id text;
ALTER TABLE rehab.auth_mail_outbox ADD COLUMN provider_message_id text;
ALTER TABLE rehab.course_videos ADD CONSTRAINT course_videos_provider_unique UNIQUE(provider_id);
CREATE TABLE rehab.worker_heartbeat (
 id text PRIMARY KEY,
 last_seen timestamptz NOT NULL
);
REVOKE ALL ON ALL TABLES IN SCHEMA rehab FROM PUBLIC;
COMMIT;

-- Run ONLY by staging migrator in rehab_staging after migrations.
-- LOGIN roles and passwords provisioned separately, never stored in Git.
BEGIN;
DO $$ BEGIN
 IF current_database() NOT IN ('rehab_staging','rehab_stage1_test') THEN
  RAISE EXCEPTION 'isolated_database_required';
 END IF;
END $$;
GRANT USAGE ON SCHEMA rehab TO rehab_payment,rehab_auth,rehab_worker;
GRANT SELECT,INSERT,UPDATE ON rehab.users,rehab.orders TO rehab_payment;
GRANT SELECT,INSERT ON rehab.profiles,rehab.payments,rehab.purchases TO rehab_payment;
GRANT SELECT,INSERT,UPDATE ON rehab.mail_outbox TO rehab_payment;
GRANT SELECT ON rehab.products,rehab.sessions,rehab.course_videos TO rehab_payment;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA rehab TO rehab_payment;
GRANT SELECT,UPDATE ON rehab.users TO rehab_auth;
GRANT SELECT,INSERT,UPDATE ON rehab.credentials,rehab.sessions,rehab.csrf_challenges,rehab.auth_limits,
 rehab.password_resets,rehab.auth_mail_outbox,rehab.email_confirmations,rehab.confirmation_mail_outbox TO rehab_auth;
GRANT SELECT ON rehab.profiles,rehab.products,rehab.purchases TO rehab_auth;
GRANT SELECT,UPDATE ON rehab.mail_outbox,rehab.auth_mail_outbox,rehab.confirmation_mail_outbox TO rehab_worker;
GRANT SELECT ON rehab.password_resets,rehab.email_confirmations TO rehab_worker;
GRANT SELECT,INSERT,UPDATE ON rehab.worker_heartbeat TO rehab_worker;
COMMIT;

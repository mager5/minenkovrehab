-- Operator proposal only; NOT applied to Timeweb. Run as staging database owner.
-- First create rehab_staging and dedicated restricted LOGIN roles in the panel.
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'rehab_staging' THEN RAISE EXCEPTION 'rehab_staging_required'; END IF;
END $$;
REVOKE ALL ON DATABASE rehab_staging FROM PUBLIC;
GRANT CONNECT ON DATABASE rehab_staging TO rehab_migrator,rehab_payment,rehab_auth,rehab_worker;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE rehab_migrator IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC;
COMMIT;

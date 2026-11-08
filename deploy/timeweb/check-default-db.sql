-- Read-only evidence, never evidence that no offline client uses this database.
-- Run only by an authorized operator INSIDE the private network/panel.
BEGIN READ ONLY;
DO $$ BEGIN IF current_database() <> 'default_db' THEN RAISE EXCEPTION 'unexpected_database'; END IF; END $$;
SELECT count(*) AS user_relations
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
AND c.relkind IN ('r','p','v','m','S','f');
SELECT count(*) AS nonextension_user_functions
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e');
SELECT count(*) AS other_client_connections FROM pg_stat_activity
WHERE datname=current_database() AND pid<>pg_backend_pid() AND backend_type='client backend';
SELECT rolcreatedb,rolcreaterole,rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user;
ROLLBACK;

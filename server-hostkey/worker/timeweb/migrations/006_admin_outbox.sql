-- Уведомления владельцу о каждой оплате. Код оплаты не меняется:
-- при постановке письма покупателю (mail_outbox, purchase_access) триггер кладёт копию данных заказа в admin_outbox.
-- Любая ошибка триггера проглатывается, чтобы никогда не сорвать обработку платежа.
CREATE TABLE rehab.admin_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES rehab.orders(id),
  invoice_id bigint NOT NULL,
  product_title text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL,
  buyer_email text NOT NULL,
  mode text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  last_error text,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE FUNCTION rehab.enqueue_admin_payment_notice() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = rehab, pg_temp AS $$
BEGIN
  BEGIN
    INSERT INTO rehab.admin_outbox (order_id, invoice_id, product_title, amount, currency, buyer_email, mode)
    SELECT o.id, o.invoice_id, p.title, o.amount, o.currency, o.buyer_email, o.mode
    FROM rehab.orders o JOIN rehab.products p ON p.id = o.product_id
    WHERE o.id = NEW.order_id
    ON CONFLICT (order_id) DO NOTHING;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION rehab.enqueue_admin_payment_notice() FROM PUBLIC;
CREATE TRIGGER mail_outbox_admin_notice AFTER INSERT ON rehab.mail_outbox
  FOR EACH ROW WHEN (NEW.kind = 'purchase_access') EXECUTE FUNCTION rehab.enqueue_admin_payment_notice();
GRANT SELECT, UPDATE ON rehab.admin_outbox TO rehab_worker;

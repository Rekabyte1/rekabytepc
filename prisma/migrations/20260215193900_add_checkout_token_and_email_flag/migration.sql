ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "checkoutToken" TEXT;

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "confirmationEmailSentAt" TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Order_checkoutToken_key'
  ) THEN
    CREATE UNIQUE INDEX "Order_checkoutToken_key" ON "Order" ("checkoutToken");
  END IF;
END $$;

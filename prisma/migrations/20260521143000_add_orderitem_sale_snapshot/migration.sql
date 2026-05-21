ALTER TABLE "OrderItem"
  ADD COLUMN "unitBasePrice" INTEGER,
  ADD COLUMN "saleWasActive" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "salePercent" INTEGER,
  ADD COLUMN "saleLabel" TEXT,
  ADD COLUMN "saleEndsAt" TIMESTAMPTZ(6);

UPDATE "OrderItem"
SET "unitBasePrice" = "unitPrice"
WHERE "unitBasePrice" IS NULL;

ALTER TABLE "OrderItem"
  ALTER COLUMN "unitBasePrice" SET NOT NULL;
-- Create enums for Setup Gamer classification
CREATE TYPE "SetupTier" AS ENUM ('SPAWN', 'LOADOUT', 'CLUTCH');

CREATE TYPE "SetupCategory" AS ENUM (
  'MOUSE',
  'KEYBOARD',
  'KEYBOARD_MOUSE_COMBO'
);

-- Add optional columns to Product
ALTER TABLE "Product"
  ADD COLUMN "setupTier" "SetupTier",
  ADD COLUMN "setupCategory" "SetupCategory";
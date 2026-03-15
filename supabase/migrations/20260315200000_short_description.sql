-- Add short_description field for meta descriptions and listing cards
ALTER TABLE annuaire_professionals
  ADD COLUMN IF NOT EXISTS short_description VARCHAR(165) DEFAULT '';

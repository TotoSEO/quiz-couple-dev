-- Reduce max photo size from 5MB to 300KB
UPDATE storage.buckets
SET file_size_limit = 307200  -- 300 KB
WHERE id = 'annuaire-photos';

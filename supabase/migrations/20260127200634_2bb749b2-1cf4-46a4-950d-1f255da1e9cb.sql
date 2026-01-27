-- Aumentar o limite de tamanho de arquivo do bucket para 20MB (20971520 bytes)
UPDATE storage.buckets 
SET file_size_limit = 20971520 
WHERE id = 'prompt-images';
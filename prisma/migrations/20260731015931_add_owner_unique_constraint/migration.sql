CREATE UNIQUE INDEX one_owner_only 
ON users ((rol = 'owner')) 
WHERE rol = 'owner';
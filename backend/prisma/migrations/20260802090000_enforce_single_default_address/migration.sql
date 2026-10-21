CREATE UNIQUE INDEX "Address_one_default_per_user_idx"
ON "Address"("userId")
WHERE "isDefault" = true;

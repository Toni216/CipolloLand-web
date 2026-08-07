ALTER TABLE "sugerencias" ADD COLUMN "categoria" VARCHAR(20) NOT NULL DEFAULT 'otro';
CREATE INDEX "idx_sugerencias_categoria" ON "sugerencias"("categoria");
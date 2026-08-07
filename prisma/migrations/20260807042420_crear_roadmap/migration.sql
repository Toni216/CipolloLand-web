CREATE TABLE "roadmap_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "temporada_id" UUID NOT NULL,
  "titulo" VARCHAR(128) NOT NULL,
  "descripcion" TEXT NOT NULL,
  "estado" VARCHAR(20) NOT NULL DEFAULT 'planeado',
  "sugerencia_id" UUID,
  "creado_por" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "roadmap_items_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "roadmap_items"
  ADD CONSTRAINT "roadmap_items_temporada_id_fkey"
  FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE;

ALTER TABLE "roadmap_items"
  ADD CONSTRAINT "roadmap_items_sugerencia_id_fkey"
  FOREIGN KEY ("sugerencia_id") REFERENCES "sugerencias"("id") ON DELETE SET NULL;

ALTER TABLE "roadmap_items"
  ADD CONSTRAINT "roadmap_items_creado_por_fkey"
  FOREIGN KEY ("creado_por") REFERENCES "users"("id") ON DELETE SET NULL;

CREATE INDEX "idx_roadmap_temporada" ON "roadmap_items"("temporada_id", "estado");
-- Tabla principal de sugerencias
CREATE TABLE "sugerencias" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "temporada_id" UUID NOT NULL,
  "user_id" UUID,
  "titulo" VARCHAR(128) NOT NULL,
  "descripcion" TEXT NOT NULL,
  "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  "editado" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "sugerencias_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "sugerencias"
  ADD CONSTRAINT "sugerencias_temporada_id_fkey"
  FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE;

ALTER TABLE "sugerencias"
  ADD CONSTRAINT "sugerencias_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;

CREATE INDEX "idx_sugerencias_temporada" ON "sugerencias"("temporada_id", "created_at" DESC);
CREATE INDEX "idx_sugerencias_estado" ON "sugerencias"("estado");

-- Votos (un voto por usuario por sugerencia)
CREATE TABLE "sugerencia_votos" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sugerencia_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "sugerencia_votos_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "sugerencia_votos"
  ADD CONSTRAINT "sugerencia_votos_sugerencia_id_fkey"
  FOREIGN KEY ("sugerencia_id") REFERENCES "sugerencias"("id") ON DELETE CASCADE;

ALTER TABLE "sugerencia_votos"
  ADD CONSTRAINT "sugerencia_votos_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX "idx_sv_unico" ON "sugerencia_votos"("sugerencia_id", "user_id");

-- Historial de versiones (snapshot antes de cada edición)
CREATE TABLE "sugerencia_versiones" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sugerencia_id" UUID NOT NULL,
  "titulo" VARCHAR(128) NOT NULL,
  "descripcion" TEXT NOT NULL,
  "guardado_en" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "sugerencia_versiones_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "sugerencia_versiones"
  ADD CONSTRAINT "sugerencia_versiones_sugerencia_id_fkey"
  FOREIGN KEY ("sugerencia_id") REFERENCES "sugerencias"("id") ON DELETE CASCADE;

CREATE INDEX "idx_svers_sugerencia" ON "sugerencia_versiones"("sugerencia_id");
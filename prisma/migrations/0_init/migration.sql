-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateTable
CREATE TABLE "access_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "temporada_id" UUID,
    "tipo_solicitud" VARCHAR(12) NOT NULL DEFAULT 'temporada',
    "status" VARCHAR(12) NOT NULL DEFAULT 'pendiente',
    "motivacion" TEXT,
    "how_found" TEXT,
    "recomendado_por" VARCHAR(128),
    "is_adult" BOOLEAN,
    "revisado_por" UUID,
    "revisado_en" TIMESTAMPTZ(6),
    "motivo_rechazo" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slots_permitidos" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(64) NOT NULL,
    "descripcion" TEXT,
    "icono" VARCHAR(500),
    "color" VARCHAR(7),
    "grant_access" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditos_externos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temporada_id" UUID NOT NULL,
    "nombre" VARCHAR(64) NOT NULL,
    "rol" VARCHAR(64) NOT NULL,
    "link" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creditos_externos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditos_temporada" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temporada_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rol" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creditos_temporada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_jugador" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temporada_id" UUID NOT NULL,
    "user_id" UUID,
    "status" VARCHAR(12) NOT NULL DEFAULT 'pendiente',
    "nombre_pj" VARCHAR(64),
    "edad_pj" SMALLINT,
    "pj_who" TEXT,
    "historia_pj" TEXT,
    "faccion_pj" VARCHAR(64),
    "raza_pj" VARCHAR(64),
    "clase_pj" VARCHAR(64),
    "pregunta_random" TEXT,
    "aprobado_por" UUID,
    "aprobado_en" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "es_npc" BOOLEAN NOT NULL DEFAULT false,
    "objetivos" TEXT,
    "reaccion_peligro" TEXT,
    "comida_favorita" VARCHAR(128),
    "apodo_odiado" VARCHAR(128),
    "detalles_publicos" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "perfil_jugador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_server_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temporada_id" UUID NOT NULL,
    "server_ip" VARCHAR(128),
    "server_port" SMALLINT DEFAULT 25565,
    "modpack_url" TEXT,
    "modpack_version" VARCHAR(32),
    "forge_version" VARCHAR(32),
    "mods_count" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_server_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estadisticas_jugador" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "temporada_id" UUID NOT NULL,
    "horas_jugadas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "muertes" INTEGER NOT NULL DEFAULT 0,
    "bloques_colocados" INTEGER NOT NULL DEFAULT 0,
    "bloques_rotos" INTEGER NOT NULL DEFAULT 0,
    "distancia_recorrida_km" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minecraft_username_pendiente" VARCHAR(32),

    CONSTRAINT "estadisticas_jugador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temporadas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "numero" SMALLINT NOT NULL,
    "slug" VARCHAR(16) NOT NULL,
    "nombre" VARCHAR(64) NOT NULL,
    "subtitulo" VARCHAR(128),
    "status" VARCHAR(12) NOT NULL DEFAULT 'proximamente',
    "year" SMALLINT,
    "open_date" TIMESTAMPTZ(6),
    "description" TEXT,
    "requires_character_sheet" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temporadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "badge_id" UUID NOT NULL,
    "granted_by" UUID,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destacada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(32) NOT NULL,
    "email" CITEXT,
    "password_hash" TEXT,
    "rol" VARCHAR(20) NOT NULL DEFAULT 'user',
    "minecraft_username" VARCHAR(100),
    "discord_id" VARCHAR(64),
    "discord_tag" VARCHAR(64),
    "instagram" VARCHAR(64),
    "twitter" VARCHAR(64),
    "bio" VARCHAR(160),
    "discord_username" VARCHAR(50),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anuncios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temporada_id" UUID NOT NULL,
    "titulo" VARCHAR(128) NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "autor_id" UUID,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anuncios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_mods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "temporada_id" UUID NOT NULL,
    "nombre" VARCHAR(128) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(64),
    "icono_url" TEXT,
    "modrinth_id" VARCHAR(64),
    "modrinth_url" TEXT,
    "curseforge_url" TEXT,
    "github_url" TEXT,
    "version" VARCHAR(32),
    "sort_order" INTEGER DEFAULT 0,
    "archivo_jar" VARCHAR(255),
    "origen" VARCHAR(20) NOT NULL DEFAULT 'manual',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_mods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_ar_estado" ON "access_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "idx_ar_pendientes" ON "access_requests"("user_id", "temporada_id") WHERE ((status)::text = 'pendiente'::text);

-- CreateIndex
CREATE UNIQUE INDEX "badges_nombre_key" ON "badges"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "creditos_temporada_temporada_id_user_id_rol_key" ON "creditos_temporada"("temporada_id", "user_id", "rol");

-- CreateIndex
CREATE INDEX "idx_pp_status" ON "perfil_jugador"("status");

-- CreateIndex
CREATE INDEX "idx_pp_temporada" ON "perfil_jugador"("temporada_id");

-- CreateIndex
CREATE INDEX "idx_pp_user" ON "perfil_jugador"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_pp_unico_activo" ON "perfil_jugador"("temporada_id", "user_id") WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "estadisticas_jugador_user_id_temporada_id_key" ON "estadisticas_jugador"("user_id", "temporada_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_stats_pendiente_unico" ON "estadisticas_jugador"("minecraft_username_pendiente", "temporada_id") WHERE (user_id IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "temporadas_numero_key" ON "temporadas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "temporadas_slug_key" ON "temporadas"("slug");

-- CreateIndex
CREATE INDEX "idx_ub_badge" ON "user_badges"("badge_id");

-- CreateIndex
CREATE INDEX "idx_ub_user" ON "user_badges"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "idx_users_email" ON "users"("email") WHERE (email IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "users_minecraft_username_key" ON "users"("minecraft_username");

-- CreateIndex
CREATE UNIQUE INDEX "idx_users_discord_id" ON "users"("discord_id") WHERE (discord_id IS NOT NULL);

-- CreateIndex
CREATE INDEX "idx_users_deleted_at" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_users_minecraft" ON "users"("minecraft_username");

-- CreateIndex
CREATE INDEX "idx_users_rol" ON "users"("rol");

-- CreateIndex
CREATE INDEX "idx_anuncios_temporada" ON "anuncios"("temporada_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_season_mods_temporada" ON "season_mods"("temporada_id", "sort_order");

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "creditos_externos" ADD CONSTRAINT "creditos_externos_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "creditos_temporada" ADD CONSTRAINT "creditos_temporada_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "creditos_temporada" ADD CONSTRAINT "creditos_temporada_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "perfil_jugador" ADD CONSTRAINT "perfil_jugador_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "perfil_jugador" ADD CONSTRAINT "perfil_jugador_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "perfil_jugador" ADD CONSTRAINT "perfil_jugador_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "season_server_configs" ADD CONSTRAINT "season_server_configs_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estadisticas_jugador" ADD CONSTRAINT "estadisticas_jugador_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estadisticas_jugador" ADD CONSTRAINT "estadisticas_jugador_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "season_mods" ADD CONSTRAINT "season_mods_temporada_id_fkey" FOREIGN KEY ("temporada_id") REFERENCES "temporadas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

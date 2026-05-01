-- CreateEnum
CREATE TYPE "MangaStatus" AS ENUM ('PUBLISHING', 'FINISHED', 'CANCELLED', 'HIATUS', 'NOT_YET_RELEASED');

-- CreateEnum
CREATE TYPE "MangaImportJobType" AS ENUM ('TOP_10', 'FULL');

-- CreateEnum
CREATE TYPE "MangaImportJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "manga_references" (
    "id" TEXT NOT NULL,
    "anilist_id" INTEGER NOT NULL,
    "title_romaji" TEXT NOT NULL,
    "title_english" TEXT,
    "title_native" TEXT,
    "description" TEXT,
    "cover_image_url" TEXT,
    "banner_image_url" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MangaStatus" NOT NULL DEFAULT 'PUBLISHING',
    "chapters" INTEGER,
    "volumes" INTEGER,
    "start_year" INTEGER,
    "start_month" INTEGER,
    "start_day" INTEGER,
    "end_year" INTEGER,
    "end_month" INTEGER,
    "end_day" INTEGER,
    "average_score" INTEGER,
    "popularity" INTEGER,
    "favourites" INTEGER,
    "author_name" TEXT,
    "artist_name" TEXT,
    "is_adult" BOOLEAN NOT NULL DEFAULT false,
    "imported_at" TIMESTAMP(3) NOT NULL,
    "updated_from_source_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manga_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manga_import_jobs" (
    "id" TEXT NOT NULL,
    "type" "MangaImportJobType" NOT NULL,
    "status" "MangaImportJobStatus" NOT NULL DEFAULT 'PENDING',
    "triggered_by_id" TEXT NOT NULL,
    "total_pages" INTEGER,
    "current_page" INTEGER NOT NULL DEFAULT 0,
    "total_imported" INTEGER NOT NULL DEFAULT 0,
    "total_updated" INTEGER NOT NULL DEFAULT 0,
    "total_skipped" INTEGER NOT NULL DEFAULT 0,
    "total_errors" INTEGER NOT NULL DEFAULT 0,
    "error_log" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manga_import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manga_references_anilist_id_key" ON "manga_references"("anilist_id");

-- AddForeignKey
ALTER TABLE "manga_import_jobs" ADD CONSTRAINT "manga_import_jobs_triggered_by_id_fkey" FOREIGN KEY ("triggered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

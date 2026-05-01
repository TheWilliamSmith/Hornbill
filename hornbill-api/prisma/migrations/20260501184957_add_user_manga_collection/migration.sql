-- CreateEnum
CREATE TYPE "UserMangaStatus" AS ENUM ('PLAN_TO_READ', 'READING', 'COMPLETED', 'ON_HOLD', 'DROPPED');

-- CreateTable
CREATE TABLE "user_manga_collection" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "manga_reference_id" TEXT NOT NULL,
    "owned_volumes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "read_volumes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "status" "UserMangaStatus" NOT NULL DEFAULT 'PLAN_TO_READ',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_manga_collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_manga_collection_user_id_manga_reference_id_key" ON "user_manga_collection"("user_id", "manga_reference_id");

-- AddForeignKey
ALTER TABLE "user_manga_collection" ADD CONSTRAINT "user_manga_collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_manga_collection" ADD CONSTRAINT "user_manga_collection_manga_reference_id_fkey" FOREIGN KEY ("manga_reference_id") REFERENCES "manga_references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

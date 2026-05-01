-- CreateTable
CREATE TABLE "manga_volumes" (
    "id" TEXT NOT NULL,
    "manga_reference_id" TEXT NOT NULL,
    "volume_number" INTEGER NOT NULL,
    "cover_image_url" TEXT,
    "isbn" TEXT,
    "title" TEXT,
    "release_year" INTEGER,
    "release_month" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manga_volumes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manga_volumes_manga_reference_id_volume_number_key" ON "manga_volumes"("manga_reference_id", "volume_number");

-- AddForeignKey
ALTER TABLE "manga_volumes" ADD CONSTRAINT "manga_volumes_manga_reference_id_fkey" FOREIGN KEY ("manga_reference_id") REFERENCES "manga_references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

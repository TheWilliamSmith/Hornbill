-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AcquisitionMode" AS ENUM ('PURCHASE', 'CUTTING', 'GIFT', 'OTHER');

-- CreateEnum
CREATE TYPE "ArchiveReason" AS ENUM ('DEAD', 'GIVEN_AWAY', 'SOLD', 'OTHER');

-- CreateEnum
CREATE TYPE "PlantLightLevel" AS ENUM ('FULL_SUN', 'INDIRECT', 'PARTIAL_SHADE', 'SHADE');

-- CreateEnum
CREATE TYPE "PlantHumidityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "WindowOrientation" AS ENUM ('NORTH', 'SOUTH', 'EAST', 'WEST');

-- CreateEnum
CREATE TYPE "PlantCareType" AS ENUM ('WATERING', 'FERTILIZING', 'REPOTTING', 'MISTING', 'LEAF_CLEANING', 'ROTATION', 'TREATMENT', 'PRUNING', 'OTHER');

-- CreateEnum
CREATE TYPE "PlantHealthStatus" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "WishlistPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "plant_locations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orientation" "WindowOrientation",
    "light_level" "PlantLightLevel",
    "has_radiator" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "location_id" TEXT,
    "custom_name" TEXT NOT NULL,
    "species_name" TEXT,
    "photo_url" TEXT,
    "acquired_at" TIMESTAMP(3),
    "acquisition_mode" "AcquisitionMode",
    "purchase_price" DOUBLE PRECISION,
    "notes" TEXT,
    "status" "PlantStatus" NOT NULL DEFAULT 'ACTIVE',
    "archive_reason" "ArchiveReason",
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_care_profiles" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "watering_frequency_growth" INTEGER,
    "watering_frequency_rest" INTEGER,
    "light_level" "PlantLightLevel",
    "humidity" "PlantHumidityLevel",
    "min_temperature" DOUBLE PRECISION,
    "max_temperature" DOUBLE PRECISION,
    "fertilizing_frequency" INTEGER,
    "repotting_frequency_months" INTEGER,
    "substrate_type" TEXT,
    "toxic_cats" BOOLEAN NOT NULL DEFAULT false,
    "toxic_dogs" BOOLEAN NOT NULL DEFAULT false,
    "toxic_children" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_care_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_care_reminders" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "care_type" "PlantCareType" NOT NULL,
    "frequency_growth" INTEGER NOT NULL,
    "frequency_rest" INTEGER,
    "next_care_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_care_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_care_logs" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "care_type" "PlantCareType" NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "photo_url" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_care_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_health_logs" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "status" "PlantHealthStatus" NOT NULL,
    "symptoms" TEXT[],
    "note" TEXT,
    "photo_url" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_health_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_growth_logs" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "height_cm" DOUBLE PRECISION,
    "leaf_count" INTEGER,
    "shoot_count" INTEGER,
    "spread_cm" DOUBLE PRECISION,
    "photo_url" TEXT,
    "note" TEXT,
    "measured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_growth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_wishlist" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "species_name" TEXT NOT NULL,
    "note" TEXT,
    "estimated_price" DOUBLE PRECISION,
    "priority" "WishlistPriority" NOT NULL DEFAULT 'MEDIUM',
    "link" TEXT,
    "converted_at" TIMESTAMP(3),
    "converted_plant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plant_care_profiles_plant_id_key" ON "plant_care_profiles"("plant_id");

-- AddForeignKey
ALTER TABLE "plant_locations" ADD CONSTRAINT "plant_locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "plant_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_care_profiles" ADD CONSTRAINT "plant_care_profiles_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_care_reminders" ADD CONSTRAINT "plant_care_reminders_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_care_logs" ADD CONSTRAINT "plant_care_logs_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_health_logs" ADD CONSTRAINT "plant_health_logs_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_growth_logs" ADD CONSTRAINT "plant_growth_logs_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_wishlist" ADD CONSTRAINT "plant_wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

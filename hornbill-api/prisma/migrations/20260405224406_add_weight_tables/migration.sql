-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('KG', 'LBS');

-- CreateEnum
CREATE TYPE "WeightGoalDirection" AS ENUM ('GAIN', 'LOSE', 'MAINTAIN');

-- CreateEnum
CREATE TYPE "WeightGoalMode" AS ENUM ('MILESTONE', 'DEADLINE');

-- CreateEnum
CREATE TYPE "WeightGoalStatus" AS ENUM ('FAILED', 'SUCCESS', 'IN_PROGRESS');

-- CreateTable
CREATE TABLE "weight_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "unit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "measured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_weight" DOUBLE PRECISION NOT NULL,
    "unit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "direction" "WeightGoalDirection" NOT NULL,
    "mode" "WeightGoalMode" NOT NULL,
    "status" "WeightGoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "deadline" TIMESTAMP(3),
    "tolerance_weight" DOUBLE PRECISION,
    "note" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_goals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_goals" ADD CONSTRAINT "weight_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

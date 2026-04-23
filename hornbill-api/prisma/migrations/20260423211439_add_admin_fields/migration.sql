-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deactivated_at" TIMESTAMP(3),
ADD COLUMN     "deactivated_by" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_deactivated_by_fkey" FOREIGN KEY ("deactivated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

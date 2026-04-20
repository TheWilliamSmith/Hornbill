-- CreateEnum
CREATE TYPE "NotifyType" AS ENUM ('PUSH', 'EMAIL');

-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "notify_types" "NotifyType"[] DEFAULT ARRAY[]::"NotifyType"[],
ADD COLUMN     "reminder_days" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "reminder_time" TEXT;

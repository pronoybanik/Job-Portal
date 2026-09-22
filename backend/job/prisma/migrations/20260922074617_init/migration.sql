-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "is_active" "Status" NOT NULL DEFAULT 'ACTIVE';

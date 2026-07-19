/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_skills" DROP CONSTRAINT "user_skills_user_id_fkey";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "auths" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "bio" TEXT,
    "resume" TEXT,
    "resume_public_id" TEXT,
    "profile_pic" TEXT,
    "profile_pic_public_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscription" TIMESTAMP(3),

    CONSTRAINT "auths_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auths_email_key" ON "auths"("email");

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auths"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_skills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_skills" DROP CONSTRAINT "user_skills_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "user_skills" DROP CONSTRAINT "user_skills_user_id_fkey";

-- DropTable
DROP TABLE "skills";

-- DropTable
DROP TABLE "user_skills";

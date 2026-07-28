-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('JOB_SEEKER', 'RECRUITER', 'ADMIN');

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

-- CreateTable
CREATE TABLE "skills" (
    "skill_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skill_id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "user_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("user_id","skill_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auths_email_key" ON "auths"("email");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auths"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("skill_id") ON DELETE CASCADE ON UPDATE CASCADE;

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const envResult = dotenv.config();
if (envResult.parsed?.DB_URI) {
  process.env.DB_URI = envResult.parsed.DB_URI;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DB_URI,
    },
  },
});

export default prisma;

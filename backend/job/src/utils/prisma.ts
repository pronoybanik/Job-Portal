// import "dotenv/config";
// import { PrismaClient } from "@prisma/client";
// import { PrismaNeon } from "@prisma/adapter-neon";

// const connectionString = process.env.DB_URI;

// if (!connectionString) {
// 	throw new Error("DB_URI is not configured");
// }

// const adapter = new PrismaNeon({ connectionString });
// const prisma = new PrismaClient({ adapter });

// export default prisma;

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
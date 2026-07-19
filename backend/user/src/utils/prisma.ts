// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default prisma;

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.DB_URI as string,
		},
	},
});

export default prisma;

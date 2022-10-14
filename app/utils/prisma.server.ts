import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient<Prisma.PrismaClientOptions, "query">;

declare global {
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      log: [
        {
          emit: "event",
          level: "query",
        },
      ],
    });
    global.__db.$connect();
  }
  prisma = global.__db;
}

// prisma.$on("query", (e) => {
//   console.log("Query: ", e.query);
//   console.log("Bindings: ", e.params);
// });

export { prisma };

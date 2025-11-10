require("dotenv").config({ debug: false });
const app = require("./app");
const phoneDataScheduler = require("./services/phoneDataScheduler");
const { PrismaClient } = require("./generated/prisma");
const PORT = process.env.PORT || 3001;

const prisma = new PrismaClient();


async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.error("Please check your DATABASE_URL in .env file");
    process.exit(1);
  }
}


async function startServer() {
  try {
    await testDatabaseConnection();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });


    const shutdown = async () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        console.log("HTTP server closed");
      });
      await phoneDataScheduler.shutdown();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

require("dotenv").config();
const app = require("./app");
const phoneDataScheduler = require("./services/phoneDataScheduler");
const PORT = process.env.PORT || 3001;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 Phone data scheduler is running with automated updates`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("📴 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("🛑 HTTP server closed");
  });
  await phoneDataScheduler.shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("📴 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("🛑 HTTP server closed");
  });
  await phoneDataScheduler.shutdown();
  process.exit(0);
});

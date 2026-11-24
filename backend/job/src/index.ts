
import app from "./app.js";
import dotenv from "dotenv";
import { connectKafka, disconnectKafka } from "./producer.js";
import { startMailConsumer, stopMailConsumer } from "./consumer.js";

dotenv.config();

const server = app.listen(process.env.PORT || 5002, () => {
  console.log("Job service is running on port " + (process.env.PORT || 5003));
});

Promise.all([connectKafka(), startMailConsumer()]).catch(() => {
  console.warn("Job service started without Kafka mail messaging");
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down job service...`);
  server.close(async () => {
    await stopMailConsumer();
    await disconnectKafka();
    process.exit(0);
  });
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

import { createClient } from "redis";

const redisURL = "redis://:password@localhost:6379";

const client = createClient({ url: redisURL });

client.on("connect", () => console.info("Cache is connecting"));
client.on("ready", () => console.info("Cache is ready"));
client.on("end", () => console.info("Cache disconnected"));
client.on("reconnecting", () => console.info("Cache is reconnecting"));
client.on("error", (e) => console.error(e));

async function connect() {
  try {
    await client.connect();
  } catch (error) {
    console.log("Redis connection failed, retrying in 5 seconds");
    setTimeout(() => {
      connect;
    }, 5000);
  }
}

connect();

process.on("SIGINT", async () => {
  await client.disconnect();
});

export default client;

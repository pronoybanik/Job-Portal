import "dotenv/config";
import { Kafka, Producer } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "localhost:9092")
  .split(",")
  .map((broker) => broker.trim())
  .filter(Boolean);

const topic = process.env.KAFKA_JOB_TOPIC || "job-events";

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "job-service",
  brokers,
  connectionTimeout: 3_000,
  requestTimeout: 5_000,
  retry: { retries: 2 },
});

const producer: Producer = kafka.producer();
let isConnected = false;
let connectionAttempt: Promise<void> | undefined;

export const connectKafka = async (): Promise<void> => {
  if (isConnected) return;
  if (connectionAttempt) return connectionAttempt;

  connectionAttempt = producer
    .connect()
    .then(() => {
      isConnected = true;
      console.log(`Kafka producer connected to ${brokers.join(", ")}`);
    })
    .catch((error: unknown) => {
      console.error("Kafka producer connection failed", error);
      throw error;
    })
    .finally(() => {
      connectionAttempt = undefined;
    });

  return connectionAttempt;
};

export const publishJobEvent = async (
  event: string,
  data: Record<string, unknown>,
): Promise<void> => {
  try {
    await connectKafka();
    await producer.send({
      topic,
      messages: [
        {
          key: String(data.job_id || data.application_id || event),
          value: JSON.stringify({
            event,
            occurred_at: new Date().toISOString(),
            data,
          }),
        },
      ],
    });
  } catch (error: unknown) {
    // Kafka must not turn a successful database write into a failed API request.
    console.error(`Unable to publish Kafka event: ${event}`, error);
  }
};

export const disconnectKafka = async (): Promise<void> => {
  if (!isConnected) return;
  await producer.disconnect();
  isConnected = false;
};

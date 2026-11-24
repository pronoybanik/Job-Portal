import "dotenv/config";
import { Kafka, Partitioners, Producer } from "kafkajs";

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

const producer: Producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});
let isConnected = false;
let connectionAttempt: Promise<void> | undefined;

export const connectKafka = async (): Promise<void> => {
  if (isConnected) return;
  if (connectionAttempt) return connectionAttempt;

  connectionAttempt = producer
    .connect()
    .then(async () => {
      const admin = kafka.admin();
      await admin.connect();
      await admin.createTopics({
        topics: [
          { topic, numPartitions: 1, replicationFactor: 1 },
          {
            topic: process.env.KAFKA_MAIL_TOPIC || "send-mail",
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      await admin.disconnect();
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

export const publishToTopic = async (
  topicName: string,
  data: Record<string, unknown>,
): Promise<void> => {
  try {
    await connectKafka();
    await producer.send({
      topic: topicName,
      messages: [
        {
          key: String(data.application_id || data.to || topicName),
          value: JSON.stringify(data),
        },
      ],
    });
  } catch (error: unknown) {
    console.error(`Failed to publish Kafka message to ${topicName}`, error);
  }
};

export const disconnectKafka = async (): Promise<void> => {
  if (!isConnected) return;
  await producer.disconnect();
  isConnected = false;
};

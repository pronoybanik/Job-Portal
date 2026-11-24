import "dotenv/config";
import { Consumer, Kafka } from "kafkajs";
import nodemailer from "nodemailer";

const brokers = (process.env.KAFKA_BROKERS || "localhost:9092")
  .split(",")
  .map((broker) => broker.trim())
  .filter(Boolean);

const kafka = new Kafka({
  clientId: `${process.env.KAFKA_CLIENT_ID || "job-service"}-mail-consumer`,
  brokers,
});

const consumer: Consumer = kafka.consumer({
  groupId: process.env.KAFKA_MAIL_GROUP_ID || "job-portal-mail-service",
});

type MailMessage = {
  to: string;
  subject: string;
  html: string;
};

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured to send mail",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
};

export const startMailConsumer = async (): Promise<void> => {
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_MAIL_TOPIC || "send-mail",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const mail = JSON.parse(message.value.toString()) as MailMessage;
      await getTransporter().sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
      });
      console.log(`Application status email sent to ${mail.to}`);
    },
  });
};

export const stopMailConsumer = async (): Promise<void> => {
  await consumer.disconnect();
};

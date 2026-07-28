FROM node:22-bookworm-slim

WORKDIR /app

ENV DB_URI="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 5002

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]

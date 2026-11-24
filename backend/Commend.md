

## Project Setup & Running Guide

Follow these steps in order to run the project successfully:

1. **Start Docker:** Make sure Docker Desktop is running.
2. **Start Docker Containers:** Run Redis and Kafka:
   ```bash
   docker compose up -d redis kafka
   ```
3. **Start the API Gateway:** Navigate to the Gateway Server directory and run:
   ```bash
   npm run dev
   ```
4. **Start the Microservices:** Navigate to each service directory one by one and run:
   ```bash
   npm run dev
   ```
5. **Verify Services:** Ensure all services are running successfully and connected to Redis, Kafka, and the API Gateway.

**Important:** Follow this startup order: Docker → Redis & Kafka → API Gateway → Individual Microservices.

<!-- docker commend -->
docker compose up -d kafka

docker compose stop kafka

docker compose up -d redis

docker compose stop redis

docker compose up -d kafka redis

docker compose stop kafka redis

docker compose up -d --build

docker compose down

docker compose ps

Auth:  http://localhost:5021
Utils: http://localhost:5022
User:  http://localhost:5023
Job:   http://localhost:5024
Kafka: localhost:9092
Redis: localhost:6379



<!-- Prisma Commends -->
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate

<!--run redis in docker cmd -->
docker run -d --name redis -p 6379:6379 

docker compose up -d kafka

<!-- logs -->

<!-- http://localhost:5000/api/auth/logs?token=eyJhbGciOiwerwr34243 -->

<!-- http://localhost:5000/api/auth/logs/data?token=eyJhbGciOiwerwr34243 -->

<!-- rate limite flow inmplemt in future -->
1.
User
   │
   ▼
Load Balancer
   │
   ▼
Express API
   │
   ▼
Rate Limiter
   │
   ▼
Redis
   │
   ▼
Database

If Redis says the user exceeded the limit:

2.
Redis
   │
Exceeded
   │
   ▼
429 Too Many Requests

The request never reaches the database, saving resources.

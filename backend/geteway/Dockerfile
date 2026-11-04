FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY app.ts ./
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/app.js"]

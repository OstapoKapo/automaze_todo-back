# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Копіюємо лише файли залежностей для кешування
COPY package*.json ./

# Встановлюємо всі залежності (dev + prod)
RUN npm install

# Копіюємо решту коду
COPY . .

# Білдимо проєкт
RUN npm run build


# 2. Production stage
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Копіюємо dist + prisma схему
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/prisma ./prisma

EXPOSE 3000

# Запускаємо міграції
CMD npx prisma migrate deploy --schema ./prisma/schema.prisma && node dist/main.js

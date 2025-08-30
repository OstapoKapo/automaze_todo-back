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

# Копіюємо package.json + package-lock.json
COPY package*.json ./

# Встановлюємо тільки продакшн-залежності
RUN npm install --omit=dev

# Копіюємо з builder зібрані файли та prisma схему
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Запускаємо міграції та сервер
CMD npx prisma migrate deploy --schema ./prisma/schema.prisma && node dist/main.js

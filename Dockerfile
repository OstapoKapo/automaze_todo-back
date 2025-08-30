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

# Копіюємо лише файли залежностей
COPY package*.json ./

# Встановлюємо тільки продакшн-залежності
RUN npm install --omit=dev

# Копіюємо з builder тільки зібрані файли
COPY --from=builder /app/dist ./dist

# Вказуємо порт (NestJS за замовчуванням 3000)
EXPOSE 3000

# Запускаємо додаток
CMD ["node", "dist/main"]

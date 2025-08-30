# 1. Використовуємо Node.js образ
FROM node:18-alpine

# 2. Встановлюємо робочу директорію
WORKDIR /app

# 3. Копіюємо package.json і встановлюємо залежності
COPY package*.json ./
RUN npm install --omit=dev

# 4. Копіюємо код і білдимо
COPY . .
RUN npm run build

# 5. Старт
CMD ["node", "dist/main.js"]

FROM node:20-alpine AS builder

WORKDIR /app

# 安裝全球相依項 (Turbo)
RUN npm install -g turbo

# 複製根目錄配置與後端專案
COPY package*.json ./
COPY turbo.json ./
COPY packages/backend/package*.json ./packages/backend/

# 安裝相依項
RUN npm install

# 複製其餘源碼並編譯
COPY . .
RUN turbo run build --filter=backend

# 運行環境
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package*.json ./packages/backend/

ENV NODE_ENV=production
EXPOSE 6970

# 使用編譯後的路徑啟動後端
CMD ["node", "packages/backend/dist/main.js"]

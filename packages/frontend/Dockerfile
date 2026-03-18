# 第一階段：編譯階段
FROM node:20-alpine AS builder

WORKDIR /app

# 安裝 Turbo 並複製根目錄配置
RUN npm install -g turbo
COPY package*.json ./
COPY turbo.json ./
COPY packages/frontend/package*.json ./packages/frontend/

# 安裝相依項
RUN npm install

# 複製其餘源碼並編譯前端專案
COPY . .
RUN turbo run build --filter=frontend

# 第二階段：伺服階段 (使用 Nginx)
FROM nginx:stable-alpine

# 將編譯好的靜態檔案複製到 Nginx 的根目錄
# 基於 Vite 的預設輸出目錄為 dist
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# 複製 Nginx 配置 (若有特殊需求可以自定義，這裡使用預設配置)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

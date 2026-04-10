FROM node:20-alpine

WORKDIR /app

# Copy package manifests first to install dependencies before source
COPY package.json package-lock.json* ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

RUN npm install

COPY backend ./backend
COPY frontend ./frontend

RUN npm --workspace frontend install && npm --workspace frontend run build

EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]

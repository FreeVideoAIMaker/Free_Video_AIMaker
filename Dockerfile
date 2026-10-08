# Production Dockerfile for FreeVideoAIMaker on Render or any Cloud Container Host
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json tsconfig*.json vite.config.ts ./

# Install all dependencies for build
RUN npm ci || npm install

# Copy source code and public assets
COPY . .

# Build Vite client production bundle
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --production

# Install tsx globally or locally to run TypeScript server
RUN npm install tsx

# Copy built frontend assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 10000

CMD ["npx", "tsx", "server.ts"]

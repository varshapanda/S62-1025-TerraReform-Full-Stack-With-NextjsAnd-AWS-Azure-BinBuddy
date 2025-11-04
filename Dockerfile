# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app

# copy lockfiles first for caching
COPY package*.json ./
RUN npm ci

# copy rest and build
COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm pkg delete scripts.prepare
RUN npm ci --production

# optional, non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["npm", "run", "start"]

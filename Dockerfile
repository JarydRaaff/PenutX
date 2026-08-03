# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev=false

# --- build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 999 docker 2>/dev/null || true
RUN addgroup -S penutx && adduser -S penutx -G penutx -G docker

COPY --from=builder /app/public ./public
COPY --from=builder --chown=penutx:penutx /app/.next/standalone ./
COPY --from=builder --chown=penutx:penutx /app/.next/static ./.next/static

USER penutx
EXPOSE 3000
CMD ["node", "server.js"]

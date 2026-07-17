# EduCerts frontend - Next.js
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install dependencies (uses package-lock.json)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# NEXT_PUBLIC_* vars are baked in at build time. This must be the URL the
# BROWSER uses to reach the backend (i.e. the host-exposed backend port).
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ---- Runtime image ----
FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy the built app and only what's needed to run `next start`
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "start"]

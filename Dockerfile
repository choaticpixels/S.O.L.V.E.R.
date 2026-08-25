# Stage 1: Build the static assets
FROM node:lts-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:alpine
COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 3000
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]

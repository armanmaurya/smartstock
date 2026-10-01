# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

WORKDIR /app

# Cache package dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and compile
COPY . .
RUN npm run build

# Stage 2: Production runtime with Node.js SSR
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled application bundles from builder
COPY --from=builder /app/dist/frontend ./dist/frontend

# Expose application port
EXPOSE 4000

# Start SSR Express server
CMD ["node", "dist/frontend/server/server.mjs"]

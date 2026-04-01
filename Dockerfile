# Stage 1: Build the application
FROM node:22-alpine AS builder

# Install system dependencies for Prisma binary downloads
RUN apk add --no-cache ca-certificates openssl

WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install build dependencies and Prisma client
RUN npm install
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine

# Install system dependencies in production too
RUN apk add --no-cache ca-certificates openssl

WORKDIR /usr/src/app

# Copy only production dependencies and built code
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --only=production

# Copy generated Prisma Client and binary engines from builder
# This avoids a second download attempt in the production image stage
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY --from=builder /usr/src/app/dist ./dist

# Expose port (default NestJS port)
EXPOSE 3000

# Start the application via script
COPY docker-start.sh ./
RUN chmod +x docker-start.sh

CMD ["./docker-start.sh"]

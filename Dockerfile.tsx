# Production Dockerfile using tsx to run TypeScript directly
# NOTE: Run `npm run build` locally before building this image (for frontend)

FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for tsx)
RUN npm install --legacy-peer-deps --no-audit --no-fund && \
    npm cache clean --force

# Copy pre-built frontend (dist/)
COPY dist ./dist

# Copy backend TypeScript source (we'll run with tsx)
COPY server ./server

# Copy TypeScript config
COPY tsconfig.json tsconfig.server.json ./

# Copy public assets
COPY public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 1500 1600

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${BACKEND_PORT:-1600}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start the backend using tsx (runs TypeScript directly)
CMD ["node", "--loader", "tsx", "server/index.ts"]

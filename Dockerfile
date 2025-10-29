# Production Dockerfile - uses pre-installed node_modules
# Run these commands BEFORE building:
# 1. npm run build (frontend)
# 2. npm run build:backend (backend)
# 3. Make sure node_modules exists locally

FROM node:20-slim
WORKDIR /app

# Copy everything (node_modules will come from host)
COPY package.json package-lock.json ./
COPY node_modules ./node_modules
COPY dist ./dist
COPY server ./server
COPY public ./public

# Remove "type": "module" from package.json for CommonJS backend
RUN sed -i '/"type": "module"/d' package.json

# Create non-root user
RUN groupadd -g 1001 nodejs && useradd -r -u 1001 -g nodejs nodejs && chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 1500 1600

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${BACKEND_PORT:-1600}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start backend
CMD ["node", "server/index.js"]

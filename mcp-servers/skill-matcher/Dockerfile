# Skill Matcher MCP Server
# Multi-stage build for smaller production image

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/
COPY schemas/ ./schemas/

# Build
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/schemas ./schemas

# Copy skills data (mount or bake in)
# For hosted version, you may want to bake skills into the image:
# COPY .claude/skills ./skills
# COPY .claude/agents ./agents

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

# Run HTTP server
CMD ["node", "dist/http-server.js"]

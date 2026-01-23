#!/bin/bash
#
# One-command installer for Prompt Learning MCP Server
#
# Usage:
#   curl -fsSL https://someclaudeskills.com/install/prompt-learning.sh | bash
#   # or
#   ./install.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🧠 Prompt Learning MCP Server - Installer                  ║"
echo "║     Stateful prompt optimization that learns over time        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    echo "  Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version too low. Found: $(node -v), need: 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker${NC}"
    echo "  Visit: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

# OpenAI API Key
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠ OPENAI_API_KEY not set${NC}"
    echo -n "Enter your OpenAI API key (or press Enter to skip): "
    read -r OPENAI_API_KEY
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}✗ OpenAI API key required for embeddings${NC}"
        exit 1
    fi
    export OPENAI_API_KEY
fi
echo -e "${GREEN}✓ OPENAI_API_KEY set${NC}"

# Install directory
INSTALL_DIR="${HOME}/mcp-servers/prompt-learning"

echo ""
echo -e "${YELLOW}Installing to: ${INSTALL_DIR}${NC}"

# Clone or update
if [ -d "$INSTALL_DIR" ]; then
    echo "Directory exists, updating..."
    cd "$INSTALL_DIR"
    git pull 2>/dev/null || true
else
    echo "Creating installation directory..."
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Check if we're installing from source or downloading
if [ -f "package.json" ]; then
    echo "Installing from local source..."
else
    echo "Downloading from npm..."
    npm init -y > /dev/null 2>&1
    npm install @anthropic-skills/prompt-learning-mcp@latest
fi

# Install dependencies
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build
echo ""
echo -e "${YELLOW}Building...${NC}"
npm run build

# Start Docker containers
echo ""
echo -e "${YELLOW}Starting Docker containers...${NC}"

# Qdrant
if docker ps --format '{{.Names}}' | grep -q 'prompt-learning-qdrant'; then
    echo -e "${GREEN}✓ Qdrant already running${NC}"
else
    echo "Starting Qdrant..."
    docker rm -f prompt-learning-qdrant 2>/dev/null || true
    docker run -d \
        --name prompt-learning-qdrant \
        -p 6333:6333 \
        -v prompt_learning_qdrant:/qdrant/storage \
        qdrant/qdrant
    echo -e "${GREEN}✓ Qdrant started${NC}"
fi

# Redis
if docker ps --format '{{.Names}}' | grep -q 'prompt-learning-redis'; then
    echo -e "${GREEN}✓ Redis already running${NC}"
else
    echo "Starting Redis..."
    docker rm -f prompt-learning-redis 2>/dev/null || true
    docker run -d \
        --name prompt-learning-redis \
        -p 6379:6379 \
        -v prompt_learning_redis:/data \
        redis:alpine redis-server --appendonly yes
    echo -e "${GREEN}✓ Redis started${NC}"
fi

# Wait for services
echo "Waiting for services..."
sleep 3

# Initialize vector DB
echo ""
echo -e "${YELLOW}Initializing vector database...${NC}"
npm run setup -- --skip-docker --skip-claude 2>/dev/null || npx tsx src/setup.ts --skip-docker --skip-claude

# Configure Claude Code
echo ""
echo -e "${YELLOW}Configuring Claude Code...${NC}"

CLAUDE_CONFIG="${HOME}/.claude.json"
SERVER_PATH="${INSTALL_DIR}/dist/index.js"

# Create or update config
if [ -f "$CLAUDE_CONFIG" ]; then
    # Backup existing
    cp "$CLAUDE_CONFIG" "${CLAUDE_CONFIG}.backup"
fi

# Use Node to safely update JSON
node -e "
const fs = require('fs');
const path = '${CLAUDE_CONFIG}';
const serverPath = '${SERVER_PATH}';
const openaiKey = process.env.OPENAI_API_KEY;

let config = {};
try {
    if (fs.existsSync(path)) {
        config = JSON.parse(fs.readFileSync(path, 'utf-8'));
    }
} catch (e) {}

if (!config.mcpServers) config.mcpServers = {};

config.mcpServers['prompt-learning'] = {
    command: 'node',
    args: [serverPath],
    env: {
        VECTOR_DB_URL: 'http://localhost:6333',
        REDIS_URL: 'redis://localhost:6379',
        OPENAI_API_KEY: openaiKey
    }
};

fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log('✓ Configuration updated');
"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Installation Complete!                     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Code to load the new MCP server"
echo "  2. Test with: \"optimize this prompt: summarize the document\""
echo ""
echo "Useful commands:"
echo "  • View logs:    docker logs prompt-learning-qdrant"
echo "  • Stop:         docker stop prompt-learning-qdrant prompt-learning-redis"
echo "  • Uninstall:    docker rm -f prompt-learning-qdrant prompt-learning-redis"
echo ""
echo -e "Documentation: ${BLUE}https://www.someclaudeskills.com/skills/automatic-stateful-prompt-improver${NC}"
echo ""

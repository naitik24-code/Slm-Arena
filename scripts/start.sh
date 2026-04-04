#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Ollama is running
echo -e "${CYAN}Checking if Ollama is running...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:11434/api/tags")

if [ "$RESPONSE" -ne 200 ]; then
    echo -e "${RED}[ERROR] Ollama is NOT running!${NC}"
    echo -e "${YELLOW}Please start Ollama from your system tray or run 'ollama serve' and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Ollama is running.${NC}"

# Check if Docker is running
echo -e "${CYAN}Checking if Docker is running...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}[ERROR] Docker is NOT running!${NC}"
    echo -e "${YELLOW}Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Docker is running.${NC}"

# Start the application
echo -e "${GREEN}Starting SLM Arena with Docker Compose...${NC}"
docker compose up --build

# Trap Ctrl+C and run docker compose down
trap 'docker compose down; exit' INT

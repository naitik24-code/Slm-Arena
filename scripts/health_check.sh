#!/bin/bash

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

MODELS=("mistral" "phi3" "llama3")
OLLAMA_URL="http://localhost:11434/api/tags"

# 1. 2. Check if Ollama is running at the API endpoint
RESPONSE=$(curl -sSf $OLLAMA_URL 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Ollama is not running! Please start Ollama from the system tray.${NC}"
    exit 1
fi

echo -e "${GREEN}Ollama is running.${NC}"

SUCCESS=true

# 3. 4. 5. Loop through models, check if pulled, and pull if missing
for MODEL in "${MODELS[@]}"; do
    if echo "$RESPONSE" | grep -E -q "\"name\":\"$MODEL(:|\")"; then
        echo -e "${GREEN}Model '$MODEL' is already pulled.${NC}"
    else
        echo -e "${YELLOW}Model '$MODEL' not found. Pulling...${NC}"
        if ollama pull "$MODEL"; then
            echo -e "${GREEN}Model '$MODEL' pulled successfully.${NC}"
        else
            echo -e "${RED}Error pulling '$MODEL'.${NC}"
            SUCCESS=false
        fi
    fi
done

# 6. Exit with 0 on success, 1 on failure
if [ "$SUCCESS" = true ]; then
    exit 0
else
    exit 1
fi

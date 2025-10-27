#!/bin/bash

# Script to install dependencies in all web example directories

set -e  # Exit on error

echo "🚀 Installing dependencies for all web examples..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter for success/failure
SUCCESS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

# Find all directories with package.json under web/, excluding node_modules
find web -name "package.json" -type f -not -path "*/node_modules/*" | while read -r package_file; do
    dir=$(dirname "$package_file")
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    echo -e "${BLUE}📦 Installing in: $dir${NC}"
    
    if (cd "$dir" && npm install --loglevel=error); then
        echo -e "${GREEN}✅ Success: $dir${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo ""
    else
        echo -e "${RED}❌ Failed: $dir${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo ""
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Installation complete!${NC}"
echo "Total directories: $TOTAL_COUNT"
echo -e "${GREEN}Successful: $SUCCESS_COUNT${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Failed: $FAIL_COUNT${NC}"
fi


#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔍 TypeChecking All Web Examples${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Initialize counters
TOTAL=0
PASSED=0
FAILED=0
FAILED_PROJECTS=()

# Find all directories with tsconfig.json in the web directory
while IFS= read -r -d '' tsconfig_path; do
    # Get the directory containing tsconfig.json
    dir=$(dirname "$tsconfig_path")
    
    # Skip node_modules directories
    if [[ "$dir" == *"node_modules"* ]]; then
        continue
    fi
    
    # Get a nice relative path for display
    relative_path=$(echo "$dir" | sed "s|$(pwd)/||")
    
    TOTAL=$((TOTAL + 1))
    
    echo -e "${YELLOW}📦 Checking: ${NC}$relative_path"
    
    # Run TypeScript compiler in noEmit mode
    cd "$dir" || continue
    
    if npx tsc --noEmit 2>&1 | tee /tmp/tsc_output_$$.txt | grep -q "error TS"; then
        echo -e "${RED}❌ FAILED${NC}\n"
        FAILED=$((FAILED + 1))
        FAILED_PROJECTS+=("$relative_path")
        
        # Show the errors
        cat /tmp/tsc_output_$$.txt
        echo ""
    else
        echo -e "${GREEN}✅ PASSED${NC}\n"
        PASSED=$((PASSED + 1))
    fi
    
    # Clean up temp file
    rm -f /tmp/tsc_output_$$.txt
    
    # Return to original directory
    cd - > /dev/null || exit
    
done < <(find web -name "tsconfig.json" -type f -print0)

# Print summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 TypeCheck Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total projects checked: ${BLUE}$TOTAL${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -gt 0 ]; then
    echo -e "\n${RED}Failed projects:${NC}"
    for project in "${FAILED_PROJECTS[@]}"; do
        echo -e "  ${RED}•${NC} $project"
    done
    echo -e "\n${RED}❌ TypeCheck failed with errors${NC}"
    exit 1
else
    echo -e "\n${GREEN}🎉 All projects passed TypeCheck!${NC}"
    exit 0
fi


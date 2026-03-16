#!/bin/bash
set -e

echo "🧪 Running MADE Laboratory Test Suite"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Setup test database
echo -e "\n${BLUE}📦 Setting up test database...${NC}"
export DATABASE_URL="file:./test.db"
npx prisma migrate deploy
node scripts/seed-test-data.ts

# Run unit tests
echo -e "\n${BLUE}🔬 Running unit tests...${NC}"
if yarn test:unit; then
  echo -e "${GREEN}✅ Unit tests passed${NC}"
else
  echo -e "${RED}❌ Unit tests failed${NC}"
  exit 1
fi

# Run integration tests
echo -e "\n${BLUE}🔗 Running integration tests...${NC}"
if yarn test:integration; then
  echo -e "${GREEN}✅ Integration tests passed${NC}"
else
  echo -e "${RED}❌ Integration tests failed${NC}"
  exit 1
fi

# Run API tests
echo -e "\n${BLUE}🌐 Running API tests...${NC}"
if yarn test:api; then
  echo -e "${GREEN}✅ API tests passed${NC}"
else
  echo -e "${RED}❌ API tests failed${NC}"
  exit 1
fi

# Run E2E tests
echo -e "\n${BLUE}🎭 Running E2E tests...${NC}"
if yarn test:e2e; then
  echo -e "${GREEN}✅ E2E tests passed${NC}"
else
  echo -e "${RED}❌ E2E tests failed${NC}"
  exit 1
fi

# Generate coverage report
echo -e "\n${BLUE}📊 Generating coverage report...${NC}"
yarn test:coverage

echo -e "\n${GREEN}✅ All tests passed!${NC}"
echo "Coverage report: ./coverage/index.html"

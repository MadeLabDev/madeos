#!/usr/bin/env bash

# RAG System Debug Script (Vietnamese)
# Kiểm tra tất cả cấu hình RAG

echo "🔍 RAG System - Debugging Tool"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1️⃣  Kiểm tra Environment Variables..."
echo ""

if [ -z "$EMBEDDING_PROVIDER" ]; then
    echo -e "${RED}❌ EMBEDDING_PROVIDER không được đặt${NC}"
    echo "   Hãy thêm vào .env.local:"
    echo "   EMBEDDING_PROVIDER=openai (hoặc local)"
else
    echo -e "${GREEN}✅ EMBEDDING_PROVIDER=$EMBEDDING_PROVIDER${NC}"
fi

if [ "$EMBEDDING_PROVIDER" = "openai" ] || [ "$EMBEDDING_PROVIDER" = "gemini" ] || [ "$EMBEDDING_PROVIDER" = "cohere" ]; then
    if [ -z "$OPENAI_API_KEY" ] && [ -z "$GOOGLE_GENERATIVE_AI_API_KEY" ] && [ -z "$COHERE_API_KEY" ]; then
        echo -e "${RED}❌ API Key không được đặt${NC}"
        echo "   Hãy thêm:"
        echo "   - OPENAI_API_KEY=sk-... (nếu dùng openai)"
        echo "   - GOOGLE_GENERATIVE_AI_API_KEY=... (nếu dùng gemini)"
        echo "   - COHERE_API_KEY=... (nếu dùng cohere)"
    else
        echo -e "${GREEN}✅ API Key được đặt${NC}"
    fi
fi

echo ""
echo "2️⃣  Kiểm tra Database Connection..."
echo ""

# Try to connect to database
if command -v sqlite3 &> /dev/null || grep -q "DATABASE_URL.*sqlite" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ SQLite Database${NC}"
elif grep -q "DATABASE_URL" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ Database URL được đặt${NC}"
else
    echo -e "${RED}❌ DATABASE_URL không tìm thấy${NC}"
fi

echo ""
echo "3️⃣  Kiểm tra Prisma Schema..."
echo ""

if grep -q "KnowledgeVector" prisma/schema.prisma; then
    echo -e "${GREEN}✅ KnowledgeVector model tồn tại${NC}"
else
    echo -e "${RED}❌ KnowledgeVector model không tìm thấy${NC}"
fi

if grep -q "sourceModule" prisma/schema.prisma; then
    echo -e "${GREEN}✅ sourceModule field tồn tại${NC}"
else
    echo -e "${RED}❌ sourceModule field không tìm thấy${NC}"
fi

echo ""
echo "4️⃣  Kiểm tra Vector Search Files..."
echo ""

files=(
    "lib/features/vector-search/services/embedding-service.ts"
    "lib/features/vector-search/services/vector-search-service.ts"
    "lib/features/vector-search/services/rag-service.ts"
    "lib/features/vector-search/services/indexing-service.ts"
    "lib/features/vector-search/actions/index-actions.ts"
    "lib/features/vector-search/actions/search-actions.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file - NOT FOUND${NC}"
    fi
done

echo ""
echo "5️⃣  Kiểm tra TypeScript Compilation..."
echo ""

if npx tsc --noEmit 2>&1 | grep -q "error"; then
    error_count=$(npx tsc --noEmit 2>&1 | grep -c "error")
    echo -e "${RED}❌ $error_count TypeScript errors${NC}"
    npx tsc --noEmit 2>&1 | grep "error" | head -5
else
    echo -e "${GREEN}✅ TypeScript compilation OK${NC}"
fi

echo ""
echo "6️⃣  Kiểm tra RAG Feature Flag..."
echo ""

echo "Run in prisma studio:"
echo "  yarn db:studio"
echo "  → Settings table → rag_enabled = ?"
echo ""

echo "Or check with SQL:"
echo "  npx prisma db execute --stdin"
echo '  SELECT rag_enabled FROM Settings LIMIT 1;'

echo ""
echo "================================"
echo ""
echo "📝 Tiếp theo:"
echo "1. Đảm bảo EMBEDDING_PROVIDER được đặt"
echo "2. Đảm bảo API Key được đặt (nếu không dùng local)"
echo "3. Kiểm tra rag_enabled = true trong database"
echo "4. Chạy: yarn dev"
echo "5. Tạo Knowledge Base mới"
echo "6. Kiểm tra KnowledgeVector table trong yarn db:studio"
echo ""
echo "Nếu vẫn có lỗi:"
echo "  RAG_LOG_LEVEL=debug yarn dev"
echo ""

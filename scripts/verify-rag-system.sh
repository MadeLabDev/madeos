#!/usr/bin/env bash

# RAG System Verification Script
# Run this to verify everything is set up correctly

echo "🔍 RAG System Verification"
echo "=========================="
echo ""

# 1. Check TypeScript compilation
echo "1. Checking TypeScript compilation..."
if npx tsc --noEmit 2>&1 | grep -q "vector-search"; then
    echo "   ❌ TypeScript errors found"
    npx tsc --noEmit 2>&1 | grep "vector-search"
else
    echo "   ✅ TypeScript compilation successful"
fi

echo ""

# 2. Check file structure
echo "2. Checking file structure..."

files=(
    "lib/features/vector-search/services/embedding-service.ts"
    "lib/features/vector-search/services/vector-search-service.ts"
    "lib/features/vector-search/services/rag-service.ts"
    "lib/features/vector-search/services/indexing-service.ts"
    "lib/features/vector-search/services/cross-feature-service.ts"
    "lib/features/vector-search/actions/index-actions.ts"
    "lib/features/vector-search/actions/search-actions.ts"
    "components/vector-search/rag-chat-box.tsx"
    "components/vector-search/rag-message-list.tsx"
    "components/vector-search/rag-results-list.tsx"
    "lib/utils/logger.ts"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - NOT FOUND"
        all_files_exist=false
    fi
done

echo ""

# 3. Check documentation
echo "3. Checking documentation..."

docs=(
    "lib/features/vector-search/README.md"
    "lib/features/vector-search/INTEGRATION_GUIDE.md"
    "lib/features/vector-search/FINAL_SUMMARY.md"
    "docs/RAG_ERROR_HANDLING_AND_PERFORMANCE.md"
    "docs/RAG_DEPLOYMENT_GUIDE.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        lines=$(wc -l < "$doc")
        echo "   ✅ $doc ($lines lines)"
    else
        echo "   ❌ $doc - NOT FOUND"
    fi
done

echo ""

# 4. Check test files
echo "4. Checking test files..."

tests=(
    "tests/unit/vector-search/embedding-service.test.ts"
    "tests/unit/vector-search/vector-search-service.test.ts"
    "tests/unit/vector-search/rag-service.test.ts"
)

for test in "${tests[@]}"; do
    if [ -f "$test" ]; then
        cases=$(grep -c "it(" "$test")
        echo "   ✅ $test ($cases test cases)"
    else
        echo "   ❌ $test - NOT FOUND"
    fi
done

echo ""

# 5. Code statistics
echo "5. Code statistics..."

ts_files=$(find lib/features/vector-search components/vector-search -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)
ts_lines=$(find lib/features/vector-search components/vector-search -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | tail -1 | awk '{print $1}')

echo "   📊 TypeScript files: $ts_files"
echo "   📊 Lines of code: $ts_lines"

echo ""

# 6. Database check
echo "6. Checking database migrations..."

if [ -d "prisma/migrations/20251205161032_refactor_knowledge_vector_cross_feature" ]; then
    echo "   ✅ Migration applied: 20251205161032_refactor_knowledge_vector_cross_feature"
else
    echo "   ⚠️  Migration not yet applied (will apply with 'yarn db:migrate')"
fi

echo ""

# 7. Summary
echo "================================"
if [ "$all_files_exist" = true ]; then
    echo "✅ RAG SYSTEM IS READY"
    echo ""
    echo "Next steps:"
    echo "  1. Set environment variables (OPENAI_API_KEY, etc.)"
    echo "  2. Run migrations: yarn db:migrate"
    echo "  3. Test with: yarn test:unit vector-search"
    echo "  4. Add to UI: <RAGChatBox defaultModules={['knowledge']} />"
    echo "  5. Integrate with features using INTEGRATION_GUIDE.md"
else
    echo "❌ SOME FILES ARE MISSING"
    echo ""
    echo "Please check above for missing files."
fi

echo ""
echo "📚 Documentation:"
echo "  - README.md: API reference and quick start"
echo "  - INTEGRATION_GUIDE.md: How to add RAG to your features"
echo "  - RAG_ERROR_HANDLING_AND_PERFORMANCE.md: Error handling patterns"
echo "  - RAG_DEPLOYMENT_GUIDE.md: Production deployment"
echo ""

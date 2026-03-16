#!/bin/bash

# Test CORS for /api/form-data/retrieve endpoint

echo "🧪 Testing CORS for Form Data Retrieve"
echo "======================================"

# Get API URL
API_URL="${1:-http://localhost:3000/api/form-data/retrieve?key=phc2025_after_survey}"
ORIGIN="${2:-http://localhost:4000}"

echo "API URL: $API_URL"
echo "Origin: $ORIGIN"
echo ""

# Test 1: OPTIONS (Preflight) Request
echo "1️⃣  Testing OPTIONS (Preflight) Request..."
echo "-------------------------------------------"
curl -i -X OPTIONS "$API_URL" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -s | head -20

echo ""
echo ""

# Test 2: GET Request
echo "2️⃣  Testing GET Request..."
echo "--------------------------"
curl -i "$API_URL" \
  -H "Origin: $ORIGIN" \
  -s | head -40

echo ""
echo ""
echo "✅ CORS test completed!"
echo ""
echo "📝 Check for headers:"
echo "   - Access-Control-Allow-Origin: $ORIGIN"
echo "   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH"
echo "   - Access-Control-Allow-Credentials: true"

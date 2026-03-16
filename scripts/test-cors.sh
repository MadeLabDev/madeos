#!/bin/bash

# Test CORS Configuration for Form Submit API

echo "🧪 Testing CORS Configuration"
echo "=============================="

# Get API URL
API_URL="${1:-http://localhost:3000/api/form-data/submit}"
ORIGIN="${2:-http://localhost:4000}"

echo "API URL: $API_URL"
echo "Origin: $ORIGIN"
echo ""

# Test 1: OPTIONS (Preflight) Request
echo "1️⃣  Testing OPTIONS (Preflight) Request..."
echo "-------------------------------------------"
curl -i -X OPTIONS "$API_URL" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -s | head -20

echo ""
echo ""

# Test 2: POST Request
echo "2️⃣  Testing POST Request..."
echo "--------------------------"
curl -i -X POST "$API_URL" \
  -H "Origin: $ORIGIN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "test_cors",
    "field": ["firstName", "lastName", "email"]
  }' \
  -s | head -40

echo ""
echo ""
echo "✅ CORS test completed!"
echo ""
echo "📝 Check for headers:"
echo "   - Access-Control-Allow-Origin: $ORIGIN"
echo "   - Access-Control-Allow-Methods: GET, POST, OPTIONS"
echo "   - Access-Control-Allow-Credentials: true"

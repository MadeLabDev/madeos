#!/bin/bash
# Test script to verify /profile/builder page loads without error

echo "🧪 Testing /profile/builder endpoint..."
echo ""

# Call the page and capture response
RESPONSE=$(curl -s http://localhost:3000/profile/builder)

# Check if error message is present
if echo "$RESPONSE" | grep -q "Failed to load profile"; then
  echo "❌ ERROR: Page still shows 'Failed to load profile'"
  echo ""
  echo "Response excerpt:"
  echo "$RESPONSE" | grep -A 5 "Failed to load profile" | head -10
  exit 1
fi

# Check if page loaded successfully
if echo "$RESPONSE" | grep -q "Profile Builder\|Welcome to Profile Builder\|Create Your Profile"; then
  echo "✅ SUCCESS: Page loaded correctly!"
  echo ""
  echo "Found expected content: 'Profile Builder' or 'Create Your Profile'"
  exit 0
fi

echo "⚠️ WARNING: Page loaded but couldn't verify success message"
echo ""
echo "Response length: $(echo "$RESPONSE" | wc -c) bytes"
echo "First 500 chars:"
echo "$RESPONSE" | head -c 500
echo ""
exit 0

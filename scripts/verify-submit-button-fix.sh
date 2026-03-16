#!/bin/bash
# Quick verification that all forms have the hidden submit button pattern

echo "=== Verifying Submit Button Fix ==="
echo ""

echo "Checking for hideButtons && (div.hidden) pattern in all form files..."
echo ""

FORMS=(
  "app/(dashboard)/customers/components/customer-form.tsx"
  "app/(dashboard)/users/components/user-form.tsx"
  "app/(dashboard)/roles/components/role-form.tsx"
)

for form in "${FORMS[@]}"; do
  echo "Checking: $form"
  if grep -q '{hideButtons && (' "$form" && grep -q '<div className="hidden">' "$form"; then
    echo "  ✅ Has hidden submit button pattern"
  else
    echo "  ❌ Missing hidden submit button pattern"
  fi
done

echo ""
echo "=== Reference Pattern (Settings) ==="
grep -A 10 '{hideButtons && (' "app/(dashboard)/settings/components/system-settings-form.tsx" | head -15

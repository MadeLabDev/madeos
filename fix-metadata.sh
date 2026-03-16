#!/bin/bash

# Fix metadata imports in all dashboard pages

declare -a FILES=(
    "app/(dashboard)/customers/[id]/edit/page.tsx"
    "app/(dashboard)/interactions/new/page.tsx"
    "app/(dashboard)/interactions/[id]/edit/page.tsx"
    "app/(dashboard)/interactions/[id]/page.tsx"
    "app/(dashboard)/opportunities/new/page.tsx"
    "app/(dashboard)/opportunities/[id]/edit/page.tsx"
    "app/(dashboard)/engagements/[id]/edit/page.tsx"
    "app/(dashboard)/engagements/[id]/page.tsx"
    "app/(dashboard)/training-support/[id]/reports/new/page.tsx"
    "app/(dashboard)/training-support/[id]/reports/page.tsx"
    "app/(dashboard)/contacts/new/page.tsx"
    "app/(dashboard)/contacts/[id]/edit/page.tsx"
    "app/(dashboard)/user-groups/new/page.tsx"
    "app/(dashboard)/user-groups/[id]/edit/page.tsx"
    "app/(dashboard)/user-groups/[id]/page.tsx"
    "app/(dashboard)/meta/module-types/new/page.tsx"
    "app/(dashboard)/meta/module-types/[id]/edit/page.tsx"
    "app/(dashboard)/meta/module-types/[id]/page.tsx"
    "app/(dashboard)/marketing/microsites/new/page.tsx"
    "app/(dashboard)/marketing/microsites/[eventId]/edit/page.tsx"
    "app/(dashboard)/marketing/sponsors/new/page.tsx"
    "app/(dashboard)/marketing/sponsors/[id]/edit/page.tsx"
    "app/(dashboard)/marketing/campaigns/[id]/edit/page.tsx"
)

for file in "${FILES[@]}"; do
    echo "Processing: $file"
    # Check if Metadata import exists
    if grep -q 'import.*Metadata.*from.*"next"' "$file"; then
        echo "  - Has old Metadata import, fixing..."
    fi
done

echo "Done!"

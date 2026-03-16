#!/bin/bash
# Script to add ActionResult import to all feature type files that need it

# List of type files that need ActionResult import added at the top
TYPE_FILES=(
	"lib/features/post-tags/types/tag.types.ts"
	"lib/features/product-designs/types/product-design.types.ts"
	"lib/features/invoices/types/invoice.types.ts"
	"lib/features/samples/types/sample.types.ts"
	"lib/features/test-suites/types/test-suite.types.ts"
	"lib/features/backup/types/backup.types.ts"
	"lib/features/knowledge-tags/types/tag.types.ts"
	"lib/features/tech-packs/types/tech-pack.types.ts"
	"lib/features/test-reports/types/test-report.types.ts"
	"lib/features/post-categories/types/category.types.ts"
	"lib/features/knowledge-categories/types/category.types.ts"
	"lib/features/design-briefs/types/design-brief.types.ts"
	"lib/features/user-groups/types/user-groups.types.ts"
	"lib/features/training-reports/types/training-report.types.ts"
	"lib/features/payments/types/payment.types.ts"
	"lib/features/implementation-plans/types/implementation-plan.types.ts"
	"lib/features/post/types/post.types.ts"
	"lib/features/design/types/design.types.ts"
	"lib/features/event-microsites/types/event-microsite.types.ts"
	"lib/features/sop-library/types/sop-library.types.ts"
	"lib/features/marketing-campaigns/types/marketing-campaign.types.ts"
)

echo "Files with ActionResult definitions that need to be updated:"
for file in "${TYPE_FILES[@]}"; do
  echo "  - $file"
done

echo ""
echo "Total files: ${#TYPE_FILES[@]}"

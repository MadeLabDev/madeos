# Create New Feature Script

This script helps you create a new feature similar to "Sponsor" or "Speaker" in the print-shop application.

## What it does

The script automates the creation of a new Post-based feature by:

1. ✅ **Automatically adds** to `lib/config/module-types.ts` (SYSTEM_TYPES array)
2. ✅ **Automatically adds** to `prisma/seeds/system/index.ts` (DEFAULT_POST_TYPES array)
3. ⏳ **Provides instructions** to manually add to `lib/config/sidebar-menu.ts`
4. ✅ **Automatically adds** to `tools/add-new-roles-modules.ts`

## Usage

```bash
# Make sure you're in the project root
cd /path/to/print-shop

# Run the script
./scripts/create-new-feature.sh
```

The script will:

1. Ask for the feature name (e.g., "Speaker", "Partner", "Vendor")
2. Show you what will be created
3. Ask for confirmation
4. Make the automated changes
5. Provide manual instructions for the sidebar menu

## Example

```bash
$ ./scripts/create-new-feature.sh
🚀 Create New Feature Script
This script will create a new feature similar to Sponsor/Speaker

Enter the feature name (e.g., Speaker, Partner, Vendor): Partner
ℹ️  Creating feature: Partner
ℹ️  Lowercase: partner
ℹ️  Plural: Partners

Continue? (y/N): y
ℹ️  Adding to lib/config/module-types.ts...
✅ Added to SYSTEM_TYPES in lib/config/module-types.ts
ℹ️  Adding to prisma/seeds/system/index.ts...
✅ Added to DEFAULT_POST_TYPES in prisma/seeds/system/index.ts
⚠️  MANUAL STEP REQUIRED for sidebar-menu.ts:
[Instructions shown here...]
ℹ️  Adding to tools/add-new-roles-modules.ts...
✅ Added to roles/modules in tools/add-new-roles-modules.ts

✅ Feature 'Partner' has been partially created!
```

## Manual Steps Required

After running the script, you need to manually add the sidebar menu entry. The script provides exact code to copy-paste into `lib/config/sidebar-menu.ts` in the "Events x Education" section.

## Next Steps After Creation

1. Run database migrations if needed
2. Create module types in the admin panel at `/meta/module-types`
3. Test the new feature at `/post?type=your-feature-name`
4. Update permissions and roles as needed

## Features Created

- **Post Type**: `/post?type=your-feature` - Main listing page
- **Categories**: `/post/categories?type=your-feature` - Category management
- **Tags**: `/post/tags?type=your-feature` - Tag management
- **Module Types**: Can create custom forms for the feature
- **Permissions**: Automatic role and module creation

## Notes

- The feature uses the existing Post system with a custom type
- All features get their own permission modules (e.g., "speakers", "partners")
- Icons default to `Handshake` but can be changed in sidebar-menu.ts
- Features are enabled by default (no `display: false`)

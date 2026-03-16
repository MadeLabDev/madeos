#!/bin/bash

# Create New Feature Script
# This script creates a new Post-based feature similar to Sponsor/Speaker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Create New Feature Script${NC}"
echo "This script will create a new feature similar to Sponsor/Speaker"
echo

# Get feature name from user
read -p "Enter the feature name (e.g., Speaker, Partner, Vendor): " FEATURE_NAME

# Validate input
if [ -z "$FEATURE_NAME" ]; then
    echo -e "${RED}❌ Error: Feature name cannot be empty${NC}"
    exit 1
fi

# Convert to lowercase and create plural
FEATURE_LOWER=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]')
FEATURE_PLURAL="${FEATURE_LOWER}s"

echo -e "${BLUE}ℹ️  Creating feature: ${FEATURE_NAME}${NC}"
echo -e "${BLUE}ℹ️  Lowercase: ${FEATURE_LOWER}${NC}"
echo -e "${BLUE}ℹ️  Plural: ${FEATURE_PLURAL}${NC}"
echo

# Confirm
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Cancelled${NC}"
    exit 0
fi

echo

# 1. Add to lib/config/module-types.ts
echo -e "${BLUE}ℹ️  Adding to lib/config/module-types.ts...${NC}"
if grep -q "\"${FEATURE_LOWER}\"" lib/config/module-types.ts; then
    echo -e "${YELLOW}⚠️  '${FEATURE_LOWER}' already exists in module-types.ts${NC}"
else
    # Find the SYSTEM_TYPES array and add the new entry
    sed -i '' "/SYSTEM_TYPES = \[/,/]/ {
        /]/ i\\
        { value: \"${FEATURE_LOWER}\", label: \"${FEATURE_NAME}\" },
    }" lib/config/module-types.ts
    echo -e "${GREEN}✅ Added to SYSTEM_TYPES in lib/config/module-types.ts${NC}"
fi

# 2. Add to prisma/seeds/system/index.ts
echo -e "${BLUE}ℹ️  Adding to prisma/seeds/system/index.ts...${NC}"
if grep -q "\"${FEATURE_LOWER}\"" prisma/seeds/system/index.ts; then
    echo -e "${YELLOW}⚠️  '${FEATURE_LOWER}' already exists in seeds/system/index.ts${NC}"
else
    # Find the DEFAULT_POST_TYPES array and add the new entry before the closing bracket
    sed -i '' "/DEFAULT_POST_TYPES = \[/,/] as const;/ {
        /] as const;/ i\\
	{ name: \"${FEATURE_LOWER}\", displayName: \"${FEATURE_NAME} Management\", description: \"${FEATURE_NAME} management\" },
    }" prisma/seeds/system/index.ts
    echo -e "${GREEN}✅ Added to DEFAULT_POST_TYPES in prisma/seeds/system/index.ts${NC}"
fi

# 3. Add to tools/add-new-roles-modules.ts
echo -e "${BLUE}ℹ️  Adding to tools/add-new-roles-modules.ts...${NC}"
if grep -q "\"${FEATURE_LOWER}\"" tools/add-new-roles-modules.ts; then
    echo -e "${YELLOW}⚠️  '${FEATURE_LOWER}' already exists in add-new-roles-modules.ts${NC}"
else
    # Find the roleModuleConfigs array and add the new entry
    sed -i '' "/roleModuleConfigs = \[/,/];/ {
        /speaker.*role: { name: \"speaker\"/ a\\
			{\\
				module: { name: \"${FEATURE_LOWER}\", displayName: \"${FEATURE_NAME} Management\", description: \"${FEATURE_NAME} management\" },\\
				role: { name: \"${FEATURE_LOWER}\", displayName: \"${FEATURE_NAME}\", description: \"${FEATURE_NAME} with enhanced access\" }\\
			},
    }" tools/add-new-roles-modules.ts
    echo -e "${GREEN}✅ Added to roles/modules in tools/add-new-roles-modules.ts${NC}"
fi

echo
echo -e "${YELLOW}⚠️  MANUAL STEP REQUIRED for sidebar-menu.ts:${NC}"
echo -e "${YELLOW}Add this code to the 'Events x Education' section in lib/config/sidebar-menu.ts:${NC}"
echo
echo -e "${GREEN}// ${FEATURE_PLURAL}${NC}"
echo -e "${GREEN}{${NC}"
echo -e "${GREEN}  name: '${FEATURE_PLURAL}',${NC}"
echo -e "${GREEN}  href: '/post?type=${FEATURE_LOWER}',${NC}"
echo -e "${GREEN}  icon: Handshake,${NC}"
echo -e "${GREEN}  permission: '${FEATURE_LOWER}',${NC}"
echo -e "${GREEN}  children: [${NC}"
echo -e "${GREEN}    {${NC}"
echo -e "${GREEN}      name: 'List',${NC}"
echo -e "${GREEN}      href: '/post?type=${FEATURE_LOWER}',${NC}"
echo -e "${GREEN}      permission: '${FEATURE_LOWER}',${NC}"
echo -e "${GREEN}    },${NC}"
echo -e "${GREEN}    {${NC}"
echo -e "${GREEN}      name: 'Categories',${NC}"
echo -e "${GREEN}      href: '/post/categories?type=${FEATURE_LOWER}',${NC}"
echo -e "${GREEN}      permission: '${FEATURE_LOWER}',${NC}"
echo -e "${GREEN}    },${NC}"
echo -e "${GREEN}    {${NC}"
echo -e "${GREEN}      name: 'Tags',${NC}"
echo -e "${GREEN}      href: '/post/tags?type=${FEATURE_LOWER}',${NC}"
echo -e "${GREEN}      permission: '${FEATURE_LOWER}',${NC}"
echo -e "${GREEN}    },${NC}"
echo -e "${GREEN}  ],${NC}"
echo -e "${GREEN}},${NC}"
echo

echo -e "${GREEN}✅ Feature '${FEATURE_NAME}' has been partially created!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Add the sidebar menu code above to lib/config/sidebar-menu.ts"
echo "2. Run database migrations if needed"
echo "3. Create module types in the admin panel at /meta/module-types"
echo "4. Test the new feature at /post?type=${FEATURE_LOWER}"
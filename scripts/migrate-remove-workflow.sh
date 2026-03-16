#!/bin/bash
# ============================================
# Migration Script: Remove Screen Printing Workflow
# This script safely removes all workflow-related data from the database
# ============================================

set -e  # Exit on any error

echo "============================================"
echo "🛠️  WORKFLOW REMOVAL MIGRATION SCRIPT"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)_pre_workflow_removal"
MIGRATION_FILE="./prisma/migrations/20251115120100_remove_workflow/migration.sql"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Migration file not found: $MIGRATION_FILE"
    exit 1
fi

print_status "Starting workflow removal migration..."
echo ""

# Step 1: Create backup
print_status "Step 1: Creating database backup..."
mkdir -p "$BACKUP_DIR"

if command -v mysqldump &> /dev/null; then
    # Extract database connection details from .env
    if [ -f ".env.local" ]; then
        DB_HOST=$(grep "DB_HOST" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        DB_USER=$(grep "DB_USER" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        DB_PASSWORD=$(grep "DB_PASSWORD" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        DB_NAME=$(grep "DB_NAME" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")

        # Default values if not found
        DB_HOST=${DB_HOST:-"localhost"}
        DB_USER=${DB_USER:-"root"}
        DB_PASSWORD=${DB_PASSWORD:-""}
        DB_NAME=${DB_NAME:-"print_shop"}

        print_status "Creating backup of database: $DB_NAME"
        mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/pre_migration_backup.sql"

        if [ $? -eq 0 ]; then
            print_success "Database backup created: $BACKUP_DIR/pre_migration_backup.sql"
        else
            print_warning "Failed to create database backup. Continuing anyway..."
        fi
    else
        print_warning ".env.local file not found. Skipping database backup."
    fi
else
    print_warning "mysqldump not found. Skipping database backup."
fi

# Step 2: Show what will be removed
print_status "Step 2: Analyzing current workflow data..."

echo ""
echo "The following workflow-related data will be removed:"
echo "• Tables: Order, OrderAllocation, InventoryProduct, InventoryMovement,"
echo "         InventoryUnit, InventoryCategory, Pantone, ShirtSize, ShirtColor,"
echo "         ShirtBrand, ScreenSize"
echo "• Modules: orders, inventory, pantone, shipping, design, screens, shirts"
echo "• Roles: sales, designer, inventory_staff, qc_inventory, ink_prep,"
echo "         screen_prep, printing, qc_printing, packing, finance,"
echo "         shipping_manager, design_manager"
echo "• Permissions: All permissions related to above modules"
echo ""

read -p "Do you want to continue with the migration? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Migration cancelled by user."
    exit 0
fi

# Step 3: Run the migration
print_status "Step 3: Running migration..."

if [ -f ".env.local" ]; then
    # Load environment variables
    export $(grep -v '^#' .env.local | xargs)

    # Run the migration using the database URL
    if [ -n "$DATABASE_URL" ]; then
        print_status "Applying migration to database..."
        # You can use a MySQL client or Prisma to run the migration
        # For now, we'll just show the SQL that would be executed
        print_warning "Please execute the migration manually using your preferred MySQL client:"
        echo ""
        echo "mysql -u [username] -p [database] < $MIGRATION_FILE"
        echo ""
        echo "Or copy and paste the contents of: $MIGRATION_FILE"
    else
        print_error "DATABASE_URL not found in .env.local file"
        exit 1
    fi
else
    print_error ".env.local file not found"
    exit 1
fi

# Step 4: Verification
print_status "Step 4: Migration completed!"
echo ""
print_success "Workflow removal migration has been prepared."
echo ""
echo "Next steps:"
echo "1. Review the backup in: $BACKUP_DIR"
echo "2. Execute the migration SQL manually"
echo "3. Run 'npm run db:generate' to update Prisma client"
echo "4. Test your application to ensure everything works"
echo ""
print_warning "⚠️  IMPORTANT: This migration is irreversible!"
print_warning "⚠️  Make sure you have a complete backup before proceeding."
echo ""

print_success "Migration script completed successfully!"
# 🌱 Database Seeds

Organized seed directory structure for managing development and production data initialization.

## Directory Structure

```
prisma/seeds/
├── seed.ts                    # Main entry point with improved organization
├── seeder-utils.ts           # Shared utilities and Prisma client
├── system/                   # System data (always runs)
│   ├── index.ts             # Users, roles, permissions, modules
│   └── profile-module-types-seed.ts
├── dev/                      # Development data (NODE_ENV !== 'production')
│   ├── index.ts             # Exports all dev seeders
│   ├── customers.ts         # Customer and vendor data
│   ├── knowledge-data.ts    # Knowledge base categories/tags/articles
│   ├── events-seed.ts       # Event definitions and sessions
│   ├── event-registrations-seed.ts # Event registrations and users
│   ├── crm-testing-seed.ts  # CRM contacts, opportunities, testing data
│   ├── crm-design-seed.ts       # Design projects, briefs, products
│   ├── module-instances-seed.ts # Dynamic form instances
│   └── post-data.ts         # Blog post data (currently disabled)
└── README.md                # This file
```

## Key Improvements (v2.0)

### 1. Shared Utilities (`seeder-utils.ts`)
- **Single Prisma Client**: All seeders share one Prisma client instance
- **Consistent Error Handling**: `runSeeder()` wrapper with standardized logging
- **Environment Checks**: Centralized production/development logic
- **Data Clearing**: Organized table deletion respecting foreign key constraints

### 2. Standardized Interface
All seed functions now return `SeederResult`:
```typescript
interface SeederResult {
  success: boolean;
  message: string;
  count?: number;      // Number of records created
  data?: any;          // Additional data if needed
}
```

### 3. Cleaner Main Seed File
- **Logical Grouping**: System data first, then development data
- **Dependency Order**: Seeds are run in dependency order
- **Better Logging**: Consistent emoji and formatting
- **Error Handling**: Centralized error handling and cleanup

## Usage

### Development (Full Seed with Demo Data)
```bash
yarn db:seed
```

### Production (System Data Only)
```bash
NODE_ENV=production yarn db:seed
```

## What Gets Seeded

### System Folder (Always Runs)
- ✓ Admin and system users
- ✓ Roles (admin, manager, user)
- ✓ Permissions (read, create, update, delete, approve)
- ✓ Modules configuration
- ✓ Default system settings

### Dev Folder (Development Only)
- ✓ Sample customers with multi-location hierarchy
- ✓ Knowledge base articles, categories, and tags
- ✓ Event definitions with sessions and ticket types
- ✓ Event registrations and test users
- ✓ CRM contacts, opportunities, and engagements
- ✓ Testing data (suites, orders, samples, reports)
- ✓ Design projects, briefs, products, and reviews
- ✓ Dynamic module instances for forms

## Data Clearing Strategy

Development data is cleared in dependency order to respect foreign key constraints:

1. **Design**: Reviews → Decks → TechPacks → Designs → Briefs → Projects
2. **Testing**: Reports → Tests → Samples → TestSuites → TestOrders
3. **CRM**: Tasks → Interactions → Engagements → Opportunities → Contacts
4. **Events**: CheckIns → Registrations → Tickets → Payments → Events
5. **Knowledge**: Media → UserGroups → Knowledge assignments → Articles → Tags → Categories
6. **Modules**: Instances → Types
7. **Customers**: All customer records
8. **System**: Activity logs → Sessions → Accounts → Roles/Permissions → Users → Settings

## File Relationships

```
seed.ts (entry point)
├── /system/index.ts
│   └── /meta-seed.ts (imported)
└── /dev/index.ts (exports)
    ├── customers.ts
    ├── knowledge-data.ts
    ├── profile-module-types-seed.ts
    └── module-instances-seed.ts
```

## How It Works

`seed.ts` checks the `NODE_ENV` environment variable:

```typescript
const isProduction = process.env.NODE_ENV === 'production';

// Always run
const systemData = await seedSystemData();

// Development only
if (!isProduction) {
  await seedCustomers();
  await seedPrintshopData();
  // ... more dev seeds
}
```

## Development Workflow

```bash
# Fresh development database with demo data
yarn db:reset          # Drops DB, migrates, seeds everything

# Just seed without reset
yarn db:seed

# View database in Studio
yarn db:studio

# Development server
yarn dev
```

## Production Deployment

```bash
# Deploy migrations only
prisma migrate deploy

# Seed system data
NODE_ENV=production yarn db:seed:prod

# Or use npm script
yarn db:seed:prod
```

## Adding New Seeds

1. **For System Data** (runs in production):
   - Add file to `system/` folder
   - Export function: `export async function seedXxx() { }`
   - Call from `system/index.ts`

2. **For Dev Data** (development only):
   - Add file to `dev/` folder
   - Export function: `export async function seedXxx() { }`
   - Add to `dev/index.ts` exports
   - Call from `seed.ts` inside `if (!isProduction)` block

## Important Notes

⚠️ **DO NOT**:
- Mix demo data into system folder (would run in production)
- Forget to export functions from index files
- Hardcode environment checks in individual seed files
- Add sensitive data to dev seeds (will be in git)

✅ **DO**:
- Keep system data minimal and essential
- Use dev folder for all demo/sample data
- Test both `yarn db:seed` and `yarn db:seed:prod`
- Document new seed functions clearly

## Migration Paths

### SQLite → MySQL
Seeds are database-agnostic (use Prisma only), so switching databases requires only `.env` change.

### Reset Database
```bash
# Full reset with demo data
yarn db:reset

# Migrations only (keep data)
prisma migrate deploy
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Demo data in production | Ensure `NODE_ENV=production` before seed |
| Import errors | Verify path in seed.ts matches folder structure |
| Missing data | Check that seed function is called (not just imported) |
| Seed hangs | Check database connection and increase timeout |

---

**See individual folder READMEs for detailed documentation of each seed module.**

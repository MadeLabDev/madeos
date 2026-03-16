# Feature Development Template for MADE OS

## Overview
This document defines the standard structure, patterns, and conventions for developing features in MADE OS. Following these guidelines ensures consistency, maintainability, and seamless integration across the application.

## Standard Feature Structure

Every feature in `lib/features/[feature]/` must follow this structure:

```
lib/features/[feature-name]/
├── actions/              # Server actions with permission checks
│   ├── [feature].actions.ts
│   └── index.ts         # Barrel export
├── services/            # Business logic and validation
│   ├── [feature].service.ts
│   └── index.ts         # Barrel export
├── repositories/        # Direct database operations
│   ├── [feature].repository.ts
│   └── index.ts         # Barrel export
├── types/              # TypeScript interfaces and types
│   ├── [feature].types.ts
│   └── index.ts         # Barrel export
└── index.ts            # Main feature barrel export
```

### Directory and File Naming Conventions

- **Folders**: Use `kebab-case` (e.g., `test-orders`, `user-groups`)
- **Files**: Use `camelCase` for service/repository files, `kebab-case` for feature files
- **Types**: Use `PascalCase` for interfaces and types
- **Constants**: Use `UPPER_SNAKE_CASE`

## Import Rules

### ✅ ALWAYS Use Absolute Imports

```typescript
// ✅ CORRECT
import { ContactService } from "@/lib/features/contacts/services/contact-service";
import type { CreateContactInput } from "@/lib/features/contacts/types/contact.types";
import type { ActionResult } from "@/lib/types";

// ❌ WRONG - Never use relative imports
import { ContactService } from "../services/contact-service";
import type { ActionResult } from "../../users/actions/user-actions";
```

### Barrel Exports Pattern

Every subdirectory must have an `index.ts` that re-exports everything:

**`actions/index.ts`:**
```typescript
/**
 * Feature actions barrel export
 */

export * from "./feature.actions";
```

**Main `index.ts`:**
```typescript
/**
 * Feature barrel export
 * Follows standard feature-based architecture pattern
 */

export * from "./types";
export * from "./actions";
export * from "./services";
export * from "./repositories";
```

## Shared Types

### Use Centralized ActionResult

Always import `ActionResult` from `@/lib/types` - never redefine it:

```typescript
import type { ActionResult } from "@/lib/types";

export async function createItemAction(data: CreateInput): Promise<ActionResult> {
  try {
    // ... logic
    return { success: true, message: "Item created", data: item };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

### Available Shared Types from `@/lib/types`

```typescript
import type { 
  ActionResult,           // Standard action result wrapper
  PaginationParams,       // Pagination parameters
  PaginatedResult,        // Paginated response wrapper
  BulkOperationResult     // Bulk operation results
} from "@/lib/types";
```

## Server Actions Pattern

Every server action must follow this pattern:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import { featureService } from "@/lib/features/[feature]/services/feature.service";
import type { CreateInput, UpdateInput } from "@/lib/features/[feature]/types/feature.types";

/**
 * Create a new item
 */
export async function createItemAction(data: CreateInput): Promise<ActionResult> {
  try {
    // 1. Permission check (ALWAYS FIRST)
    await requirePermission("[module]", "create");
    
    // 2. Business logic
    const item = await featureService.createItem(data);
    
    // 3. Real-time notification (if applicable)
    await getPusher().trigger("private-global", "item_update", {
      action: "item_created",
      item
    });
    
    // 4. Cache revalidation
    revalidatePath("/items");
    
    // 5. Return standard result
    return {
      success: true,
      message: "Item created successfully",
      data: item
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create item"
    };
  }
}
```

### Permission Modules

Permission modules must match database `Module.name`:
- `"customers"` - Contact/Customer operations
- `"users"` - User management
- `"events"` - Event management
- `"knowledge"` - Knowledge base
- `"testing"` - Testing operations
- `"roles"` - Role management (admin)

## Services Pattern

Services contain business logic and validation:

```typescript
import { featureRepository } from "@/lib/features/[feature]/repositories/feature.repository";
import type { CreateInput, UpdateInput } from "@/lib/features/[feature]/types/feature.types";

export class FeatureService {
  /**
   * Create a new item with validation
   */
  static async createItem(data: CreateInput) {
    // Validation
    if (!data.requiredField) {
      throw new Error("Required field is missing");
    }
    
    // Business logic
    const existing = await featureRepository.findByUniqueField(data.uniqueField);
    if (existing) {
      throw new Error("Item already exists");
    }
    
    // Create
    return featureRepository.create(data);
  }
}
```

## Repositories Pattern

Repositories handle direct database operations:

```typescript
import { prisma } from "@/lib/prisma";
import type { CreateInput, UpdateInput } from "@/lib/features/[feature]/types/feature.types";

// Database detection for case-insensitive search
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class FeatureRepository {
  /**
   * Get all items with pagination and search
   */
  static async getAllItems(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { 
          name: { 
            contains: search,
            ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const })
          }
        },
        { 
          description: { 
            contains: search,
            ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const })
          }
        }
      ];
    }
    
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.item.count({ where })
    ]);
    
    return { items, total };
  }
}
```

## Types Pattern

Define all interfaces and types in the types directory:

```typescript
import type { ActionResult } from "@/lib/types";

// Re-export shared types for convenience
export type { ActionResult };

// Base types from Prisma
export type { ItemStatus } from "@/generated/prisma/client";

// Extended types with relations
export interface ItemWithRelations extends Item {
  customer?: {
    id: string;
    companyName: string;
  };
  _count?: {
    subItems: number;
  };
}

// Create input
export interface CreateItemInput {
  title: string;
  description?: string;
  customerId: string;
  status?: ItemStatus;
}

// Update input
export interface UpdateItemInput {
  title?: string;
  description?: string;
  status?: ItemStatus;
}

// List parameters
export interface ItemListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  customerId?: string;
  status?: ItemStatus;
}

// List result
export interface ItemListResult {
  items: ItemWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Real-time Updates (Pusher)

For real-time features, always trigger Pusher notifications:

```typescript
import { getPusher } from "@/lib/realtime/pusher-handler";

// After successful operation
await getPusher().trigger("private-global", "item_update", {
  action: "item_created",  // or "item_updated", "item_deleted"
  item: item,
  userId: session.user.id
});
```

## Cache Revalidation

Always revalidate appropriate paths after mutations:

```typescript
import { revalidatePath } from "next/cache";

// Revalidate list page
revalidatePath("/items");

// Revalidate detail page
revalidatePath(`/items/${id}`);

// Revalidate related pages
revalidatePath("/dashboard");
```

## Error Handling

Always wrap actions in try-catch and return ActionResult:

```typescript
export async function actionName(data: Input): Promise<ActionResult> {
  try {
    // Permission check
    await requirePermission("module", "action");
    
    // Logic
    const result = await service.doSomething(data);
    
    // Success
    return {
      success: true,
      message: "Operation successful",
      data: result
    };
  } catch (error) {
    // Error
    return {
      success: false,
      message: error instanceof Error ? error.message : "Operation failed"
    };
  }
}
```

## Golden Examples

These features exemplify best practices:

1. **vector-search** - Complete barrel exports, absolute imports, comprehensive types
2. **events** - Well-structured with multiple sub-features (sessions, tickets, registrations)
3. **knowledge** - Clean separation of concerns, good type definitions
4. **test-orders** - Recently standardized, follows all conventions

## Checklist for New Features

- [ ] Created standard directory structure (actions, services, repositories, types)
- [ ] Added `index.ts` barrel exports in all subdirectories
- [ ] Used absolute imports throughout (`@/lib/features/...`)
- [ ] Imported `ActionResult` from `@/lib/types`
- [ ] Implemented permission checks in all actions
- [ ] Added error handling with try-catch
- [ ] Implemented Pusher notifications (if real-time needed)
- [ ] Added cache revalidation after mutations
- [ ] Used `CASE_INSENSITIVE_SEARCH` for search queries
- [ ] Defined all types in types directory
- [ ] Exported types via barrel exports
- [ ] Followed naming conventions (kebab-case, camelCase, PascalCase)
- [ ] Added JSDoc comments for public functions

## Migration Guide

For existing features that don't follow standards:

1. **Add barrel exports** to all subdirectories
2. **Convert relative imports** to absolute imports
3. **Move ActionResult** imports to `@/lib/types`
4. **Update main index.ts** to use wildcard exports
5. **Verify permission checks** in all actions
6. **Check Pusher notifications** are implemented
7. **Test thoroughly** after refactoring

## Resources

- Project outline: `.github/project-outline.md`
- Copilot instructions: `.github/copilot-instructions.md`
- Testing roadmap: `docs/testing-development-plan.md`
- Caching strategy: `docs/CACHING_STRATEGY.md`

---

**Last updated**: December 2025  
**Maintained by**: MADE OS Development Team

# 🚀 DEVELOPER QUICK REFERENCE - MADE OS

**Version**: 1.0  
**Last Updated**: January 6, 2026  
**For**: Developers implementing new features

---

## 📋 BEFORE YOU START

1. **Read**: `.github/copilot-instructions.md` (20 min)
2. **Read**: `docs/FEATURE_DEVELOPMENT_TEMPLATE.md` (10 min)
3. **Examine**: `lib/features/events/` (reference implementation)
4. **Examine**: `lib/features/knowledge/` (reference implementation)
5. **Check**: `docs/DETAILED_ACTION_ITEMS.md` (your specific task)

---

## 📁 FOLDER STRUCTURE TEMPLATE

Every feature in `lib/features/[feature-name]/` must follow:

```
lib/features/[feature-name]/
├── types/
│   ├── [feature].types.ts        ← Zod schemas + interfaces
│   └── index.ts                   ← export * from "./[feature].types"
├── repositories/
│   ├── [feature].repository.ts   ← Database CRUD
│   └── index.ts                   ← export * from "./[feature].repository"
├── services/
│   ├── [feature].service.ts      ← Business logic + validation
│   └── index.ts                   ← export * from "./[feature].service"
├── actions/
│   ├── [feature].actions.ts      ← Server actions
│   └── index.ts                   ← export * from "./[feature].actions"
└── index.ts                       ← export * from "./types", "./actions", "./services", "./repositories"
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Step 1: Create Type Definitions (15 min)
File: `lib/features/[feature]/types/[feature].types.ts`

```typescript
import { z } from "zod"
import type { ActionResult } from "@/lib/types"

// Database entity type (from Prisma schema)
export type MyEntity = {
  id: string
  name: string
  description?: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  createdAt: Date
  updatedAt: Date
}

// Form input validation
export const CreateMyEntityInput = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
})
export type CreateMyEntityInput = z.infer<typeof CreateMyEntityInput>

export const UpdateMyEntityInput = CreateMyEntityInput.partial()
export type UpdateMyEntityInput = z.infer<typeof UpdateMyEntityInput>

// Filters for list queries
export type MyEntityFilter = {
  search?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
}
```

File: `lib/features/[feature]/types/index.ts`

```typescript
export * from "./[feature].types"
export type { ActionResult } from "@/lib/types"  // ← IMPORTANT
```

### Step 2: Create Repository Layer (30 min)
File: `lib/features/[feature]/repositories/[feature].repository.ts`

```typescript
import { prisma } from "@/lib/prisma"
import { CASE_INSENSITIVE_SEARCH } from "@/lib/constants"
import type { MyEntityFilter } from "../types"

export async function getAllMyEntities(
  filters?: MyEntityFilter,
  skip = 0,
  take = 10
) {
  const where = {
    ...(filters?.search && {
      OR: [
        { name: { search: filters.search, mode: CASE_INSENSITIVE_SEARCH } },
        { description: { search: filters.search, mode: CASE_INSENSITIVE_SEARCH } },
      ],
    }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.dateFrom && { createdAt: { gte: filters.dateFrom } }),
    ...(filters?.dateTo && { createdAt: { lte: filters.dateTo } }),
  }

  const [data, total] = await Promise.all([
    prisma.myEntity.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Add relations if needed: owner: true, items: true
      },
    }),
    prisma.myEntity.count({ where }),
  ])

  return { data, total }
}

export async function getMyEntityById(id: string) {
  return prisma.myEntity.findUnique({
    where: { id },
    include: {
      // Add relations needed for detail view
      // owner: { select: { id: true, name: true } },
      // items: true,
    },
  })
}

export async function createMyEntity(data: CreateMyEntityInput) {
  return prisma.myEntity.create({
    data: {
      ...data,
      createdBy: "user-id-will-come-from-action", // Set in action
    },
  })
}

export async function updateMyEntity(
  id: string,
  data: UpdateMyEntityInput
) {
  return prisma.myEntity.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  })
}

export async function deleteMyEntity(id: string) {
  return prisma.myEntity.delete({
    where: { id },
  })
}
```

File: `lib/features/[feature]/repositories/index.ts`

```typescript
export * from "./[feature].repository"
```

### Step 3: Create Service Layer (20 min)
File: `lib/features/[feature]/services/[feature].service.ts`

```typescript
import { CreateMyEntityInput, UpdateMyEntityInput } from "../types"
import * as myEntityRepository from "../repositories"

export async function validateCreateData(data: CreateMyEntityInput) {
  // Additional validation beyond Zod
  if (data.name.toLowerCase() === "reserved") {
    throw new Error("Entity name 'reserved' is not allowed")
  }
}

export async function createMyEntity(data: CreateMyEntityInput) {
  // Validate
  await validateCreateData(data)

  // Check for duplicates if needed
  // const existing = await myEntityRepository.getByName(data.name)
  // if (existing) throw new Error("Entity with this name already exists")

  // Create
  return myEntityRepository.createMyEntity(data)
}

export async function updateMyEntity(id: string, data: UpdateMyEntityInput) {
  // Verify entity exists
  const entity = await myEntityRepository.getMyEntityById(id)
  if (!entity) throw new Error("Entity not found")

  // Validate
  // ...

  // Update
  return myEntityRepository.updateMyEntity(id, data)
}

export async function deleteMyEntity(id: string) {
  // Verify exists
  const entity = await myEntityRepository.getMyEntityById(id)
  if (!entity) throw new Error("Entity not found")

  // Check for dependencies
  // const hasLinkedItems = ...
  // if (hasLinkedItems) throw new Error("Cannot delete: has linked items")

  // Delete
  return myEntityRepository.deleteMyEntity(id)
}
```

File: `lib/features/[feature]/services/index.ts`

```typescript
export * from "./[feature].service"
```

### Step 4: Create Server Actions (30 min)
File: `lib/features/[feature]/actions/[feature].actions.ts`

```typescript
"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@/lib/auth"
import { checkPermission, requirePermission } from "@/lib/permissions"
import { getPusher } from "@/lib/realtime"
import type { ActionResult, PaginatedResult } from "@/lib/types"
import * as myEntityService from "../services"
import * as myEntityRepository from "../repositories"
import {
  CreateMyEntityInput,
  UpdateMyEntityInput,
  MyEntityFilter,
  type MyEntity,
} from "../types"

// LIST ACTION
export async function listMyEntitiesAction(
  filters?: MyEntityFilter,
  pagination?: { page?: number; pageSize?: number }
): Promise<ActionResult<PaginatedResult<MyEntity>>> {
  try {
    // Check permission
    await requirePermission("module-name", "read") // ← Change module name

    const page = pagination?.page || 1
    const pageSize = pagination?.pageSize || 10
    const skip = (page - 1) * pageSize

    const { data, total } = await myEntityRepository.getAllMyEntities(
      filters,
      skip,
      pageSize
    )

    return {
      success: true,
      message: "Entities retrieved successfully",
      data: {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    }
  } catch (error) {
    console.error("listMyEntitiesAction error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to list entities",
    }
  }
}

// GET ACTION
export async function getMyEntityAction(
  id: string
): Promise<ActionResult<MyEntity>> {
  try {
    await requirePermission("module-name", "read")

    const entity = await myEntityRepository.getMyEntityById(id)
    if (!entity) {
      return {
        success: false,
        message: "Entity not found",
      }
    }

    return {
      success: true,
      message: "Entity retrieved successfully",
      data: entity,
    }
  } catch (error) {
    console.error("getMyEntityAction error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get entity",
    }
  }
}

// CREATE ACTION
export async function createMyEntityAction(
  data: CreateMyEntityInput
): Promise<ActionResult<MyEntity>> {
  try {
    // 1. Check permission
    await requirePermission("module-name", "create")

    // 2. Get session for audit
    const session = await auth()
    const userId = session?.user?.id || "system"

    // 3. Validate using service
    await myEntityService.validateCreateData(data)

    // 4. Create
    const entity = await myEntityService.createMyEntity({
      ...data,
      createdBy: userId, // Add to repository method
    })

    // 5. Real-time notification
    await getPusher().trigger("private-global", "entity_created", {
      action: "entity_created",
      entity,
    })

    // 6. Cache invalidation
    revalidatePath("/module-name") // ← Change path
    revalidateTag("my-entities") // Optional: if using tags

    return {
      success: true,
      message: "Entity created successfully",
      data: entity,
    }
  } catch (error) {
    console.error("createMyEntityAction error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create entity",
    }
  }
}

// UPDATE ACTION
export async function updateMyEntityAction(
  id: string,
  data: UpdateMyEntityInput
): Promise<ActionResult<MyEntity>> {
  try {
    await requirePermission("module-name", "update")

    const session = await auth()
    const userId = session?.user?.id || "system"

    const entity = await myEntityService.updateMyEntity(id, {
      ...data,
      updatedBy: userId,
    })

    // Real-time
    await getPusher().trigger("private-global", "entity_updated", {
      action: "entity_updated",
      entity,
    })

    // Cache
    revalidatePath("/module-name")
    revalidatePath(`/module-name/${id}`)

    return {
      success: true,
      message: "Entity updated successfully",
      data: entity,
    }
  } catch (error) {
    console.error("updateMyEntityAction error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update entity",
    }
  }
}

// DELETE ACTION
export async function deleteMyEntityAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission("module-name", "delete")

    await myEntityService.deleteMyEntity(id)

    // Real-time
    await getPusher().trigger("private-global", "entity_deleted", {
      action: "entity_deleted",
      entityId: id,
    })

    // Cache
    revalidatePath("/module-name")

    return {
      success: true,
      message: "Entity deleted successfully",
      data: { id },
    }
  } catch (error) {
    console.error("deleteMyEntityAction error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete entity",
    }
  }
}
```

File: `lib/features/[feature]/actions/index.ts`

```typescript
export * from "./[feature].actions"
```

### Step 5: Create Pages & Components (60 min)

**List Page**: `app/(dashboard)/[module]/[feature]/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { DataTable } from "@/components/list-page/DataTable"
import { PageLoading } from "@/components/list-page/PageLoading"
import { usePusher } from "@/lib/realtime/use-pusher"
import { listMyEntitiesAction } from "@/lib/features/[feature]/actions"

export default function MyEntityListPage() {
  const [entities, setEntities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data
  useEffect(() => {
    loadEntities()
  }, [])

  async function loadEntities() {
    const result = await listMyEntitiesAction()
    if (result.success) {
      setEntities(result.data.data)
    }
    setIsLoading(false)
  }

  // Real-time updates
  usePusher("private-global", (event) => {
    if (event.type === "entity_created" || event.type === "entity_updated") {
      loadEntities() // Refresh list
    }
  })

  if (isLoading) return <PageLoading />

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1>My Entities</h1>
        <Link href="/module/feature/new" className="btn btn-primary">
          Create New
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={entities}
        onEdit={(row) => router.push(`/module/feature/${row.id}/edit`)}
        onDelete={(row) => handleDelete(row.id)}
      />
    </div>
  )
}
```

**Form Component**: `components/my-entity/MyEntityForm.tsx`

```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  CreateMyEntityInput,
  UpdateMyEntityInput,
  MyEntity,
} from "@/lib/features/[feature]/types"
import {
  createMyEntityAction,
  updateMyEntityAction,
} from "@/lib/features/[feature]/actions"
import { FormField } from "@/components/form-fields/FormField"

interface MyEntityFormProps {
  entity?: MyEntity
  isLoading?: boolean
}

export function MyEntityForm({ entity, isLoading }: MyEntityFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateMyEntityInput | UpdateMyEntityInput>({
    resolver: zodResolver(CreateMyEntityInput), // ← Use correct schema
    defaultValues: entity || {},
  })

  async function onSubmit(data: CreateMyEntityInput | UpdateMyEntityInput) {
    try {
      setIsSubmitting(true)

      const result = entity
        ? await updateMyEntityAction(entity.id, data)
        : await createMyEntityAction(data as CreateMyEntityInput)

      if (result.success) {
        toast.success(result.message)
        router.push("/module/feature")
      } else {
        toast.error(result.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Name"
        {...form.register("name")}
        error={form.formState.errors.name?.message}
      />

      <FormField
        label="Description"
        type="textarea"
        {...form.register("description")}
        error={form.formState.errors.description?.message}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? "Saving..." : entity ? "Update" : "Create"}
      </button>
    </form>
  )
}
```

### Step 6: Add Tests (20 min)

**Repository Tests**: `tests/unit/features/[feature]/[feature].repository.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import * as myEntityRepository from "@/lib/features/[feature]/repositories"

describe("[Feature] Repository", () => {
  let testEntityId: string

  it("should create entity", async () => {
    const entity = await myEntityRepository.createMyEntity({
      name: "Test Entity",
      status: "DRAFT",
    })
    expect(entity.id).toBeDefined()
    testEntityId = entity.id
  })

  it("should get entity by id", async () => {
    const entity = await myEntityRepository.getMyEntityById(testEntityId)
    expect(entity?.name).toBe("Test Entity")
  })

  it("should update entity", async () => {
    const updated = await myEntityRepository.updateMyEntity(testEntityId, {
      name: "Updated",
    })
    expect(updated.name).toBe("Updated")
  })

  it("should delete entity", async () => {
    await myEntityRepository.deleteMyEntity(testEntityId)
    const entity = await myEntityRepository.getMyEntityById(testEntityId)
    expect(entity).toBeNull()
  })
})
```

**Action Tests**: `tests/unit/features/[feature]/[feature].actions.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest"
import { requirePermission } from "@/lib/permissions"
import { createMyEntityAction } from "@/lib/features/[feature]/actions"

vi.mock("@/lib/permissions")
vi.mock("@/lib/realtime")
vi.mock("next/cache")

describe("[Feature] Actions", () => {
  it("should deny create without permission", async () => {
    vi.mocked(requirePermission).mockRejectedValueOnce(
      new Error("Insufficient permissions")
    )

    const result = await createMyEntityAction({
      name: "Test",
    })

    expect(result.success).toBe(false)
  })

  it("should create entity with permission", async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce(undefined)

    const result = await createMyEntityAction({
      name: "Test",
    })

    expect(result.success).toBe(true)
  })
})
```

---

## 🔐 PERMISSION CHECKLIST

**Every action must start with**:

```typescript
await requirePermission("[module-name]", "[action]")
// module: customers, events, knowledge, training, users, etc.
// action: read, create, update, delete
```

**Define permissions in database**:
- Create a `Role` with `RolePermission` entries
- Add to seed data in `prisma/seeds/`

---

## 📝 IMPORTANT PATTERNS

### Error Handling
```typescript
try {
  // Do work
} catch (error) {
  console.error("actionName error:", error)
  return {
    success: false,
    message: error instanceof Error ? error.message : "Unknown error",
  }
}
```

### Imports (ALWAYS ABSOLUTE)
```typescript
// ✅ CORRECT
import { myFunction } from "@/lib/features/[feature]/actions"
import type { MyType } from "@/lib/features/[feature]/types"

// ❌ WRONG
import { myFunction } from "../actions"
```

### Real-time Updates
```typescript
// After mutation
await getPusher().trigger("private-global", "entity_created", {
  action: "entity_created",
  entity,
})
```

### Cache Invalidation
```typescript
// After mutation
revalidatePath("/module/feature")
revalidatePath(`/module/feature/${id}`)
```

### Component with Action
```typescript
"use client"

async function handleCreate(data) {
  const result = await createMyEntityAction(data)
  if (result.success) {
    toast.success(result.message)
  } else {
    toast.error(result.message)
  }
}
```

---

## 🧪 TEST & VALIDATE

Before pushing:

```bash
# Type checking
yarn check-types

# Unit tests
yarn test:unit features/[feature]

# Format
yarn format lib/features/[feature]

# Lint
yarn lint lib/features/[feature]
```

---

## 📚 REFERENCES

1. **Events** (most complete): `lib/features/events/`
2. **Knowledge** (rich editor): `lib/features/knowledge/`
3. **Contacts** (linked data): `lib/features/contacts/`
4. **Users** (permissions): `lib/features/users/`

Copy their structure, adapt for your feature.

---

## 🎯 FINAL CHECKLIST

- [ ] Created all 4 files: types, repository, service, actions
- [ ] Created list page with table + create button
- [ ] Created form page with validation
- [ ] Created detail page with edit/delete
- [ ] Added permission checks to all actions
- [ ] Added Pusher real-time trigger on mutations
- [ ] Added cache invalidation on mutations
- [ ] Added error handling + toast notifications
- [ ] Added loading states + error boundaries
- [ ] Wrote unit tests for repository, service, actions
- [ ] All imports use `@/lib/...` (no relative)
- [ ] Barrel exports in place (index.ts files)
- [ ] `yarn check-types` passes
- [ ] `yarn test:unit` passes
- [ ] Docs updated in `DETAILED_ACTION_ITEMS.md`

**Ready for review!** 🚀


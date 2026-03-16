# Page Consistency Standard

All page.tsx files must follow this standard structure and order.

## File Structure Template

```tsx
// 1. IMPORTS (in this order)
// 1a. React/Next.js core
import { Suspense } from "react";
import { notFound } from "next/navigation";  // if needed
import Link from "next/link";               // if needed
import { useRouter } from "next/navigation"; // if needed

// 1b. Local components (from ./components)
import { EntityList } from "./components";
import { EntityForm } from "./components";

// 1c. Shared UI components
import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { Button } from "@/components/ui/button";

// 1d. Utilities and config
import { generateCrudMetadata } from "@/lib/utils/metadata";
import { getEntityById } from "@/lib/features/entity/actions";
import { SITE_CONFIG } from "@/lib";

// 2. EXPORT DECLARATIONS (in this strict order)
export const dynamic = "force-dynamic";     // or "auto", "force-static", etc.
export const metadata = generateCrudMetadata("EntityName");
export const revalidate = 0;                // or other number, or false

// 3. TYPE DEFINITIONS (if needed)
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

// 4. COMPONENT (async Server Component)
export default async function EntityPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; search?: string }> 
}) {
  // 4a. Await and parse searchParams
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || "";

  // 4b. Fetch data
  const result = await getEntityById(id);
  if (!result.success || !result.data) {
    notFound();
  }

  // 4c. JSX Structure
  return (
    <div className="space-y-6">
      {/* Header section */}
      <ListPageHeader
        title="Entity"
        description="Manage entities"
        searchPlaceholder="Search..."
        addButtonLabel="Add Entity"
        addButtonHref="/entities/new"
        search={search}
        clearHref={search ? "/entities" : undefined}
      />

      {/* Main content with Suspense */}
      <Suspense fallback={<PageLoading />}>
        <EntityList
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
```

## Key Rules

### 1. Export Order (CRITICAL)
Always use this exact order:
1. `export const dynamic = "force-dynamic";`
2. `export const metadata = generateCrudMetadata("EntityName");`
3. `export const revalidate = 0;`

**Do NOT deviate from this order.**

### 2. Import Organization
```
React/Next.js → Local components → UI components → Utilities/Config
```

### 3. Search Parameters
All list/filter pages MUST use:
```tsx
searchParams: Promise<{ page?: string; search?: string; [other]?: string }>
```

Always await first:
```tsx
const params = await searchParams;
const page = params.page ? parseInt(params.page) : 1;
```

### 4. JSX Structure
List pages:
```tsx
<div className="space-y-6">
  <ListPageHeader ... />
  <Suspense fallback={<PageLoading />}>
    <EntityList ... />
  </Suspense>
</div>
```

Detail/Edit pages:
```tsx
<div className="container mx-auto py-6">
  <div className="mb-6 flex items-center justify-between">
    <h1>Title</h1>
    <Link href="...">{action}</Link>
  </div>
  <Suspense fallback={<PageLoading />}>
    <EntityForm ... />
  </Suspense>
</div>
```

### 5. Metadata
ALL pages must have:
```tsx
export const metadata = generateCrudMetadata("EntityName");
```

### 6. Suspense Pattern
Always use for async components:
```tsx
<Suspense fallback={<PageLoading />}>
  <AsyncComponent />
</Suspense>
```

### 7. Error Handling
Use notFound() for missing resources:
```tsx
if (!result.success || !result.data) {
  notFound();
}
```

## Checklist for New Pages

- [ ] Imports in correct order
- [ ] Exports in correct order: dynamic, metadata, revalidate
- [ ] Metadata uses generateCrudMetadata()
- [ ] searchParams is typed as Promise
- [ ] searchParams is awaited before use
- [ ] Component is async function
- [ ] Function name ends with "Page"
- [ ] Suspense wraps async content
- [ ] JSX wrapped in appropriate div
- [ ] Proper error handling (notFound)

## Pages to Fix (Priority: High)
- [ ] All pages with export order: dynamic, revalidate, metadata → should be dynamic, metadata, revalidate
- [ ] Settings page: searchParams type missing Promise
- [ ] AI-chat page: missing Suspense fallback

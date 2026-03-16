# RAG Settings Actions - Developer Reference

## Overview

RAG controls are now managed through the settings system using two server actions.

---

## Server Actions

### 1. `toggleRAGAction(enable: boolean)`

Toggle RAG feature on or off with automatic permission and cache handling.

**Parameters:**
- `enable: boolean` - `true` to enable RAG, `false` to disable

**Returns:**
```typescript
ActionResult {
  success: boolean;
  message: string;
  data?: { rag_enabled: string };
}
```

**Example:**
```typescript
"use server";

import { toggleRAGAction } from "@/lib/features/settings/actions/settings-actions";

// Enable RAG
const result = await toggleRAGAction(true);
if (result.success) {
  console.log(result.message); // "RAG enabled successfully"
}

// Disable RAG
const result = await toggleRAGAction(false);
if (result.success) {
  console.log(result.message); // "RAG disabled successfully"
}
```

**Permissions Required:**
- Module: `"settings"`
- Action: `"update"`

**What It Does:**
1. Checks user permission (`requirePermission("settings", "update")`)
2. Calls `enableRAG()` or `disableRAG()` from `@/lib/ai`
3. Invalidates settings cache
4. Returns result with message

---

### 2. `getRAGStatusAction()`

Check if RAG is currently enabled.

**Parameters:** None

**Returns:**
```typescript
ActionResult<{ enabled: boolean }> {
  success: boolean;
  message: string;
  data: { enabled: boolean };
}
```

**Example:**
```typescript
"use server";

import { getRAGStatusAction } from "@/lib/features/settings/actions/settings-actions";

const result = await getRAGStatusAction();
if (result.success) {
  console.log(result.data.enabled); // true or false
  console.log(result.message); // "RAG is currently enabled/disabled"
}
```

**Permissions Required:**
- Module: `"settings"`
- Action: `"read"`

**What It Does:**
1. Checks user permission (`requirePermission("settings", "read")`)
2. Calls `isRagEnabled()` from `@/lib/ai`
3. Returns current status in `data.enabled`

---

## Usage in Components

### Client Component with Server Action

```typescript
"use client";

import { useState } from "react";
import { toggleRAGAction, getRAGStatusAction } from "@/lib/features/settings/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Sonner } from "sonner";

export function RAGSettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const result = await toggleRAGAction(!enabled);
      if (result.success) {
        setEnabled(!enabled);
        Sonner.success(result.message);
      } else {
        Sonner.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleToggle} disabled={loading}>
      {enabled ? "Disable" : "Enable"} RAG
    </Button>
  );
}
```

### Server Component

```typescript
import { getRAGStatusAction } from "@/lib/features/settings/actions/settings-actions";

export default async function RAGStatusPage() {
  const result = await getRAGStatusAction();

  if (!result.success) {
    return <div>Error: {result.message}</div>;
  }

  return (
    <div>
      RAG is {result.data.enabled ? "enabled" : "disabled"}
    </div>
  );
}
```

### Settings Page Integration

```typescript
"use client";

import { toggleRAGAction } from "@/lib/features/settings/actions/settings-actions";
import { SettingsSection } from "@/components/settings/section";

export function RAGSettingsSection() {
  return (
    <SettingsSection
      title="RAG (Vector Search + LLM)"
      description="Enable semantic search and LLM-powered features"
    >
      <RAGToggle onToggle={toggleRAGAction} />
    </SettingsSection>
  );
}
```

---

## Error Handling

Both actions return `ActionResult` with error details:

```typescript
const result = await toggleRAGAction(true);

if (!result.success) {
  // Handle error gracefully
  console.error(`Failed to toggle RAG: ${result.message}`);
  
  // Show user-friendly message
  Sonner.error(result.message);
}
```

**Common Errors:**
- `"Insufficient permissions"` - User lacks required permission
- `"Failed to enable RAG"` - Database or service error
- `"Failed to get RAG status"` - Database access error

---

## Import Paths

```typescript
// Recommended: Import from actions barrel
import { toggleRAGAction, getRAGStatusAction } from "@/lib/features/settings/actions/settings-actions";

// Or directly from settings module
import { toggleRAGAction } from "@/lib/features/settings/actions";
```

---

## Related

- **Settings Service**: `lib/features/settings/services/settings-service.ts`
- **Settings Types**: `lib/features/settings/types/`
- **RAG Feature Flag**: `lib/ai/rag-feature-flag.ts`
- **Permissions**: `lib/permissions.ts`

---

## Type Definitions

```typescript
// From lib/utils.ts
interface ActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// RAG Status
type RAGStatus = { enabled: boolean };
```

---

## Testing

### Unit Test Example

```typescript
import { test, expect, vi } from "vitest";
import { toggleRAGAction } from "@/lib/features/settings/actions/settings-actions";

// Mock permissions
vi.mock("@/lib/permissions", () => ({
  requirePermission: vi.fn(),
}));

test("toggleRAGAction enables RAG", async () => {
  const result = await toggleRAGAction(true);
  
  expect(result.success).toBe(true);
  expect(result.message).toContain("enabled");
});
```

### Integration Test Example

```typescript
import { test, expect } from "@playwright/test";

test("RAG toggle in settings", async ({ page }) => {
  await page.goto("/settings");
  
  // Toggle RAG
  await page.click("button:has-text('Enable RAG')");
  
  // Verify success message
  await expect(page.locator("text=RAG enabled")).toBeVisible();
});
```

---

## Performance Notes

- **Cache**: Settings cache (5 min) automatically cleared after toggle
- **Permission Check**: ~1ms (cached after first check)
- **Database**: Simple key/value update (~10ms)

---

## Security

✅ **Permission checked** on every call  
✅ **Input validated** (boolean type enforced)  
✅ **Error handling** prevents info leaks  
✅ **Cache safe** (invalidation on update)  
✅ **No direct DB access** (through service layer)

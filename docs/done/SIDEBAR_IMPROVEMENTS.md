# Sidebar Menu Improvements

## Overview

Sidebar menu logic đã được refactor để xử lý active state một cách đơn giản, dễ bảo trì hơn. Các cấp menu parent giờ tự động expand khi child item được chọn, và active state tracking hoạt động chính xác với:

- Routes hard-coded (e.g., `/dashboard`)
- Routes với query parameters (e.g., `/customers?type=customer`)
- Dynamic routes (e.g., `/knowledge/[id]`)

## Key Changes

### 1. Updated `SidebarMenuItem` Interface

File: `lib/config/sidebar-menu.ts`

Thêm property `matchPaths` để cấu hình flexible route matching:

```typescript
export interface SidebarMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  display?: boolean;
  permission?: {
    module: string;
    action: string;
  };
  children?: SidebarMenuItem[];
  /**
   * Additional path patterns to match for active state.
   * Useful for items with query parameters or dynamic paths.
   * Examples: ["/?type=blog", "/post/categories?type=blog"]
   */
  matchPaths?: string[];
}
```

**Benefit**: Cho phép cấu hình chính xác nơi một menu item được coi là active, không phải sử dụng logic phức tạp.

### 2. New Utility Functions

File: `lib/utils/sidebar-active.ts`

Tạo ra 3 hàm helper để kiểm tra active state:

```typescript
/**
 * Kiểm tra xem một menu item có active hay không
 * - Exact match với href (bao gồm query)
 * - Check matchPaths patterns
 * - Cho parent items (#href), check recursive children
 * - Cho leaf items, check pathname match
 */
export function isMenuItemActive(
  item: SidebarMenuItem,
  pathname: string,
  searchParams?: string
): boolean

/**
 * Kiểm tra xem một menu item hoặc bất kỳ child của nó có active hay không
 * Dùng cho parent items để quyết định expand state
 */
export function isMenuItemOrChildActive(
  item: SidebarMenuItem,
  pathname: string,
  searchParams?: string
): boolean

/**
 * Helper function để match path với pattern
 * Hỗ trợ wildcard (*) trong patterns
 */
function isPathMatching(path: string, pattern: string): boolean
```

**Benefits**:

- Logic clear, dễ test
- Reusable across components
- Wildcard support (`*`) cho flexible matching
- Xử lý query parameters chính xác

### 3. Refactored `Sidebar` Component

File: `components/dashboard/sidebar.tsx`

**Changes**:

- **Removed complex inline active checking logic** - Thay vào là gọi `isMenuItemActive()`
- **Added automatic parent expansion** - Khi child item active, parent tự động expand
- **Cleaner code** - Giảm duplicate logic, tách concerns

```typescript
// Auto-expand parent items when their child is active
useEffect(() => {
  const newExpandedItems: string[] = [];

  const findActiveParents = (items: SidebarMenuItem[], depth = 0) => {
    for (const item of items) {
      if (
        item.children &&
        item.children.some((child) =>
          isMenuItemOrChildActive(child, pathname, searchParamsStr)
        )
      ) {
        newExpandedItems.push(item.href);
      }

      if (item.children) {
        findActiveParents(item.children, depth + 1);
      }
    }
  };

  findActiveParents(SIDEBAR_MENU_ITEMS);

  // Merge with saved expanded items (don't override user's manual expand/collapse)
  const saved = localStorage.getItem("sidebar-expanded");
  const savedExpanded = saved ? JSON.parse(saved) : [];
  const merged = Array.from(new Set([...newExpandedItems, ...savedExpanded]));
  setExpandedItems(merged);
}, [pathname, searchParamsStr]);
```

### 4. Updated Menu Item Configurations

File: `lib/config/sidebar-menu.ts`

Thêm `matchPaths` cho tất cả parent items với nested children:

```typescript
// Events x Education
{
  label: "Sponsors",
  href: "/post?type=sponsor",
  matchPaths: ["/?type=sponsor", "/post?type=sponsor", "/post/categories?type=sponsor", "/post/tags?type=sponsor"],
  children: [...]
}

// Business Ecosystem
{
  label: "Business Ecosystem",
  href: "#customers",
  matchPaths: ["/customers", "/customers?type=*", "/contacts", "/opportunities", "/engagements", "/interactions"],
  children: [
    {
      label: "Customers",
      href: "/customers?type=customer",
      matchPaths: ["/customers", "/customers?type=customer"],
    },
    // ...
  ]
}

// Knowledge Base
{
  label: "Knowledge Base",
  href: "#training-knowledge",
  matchPaths: ["/course", "/knowledge", "/knowledge/categories", "/knowledge/tags"],
  children: [...]
}
```

## How It Works

### Active State Detection Flow

1. **User navigates to a path** (e.g., `/post/categories?type=sponsor`)

2. **`isMenuItemActive()` checks**:
   - Exact href match? → `true`
   - Match any `matchPaths` pattern? → `true`
   - For parent items (#href), recursively check children
   - For leaf items, check if pathname starts with item path
   - → Return active state

3. **`isMenuItemOrChildActive()` checks**:
   - Is item itself active? → `true`
   - Is any child active? → `true` (used to determine if parent should expand)

4. **Sidebar component**:
   - Uses `isMenuItemActive()` to highlight current item
   - Uses `isMenuItemOrChildActive()` to auto-expand parents
   - Merges auto-expanded items with user's manual expand/collapse preferences

### Example: Sponsors Section

URL: `/post/categories?type=sponsor`

1. Component checks "Sponsors" parent item
2. Calls `isMenuItemActive()` with `matchPaths: ["/?type=sponsor", "/post?type=sponsor", "/post/categories?type=sponsor", "/post/tags?type=sponsor"]`
3. Pattern `/post/categories?type=sponsor` matches current path
4. Sponsors parent becomes active & expands
5. Child "Categories" item highlighted

## Configuration Guide

### Adding matchPaths

For items with query parameters:

```typescript
{
  label: "My Item",
  href: "/my-path?type=value",
  matchPaths: [
    "/my-path?type=value",
    "/my-path/subpath?type=value"
  ],
  children: [...]
}
```

Using wildcards:

```typescript
matchPaths: [
  "/customers",        // exact match
  "/customers?type=*"  // any type parameter
]
```

For parent items with multiple child paths:

```typescript
{
  label: "Parent",
  href: "#parent",
  matchPaths: ["/path1", "/path2", "/path3"],
  children: [...]
}
```

## Benefits Over Previous Implementation

| Aspect | Before | After |
| --- | --- | --- |
| **Logic Clarity** | Complex nested conditions in component | Clean utility functions |
| **Maintainability** | Hard to add new routes | Easy: just add to `matchPaths` |
| **Query Parameters** | Inconsistent handling | Explicit configuration |
| **Parent Expansion** | Manual logic per item | Automatic based on active child |
| **Code Duplication** | Multiple active checks | Single source of truth |
| **Testing** | Hard to test inline logic | Easy to unit test utilities |
| **Type Safety** | Implicit patterns | Explicit interface properties |

## Testing

To verify active state behavior:

1. Navigate to `/customers` → "Customers" under "Business Ecosystem" should be active, parent expanded
2. Navigate to `/customers?type=partner` → "Partners" should be active
3. Navigate to `/knowledge/123` → "Articles" under "Knowledge Base" should be active
4. Navigate to `/post/categories?type=blog` → "Categories" under "Blog" should be active
5. Manually expand/collapse items → State saved to localStorage and preserved after navigation

## Future Improvements

1. **Path pattern language**: Support more advanced patterns (regex, optional segments)
2. **Breadcrumb integration**: Use same active detection for breadcrumbs
3. **Analytics**: Track which menu items users access most
4. **Keyboard shortcuts**: Jump to menu sections via shortcuts


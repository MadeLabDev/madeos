# Testing Strategy - MADE Laboratory

## 📋 Tổng quan

Hệ thống testing được thiết kế để:
- ✅ Phát hiện lỗi sớm trước khi deploy
- ✅ Đảm bảo tính năng mới không phá vỡ code cũ
- ✅ Tự động hóa kiểm tra chất lượng code
- ✅ Tạo documentation sống cho code
- ✅ Tăng tự tin khi refactor

## 🗂️ Cấu trúc thư mục Test

```
tests/
├── unit/                    # Pure function tests (nhanh nhất, chạy đầu tiên)
│   ├── lib/                # Helpers, utilities
│   └── features/           # Business logic
├── integration/            # Service + Database tests
│   └── features/           # Services với DB
├── api/                    # Server Actions tests
│   └── orders/             # API endpoints
└── e2e/                    # End-to-end tests (chậm nhất)
    ├── auth/               # Authentication flows
    ├── orders/             # Order workflows
    └── dashboard/          # UI interactions

scripts/
├── test-setup.ts           # Global test config
├── seed-test-data.ts       # Test database seeding
└── run-tests.sh            # Run all tests
```

## 🚀 Cài đặt Testing Framework

### 1. Cài dependencies
```bash
# Testing tools
yarn add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
yarn add -D @testing-library/user-event happy-dom
yarn add -D @playwright/test
yarn add -D msw @vitejs/plugin-react

# Install Playwright browsers
npx playwright install
```

### 2. Thêm scripts vào package.json
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:api": "vitest run tests/api",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "bash scripts/run-tests.sh"
  }
}
```

## 📝 Quy trình Testing (QUAN TRỌNG!)

### Khi thêm tính năng MỚI:

#### Bước 1: Viết test TRƯỚC (TDD)
```bash
# Tạo test file
touch tests/unit/features/orders/order-validator.test.ts

# Viết test mô tả hành vi mong muốn
# Test sẽ FAIL vì chưa có code implementation
```

#### Bước 2: Implement code cho đến khi test PASS
```bash
# Watch mode để test tự động chạy khi save
yarn test:watch

# Implement feature
# Test tự động chạy và báo kết quả
```

#### Bước 3: Refactor (giữ test vẫn PASS)
```bash
# Cải thiện code mà không làm test fail
# Test đảm bảo hành vi không thay đổi
```

#### Bước 4: Chạy full test suite trước commit
```bash
yarn test:all
```

### Loại test cần viết:

#### ✅ Unit Tests (Bắt buộc cho mọi function)
- **Khi nào**: Pure functions, helpers, validators
- **File**: `tests/unit/features/[feature]/[file].test.ts`
- **Example**:
```typescript
// tests/unit/lib/permissions.test.ts
describe('hasPermission', () => {
  it('should return true when user has permission', () => {
    const user = { permissions: { orders: ['read'] } };
    expect(hasPermission(user, 'orders', 'read')).toBe(true);
  });
});
```

#### ✅ Integration Tests (Bắt buộc cho Services)
- **Khi nào**: Services tương tác với database
- **File**: `tests/integration/features/[feature]/[service].test.ts`
- **Example**:
```typescript
// tests/integration/features/orders/order-service.test.ts
describe('OrderService', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  it('should create order with valid data', async () => {
    const order = await orderService.create(validData);
    expect(order).toBeDefined();
  });
});
```

#### ✅ API Tests (Bắt buộc cho Server Actions)
- **Khi nào**: Mọi Server Action
- **File**: `tests/api/[feature]/[action].test.ts`
- **Example**:
```typescript
// tests/api/orders/create-order.test.ts
describe('createOrder Server Action', () => {
  it('should reject when user lacks permission', async () => {
    const result = await createOrder(data);
    expect(result.success).toBe(false);
  });
});
```

#### ✅ E2E Tests (Bắt buộc cho critical flows)
- **Khi nào**: User workflows quan trọng
- **File**: `tests/e2e/[feature]/[flow].spec.ts`
- **Example**:
```typescript
// tests/e2e/orders/create-order.spec.ts
test('should create order successfully', async ({ page }) => {
  await page.goto('/orders/new');
  await page.fill('input[name="customer"]', 'Test Customer');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/orders\/\d+/);
});
```

## 🎯 Test Coverage Requirements

### Ngưỡng tối thiểu (Enforced by CI):
```typescript
{
  lines: 80%,        // 80% dòng code được test
  functions: 80%,    // 80% functions được test
  branches: 75%,     // 75% branches (if/else) được test
  statements: 80%    // 80% statements được test
}
```

### Kiểm tra coverage:
```bash
yarn test:coverage

# Xem report HTML
open coverage/index.html
```

## 🐛 Bug Prevention Workflow

### Khi phát hiện bug trong production:

1. **Viết test tái hiện bug** (test phải FAIL)
```typescript
it('should handle edge case that caused bug #123', async () => {
  // Setup data gây ra bug
  const bugData = { quantity: -10 };
  
  // Test phải throw error hoặc handle correctly
  await expect(orderService.create(bugData)).rejects.toThrow('Invalid quantity');
});
```

2. **Fix bug** cho đến khi test PASS

3. **Document bug pattern** trong copilot-instructions.md
```markdown
### Common Bug: Negative Quantity
**When**: User inputs negative numbers
**Solution**: Always validate quantity > 0
**Test**: tests/unit/features/orders/order-validator.test.ts:45
```

4. **Add similar test cases** để prevent related bugs
```typescript
it('should reject zero quantity', () => { ... });
it('should reject non-numeric quantity', () => { ... });
it('should reject extremely large quantity', () => { ... });
```

## 📊 Test Execution Commands

### Development (Watch mode)
```bash
# Tự động chạy test khi file thay đổi
yarn test:watch

# UI mode (interactive)
yarn test:ui
```

### Quick Checks
```bash
# Chỉ unit tests (nhanh ~5s)
yarn test:unit

# Unit + Integration (~30s)
yarn test:integration

# API tests (~20s)
yarn test:api
```

### Full Test Suite
```bash
# All tests (unit + integration + api + e2e)
yarn test:all

# Với coverage report
yarn test:coverage
```

### E2E Tests
```bash
# Run all E2E tests
yarn test:e2e

# UI mode (debug visually)
yarn test:e2e:ui

# Specific file only
npx playwright test tests/e2e/dashboard/navigation.spec.ts
```

## 🔍 Debugging Tests

### Vitest (Unit/Integration/API)
```typescript
// Add breakpoint
it('should do something', () => {
  debugger; // ← Code sẽ pause tại đây
  expect(result).toBe(true);
});

// Run with debugger
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

### Playwright (E2E)
```bash
# Debug mode (step through tests)
npx playwright test --debug

# UI mode (visual debugging)
yarn test:e2e:ui

# Show browser (headful mode)
npx playwright test --headed
```

## ❌ Anti-Patterns (TRÁNH!)

### ❌ Viết test SAU khi implement
```typescript
// WRONG: Code đã xong, viết test để "cho có"
// Test này chỉ confirm code đang chạy, không catch bugs
```

### ✅ Viết test TRƯỚC khi implement
```typescript
// CORRECT: Test mô tả requirements
// Implementation phải satisfy test
```

---

### ❌ Test implementation details
```typescript
// WRONG: Test internal functions
it('should call _privateMethod', () => {
  expect(service._privateMethod).toHaveBeenCalled();
});
```

### ✅ Test public API behavior
```typescript
// CORRECT: Test user-facing behavior
it('should create order successfully', () => {
  const order = await service.createOrder(data);
  expect(order.status).toBe('PENDING');
});
```

---

### ❌ Duplicate test setup
```typescript
// WRONG: Copy/paste setup trong mọi test file
beforeEach(() => {
  const user = { id: '1', name: 'Test' };
  const order = { id: '1', status: 'PENDING' };
});
```

### ✅ Shared test helpers
```typescript
// CORRECT: Reusable test utilities
import { createTestUser, createTestOrder } from '@/scripts/test-helpers';

beforeEach(async () => {
  const user = await createTestUser();
  const order = await createTestOrder(user.id);
});
```

---

### ❌ Tests depend on execution order
```typescript
// WRONG: Test 2 fails nếu Test 1 không chạy trước
it('test 1 - create user', () => {
  globalUser = createUser();
});

it('test 2 - update user', () => {
  updateUser(globalUser); // ← Depends on test 1
});
```

### ✅ Independent tests
```typescript
// CORRECT: Mỗi test tự setup data
it('should create user', () => {
  const user = createUser();
  expect(user).toBeDefined();
});

it('should update user', () => {
  const user = createUser(); // ← Independent setup
  const updated = updateUser(user);
  expect(updated).toBeDefined();
});
```

## 🚨 CI/CD Integration

### GitHub Actions (Future)
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn test:all
      - name: Check coverage
        run: |
          if [ $(yarn test:coverage --reporter=json | jq '.total.lines.pct') -lt 80 ]; then
            echo "❌ Coverage below 80%"
            exit 1
          fi
```

## 📚 Best Practices

### 1. Test Naming Convention
```typescript
// Pattern: should [expected behavior] when [condition]
describe('OrderService', () => {
  describe('createOrder', () => {
    it('should create order when data is valid', () => { ... });
    it('should throw error when customer not found', () => { ... });
    it('should validate quantity when creating order', () => { ... });
  });
});
```

### 2. AAA Pattern (Arrange-Act-Assert)
```typescript
it('should calculate total correctly', () => {
  // Arrange: Setup test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 20, quantity: 1 },
  ];

  // Act: Execute the function
  const total = calculateTotal(items);

  // Assert: Verify result
  expect(total).toBe(40);
});
```

### 3. Test Edge Cases
```typescript
describe('validateQuantity', () => {
  it('should accept positive numbers', () => { ... });
  it('should reject negative numbers', () => { ... });
  it('should reject zero', () => { ... });
  it('should reject null', () => { ... });
  it('should reject undefined', () => { ... });
  it('should reject non-numeric strings', () => { ... });
  it('should handle extremely large numbers', () => { ... });
});
```

## 🎓 Tài liệu tham khảo

- **Vitest**: https://vitest.dev
- **Testing Library**: https://testing-library.com/react
- **Playwright**: https://playwright.dev
- **TDD Guide**: https://martinfowler.com/bliki/TestDrivenDevelopment.html

---

**QUAN TRỌNG**: Mỗi PR/commit PHẢI chạy `yarn test:all` và pass 100% trước khi merge!

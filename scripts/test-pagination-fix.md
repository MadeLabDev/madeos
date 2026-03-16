# Test Pagination Cache Fix

## Issue
- Thay đổi `media_pagesize` trong settings từ 12 → 5
- Nhưng media page vẫn hiển thị 12 items thay vì 5 items
- Nguyên nhân: Cache pagination không được update khi settings thay đổi

## Fix Applied
### File: `lib/features/settings/services/settings-service.ts`

1. **Import thêm cache functions:**
   ```typescript
   import { setPaginationCache } from '@/lib/config/pagination';
   import { setMediaMaxFileSize } from '@/lib/config/media';
   ```

2. **Update hàm `updateSetting`:**
   - Khi update single setting, kiểm tra key
   - Nếu key là `pagesize`, `media_pagesize`, hoặc `media_max_file_size_mb`
   - Gọi `setPaginationCache()` hoặc `setMediaMaxFileSize()` để refresh cache

3. **Update hàm `updateSystemSettings`:**
   - Sau khi batch update settings vào database
   - Gọi `setPaginationCache()` với các giá trị mới
   - Cache sẽ merge với default values

4. **Update hàm `updateMediaSettings`:**
   - Sau khi batch update media settings vào database
   - Nếu `media_max_file_size_mb` thay đổi, gọi `setMediaMaxFileSize()` để refresh cache

## Testing Steps

### Step 1: Kiểm tra settings hiện tại
1. Vào `/settings`
2. Tab "Pagination"
3. Ghi chú giá trị hiện tại của "Media Page Size" (ví dụ: 12)

### Step 2: Kiểm tra media list
1. Vào `/medias`
2. Đếm số items trên trang hiện tại
3. Phải bằng với "Media Page Size" từ settings

### Step 3: Thay đổi settings
1. Vào `/settings`
2. Đổi "Media Page Size" từ 12 → 5
3. Lưu changes

### Step 4: Kiểm tra kết quả
1. Vào `/medias`
2. Reload page
3. **Expected:** Hiển thị chỉ 5 items trên trang (không phải 12)
4. Pagination counter phải hiển thị: "Showing 1 to 5 of X media files"

## Expected Result
✅ Phân trang sẽ hoạt động chính xác:
- Thay đổi settings → Cache được update ngay
- Media page hiển thị đúng số lượng items
- Pagination counter chính xác

## Additional Notes
- Cache được update ở 3 điểm:
  1. App startup: `initializeSettings()` 
  2. Single setting update: `updateSetting()`
  3. Batch system settings: `updateSystemSettings()`
  4. Batch media settings: `updateMediaSettings()`

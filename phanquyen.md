# Hướng dẫn chuyển đổi giữa chế độ Test và Phân quyền

## Trạng thái hiện tại
- ✅ **Đang dùng**: Trang Test không phân quyền (`/test/proposals`)
- Tất cả user đăng nhập đều vào chung 1 trang test

---

## Khi muốn BẬT phân quyền (quay lại bình thường)

### Bước 1: Sửa file `frontend/src/pages/LoginPage.tsx`

Tìm đoạn code này (khoảng dòng 16-32):

```tsx
// TẠM THỜI: Redirect tất cả vào trang test
const getDashboardByRole = (_role: string): string => {
  // Khi muốn quay lại phân quyền, uncomment code bên dưới:
  // switch (role) {
  //   case 'admin':
  //     return ROUTES.DASHBOARD
  //   case 'it':
  //     return ROUTES.IT_DASHBOARD
  //   case 'director':
  //     return ROUTES.DIRECTOR_DASHBOARD
  //   case 'user':
  //     return ROUTES.USER_DASHBOARD
  //   default:
  //     return ROUTES.DASHBOARD
  // }
  
  // TẠM THỜI: Vào trang test không phân quyền
  return ROUTES.TEST_PROPOSALS
}
```

**Đổi thành:**

```tsx
// Redirect theo role
const getDashboardByRole = (role: string): string => {
  switch (role) {
    case 'admin':
      return ROUTES.DASHBOARD
    case 'it':
      return ROUTES.IT_DASHBOARD
    case 'director':
      return ROUTES.DIRECTOR_DASHBOARD
    case 'user':
      return ROUTES.USER_DASHBOARD
    default:
      return ROUTES.DASHBOARD
  }
}
```

### Bước 2 (Tùy chọn): Xóa trang Test

Nếu muốn xóa hoàn toàn trang test:

1. **Xóa file:** `frontend/src/pages/TestProposalPage.tsx`

2. **Sửa file `frontend/src/App.tsx`** - Xóa đoạn này:
```tsx
// Test page (no role restriction)
import TestProposalPage from '@/pages/TestProposalPage'
```
và xóa route:
```tsx
{/* Test page - requires login but any role */}
<Route
  path={ROUTES.TEST_PROPOSALS}
  element={
    <ProtectedRoute allowedRoles={['admin', 'it', 'director', 'user']}>
      <TestProposalPage />
    </ProtectedRoute>
  }
/>
```

3. **Sửa file `frontend/src/constants/index.ts`** - Xóa dòng:
```tsx
TEST_PROPOSALS: '/test/proposals',
```

---

## Khi muốn TẮT phân quyền (dùng trang Test)

### Sửa file `frontend/src/pages/LoginPage.tsx`

Đổi hàm `getDashboardByRole` thành:

```tsx
const getDashboardByRole = (_role: string): string => {
  return ROUTES.TEST_PROPOSALS
}
```

---

## Tổng quan các trang

| Trang | URL | Role | Mô tả |
|-------|-----|------|-------|
| Test | `/test/proposals` | Tất cả | Gom chung mọi chức năng |
| Admin | `/dashboard` | admin | Quản lý hệ thống |
| IT | `/it/proposals` | it | Xử lý đề xuất |
| Director | `/director/proposals` | director | Duyệt đề xuất |
| User | `/user/proposals` | user | Tạo & xem đề xuất |

---

## Lưu ý
- Trang Test vẫn yêu cầu đăng nhập
- Các route phân quyền (`/it`, `/director`, `/user`) vẫn hoạt động song song
- Chỉ khác redirect sau khi login

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  
  // Admin routes
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/dashboard',
  WAREHOUSES: '/dashboard/warehouses',
  DEPARTMENTS: '/dashboard/departments',
  EMPLOYEES: '/dashboard/employees',
  STOCK_IN: '/dashboard/stock-in',
  STOCK_OUT: '/dashboard/stock-out',
  PROPOSALS: '/dashboard/proposals',
  USERS: '/dashboard/users',
  NCC: '/dashboard/ncc',
  HANGHOA: '/dashboard/hanghoa',
  TRANSFER: '/dashboard/transfer',
  REPORT: '/dashboard/report',
  
  // IT routes
  IT_DASHBOARD: '/it',
  IT_PROPOSALS: '/it/proposals',
  IT_WAREHOUSES: '/it/warehouses',
  IT_DEPARTMENTS: '/it/departments',
  IT_EMPLOYEES: '/it/employees',
  IT_HANGHOA: '/it/hanghoa',
  IT_NCC: '/it/ncc',
  IT_STOCK_IN: '/it/stock-in',
  IT_STOCK_OUT: '/it/stock-out',
  IT_TRANSFER: '/it/transfer',
  IT_REPORT: '/it/report',
  
  // Director routes
  DIRECTOR_DASHBOARD: '/director',
  DIRECTOR_PROPOSALS: '/director/proposals',
  DIRECTOR_REPORT: '/director/report',
  
  // User routes
  USER_DASHBOARD: '/user',
  USER_MY_COMPUTER: '/user/my-computer',
  USER_PROPOSALS: '/user/proposals',
  USER_PROPOSALS_NEW: '/user/proposals/new',
}

export const AUTH_TOKEN_KEY = 'QuanLyMayTinhDB_token'
export const AUTH_USER_KEY = 'QuanLyMayTinhDB_user'

export const ROLES = {
  ADMIN: 'admin',
  IT: 'it',
  DIRECTOR: 'director',
  USER: 'user',
}

// Proposal status labels (trạng thái chung - legacy)
export const PROPOSAL_STATUS = {
  pending: { label: 'Chờ xử lý', color: 'yellow' },
  it_processing: { label: 'IT đang xử lý', color: 'blue' },
  waiting_approval: { label: 'Chờ GĐ duyệt', color: 'purple' },
  it_approved: { label: 'IT duyệt', color: 'cyan' },
  approved: { label: 'GĐ duyệt', color: 'green' },
  rejected: { label: 'GĐ từ chối', color: 'red' },
  it_rejected: { label: 'IT từ chối', color: 'red' },
  completed: { label: 'Hoàn thành', color: 'green' },
}

// Trạng thái IT riêng (hiển thị cho User)
export const IT_STATUS = {
  pending: { label: 'Chờ tiếp nhận', color: 'yellow' },
  received: { label: 'Đã tiếp nhận', color: 'blue' },
  processing: { label: 'Đang xử lý', color: 'blue' },
  confirmed: { label: 'Đã xác nhận', color: 'cyan' },
  approved: { label: 'IT đã duyệt', color: 'green' },
  forwarded: { label: 'Chuyển GĐ', color: 'purple' },
  rejected: { label: 'IT từ chối', color: 'red' },
  completed: { label: 'Hoàn thành', color: 'green' },
}

// Trạng thái GĐ riêng (hiển thị cho User)
export const GD_STATUS = {
  none: { label: '-', color: 'gray' },  // IT duyệt nhỏ, không cần GĐ
  pending: { label: 'Chờ duyệt', color: 'yellow' },
  processing: { label: 'Đang xem xét', color: 'blue' },
  approved: { label: 'Đã duyệt', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
}

// Priority levels
export const PRIORITY_LEVELS = {
  'Thấp': { label: 'Thấp', color: 'gray' },
  'Trung bình': { label: 'Trung bình', color: 'yellow' },
  'Cao': { label: 'Cao', color: 'orange' },
  'Khẩn cấp': { label: 'Khẩn cấp', color: 'red' },
}

// Proposal type labels
export const PROPOSAL_TYPES = {
  nang_cap: 'Nâng cấp',
  sua_chua: 'Sửa chữa',
  mua_moi: 'Mua mới',
  thay_the: 'Thay thế',
}
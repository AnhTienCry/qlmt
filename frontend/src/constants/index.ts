export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
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
  
  // Director routes
  DIRECTOR_DASHBOARD: '/director',
  DIRECTOR_PROPOSALS: '/director/proposals',
  
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

// Proposal status labels
export const PROPOSAL_STATUS = {
  pending: { label: 'Chờ xử lý', color: 'yellow' },
  it_processing: { label: 'IT đang xử lý', color: 'blue' },
  waiting_approval: { label: 'Chờ GĐ duyệt', color: 'purple' },
  approved: { label: 'Đã duyệt', color: 'green' },
  rejected: { label: 'GĐ từ chối', color: 'red' },
  it_rejected: { label: 'IT từ chối', color: 'red' },
  completed: { label: 'Hoàn thành', color: 'green' },
}

// Proposal type labels
export const PROPOSAL_TYPES = {
  nang_cap: 'Nâng cấp',
  sua_chua: 'Sửa chữa',
  mua_moi: 'Mua mới',
  thay_the: 'Thay thế',
}
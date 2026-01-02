// Route paths constants for easy import and usage throughout the app
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COMPUTERS: '/dashboard/computers',
} as const

// Helper functions to generate dynamic routes with IDs
export const generatePath = {
  computerDetail: (id: string | number) => `/dashboard/computers/${id}`,
} as const

// Navigation menu items for admin sidebar
export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Máy tính', path: ROUTES.COMPUTERS, icon: 'computer' },
] as const

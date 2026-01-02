import { Routes, Route } from 'react-router-dom'
import { DashboardLayout, UserLayout, ITLayout, DirectorLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { ROUTES } from '@/constants'

// Admin pages
import AdminDashboardPage from '@/pages/admin/DashboardPage'
import WarehousesPage from '@/pages/admin/WarehousesPage'
import DepartmentsPage from '@/pages/admin/DepartmentsPage'
import EmployeesPage from '@/pages/admin/EmployeesPage'
import StockInPage from '@/pages/admin/StockInPage'
import StockOutPage from '@/pages/admin/StockOutPage'
import NCCPage from '@/pages/admin/NCCPage'
import HangHoaPage from '@/pages/admin/HangHoaPage'
import TransferPage from '@/pages/admin/TransferPage'
import UsersPage from '@/pages/admin/UsersPage'
import ReportPage from '@/pages/admin/ReportPage'
import ChangePasswordPage from '@/pages/ChangePasswordPage'

// User pages
import UserDashboardPage from '@/pages/user/DashboardPage'
import MyComputerPage from '@/pages/user/MyComputerPage'
import UserProposalsPage from '@/pages/user/ProposalsPage'
import NewProposalPage from '@/pages/user/NewProposalPage'

// IT pages
import ITDashboardPage from '@/pages/it/DashboardPage'
import ITProposalsPage from '@/pages/it/ProposalsPage'

// Director pages
import DirectorDashboardPage from '@/pages/director/DashboardPage'
import DirectorProposalsPage from '@/pages/director/ProposalsPage'

function App() {
  return (
    <Routes>
      {/* Homepage - Landing page */}
      <Route path="/" element={<HomePage />} />
      
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      
      {/* Change password - requires authentication */}
      <Route
        path={ROUTES.CHANGE_PASSWORD}
        element={
          <ProtectedRoute allowedRoles={['admin', 'it', 'director', 'user']}>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      
      {/* ========== ADMIN ROUTES ========== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="ncc" element={<NCCPage />} />
        <Route path="hanghoa" element={<HangHoaPage />} />
        <Route path="stock-in" element={<StockInPage />} />
        <Route path="stock-out" element={<StockOutPage />} />
        <Route path="transfer" element={<TransferPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      
      {/* ========== IT ROUTES ========== */}
      <Route
        path="/it"
        element={
          <ProtectedRoute allowedRoles={['admin', 'it']}>
            <ITLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ITDashboardPage />} />
        <Route path="proposals" element={<ITProposalsPage />} />
      </Route>
      
      {/* ========== DIRECTOR ROUTES ========== */}
      <Route
        path="/director"
        element={
          <ProtectedRoute allowedRoles={['admin', 'director']}>
            <DirectorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DirectorDashboardPage />} />
        <Route path="proposals" element={<DirectorProposalsPage />} />
      </Route>
      
      {/* ========== USER ROUTES ========== */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['admin', 'it', 'director', 'user']}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboardPage />} />
        <Route path="my-computer" element={<MyComputerPage />} />
        <Route path="proposals" element={<UserProposalsPage />} />
        <Route path="proposals/new" element={<NewProposalPage />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

import { Router } from 'express'
import authRoutes from './modules/auth/auth.routes'
import warehouseRoutes from './modules/warehouse/warehouse.routes'
import departmentRoutes from './modules/department/department.routes'
import employeeRoutes from './modules/employee/employee.routes'
import stockRoutes from './modules/stock/stock.routes'
import agentRoutes from './modules/agent/agent.routes'
import proposalRoutes from './modules/proposal/proposal.routes'
import nccRoutes from './modules/ncc/ncc.routes'
import hanghoaRoutes from './modules/hanghoa/hanghoa.routes'
import transferRoutes from './modules/transfer/transfer.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/warehouses', warehouseRoutes)
router.use('/departments', departmentRoutes)
router.use('/employees', employeeRoutes)
router.use('/stock', stockRoutes)           // Nhập hàng, Xuất hàng
router.use('/agent', agentRoutes)
router.use('/proposals', proposalRoutes)

// Routes theo yêu cầu thầy
router.use('/ncc', nccRoutes)               // Nhà cung cấp
router.use('/hanghoa', hanghoaRoutes)       // Hàng hóa
router.use('/transfer', transferRoutes)     // Điều chuyển

export default router

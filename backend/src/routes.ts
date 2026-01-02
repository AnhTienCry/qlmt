import { Router } from 'express'
import authRoutes from './modules/auth/auth.routes'
import computerRoutes from './modules/computer/computer.routes'
import warehouseRoutes from './modules/warehouse/warehouse.routes'
import departmentRoutes from './modules/department/department.routes'
import employeeRoutes from './modules/employee/employee.routes'
import stockRoutes from './modules/stock/stock.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/computers', computerRoutes)
router.use('/warehouses', warehouseRoutes)
router.use('/departments', departmentRoutes)
router.use('/employees', employeeRoutes)
router.use('/stock', stockRoutes)

export default router

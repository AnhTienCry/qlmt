import { Router } from 'express'
import { hanghoaController } from './hanghoa.controller'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

// Tất cả routes cần đăng nhập
router.use(authMiddleware)

// GET /api/hanghoa/stats - Thống kê (đặt trước /:id)
router.get('/stats', hanghoaController.getStats)

// GET /api/hanghoa - Lấy danh sách hàng hóa
router.get('/', hanghoaController.getAll)

// GET /api/hanghoa/:id - Lấy chi tiết
router.get('/:id', hanghoaController.getById)

// POST /api/hanghoa - Thêm mới
router.post('/', hanghoaController.create)

// PUT /api/hanghoa/:id - Cập nhật
router.put('/:id', hanghoaController.update)

// DELETE /api/hanghoa/:id - Xóa
router.delete('/:id', hanghoaController.delete)

export default router

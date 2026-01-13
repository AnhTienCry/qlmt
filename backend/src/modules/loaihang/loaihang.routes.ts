import { Router } from 'express'
import { loaihangController } from './loaihang.controller'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

// Tất cả routes cần đăng nhập
router.use(authMiddleware)

// GET /api/loaihang - Lấy danh sách loại hàng (có thể search)
router.get('/', loaihangController.getAll)

// GET /api/loaihang/:id - Lấy chi tiết loại hàng
router.get('/:id', loaihangController.getById)

// POST /api/loaihang - Thêm loại hàng mới
router.post('/', loaihangController.create)

// PUT /api/loaihang/:id - Cập nhật loại hàng
router.put('/:id', loaihangController.update)

// DELETE /api/loaihang/:id - Xóa loại hàng
router.delete('/:id', loaihangController.delete)

export default router

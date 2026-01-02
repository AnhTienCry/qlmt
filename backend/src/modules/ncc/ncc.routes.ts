import { Router } from 'express'
import { nccController } from './ncc.controller'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

// Tất cả routes cần đăng nhập
router.use(authMiddleware)

// GET /api/ncc - Lấy danh sách NCC (có thể search)
router.get('/', nccController.getAll)

// GET /api/ncc/:id - Lấy chi tiết NCC
router.get('/:id', nccController.getById)

// POST /api/ncc - Thêm NCC mới
router.post('/', nccController.create)

// PUT /api/ncc/:id - Cập nhật NCC
router.put('/:id', nccController.update)

// DELETE /api/ncc/:id - Xóa NCC
router.delete('/:id', nccController.delete)

export default router

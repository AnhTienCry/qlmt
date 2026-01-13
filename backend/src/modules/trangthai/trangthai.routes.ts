import { Router } from 'express'
import { trangthaiController } from './trangthai.controller'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

// Tất cả routes cần đăng nhập
router.use(authMiddleware)

// GET /api/trangthai - Lấy danh sách trạng thái (có thể search)
router.get('/', trangthaiController.getAll)

// GET /api/trangthai/:id - Lấy chi tiết trạng thái
router.get('/:id', trangthaiController.getById)

// POST /api/trangthai - Thêm trạng thái mới
router.post('/', trangthaiController.create)

// PUT /api/trangthai/:id - Cập nhật trạng thái
router.put('/:id', trangthaiController.update)

// DELETE /api/trangthai/:id - Xóa trạng thái
router.delete('/:id', trangthaiController.delete)

export default router

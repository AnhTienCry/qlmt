import { Router } from 'express'
import stockController from './stock.controller'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

router.use(authMiddleware)

// ==================== BÁO CÁO ====================
router.get('/baocao/nhapxuatton', stockController.getBaoCaoNhapXuatTon)

// ==================== NHẬP HÀNG ====================
router.get('/nhaphang/sophieu', stockController.getSoPhieuNhap)
router.get('/nhaphang', stockController.getAllNhapHang)
router.get('/nhaphang/:id', stockController.getNhapHangById)
router.post('/nhaphang', stockController.createNhapHang)
router.delete('/nhaphang/:id', stockController.deleteNhapHang)

// ==================== XUẤT HÀNG ====================
router.get('/xuathang/sophieu', stockController.getSoPhieuXuat)
router.get('/xuathang', stockController.getAllXuatHang)
router.get('/xuathang/:id', stockController.getXuatHangById)
router.post('/xuathang', stockController.createXuatHang)
router.delete('/xuathang/:id', stockController.deleteXuatHang)

export default router

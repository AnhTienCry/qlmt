import { Router } from 'express'
import stockController from './stock.controller'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

router.use(authMiddleware)

// ==================== THIẾT BỊ CỦA USER ====================
router.get('/my-devices', stockController.getThietBiCuaUser)

// ==================== BÁO CÁO ====================
router.get('/baocao/nhapxuatton', stockController.getBaoCaoNhapXuatTon)
router.get('/baocao/nhapkho', stockController.getBaoCaoNhapKho)
router.get('/baocao/xuatkho', stockController.getBaoCaoXuatKho)
router.get('/baocao/theodoi/:maHang', stockController.getTheoDoiThietBi)
router.get('/baocao/thietbi-nhanvien/:maNV', stockController.getThietBiCuaNhanVien)
router.get('/baocao/thietbi-sudung', stockController.getBaoCaoThietBiSuDung)

// ==================== TỒN KHO ====================
router.get('/tonkho/:maHang/:maKho', stockController.getTonKho)
router.get('/hangdaxuat', stockController.getHangDaXuat)

// ==================== NHẬP HÀNG ====================
router.get('/nhaphang/sophieu', stockController.getSoPhieuNhap)
router.get('/nhaphang', stockController.getAllNhapHang)
router.get('/nhaphang/:id', stockController.getNhapHangById)
router.post('/nhaphang', stockController.createNhapHang)
router.put('/nhaphang/:id', stockController.updateNhapHang)
router.delete('/nhaphang/:id', stockController.deleteNhapHang)

// ==================== XUẤT HÀNG ====================
router.get('/xuathang/sophieu', stockController.getSoPhieuXuat)
router.get('/xuathang', stockController.getAllXuatHang)
router.get('/xuathang/:id', stockController.getXuatHangById)
router.post('/xuathang', stockController.createXuatHang)
router.put('/xuathang/:id', stockController.updateXuatHang)
router.delete('/xuathang/:id', stockController.deleteXuatHang)

export default router

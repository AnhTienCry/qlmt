import { Router } from 'express'
import { db } from '../../config/database'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

router.use(authMiddleware)

// Lấy danh sách phòng ban
router.get('/', async (req, res) => {
  try {
    const result = await db.query<any>(`
      SELECT MaPB as maPB, TenPB as tenPB, MoTa as moTa, NgayTao as ngayTao
      FROM PhongBan ORDER BY TenPB
    `)
    res.json({ success: true, data: result.recordset })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Thêm phòng ban
router.post('/', async (req, res) => {
  try {
    const { tenPB, moTa } = req.body
    if (!tenPB) {
      return res.status(400).json({ error: 'Tên phòng ban là bắt buộc' })
    }
    
    const result = await db.query<any>(`
      INSERT INTO PhongBan (TenPB, MoTa)
      OUTPUT INSERTED.MaPB as maPB, INSERTED.TenPB as tenPB, INSERTED.MoTa as moTa
      VALUES (@tenPB, @moTa)
    `, { tenPB, moTa: moTa || null })
    
    res.json({ success: true, data: result.recordset[0] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Cập nhật phòng ban
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { tenPB, moTa } = req.body
    
    if (!tenPB) {
      return res.status(400).json({ error: 'Tên phòng ban là bắt buộc' })
    }
    
    const result = await db.query<any>(`
      UPDATE PhongBan SET TenPB = @tenPB, MoTa = @moTa, NgayCapNhat = SYSUTCDATETIME()
      OUTPUT INSERTED.MaPB as maPB, INSERTED.TenPB as tenPB, INSERTED.MoTa as moTa
      WHERE MaPB = @id
    `, { id: parseInt(id), tenPB, moTa: moTa || null })
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy phòng ban' })
    }
    
    res.json({ success: true, data: result.recordset[0] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Xóa phòng ban
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Kiểm tra có nhân viên không
    const checkResult = await db.query<any>(`SELECT COUNT(*) as count FROM NhanVien WHERE MaPB = @id`, { id: parseInt(id) })
    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({ error: 'Không thể xóa phòng ban đang có nhân viên' })
    }
    
    await db.query(`DELETE FROM PhongBan WHERE MaPB = @id`, { id: parseInt(id) })
    res.json({ success: true, message: 'Đã xóa phòng ban' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

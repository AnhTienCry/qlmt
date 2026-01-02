import { Router } from 'express'
import { db } from '../../config/database'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

router.use(authMiddleware)

// Lấy danh sách kho
router.get('/', async (req, res) => {
  try {
    const result = await db.query<any>(`
      SELECT MaKho as maKho, ISNULL(MaKhoText, CAST(MaKho AS NVARCHAR)) as maKhoText, 
             TenKho as tenKho, DiaChi as diaChi, NgayTao as ngayTao
      FROM Kho ORDER BY TenKho
    `)
    res.json({ success: true, data: result.recordset })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Thêm kho mới
router.post('/', async (req, res) => {
  try {
    const { MaKhoText, TenKho, DiaChi } = req.body
    if (!MaKhoText) {
      return res.status(400).json({ error: 'Mã kho là bắt buộc' })
    }
    if (!TenKho) {
      return res.status(400).json({ error: 'Tên kho là bắt buộc' })
    }
    
    // Kiểm tra mã kho đã tồn tại chưa
    const checkExist = await db.query<any>(`
      SELECT MaKho FROM Kho WHERE MaKhoText = @MaKhoText
    `, { MaKhoText })
    
    if (checkExist.recordset.length > 0) {
      return res.status(400).json({ error: 'Mã kho đã tồn tại' })
    }
    
    const result = await db.query<any>(`
      INSERT INTO Kho (MaKhoText, TenKho, DiaChi)
      OUTPUT INSERTED.MaKho as maKho, INSERTED.MaKhoText as maKhoText, INSERTED.TenKho as tenKho, INSERTED.DiaChi as diaChi
      VALUES (@MaKhoText, @TenKho, @DiaChi)
    `, { MaKhoText, TenKho, DiaChi: DiaChi || null })
    
    res.json({ success: true, data: result.recordset[0] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Cập nhật kho
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { MaKhoText, TenKho, DiaChi } = req.body
    
    if (!MaKhoText) {
      return res.status(400).json({ error: 'Mã kho là bắt buộc' })
    }
    if (!TenKho) {
      return res.status(400).json({ error: 'Tên kho là bắt buộc' })
    }
    
    // Kiểm tra mã kho đã tồn tại ở kho khác chưa
    const checkExist = await db.query<any>(`
      SELECT MaKho FROM Kho WHERE MaKhoText = @MaKhoText AND MaKho != @id
    `, { MaKhoText, id: parseInt(id) })
    
    if (checkExist.recordset.length > 0) {
      return res.status(400).json({ error: 'Mã kho đã tồn tại' })
    }
    
    const result = await db.query<any>(`
      UPDATE Kho SET MaKhoText = @MaKhoText, TenKho = @TenKho, DiaChi = @DiaChi, NgayCapNhat = SYSUTCDATETIME()
      OUTPUT INSERTED.MaKho as maKho, INSERTED.MaKhoText as maKhoText, INSERTED.TenKho as tenKho, INSERTED.DiaChi as diaChi
      WHERE MaKho = @id
    `, { id: parseInt(id), MaKhoText, TenKho, DiaChi: DiaChi || null })
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy kho' })
    }
    
    res.json({ success: true, data: result.recordset[0] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Xóa kho
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Kiểm tra kho có hàng hóa không
    const checkResult = await db.query<any>(`
      SELECT COUNT(*) as count FROM HangHoa WHERE MaKho = @id
    `, { id: parseInt(id) })
    
    if (checkResult.recordset[0]?.count > 0) {
      return res.status(400).json({ error: 'Không thể xóa kho đang có hàng hóa' })
    }
    
    // Kiểm tra kho có phiếu nhập không
    const checkNhap = await db.query<any>(`
      SELECT COUNT(*) as count FROM NhapHang WHERE MaKho = @id
    `, { id: parseInt(id) })
    
    if (checkNhap.recordset[0]?.count > 0) {
      return res.status(400).json({ error: 'Không thể xóa kho đang có phiếu nhập hàng' })
    }
    
    await db.query(`DELETE FROM Kho WHERE MaKho = @id`, { id: parseInt(id) })
    res.json({ success: true, message: 'Đã xóa kho' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

import { Router } from 'express'
import { db } from '../../config/database'
import { authMiddleware } from '../../shared/middlewares/auth'
import bcrypt from 'bcryptjs'

const router = Router()

router.use(authMiddleware)

// Hàm lấy ký tự viết tắt từ tên phòng ban
function getPhongBanPrefix(tenPB: string | null): string {
  if (!tenPB) return 'nv'
  
  const ten = tenPB.toLowerCase()
  
  // Map tên phòng ban -> viết tắt
  if (ten.includes('giám đốc') || ten.includes('giam doc') || ten.includes('director') || ten.includes('lãnh đạo')) return 'gd'
  if (ten.includes('it') || ten.includes('công nghệ') || ten.includes('cong nghe') || ten.includes('kỹ thuật')) return 'it'
  if (ten.includes('kế toán') || ten.includes('ke toan') || ten.includes('tài chính')) return 'kt'
  if (ten.includes('nhân sự') || ten.includes('nhan su') || ten.includes('hr')) return 'ns'
  if (ten.includes('kinh doanh') || ten.includes('sales') || ten.includes('bán hàng')) return 'kd'
  if (ten.includes('marketing') || ten.includes('truyền thông')) return 'mk'
  if (ten.includes('hành chính') || ten.includes('hanh chinh')) return 'hc'
  if (ten.includes('sản xuất') || ten.includes('san xuat')) return 'sx'
  if (ten.includes('kho') || ten.includes('vật tư')) return 'kho'
  
  return 'nv' // Mặc định
}

// Hàm lấy role từ tên phòng ban
function getRoleFromPhongBan(tenPB: string | null): string {
  if (!tenPB) return 'user'
  
  const ten = tenPB.toLowerCase()
  
  if (ten.includes('giám đốc') || ten.includes('giam doc') || ten.includes('director') || ten.includes('lãnh đạo')) return 'director'
  if (ten.includes('it') || ten.includes('công nghệ') || ten.includes('cong nghe') || ten.includes('kỹ thuật')) return 'it'
  
  return 'user'
}

// Lấy danh sách nhân viên
router.get('/', async (req, res) => {
  try {
    const result = await db.query<any>(`
      SELECT nv.MaNV as maNV, nv.TenNV as tenNV, nv.Email as email, 
             nv.SoDienThoai as soDienThoai, nv.MaPB as maPB, pb.TenPB as tenPB,
             nv.NgayBDLV as ngayBDLV, nv.NgayTao as ngayTao
      FROM NhanVien nv
      LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
      ORDER BY nv.TenNV
    `)
    res.json({ success: true, data: result.recordset })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Thêm nhân viên - tạo tài khoản với mật khẩu mặc định
router.post('/', async (req, res) => {
  try {
    const { tenNV, email, soDienThoai, maPB, ngayBDLV } = req.body
    if (!tenNV) {
      return res.status(400).json({ error: 'Tên nhân viên là bắt buộc' })
    }
    
    // Lấy tên phòng ban nếu có maPB
    let tenPB: string | null = null
    if (maPB) {
      const pbResult = await db.query<any>(`SELECT TenPB FROM PhongBan WHERE MaPB = @maPB`, { maPB: parseInt(maPB) })
      tenPB = pbResult.recordset[0]?.TenPB || null
    }
    
    // 1. Tạo nhân viên
    const result = await db.query<any>(`
      INSERT INTO NhanVien (TenNV, Email, SoDienThoai, MaPB, NgayBDLV)
      OUTPUT INSERTED.MaNV as maNV, INSERTED.TenNV as tenNV, 
             INSERTED.Email as email, INSERTED.SoDienThoai as soDienThoai,
             INSERTED.NgayBDLV as ngayBDLV
      VALUES (@tenNV, @email, @soDienThoai, @maPB, @ngayBDLV)
    `, { 
      tenNV, 
      email: email || null, 
      soDienThoai: soDienThoai || null,
      maPB: maPB ? parseInt(maPB) : null,
      ngayBDLV: ngayBDLV || null
    })
    
    const newEmployee = result.recordset[0]
    
    // 2. Tạo username theo ký tự phòng ban + MaNV
    const prefix = getPhongBanPrefix(tenPB)
    const username = `${prefix}${newEmployee.maNV}`
    const matKhauMacDinh = `${username}@123`
    const hashedPassword = await bcrypt.hash(matKhauMacDinh, 10)
    
    // 3. Lấy role theo phòng ban
    const role = getRoleFromPhongBan(tenPB)
    
    // 4. Tạo tài khoản user
    await db.query(`
      INSERT INTO Users (Username, PasswordHash, Role, MaNV, IsActive)
      VALUES (@username, @password, @role, @maNV, 1)
    `, {
      username,
      password: hashedPassword,
      role,
      maNV: newEmployee.maNV
    })
    
    res.json({ 
      success: true, 
      data: {
        ...newEmployee,
        tenPB,
        username,
        matKhauMacDinh,
        role
      },
      message: `Tạo nhân viên thành công. Tài khoản: ${username}, Mật khẩu: ${matKhauMacDinh}, Role: ${role}`
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Cập nhật nhân viên
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { tenNV, email, soDienThoai, maPB, ngayBDLV } = req.body
    
    if (!tenNV) {
      return res.status(400).json({ error: 'Tên nhân viên là bắt buộc' })
    }
    
    const result = await db.query<any>(`
      UPDATE NhanVien 
      SET TenNV = @tenNV, Email = @email, SoDienThoai = @soDienThoai, 
          MaPB = @maPB, NgayBDLV = @ngayBDLV, NgayCapNhat = SYSUTCDATETIME()
      OUTPUT INSERTED.MaNV as maNV, INSERTED.TenNV as tenNV, 
             INSERTED.Email as email, INSERTED.SoDienThoai as soDienThoai,
             INSERTED.NgayBDLV as ngayBDLV
      WHERE MaNV = @id
    `, { 
      id: parseInt(id), 
      tenNV, 
      email: email || null, 
      soDienThoai: soDienThoai || null,
      maPB: maPB ? parseInt(maPB) : null,
      ngayBDLV: ngayBDLV || null
    })
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' })
    }
    
    res.json({ success: true, data: result.recordset[0] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Reset mật khẩu nhân viên về mặc định
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params
    
    // Kiểm tra nhân viên tồn tại
    const nvResult = await db.query<any>(`SELECT MaNV, TenNV FROM NhanVien WHERE MaNV = @id`, { id: parseInt(id) })
    if (nvResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' })
    }
    
    const maNV = nvResult.recordset[0].MaNV
    const username = `nv${maNV}`
    const matKhauMoi = `nv${maNV}@123`
    const hashedPassword = await bcrypt.hash(matKhauMoi, 10)
    
    // Kiểm tra user đã tồn tại chưa
    const userResult = await db.query<any>(`SELECT UserId FROM Users WHERE MaNV = @maNV`, { maNV })
    
    if (userResult.recordset.length > 0) {
      // Cập nhật mật khẩu
      await db.query(`UPDATE Users SET PasswordHash = @password WHERE MaNV = @maNV`, {
        password: hashedPassword,
        maNV
      })
    } else {
      // Tạo user mới
      await db.query(`
        INSERT INTO Users (Username, PasswordHash, Role, MaNV, IsActive)
        VALUES (@username, @password, 'user', @maNV, 1)
      `, {
        username,
        password: hashedPassword,
        maNV
      })
    }
    
    res.json({ 
      success: true, 
      data: {
        username,
        matKhauMoi
      },
      message: `Reset mật khẩu thành công. Tài khoản: ${username}, Mật khẩu: ${matKhauMoi}`
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Xóa nhân viên
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Kiểm tra nhân viên có đang sử dụng hàng hóa không
    const checkHH = await db.query<any>(`SELECT COUNT(*) as count FROM HangHoa WHERE MaNV_DangDung = @id`, { id: parseInt(id) })
    if (checkHH.recordset[0]?.count > 0) {
      return res.status(400).json({ error: 'Không thể xóa nhân viên đang sử dụng hàng hóa' })
    }
    
    // Xóa tài khoản user trước (nếu có)
    await db.query(`DELETE FROM Users WHERE MaNV = @id`, { id: parseInt(id) })
    
    // Xóa nhân viên
    await db.query(`DELETE FROM NhanVien WHERE MaNV = @id`, { id: parseInt(id) })
    res.json({ success: true, message: 'Đã xóa nhân viên và tài khoản liên quan' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

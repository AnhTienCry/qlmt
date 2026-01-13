import { db } from '../../config/database'
import { LoaiHang, CreateLoaiHangRequest, UpdateLoaiHangRequest } from './loaihang.types'

export const loaihangService = {
  // Lấy tất cả loại hàng
  async getAll(): Promise<LoaiHang[]> {
    const result = await db.query<LoaiHang>(`
      SELECT * FROM LoaiHang ORDER BY TenLoai
    `)
    return result.recordset
  },

  // Lấy loại hàng theo ID
  async getById(id: number): Promise<LoaiHang | null> {
    const result = await db.query<LoaiHang>(`
      SELECT * FROM LoaiHang WHERE MaLoai = @id
    `, { id })
    return result.recordset[0] || null
  },

  // Tìm kiếm loại hàng
  async search(keyword: string): Promise<LoaiHang[]> {
    const result = await db.query<LoaiHang>(`
      SELECT * FROM LoaiHang 
      WHERE TenLoai LIKE @keyword 
         OR MaLoaiText LIKE @keyword
         OR MoTa LIKE @keyword
      ORDER BY TenLoai
    `, { keyword: `%${keyword}%` })
    return result.recordset
  },

  // Thêm loại hàng mới
  async create(data: CreateLoaiHangRequest): Promise<LoaiHang> {
    // Kiểm tra MaLoaiText đã tồn tại chưa
    const checkCode = await db.query<LoaiHang>(`
      SELECT MaLoai FROM LoaiHang WHERE MaLoaiText = @MaLoaiText
    `, { MaLoaiText: data.MaLoaiText })
    
    if (checkCode.recordset.length > 0) {
      throw new Error('Mã loại hàng đã tồn tại')
    }

    const result = await db.query<LoaiHang>(`
      INSERT INTO LoaiHang (MaLoaiText, TenLoai, MoTa, NgayTao)
      OUTPUT INSERTED.*
      VALUES (@MaLoaiText, @TenLoai, @MoTa, GETDATE())
    `, {
      MaLoaiText: data.MaLoaiText,
      TenLoai: data.TenLoai,
      MoTa: data.MoTa || null
    })
    return result.recordset[0]
  },

  // Cập nhật loại hàng
  async update(id: number, data: UpdateLoaiHangRequest): Promise<LoaiHang | null> {
    const fields: string[] = []
    const params: Record<string, any> = { id }

    if (data.MaLoaiText !== undefined) {
      // Kiểm tra MaLoaiText đã tồn tại ở loại khác chưa
      const checkCode = await db.query<LoaiHang>(`
        SELECT MaLoai FROM LoaiHang WHERE MaLoaiText = @MaLoaiText AND MaLoai != @id
      `, { MaLoaiText: data.MaLoaiText, id })
      
      if (checkCode.recordset.length > 0) {
        throw new Error('Mã loại hàng đã tồn tại')
      }
      fields.push('MaLoaiText = @MaLoaiText')
      params.MaLoaiText = data.MaLoaiText
    }

    if (data.TenLoai !== undefined) {
      fields.push('TenLoai = @TenLoai')
      params.TenLoai = data.TenLoai
    }

    if (data.MoTa !== undefined) {
      fields.push('MoTa = @MoTa')
      params.MoTa = data.MoTa
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    const result = await db.query<LoaiHang>(`
      UPDATE LoaiHang 
      SET ${fields.join(', ')}
      OUTPUT INSERTED.*
      WHERE MaLoai = @id
    `, params)

    return result.recordset[0] || null
  },

  // Xóa loại hàng
  async delete(id: number): Promise<boolean> {
    // Kiểm tra có hàng hóa đang dùng loại này không
    const checkUsage = await db.query<{count: number}>(`
      SELECT COUNT(*) as count FROM HangHoa WHERE LoaiHang = (
        SELECT MaLoaiText FROM LoaiHang WHERE MaLoai = @id
      )
    `, { id })
    
    if (checkUsage.recordset[0].count > 0) {
      throw new Error('Không thể xóa loại hàng đang được sử dụng')
    }

    const result = await db.query(`
      DELETE FROM LoaiHang WHERE MaLoai = @id
    `, { id })

    return result.rowsAffected[0] > 0
  }
}

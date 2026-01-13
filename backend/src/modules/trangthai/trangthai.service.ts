import { db } from '../../config/database'
import { TrangThai, CreateTrangThaiRequest, UpdateTrangThaiRequest } from './trangthai.types'

export const trangthaiService = {
  // Lấy tất cả trạng thái
  async getAll(): Promise<TrangThai[]> {
    const result = await db.query<TrangThai>(`
      SELECT * FROM TrangThai ORDER BY TenTrangThai
    `)
    return result.recordset
  },

  // Lấy trạng thái theo ID
  async getById(id: number): Promise<TrangThai | null> {
    const result = await db.query<TrangThai>(`
      SELECT * FROM TrangThai WHERE MaTrangThai = @id
    `, { id })
    return result.recordset[0] || null
  },

  // Tìm kiếm trạng thái
  async search(keyword: string): Promise<TrangThai[]> {
    const result = await db.query<TrangThai>(`
      SELECT * FROM TrangThai 
      WHERE TenTrangThai LIKE @keyword 
         OR MaTrangThaiText LIKE @keyword
         OR MoTa LIKE @keyword
      ORDER BY TenTrangThai
    `, { keyword: `%${keyword}%` })
    return result.recordset
  },

  // Thêm trạng thái mới
  async create(data: CreateTrangThaiRequest): Promise<TrangThai> {
    // Kiểm tra MaTrangThaiText đã tồn tại chưa
    const checkCode = await db.query<TrangThai>(`
      SELECT MaTrangThai FROM TrangThai WHERE MaTrangThaiText = @MaTrangThaiText
    `, { MaTrangThaiText: data.MaTrangThaiText })
    
    if (checkCode.recordset.length > 0) {
      throw new Error('Mã trạng thái đã tồn tại')
    }

    const result = await db.query<TrangThai>(`
      INSERT INTO TrangThai (MaTrangThaiText, TenTrangThai, MauSac, MoTa, NgayTao)
      OUTPUT INSERTED.*
      VALUES (@MaTrangThaiText, @TenTrangThai, @MauSac, @MoTa, GETDATE())
    `, {
      MaTrangThaiText: data.MaTrangThaiText,
      TenTrangThai: data.TenTrangThai,
      MauSac: data.MauSac || null,
      MoTa: data.MoTa || null
    })
    return result.recordset[0]
  },

  // Cập nhật trạng thái
  async update(id: number, data: UpdateTrangThaiRequest): Promise<TrangThai | null> {
    const fields: string[] = []
    const params: Record<string, any> = { id }

    if (data.MaTrangThaiText !== undefined) {
      // Kiểm tra MaTrangThaiText đã tồn tại ở trạng thái khác chưa
      const checkCode = await db.query<TrangThai>(`
        SELECT MaTrangThai FROM TrangThai WHERE MaTrangThaiText = @MaTrangThaiText AND MaTrangThai != @id
      `, { MaTrangThaiText: data.MaTrangThaiText, id })
      
      if (checkCode.recordset.length > 0) {
        throw new Error('Mã trạng thái đã tồn tại')
      }
      fields.push('MaTrangThaiText = @MaTrangThaiText')
      params.MaTrangThaiText = data.MaTrangThaiText
    }

    if (data.TenTrangThai !== undefined) {
      fields.push('TenTrangThai = @TenTrangThai')
      params.TenTrangThai = data.TenTrangThai
    }

    if (data.MauSac !== undefined) {
      fields.push('MauSac = @MauSac')
      params.MauSac = data.MauSac
    }

    if (data.MoTa !== undefined) {
      fields.push('MoTa = @MoTa')
      params.MoTa = data.MoTa
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    const result = await db.query<TrangThai>(`
      UPDATE TrangThai 
      SET ${fields.join(', ')}
      OUTPUT INSERTED.*
      WHERE MaTrangThai = @id
    `, params)

    return result.recordset[0] || null
  },

  // Xóa trạng thái
  async delete(id: number): Promise<boolean> {
    // Kiểm tra có hàng hóa đang dùng trạng thái này không
    const checkUsage = await db.query<{count: number}>(`
      SELECT COUNT(*) as count FROM HangHoa WHERE TrangThai = (
        SELECT TenTrangThai FROM TrangThai WHERE MaTrangThai = @id
      )
    `, { id })
    
    if (checkUsage.recordset[0].count > 0) {
      throw new Error('Không thể xóa trạng thái đang được sử dụng')
    }

    const result = await db.query(`
      DELETE FROM TrangThai WHERE MaTrangThai = @id
    `, { id })

    return result.rowsAffected[0] > 0
  }
}

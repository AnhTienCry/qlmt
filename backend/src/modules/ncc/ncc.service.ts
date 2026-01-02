import { db } from '../../config/database'
import { NCC, CreateNCCRequest, UpdateNCCRequest } from './ncc.types'

export const nccService = {
  // Lấy tất cả NCC
  async getAll(): Promise<NCC[]> {
    const result = await db.query<NCC>(`
      SELECT * FROM NCC ORDER BY TenNCC
    `)
    return result.recordset
  },

  // Lấy NCC theo ID
  async getById(id: number): Promise<NCC | null> {
    const result = await db.query<NCC>(`
      SELECT * FROM NCC WHERE MaNCC = @id
    `, { id })
    return result.recordset[0] || null
  },

  // Tìm kiếm NCC
  async search(keyword: string): Promise<NCC[]> {
    const result = await db.query<NCC>(`
      SELECT * FROM NCC 
      WHERE TenNCC LIKE @keyword 
         OR DiaChi LIKE @keyword
         OR SoDienThoai LIKE @keyword
         OR Email LIKE @keyword
      ORDER BY TenNCC
    `, { keyword: `%${keyword}%` })
    return result.recordset
  },

  // Thêm NCC mới
  async create(data: CreateNCCRequest): Promise<NCC> {
    const result = await db.query<NCC>(`
      INSERT INTO NCC (TenNCC, DiaChi, SoDienThoai, Email, NguoiLienHe, GhiChu)
      OUTPUT INSERTED.*
      VALUES (@TenNCC, @DiaChi, @SoDienThoai, @Email, @NguoiLienHe, @GhiChu)
    `, {
      TenNCC: data.TenNCC,
      DiaChi: data.DiaChi || null,
      SoDienThoai: data.SoDienThoai || null,
      Email: data.Email || null,
      NguoiLienHe: data.NguoiLienHe || null,
      GhiChu: data.GhiChu || null
    })
    return result.recordset[0]
  },

  // Cập nhật NCC
  async update(id: number, data: UpdateNCCRequest): Promise<NCC | null> {
    const fields: string[] = []
    const params: Record<string, any> = { id }

    if (data.TenNCC !== undefined) {
      fields.push('TenNCC = @TenNCC')
      params.TenNCC = data.TenNCC
    }
    if (data.DiaChi !== undefined) {
      fields.push('DiaChi = @DiaChi')
      params.DiaChi = data.DiaChi
    }
    if (data.SoDienThoai !== undefined) {
      fields.push('SoDienThoai = @SoDienThoai')
      params.SoDienThoai = data.SoDienThoai
    }
    if (data.Email !== undefined) {
      fields.push('Email = @Email')
      params.Email = data.Email
    }
    if (data.NguoiLienHe !== undefined) {
      fields.push('NguoiLienHe = @NguoiLienHe')
      params.NguoiLienHe = data.NguoiLienHe
    }
    if (data.GhiChu !== undefined) {
      fields.push('GhiChu = @GhiChu')
      params.GhiChu = data.GhiChu
    }

    if (fields.length === 0) return this.getById(id)

    fields.push('NgayCapNhat = SYSUTCDATETIME()')

    const result = await db.query<NCC>(`
      UPDATE NCC SET ${fields.join(', ')}
      OUTPUT INSERTED.*
      WHERE MaNCC = @id
    `, params)
    
    return result.recordset[0] || null
  },

  // Xóa NCC
  async delete(id: number): Promise<boolean> {
    const result = await db.query(`
      DELETE FROM NCC WHERE MaNCC = @id
    `, { id })
    return (result.rowsAffected[0] || 0) > 0
  }
}

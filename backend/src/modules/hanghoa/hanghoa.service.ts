import { db } from '../../config/database'
import { HangHoa, CreateHangHoaRequest, UpdateHangHoaRequest } from './hanghoa.types'

export const hanghoaService = {
  // Lấy tất cả hàng hóa
  async getAll(filters?: { loaiHang?: string; trangThai?: string }): Promise<HangHoa[]> {
    let query = `
      SELECT MaHang, MaTS, LoaiHang, TenHang, Hang, Model, NamSX, 
             TrangThai, ThongTinChiTiet, NgayTao, NgayCapNhat
      FROM HangHoa
      WHERE 1=1
    `
    const params: Record<string, any> = {}
    
    if (filters?.loaiHang) {
      query += ' AND LoaiHang = @loaiHang'
      params.loaiHang = filters.loaiHang
    }
    if (filters?.trangThai) {
      query += ' AND TrangThai = @trangThai'
      params.trangThai = filters.trangThai
    }
    
    query += ' ORDER BY NgayTao DESC'
    
    const result = await db.query<HangHoa>(query, params)
    return result.recordset
  },

  // Lấy theo ID
  async getById(id: number): Promise<HangHoa | null> {
    const result = await db.query<HangHoa>(`
      SELECT MaHang, MaTS, LoaiHang, TenHang, Hang, Model, NamSX, 
             TrangThai, ThongTinChiTiet, NgayTao, NgayCapNhat
      FROM HangHoa
      WHERE MaHang = @id
    `, { id })
    return result.recordset[0] || null
  },

  // Tìm kiếm
  async search(keyword: string): Promise<HangHoa[]> {
    const result = await db.query<HangHoa>(`
      SELECT MaHang, MaTS, LoaiHang, TenHang, Hang, Model, NamSX, 
             TrangThai, ThongTinChiTiet, NgayTao, NgayCapNhat
      FROM HangHoa
      WHERE TenHang LIKE @keyword 
         OR MaTS LIKE @keyword
         OR Hang LIKE @keyword
         OR Model LIKE @keyword
      ORDER BY TenHang
    `, { keyword: `%${keyword}%` })
    return result.recordset
  },

  // Thêm mới
  async create(data: CreateHangHoaRequest): Promise<HangHoa> {
    // Kiểm tra MaTS không trùng
    if (data.MaTS) {
      const existing = await db.query<any>(`SELECT MaHang FROM HangHoa WHERE MaTS = @MaTS`, { MaTS: data.MaTS })
      if (existing.recordset.length > 0) {
        throw new Error(`Mã tài sản "${data.MaTS}" đã tồn tại`)
      }
    }

    const result = await db.query<HangHoa>(`
      INSERT INTO HangHoa (MaTS, LoaiHang, TenHang, Hang, Model, NamSX, TrangThai, ThongTinChiTiet)
      OUTPUT INSERTED.*
      VALUES (@MaTS, @LoaiHang, @TenHang, @Hang, @Model, @NamSX, @TrangThai, @ThongTinChiTiet)
    `, {
      MaTS: data.MaTS || null,
      LoaiHang: data.LoaiHang,
      TenHang: data.TenHang,
      Hang: data.Hang || null,
      Model: data.Model || null,
      NamSX: data.NamSX || null,
      TrangThai: data.TrangThai || 'Mới',
      ThongTinChiTiet: data.ThongTinChiTiet ? JSON.stringify(data.ThongTinChiTiet) : null
    })
    return result.recordset[0]
  },

  // Cập nhật
  async update(id: number, data: UpdateHangHoaRequest): Promise<HangHoa | null> {
    // Kiểm tra MaTS không trùng với hàng hóa khác
    if (data.MaTS) {
      const existing = await db.query<any>(`SELECT MaHang FROM HangHoa WHERE MaTS = @MaTS AND MaHang != @id`, { MaTS: data.MaTS, id })
      if (existing.recordset.length > 0) {
        throw new Error(`Mã tài sản "${data.MaTS}" đã tồn tại`)
      }
    }

    const fields: string[] = []
    const params: Record<string, any> = { id }

    if (data.MaTS !== undefined) { fields.push('MaTS = @MaTS'); params.MaTS = data.MaTS }
    if (data.LoaiHang !== undefined) { fields.push('LoaiHang = @LoaiHang'); params.LoaiHang = data.LoaiHang }
    if (data.TenHang !== undefined) { fields.push('TenHang = @TenHang'); params.TenHang = data.TenHang }
    if (data.Hang !== undefined) { fields.push('Hang = @Hang'); params.Hang = data.Hang }
    if (data.Model !== undefined) { fields.push('Model = @Model'); params.Model = data.Model }
    if (data.NamSX !== undefined) { fields.push('NamSX = @NamSX'); params.NamSX = data.NamSX }
    if (data.TrangThai !== undefined) { fields.push('TrangThai = @TrangThai'); params.TrangThai = data.TrangThai }
    if (data.ThongTinChiTiet !== undefined) { 
      fields.push('ThongTinChiTiet = @ThongTinChiTiet')
      params.ThongTinChiTiet = data.ThongTinChiTiet ? JSON.stringify(data.ThongTinChiTiet) : null
    }

    if (fields.length === 0) return this.getById(id)

    fields.push('NgayCapNhat = SYSUTCDATETIME()')

    await db.query(`UPDATE HangHoa SET ${fields.join(', ')} WHERE MaHang = @id`, params)
    
    return this.getById(id)
  },

  // Xóa
  async delete(id: number): Promise<boolean> {
    // Kiểm tra hàng hóa có đang được sử dụng trong phiếu nhập/xuất không
    const checkNhap = await db.query<any>(`SELECT COUNT(*) as count FROM NhapHang WHERE MaHang = @id`, { id })
    if (checkNhap.recordset[0]?.count > 0) {
      throw new Error('Không thể xóa hàng hóa đang có phiếu nhập')
    }
    
    const checkXuat = await db.query<any>(`SELECT COUNT(*) as count FROM XuatHang WHERE MaHang = @id`, { id })
    if (checkXuat.recordset[0]?.count > 0) {
      throw new Error('Không thể xóa hàng hóa đang có phiếu xuất')
    }

    const result = await db.query('DELETE FROM HangHoa WHERE MaHang = @id', { id })
    return result.rowsAffected[0] > 0
  },

  // Đếm theo loại
  async countByLoai(): Promise<{ LoaiHang: string; SoLuong: number }[]> {
    const result = await db.query<{ LoaiHang: string; SoLuong: number }>(`
      SELECT LoaiHang, COUNT(*) as SoLuong
      FROM HangHoa
      GROUP BY LoaiHang
    `)
    return result.recordset
  },

  // Đếm theo trạng thái
  async countByTrangThai(): Promise<{ TrangThai: string; SoLuong: number }[]> {
    const result = await db.query<{ TrangThai: string; SoLuong: number }>(`
      SELECT TrangThai, COUNT(*) as SoLuong
      FROM HangHoa
      GROUP BY TrangThai
    `)
    return result.recordset
  }
}

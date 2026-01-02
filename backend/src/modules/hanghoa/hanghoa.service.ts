import { db } from '../../config/database'
import { HangHoa, CreateHangHoaRequest, UpdateHangHoaRequest } from './hanghoa.types'

export const hanghoaService = {
  // Lấy tất cả hàng hóa
  async getAll(filters?: { loaiHang?: string; trangThai?: string; maKho?: number }): Promise<HangHoa[]> {
    let query = `
      SELECT hh.*, 
             k.TenKho, 
             ncc.TenNCC,
             nv.TenNV
      FROM HangHoa hh
      LEFT JOIN Kho k ON hh.MaKho = k.MaKho
      LEFT JOIN NCC ncc ON hh.MaNCC = ncc.MaNCC
      LEFT JOIN NhanVien nv ON hh.MaNV_DangDung = nv.MaNV
      WHERE 1=1
    `
    const params: Record<string, any> = {}
    
    if (filters?.loaiHang) {
      query += ' AND hh.LoaiHang = @loaiHang'
      params.loaiHang = filters.loaiHang
    }
    if (filters?.trangThai) {
      query += ' AND hh.TrangThai = @trangThai'
      params.trangThai = filters.trangThai
    }
    if (filters?.maKho) {
      query += ' AND hh.MaKho = @maKho'
      params.maKho = filters.maKho
    }
    
    query += ' ORDER BY hh.NgayTao DESC'
    
    const result = await db.query<HangHoa>(query, params)
    return result.recordset
  },

  // Lấy theo ID
  async getById(id: number): Promise<HangHoa | null> {
    const result = await db.query<HangHoa>(`
      SELECT hh.*, 
             k.TenKho, 
             ncc.TenNCC,
             nv.TenNV
      FROM HangHoa hh
      LEFT JOIN Kho k ON hh.MaKho = k.MaKho
      LEFT JOIN NCC ncc ON hh.MaNCC = ncc.MaNCC
      LEFT JOIN NhanVien nv ON hh.MaNV_DangDung = nv.MaNV
      WHERE hh.MaHang = @id
    `, { id })
    return result.recordset[0] || null
  },

  // Tìm kiếm
  async search(keyword: string): Promise<HangHoa[]> {
    const result = await db.query<HangHoa>(`
      SELECT hh.*, 
             k.TenKho, 
             ncc.TenNCC,
             nv.TenNV
      FROM HangHoa hh
      LEFT JOIN Kho k ON hh.MaKho = k.MaKho
      LEFT JOIN NCC ncc ON hh.MaNCC = ncc.MaNCC
      LEFT JOIN NhanVien nv ON hh.MaNV_DangDung = nv.MaNV
      WHERE hh.TenHang LIKE @keyword 
         OR hh.MaTS LIKE @keyword
         OR hh.Hang LIKE @keyword
         OR hh.Model LIKE @keyword
         OR hh.SerialNumber LIKE @keyword
      ORDER BY hh.TenHang
    `, { keyword: `%${keyword}%` })
    return result.recordset
  },

  // Thêm mới
  async create(data: CreateHangHoaRequest): Promise<HangHoa> {
    const result = await db.query<HangHoa>(`
      INSERT INTO HangHoa (
        MaTS, TenHang, LoaiHang, ThongTinHang,
        CPU, RAM, SSD, VGA, MAC, IPAddress, SerialNumber, OS,
        Hang, Model, NamSX, MaKho, MaNCC, MaNV_DangDung,
        TrangThai, TinhTrang
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaTS, @TenHang, @LoaiHang, @ThongTinHang,
        @CPU, @RAM, @SSD, @VGA, @MAC, @IPAddress, @SerialNumber, @OS,
        @Hang, @Model, @NamSX, @MaKho, @MaNCC, @MaNV_DangDung,
        @TrangThai, @TinhTrang
      )
    `, {
      MaTS: data.MaTS || null,
      TenHang: data.TenHang,
      LoaiHang: data.LoaiHang,
      ThongTinHang: data.ThongTinHang || null,
      CPU: data.CPU || null,
      RAM: data.RAM || null,
      SSD: data.SSD || null,
      VGA: data.VGA || null,
      MAC: data.MAC || null,
      IPAddress: data.IPAddress || null,
      SerialNumber: data.SerialNumber || null,
      OS: data.OS || null,
      Hang: data.Hang || null,
      Model: data.Model || null,
      NamSX: data.NamSX || null,
      MaKho: data.MaKho || null,
      MaNCC: data.MaNCC || null,
      MaNV_DangDung: data.MaNV_DangDung || null,
      TrangThai: data.TrangThai || 'Trong kho',
      TinhTrang: data.TinhTrang || null
    })
    return result.recordset[0]
  },

  // Cập nhật
  async update(id: number, data: UpdateHangHoaRequest): Promise<HangHoa | null> {
    const fields: string[] = []
    const params: Record<string, any> = { id }

    const fieldMap: Record<string, string> = {
      MaTS: 'MaTS', TenHang: 'TenHang', LoaiHang: 'LoaiHang', ThongTinHang: 'ThongTinHang',
      CPU: 'CPU', RAM: 'RAM', SSD: 'SSD', VGA: 'VGA', MAC: 'MAC', 
      IPAddress: 'IPAddress', SerialNumber: 'SerialNumber', OS: 'OS',
      Hang: 'Hang', Model: 'Model', NamSX: 'NamSX',
      MaKho: 'MaKho', MaNCC: 'MaNCC', MaNV_DangDung: 'MaNV_DangDung',
      TrangThai: 'TrangThai', TinhTrang: 'TinhTrang'
    }

    for (const [key, column] of Object.entries(fieldMap)) {
      if ((data as any)[key] !== undefined) {
        fields.push(`${column} = @${key}`)
        params[key] = (data as any)[key]
      }
    }

    if (fields.length === 0) return this.getById(id)

    fields.push('NgayCapNhat = SYSUTCDATETIME()')

    await db.query(`
      UPDATE HangHoa SET ${fields.join(', ')}
      WHERE MaHang = @id
    `, params)
    
    return this.getById(id)
  },

  // Xóa
  async delete(id: number): Promise<boolean> {
    const result = await db.query(`
      DELETE FROM HangHoa WHERE MaHang = @id
    `, { id })
    return (result.rowsAffected[0] || 0) > 0
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

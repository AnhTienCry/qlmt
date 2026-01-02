import { db } from '../../config/database'
import { CreateTransferDto, TransferWithDetails } from './transfer.types'

class TransferService {
  // Tạo số phiếu tự động: DC202601-001
  async generateSoPhieu(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `DC${year}${month}`

    const result = await db.query<{ SoPhieuDC: string }>(`
      SELECT TOP 1 SoPhieuDC 
      FROM DieuChuyen 
      WHERE SoPhieuDC LIKE @prefix
      ORDER BY SoPhieuDC DESC
    `, { prefix: `${prefix}%` })

    let stt = 1
    if (result.recordset.length > 0) {
      const lastSoPhieu = result.recordset[0].SoPhieuDC
      const lastStt = parseInt(lastSoPhieu.split('-')[1])
      stt = lastStt + 1
    }

    return `${prefix}-${String(stt).padStart(3, '0')}`
  }

  async getAll(search?: string): Promise<TransferWithDetails[]> {
    let query = `
      SELECT dc.*, 
             nvGiao.TenNV as TenNVGiao, 
             nvNhan.TenNV as TenNVNhan,
             hh.TenHang,
             khoTu.TenKho as TenKhoTu,
             khoDen.TenKho as TenKhoDen
      FROM DieuChuyen dc
      LEFT JOIN NhanVien nvGiao ON dc.NguoiGiao = nvGiao.MaNV
      LEFT JOIN NhanVien nvNhan ON dc.NguoiNhan = nvNhan.MaNV
      LEFT JOIN HangHoa hh ON dc.MaHang = hh.MaHang
      LEFT JOIN Kho khoTu ON dc.TuKho = khoTu.MaKho
      LEFT JOIN Kho khoDen ON dc.DenKho = khoDen.MaKho
    `

    const params: Record<string, unknown> = {}

    if (search) {
      query += ` WHERE dc.SoPhieuDC LIKE @search 
                 OR nvGiao.TenNV LIKE @search 
                 OR nvNhan.TenNV LIKE @search
                 OR hh.TenHang LIKE @search`
      params.search = `%${search}%`
    }

    query += ' ORDER BY dc.NgayDC DESC, dc.MaDC DESC'

    const result = await db.query<TransferWithDetails>(query, params)
    return result.recordset
  }

  async getById(id: number): Promise<TransferWithDetails | null> {
    const result = await db.query<TransferWithDetails>(`
      SELECT dc.*, 
             nvGiao.TenNV as TenNVGiao, 
             nvNhan.TenNV as TenNVNhan,
             hh.TenHang,
             khoTu.TenKho as TenKhoTu,
             khoDen.TenKho as TenKhoDen
      FROM DieuChuyen dc
      LEFT JOIN NhanVien nvGiao ON dc.NguoiGiao = nvGiao.MaNV
      LEFT JOIN NhanVien nvNhan ON dc.NguoiNhan = nvNhan.MaNV
      LEFT JOIN HangHoa hh ON dc.MaHang = hh.MaHang
      LEFT JOIN Kho khoTu ON dc.TuKho = khoTu.MaKho
      LEFT JOIN Kho khoDen ON dc.DenKho = khoDen.MaKho
      WHERE dc.MaDC = @id
    `, { id })
    return result.recordset[0] || null
  }

  async create(data: CreateTransferDto): Promise<{ MaDC: number; SoPhieuDC: string }> {
    const soPhieu = await this.generateSoPhieu()

    const result = await db.query<{ MaDC: number }>(`
      INSERT INTO DieuChuyen (SoPhieuDC, NgayDC, MaHang, TuKho, DenKho, NguoiGiao, NguoiNhan, SoLuong, DienGiai)
      OUTPUT INSERTED.MaDC
      VALUES (@SoPhieuDC, @NgayDC, @MaHang, @TuKho, @DenKho, @NguoiGiao, @NguoiNhan, @SoLuong, @DienGiai)
    `, {
      SoPhieuDC: soPhieu,
      NgayDC: data.NgayDC,
      MaHang: data.MaHang,
      TuKho: data.TuKho || null,
      DenKho: data.DenKho || null,
      NguoiGiao: data.NguoiGiao || null,
      NguoiNhan: data.NguoiNhan || null,
      SoLuong: data.SoLuong || 1,
      DienGiai: data.DienGiai || null
    })

    return {
      MaDC: result.recordset[0].MaDC,
      SoPhieuDC: soPhieu
    }
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM DieuChuyen WHERE MaDC = @id', { id })
    return result.rowsAffected[0] > 0
  }
}

export default new TransferService()

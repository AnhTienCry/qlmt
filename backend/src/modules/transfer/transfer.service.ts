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
             nv1.TenNV as TenNV1, 
             nv2.TenNV as TenNV2,
             hh.TenHang
      FROM DieuChuyen dc
      LEFT JOIN NhanVien nv1 ON dc.MaNV1 = nv1.MaNV
      LEFT JOIN NhanVien nv2 ON dc.MaNV2 = nv2.MaNV
      LEFT JOIN HangHoa hh ON dc.MaHang = hh.MaHang
    `

    const params: Record<string, unknown> = {}

    if (search) {
      query += ` WHERE dc.SoPhieuDC LIKE @search 
                 OR nv1.TenNV LIKE @search 
                 OR nv2.TenNV LIKE @search
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
             nv1.TenNV as TenNV1, 
             nv2.TenNV as TenNV2,
             hh.TenHang
      FROM DieuChuyen dc
      LEFT JOIN NhanVien nv1 ON dc.MaNV1 = nv1.MaNV
      LEFT JOIN NhanVien nv2 ON dc.MaNV2 = nv2.MaNV
      LEFT JOIN HangHoa hh ON dc.MaHang = hh.MaHang
      WHERE dc.MaDC = @id
    `, { id })
    return result.recordset[0] || null
  }

  async create(data: CreateTransferDto): Promise<{ MaDC: number; SoPhieuDC: string }> {
    const soPhieu = await this.generateSoPhieu()

    const result = await db.query<{ MaDC: number }>(`
      INSERT INTO DieuChuyen (SoPhieuDC, NgayDC, MaNV1, MaNV2, MaHang, DienGiai)
      OUTPUT INSERTED.MaDC
      VALUES (@SoPhieuDC, @NgayDC, @MaNV1, @MaNV2, @MaHang, @DienGiai)
    `, {
      SoPhieuDC: soPhieu,
      NgayDC: data.NgayDC,
      MaNV1: data.MaNV1,
      MaNV2: data.MaNV2,
      MaHang: data.MaHang,
      DienGiai: data.DienGiai || null
    })

    // Cập nhật người đang giữ hàng hóa
    await db.query(`UPDATE HangHoa SET MaNV_DangDung = @MaNV2 WHERE MaHang = @MaHang`, {
      MaHang: data.MaHang,
      MaNV2: data.MaNV2
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

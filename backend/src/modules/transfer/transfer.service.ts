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
             nvGiao.MaNVText as MaNVGiaoText,
             nvNhan.TenNV as TenNVNhan,
             nvNhan.MaNVText as MaNVNhanText,
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

    // Cập nhật người đang sử dụng thiết bị (NguoiNhan)
    if (data.MaHang && data.NguoiNhan) {
      await db.query(`
        UPDATE HangHoa 
        SET MaNV_DangDung = @MaNV, TrangThai = N'Đang dùng', NgayCapNhat = SYSUTCDATETIME()
        WHERE MaHang = @MaHang
      `, { MaNV: data.NguoiNhan, MaHang: data.MaHang })
    }

    return {
      MaDC: result.recordset[0].MaDC,
      SoPhieuDC: soPhieu
    }
  }

  async update(id: number, data: Partial<CreateTransferDto>): Promise<TransferWithDetails | null> {
    // Lấy thông tin phiếu cũ để biết NguoiNhan cũ
    const oldTransfer = await this.getById(id)
    if (!oldTransfer) return null

    const fields: string[] = []
    const params: Record<string, unknown> = { id }

    if (data.NgayDC !== undefined) { fields.push('NgayDC = @NgayDC'); params.NgayDC = data.NgayDC }
    if (data.MaHang !== undefined) { fields.push('MaHang = @MaHang'); params.MaHang = data.MaHang }
    if (data.TuKho !== undefined) { fields.push('TuKho = @TuKho'); params.TuKho = data.TuKho || null }
    if (data.DenKho !== undefined) { fields.push('DenKho = @DenKho'); params.DenKho = data.DenKho || null }
    if (data.NguoiGiao !== undefined) { fields.push('NguoiGiao = @NguoiGiao'); params.NguoiGiao = data.NguoiGiao || null }
    if (data.NguoiNhan !== undefined) { fields.push('NguoiNhan = @NguoiNhan'); params.NguoiNhan = data.NguoiNhan || null }
    if (data.SoLuong !== undefined) { fields.push('SoLuong = @SoLuong'); params.SoLuong = data.SoLuong || 1 }
    if (data.DienGiai !== undefined) { fields.push('DienGiai = @DienGiai'); params.DienGiai = data.DienGiai || null }

    if (fields.length === 0) return this.getById(id)

    await db.query(`UPDATE DieuChuyen SET ${fields.join(', ')} WHERE MaDC = @id`, params)

    // Nếu NguoiNhan thay đổi, cập nhật người đang sử dụng thiết bị
    const maHang = data.MaHang ?? oldTransfer.MaHang
    const newNguoiNhan = data.NguoiNhan ?? oldTransfer.NguoiNhan
    
    if (maHang && newNguoiNhan) {
      await db.query(`
        UPDATE HangHoa 
        SET MaNV_DangDung = @MaNV, TrangThai = N'Đang dùng', NgayCapNhat = SYSUTCDATETIME()
        WHERE MaHang = @MaHang
      `, { MaNV: newNguoiNhan, MaHang: maHang })
    }

    return this.getById(id)
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM DieuChuyen WHERE MaDC = @id', { id })
    return result.rowsAffected[0] > 0
  }
}

export default new TransferService()

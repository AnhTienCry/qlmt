import { db } from '../../config/database'
import { 
  CreateNhapHangDto, NhapHangWithDetails, 
  CreateXuatHangDto, XuatHangWithDetails 
} from './stock.types'

class StockService {
  // ==================== NHẬP HÀNG ====================
  
  // Tạo số phiếu nhập: PN202601-001
  async generateSoPhieuNhap(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `PN${year}${month}`

    const result = await db.query<{ SoPhieuN: string }>(`
      SELECT TOP 1 SoPhieuN 
      FROM NhapHang 
      WHERE SoPhieuN LIKE @prefix
      ORDER BY SoPhieuN DESC
    `, { prefix: `${prefix}%` })

    let stt = 1
    if (result.recordset.length > 0) {
      const lastSoPhieu = result.recordset[0].SoPhieuN
      const lastStt = parseInt(lastSoPhieu.split('-')[1])
      stt = lastStt + 1
    }

    return `${prefix}-${String(stt).padStart(3, '0')}`
  }

  async getAllNhapHang(search?: string): Promise<NhapHangWithDetails[]> {
    let query = `
      SELECT nh.*, 
             hh.TenHang,
             kh.TenKho,
             ncc.TenNCC,
             nv.TenNV as TenNguoiNhan
      FROM NhapHang nh
      LEFT JOIN HangHoa hh ON nh.MaHang = hh.MaHang
      LEFT JOIN Kho kh ON nh.MaKho = kh.MaKho
      LEFT JOIN NCC ncc ON nh.NguoiGiao = ncc.MaNCC
      LEFT JOIN NhanVien nv ON nh.NguoiNhan = nv.MaNV
    `

    const params: Record<string, unknown> = {}

    if (search) {
      query += ` WHERE nh.SoPhieuN LIKE @search 
                 OR hh.TenHang LIKE @search 
                 OR ncc.TenNCC LIKE @search
                 OR nv.TenNV LIKE @search`
      params.search = `%${search}%`
    }

    query += ' ORDER BY nh.NgayNhap DESC, nh.MaNhap DESC'

    const result = await db.query<NhapHangWithDetails>(query, params)
    return result.recordset
  }

  async getNhapHangById(id: number): Promise<NhapHangWithDetails | null> {
    const result = await db.query<NhapHangWithDetails>(`
      SELECT nh.*, 
             hh.TenHang,
             kh.TenKho,
             ncc.TenNCC,
             nv.TenNV as TenNguoiNhan
      FROM NhapHang nh
      LEFT JOIN HangHoa hh ON nh.MaHang = hh.MaHang
      LEFT JOIN Kho kh ON nh.MaKho = kh.MaKho
      LEFT JOIN NCC ncc ON nh.NguoiGiao = ncc.MaNCC
      LEFT JOIN NhanVien nv ON nh.NguoiNhan = nv.MaNV
      WHERE nh.MaNhap = @id
    `, { id })
    return result.recordset[0] || null
  }

  async createNhapHang(data: CreateNhapHangDto): Promise<{ MaNhap: number; SoPhieuN: string }> {
    const soPhieu = await this.generateSoPhieuNhap()

    const result = await db.query<{ MaNhap: number }>(`
      INSERT INTO NhapHang (SoPhieuN, NgayNhap, MaHang, MaKho, NguoiGiao, NguoiNhan, SoLuong, DonGia, DienGiai)
      OUTPUT INSERTED.MaNhap
      VALUES (@SoPhieuN, @NgayNhap, @MaHang, @MaKho, @NguoiGiao, @NguoiNhan, @SoLuong, @DonGia, @DienGiai)
    `, {
      SoPhieuN: soPhieu,
      NgayNhap: data.NgayNhap,
      MaHang: data.MaHang,
      MaKho: data.MaKho,
      NguoiGiao: data.NguoiGiao || null,
      NguoiNhan: data.NguoiNhan || null,
      SoLuong: data.SoLuong || 1,
      DonGia: data.DonGia || null,
      DienGiai: data.DienGiai || null
    })

    return {
      MaNhap: result.recordset[0].MaNhap,
      SoPhieuN: soPhieu
    }
  }

  async deleteNhapHang(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM NhapHang WHERE MaNhap = @id', { id })
    return result.rowsAffected[0] > 0
  }

  async updateNhapHang(id: number, data: Partial<CreateNhapHangDto>): Promise<NhapHangWithDetails | null> {
    await db.query(`
      UPDATE NhapHang SET 
        NgayNhap = @NgayNhap,
        MaHang = @MaHang,
        MaKho = @MaKho,
        NguoiGiao = @NguoiGiao,
        NguoiNhan = @NguoiNhan,
        SoLuong = @SoLuong,
        DonGia = @DonGia,
        DienGiai = @DienGiai
      WHERE MaNhap = @id
    `, {
      id,
      NgayNhap: data.NgayNhap,
      MaHang: data.MaHang,
      MaKho: data.MaKho,
      NguoiGiao: data.NguoiGiao || null,
      NguoiNhan: data.NguoiNhan || null,
      SoLuong: data.SoLuong || 1,
      DonGia: data.DonGia || null,
      DienGiai: data.DienGiai || null
    })
    return this.getNhapHangById(id)
  }

  // ==================== XUẤT HÀNG ====================

  // Tạo số phiếu xuất: PX202601-001
  async generateSoPhieuXuat(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `PX${year}${month}`

    const result = await db.query<{ SoPhieuX: string }>(`
      SELECT TOP 1 SoPhieuX 
      FROM XuatHang 
      WHERE SoPhieuX LIKE @prefix
      ORDER BY SoPhieuX DESC
    `, { prefix: `${prefix}%` })

    let stt = 1
    if (result.recordset.length > 0) {
      const lastSoPhieu = result.recordset[0].SoPhieuX
      const lastStt = parseInt(lastSoPhieu.split('-')[1])
      stt = lastStt + 1
    }

    return `${prefix}-${String(stt).padStart(3, '0')}`
  }

  async getAllXuatHang(search?: string): Promise<XuatHangWithDetails[]> {
    let query = `
      SELECT xh.*, 
             hh.TenHang,
             kh.TenKho,
             nvGiao.TenNV as TenNguoiGiao,
             nvNhan.TenNV as TenNguoiNhan
      FROM XuatHang xh
      LEFT JOIN HangHoa hh ON xh.MaHang = hh.MaHang
      LEFT JOIN Kho kh ON xh.MaKho = kh.MaKho
      LEFT JOIN NhanVien nvGiao ON xh.NguoiGiao = nvGiao.MaNV
      LEFT JOIN NhanVien nvNhan ON xh.NguoiNhan = nvNhan.MaNV
    `

    const params: Record<string, unknown> = {}

    if (search) {
      query += ` WHERE xh.SoPhieuX LIKE @search 
                 OR hh.TenHang LIKE @search 
                 OR nvGiao.TenNV LIKE @search
                 OR nvNhan.TenNV LIKE @search`
      params.search = `%${search}%`
    }

    query += ' ORDER BY xh.NgayXuat DESC, xh.MaXuat DESC'

    const result = await db.query<XuatHangWithDetails>(query, params)
    return result.recordset
  }

  async getXuatHangById(id: number): Promise<XuatHangWithDetails | null> {
    const result = await db.query<XuatHangWithDetails>(`
      SELECT xh.*, 
             hh.TenHang,
             kh.TenKho,
             nvGiao.TenNV as TenNguoiGiao,
             nvNhan.TenNV as TenNguoiNhan
      FROM XuatHang xh
      LEFT JOIN HangHoa hh ON xh.MaHang = hh.MaHang
      LEFT JOIN Kho kh ON xh.MaKho = kh.MaKho
      LEFT JOIN NhanVien nvGiao ON xh.NguoiGiao = nvGiao.MaNV
      LEFT JOIN NhanVien nvNhan ON xh.NguoiNhan = nvNhan.MaNV
      WHERE xh.MaXuat = @id
    `, { id })
    return result.recordset[0] || null
  }

  async createXuatHang(data: CreateXuatHangDto): Promise<{ MaXuat: number; SoPhieuX: string }> {
    const soPhieu = await this.generateSoPhieuXuat()

    const result = await db.query<{ MaXuat: number }>(`
      INSERT INTO XuatHang (SoPhieuX, NgayXuat, MaHang, MaKho, NguoiGiao, NguoiNhan, SoLuong, DienGiai)
      OUTPUT INSERTED.MaXuat
      VALUES (@SoPhieuX, @NgayXuat, @MaHang, @MaKho, @NguoiGiao, @NguoiNhan, @SoLuong, @DienGiai)
    `, {
      SoPhieuX: soPhieu,
      NgayXuat: data.NgayXuat,
      MaHang: data.MaHang,
      MaKho: data.MaKho,
      NguoiGiao: data.NguoiGiao || null,
      NguoiNhan: data.NguoiNhan || null,
      SoLuong: data.SoLuong || 1,
      DienGiai: data.DienGiai || null
    })

    return {
      MaXuat: result.recordset[0].MaXuat,
      SoPhieuX: soPhieu
    }
  }

  async deleteXuatHang(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM XuatHang WHERE MaXuat = @id', { id })
    return result.rowsAffected[0] > 0
  }

  async updateXuatHang(id: number, data: Partial<CreateXuatHangDto>): Promise<XuatHangWithDetails | null> {
    await db.query(`
      UPDATE XuatHang SET 
        NgayXuat = @NgayXuat,
        MaHang = @MaHang,
        MaKho = @MaKho,
        NguoiGiao = @NguoiGiao,
        NguoiNhan = @NguoiNhan,
        SoLuong = @SoLuong,
        DienGiai = @DienGiai
      WHERE MaXuat = @id
    `, {
      id,
      NgayXuat: data.NgayXuat,
      MaHang: data.MaHang,
      MaKho: data.MaKho,
      NguoiGiao: data.NguoiGiao || null,
      NguoiNhan: data.NguoiNhan || null,
      SoLuong: data.SoLuong || 1,
      DienGiai: data.DienGiai || null
    })
    return this.getXuatHangById(id)
  }

  // ==================== BÁO CÁO NHẬP XUẤT TỒN ====================
  
  /**
   * Lấy báo cáo nhập xuất tồn kho theo khoảng thời gian
   * Công thức: Tồn cuối = Đầu kỳ + Nhập - Xuất
   */
  async getBaoCaoNhapXuatTon(tuNgay?: string, denNgay?: string): Promise<any[]> {
    // Nếu không có ngày, lấy từ đầu tháng đến hiện tại
    const now = new Date()
    const defaultTuNgay = tuNgay || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const defaultDenNgay = denNgay || now.toISOString().split('T')[0]

    const query = `
      WITH DauKy AS (
        -- Tính số lượng đầu kỳ (tồn trước ngày bắt đầu)
        SELECT hh.MaHang, hh.TenHang,
               ISNULL(SUM(nh.SoLuong), 0) - ISNULL(SUM(xh.SoLuong), 0) AS SoDauKy
        FROM HangHoa hh
        LEFT JOIN NhapHang nh ON hh.MaHang = nh.MaHang AND nh.NgayNhap < @tuNgay
        LEFT JOIN XuatHang xh ON hh.MaHang = xh.MaHang AND xh.NgayXuat < @tuNgay
        GROUP BY hh.MaHang, hh.TenHang
      ),
      TrongKy AS (
        -- Tính nhập/xuất trong kỳ
        SELECT hh.MaHang,
               ISNULL(SUM(nh.SoLuong), 0) AS SoNhap,
               ISNULL(SUM(xh.SoLuong), 0) AS SoXuat
        FROM HangHoa hh
        LEFT JOIN NhapHang nh ON hh.MaHang = nh.MaHang 
             AND nh.NgayNhap >= @tuNgay AND nh.NgayNhap <= @denNgay
        LEFT JOIN XuatHang xh ON hh.MaHang = xh.MaHang 
             AND xh.NgayXuat >= @tuNgay AND xh.NgayXuat <= @denNgay
        GROUP BY hh.MaHang
      )
      SELECT 
        dk.MaHang,
        dk.TenHang,
        ISNULL(dk.SoDauKy, 0) AS DauKy,
        ISNULL(tk.SoNhap, 0) AS Nhap,
        ISNULL(tk.SoXuat, 0) AS Xuat,
        ISNULL(dk.SoDauKy, 0) + ISNULL(tk.SoNhap, 0) - ISNULL(tk.SoXuat, 0) AS Ton
      FROM DauKy dk
      LEFT JOIN TrongKy tk ON dk.MaHang = tk.MaHang
      WHERE ISNULL(dk.SoDauKy, 0) != 0 
         OR ISNULL(tk.SoNhap, 0) != 0 
         OR ISNULL(tk.SoXuat, 0) != 0
      ORDER BY dk.MaHang
    `

    const result = await db.query<any>(query, { 
      tuNgay: defaultTuNgay, 
      denNgay: defaultDenNgay 
    })
    
    return result.recordset
  }

  // ==================== TỒN KHO ====================
  
  /**
   * Kiểm tra tồn kho của một mặt hàng trong một kho cụ thể
   * Tồn = Tổng nhập - Tổng xuất (cùng MaHang + MaKho)
   */
  async getTonKho(maHang: number, maKho: number): Promise<{ ton: number; tenHang: string; tenKho: string }> {
    const result = await db.query<any>(`
      SELECT 
        hh.TenHang,
        kh.TenKho,
        ISNULL((SELECT SUM(SoLuong) FROM NhapHang WHERE MaHang = @maHang AND MaKho = @maKho), 0) as SoNhap,
        ISNULL((SELECT SUM(SoLuong) FROM XuatHang WHERE MaHang = @maHang AND MaKho = @maKho), 0) as SoXuat
      FROM HangHoa hh
      CROSS JOIN Kho kh
      WHERE hh.MaHang = @maHang AND kh.MaKho = @maKho
    `, { maHang, maKho })

    if (result.recordset.length === 0) {
      return { ton: 0, tenHang: '', tenKho: '' }
    }

    const data = result.recordset[0]
    return {
      ton: data.SoNhap - data.SoXuat,
      tenHang: data.TenHang,
      tenKho: data.TenKho
    }
  }

  /**
   * Lấy danh sách hàng hóa đã xuất (để dùng cho Điều chuyển)
   * Chỉ lấy những hàng đã xuất và đang được ai đó giữ
   */
  async getHangDaXuat(): Promise<any[]> {
    const result = await db.query<any>(`
      SELECT DISTINCT
        xh.MaHang,
        hh.TenHang,
        xh.NguoiNhan as MaNV_DangDung,
        nv.TenNV as TenNV_DangDung
      FROM XuatHang xh
      INNER JOIN HangHoa hh ON xh.MaHang = hh.MaHang
      LEFT JOIN NhanVien nv ON xh.NguoiNhan = nv.MaNV
      WHERE xh.NguoiNhan IS NOT NULL
      ORDER BY hh.TenHang
    `)
    return result.recordset
  }
}

export default new StockService()

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
             hh.MaTS as MaHangText,
             kh.TenKho,
             kh.MaKhoText,
             ncc.TenNCC,
             ncc.MaSoThue as MaNCCText,
             nv.TenNV as TenNguoiNhan,
             nv.MaNVText as MaNVNhan
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
             hh.MaTS as MaHangText,
             kh.TenKho,
             kh.MaKhoText,
             ncc.TenNCC,
             ncc.MaSoThue as MaNCCText,
             nv.TenNV as TenNguoiNhan,
             nv.MaNVText as MaNVNhan
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
             hh.MaTS as MaHangText,
             kh.TenKho,
             kh.MaKhoText,
             nvGiao.TenNV as TenNguoiGiao,
             nvGiao.MaNVText as MaNVGiao,
             nvNhan.TenNV as TenNguoiNhan,
             nvNhan.MaNVText as MaNVNhan
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
             hh.MaTS as MaHangText,
             kh.TenKho,
             kh.MaKhoText,
             nvGiao.TenNV as TenNguoiGiao,
             nvGiao.MaNVText as MaNVGiao,
             nvNhan.TenNV as TenNguoiNhan,
             nvNhan.MaNVText as MaNVNhan
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
  async getBaoCaoNhapXuatTon(tuNgay?: string, denNgay?: string, maKho?: number): Promise<any[]> {
    // Nếu không có ngày, lấy từ đầu tháng đến hiện tại
    const now = new Date()
    const defaultTuNgay = tuNgay || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const defaultDenNgay = denNgay || now.toISOString().split('T')[0]

    // Tính NXT theo từng kho (có filter nếu có maKho)
    const khoFilter = maKho ? 'AND kh.MaKho = @maKho' : ''
    
    const query = `
      WITH DauKy AS (
        -- Tính số lượng đầu kỳ theo từng kho
        SELECT hh.MaHang, hh.MaTS, hh.TenHang, kh.MaKho, kh.TenKho,
               ISNULL((SELECT SUM(SoLuong) FROM NhapHang WHERE MaHang = hh.MaHang AND MaKho = kh.MaKho AND NgayNhap < @tuNgay), 0) 
               - ISNULL((SELECT SUM(SoLuong) FROM XuatHang WHERE MaHang = hh.MaHang AND MaKho = kh.MaKho AND NgayXuat < @tuNgay), 0) AS SoDauKy
        FROM HangHoa hh
        CROSS JOIN Kho kh
        WHERE 1=1 ${khoFilter}
      ),
      TrongKy AS (
        -- Tính nhập/xuất trong kỳ theo từng kho
        SELECT hh.MaHang, kh.MaKho,
               ISNULL((SELECT SUM(SoLuong) FROM NhapHang WHERE MaHang = hh.MaHang AND MaKho = kh.MaKho AND NgayNhap >= @tuNgay AND NgayNhap <= @denNgay), 0) AS SoNhap,
               ISNULL((SELECT SUM(SoLuong) FROM XuatHang WHERE MaHang = hh.MaHang AND MaKho = kh.MaKho AND NgayXuat >= @tuNgay AND NgayXuat <= @denNgay), 0) AS SoXuat
        FROM HangHoa hh
        CROSS JOIN Kho kh
        WHERE 1=1 ${khoFilter}
      )
      SELECT 
        dk.MaHang,
        dk.MaTS,
        dk.TenHang,
        dk.MaKho,
        dk.TenKho,
        ISNULL(dk.SoDauKy, 0) AS DauKy,
        ISNULL(tk.SoNhap, 0) AS Nhap,
        ISNULL(tk.SoXuat, 0) AS Xuat,
        ISNULL(dk.SoDauKy, 0) + ISNULL(tk.SoNhap, 0) - ISNULL(tk.SoXuat, 0) AS Ton
      FROM DauKy dk
      LEFT JOIN TrongKy tk ON dk.MaHang = tk.MaHang AND dk.MaKho = tk.MaKho
      WHERE ISNULL(dk.SoDauKy, 0) != 0 
         OR ISNULL(tk.SoNhap, 0) != 0 
         OR ISNULL(tk.SoXuat, 0) != 0
      ORDER BY dk.TenKho, dk.MaHang
    `

    const result = await db.query<any>(query, { 
      tuNgay: defaultTuNgay, 
      denNgay: defaultDenNgay,
      maKho: maKho || null
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
   * Tính người đang giữ = người nhận của giao dịch cuối cùng (Xuất hoặc Điều chuyển)
   */
  async getHangDaXuat(): Promise<any[]> {
    const result = await db.query<any>(`
      WITH GiaoDichCuoi AS (
        -- Lấy tất cả giao dịch xuất và điều chuyển
        -- Ưu tiên: 1) Ngày mới nhất, 2) Điều chuyển > Xuất (cùng ngày), 3) ID lớn nhất
        SELECT 
          MaHang,
          NgayGD,
          NguoiNhan,
          LoaiGD,
          ThuTu,
          MaGD,
          ROW_NUMBER() OVER (PARTITION BY MaHang ORDER BY NgayGD DESC, ThuTu DESC, MaGD DESC) as rn
        FROM (
          -- Xuất kho (ThuTu = 1)
          SELECT MaXuat as MaGD, MaHang, NgayXuat as NgayGD, NguoiNhan, 'XUAT' as LoaiGD, 1 as ThuTu
          FROM XuatHang
          WHERE NguoiNhan IS NOT NULL
          
          UNION ALL
          
          -- Điều chuyển (ThuTu = 2, ưu tiên cao hơn nếu cùng ngày)
          SELECT MaDC as MaGD, MaHang, NgayDC as NgayGD, NguoiNhan, 'DIEU_CHUYEN' as LoaiGD, 2 as ThuTu
          FROM DieuChuyen
          WHERE NguoiNhan IS NOT NULL
        ) AS AllGD
      )
      SELECT 
        gd.MaHang,
        hh.TenHang,
        gd.NguoiNhan as MaNV_DangDung,
        nv.TenNV as TenNV_DangDung
      FROM GiaoDichCuoi gd
      INNER JOIN HangHoa hh ON gd.MaHang = hh.MaHang
      LEFT JOIN NhanVien nv ON gd.NguoiNhan = nv.MaNV
      WHERE gd.rn = 1
      ORDER BY hh.TenHang
    `)
    return result.recordset
  }

  /**
   * Lấy danh sách thiết bị được cấp cho user (dựa trên MaNV từ Users)
   */
  async getThietBiCuaUser(userId: number): Promise<any[]> {
    // Lấy MaNV từ Users
    const userResult = await db.query<{ MaNV: number | null }>(
      'SELECT MaNV FROM Users WHERE UserId = @userId',
      { userId }
    )
    const maNV = userResult.recordset[0]?.MaNV

    if (!maNV) {
      return [] // User chưa được liên kết với nhân viên
    }

    // Lấy danh sách thiết bị xuất cho nhân viên này
    const result = await db.query<any>(`
      SELECT 
        xh.MaXuat,
        xh.SoPhieuX,
        xh.NgayXuat,
        xh.MaHang,
        hh.MaTS as MaHangText,
        hh.TenHang,
        hh.LoaiHang,
        kh.TenKho as TuKho,
        nvGiao.TenNV as NguoiGiao,
        xh.DienGiai
      FROM XuatHang xh
      INNER JOIN HangHoa hh ON xh.MaHang = hh.MaHang
      LEFT JOIN Kho kh ON xh.MaKho = kh.MaKho
      LEFT JOIN NhanVien nvGiao ON xh.NguoiGiao = nvGiao.MaNV
      WHERE xh.NguoiNhan = @maNV
      ORDER BY xh.NgayXuat DESC
    `, { maNV })

    return result.recordset
  }

  // ==================== BÁO CÁO MỞ RỘNG ====================

  /**
   * Báo cáo nhập kho theo filter
   * Filter: NguoiGiao (NCC hoặc NV), Kho, từ ngày - đến ngày
   * maNCC: lọc theo NCC (nhập mới)
   * maNV: lọc theo NV người giao (NV trả máy)
   */
  async getBaoCaoNhapKho(tuNgay: string, denNgay: string, maKho?: number, maNCC?: number, maNV?: number): Promise<any[]> {
    let query = `
      SELECT 
        nh.SoPhieuN, nh.NgayNhap, nh.SoLuong, nh.DonGia,
        hh.MaTS as MaHang, hh.TenHang,
        kh.MaKhoText, kh.TenKho,
        ncc.MaSoThue as MaNCC, ncc.TenNCC,
        nvGiao.TenNV as TenNguoiGiao,
        nv.MaNVText, nv.TenNV as TenNguoiNhan,
        nh.DienGiai
      FROM NhapHang nh
      LEFT JOIN HangHoa hh ON nh.MaHang = hh.MaHang
      LEFT JOIN Kho kh ON nh.MaKho = kh.MaKho
      LEFT JOIN NCC ncc ON nh.NguoiGiao = ncc.MaNCC
      LEFT JOIN NhanVien nvGiao ON nh.NguoiGiao = nvGiao.MaNV
      LEFT JOIN NhanVien nv ON nh.NguoiNhan = nv.MaNV
      WHERE nh.NgayNhap >= @tuNgay AND nh.NgayNhap <= @denNgay
    `
    const params: Record<string, any> = { tuNgay, denNgay }

    if (maKho) {
      query += ' AND nh.MaKho = @maKho'
      params.maKho = maKho
    }
    if (maNCC) {
      query += ' AND nh.NguoiGiao = @maNCC'
      params.maNCC = maNCC
    }
    if (maNV) {
      query += ' AND nh.NguoiGiao = @maNV'
      params.maNV = maNV
    }

    query += ' ORDER BY nh.NgayNhap DESC'
    const result = await db.query<any>(query, params)
    return result.recordset
  }

  /**
   * Báo cáo xuất kho theo filter
   * Filter: NguoiGiao, NguoiNhan, Kho, từ ngày - đến ngày
   */
  async getBaoCaoXuatKho(tuNgay: string, denNgay: string, maKho?: number, nguoiGiao?: number, nguoiNhan?: number): Promise<any[]> {
    let query = `
      SELECT 
        xh.SoPhieuX, xh.NgayXuat, xh.SoLuong,
        hh.MaTS as MaHang, hh.TenHang,
        kh.MaKhoText, kh.TenKho,
        nvGiao.MaNVText as MaNVGiao, nvGiao.TenNV as TenNguoiGiao,
        nvNhan.MaNVText as MaNVNhan, nvNhan.TenNV as TenNguoiNhan,
        xh.DienGiai
      FROM XuatHang xh
      LEFT JOIN HangHoa hh ON xh.MaHang = hh.MaHang
      LEFT JOIN Kho kh ON xh.MaKho = kh.MaKho
      LEFT JOIN NhanVien nvGiao ON xh.NguoiGiao = nvGiao.MaNV
      LEFT JOIN NhanVien nvNhan ON xh.NguoiNhan = nvNhan.MaNV
      WHERE xh.NgayXuat >= @tuNgay AND xh.NgayXuat <= @denNgay
    `
    const params: Record<string, any> = { tuNgay, denNgay }

    if (maKho) {
      query += ' AND xh.MaKho = @maKho'
      params.maKho = maKho
    }
    if (nguoiGiao) {
      query += ' AND xh.NguoiGiao = @nguoiGiao'
      params.nguoiGiao = nguoiGiao
    }
    if (nguoiNhan) {
      query += ' AND xh.NguoiNhan = @nguoiNhan'
      params.nguoiNhan = nguoiNhan
    }

    query += ' ORDER BY xh.NgayXuat DESC'
    const result = await db.query<any>(query, params)
    return result.recordset
  }

  /**
   * Theo dõi lịch sử thiết bị - Tất cả nghiệp vụ liên quan đến thiết bị
   * Nhập --> Xuất --> Điều chuyển
   */
  async getTheoDoiThietBi(maHang: number): Promise<any> {
    // Lấy thông tin thiết bị
    const hhResult = await db.query<any>(`
      SELECT MaHang, MaTS, TenHang, LoaiHang FROM HangHoa WHERE MaHang = @maHang
    `, { maHang })
    const thietBi = hhResult.recordset[0]

    if (!thietBi) return []

    // Lấy tất cả nghiệp vụ
    const result = await db.query<any>(`
      SELECT * FROM (
        -- Nhập kho
        SELECT 
          'NHAP' as LoaiNV, nh.NgayNhap as NgayGD, nh.SoPhieuN as SoPhieu,
          NULL as TuKho, kh.TenKho as DenKho,
          ncc.TenNCC as NguoiGiao, nv.TenNV as NguoiNhan,
          nh.SoLuong, nh.DienGiai
        FROM NhapHang nh
        LEFT JOIN Kho kh ON nh.MaKho = kh.MaKho
        LEFT JOIN NCC ncc ON nh.NguoiGiao = ncc.MaNCC
        LEFT JOIN NhanVien nv ON nh.NguoiNhan = nv.MaNV
        WHERE nh.MaHang = @maHang

        UNION ALL

        -- Xuất kho
        SELECT 
          'XUAT' as LoaiNV, xh.NgayXuat as NgayGD, xh.SoPhieuX as SoPhieu,
          kh.TenKho as TuKho, NULL as DenKho,
          nvGiao.TenNV as NguoiGiao, nvNhan.TenNV as NguoiNhan,
          xh.SoLuong, xh.DienGiai
        FROM XuatHang xh
        LEFT JOIN Kho kh ON xh.MaKho = kh.MaKho
        LEFT JOIN NhanVien nvGiao ON xh.NguoiGiao = nvGiao.MaNV
        LEFT JOIN NhanVien nvNhan ON xh.NguoiNhan = nvNhan.MaNV
        WHERE xh.MaHang = @maHang

        UNION ALL

        -- Điều chuyển
        SELECT 
          'DIEU_CHUYEN' as LoaiNV, dc.NgayDC as NgayGD, dc.SoPhieuDC as SoPhieu,
          khTu.TenKho as TuKho, khDen.TenKho as DenKho,
          nvGiao.TenNV as NguoiGiao, nvNhan.TenNV as NguoiNhan,
          dc.SoLuong, dc.DienGiai
        FROM DieuChuyen dc
        LEFT JOIN Kho khTu ON dc.TuKho = khTu.MaKho
        LEFT JOIN Kho khDen ON dc.DenKho = khDen.MaKho
        LEFT JOIN NhanVien nvGiao ON dc.NguoiGiao = nvGiao.MaNV
        LEFT JOIN NhanVien nvNhan ON dc.NguoiNhan = nvNhan.MaNV
        WHERE dc.MaHang = @maHang
      ) AS LichSu
      ORDER BY NgayGD ASC
    `, { maHang })

    return { thietBi, lichSu: result.recordset }
  }

  /**
   * Lấy danh sách thiết bị đã cấp cho một NV cụ thể
   * Dùng cho đề xuất sửa chữa/nâng cấp
   */
  async getThietBiCuaNhanVien(maNV: number): Promise<any[]> {
    const result = await db.query<any>(`
      SELECT 
        xh.MaHang, hh.MaTS, hh.TenHang, hh.LoaiHang as TenNhom,
        xh.NgayXuat, kh.TenKho as TuKho
      FROM XuatHang xh
      INNER JOIN HangHoa hh ON xh.MaHang = hh.MaHang
      LEFT JOIN Kho kh ON xh.MaKho = kh.MaKho
      WHERE xh.NguoiNhan = @maNV
      ORDER BY xh.NgayXuat DESC
    `, { maNV })
    return result.recordset
  }

  /**
   * Báo cáo "Thiết bị đang sử dụng"
   * Liệt kê tất cả thiết bị và trạng thái hiện tại:
   * - Giao dịch cuối là Nhập kho → Trong kho
   * - Giao dịch cuối là Xuất kho/Điều chuyển → Đang sử dụng bởi NV
   */
  async getBaoCaoThietBiSuDung(): Promise<any[]> {
    const result = await db.query<any>(`
      WITH GiaoDichCuoi AS (
        SELECT 
          MaHang, NgayGD, LoaiGD, TenKho, MaNV_DangDung, TenNV_DangDung,
          ROW_NUMBER() OVER (PARTITION BY MaHang ORDER BY NgayGD DESC, ThuTu DESC, MaGD DESC) as rn
        FROM (
          -- Nhập kho: vào kho, chưa ai giữ (ThuTu = 1, ưu tiên thấp nhất)
          SELECT 
            nh.MaNhap as MaGD, nh.MaHang, nh.NgayNhap as NgayGD, 
            'NHAP' as LoaiGD,
            kh.TenKho,
            NULL as MaNV_DangDung,
            NULL as TenNV_DangDung,
            1 as ThuTu
          FROM NhapHang nh
          LEFT JOIN Kho kh ON nh.MaKho = kh.MaKho
          
          UNION ALL
          
          -- Xuất kho: ra khỏi kho, người nhận đang giữ (ThuTu = 2)
          SELECT 
            xh.MaXuat as MaGD, xh.MaHang, xh.NgayXuat as NgayGD,
            'XUAT' as LoaiGD,
            NULL as TenKho,
            xh.NguoiNhan as MaNV_DangDung,
            nv.TenNV as TenNV_DangDung,
            2 as ThuTu
          FROM XuatHang xh
          LEFT JOIN NhanVien nv ON xh.NguoiNhan = nv.MaNV
          
          UNION ALL
          
          -- Điều chuyển: từ NV này sang NV khác (ThuTu = 3, ưu tiên cao nhất)
          SELECT 
            dc.MaDC as MaGD, dc.MaHang, dc.NgayDC as NgayGD,
            'DIEU_CHUYEN' as LoaiGD,
            NULL as TenKho,
            dc.NguoiNhan as MaNV_DangDung,
            nv.TenNV as TenNV_DangDung,
            3 as ThuTu
          FROM DieuChuyen dc
          LEFT JOIN NhanVien nv ON dc.NguoiNhan = nv.MaNV
        ) AS AllGD
      )
      SELECT 
        hh.MaHang,
        hh.MaTS,
        hh.TenHang,
        hh.LoaiHang,
        CASE 
          WHEN gd.LoaiGD IS NULL THEN N'Chưa nhập kho'
          WHEN gd.LoaiGD = 'NHAP' THEN N'Trong kho'
          ELSE N'Đang sử dụng'
        END AS TrangThai,
        CASE 
          WHEN gd.LoaiGD IS NULL THEN N'-'
          WHEN gd.LoaiGD = 'NHAP' THEN ISNULL(gd.TenKho, N'Không rõ kho')
          ELSE ISNULL(gd.TenNV_DangDung, N'Không rõ người giữ')
        END AS NguoiHoacKhoDangGiu,
        gd.MaNV_DangDung,
        CASE 
          WHEN gd.LoaiGD IS NULL THEN N'-'
          WHEN gd.LoaiGD = 'NHAP' THEN N'Nhập kho'
          WHEN gd.LoaiGD = 'XUAT' THEN N'Xuất kho'
          ELSE N'Điều chuyển'
        END as GiaoDichCuoi,
        gd.NgayGD as NgayGiaoDichCuoi
      FROM HangHoa hh
      LEFT JOIN GiaoDichCuoi gd ON hh.MaHang = gd.MaHang AND gd.rn = 1
      ORDER BY hh.TenHang
    `)
    return result.recordset
  }
}

export default new StockService()

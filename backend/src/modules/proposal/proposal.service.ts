import { db } from '../../config/database'
import { UserRole } from '../auth/auth.types'
import {
  ProposalRecord,
  ProposalResponse,
  ProposalStatus,
  CreateProposalRequest,
  ProposalQueryParams,
} from './proposal.types'

export class ProposalService {
  /**
   * Chuyển đổi record từ DB sang response format
   */
  private mapToResponse(record: any): ProposalResponse {
    return {
      maYC: record.MaYC,
      loaiYC: record.LoaiYC,
      tieuDe: record.TieuDe,
      moTa: record.MoTa,
      lyDo: record.LyDo,
      mucDoUuTien: record.MucDoUuTien,
      maMT: record.MaMT,
      tenMayTinh: record.TenMayTinh || null,
      nguoiTao: {
        userId: record.UserId_NguoiTao,
        tenNV: record.TenNguoiTao || null,
        username: record.UsernameNguoiTao || '',
      },
      trangThai: record.TrangThai,
      itXuLy: {
        userId: record.UserId_IT,
        tenNV: record.TenIT || null,
        ghiChu: record.GhiChuIT,
        ngayXuLy: record.NgayIT ? new Date(record.NgayIT).toISOString() : null,
      },
      giamDoc: {
        userId: record.UserId_GD,
        tenNV: record.TenGD || null,
        ghiChu: record.GhiChuGD,
        ngayDuyet: record.NgayDuyet ? new Date(record.NgayDuyet).toISOString() : null,
      },
      ketQua: record.KetQua,
      ngayHoanThanh: record.NgayHoanThanh ? new Date(record.NgayHoanThanh).toISOString() : null,
      ngayTao: new Date(record.NgayTao).toISOString(),
      ngayCapNhat: new Date(record.NgayCapNhat).toISOString(),
    }
  }

  /**
   * Lấy danh sách đề xuất (theo role)
   */
  async getProposals(
    userId: number,
    userRole: UserRole,
    query: ProposalQueryParams
  ): Promise<{ data: ProposalResponse[]; total: number }> {
    const { trangThai, loaiYC, page = 1, limit = 20 } = query
    const offset = (page - 1) * limit

    let whereClause = '1=1'
    const params: any = { offset, limit }

    // User thường chỉ xem đề xuất của mình
    if (userRole === 'user') {
      whereClause += ' AND yc.UserId_NguoiTao = @userId'
      params.userId = userId
    }

    // Filter theo trạng thái
    if (trangThai) {
      whereClause += ' AND yc.TrangThai = @trangThai'
      params.trangThai = trangThai
    }

    // Filter theo loại
    if (loaiYC) {
      whereClause += ' AND yc.LoaiYC = @loaiYC'
      params.loaiYC = loaiYC
    }

    // Query đếm tổng
    const countQuery = `SELECT COUNT(*) as total FROM YeuCauDeXuat yc WHERE ${whereClause}`
    const countResult = await db.query<{ total: number }>(countQuery, params)
    const total = countResult.recordset[0]?.total || 0

    // Query lấy data
    const dataQuery = `
      SELECT 
        yc.*,
        mt.TenMT as TenMayTinh,
        nvTao.TenNV as TenNguoiTao,
        uTao.Username as UsernameNguoiTao,
        nvIT.TenNV as TenIT,
        nvGD.TenNV as TenGD
      FROM YeuCauDeXuat yc
      LEFT JOIN MayTinh mt ON yc.MaMT = mt.MaMT
      LEFT JOIN Users uTao ON yc.UserId_NguoiTao = uTao.UserId
      LEFT JOIN NhanVien nvTao ON uTao.MaNV = nvTao.MaNV
      LEFT JOIN Users uIT ON yc.UserId_IT = uIT.UserId
      LEFT JOIN NhanVien nvIT ON uIT.MaNV = nvIT.MaNV
      LEFT JOIN Users uGD ON yc.UserId_GD = uGD.UserId
      LEFT JOIN NhanVien nvGD ON uGD.MaNV = nvGD.MaNV
      WHERE ${whereClause}
      ORDER BY yc.NgayTao DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `
    const dataResult = await db.query(dataQuery, params)

    return {
      data: dataResult.recordset.map((r) => this.mapToResponse(r)),
      total,
    }
  }

  /**
   * Lấy chi tiết đề xuất
   */
  async getProposalById(id: number): Promise<ProposalResponse | null> {
    const query = `
      SELECT 
        yc.*,
        mt.TenMT as TenMayTinh,
        nvTao.TenNV as TenNguoiTao,
        uTao.Username as UsernameNguoiTao,
        nvIT.TenNV as TenIT,
        nvGD.TenNV as TenGD
      FROM YeuCauDeXuat yc
      LEFT JOIN MayTinh mt ON yc.MaMT = mt.MaMT
      LEFT JOIN Users uTao ON yc.UserId_NguoiTao = uTao.UserId
      LEFT JOIN NhanVien nvTao ON uTao.MaNV = nvTao.MaNV
      LEFT JOIN Users uIT ON yc.UserId_IT = uIT.UserId
      LEFT JOIN NhanVien nvIT ON uIT.MaNV = nvIT.MaNV
      LEFT JOIN Users uGD ON yc.UserId_GD = uGD.UserId
      LEFT JOIN NhanVien nvGD ON uGD.MaNV = nvGD.MaNV
      WHERE yc.MaYC = @id
    `
    const result = await db.query(query, { id })

    if (result.recordset.length === 0) {
      return null
    }

    return this.mapToResponse(result.recordset[0])
  }

  /**
   * Tạo đề xuất mới (User)
   */
  async createProposal(userId: number, data: CreateProposalRequest): Promise<ProposalResponse> {
    // Lấy MaNV của user
    const userResult = await db.query<{ MaNV: number | null }>(
      'SELECT MaNV FROM Users WHERE UserId = @userId',
      { userId }
    )
    const maNV = userResult.recordset[0]?.MaNV || null

    const query = `
      INSERT INTO YeuCauDeXuat (
        LoaiYC, TieuDe, MoTa, LyDo, MucDoUuTien, MaMT, 
        MaNV_NguoiTao, UserId_NguoiTao, TrangThai
      )
      OUTPUT INSERTED.MaYC
      VALUES (
        @loaiYC, @tieuDe, @moTa, @lyDo, @mucDoUuTien, @maMT,
        @maNV, @userId, 'pending'
      )
    `
    const result = await db.query<{ MaYC: number }>(query, {
      loaiYC: data.loaiYC,
      tieuDe: data.tieuDe,
      moTa: data.moTa || null,
      lyDo: data.lyDo || null,
      mucDoUuTien: data.mucDoUuTien || 'Trung bình',
      maMT: data.maMT || null,
      maNV: maNV,
      userId: userId,
    })

    const newId = result.recordset[0].MaYC
    console.log(`✅ Created proposal #${newId}`)

    return (await this.getProposalById(newId))!
  }

  /**
   * IT bắt đầu xử lý đề xuất
   */
  async processProposal(id: number, itUserId: number, ghiChu?: string): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }
    if (proposal.trangThai !== 'pending') {
      throw new Error('Đề xuất không ở trạng thái chờ xử lý')
    }

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'it_processing',
        UserId_IT = @itUserId,
        GhiChuIT = @ghiChu,
        NgayIT = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, itUserId, ghiChu: ghiChu || null }
    )

    console.log(`✅ IT started processing proposal #${id}`)
    return (await this.getProposalById(id))!
  }

  /**
   * IT chuyển đề xuất lên GĐ duyệt
   */
  async submitToDirector(id: number, itUserId: number, ghiChu?: string): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }
    if (proposal.trangThai !== 'it_processing') {
      throw new Error('Đề xuất không ở trạng thái IT đang xử lý')
    }

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'waiting_approval',
        GhiChuIT = @ghiChu,
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, ghiChu: ghiChu || proposal.itXuLy.ghiChu }
    )

    console.log(`✅ Proposal #${id} submitted to director`)
    return (await this.getProposalById(id))!
  }

  /**
   * IT từ chối đề xuất
   */
  async itReject(id: number, itUserId: number, ghiChu: string): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }
    if (proposal.trangThai !== 'pending' && proposal.trangThai !== 'it_processing') {
      throw new Error('Đề xuất không thể từ chối ở trạng thái này')
    }

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'it_rejected',
        UserId_IT = @itUserId,
        GhiChuIT = @ghiChu,
        NgayIT = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, itUserId, ghiChu }
    )

    console.log(`❌ IT rejected proposal #${id}`)
    return (await this.getProposalById(id))!
  }

  /**
   * GĐ duyệt đề xuất
   */
  async approve(id: number, gdUserId: number, ghiChu?: string): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }
    if (proposal.trangThai !== 'waiting_approval') {
      throw new Error('Đề xuất không ở trạng thái chờ duyệt')
    }

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'approved',
        UserId_GD = @gdUserId,
        GhiChuGD = @ghiChu,
        NgayDuyet = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, gdUserId, ghiChu: ghiChu || null }
    )

    console.log(`✅ Director approved proposal #${id}`)
    return (await this.getProposalById(id))!
  }

  /**
   * GĐ từ chối đề xuất
   */
  async reject(id: number, gdUserId: number, ghiChu: string): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }
    if (proposal.trangThai !== 'waiting_approval') {
      throw new Error('Đề xuất không ở trạng thái chờ duyệt')
    }

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'rejected',
        UserId_GD = @gdUserId,
        GhiChuGD = @ghiChu,
        NgayDuyet = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, gdUserId, ghiChu }
    )

    console.log(`❌ Director rejected proposal #${id}`)
    return (await this.getProposalById(id))!
  }

  /**
   * IT đánh dấu hoàn thành
   */
  async complete(id: number, itUserId: number, ketQua: string): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }
    if (proposal.trangThai !== 'approved') {
      throw new Error('Đề xuất chưa được duyệt')
    }

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'completed',
        KetQua = @ketQua,
        NgayHoanThanh = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, ketQua }
    )

    console.log(`✅ Proposal #${id} completed`)
    return (await this.getProposalById(id))!
  }

  /**
   * Thống kê đề xuất
   */
  async getStats(): Promise<{
    total: number
    pending: number
    processing: number
    waitingApproval: number
    approved: number
    rejected: number
    completed: number
  }> {
    interface StatsResult {
      total: number
      pending: number
      processing: number
      waitingApproval: number
      approved: number
      rejected: number
      completed: number
    }

    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN TrangThai = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN TrangThai = 'it_processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN TrangThai = 'waiting_approval' THEN 1 ELSE 0 END) as waitingApproval,
        SUM(CASE WHEN TrangThai = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN TrangThai IN ('rejected', 'it_rejected') THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN TrangThai = 'completed' THEN 1 ELSE 0 END) as completed
      FROM YeuCauDeXuat
    `
    const result = await db.query<StatsResult>(query)
    const stats = result.recordset[0]

    return {
      total: stats?.total || 0,
      pending: stats?.pending || 0,
      processing: stats?.processing || 0,
      waitingApproval: stats?.waitingApproval || 0,
      approved: stats?.approved || 0,
      rejected: stats?.rejected || 0,
      completed: stats?.completed || 0,
    }
  }
}

export const proposalService = new ProposalService()

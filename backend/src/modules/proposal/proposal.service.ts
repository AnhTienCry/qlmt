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
      maHang: record.MaHang,
      tenHangHoa: record.TenHangHoa || null,
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
      ghiChuIT: record.GhiChuIT,  // Thêm ghi chú IT riêng để hiển thị
      ghiChuGD: record.GhiChuGD,  // Thêm ghi chú GĐ riêng để hiển thị
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
        hh.TenHang as TenHangHoa,
        nvTao.TenNV as TenNguoiTao,
        uTao.Username as UsernameNguoiTao,
        nvIT.TenNV as TenIT,
        nvGD.TenNV as TenGD
      FROM YeuCauDeXuat yc
      LEFT JOIN HangHoa hh ON yc.MaHang = hh.MaHang
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
        hh.TenHang as TenHangHoa,
        nvTao.TenNV as TenNguoiTao,
        uTao.Username as UsernameNguoiTao,
        nvIT.TenNV as TenIT,
        nvGD.TenNV as TenGD
      FROM YeuCauDeXuat yc
      LEFT JOIN HangHoa hh ON yc.MaHang = hh.MaHang
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
        LoaiYC, TieuDe, MoTa, LyDo, MucDoUuTien, MaHang, 
        MaNV_NguoiTao, UserId_NguoiTao, TrangThai
      )
      OUTPUT INSERTED.MaYC
      VALUES (
        @loaiYC, @tieuDe, @moTa, @lyDo, @mucDoUuTien, @maHang,
        @maNV, @userId, 'pending'
      )
    `
    const result = await db.query<{ MaYC: number }>(query, {
      loaiYC: data.loaiYC,
      tieuDe: data.tieuDe,
      moTa: data.moTa || null,
      lyDo: data.lyDo || null,
      mucDoUuTien: data.mucDoUuTien || 'Trung bình',
      maHang: data.maHang || null,
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

    // Giữ lại feedback cũ, chỉ thêm ghi chú mới nếu có
    const currentNote = proposal.ghiChuIT || ''
    const newNote = ghiChu ? (currentNote ? `${currentNote}\n${ghiChu}` : ghiChu) : currentNote
    
    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'it_processing',
        UserId_IT = @itUserId,
        GhiChuIT = @newNote,
        NgayIT = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, itUserId, newNote: newNote || null }
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

    // Giữ lại feedback cũ, chỉ thêm ghi chú mới nếu có
    const currentNote = proposal.ghiChuIT || ''
    const newNote = ghiChu ? (currentNote ? `${currentNote}\n${ghiChu}` : ghiChu) : currentNote
    
    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'waiting_approval',
        GhiChuIT = @newNote,
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, newNote: newNote || null }
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

    // Giữ lại feedback cũ, thêm lý do từ chối
    const currentNote = proposal.ghiChuIT || ''
    const newNote = currentNote ? `${currentNote}\n[Lý do từ chối]: ${ghiChu}` : `[Lý do từ chối]: ${ghiChu}`
    
    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'it_rejected',
        UserId_IT = @itUserId,
        GhiChuIT = @newNote,
        NgayIT = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, itUserId, newNote }
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

    // Giữ lại phản hồi cũ (nếu có), thêm ghi chú duyệt vào cuối
    const currentNote = proposal.giamDoc.ghiChu || ''
    let newNote = currentNote
    if (ghiChu) {
      const now = new Date()
      const timestamp = now.toISOString().slice(0, 16).replace('T', ' ')
      const approvalNote = `[${timestamp}][GĐ→User+IT]: [Đã duyệt] ${ghiChu}`
      newNote = currentNote ? `${currentNote}\n${approvalNote}` : approvalNote
    }

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'approved',
        UserId_GD = @gdUserId,
        GhiChuGD = @newNote,
        NgayDuyet = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, gdUserId, newNote: newNote || null }
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

    // Giữ lại phản hồi cũ (nếu có), thêm lý do từ chối vào cuối
    const currentNote = proposal.giamDoc.ghiChu || ''
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ')
    const rejectNote = `[${timestamp}][GĐ→User+IT]: [Từ chối] ${ghiChu}`
    const newNote = currentNote ? `${currentNote}\n${rejectNote}` : rejectNote

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'rejected',
        UserId_GD = @gdUserId,
        GhiChuGD = @newNote,
        NgayDuyet = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, gdUserId, newNote }
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
    // Cho phép complete cả 'approved' và 'it_approved'
    if (proposal.trangThai !== 'approved' && proposal.trangThai !== 'it_approved') {
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
   * IT chỉnh mức độ ưu tiên
   */
  async updatePriority(id: number, itUserId: number, mucDoUuTien: string, ghiChu?: string): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }
    // Chỉ cho phép chỉnh priority khi đang pending hoặc it_processing
    if (proposal.trangThai !== 'pending' && proposal.trangThai !== 'it_processing') {
      throw new Error('Không thể chỉnh mức ưu tiên ở trạng thái này')
    }

    const validPriorities = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp']
    if (!validPriorities.includes(mucDoUuTien)) {
      throw new Error('Mức độ ưu tiên không hợp lệ')
    }

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        MucDoUuTien = @mucDoUuTien,
        UserId_IT = @itUserId,
        GhiChuIT = CASE WHEN @ghiChu IS NOT NULL THEN @ghiChu ELSE GhiChuIT END,
        NgayIT = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, itUserId, mucDoUuTien, ghiChu: ghiChu || null }
    )

    console.log(`✅ IT updated priority of proposal #${id} to ${mucDoUuTien}`)
    return (await this.getProposalById(id))!
  }

  /**
   * IT duyệt trực tiếp (sửa chữa nhỏ - không qua GĐ)
   */
  async itDirectApprove(id: number, itUserId: number, ghiChu?: string): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }
    // Chỉ cho phép duyệt trực tiếp khi pending hoặc it_processing
    if (proposal.trangThai !== 'pending' && proposal.trangThai !== 'it_processing') {
      throw new Error('Không thể duyệt trực tiếp ở trạng thái này')
    }

    // Chỉ cho phép duyệt trực tiếp loại sửa chữa
    if (proposal.loaiYC !== 'sua_chua') {
      throw new Error('Chỉ có thể duyệt trực tiếp đề xuất loại sửa chữa')
    }

    // Giữ lại feedback cũ
    const currentNote = proposal.ghiChuIT || ''
    const approveNote = ghiChu || 'IT duyệt trực tiếp - sửa chữa nhỏ'
    const newNote = currentNote ? `${currentNote}\n[IT duyệt]: ${approveNote}` : `[IT duyệt]: ${approveNote}`
    
    await db.query(
      `UPDATE YeuCauDeXuat SET 
        TrangThai = 'it_approved',
        UserId_IT = @itUserId,
        GhiChuIT = @newNote,
        NgayIT = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, itUserId, newNote }
    )

    console.log(`✅ IT directly approved proposal #${id}`)
    return (await this.getProposalById(id))!
  }

  /**
   * IT gửi phản hồi cho User/GĐ
   */
  async sendFeedback(
    id: number, 
    itUserId: number, 
    noiDung: string, 
    guiCho: 'user' | 'director' | 'both'
  ): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }

    // Format mới với timestamp: [2026-01-04 10:30][IT→User]: nội dung
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ')
    const recipient = guiCho === 'user' ? 'User' : guiCho === 'director' ? 'GĐ' : 'User+GĐ'
    const feedback = `[${timestamp}][IT→${recipient}]: ${noiDung}`
    
    const currentNote = proposal.itXuLy.ghiChu || ''
    const newNote = currentNote ? `${currentNote}\n${feedback}` : feedback

    console.log('📤 Saving feedback:', { id, feedback, newNote })

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        UserId_IT = @itUserId,
        GhiChuIT = @newNote,
        NgayIT = SYSUTCDATETIME(),
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, itUserId, newNote }
    )

    console.log(`📝 IT sent feedback for proposal #${id} to ${guiCho}`)
    const result = await this.getProposalById(id)
    console.log('📥 Updated proposal ghiChuIT:', result?.ghiChuIT)
    return result!
  }

  /**
   * GĐ gửi phản hồi cho User/IT
   */
  async directorSendFeedback(
    id: number, 
    gdUserId: number, 
    noiDung: string, 
    guiCho: 'user' | 'it' | 'both'
  ): Promise<ProposalResponse> {
    const proposal = await this.getProposalById(id)
    if (!proposal) {
      throw new Error('Không tìm thấy đề xuất')
    }

    // Format: [2026-01-04 10:30][GĐ→User]: nội dung
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ')
    const recipient = guiCho === 'user' ? 'User' : guiCho === 'it' ? 'IT' : 'User+IT'
    const feedback = `[${timestamp}][GĐ→${recipient}]: ${noiDung}`
    
    // Lưu vào GhiChuGD
    const currentNote = proposal.giamDoc.ghiChu || ''
    const newNote = currentNote ? `${currentNote}\n${feedback}` : feedback

    console.log('📤 Director saving feedback:', { id, feedback, newNote })

    await db.query(
      `UPDATE YeuCauDeXuat SET 
        GhiChuGD = @newNote,
        NgayCapNhat = SYSUTCDATETIME()
      WHERE MaYC = @id`,
      { id, newNote }
    )

    console.log(`📝 Director sent feedback for proposal #${id} to ${guiCho}`)
    const result = await this.getProposalById(id)
    console.log('📥 Updated proposal ghiChuGD:', result?.ghiChuGD)
    return result!
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

// Loại yêu cầu đề xuất
export type ProposalType = 'nang_cap' | 'sua_chua' | 'mua_moi' | 'thay_the'

// Trạng thái workflow
export type ProposalStatus = 
  | 'pending'           // Chờ xử lý
  | 'it_processing'     // IT đang xử lý
  | 'waiting_approval'  // Chờ GĐ duyệt
  | 'it_approved'       // IT duyệt trực tiếp (sửa chữa nhỏ)
  | 'approved'          // Đã duyệt (GĐ)
  | 'rejected'          // GĐ từ chối
  | 'it_rejected'       // IT từ chối
  | 'completed'         // Hoàn thành

// Mức độ ưu tiên
export type PriorityLevel = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp'

// Database record
export interface ProposalRecord {
  MaYC: number
  LoaiYC: ProposalType
  TieuDe: string
  MoTa: string | null
  LyDo: string | null
  MucDoUuTien: PriorityLevel
  MaHang: number | null
  MaNV_NguoiTao: number | null
  UserId_NguoiTao: number
  TrangThai: ProposalStatus
  UserId_IT: number | null
  GhiChuIT: string | null
  NgayIT: Date | null
  UserId_GD: number | null
  GhiChuGD: string | null
  NgayDuyet: Date | null
  KetQua: string | null
  NgayHoanThanh: Date | null
  NgayTao: Date
  NgayCapNhat: Date
}

// API Response format
export interface ProposalResponse {
  maYC: number
  loaiYC: ProposalType
  tieuDe: string
  moTa: string | null
  lyDo: string | null
  mucDoUuTien: PriorityLevel
  maHang: number | null
  tenHangHoa: string | null
  nguoiTao: {
    userId: number
    tenNV: string | null
    username: string
  }
  trangThai: ProposalStatus
  itXuLy: {
    userId: number | null
    tenNV: string | null
    ghiChu: string | null
    ngayXuLy: string | null
  }
  giamDoc: {
    userId: number | null
    tenNV: string | null
    ghiChu: string | null
    ngayDuyet: string | null
  }
  ghiChuIT: string | null  // Ghi chú/phản hồi IT để hiển thị
  ghiChuGD: string | null  // Ghi chú/phản hồi GĐ để hiển thị
  ketQua: string | null
  ngayHoanThanh: string | null
  ngayTao: string
  ngayCapNhat: string
}

// Request: Tạo đề xuất mới
export interface CreateProposalRequest {
  loaiYC: ProposalType
  tieuDe: string
  moTa?: string
  lyDo?: string
  mucDoUuTien?: PriorityLevel
  maHang?: number  // Hàng hóa liên quan (nếu có)
}

// Request: IT xử lý
export interface ITProcessRequest {
  ghiChu?: string
}

// Request: IT chuyển lên GĐ duyệt
export interface ITSubmitRequest {
  ghiChu?: string
}

// Request: IT từ chối
export interface ITRejectRequest {
  ghiChu: string  // Bắt buộc phải có lý do
}

// Request: IT chỉnh mức độ ưu tiên
export interface ITUpdatePriorityRequest {
  mucDoUuTien: PriorityLevel
  ghiChu?: string
}

// Request: IT duyệt trực tiếp (sửa chữa nhỏ)
export interface ITDirectApproveRequest {
  ghiChu?: string
}

// Request: IT gửi phản hồi
export interface ITFeedbackRequest {
  noiDung: string           // Nội dung phản hồi
  guiCho: 'user' | 'director' | 'both'  // Gửi cho ai
}

// Request: GĐ duyệt
export interface DirectorApproveRequest {
  ghiChu?: string
}

// Request: GĐ từ chối
export interface DirectorRejectRequest {
  ghiChu: string  // Bắt buộc phải có lý do
}

// Request: IT hoàn thành
export interface CompleteRequest {
  ketQua: string  // Kết quả thực hiện
}

// Query params cho danh sách
export interface ProposalQueryParams {
  trangThai?: ProposalStatus
  loaiYC?: ProposalType
  page?: number
  limit?: number
}

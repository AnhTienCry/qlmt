// Proposal types cho Frontend
export type ProposalType = 'nang_cap' | 'sua_chua' | 'mua_moi' | 'thay_the'

export type ProposalStatus = 
  | 'pending'
  | 'it_processing'
  | 'waiting_approval'
  | 'approved'
  | 'rejected'
  | 'it_rejected'
  | 'completed'

export type PriorityLevel = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp'

export interface Proposal {
  maYC: number
  loaiYC: ProposalType
  tieuDe: string
  moTa: string | null
  lyDo: string | null
  mucDoUuTien: PriorityLevel
  maMT: number | null
  tenMayTinh: string | null
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
  ketQua: string | null
  ngayHoanThanh: string | null
  ngayTao: string
  ngayCapNhat: string
}

export interface CreateProposalRequest {
  loaiYC: ProposalType
  tieuDe: string
  moTa?: string
  lyDo?: string
  mucDoUuTien?: PriorityLevel
  maMT?: number
}

export interface ProposalStats {
  total: number
  pending: number
  processing: number
  waitingApproval: number
  approved: number
  rejected: number
  completed: number
}

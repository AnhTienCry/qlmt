import axiosInstance from './axios'
import { Proposal, CreateProposalRequest, ProposalStats } from '@/types/proposal.types'

interface ProposalListResponse {
  success: boolean
  data: Proposal[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ProposalResponse {
  success: boolean
  data: Proposal
  message?: string
}

interface StatsResponse {
  success: boolean
  data: ProposalStats
}

// Lấy danh sách đề xuất
export const getProposals = async (params?: {
  trangThai?: string
  loaiYC?: string
  page?: number
  limit?: number
}): Promise<ProposalListResponse> => {
  const response = await axiosInstance.get('/proposals', { params })
  return response.data
}

// Lấy chi tiết đề xuất
export const getProposalById = async (id: number): Promise<ProposalResponse> => {
  const response = await axiosInstance.get(`/proposals/${id}`)
  return response.data
}

// Tạo đề xuất mới
export const createProposal = async (data: CreateProposalRequest): Promise<ProposalResponse> => {
  const response = await axiosInstance.post('/proposals', data)
  return response.data
}

// IT: Bắt đầu xử lý
export const processProposal = async (id: number, ghiChu?: string): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/process`, { ghiChu })
  return response.data
}

// IT: Chuyển lên GĐ duyệt
export const submitToDirector = async (id: number, ghiChu?: string): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/submit`, { ghiChu })
  return response.data
}

// IT: Từ chối
export const itRejectProposal = async (id: number, ghiChu: string): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/it-reject`, { ghiChu })
  return response.data
}

// IT: Chỉnh mức độ ưu tiên
export const updatePriority = async (id: number, mucDoUuTien: string, ghiChu?: string): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/update-priority`, { mucDoUuTien, ghiChu })
  return response.data
}

// IT: Duyệt trực tiếp (sửa chữa nhỏ)
export const itDirectApprove = async (id: number, ghiChu?: string): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/it-approve`, { ghiChu })
  return response.data
}

// GĐ: Duyệt
export const approveProposal = async (id: number, ghiChu?: string): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/approve`, { ghiChu })
  return response.data
}

// GĐ: Từ chối
export const rejectProposal = async (id: number, ghiChu: string): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/reject`, { ghiChu })
  return response.data
}

// IT: Hoàn thành
export const completeProposal = async (id: number, ketQua: string): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/complete`, { ketQua })
  return response.data
}

// IT: Gửi phản hồi cho User/GĐ
export const sendFeedback = async (id: number, noiDung: string, guiCho: 'user' | 'director' | 'both'): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/feedback`, { noiDung, guiCho })
  return response.data
}

// Thống kê
export const getProposalStats = async (): Promise<StatsResponse> => {
  const response = await axiosInstance.get('/proposals/stats')
  return response.data
}

// GĐ: Gửi phản hồi cho User/IT
export const directorSendFeedback = async (id: number, noiDung: string, guiCho: 'user' | 'it' | 'both'): Promise<ProposalResponse> => {
  const response = await axiosInstance.post(`/proposals/${id}/director-feedback`, { noiDung, guiCho })
  return response.data
}

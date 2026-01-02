import { Request, Response } from 'express'
import { proposalService } from './proposal.service'
import { UserRole } from '../auth/auth.types'
import {
  CreateProposalRequest,
  ITProcessRequest,
  ITSubmitRequest,
  ITRejectRequest,
  DirectorApproveRequest,
  DirectorRejectRequest,
  CompleteRequest,
  ProposalQueryParams,
} from './proposal.types'

export class ProposalController {
  /**
   * GET /api/proposals
   * Lấy danh sách đề xuất (theo role)
   */
  async getProposals(req: Request, res: Response) {
    try {
      const userId = req.userId!
      const userRole = req.userRole as UserRole

      const query: ProposalQueryParams = {
        trangThai: req.query.trangThai as any,
        loaiYC: req.query.loaiYC as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      }

      const result = await proposalService.getProposals(userId, userRole, query)

      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / (query.limit || 20)),
        },
      })
    } catch (error: any) {
      console.error('Error getting proposals:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy danh sách đề xuất',
      })
    }
  }

  /**
   * GET /api/proposals/:id
   * Lấy chi tiết đề xuất
   */
  async getProposalById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const proposal = await proposalService.getProposalById(id)

      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đề xuất',
        })
      }

      // User thường chỉ xem được đề xuất của mình
      if (req.userRole === 'user' && proposal.nguoiTao.userId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xem đề xuất này',
        })
      }

      res.json({
        success: true,
        data: proposal,
      })
    } catch (error: any) {
      console.error('Error getting proposal:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy chi tiết đề xuất',
      })
    }
  }

  /**
   * POST /api/proposals
   * Tạo đề xuất mới (tất cả user đăng nhập)
   */
  async createProposal(req: Request, res: Response) {
    try {
      const userId = req.userId!
      const data: CreateProposalRequest = req.body

      // Validate
      if (!data.loaiYC || !data.tieuDe) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: loaiYC, tieuDe',
        })
      }

      const proposal = await proposalService.createProposal(userId, data)

      res.status(201).json({
        success: true,
        message: 'Tạo đề xuất thành công',
        data: proposal,
      })
    } catch (error: any) {
      console.error('Error creating proposal:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi tạo đề xuất',
      })
    }
  }

  /**
   * POST /api/proposals/:id/process
   * IT bắt đầu xử lý đề xuất
   */
  async processProposal(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const itUserId = req.userId!
      const { ghiChu }: ITProcessRequest = req.body

      const proposal = await proposalService.processProposal(id, itUserId, ghiChu)

      res.json({
        success: true,
        message: 'Đã bắt đầu xử lý đề xuất',
        data: proposal,
      })
    } catch (error: any) {
      console.error('Error processing proposal:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi xử lý đề xuất',
      })
    }
  }

  /**
   * POST /api/proposals/:id/submit
   * IT chuyển đề xuất lên GĐ duyệt
   */
  async submitToDirector(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const itUserId = req.userId!
      const { ghiChu }: ITSubmitRequest = req.body

      const proposal = await proposalService.submitToDirector(id, itUserId, ghiChu)

      res.json({
        success: true,
        message: 'Đã chuyển đề xuất lên Giám đốc duyệt',
        data: proposal,
      })
    } catch (error: any) {
      console.error('Error submitting proposal:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi chuyển đề xuất',
      })
    }
  }

  /**
   * POST /api/proposals/:id/it-reject
   * IT từ chối đề xuất
   */
  async itReject(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const itUserId = req.userId!
      const { ghiChu }: ITRejectRequest = req.body

      if (!ghiChu) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập lý do từ chối',
        })
      }

      const proposal = await proposalService.itReject(id, itUserId, ghiChu)

      res.json({
        success: true,
        message: 'Đã từ chối đề xuất',
        data: proposal,
      })
    } catch (error: any) {
      console.error('Error rejecting proposal:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi từ chối đề xuất',
      })
    }
  }

  /**
   * POST /api/proposals/:id/approve
   * GĐ duyệt đề xuất
   */
  async approve(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const gdUserId = req.userId!
      const { ghiChu }: DirectorApproveRequest = req.body

      const proposal = await proposalService.approve(id, gdUserId, ghiChu)

      res.json({
        success: true,
        message: 'Đã duyệt đề xuất',
        data: proposal,
      })
    } catch (error: any) {
      console.error('Error approving proposal:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi duyệt đề xuất',
      })
    }
  }

  /**
   * POST /api/proposals/:id/reject
   * GĐ từ chối đề xuất
   */
  async reject(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const gdUserId = req.userId!
      const { ghiChu }: DirectorRejectRequest = req.body

      if (!ghiChu) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập lý do từ chối',
        })
      }

      const proposal = await proposalService.reject(id, gdUserId, ghiChu)

      res.json({
        success: true,
        message: 'Đã từ chối đề xuất',
        data: proposal,
      })
    } catch (error: any) {
      console.error('Error rejecting proposal:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi từ chối đề xuất',
      })
    }
  }

  /**
   * POST /api/proposals/:id/complete
   * IT đánh dấu hoàn thành
   */
  async complete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const itUserId = req.userId!
      const { ketQua }: CompleteRequest = req.body

      if (!ketQua) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập kết quả thực hiện',
        })
      }

      const proposal = await proposalService.complete(id, itUserId, ketQua)

      res.json({
        success: true,
        message: 'Đã hoàn thành đề xuất',
        data: proposal,
      })
    } catch (error: any) {
      console.error('Error completing proposal:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi hoàn thành đề xuất',
      })
    }
  }

  /**
   * GET /api/proposals/stats
   * Thống kê đề xuất (IT, Director, Admin)
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await proposalService.getStats()

      res.json({
        success: true,
        data: stats,
      })
    } catch (error: any) {
      console.error('Error getting stats:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy thống kê',
      })
    }
  }
}

export const proposalController = new ProposalController()

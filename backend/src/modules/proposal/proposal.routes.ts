import { Router } from 'express'
import { proposalController } from './proposal.controller'
import { authMiddleware, itMiddleware, directorMiddleware, rolesMiddleware } from '../../shared/middlewares/auth'

const router = Router()

// Tất cả routes cần đăng nhập
router.use(authMiddleware)

// ========== Routes cho TẤT CẢ USER đăng nhập ==========

// GET /api/proposals - Lấy danh sách đề xuất
router.get('/', proposalController.getProposals.bind(proposalController))

// GET /api/proposals/stats - Thống kê (IT, Director, Admin)
router.get('/stats', rolesMiddleware('admin', 'it', 'director'), proposalController.getStats.bind(proposalController))

// GET /api/proposals/:id - Chi tiết đề xuất
router.get('/:id', proposalController.getProposalById.bind(proposalController))

// POST /api/proposals - Tạo đề xuất mới
router.post('/', proposalController.createProposal.bind(proposalController))

// ========== Routes cho IT ==========

// POST /api/proposals/:id/process - IT bắt đầu xử lý
router.post('/:id/process', itMiddleware, proposalController.processProposal.bind(proposalController))

// POST /api/proposals/:id/submit - IT chuyển lên GĐ duyệt
router.post('/:id/submit', itMiddleware, proposalController.submitToDirector.bind(proposalController))

// POST /api/proposals/:id/it-reject - IT từ chối
router.post('/:id/it-reject', itMiddleware, proposalController.itReject.bind(proposalController))

// POST /api/proposals/:id/complete - IT đánh dấu hoàn thành
router.post('/:id/complete', itMiddleware, proposalController.complete.bind(proposalController))

// ========== Routes cho GIÁM ĐỐC ==========

// POST /api/proposals/:id/approve - GĐ duyệt
router.post('/:id/approve', directorMiddleware, proposalController.approve.bind(proposalController))

// POST /api/proposals/:id/reject - GĐ từ chối
router.post('/:id/reject', directorMiddleware, proposalController.reject.bind(proposalController))

export default router

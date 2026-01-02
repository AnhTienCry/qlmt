import { Router } from 'express'
import { AgentController } from './agent.controller'

const router = Router()
const controller = new AgentController()

// POST /api/agent/report - Nhận dữ liệu từ Python tool (không cần auth)
router.post('/report', (req, res) => controller.receiveReport(req, res))

export default router

import { Request, Response } from 'express'
import { AgentService } from './agent.service'

const agentService = new AgentService()

// API Key để xác thực tool (giống trong tool Python)
const VALID_API_KEY = 'NGUYENVANCAN-NKENGINEERING-919395DINHTHITHI'

export class AgentController {
  /**
   * POST /api/agent/report
   * Nhận dữ liệu từ Python tool
   */
  async receiveReport(req: Request, res: Response): Promise<void> {
    try {
      // Kiểm tra API Key
      const apiKey = req.headers['x-api-key']
      if (apiKey !== VALID_API_KEY) {
        res.status(401).json({ error: 'Invalid API Key' })
        return
      }

      const data = req.body
      console.log('📥 Received agent report:', JSON.stringify(data, null, 2))

      // Validate payload
      if (!data.machine || !data.userInputName) {
        res.status(400).json({ error: 'Missing required fields: machine, userInputName' })
        return
      }

      // Lưu vào database
      const result = await agentService.saveReport(data)
      
      console.log('✅ Saved computer:', result.hostname)
      res.status(200).json({ 
        success: true, 
        message: 'Report received successfully',
        data: result
      })
    } catch (error: any) {
      console.error('❌ Agent report error:', error)
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }
}

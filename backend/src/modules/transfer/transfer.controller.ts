import { Request, Response } from 'express'
import transferService from './transfer.service'

class TransferController {
  async getSoPhieu(req: Request, res: Response) {
    try {
      const soPhieu = await transferService.generateSoPhieu()
      res.json({ success: true, data: { soPhieu } })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { search } = req.query
      const data = await transferService.getAll(search as string)
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const data = await transferService.getById(id)
      if (!data) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy' })
      }
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await transferService.create(req.body)
      res.status(201).json({ 
        success: true, 
        message: 'Tạo phiếu điều chuyển thành công',
        data: result 
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const deleted = await transferService.delete(id)
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy' })
      }
      res.json({ success: true, message: 'Xóa thành công' })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new TransferController()

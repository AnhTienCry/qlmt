import { Request, Response } from 'express'
import stockService from './stock.service'

class StockController {
  // ==================== NHẬP HÀNG ====================

  async getSoPhieuNhap(req: Request, res: Response) {
    try {
      const soPhieu = await stockService.generateSoPhieuNhap()
      res.json({ success: true, data: { soPhieu } })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async getAllNhapHang(req: Request, res: Response) {
    try {
      const { search } = req.query
      const data = await stockService.getAllNhapHang(search as string)
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async getNhapHangById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const data = await stockService.getNhapHangById(id)
      if (!data) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy' })
      }
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async createNhapHang(req: Request, res: Response) {
    try {
      const result = await stockService.createNhapHang(req.body)
      res.status(201).json({ 
        success: true, 
        message: 'Tạo phiếu nhập hàng thành công',
        data: result 
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async deleteNhapHang(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const deleted = await stockService.deleteNhapHang(id)
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy' })
      }
      res.json({ success: true, message: 'Xóa thành công' })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  // ==================== XUẤT HÀNG ====================

  async getSoPhieuXuat(req: Request, res: Response) {
    try {
      const soPhieu = await stockService.generateSoPhieuXuat()
      res.json({ success: true, data: { soPhieu } })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async getAllXuatHang(req: Request, res: Response) {
    try {
      const { search } = req.query
      const data = await stockService.getAllXuatHang(search as string)
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async getXuatHangById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const data = await stockService.getXuatHangById(id)
      if (!data) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy' })
      }
      res.json({ success: true, data })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async createXuatHang(req: Request, res: Response) {
    try {
      const result = await stockService.createXuatHang(req.body)
      res.status(201).json({ 
        success: true, 
        message: 'Tạo phiếu xuất hàng thành công',
        data: result 
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  async deleteXuatHang(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const deleted = await stockService.deleteXuatHang(id)
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy' })
      }
      res.json({ success: true, message: 'Xóa thành công' })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  // ==================== BÁO CÁO NHẬP XUẤT TỒN ====================

  async getBaoCaoNhapXuatTon(req: Request, res: Response) {
    try {
      const { tuNgay, denNgay } = req.query
      const data = await stockService.getBaoCaoNhapXuatTon(
        tuNgay as string, 
        denNgay as string
      )
      res.json({ 
        success: true, 
        data,
        tuNgay: tuNgay || new Date().toISOString().slice(0, 7) + '-01',
        denNgay: denNgay || new Date().toISOString().split('T')[0]
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

export default new StockController()

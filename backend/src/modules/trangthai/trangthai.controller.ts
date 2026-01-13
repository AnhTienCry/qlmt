import { Request, Response, NextFunction } from 'express'
import { trangthaiService } from './trangthai.service'

export const trangthaiController = {
  // GET /api/trangthai
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query
      
      let trangthais
      if (search && typeof search === 'string') {
        trangthais = await trangthaiService.search(search)
      } else {
        trangthais = await trangthaiService.getAll()
      }
      
      res.json({
        success: true,
        data: trangthais
      })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/trangthai/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const trangthai = await trangthaiService.getById(id)
      
      if (!trangthai) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy trạng thái'
        })
      }
      
      res.json({
        success: true,
        data: trangthai
      })
    } catch (error) {
      next(error)
    }
  },

  // POST /api/trangthai
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { MaTrangThaiText, TenTrangThai } = req.body
      
      if (!MaTrangThaiText || !TenTrangThai) {
        return res.status(400).json({
          success: false,
          message: 'Mã trạng thái và tên trạng thái là bắt buộc'
        })
      }
      
      const trangthai = await trangthaiService.create(req.body)
      
      res.status(201).json({
        success: true,
        message: 'Thêm trạng thái thành công',
        data: trangthai
      })
    } catch (error) {
      next(error)
    }
  },

  // PUT /api/trangthai/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const trangthai = await trangthaiService.update(id, req.body)
      
      if (!trangthai) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy trạng thái'
        })
      }
      
      res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: trangthai
      })
    } catch (error) {
      next(error)
    }
  },

  // DELETE /api/trangthai/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const deleted = await trangthaiService.delete(id)
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy trạng thái'
        })
      }
      
      res.json({
        success: true,
        message: 'Xóa trạng thái thành công'
      })
    } catch (error) {
      next(error)
    }
  }
}

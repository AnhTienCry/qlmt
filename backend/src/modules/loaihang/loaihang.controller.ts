import { Request, Response, NextFunction } from 'express'
import { loaihangService } from './loaihang.service'

export const loaihangController = {
  // GET /api/loaihang
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query
      
      let loaihangs
      if (search && typeof search === 'string') {
        loaihangs = await loaihangService.search(search)
      } else {
        loaihangs = await loaihangService.getAll()
      }
      
      res.json({
        success: true,
        data: loaihangs
      })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/loaihang/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const loaihang = await loaihangService.getById(id)
      
      if (!loaihang) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại hàng'
        })
      }
      
      res.json({
        success: true,
        data: loaihang
      })
    } catch (error) {
      next(error)
    }
  },

  // POST /api/loaihang
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { MaLoaiText, TenLoai } = req.body
      
      if (!MaLoaiText || !TenLoai) {
        return res.status(400).json({
          success: false,
          message: 'Mã loại và tên loại là bắt buộc'
        })
      }
      
      const loaihang = await loaihangService.create(req.body)
      
      res.status(201).json({
        success: true,
        message: 'Thêm loại hàng thành công',
        data: loaihang
      })
    } catch (error) {
      next(error)
    }
  },

  // PUT /api/loaihang/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const loaihang = await loaihangService.update(id, req.body)
      
      if (!loaihang) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại hàng'
        })
      }
      
      res.json({
        success: true,
        message: 'Cập nhật loại hàng thành công',
        data: loaihang
      })
    } catch (error) {
      next(error)
    }
  },

  // DELETE /api/loaihang/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const deleted = await loaihangService.delete(id)
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại hàng'
        })
      }
      
      res.json({
        success: true,
        message: 'Xóa loại hàng thành công'
      })
    } catch (error) {
      next(error)
    }
  }
}

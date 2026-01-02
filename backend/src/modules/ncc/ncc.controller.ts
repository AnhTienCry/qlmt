import { Request, Response, NextFunction } from 'express'
import { nccService } from './ncc.service'

export const nccController = {
  // GET /api/ncc
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query
      
      let nccs
      if (search && typeof search === 'string') {
        nccs = await nccService.search(search)
      } else {
        nccs = await nccService.getAll()
      }
      
      res.json({
        success: true,
        data: nccs
      })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/ncc/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const ncc = await nccService.getById(id)
      
      if (!ncc) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà cung cấp'
        })
      }
      
      res.json({
        success: true,
        data: ncc
      })
    } catch (error) {
      next(error)
    }
  },

  // POST /api/ncc
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { TenNCC } = req.body
      
      if (!TenNCC) {
        return res.status(400).json({
          success: false,
          message: 'Tên nhà cung cấp là bắt buộc'
        })
      }
      
      const ncc = await nccService.create(req.body)
      
      res.status(201).json({
        success: true,
        message: 'Thêm nhà cung cấp thành công',
        data: ncc
      })
    } catch (error) {
      next(error)
    }
  },

  // PUT /api/ncc/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const ncc = await nccService.update(id, req.body)
      
      if (!ncc) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà cung cấp'
        })
      }
      
      res.json({
        success: true,
        message: 'Cập nhật nhà cung cấp thành công',
        data: ncc
      })
    } catch (error) {
      next(error)
    }
  },

  // DELETE /api/ncc/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const deleted = await nccService.delete(id)
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà cung cấp'
        })
      }
      
      res.json({
        success: true,
        message: 'Xóa nhà cung cấp thành công'
      })
    } catch (error) {
      next(error)
    }
  }
}

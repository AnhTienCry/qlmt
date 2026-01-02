import { Request, Response, NextFunction } from 'express'
import { hanghoaService } from './hanghoa.service'

export const hanghoaController = {
  // GET /api/hanghoa
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, loaiHang, trangThai, maKho } = req.query
      
      let hanghoas
      if (search && typeof search === 'string') {
        hanghoas = await hanghoaService.search(search)
      } else {
        hanghoas = await hanghoaService.getAll({
          loaiHang: loaiHang as string,
          trangThai: trangThai as string,
          maKho: maKho ? parseInt(maKho as string) : undefined
        })
      }
      
      res.json({
        success: true,
        data: hanghoas
      })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/hanghoa/stats
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [byLoai, byTrangThai] = await Promise.all([
        hanghoaService.countByLoai(),
        hanghoaService.countByTrangThai()
      ])
      
      res.json({
        success: true,
        data: {
          byLoai,
          byTrangThai
        }
      })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/hanghoa/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const hanghoa = await hanghoaService.getById(id)
      
      if (!hanghoa) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hàng hóa'
        })
      }
      
      res.json({
        success: true,
        data: hanghoa
      })
    } catch (error) {
      next(error)
    }
  },

  // POST /api/hanghoa
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { TenHang, LoaiHang } = req.body
      
      if (!TenHang || !LoaiHang) {
        return res.status(400).json({
          success: false,
          message: 'Tên hàng và loại hàng là bắt buộc'
        })
      }
      
      const hanghoa = await hanghoaService.create(req.body)
      
      res.status(201).json({
        success: true,
        message: 'Thêm hàng hóa thành công',
        data: hanghoa
      })
    } catch (error) {
      next(error)
    }
  },

  // PUT /api/hanghoa/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const hanghoa = await hanghoaService.update(id, req.body)
      
      if (!hanghoa) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hàng hóa'
        })
      }
      
      res.json({
        success: true,
        message: 'Cập nhật hàng hóa thành công',
        data: hanghoa
      })
    } catch (error) {
      next(error)
    }
  },

  // DELETE /api/hanghoa/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id)
      const deleted = await hanghoaService.delete(id)
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hàng hóa'
        })
      }
      
      res.json({
        success: true,
        message: 'Xóa hàng hóa thành công'
      })
    } catch (error) {
      next(error)
    }
  }
}

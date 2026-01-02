import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { LoginRequest, RegisterRequest } from './auth.types'

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RegisterRequest = req.body
      const result = await authService.register(data)

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data: LoginRequest = req.body
      const result = await authService.login(data)

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] || ''
      const result = await authService.verifyToken(token)

      res.json({
        success: true,
        data: { userId: result.userId, role: result.role },
      })
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Đăng xuất thành công',
    })
  }
}

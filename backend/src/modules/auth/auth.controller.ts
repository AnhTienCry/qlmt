import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { LoginRequest, RegisterRequest, ChangePasswordRequest, CreateUserRequest, UpdateUserRequest } from './auth.types'

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

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      const data: ChangePasswordRequest = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
        })
      }

      await authService.changePassword(userId, data)

      res.json({
        success: true,
        message: 'Đổi mật khẩu thành công',
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin: Get all users
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await authService.getAllUsers()
      res.json({
        success: true,
        data: users,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin: Get user by id
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)
      const user = await authService.getUserById(userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng',
        })
      }

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin: Create new user
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateUserRequest = req.body
      const user = await authService.createUser(data)

      res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin: Update user
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)
      const data: UpdateUserRequest = req.body
      const user = await authService.updateUser(userId, data)

      res.json({
        success: true,
        message: 'Cập nhật người dùng thành công',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin: Reset user password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)
      const { newPassword } = req.body

      await authService.resetPassword(userId, newPassword)

      res.json({
        success: true,
        message: 'Đặt lại mật khẩu thành công',
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin: Delete user
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)
      await authService.deleteUser(userId)

      res.json({
        success: true,
        message: 'Xóa người dùng thành công',
      })
    } catch (error) {
      next(error)
    }
  }
}

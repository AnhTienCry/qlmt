import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../config'
import { UserRole } from '../../modules/auth/auth.types'

interface JwtPayload {
  userId: number
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      userId?: number
      userRole?: UserRole
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực',
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload

    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
    })
  }
}

// Middleware cho Admin (full quyền)
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập - Yêu cầu quyền Admin',
    })
  }
  next()
}

// Middleware cho IT (quản lý máy tính, xử lý đề xuất)
export const itMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin' && req.userRole !== 'it') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập - Yêu cầu quyền IT',
    })
  }
  next()
}

// Middleware cho Giám đốc (duyệt đề xuất)
export const directorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin' && req.userRole !== 'director') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập - Yêu cầu quyền Giám đốc',
    })
  }
  next()
}

// Middleware linh hoạt - cho phép nhiều role
export const rolesMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Không có quyền truy cập - Yêu cầu một trong các quyền: ${allowedRoles.join(', ')}`,
      })
    }
    next()
  }
}

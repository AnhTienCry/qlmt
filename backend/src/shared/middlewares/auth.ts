import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../config'

interface JwtPayload {
  userId: number
  role: string
}

declare global {
  namespace Express {
    interface Request {
      userId?: number
      userRole?: string
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

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập',
    })
  }
  next()
}

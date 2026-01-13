import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../config'
import { UserRole } from '../../modules/auth/auth.types'
import { db } from '../../config/database'

interface JwtPayload {
  userId: number
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      userId?: number
      userRole?: UserRole
      maNV?: number
    }
  }
}

/**
 * Xác định role dựa trên mã phòng ban (MaPBText)
 */
function determineRoleByDepartment(maPBText: string | null, currentRole: UserRole): UserRole {
  if (currentRole === 'admin') {
    return 'admin'
  }
  
  if (!maPBText) {
    return currentRole
  }
  
  const deptCode = maPBText.toUpperCase().trim()
  
  // Phòng Giám đốc
  if (['GD', 'GIAMDOC', 'DIRECTOR', 'BGD', 'BANGIAMDOC'].includes(deptCode)) {
    return 'director'
  }
  
  // Phòng IT
  if (['IT', 'CNTT', 'CONGNGHE', 'TECH'].includes(deptCode)) {
    return 'it'
  }
  
  return 'user'
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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

    // QUAN TRỌNG: Luôn lấy role mới nhất từ DB theo phòng ban
    // Không dùng role từ JWT vì có thể bị cũ
    const result = await db.query<any>(
      `SELECT u.Role, u.MaNV, pb.MaPBText
       FROM Users u
       LEFT JOIN NhanVien nv ON u.MaNV = nv.MaNV
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       WHERE u.UserId = @userId AND u.IsActive = 1`,
      { userId: decoded.userId }
    )

    const user = result.recordset[0]
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị vô hiệu',
      })
    }

    // Xác định role theo phòng ban
    req.userRole = determineRoleByDepartment(user.MaPBText, user.Role as UserRole)
    req.maNV = user.MaNV || undefined

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

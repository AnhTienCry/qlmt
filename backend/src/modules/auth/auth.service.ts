import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../../config/database'
import { config } from '../../config'
import { User, LoginRequest, LoginResponse, RegisterRequest } from './auth.types'

export class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const result = await db.query<User>(
      `SELECT * FROM Users WHERE Username = @username AND IsActive = 1`,
      { username: data.username }
    )

    const user = result.recordset[0]
    if (!user) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.PasswordHash)
    if (!isValidPassword) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng')
    }

    // Update last login
    await db.query(
      `UPDATE Users SET LastLogin = GETDATE() WHERE UserId = @userId`,
      { userId: user.UserId }
    )

    const token = jwt.sign(
      { userId: user.UserId, role: user.Role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    )

    return {
      user: {
        userId: user.UserId,
        username: user.Username,
        role: user.Role,
      },
      token,
    }
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      throw new Error('Mật khẩu xác nhận không khớp')
    }

    // Check if username already exists
    const existingUser = await db.query<User>(
      `SELECT * FROM Users WHERE Username = @username`,
      { username: data.username }
    )

    if (existingUser.recordset.length > 0) {
      throw new Error('Tên đăng nhập đã tồn tại')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create new user
    const result = await db.query<{ UserId: number }>(
      `INSERT INTO Users (Username, PasswordHash, Role, IsActive) 
       OUTPUT INSERTED.UserId
       VALUES (@username, @passwordHash, 'user', 1)`,
      { username: data.username, passwordHash }
    )

    const userId = result.recordset[0].UserId

    // Generate token
    const token = jwt.sign(
      { userId, role: 'user' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    )

    return {
      user: {
        userId,
        username: data.username,
        role: 'user',
      },
      token,
    }
  }

  async verifyToken(token: string): Promise<{ userId: number; role: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: number; role: string }
      return decoded
    } catch (error) {
      throw new Error('Token không hợp lệ')
    }
  }
}

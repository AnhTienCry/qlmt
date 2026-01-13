import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../../config/database'
import { config } from '../../config'
import { User, LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest, CreateUserRequest, UpdateUserRequest, UserRole } from './auth.types'

/**
 * Xác định role dựa trên mã phòng ban (MaPBText)
 * - GD, GIAMDOC, DIRECTOR → director
 * - IT, CNTT → it
 * - Các phòng ban khác → user
 * - Không có phòng ban và role là admin → admin
 */
function determineRoleByDepartment(maPBText: string | null, currentRole: UserRole): UserRole {
  // Nếu là admin (không có nhân viên liên kết) thì giữ nguyên
  if (currentRole === 'admin') {
    return 'admin'
  }
  
  if (!maPBText) {
    return currentRole // Giữ role hiện tại nếu không có phòng ban
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
  
  // Các phòng ban khác → user thường
  return 'user'
}

export class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Trim username để tránh lỗi do khoảng trắng
    const trimmedUsername = data.username.trim()
    
    // Lấy thông tin user và nhân viên nếu có, bao gồm MaPBText
    const result = await db.query<any>(
      `SELECT u.*, nv.TenNV, nv.MaPB, pb.TenPB, pb.MaPBText
       FROM Users u
       LEFT JOIN NhanVien nv ON u.MaNV = nv.MaNV
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       WHERE LTRIM(RTRIM(u.Username)) = @username AND u.IsActive = 1`,
      { username: trimmedUsername }
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

    // Xác định role dựa trên phòng ban
    const effectiveRole = determineRoleByDepartment(user.MaPBText, user.Role as UserRole)

    const token = jwt.sign(
      { userId: user.UserId, role: effectiveRole },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    )

    return {
      user: {
        userId: user.UserId,
        username: user.Username,
        role: effectiveRole,
        maNV: user.MaNV || null,
        tenNV: user.TenNV || null,
        maPB: user.MaPB || null,
        tenPB: user.TenPB || null,
        maPBText: user.MaPBText || null,
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

  /**
   * Lấy thông tin user đầy đủ với role theo phòng ban
   */
  async getCurrentUser(userId: number): Promise<{
    userId: number
    username: string
    role: UserRole
    maNV: number | null
    tenNV: string | null
    maPB: number | null
    tenPB: string | null
    maPBText: string | null
  }> {
    const result = await db.query<any>(
      `SELECT u.*, nv.TenNV, nv.MaPB, pb.TenPB, pb.MaPBText
       FROM Users u
       LEFT JOIN NhanVien nv ON u.MaNV = nv.MaNV
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       WHERE u.UserId = @userId AND u.IsActive = 1`,
      { userId }
    )

    const user = result.recordset[0]
    if (!user) {
      throw new Error('Người dùng không tồn tại')
    }

    // Xác định role dựa trên phòng ban
    const effectiveRole = determineRoleByDepartment(user.MaPBText, user.Role as UserRole)

    return {
      userId: user.UserId,
      username: user.Username,
      role: effectiveRole,
      maNV: user.MaNV || null,
      tenNV: user.TenNV || null,
      maPB: user.MaPB || null,
      tenPB: user.TenPB || null,
      maPBText: user.MaPBText || null,
    }
  }

  async changePassword(userId: number, data: ChangePasswordRequest): Promise<void> {
    // Validate new passwords match
    if (data.newPassword !== data.confirmNewPassword) {
      throw new Error('Mật khẩu mới không khớp')
    }

    // Get current user
    const result = await db.query<User>(
      `SELECT * FROM Users WHERE UserId = @userId`,
      { userId }
    )

    const user = result.recordset[0]
    if (!user) {
      throw new Error('Người dùng không tồn tại')
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.PasswordHash)
    if (!isValidPassword) {
      throw new Error('Mật khẩu hiện tại không đúng')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(data.newPassword, 10)

    // Update password
    await db.query(
      `UPDATE Users SET PasswordHash = @passwordHash, NgayCapNhat = GETDATE() WHERE UserId = @userId`,
      { passwordHash: newPasswordHash, userId }
    )
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.query<User>(
      `SELECT UserId, Username, Role, MaNV, IsActive, LastLogin, NgayTao, NgayCapNhat 
       FROM Users ORDER BY NgayTao DESC`
    )
    return result.recordset
  }

  async getUserById(userId: number): Promise<User | null> {
    const result = await db.query<User>(
      `SELECT UserId, Username, Role, MaNV, IsActive, LastLogin, NgayTao, NgayCapNhat 
       FROM Users WHERE UserId = @userId`,
      { userId }
    )
    return result.recordset[0] || null
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    // Check if username already exists
    const existingUser = await db.query<User>(
      `SELECT * FROM Users WHERE Username = @username`,
      { username: data.username }
    )

    if (existingUser.recordset.length > 0) {
      throw new Error('Tên đăng nhập đã tồn tại')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const result = await db.query<User>(
      `INSERT INTO Users (Username, PasswordHash, Role, MaNV, IsActive) 
       OUTPUT INSERTED.UserId, INSERTED.Username, INSERTED.Role, INSERTED.MaNV, INSERTED.IsActive, INSERTED.NgayTao
       VALUES (@username, @passwordHash, @role, @maNV, 1)`,
      { 
        username: data.username, 
        passwordHash, 
        role: data.role,
        maNV: data.maNV || null
      }
    )

    return result.recordset[0]
  }

  async updateUser(userId: number, data: UpdateUserRequest): Promise<User | null> {
    const updates: string[] = []
    const params: Record<string, any> = { userId }

    if (data.role !== undefined) {
      updates.push('Role = @role')
      params.role = data.role
    }
    if (data.maNV !== undefined) {
      updates.push('MaNV = @maNV')
      params.maNV = data.maNV
    }
    if (data.isActive !== undefined) {
      updates.push('IsActive = @isActive')
      params.isActive = data.isActive
    }

    if (updates.length === 0) {
      return this.getUserById(userId)
    }

    updates.push('NgayCapNhat = GETDATE()')

    await db.query(
      `UPDATE Users SET ${updates.join(', ')} WHERE UserId = @userId`,
      params
    )

    return this.getUserById(userId)
  }

  async resetPassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await db.query(
      `UPDATE Users SET PasswordHash = @passwordHash, NgayCapNhat = GETDATE() WHERE UserId = @userId`,
      { passwordHash, userId }
    )
  }

  // Reset password về mặc định bằng username (public - không cần auth)
  async resetPasswordByUsername(username: string): Promise<{ username: string; newPassword: string }> {
    // Tìm user theo username
    const result = await db.query<{ UserId: number; Username: string }>(
      `SELECT UserId, Username FROM Users WHERE Username = @username`,
      { username }
    )

    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy tài khoản với tên đăng nhập này')
    }

    const user = result.recordset[0]
    // Mật khẩu mặc định: username@123
    const newPassword = `${user.Username.toLowerCase()}@123`
    const passwordHash = await bcrypt.hash(newPassword, 10)

    await db.query(
      `UPDATE Users SET PasswordHash = @passwordHash, NgayCapNhat = GETDATE() WHERE UserId = @userId`,
      { passwordHash, userId: user.UserId }
    )

    console.log(`✅ Reset password cho user: ${user.Username}`)

    return {
      username: user.Username,
      newPassword: newPassword,
    }
  }

  async deleteUser(userId: number): Promise<void> {
    await db.query(
      `DELETE FROM Users WHERE UserId = @userId`,
      { userId }
    )
  }
}

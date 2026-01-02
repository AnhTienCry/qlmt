import bcrypt from 'bcryptjs'
import db from '../../config/database'

interface SeedUser {
  username: string
  password: string
  role: 'admin' | 'it' | 'director' | 'user'
  maNV?: number
}

// Danh sách users cần seed
// MaNV: 1=GĐ, 2=IT, 3=Kế toán, 4=Nhân sự, 5=Kinh doanh (theo schema seed)
const seedUsers: SeedUser[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'it', password: 'it123', role: 'it', maNV: 2 },
  { username: 'director', password: 'director123', role: 'director', maNV: 1 },
  { username: 'user1', password: 'user123', role: 'user', maNV: 3 },
]

export const seedAdmin = async () => {
  try {
    for (const user of seedUsers) {
      const result = await db.query<{ UserId: number }>(
        `SELECT UserId FROM Users WHERE Username = @username`,
        { username: user.username }
      )

      if (result.recordset.length === 0) {
        const hashedPassword = await bcrypt.hash(user.password, 10)
        await db.query(
          `INSERT INTO Users (Username, PasswordHash, Role, MaNV, IsActive) 
           VALUES (@username, @password, @role, @maNV, 1)`,
          {
            username: user.username,
            password: hashedPassword,
            role: user.role,
            maNV: user.maNV || null,
          }
        )
        console.log(`✅ User "${user.username}" created (role: ${user.role}, password: ${user.password})`)
      } else {
        console.log(`✅ User "${user.username}" already exists`)
      }
    }
  } catch (error) {
    console.error('❌ Seed users error:', error)
  }
}

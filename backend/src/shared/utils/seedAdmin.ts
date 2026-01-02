import bcrypt from 'bcryptjs'
import db from '../../config/database'

export const seedAdmin = async () => {
  try {
    const result = await db.query<{ UserId: number }>(
      `SELECT UserId FROM Users WHERE Username = @username`,
      { username: 'admin' }
    )

    if (result.recordset.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await db.query(
        `INSERT INTO Users (Username, PasswordHash, Role, IsActive) 
         VALUES (@username, @password, @role, 1)`,
        {
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
        }
      )
      console.log('✅ Admin user created (username: admin, password: admin123)')
    } else {
      console.log('✅ Admin user already exists')
    }
  } catch (error) {
    console.error('❌ Seed admin error:', error)
  }
}

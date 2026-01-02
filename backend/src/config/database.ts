import sql, { config as SqlConfig } from 'mssql'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig: SqlConfig = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE || 'QuanLyMayTinhDB',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

class Database {
  private pool: sql.ConnectionPool | null = null

  async connect(): Promise<sql.ConnectionPool> {
    try {
      if (this.pool) {
        return this.pool
      }
      this.pool = await sql.connect(dbConfig)
      console.log('✅ Connected to SQL Server:', dbConfig.database)
      return this.pool
    } catch (error) {
      console.error('❌ Database connection error:', error)
      throw error
    }
  }

  async query<T>(queryString: string, params?: Record<string, unknown>): Promise<sql.IResult<T>> {
    const pool = await this.connect()
    const request = pool.request()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value)
      })
    }

    return request.query<T>(queryString)
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close()
      this.pool = null
      console.log('Database connection closed')
    }
  }
}

export const db = new Database()
export default db

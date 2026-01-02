import { db } from '../../config/database'

export interface AgentReportPayload {
  agentVersion: string
  submittedAt: string
  userInputName: string
  machine: {
    hostname: string
    os: string
    cpu_model: string
    ram_gb: number
    ssd_total_gb?: number
    disk_total_gb?: number  // Tool gửi cả 2 key
    wifi_mac: string
  }
}

export interface ComputerRecord {
  MaMT: number
  TenMT: string
  MAC: string
  OS: string
  CPU: string
  RAM: string
  SSD: string
  TrangThai: string
  TenNguoiDung: string
  NgayTao: Date
  NgayCapNhat: Date
}

/**
 * Normalize MAC address: convert - to : and uppercase
 * Input: 74-13-EA-1B-50-EF or 74:13:EA:1B:50:EF
 * Output: 74:13:EA:1B:50:EF
 */
function normalizeMac(mac: string): string {
  if (!mac) return 'UNKNOWN'
  return mac.replace(/-/g, ':').toUpperCase()
}

export class AgentService {
  /**
   * Lưu báo cáo từ tool Python vào database
   * - Nếu MAC đã tồn tại: UPDATE
   * - Nếu MAC chưa có: INSERT
   */
  async saveReport(payload: AgentReportPayload): Promise<any> {
    const { machine, userInputName } = payload
    const mac = normalizeMac(machine.wifi_mac)
    
    // Tool gửi cả ssd_total_gb và disk_total_gb
    const diskSize = machine.disk_total_gb || machine.ssd_total_gb || 0
    
    // Kiểm tra MAC đã tồn tại chưa
    const checkQuery = `SELECT MaMT FROM MayTinh WHERE MAC = @mac`
    const checkResult = await db.query<{ MaMT: number }>(checkQuery, { mac })
    const existing = checkResult.recordset

    const computerData = {
      tenMT: machine.hostname || 'Unknown',
      mac: mac,
      os: machine.os || 'Unknown',
      cpu: machine.cpu_model || 'Unknown',
      ram: machine.ram_gb ? `${Math.round(machine.ram_gb * 100) / 100} GB` : 'Unknown',
      ssd: diskSize ? `${Math.round(diskSize * 100) / 100} GB` : 'Unknown',
      trangThai: 'Đang sử dụng',
      tenNguoiDung: userInputName || 'Unknown'
    }

    if (existing.length > 0) {
      // UPDATE
      const updateQuery = `
        UPDATE MayTinh SET
          TenMT = @tenMT,
          OS = @os,
          CPU = @cpu,
          RAM = @ram,
          SSD = @ssd,
          TrangThai = @trangThai,
          TenNguoiDung = @tenNguoiDung,
          NgayCapNhat = SYSUTCDATETIME()
        WHERE MAC = @mac
      `
      await db.query(updateQuery, computerData)
      console.log(`✅ Updated computer: ${computerData.tenMT} (${mac})`)
      return { 
        action: 'updated', 
        maMT: existing[0].MaMT,
        hostname: computerData.tenMT 
      }
    } else {
      // INSERT
      const insertQuery = `
        INSERT INTO MayTinh (TenMT, MAC, OS, CPU, RAM, SSD, TrangThai, TenNguoiDung, NgayTao, NgayCapNhat)
        OUTPUT INSERTED.MaMT
        VALUES (@tenMT, @mac, @os, @cpu, @ram, @ssd, @trangThai, @tenNguoiDung, SYSUTCDATETIME(), SYSUTCDATETIME())
      `
      const insertResult = await db.query<{ MaMT: number }>(insertQuery, computerData)
      console.log(`✅ Created computer: ${computerData.tenMT} (${mac})`)
      return { 
        action: 'created', 
        maMT: insertResult.recordset[0]?.MaMT,
        hostname: computerData.tenMT 
      }
    }
  }
}

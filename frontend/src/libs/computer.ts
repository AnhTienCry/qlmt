import api from '@/libs/axios'

export interface ComputerInfo {
  id: number
  hostname: string
  os: string
  cpu: string
  ram: string
  storage: string
  vga?: string
  macAddress: string
  ipAddress: string
  serialNumber?: string
  status: 'online' | 'offline'
  lastSeen?: string
  assignedTo?: string
  department?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  total?: number
}

/**
 * Lấy thông tin máy tính của user hiện tại
 */
export const getMyComputer = async (): Promise<ComputerInfo | null> => {
  const response = await api.get<ApiResponse<ComputerInfo | null>>('/computers/my-computer')
  return response.data.data
}

/**
 * Lấy danh sách tất cả máy tính (admin only)
 */
export const getAllComputers = async (): Promise<ComputerInfo[]> => {
  const response = await api.get<ApiResponse<ComputerInfo[]>>('/computers')
  return response.data.data
}

/**
 * Lấy chi tiết máy tính theo ID
 */
export const getComputerById = async (id: number): Promise<ComputerInfo> => {
  const response = await api.get<ApiResponse<ComputerInfo>>(`/computers/${id}`)
  return response.data.data
}

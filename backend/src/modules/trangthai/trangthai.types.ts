export interface TrangThai {
  MaTrangThai: number
  MaTrangThaiText: string  // Ví dụ: 'moi', 'dang_dung', 'hong'
  TenTrangThai: string     // Ví dụ: 'Mới', 'Đang dùng', 'Hỏng'
  MauSac?: string          // Màu hiển thị: 'green', 'blue', 'red'
  MoTa?: string
  NgayTao?: Date
}

export interface CreateTrangThaiRequest {
  MaTrangThaiText: string
  TenTrangThai: string
  MauSac?: string
  MoTa?: string
}

export interface UpdateTrangThaiRequest {
  MaTrangThaiText?: string
  TenTrangThai?: string
  MauSac?: string
  MoTa?: string
}

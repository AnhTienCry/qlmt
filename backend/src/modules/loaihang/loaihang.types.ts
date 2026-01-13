export interface LoaiHang {
  MaLoai: number
  MaLoaiText: string   // Ví dụ: 'may_tinh', 'man_hinh'
  TenLoai: string      // Ví dụ: 'Máy tính', 'Màn hình'
  MoTa?: string
  NgayTao?: Date
}

export interface CreateLoaiHangRequest {
  MaLoaiText: string
  TenLoai: string
  MoTa?: string
}

export interface UpdateLoaiHangRequest {
  MaLoaiText?: string
  TenLoai?: string
  MoTa?: string
}

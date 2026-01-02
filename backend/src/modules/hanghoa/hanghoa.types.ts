// Types cho module Hàng Hóa

export type LoaiHang = 'may_tinh' | 'man_hinh' | 'phim' | 'chuot' | 'dau_chuyen' | 'khac'
export type TrangThaiHang = 'Trong kho' | 'Đang sử dụng' | 'Hỏng' | 'Thanh lý'

export interface HangHoa {
  MaHang: number
  MaTS?: string
  TenHang: string
  LoaiHang: LoaiHang
  ThongTinHang?: string
  
  // Thông tin máy tính (nếu LoaiHang = 'may_tinh')
  CPU?: string
  RAM?: string
  SSD?: string
  VGA?: string
  MAC?: string
  IPAddress?: string
  SerialNumber?: string
  OS?: string
  
  // Thông tin chung
  Hang?: string
  Model?: string
  NamSX?: number
  
  // Liên kết
  MaKho?: number
  TenKho?: string
  MaNCC?: number
  TenNCC?: string
  MaNV_DangDung?: number
  TenNV?: string
  
  // Trạng thái
  TrangThai: TrangThaiHang
  TinhTrang?: string
  
  NgayTao?: Date
  NgayCapNhat?: Date
}

export interface CreateHangHoaRequest {
  MaTS?: string
  TenHang: string
  LoaiHang: LoaiHang
  ThongTinHang?: string
  CPU?: string
  RAM?: string
  SSD?: string
  VGA?: string
  MAC?: string
  IPAddress?: string
  SerialNumber?: string
  OS?: string
  Hang?: string
  Model?: string
  NamSX?: number
  MaKho?: number
  MaNCC?: number
  MaNV_DangDung?: number
  TrangThai?: TrangThaiHang
  TinhTrang?: string
}

export interface UpdateHangHoaRequest extends Partial<CreateHangHoaRequest> {}

// Labels hiển thị
export const LOAI_HANG_LABELS: Record<LoaiHang, string> = {
  'may_tinh': 'Máy tính',
  'man_hinh': 'Màn hình',
  'phim': 'Bàn phím',
  'chuot': 'Chuột',
  'dau_chuyen': 'Đầu chuyển đổi',
  'khac': 'Khác'
}

export const TRANG_THAI_LABELS: Record<TrangThaiHang, string> = {
  'Trong kho': 'Trong kho',
  'Đang sử dụng': 'Đang sử dụng',
  'Hỏng': 'Hỏng',
  'Thanh lý': 'Thanh lý'
}

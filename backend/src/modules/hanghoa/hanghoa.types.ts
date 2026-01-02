// Types cho module Hàng Hóa

export type LoaiHang = 'may_tinh' | 'man_hinh' | 'phim' | 'chuot' | 'dau_chuyen' | 'khac'
export type TrangThaiHang = 'Mới' | 'Đang dùng' | 'Hỏng' | 'Thanh lý'

// Thông tin chi tiết cho máy tính (lưu trong JSON)
export interface ThongTinMayTinh {
  CPU?: string
  RAM?: string
  SSD?: string
  VGA?: string
  MAC?: string
  IPAddress?: string
  SerialNumber?: string
  OS?: string
}

export interface HangHoa {
  MaHang: number
  MaTS?: string
  TenHang: string
  LoaiHang: LoaiHang
  Hang?: string
  Model?: string
  NamSX?: number
  TrangThai: TrangThaiHang
  ThongTinChiTiet?: string | ThongTinMayTinh // JSON string from DB or parsed object
  NgayTao?: Date
  NgayCapNhat?: Date
}

export interface CreateHangHoaRequest {
  MaTS?: string
  TenHang: string
  LoaiHang: LoaiHang
  Hang?: string
  Model?: string
  NamSX?: number
  TrangThai?: TrangThaiHang
  ThongTinChiTiet?: ThongTinMayTinh
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
  'Mới': 'Mới',
  'Đang dùng': 'Đang dùng',
  'Hỏng': 'Hỏng',
  'Thanh lý': 'Thanh lý'
}

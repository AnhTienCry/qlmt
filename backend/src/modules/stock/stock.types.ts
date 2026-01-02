// NhapHang - Nhập hàng hóa vào kho
// Schema: NhapHang (SoPhieuN, NgayNhap, MaHang, MaKho, NguoiGiao, NguoiNhan, DienGiai)
export interface NhapHang {
  MaNhap: number
  SoPhieuN: string           // PN202601-001
  NgayNhap: Date
  MaHang: number
  MaKho: number
  NguoiGiao?: string         // Tên người giao (text)
  NguoiNhan?: string         // Tên người nhận (text)
  SoLuong?: number
  DonGia?: number
  DienGiai?: string
}

export interface CreateNhapHangDto {
  NgayNhap: Date
  MaHang: number
  MaKho: number
  NguoiGiao?: string         // Tên người giao
  NguoiNhan?: string         // Tên người nhận
  SoLuong?: number
  DonGia?: number
  DienGiai?: string
}

export interface NhapHangWithDetails extends NhapHang {
  TenHang?: string
  TenKho?: string
}

// XuatHang - Xuất hàng hóa từ kho
// Schema: XuatHang (SoPhieuX, NgayXuat, MaHang, MaKho, NguoiGiao, NguoiNhan, DienGiai)
export interface XuatHang {
  MaXuat: number
  SoPhieuX: string           // PX202601-001
  NgayXuat: Date
  MaHang: number
  MaKho: number
  NguoiGiao?: string         // Tên người giao (text)
  NguoiNhan?: string         // Tên người nhận (text)
  SoLuong?: number
  DienGiai?: string
}

export interface CreateXuatHangDto {
  NgayXuat: Date
  MaHang: number
  MaKho: number
  NguoiGiao?: string         // Tên người giao
  NguoiNhan?: string         // Tên người nhận
  SoLuong?: number
  DienGiai?: string
}

export interface XuatHangWithDetails extends XuatHang {
  TenHang?: string
  TenKho?: string
}


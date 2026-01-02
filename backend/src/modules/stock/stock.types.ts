// NhapHang - Nhập hàng hóa vào kho
// Schema: NhapHang (SoPhieuN, NgayNhap, MaHang, MaKho, NguoiGiao(NCC), NguoiNhan(NV), SoLuong, DonGia, DienGiai)
export interface NhapHang {
  MaNhap: number
  SoPhieuN: string           // PN202601-001
  NgayNhap: Date
  MaHang: number
  MaKho: number
  NguoiGiao?: number         // FK to NCC(MaNCC) - NCC giao hàng
  NguoiNhan?: number         // FK to NhanVien(MaNV) - NV nhận hàng
  SoLuong?: number
  DonGia?: number
  DienGiai?: string
}

export interface CreateNhapHangDto {
  NgayNhap: Date
  MaHang: number
  MaKho: number
  NguoiGiao?: number         // MaNCC
  NguoiNhan?: number         // MaNV
  SoLuong?: number
  DonGia?: number
  DienGiai?: string
}

export interface NhapHangWithDetails extends NhapHang {
  TenHang?: string
  TenKho?: string
  TenNCC?: string
  TenNguoiNhan?: string
}

// XuatHang - Xuất hàng hóa từ kho
// Schema: XuatHang (SoPhieuX, NgayXuat, MaHang, MaKho, NguoiGiao(NV), NguoiNhan(NV), SoLuong, DienGiai)
export interface XuatHang {
  MaXuat: number
  SoPhieuX: string           // PX202601-001
  NgayXuat: Date
  MaHang: number
  MaKho: number
  NguoiGiao?: number         // FK to NhanVien(MaNV) - NV kho giao
  NguoiNhan?: number         // FK to NhanVien(MaNV) - NV nhận
  SoLuong?: number
  DienGiai?: string
}

export interface CreateXuatHangDto {
  NgayXuat: Date
  MaHang: number
  MaKho: number
  NguoiGiao?: number         // MaNV
  NguoiNhan?: number         // MaNV
  SoLuong?: number
  DienGiai?: string
}

export interface XuatHangWithDetails extends XuatHang {
  TenHang?: string
  TenKho?: string
  TenNguoiGiao?: string
  TenNguoiNhan?: string
}


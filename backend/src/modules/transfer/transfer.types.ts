export interface DieuChuyen {
  MaDC: number
  SoPhieuDC: string
  NgayDC: Date
  MaHang: number
  TuKho?: number
  DenKho?: number
  NguoiGiao?: number  // Người giao (đang giữ)
  NguoiNhan?: number  // Người nhận
  SoLuong?: number
  DienGiai?: string
}

export interface CreateTransferDto {
  NgayDC: Date
  MaHang: number
  TuKho?: number
  DenKho?: number
  NguoiGiao?: number
  NguoiNhan?: number
  SoLuong?: number
  DienGiai?: string
}

export interface TransferWithDetails extends DieuChuyen {
  TenNVGiao?: string
  TenNVNhan?: string
  TenHang?: string
  TenKhoTu?: string
  TenKhoDen?: string
}

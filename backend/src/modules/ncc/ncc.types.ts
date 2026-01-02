// Types cho module Nhà Cung Cấp

export interface NCC {
  MaNCC: number
  TenNCC: string
  DiaChi?: string
  SoDienThoai?: string
  Email?: string
  NguoiLienHe?: string
  GhiChu?: string
  NgayTao?: Date
  NgayCapNhat?: Date
}

export interface CreateNCCRequest {
  TenNCC: string
  DiaChi?: string
  SoDienThoai?: string
  Email?: string
  NguoiLienHe?: string
  GhiChu?: string
}

export interface UpdateNCCRequest extends Partial<CreateNCCRequest> {}

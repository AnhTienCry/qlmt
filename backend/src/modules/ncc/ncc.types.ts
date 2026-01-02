// Types cho module Nhà Cung Cấp

export interface NCC {
  MaNCC: number
  MaSoThue?: string
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
  MaSoThue?: string
  TenNCC: string
  DiaChi?: string
  SoDienThoai?: string
  Email?: string
  NguoiLienHe?: string
  GhiChu?: string
}

export interface UpdateNCCRequest extends Partial<CreateNCCRequest> {}

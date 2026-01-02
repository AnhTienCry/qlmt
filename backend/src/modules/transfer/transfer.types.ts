export interface DieuChuyen {
  MaDC: number
  SoPhieuDC: string
  NgayDC: Date
  MaNV1: number  // Người giao
  MaNV2: number  // Người nhận
  MaHang: number
  DienGiai?: string
}

export interface CreateTransferDto {
  NgayDC: Date
  MaNV1: number
  MaNV2: number
  MaHang: number
  DienGiai?: string
}

export interface TransferWithDetails extends DieuChuyen {
  TenNV1?: string
  TenNV2?: string
  TenHang?: string
}

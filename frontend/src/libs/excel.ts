import * as XLSX from 'xlsx'

interface ExportOptions {
  filename: string
  sheetName?: string
}

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param columns Column configuration with key, title mappings
 * @param options Export options (filename, sheetName)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; title: string }[],
  options: ExportOptions
) {
  // Transform data to use column titles as headers
  const exportData = data.map(item => {
    const row: Record<string, any> = {}
    columns.forEach(col => {
      row[col.title] = item[col.key]
    })
    return row
  })

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // Auto-size columns
  const colWidths = columns.map(col => ({
    wch: Math.max(
      col.title.length,
      ...data.map(item => String(item[col.key] || '').length)
    ) + 2
  }))
  worksheet['!cols'] = colWidths

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1')

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10)
  const filename = `${options.filename}_${timestamp}.xlsx`

  // Download file
  XLSX.writeFile(workbook, filename)
}

/**
 * Export Users data
 */
export function exportUsers(users: any[]) {
  const columns = [
    { key: 'UserId', title: 'ID' },
    { key: 'Username', title: 'Tên đăng nhập' },
    { key: 'Role', title: 'Vai trò' },
    { key: 'IsActive', title: 'Trạng thái' },
    { key: 'LastLogin', title: 'Đăng nhập gần nhất' },
    { key: 'NgayTao', title: 'Ngày tạo' },
  ]

  const formattedData = users.map(user => ({
    ...user,
    Role: getRoleLabel(user.Role),
    IsActive: user.IsActive ? 'Hoạt động' : 'Khóa',
    LastLogin: user.LastLogin ? new Date(user.LastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập',
    NgayTao: new Date(user.NgayTao).toLocaleDateString('vi-VN'),
  }))

  exportToExcel(formattedData, columns, { filename: 'DanhSachNguoiDung', sheetName: 'Người dùng' })
}

/**
 * Export Hàng hóa data
 */
export function exportHangHoa(items: any[]) {
  const columns = [
    { key: 'MaHang', title: 'Mã hàng' },
    { key: 'TenHang', title: 'Tên hàng' },
    { key: 'LoaiHang', title: 'Loại hàng' },
    { key: 'TenNCC', title: 'Nhà cung cấp' },
    { key: 'TenKho', title: 'Kho hàng' },
    { key: 'TrangThai', title: 'Trạng thái' },
    { key: 'GiaTri', title: 'Giá trị' },
    { key: 'NgayNhap', title: 'Ngày nhập' },
  ]

  const formattedData = items.map(item => ({
    ...item,
    GiaTri: item.GiaTri ? `${item.GiaTri.toLocaleString('vi-VN')} đ` : '',
    NgayNhap: item.NgayNhap ? new Date(item.NgayNhap).toLocaleDateString('vi-VN') : '',
  }))

  exportToExcel(formattedData, columns, { filename: 'DanhSachHangHoa', sheetName: 'Hàng hóa' })
}

/**
 * Export NCC data
 */
export function exportNCC(items: any[]) {
  const columns = [
    { key: 'MaNCC', title: 'Mã NCC' },
    { key: 'TenNCC', title: 'Tên nhà cung cấp' },
    { key: 'DiaChi', title: 'Địa chỉ' },
    { key: 'SDT', title: 'Số điện thoại' },
    { key: 'Email', title: 'Email' },
  ]

  exportToExcel(items, columns, { filename: 'DanhSachNhaCungCap', sheetName: 'Nhà cung cấp' })
}

/**
 * Export Departments data
 */
export function exportDepartments(items: any[]) {
  const columns = [
    { key: 'MaPB', title: 'Mã phòng ban' },
    { key: 'TenPB', title: 'Tên phòng ban' },
    { key: 'DiaChi', title: 'Địa chỉ' },
  ]

  exportToExcel(items, columns, { filename: 'DanhSachPhongBan', sheetName: 'Phòng ban' })
}

/**
 * Export Employees data
 * NhanVien (MaNV, TenNV, MatKhau, MaPB, NgayBDLV)
 */
export function exportEmployees(items: any[]) {
  const columns = [
    { key: 'MaNV', title: 'Mã NV' },
    { key: 'TenNV', title: 'Tên NV' },
    { key: 'MaPB', title: 'Mã phòng ban' },
    { key: 'TenPB', title: 'Tên phòng ban' },
    { key: 'NgayBDLV', title: 'Ngày bắt đầu làm việc' },
    { key: 'Email', title: 'Email' },
    { key: 'SoDienThoai', title: 'Số điện thoại' },
  ]

  const formattedData = items.map(item => ({
    ...item,
    NgayBDLV: item.NgayBDLV ? new Date(item.NgayBDLV).toLocaleDateString('vi-VN') : '',
  }))

  exportToExcel(formattedData, columns, { filename: 'DanhSachNhanVien', sheetName: 'Nhân viên' })
}

/**
 * Export Warehouses data
 */
export function exportWarehouses(items: any[]) {
  const columns = [
    { key: 'MaKho', title: 'Mã kho' },
    { key: 'TenKho', title: 'Tên kho' },
    { key: 'DiaChi', title: 'Địa chỉ' },
    { key: 'MoTa', title: 'Mô tả' },
  ]

  exportToExcel(items, columns, { filename: 'DanhSachKhoHang', sheetName: 'Kho hàng' })
}

/**
 * Export Stock In (Nhập hàng) data
 * NhapHang (SoPhieuN, NgayNhap, MaHang, MaKho, NguoiGiao, NguoiNhan, DienGiai)
 */
export function exportStockIn(items: any[]) {
  const columns = [
    { key: 'SoPhieuN', title: 'Số PN' },
    { key: 'NgayNhap', title: 'Ngày nhập' },
    { key: 'MaHang', title: 'Mã hàng' },
    { key: 'TenHang', title: 'Tên hàng' },
    { key: 'MaKho', title: 'Mã kho' },
    { key: 'TenKho', title: 'Tên kho' },
    { key: 'NguoiGiao', title: 'Người giao' },
    { key: 'NguoiNhan', title: 'Người nhận' },
    { key: 'SoLuong', title: 'Số lượng' },
    { key: 'DonGia', title: 'Đơn giá' },
    { key: 'DienGiai', title: 'Diễn giải' },
  ]

  const formattedData = items.map(item => ({
    ...item,
    DonGia: item.DonGia ? `${item.DonGia.toLocaleString('vi-VN')} đ` : '',
    NgayNhap: item.NgayNhap ? new Date(item.NgayNhap).toLocaleDateString('vi-VN') : '',
  }))

  exportToExcel(formattedData, columns, { filename: 'DanhSachNhapHang', sheetName: 'Nhập hàng' })
}

/**
 * Export Stock Out (Xuất hàng) data
 * XuatHang (SoPhieuX, NgayXuat, MaHang, MaKho, NguoiGiao, NguoiNhan, DienGiai)
 */
export function exportStockOut(items: any[]) {
  const columns = [
    { key: 'SoPhieuX', title: 'Số PX' },
    { key: 'NgayXuat', title: 'Ngày xuất' },
    { key: 'MaHang', title: 'Mã hàng' },
    { key: 'TenHang', title: 'Tên hàng' },
    { key: 'MaKho', title: 'Mã kho' },
    { key: 'TenKho', title: 'Tên kho' },
    { key: 'NguoiGiao', title: 'Người giao' },
    { key: 'NguoiNhan', title: 'Người nhận' },
    { key: 'SoLuong', title: 'Số lượng' },
    { key: 'DienGiai', title: 'Diễn giải' },
  ]

  const formattedData = items.map(item => ({
    ...item,
    NgayXuat: item.NgayXuat ? new Date(item.NgayXuat).toLocaleDateString('vi-VN') : '',
  }))

  exportToExcel(formattedData, columns, { filename: 'DanhSachXuatHang', sheetName: 'Xuất hàng' })
}

/**
 * Export Transfer (Điều chuyển) data
 * DieuChuyen (SoPhieuDC, NgayDC, MaNV1, MaNV2, MaHang, DienGiai)
 */
export function exportTransfer(items: any[]) {
  const columns = [
    { key: 'SoPhieuDC', title: 'Số phiếu DC' },
    { key: 'NgayDC', title: 'Ngày' },
    { key: 'MaNV1', title: 'Mã NV giao' },
    { key: 'TenNV1', title: 'Tên NV giao' },
    { key: 'MaNV2', title: 'Mã NV nhận' },
    { key: 'TenNV2', title: 'Tên NV nhận' },
    { key: 'MaHang', title: 'Mã hàng' },
    { key: 'TenHang', title: 'Tên hàng' },
    { key: 'DienGiai', title: 'Diễn giải' },
  ]

  const formattedData = items.map(item => ({
    ...item,
    NgayDC: item.NgayDC ? new Date(item.NgayDC).toLocaleDateString('vi-VN') : '',
  }))

  exportToExcel(formattedData, columns, { filename: 'DanhSachDieuChuyen', sheetName: 'Điều chuyển' })
}

/**
 * Export Báo cáo nhập xuất tồn kho
 * Format theo yêu cầu của thầy: STT, Mã hàng, Tên hàng, Đầu kỳ, Nhập, Xuất, Tồn
 */
export function exportBaoCaoNhapXuatTon(items: any[], tuNgay: string, denNgay: string) {
  // Tạo worksheet thủ công để có header đẹp hơn
  const wb = XLSX.utils.book_new()
  
  // Tạo data với header báo cáo
  const wsData: any[][] = [
    ['BÁO CÁO NHẬP XUẤT TỒN'],
    [`Từ ngày: ${new Date(tuNgay).toLocaleDateString('vi-VN')} đến ngày: ${new Date(denNgay).toLocaleDateString('vi-VN')}`],
    [], // Dòng trống
    ['STT', 'Mã hàng', 'Tên hàng', 'Đầu kỳ', 'Nhập', 'Xuất', 'Tồn'],
  ]

  // Thêm dữ liệu
  items.forEach((item, index) => {
    wsData.push([
      index + 1,
      item.MaHang,
      item.TenHang,
      item.DauKy || 0,
      item.Nhap || 0,
      item.Xuat || 0,
      item.Ton || 0,
    ])
  })

  // Thêm dòng tổng cộng
  wsData.push([])
  wsData.push([
    '',
    '',
    'TỔNG CỘNG',
    items.reduce((sum, item) => sum + (item.DauKy || 0), 0),
    items.reduce((sum, item) => sum + (item.Nhap || 0), 0),
    items.reduce((sum, item) => sum + (item.Xuat || 0), 0),
    items.reduce((sum, item) => sum + (item.Ton || 0), 0),
  ])

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Merge cells cho tiêu đề
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge row 1 (tiêu đề)
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Merge row 2 (thời gian)
  ]

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // STT
    { wch: 15 },  // Mã hàng
    { wch: 30 },  // Tên hàng
    { wch: 10 },  // Đầu kỳ
    { wch: 10 },  // Nhập
    { wch: 10 },  // Xuất
    { wch: 10 },  // Tồn
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo NXT')

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10)
  const filename = `BaoCaoNhapXuatTon_${timestamp}.xlsx`

  XLSX.writeFile(wb, filename)
}

// Helper functions
function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    admin: 'Quản trị viên',
    it: 'IT',
    director: 'Giám đốc',
    user: 'Nhân viên',
  }
  return roleLabels[role] || role
}

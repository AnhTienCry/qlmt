-- =============================================
-- FIX BẢNG NHẬP HÀNG / XUẤT HÀNG THEO YÊU CẦU THẦY
-- =============================================

USE QuanLyMayTinhDB;
GO

-- Xóa bảng cũ nếu có (cẩn thận khi chạy!)
-- DROP TABLE IF EXISTS NhapHang;
-- DROP TABLE IF EXISTS XuatHang;

-- =============================================
-- BẢNG NHẬP HÀNG (NhapHang) - Đúng yêu cầu thầy
-- SoPhieuN, NgayNhap, MaHang, MaKho, NguoiGiao (NCC), NguoiNhan (NV), DienGiai
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhapHang') AND name = 'NguoiGiao')
BEGIN
    -- Nếu bảng cũ có cấu trúc khác, thêm cột mới
    ALTER TABLE NhapHang ADD NguoiGiao INT;
    ALTER TABLE NhapHang ADD NguoiNhan INT;
    PRINT N'✅ Thêm cột NguoiGiao, NguoiNhan vào NhapHang';
END
GO

-- =============================================
-- BẢNG XUẤT HÀNG (XuatHang) - Đúng yêu cầu thầy
-- SoPhieuX, NgayXuat, MaHang, MaKho, NguoiGiao (NV), NguoiNhan (NV), DienGiai
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('XuatHang') AND name = 'NguoiGiao')
BEGIN
    ALTER TABLE XuatHang ADD NguoiGiao INT;
    ALTER TABLE XuatHang ADD NguoiNhan INT;
    PRINT N'✅ Thêm cột NguoiGiao, NguoiNhan vào XuatHang';
END
GO

PRINT N'';
PRINT N'=============================================';
PRINT N'✅ FIX DATABASE HOÀN TẤT!';
PRINT N'=============================================';
GO

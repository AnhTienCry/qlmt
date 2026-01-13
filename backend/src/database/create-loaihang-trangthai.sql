-- ============================================
-- Script tạo bảng LoaiHang và TrangThai
-- Chạy script này trên SQL Server để tạo các bảng quản lý
-- ============================================

USE QuanLyMayTinhDB;
GO

-- ============================================
-- Bảng LoaiHang - Quản lý loại hàng hóa
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LoaiHang]') AND type in (N'U'))
BEGIN
    CREATE TABLE LoaiHang (
        MaLoai INT IDENTITY(1,1) PRIMARY KEY,
        MaLoaiText NVARCHAR(50) NOT NULL UNIQUE,  -- Mã loại: may_tinh, man_hinh, v.v.
        TenLoai NVARCHAR(100) NOT NULL,           -- Tên hiển thị: Máy tính, Màn hình
        MoTa NVARCHAR(255),                       -- Mô tả thêm
        NgayTao DATETIME DEFAULT GETDATE()
    );
    PRINT N'✅ Đã tạo bảng LoaiHang';
END
ELSE
    PRINT N'ℹ️ Bảng LoaiHang đã tồn tại';
GO

-- ============================================
-- Bảng TrangThai - Quản lý trạng thái hàng hóa
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TrangThai]') AND type in (N'U'))
BEGIN
    CREATE TABLE TrangThai (
        MaTrangThai INT IDENTITY(1,1) PRIMARY KEY,
        MaTrangThaiText NVARCHAR(50) NOT NULL UNIQUE,  -- Mã: moi, dang_dung, hong
        TenTrangThai NVARCHAR(100) NOT NULL,           -- Tên: Mới, Đang dùng, Hỏng
        MauSac NVARCHAR(20),                           -- Màu hiển thị: green, blue, red
        MoTa NVARCHAR(255),
        NgayTao DATETIME DEFAULT GETDATE()
    );
    PRINT N'✅ Đã tạo bảng TrangThai';
END
ELSE
    PRINT N'ℹ️ Bảng TrangThai đã tồn tại';
GO

-- ============================================
-- SEED DATA - Dữ liệu mẫu cho LoaiHang
-- ============================================
IF NOT EXISTS (SELECT 1 FROM LoaiHang WHERE MaLoaiText = 'may_tinh')
BEGIN
    INSERT INTO LoaiHang (MaLoaiText, TenLoai, MoTa) VALUES
        ('may_tinh', N'Máy tính', N'Máy tính để bàn, PC'),
        ('laptop', N'Laptop', N'Máy tính xách tay'),
        ('man_hinh', N'Màn hình', N'Màn hình máy tính'),
        ('phim', N'Bàn phím', N'Bàn phím có dây, không dây'),
        ('chuot', N'Chuột', N'Chuột có dây, không dây'),
        ('may_in', N'Máy in', N'Máy in văn phòng'),
        ('dau_chuyen', N'Đầu chuyển đổi', N'Adapter, Hub, Dock'),
        ('thiet_bi_mang', N'Thiết bị mạng', N'Router, Switch, Access Point'),
        ('phu_kien', N'Phụ kiện', N'Tai nghe, webcam, USB, v.v.'),
        ('khac', N'Khác', N'Các thiết bị khác');
    PRINT N'✅ Đã thêm dữ liệu mẫu cho LoaiHang';
END
ELSE
    PRINT N'ℹ️ Dữ liệu LoaiHang đã tồn tại';
GO

-- ============================================
-- SEED DATA - Dữ liệu mẫu cho TrangThai
-- ============================================
IF NOT EXISTS (SELECT 1 FROM TrangThai WHERE MaTrangThaiText = 'moi')
BEGIN
    INSERT INTO TrangThai (MaTrangThaiText, TenTrangThai, MauSac, MoTa) VALUES
        ('moi', N'Mới', 'green', N'Hàng hóa mới, chưa sử dụng'),
        ('dang_dung', N'Đang dùng', 'blue', N'Đang được sử dụng'),
        ('bao_tri', N'Bảo trì', 'yellow', N'Đang trong quá trình bảo trì'),
        ('hong', N'Hỏng', 'red', N'Hàng hóa bị hỏng, cần sửa chữa'),
        ('thanh_ly', N'Thanh lý', 'gray', N'Đã thanh lý hoặc không còn sử dụng');
    PRINT N'✅ Đã thêm dữ liệu mẫu cho TrangThai';
END
ELSE
    PRINT N'ℹ️ Dữ liệu TrangThai đã tồn tại';
GO

PRINT N'';
PRINT N'========================================';
PRINT N'✅ HOÀN TẤT TẠO BẢNG LOẠI HÀNG VÀ TRẠNG THÁI';
PRINT N'========================================';
GO

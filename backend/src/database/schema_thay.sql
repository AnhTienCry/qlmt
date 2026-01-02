-- =============================================
-- DATABASE SCHEMA THEO YÊU CẦU THẦY
-- Chạy file này để tạo/cập nhật database
-- =============================================

-- Tạo Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'QuanLyMayTinhDB')
BEGIN
    CREATE DATABASE QuanLyMayTinhDB;
END
GO

USE QuanLyMayTinhDB;
GO

-- =============================================
-- 1. BẢNG PHÒNG BAN (PhongBan)
-- PhongBan (MaPB, TenPB)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PhongBan')
BEGIN
    CREATE TABLE PhongBan (
        MaPB INT IDENTITY(1,1) PRIMARY KEY,
        TenPB NVARCHAR(100) NOT NULL,
        MoTa NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    PRINT N'✅ Tạo bảng PhongBan thành công';
END
GO

-- =============================================
-- 2. BẢNG NHÂN VIÊN (NhanVien)
-- NhanVien (MaNV, TenNV, MatKhau, MaPB, NgayBDLV)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NhanVien')
BEGIN
    CREATE TABLE NhanVien (
        MaNV INT IDENTITY(1,1) PRIMARY KEY,
        TenNV NVARCHAR(100) NOT NULL,
        MatKhau NVARCHAR(255),              -- Mật khẩu (hash)
        MaPB INT FOREIGN KEY REFERENCES PhongBan(MaPB),
        NgayBDLV DATE,                       -- Ngày bắt đầu làm việc
        Email NVARCHAR(100),
        SoDienThoai NVARCHAR(20),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    PRINT N'✅ Tạo bảng NhanVien thành công';
END
ELSE
BEGIN
    -- Thêm cột MatKhau nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhanVien') AND name = 'MatKhau')
    BEGIN
        ALTER TABLE NhanVien ADD MatKhau NVARCHAR(255);
        PRINT N'✅ Thêm cột MatKhau vào NhanVien';
    END
    
    -- Thêm cột NgayBDLV nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhanVien') AND name = 'NgayBDLV')
    BEGIN
        ALTER TABLE NhanVien ADD NgayBDLV DATE;
        PRINT N'✅ Thêm cột NgayBDLV vào NhanVien';
    END
END
GO

-- =============================================
-- 3. BẢNG NHÀ CUNG CẤP (NCC)
-- NCC (MaNCC, TenNCC)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NCC')
BEGIN
    CREATE TABLE NCC (
        MaNCC INT IDENTITY(1,1) PRIMARY KEY,
        TenNCC NVARCHAR(200) NOT NULL,
        DiaChi NVARCHAR(500),
        SoDienThoai NVARCHAR(20),
        Email NVARCHAR(100),
        NguoiLienHe NVARCHAR(100),
        GhiChu NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    PRINT N'✅ Tạo bảng NCC thành công';
END
GO

-- =============================================
-- 4. BẢNG KHO HÀNG (KhoHang)
-- KhoHang (MaKho, TenKho)
-- =============================================
-- Đổi tên bảng Kho -> KhoHang nếu cần
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Kho') AND NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'KhoHang')
BEGIN
    EXEC sp_rename 'Kho', 'KhoHang';
    PRINT N'✅ Đổi tên bảng Kho -> KhoHang';
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'KhoHang') AND NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Kho')
BEGIN
    CREATE TABLE KhoHang (
        MaKho INT IDENTITY(1,1) PRIMARY KEY,
        TenKho NVARCHAR(100) NOT NULL,
        DiaChi NVARCHAR(255),
        MoTa NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    PRINT N'✅ Tạo bảng KhoHang thành công';
END
GO

-- =============================================
-- 5. BẢNG HÀNG HÓA (HangHoa)
-- HangHoa (MaHang, TenHang, ThongTinHang)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HangHoa')
BEGIN
    CREATE TABLE HangHoa (
        MaHang INT IDENTITY(1,1) PRIMARY KEY,
        TenHang NVARCHAR(200) NOT NULL,
        ThongTinHang NVARCHAR(MAX),          -- Thông tin chi tiết
        LoaiHang NVARCHAR(50),               -- 'may_tinh', 'man_hinh', 'phim', 'chuot', etc.
        DonViTinh NVARCHAR(50),
        DonGia DECIMAL(18,2),
        MaNCC INT FOREIGN KEY REFERENCES NCC(MaNCC),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    PRINT N'✅ Tạo bảng HangHoa thành công';
END
GO

-- =============================================
-- 6. BẢNG NHẬP HÀNG (NhapHang)
-- NhapHang (SoPhieuN, NgayNhap, MaHang, MaKho, NguoiGiao, NguoiNhan, DienGiai)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NhapHang')
BEGIN
    CREATE TABLE NhapHang (
        MaNhap INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuN NVARCHAR(20) NOT NULL,         -- PN202601-001
        NgayNhap DATE NOT NULL,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        MaKho INT,                               -- FK sẽ thêm sau khi có bảng KhoHang
        NguoiGiao NVARCHAR(200),                 -- Tên người giao (có thể là NCC hoặc text)
        NguoiNhan NVARCHAR(200),                 -- Tên người nhận
        SoLuong INT DEFAULT 1,
        DonGia DECIMAL(18,2),
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_NhapHang_SoPhieu ON NhapHang(SoPhieuN);
    CREATE INDEX IX_NhapHang_NgayNhap ON NhapHang(NgayNhap);
    PRINT N'✅ Tạo bảng NhapHang thành công';
END
ELSE
BEGIN
    -- Đổi cột MaNCC -> NguoiGiao nếu cần
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhapHang') AND name = 'MaNCC')
    AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhapHang') AND name = 'NguoiGiao')
    BEGIN
        ALTER TABLE NhapHang DROP CONSTRAINT IF EXISTS FK_NhapHang_NCC;
        EXEC sp_rename 'NhapHang.MaNCC', 'NguoiGiao_Old', 'COLUMN';
        ALTER TABLE NhapHang ADD NguoiGiao NVARCHAR(200);
        PRINT N'✅ Đổi cột MaNCC -> NguoiGiao trong NhapHang';
    END
    
    -- Đổi cột MaNV_NguoiNhan -> NguoiNhan nếu cần
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhapHang') AND name = 'MaNV_NguoiNhan')
    AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhapHang') AND name = 'NguoiNhan')
    BEGIN
        ALTER TABLE NhapHang DROP CONSTRAINT IF EXISTS FK_NhapHang_NhanVien;
        EXEC sp_rename 'NhapHang.MaNV_NguoiNhan', 'NguoiNhan_Old', 'COLUMN';
        ALTER TABLE NhapHang ADD NguoiNhan NVARCHAR(200);
        PRINT N'✅ Đổi cột MaNV_NguoiNhan -> NguoiNhan trong NhapHang';
    END
    
    -- Thêm cột NguoiGiao nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhapHang') AND name = 'NguoiGiao')
    BEGIN
        ALTER TABLE NhapHang ADD NguoiGiao NVARCHAR(200);
        PRINT N'✅ Thêm cột NguoiGiao vào NhapHang';
    END
    
    -- Thêm cột NguoiNhan nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhapHang') AND name = 'NguoiNhan')
    BEGIN
        ALTER TABLE NhapHang ADD NguoiNhan NVARCHAR(200);
        PRINT N'✅ Thêm cột NguoiNhan vào NhapHang';
    END
END
GO

-- =============================================
-- 7. BẢNG XUẤT HÀNG (XuatHang)
-- XuatHang (SoPhieuX, NgayXuat, MaHang, MaKho, NguoiGiao, NguoiNhan, DienGiai)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'XuatHang')
BEGIN
    CREATE TABLE XuatHang (
        MaXuat INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuX NVARCHAR(20) NOT NULL,         -- PX202601-001
        NgayXuat DATE NOT NULL,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        MaKho INT,                               -- FK sẽ thêm sau khi có bảng KhoHang
        NguoiGiao NVARCHAR(200),                 -- Tên người giao
        NguoiNhan NVARCHAR(200),                 -- Tên người nhận
        SoLuong INT DEFAULT 1,
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_XuatHang_SoPhieu ON XuatHang(SoPhieuX);
    CREATE INDEX IX_XuatHang_NgayXuat ON XuatHang(NgayXuat);
    PRINT N'✅ Tạo bảng XuatHang thành công';
END
ELSE
BEGIN
    -- Thêm cột NguoiGiao nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('XuatHang') AND name = 'NguoiGiao')
    BEGIN
        ALTER TABLE XuatHang ADD NguoiGiao NVARCHAR(200);
        PRINT N'✅ Thêm cột NguoiGiao vào XuatHang';
    END
    
    -- Thêm cột NguoiNhan nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('XuatHang') AND name = 'NguoiNhan')
    BEGIN
        ALTER TABLE XuatHang ADD NguoiNhan NVARCHAR(200);
        PRINT N'✅ Thêm cột NguoiNhan vào XuatHang';
    END
END
GO

-- =============================================
-- 8. BẢNG ĐIỀU CHUYỂN (DieuChuyen)
-- DieuChuyen (SoPhieuDC, NgayDC, MaNV1, MaNV2, MaHang, DienGiai)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DieuChuyen')
BEGIN
    CREATE TABLE DieuChuyen (
        MaDC INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuDC NVARCHAR(20) NOT NULL,        -- DC202601-001
        NgayDC DATE NOT NULL,
        MaNV1 INT FOREIGN KEY REFERENCES NhanVien(MaNV),  -- Người giao (đang giữ hàng)
        MaNV2 INT FOREIGN KEY REFERENCES NhanVien(MaNV),  -- Người nhận
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_DieuChuyen_SoPhieu ON DieuChuyen(SoPhieuDC);
    CREATE INDEX IX_DieuChuyen_NgayDC ON DieuChuyen(NgayDC);
    PRINT N'✅ Tạo bảng DieuChuyen thành công';
END
GO

-- =============================================
-- 9. BẢNG ĐỀ XUẤT (DeXuat)
-- DeXuat (SoPhieu, NgayCT, MaNV, MaHang, NoiDung, ITXacNhan, KQ)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeXuat')
BEGIN
    CREATE TABLE DeXuat (
        MaDeXuat INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieu NVARCHAR(20) NOT NULL,          -- DX202601-001
        NgayCT DATE NOT NULL,                    -- Ngày chứng từ
        MaNV INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        NoiDung NVARCHAR(MAX),                   -- Nội dung đề xuất
        ITXacNhan BIT DEFAULT 0,                 -- IT đã xác nhận chưa
        ITGhiChu NVARCHAR(500),                  -- Ghi chú của IT
        ITNgayXN DATETIME2,                      -- Ngày IT xác nhận
        KQ NVARCHAR(50),                         -- Kết quả: 'Chờ duyệt', 'Đã duyệt', 'Từ chối'
        GDGhiChu NVARCHAR(500),                  -- Ghi chú của Giám đốc
        GDNgayDuyet DATETIME2,                   -- Ngày giám đốc duyệt
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_DeXuat_SoPhieu ON DeXuat(SoPhieu);
    CREATE INDEX IX_DeXuat_NgayCT ON DeXuat(NgayCT);
    CREATE INDEX IX_DeXuat_MaNV ON DeXuat(MaNV);
    PRINT N'✅ Tạo bảng DeXuat thành công';
END
GO

-- =============================================
-- 10. BẢNG USERS (Đăng nhập - bổ sung)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Role NVARCHAR(20) NOT NULL CHECK (Role IN ('admin', 'it', 'director', 'user')),
        MaNV INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        IsActive BIT DEFAULT 1,
        LastLogin DATETIME2,
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    PRINT N'✅ Tạo bảng Users thành công';
END
GO

-- =============================================
-- DỮ LIỆU MẪU
-- =============================================

-- Phòng ban mẫu
IF NOT EXISTS (SELECT * FROM PhongBan)
BEGIN
    INSERT INTO PhongBan (TenPB, MoTa) VALUES
    (N'Ban Giám đốc', N'Ban lãnh đạo công ty'),
    (N'Phòng IT', N'Phòng công nghệ thông tin'),
    (N'Phòng Kế toán', N'Phòng kế toán tài chính'),
    (N'Phòng Nhân sự', N'Phòng quản lý nhân sự'),
    (N'Phòng Kinh doanh', N'Phòng kinh doanh');
    PRINT N'✅ Thêm PhongBan mẫu';
END
GO

-- Nhân viên mẫu
IF NOT EXISTS (SELECT * FROM NhanVien)
BEGIN
    INSERT INTO NhanVien (TenNV, MaPB, NgayBDLV, Email, SoDienThoai) VALUES
    (N'Nguyễn Văn Admin', 1, '2020-01-01', N'admin@company.com', N'0901234567'),
    (N'Trần Thị IT', 2, '2021-03-15', N'it@company.com', N'0902345678'),
    (N'Lê Văn User', 3, '2022-06-01', N'user@company.com', N'0903456789'),
    (N'Phạm Thị Director', 1, '2019-01-01', N'director@company.com', N'0904567890');
    PRINT N'✅ Thêm NhanVien mẫu';
END
GO

-- Kho hàng mẫu (sử dụng tên bảng phù hợp)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'KhoHang')
BEGIN
    IF NOT EXISTS (SELECT * FROM KhoHang)
    BEGIN
        INSERT INTO KhoHang (TenKho, DiaChi, MoTa) VALUES
        (N'Kho Chính', N'Tầng 1, Tòa nhà A', N'Kho lưu trữ chính'),
        (N'Kho Phụ', N'Tầng 2, Tòa nhà B', N'Kho lưu trữ phụ');
        PRINT N'✅ Thêm KhoHang mẫu';
    END
END
ELSE IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Kho')
BEGIN
    IF NOT EXISTS (SELECT * FROM Kho)
    BEGIN
        INSERT INTO Kho (TenKho, DiaChi, MoTa) VALUES
        (N'Kho Chính', N'Tầng 1, Tòa nhà A', N'Kho lưu trữ chính'),
        (N'Kho Phụ', N'Tầng 2, Tòa nhà B', N'Kho lưu trữ phụ');
        PRINT N'✅ Thêm Kho mẫu';
    END
END
GO

-- NCC mẫu
IF NOT EXISTS (SELECT * FROM NCC)
BEGIN
    INSERT INTO NCC (TenNCC, DiaChi, SoDienThoai, Email, NguoiLienHe) VALUES
    (N'Công ty TNHH Phong Vũ', N'123 Nguyễn Thị Minh Khai, Q.1, TP.HCM', N'028 3925 3236', N'contact@phongvu.vn', N'Nguyễn Văn A'),
    (N'FPT Shop', N'261-263 Khánh Hội, Q.4, TP.HCM', N'1800 6601', N'hotro@fptshop.com.vn', N'Trần Thị B'),
    (N'Thế Giới Di Động', N'128 Trần Quang Khải, Q.1, TP.HCM', N'1800 1060', N'cskh@thegioididong.com', N'Lê Văn C');
    PRINT N'✅ Thêm NCC mẫu';
END
GO

-- HangHoa mẫu
IF NOT EXISTS (SELECT * FROM HangHoa)
BEGIN
    INSERT INTO HangHoa (TenHang, ThongTinHang, LoaiHang, DonViTinh, DonGia, MaNCC) VALUES
    (N'Máy tính Dell OptiPlex 3080', N'CPU: i5-10500, RAM: 8GB, SSD: 256GB', N'may_tinh', N'Cái', 15000000, 1),
    (N'Màn hình Dell P2419H', N'24 inch, Full HD, IPS', N'man_hinh', N'Cái', 4500000, 1),
    (N'Bàn phím Logitech K120', N'USB, có dây', N'phim', N'Cái', 200000, 2),
    (N'Chuột Logitech B100', N'USB, có dây', N'chuot', N'Cái', 100000, 2),
    (N'Đầu chuyển HDMI to VGA', N'HDMI to VGA Adapter', N'dau_chuyen', N'Cái', 150000, 3),
    (N'Máy tính HP ProDesk 400 G6', N'CPU: i7-9700, RAM: 16GB, SSD: 512GB', N'may_tinh', N'Cái', 20000000, 1);
    PRINT N'✅ Thêm HangHoa mẫu';
END
GO

PRINT N'';
PRINT N'=============================================';
PRINT N'✅ DATABASE SCHEMA THEO YÊU CẦU THẦY - HOÀN TẤT!';
PRINT N'=============================================';
PRINT N'';
PRINT N'Danh sách bảng:';
PRINT N'  1. PhongBan (MaPB, TenPB)';
PRINT N'  2. NhanVien (MaNV, TenNV, MatKhau, MaPB, NgayBDLV)';
PRINT N'  3. NCC (MaNCC, TenNCC)';
PRINT N'  4. HangHoa (MaHang, TenHang, ThongTinHang)';
PRINT N'  5. KhoHang (MaKho, TenKho)';
PRINT N'  6. NhapHang (SoPhieuN, NgayNhap, MaHang, MaKho, NguoiGiao, NguoiNhan, DienGiai)';
PRINT N'  7. XuatHang (SoPhieuX, NgayXuat, MaHang, MaKho, NguoiGiao, NguoiNhan, DienGiai)';
PRINT N'  8. DieuChuyen (SoPhieuDC, NgayDC, MaNV1, MaNV2, MaHang, DienGiai)';
PRINT N'  9. DeXuat (SoPhieu, NgayCT, MaNV, MaHang, NoiDung, ITXacNhan, KQ)';
PRINT N' 10. Users (Bảng đăng nhập hệ thống)';
GO

-- =============================================
-- QUẢN LÝ MÁY TÍNH (QLMT) - DATABASE SCHEMA
-- SQL Server - Version 2.0
-- Ngày cập nhật: 03/01/2026
-- =============================================

-- =============================================
-- TẠO DATABASE
-- =============================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'QuanLyMayTinhDB')
BEGIN
    CREATE DATABASE QuanLyMayTinhDB;
END
GO

USE QuanLyMayTinhDB;
GO

-- =============================================
-- XÓA BẢNG CŨ (nếu cần reset hoàn toàn)
-- Uncomment phần này nếu muốn xóa sạch dữ liệu
-- =============================================
/*
DROP TABLE IF EXISTS LichSuQuet;
DROP TABLE IF EXISTS YeuCauDeXuat;
DROP TABLE IF EXISTS DieuChuyen;
DROP TABLE IF EXISTS XuatHang;
DROP TABLE IF EXISTS NhapHang;
DROP TABLE IF EXISTS HangHoa;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS NhanVien;
DROP TABLE IF EXISTS PhongBan;
DROP TABLE IF EXISTS NCC;
DROP TABLE IF EXISTS Kho;
GO
*/

-- =============================================
-- 1. BẢNG KHO (Warehouses)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Kho')
BEGIN
    CREATE TABLE Kho (
        MaKho INT IDENTITY(1,1) PRIMARY KEY,
        MaKhoText NVARCHAR(50),              -- Mã kho nhập tay (VD: K01, KHO01)
        TenKho NVARCHAR(100) NOT NULL,
        DiaChi NVARCHAR(255),
        MoTa NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    -- Unique index cho mã kho text (cho phép NULL)
    CREATE UNIQUE INDEX UQ_Kho_MaKhoText ON Kho(MaKhoText) WHERE MaKhoText IS NOT NULL;
    
    PRINT N'✅ Created table: Kho';
END
GO

-- =============================================
-- 2. BẢNG NHÀ CUNG CẤP (Suppliers)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NCC')
BEGIN
    CREATE TABLE NCC (
        MaNCC INT IDENTITY(1,1) PRIMARY KEY,
        MaSoThue NVARCHAR(20),               -- Mã số thuế (unique)
        TenNCC NVARCHAR(200) NOT NULL,
        SoDienThoai NVARCHAR(20),
        Email NVARCHAR(100),
        NguoiLienHe NVARCHAR(100),
        DiaChi NVARCHAR(255),
        GhiChu NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    -- Unique index cho mã số thuế (cho phép NULL)
    CREATE UNIQUE INDEX UQ_NCC_MaSoThue ON NCC(MaSoThue) WHERE MaSoThue IS NOT NULL;
    
    PRINT N'✅ Created table: NCC';
END
GO

-- =============================================
-- 3. BẢNG PHÒNG BAN (Departments)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PhongBan')
BEGIN
    CREATE TABLE PhongBan (
        MaPB INT IDENTITY(1,1) PRIMARY KEY,
        MaPBText NVARCHAR(20),               -- Mã phòng ban nhập tay (VD: IT, KT, NS)
        TenPB NVARCHAR(100) NOT NULL,
        MoTa NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    -- Unique index cho mã phòng ban text
    CREATE UNIQUE INDEX UQ_PhongBan_MaPBText ON PhongBan(MaPBText) WHERE MaPBText IS NOT NULL;
    
    PRINT N'✅ Created table: PhongBan';
END
GO

-- =============================================
-- 4. BẢNG NHÂN VIÊN (Employees)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NhanVien')
BEGIN
    CREATE TABLE NhanVien (
        MaNV INT IDENTITY(1,1) PRIMARY KEY,
        MaNVText NVARCHAR(20),               -- Mã nhân viên nhập tay (cũng là username)
        TenNV NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100),
        SoDienThoai NVARCHAR(20),
        MaPB INT FOREIGN KEY REFERENCES PhongBan(MaPB),
        NgayBDLV DATE,                       -- Ngày bắt đầu làm việc
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    -- Unique index cho mã nhân viên text
    CREATE UNIQUE INDEX UQ_NhanVien_MaNVText ON NhanVien(MaNVText) WHERE MaNVText IS NOT NULL;
    
    PRINT N'✅ Created table: NhanVien';
END
GO

-- =============================================
-- 5. BẢNG USERS (Tài khoản đăng nhập)
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
    
    PRINT N'✅ Created table: Users';
END
GO

-- =============================================
-- 6. BẢNG HÀNG HÓA (Products/Equipment)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HangHoa')
BEGIN
    CREATE TABLE HangHoa (
        MaHang INT IDENTITY(1,1) PRIMARY KEY,
        MaTS NVARCHAR(50),                   -- Mã tài sản nhập tay
        LoaiHang NVARCHAR(50) NOT NULL,      -- 'may_tinh', 'man_hinh', 'phim', 'chuot', 'dau_chuyen', 'khac'
        TenHang NVARCHAR(200) NOT NULL,
        Hang NVARCHAR(100),                  -- Hãng sản xuất
        Model NVARCHAR(100),
        NamSX INT,
        TrangThai NVARCHAR(50) DEFAULT N'Mới',  -- 'Mới', 'Đang dùng', 'Hỏng', 'Thanh lý'
        ThongTinChiTiet NVARCHAR(MAX),       -- JSON chứa thông tin chi tiết (CPU, RAM, etc.)
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    -- Unique index cho mã tài sản
    CREATE UNIQUE INDEX UQ_HangHoa_MaTS ON HangHoa(MaTS) WHERE MaTS IS NOT NULL;
    
    PRINT N'✅ Created table: HangHoa';
END
GO

-- =============================================
-- 7. BẢNG NHẬP HÀNG (Stock In)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NhapHang')
BEGIN
    CREATE TABLE NhapHang (
        MaNhap INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuN NVARCHAR(50) NOT NULL,      -- Số phiếu nhập (VD: PN202601-001)
        NgayNhap DATE NOT NULL,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        MaKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        NguoiGiao INT FOREIGN KEY REFERENCES NCC(MaNCC),      -- NCC giao hàng
        NguoiNhan INT FOREIGN KEY REFERENCES NhanVien(MaNV),  -- NV nhận hàng
        SoLuong INT DEFAULT 1,
        DonGia DECIMAL(18,2),
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_NhapHang_SoPhieu ON NhapHang(SoPhieuN);
    CREATE INDEX IX_NhapHang_NgayNhap ON NhapHang(NgayNhap);
    
    PRINT N'✅ Created table: NhapHang';
END
GO

-- =============================================
-- 8. BẢNG XUẤT HÀNG (Stock Out)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'XuatHang')
BEGIN
    CREATE TABLE XuatHang (
        MaXuat INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuX NVARCHAR(50) NOT NULL,      -- Số phiếu xuất (VD: PX202601-001)
        NgayXuat DATE NOT NULL,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        MaKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        NguoiGiao INT FOREIGN KEY REFERENCES NhanVien(MaNV),  -- NV kho giao
        NguoiNhan INT FOREIGN KEY REFERENCES NhanVien(MaNV),  -- NV nhận
        SoLuong INT DEFAULT 1,
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_XuatHang_SoPhieu ON XuatHang(SoPhieuX);
    CREATE INDEX IX_XuatHang_NgayXuat ON XuatHang(NgayXuat);
    
    PRINT N'✅ Created table: XuatHang';
END
GO

-- =============================================
-- 9. BẢNG ĐIỀU CHUYỂN (Transfer)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DieuChuyen')
BEGIN
    CREATE TABLE DieuChuyen (
        MaDC INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuDC NVARCHAR(50) NOT NULL,     -- Số phiếu điều chuyển (VD: DC202601-001)
        NgayDC DATE NOT NULL,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        TuKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        DenKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        NguoiGiao INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        NguoiNhan INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        SoLuong INT DEFAULT 1,
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_DieuChuyen_SoPhieu ON DieuChuyen(SoPhieuDC);
    
    PRINT N'✅ Created table: DieuChuyen';
END
GO

-- =============================================
-- 10. BẢNG YÊU CẦU ĐỀ XUẤT (Proposals)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'YeuCauDeXuat')
BEGIN
    CREATE TABLE YeuCauDeXuat (
        MaYC INT IDENTITY(1,1) PRIMARY KEY,
        
        -- Thông tin yêu cầu
        LoaiYC NVARCHAR(50) NOT NULL,              -- 'nang_cap', 'sua_chua', 'mua_moi', 'thay_the'
        TieuDe NVARCHAR(200) NOT NULL,
        MoTa NVARCHAR(MAX),
        LyDo NVARCHAR(500),
        MucDoUuTien NVARCHAR(20) DEFAULT N'Trung bình', -- 'Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'
        
        -- Liên kết
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        MaNV_NguoiTao INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        UserId_NguoiTao INT FOREIGN KEY REFERENCES Users(UserId),
        
        -- Trạng thái workflow
        -- pending: Chờ xử lý
        -- it_processing: IT đang xử lý
        -- waiting_approval: Chờ GĐ duyệt
        -- approved: Đã duyệt
        -- rejected: GĐ từ chối
        -- it_rejected: IT từ chối
        -- completed: Hoàn thành
        TrangThai NVARCHAR(50) DEFAULT 'pending',
        
        -- Xử lý IT
        UserId_IT INT FOREIGN KEY REFERENCES Users(UserId),
        GhiChuIT NVARCHAR(500),
        NgayIT DATETIME2,
        
        -- Duyệt Giám đốc
        UserId_GD INT FOREIGN KEY REFERENCES Users(UserId),
        GhiChuGD NVARCHAR(500),
        NgayDuyet DATETIME2,
        
        -- Hoàn thành
        KetQua NVARCHAR(500),
        NgayHoanThanh DATETIME2,
        
        -- Timestamps
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_YeuCauDeXuat_TrangThai ON YeuCauDeXuat(TrangThai);
    CREATE INDEX IX_YeuCauDeXuat_NguoiTao ON YeuCauDeXuat(UserId_NguoiTao);
    
    PRINT N'✅ Created table: YeuCauDeXuat';
END
GO

-- =============================================
-- 11. BẢNG LỊCH SỬ QUÉT (Scan History) - Optional
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LichSuQuet')
BEGIN
    CREATE TABLE LichSuQuet (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        MAC NVARCHAR(50),
        IPAddress NVARCHAR(45),
        RawData NVARCHAR(MAX),
        NguonQuet NVARCHAR(50),              -- 'agent-tool', 'arp', 'manual'
        NgayQuet DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    PRINT N'✅ Created table: LichSuQuet';
END
GO

-- =============================================
-- DỮ LIỆU MẪU (Sample Data)
-- =============================================

-- Kho mẫu
IF NOT EXISTS (SELECT * FROM Kho)
BEGIN
    INSERT INTO Kho (MaKhoText, TenKho, DiaChi, MoTa) VALUES
    (N'K01', N'Kho chính', N'Tầng 1, Tòa nhà A', N'Kho lưu trữ thiết bị chính'),
    (N'K02', N'Kho chi nhánh HCM', N'Quận 1, TP.HCM', N'Kho chi nhánh miền Nam'),
    (N'K03', N'Kho chi nhánh HN', N'Cầu Giấy, Hà Nội', N'Kho chi nhánh miền Bắc');
    
    PRINT N'✅ Inserted sample data: Kho';
END
GO

-- NCC mẫu
IF NOT EXISTS (SELECT * FROM NCC)
BEGIN
    INSERT INTO NCC (MaSoThue, TenNCC, SoDienThoai, Email, NguoiLienHe, DiaChi) VALUES
    (N'0101234567', N'Công ty TNHH Phong Vũ', N'1800599920', N'sales@phongvu.vn', N'Nguyễn Văn A', N'TP.HCM'),
    (N'0102345678', N'Công ty CP FPT Shop', N'1800633579', N'info@fptshop.com', N'Trần Thị B', N'Hà Nội'),
    (N'0103456789', N'Công ty Dell Việt Nam', N'1800585999', N'support@dell.com.vn', N'John Smith', N'Đà Nẵng');
    
    PRINT N'✅ Inserted sample data: NCC';
END
GO

-- Phòng ban mẫu
IF NOT EXISTS (SELECT * FROM PhongBan)
BEGIN
    INSERT INTO PhongBan (MaPBText, TenPB, MoTa) VALUES
    (N'GD', N'Ban Giám đốc', N'Lãnh đạo công ty'),
    (N'IT', N'Phòng IT', N'Quản lý hệ thống CNTT'),
    (N'KT', N'Phòng Kế toán', N'Quản lý tài chính'),
    (N'NS', N'Phòng Nhân sự', N'Quản lý nhân sự'),
    (N'KD', N'Phòng Kinh doanh', N'Bán hàng và marketing');
    
    PRINT N'✅ Inserted sample data: PhongBan';
END
GO

-- Nhân viên mẫu  
IF NOT EXISTS (SELECT * FROM NhanVien)
BEGIN
    INSERT INTO NhanVien (MaNVText, TenNV, Email, SoDienThoai, MaPB) VALUES
    (N'GD001', N'Nguyễn Văn Giám Đốc', N'giamdoc@company.com', N'0901234567', 1),
    (N'IT001', N'Trần Văn IT', N'it@company.com', N'0901234568', 2),
    (N'KT001', N'Lê Thị Kế Toán', N'ketoan@company.com', N'0901234569', 3),
    (N'NS001', N'Phạm Văn Nhân Sự', N'nhansu@company.com', N'0901234570', 4),
    (N'KD001', N'Hoàng Thị Kinh Doanh', N'kinhdoanh@company.com', N'0901234571', 5);
    
    PRINT N'✅ Inserted sample data: NhanVien';
END
GO

-- Hàng hóa mẫu
IF NOT EXISTS (SELECT * FROM HangHoa)
BEGIN
    INSERT INTO HangHoa (MaTS, LoaiHang, TenHang, Hang, Model, NamSX, TrangThai, ThongTinChiTiet) VALUES
    (N'PC001', N'may_tinh', N'Máy tính Dell Optiplex 7090', N'Dell', N'Optiplex 7090', 2024, N'Mới', N'{"CPU":"Intel i7-11700","RAM":"16GB","SSD":"512GB"}'),
    (N'PC002', N'may_tinh', N'Máy tính HP ProDesk 400', N'HP', N'ProDesk 400 G7', 2024, N'Mới', N'{"CPU":"Intel i5-10500","RAM":"8GB","SSD":"256GB"}'),
    (N'MH001', N'man_hinh', N'Màn hình Dell 24 inch', N'Dell', N'P2422H', 2024, N'Mới', N'{"Size":"24 inch","Resolution":"1920x1080","Panel":"IPS"}'),
    (N'KB001', N'phim', N'Bàn phím Logitech K120', N'Logitech', N'K120', 2024, N'Mới', N'{"Type":"Membrane","Connection":"USB"}'),
    (N'MS001', N'chuot', N'Chuột Logitech M100', N'Logitech', N'M100', 2024, N'Mới', N'{"Type":"Optical","Connection":"USB"}');
    
    PRINT N'✅ Inserted sample data: HangHoa';
END
GO

-- =============================================
-- LƯU Ý: User admin sẽ được tạo tự động bởi backend
-- khi khởi động (seedAdmin.ts)
-- Username: admin
-- Password: admin123
-- =============================================

PRINT N'';
PRINT N'========================================';
PRINT N'✅ DATABASE SETUP COMPLETED!';
PRINT N'========================================';
PRINT N'';
PRINT N'Các bảng đã tạo:';
PRINT N'  1. Kho (Warehouses)';
PRINT N'  2. NCC (Suppliers)';
PRINT N'  3. PhongBan (Departments)';
PRINT N'  4. NhanVien (Employees)';
PRINT N'  5. Users (Accounts)';
PRINT N'  6. HangHoa (Products)';
PRINT N'  7. NhapHang (Stock In)';
PRINT N'  8. XuatHang (Stock Out)';
PRINT N'  9. DieuChuyen (Transfer)';
PRINT N'  10. YeuCauDeXuat (Proposals)';
PRINT N'  11. LichSuQuet (Scan History)';
PRINT N'';
PRINT N'Admin account sẽ được tạo tự động bởi backend.';
GO

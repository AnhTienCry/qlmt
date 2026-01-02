-- =============================================
-- CẬP NHẬT DATABASE THEO YÊU CẦU THẦY
-- Chạy sau khi đã có init.sql
-- =============================================

USE QuanLyMayTinhDB;
GO

-- =============================================
-- 1. BẢNG NHÀ CUNG CẤP (NCC)
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
-- 2. BẢNG HÀNG HÓA (thay thế MayTinh)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HangHoa')
BEGIN
    CREATE TABLE HangHoa (
        MaHang INT IDENTITY(1,1) PRIMARY KEY,
        MaTS NVARCHAR(50),                          -- Mã tài sản
        TenHang NVARCHAR(200) NOT NULL,             -- Tên hàng hóa
        LoaiHang NVARCHAR(50) NOT NULL,             -- 'may_tinh', 'man_hinh', 'phim', 'chuot', 'dau_chuyen', 'khac'
        ThongTinHang NVARCHAR(MAX),                 -- Thông tin chi tiết (JSON hoặc text)
        
        -- Thông tin bổ sung cho máy tính (nếu LoaiHang = 'may_tinh')
        CPU NVARCHAR(200),
        RAM NVARCHAR(50),
        SSD NVARCHAR(200),
        VGA NVARCHAR(200),
        MAC NVARCHAR(50),
        IPAddress NVARCHAR(45),
        SerialNumber NVARCHAR(100),
        OS NVARCHAR(100),
        
        -- Thông tin chung
        Hang NVARCHAR(100),                         -- Hãng sản xuất
        Model NVARCHAR(100),
        NamSX INT,
        
        -- Liên kết
        MaKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        MaNCC INT FOREIGN KEY REFERENCES NCC(MaNCC),
        MaNV_DangDung INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        
        -- Trạng thái
        TrangThai NVARCHAR(50) DEFAULT N'Trong kho',    -- 'Trong kho', 'Đang sử dụng', 'Hỏng', 'Thanh lý'
        TinhTrang NVARCHAR(500),                        -- Mô tả tình trạng
        
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    -- Index
    CREATE INDEX IX_HangHoa_LoaiHang ON HangHoa(LoaiHang);
    CREATE INDEX IX_HangHoa_TrangThai ON HangHoa(TrangThai);
    CREATE INDEX IX_HangHoa_MaKho ON HangHoa(MaKho);
    
    -- Unique index cho MaTS (cho phép NULL)
    CREATE UNIQUE INDEX IX_HangHoa_MaTS ON HangHoa(MaTS) WHERE MaTS IS NOT NULL;
    
    PRINT N'✅ Tạo bảng HangHoa thành công';
END
GO

-- =============================================
-- 3. CẬP NHẬT BẢNG NHÂN VIÊN (thêm NgayBDLV)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhanVien') AND name = 'NgayBDLV')
BEGIN
    ALTER TABLE NhanVien ADD NgayBDLV DATE;
    PRINT N'✅ Thêm cột NgayBDLV vào NhanVien';
END
GO

-- =============================================
-- 4. BẢNG NHẬP HÀNG (NhapHang) - Thay thế NhapKho
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NhapHang')
BEGIN
    CREATE TABLE NhapHang (
        MaNhap INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuN NVARCHAR(20) NOT NULL,             -- PN202601-001
        NgayNhap DATE NOT NULL,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        MaKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        SoLuong INT DEFAULT 1,
        DonGia DECIMAL(18,2),
        
        -- Người giao = NCC
        MaNCC INT FOREIGN KEY REFERENCES NCC(MaNCC),
        
        -- Người nhận = Nhân viên
        MaNV_NguoiNhan INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_NhapHang_SoPhieu ON NhapHang(SoPhieuN);
    CREATE INDEX IX_NhapHang_NgayNhap ON NhapHang(NgayNhap);
    
    PRINT N'✅ Tạo bảng NhapHang thành công';
END
GO

-- =============================================
-- 5. BẢNG XUẤT HÀNG (XuatHang) - Thay thế XuatKho
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'XuatHang')
BEGIN
    CREATE TABLE XuatHang (
        MaXuat INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuX NVARCHAR(20) NOT NULL,             -- PX202601-001
        NgayXuat DATE NOT NULL,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        MaKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        SoLuong INT DEFAULT 1,
        
        -- Người giao = Nhân viên kho
        MaNV_NguoiGiao INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        
        -- Người nhận = Nhân viên nhận hàng
        MaNV_NguoiNhan INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_XuatHang_SoPhieu ON XuatHang(SoPhieuX);
    CREATE INDEX IX_XuatHang_NgayXuat ON XuatHang(NgayXuat);
    
    PRINT N'✅ Tạo bảng XuatHang thành công';
END
GO

-- =============================================
-- 6. BẢNG ĐIỀU CHUYỂN (DieuChuyen)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DieuChuyen')
BEGIN
    CREATE TABLE DieuChuyen (
        MaDC INT IDENTITY(1,1) PRIMARY KEY,
        SoPhieuDC NVARCHAR(20) NOT NULL,            -- DC202601-001
        NgayDC DATE NOT NULL,
        MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang),
        
        -- NV1 = Người giao (đang giữ hàng)
        MaNV1 INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        
        -- NV2 = Người nhận (nhận hàng)
        MaNV2 INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_DieuChuyen_SoPhieu ON DieuChuyen(SoPhieuDC);
    CREATE INDEX IX_DieuChuyen_NgayDC ON DieuChuyen(NgayDC);
    
    PRINT N'✅ Tạo bảng DieuChuyen thành công';
END
GO

-- =============================================
-- 7. CẬP NHẬT BẢNG ĐỀ XUẤT (liên kết HangHoa thay vì MayTinh)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('YeuCauDeXuat') AND name = 'MaHang')
BEGIN
    ALTER TABLE YeuCauDeXuat ADD MaHang INT FOREIGN KEY REFERENCES HangHoa(MaHang);
    PRINT N'✅ Thêm cột MaHang vào YeuCauDeXuat';
END
GO

-- =============================================
-- DỮ LIỆU MẪU
-- =============================================

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
    INSERT INTO HangHoa (TenHang, LoaiHang, Hang, Model, ThongTinHang, MaKho, TrangThai) VALUES
    (N'Máy tính Dell OptiPlex 3080', N'may_tinh', N'Dell', N'OptiPlex 3080', N'CPU: i5-10500, RAM: 8GB, SSD: 256GB', 1, N'Trong kho'),
    (N'Màn hình Dell P2419H', N'man_hinh', N'Dell', N'P2419H', N'24 inch, Full HD, IPS', 1, N'Trong kho'),
    (N'Bàn phím Logitech K120', N'phim', N'Logitech', N'K120', N'USB, có dây', 1, N'Trong kho'),
    (N'Chuột Logitech B100', N'chuot', N'Logitech', N'B100', N'USB, có dây', 1, N'Trong kho'),
    (N'Đầu chuyển HDMI to VGA', N'dau_chuyen', N'Ugreen', N'40248', N'HDMI to VGA Adapter', 1, N'Trong kho'),
    (N'Máy tính HP ProDesk 400 G6', N'may_tinh', N'HP', N'ProDesk 400 G6', N'CPU: i7-9700, RAM: 16GB, SSD: 512GB', 1, N'Trong kho');
    PRINT N'✅ Thêm HangHoa mẫu';
END
GO

PRINT N'';
PRINT N'=============================================';
PRINT N'✅ CẬP NHẬT DATABASE HOÀN TẤT!';
PRINT N'=============================================';
GO

-- =============================================
-- MIGRATION: Thêm cột MaNV_DangDung vào bảng HangHoa
-- Mục đích: Theo dõi nhân viên đang sử dụng thiết bị
-- Ngày: 2026-01-XX
-- =============================================

USE QuanLyMayTinhDB;
GO

-- Thêm cột MaNV_DangDung nếu chưa tồn tại
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('HangHoa') AND name = 'MaNV_DangDung'
)
BEGIN
    ALTER TABLE HangHoa 
    ADD MaNV_DangDung INT NULL FOREIGN KEY REFERENCES NhanVien(MaNV);
    
    PRINT N'✅ Added column MaNV_DangDung to HangHoa table';
END
ELSE
BEGIN
    PRINT N'⚠️ Column MaNV_DangDung already exists in HangHoa table';
END
GO

-- Tạo index cho cột mới
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE object_id = OBJECT_ID('HangHoa') AND name = 'IX_HangHoa_MaNV_DangDung'
)
BEGIN
    CREATE INDEX IX_HangHoa_MaNV_DangDung ON HangHoa(MaNV_DangDung);
    PRINT N'✅ Created index IX_HangHoa_MaNV_DangDung';
END
GO

PRINT N'';
PRINT N'===== Migration completed =====';
PRINT N'Cột MaNV_DangDung đã được thêm vào bảng HangHoa';
PRINT N'Khi điều chuyển thiết bị, hệ thống sẽ tự động cập nhật người đang sử dụng';
GO

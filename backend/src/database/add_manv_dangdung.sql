-- Migration: Thêm cột MaNV_DangDung vào bảng HangHoa
-- Cột này dùng để track thiết bị đang được ai sử dụng
-- Chạy script này SAU khi đã có dữ liệu XuatHang và DieuChuyen

-- Chọn database
USE QuanLyMayTinhDB;
GO

-- 1. Thêm cột MaNV_DangDung (nếu chưa có)
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'HangHoa' AND COLUMN_NAME = 'MaNV_DangDung'
)
BEGIN
    ALTER TABLE HangHoa ADD MaNV_DangDung INT NULL
    ALTER TABLE HangHoa ADD CONSTRAINT FK_HangHoa_NhanVien_DangDung FOREIGN KEY (MaNV_DangDung) REFERENCES NhanVien(MaNV)
    PRINT N'Đã thêm cột MaNV_DangDung vào bảng HangHoa'
END
ELSE
BEGIN
    PRINT N'Cột MaNV_DangDung đã tồn tại'
END
GO

-- 2. Đồng bộ dữ liệu: Lấy người nhận cuối cùng từ XuatHang hoặc DieuChuyen
-- Quy tắc: Giao dịch nào mới nhất thì lấy NguoiNhan từ đó
;WITH LatestTransaction AS (
    -- Lấy tất cả giao dịch xuất kho và điều chuyển
    SELECT MaHang, NguoiNhan, NgayGD,
           ROW_NUMBER() OVER (PARTITION BY MaHang ORDER BY NgayGD DESC) as rn
    FROM (
        SELECT MaHang, NguoiNhan, NgayXuat as NgayGD FROM XuatHang WHERE NguoiNhan IS NOT NULL
        UNION ALL
        SELECT MaHang, NguoiNhan, NgayDC as NgayGD FROM DieuChuyen WHERE NguoiNhan IS NOT NULL
    ) AllTransactions
)
UPDATE hh
SET hh.MaNV_DangDung = lt.NguoiNhan,
    hh.TrangThai = N'Đang dùng',
    hh.NgayCapNhat = SYSUTCDATETIME()
FROM HangHoa hh
INNER JOIN LatestTransaction lt ON hh.MaHang = lt.MaHang AND lt.rn = 1
WHERE hh.MaNV_DangDung IS NULL OR hh.MaNV_DangDung != lt.NguoiNhan

PRINT N'Đã đồng bộ MaNV_DangDung từ dữ liệu XuatHang và DieuChuyen'
GO

-- 3. Kiểm tra kết quả
SELECT 
    hh.MaHang,
    hh.MaTS,
    hh.TenHang,
    hh.MaNV_DangDung,
    nv.TenNV as TenNV_DangDung,
    hh.TrangThai
FROM HangHoa hh
LEFT JOIN NhanVien nv ON hh.MaNV_DangDung = nv.MaNV
WHERE hh.MaNV_DangDung IS NOT NULL
ORDER BY hh.MaHang

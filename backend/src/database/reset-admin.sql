-- =============================================
-- RESET ADMIN PASSWORD
-- Chạy script này trong SSMS để reset password admin
-- =============================================

USE QuanLyMayTinhDB;
GO

-- Password: admin123
-- Hash được tạo bởi bcryptjs với salt rounds = 10
UPDATE Users 
SET PasswordHash = '$2a$10$0Oh2SS5zSSW/amlsVKQAdO3c.7mbHNZ4cs0hkFmB/IkAxkEwlqXAG',
    NgayCapNhat = GETDATE()
WHERE Username = 'admin';

-- Nếu admin chưa tồn tại, tạo mới
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Username, PasswordHash, Role, IsActive)
    VALUES ('admin', '$2a$10$0Oh2SS5zSSW/amlsVKQAdO3c.7mbHNZ4cs0hkFmB/IkAxkEwlqXAG', 'admin', 1);
    PRINT N'✅ Created new admin user';
END
ELSE
BEGIN
    PRINT N'✅ Admin password reset to: admin123';
END

-- Kiểm tra kết quả
SELECT UserId, Username, Role, IsActive, LastLogin 
FROM Users 
WHERE Username = 'admin';
GO

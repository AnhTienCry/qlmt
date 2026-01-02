# QLMT - Quản Lý Môi Trường

## Cấu trúc dự án

```
qlmt/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── ...
│
├── backend/           # Node.js + TypeScript + SQL Server
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── ...
│
└── README.md
```

## Yêu cầu

- Node.js >= 18
- SQL Server
- npm hoặc yarn

## Cài đặt

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

### Backend

1. Tạo file `.env` từ `.env.example`:

```bash
cd backend
cp .env.example .env
```

2. Cập nhật thông tin kết nối database trong file `.env`

3. Chạy script khởi tạo database:

```sql
-- Chạy file src/database/init.sql trong SQL Server Management Studio
```

4. Cài đặt dependencies và chạy server:

```bash
npm install
npm run dev
```

Backend sẽ chạy tại: http://localhost:5000

## API Endpoints

### Auth

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Users

- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy user theo ID
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

## Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- SQL Server (mssql)
- JWT Authentication
- bcryptjs
